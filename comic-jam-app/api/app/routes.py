import random
import string

from flask import Blueprint, abort, current_app, jsonify, request, session
from flask_socketio import emit

from .models import Panel, db, Game, Player, Comic
from sqlalchemy import select
from . import socketio

from .events import broadcast_lobby_update, broadcast_player_submission_update, broadcast_settings_update

main = Blueprint("main", __name__, url_prefix='/api')

# /api/join-lobby
# POST endpoint called when a user attempts to join a game lobby.
# If the given invite code is valid, associates the ID of a Pame object with the user's Flask session,
# accessible with the key 'player_id'. Otherwise, throws a 404 error if the code is invalid, or a 403 if the
# requested lobby is full.
#
# If the user is already associated with an existing Game or Player
# in the database, that object will be deleted and replaced with the Player
# object created in this endpoint.
#
# Expected POST request body:
#   JSON:
#   {
#       "userName": String,
#       "joinCode": String
#   }
@main.route('/join-lobby', methods=['POST'])
def join_lobby():
    json = request.json

    # TODO: handle case where this user already has a
    # session, delete player or game from database
    # Validate invite code
    requested_invite_code = json['joinCode'].upper()

    game = db.session.scalar(select(Game).where(Game.invite_code == requested_invite_code))
    if game is None:
        return jsonify({'error': 'Lobby not found'}), 404

    # Return 403: Forbidden if lobby is full
    if len(game.players) >= game.player_cap:
        return jsonify({'error': 'Lobby is full'}), 403

    # Register player in database
    username = json['userName']

    player = Player(username=username,
                    game_id=game.host_id,
                    game=game,
                    owned_comic=None,
                    assigned_comic_id=None)

    db.session.add(player)
    db.session.commit()

    # Create new flask session for this player
    session['player_id'] = player.player_id

    # Immediately sync lobby member list for connected clients
    # (for example, host on the lobby configuration page).
    broadcast_lobby_update(game)

    return jsonify({'invite_code': requested_invite_code})


# Helper function for create_lobby()
# Generates a random 5 character string
def generate_game_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

# /api/create-lobby
# GET endpoint to be called when a user creates a game lobby.
# Creates and associates the ID of a Game object with the user's Flask session,
# accessible with the key 'host_id'.
#
# If the user is already associated with an existing Game or Player
# in the database, that object will be deleted and replaced with the Game
# object created in this endpoint.
@main.route('/create-lobby', methods=['GET'])
def create_lobby():
    # TODO: handle case where this user already has a
    # session, delete player or game from database

    if 'host_id' in session:
        existing_game = Game.query.filter_by(host_id=session['host_id']).first()
        if existing_game:
            broadcast_settings_update(existing_game)
            return jsonify({'invite_code': existing_game.invite_code, 'already_exists': True})
        session.pop('host_id', None)
    game = Game(invite_code=generate_game_code(), players=[])

    db.session.add(game)
    db.session.commit()

    current_app.logger.debug(f"Game={game.invite_code} created.")
    # Create new flask session for this host
    session['host_id'] = game.host_id

    return jsonify({'invite_code': game.invite_code, 'already_exists': False})

# /api/leave-lobby
# GET endpoint called when user requests to leave a lobby
#
# Deletes the user's player/game from the database and removes the
# associated ID from their Flask session
@main.route('/leave-lobby')
def leave_lobby():
    # TODO: 
    # - Determine which to ID to delete based on parameter to handle
    # users having both a host and player ID
    # - Broadcast message if the game is deleted to inform players
    # that the lobby is invalid

    if 'player_id' in session:
        player = db.get_or_404(Player, session['player_id'])
        game = player.game

        current_app.logger.debug(f"Player={player.username} left Game={game.invite_code}, deleting...")
        db.session.delete(player)
        session.pop('player_id')
        broadcast_lobby_update(game)
    else:
        return abort(403)

    db.session.commit()

    return ''

@main.route('/kick-player')
def kick_player():
    # TODO: 
    # Determine which player to kick from lobby based of ID

    player_id = request.args.get("player_id")
    found_player = db.get_or_404(Player, player_id)
    game = found_player.game

    socketio.call('player-kicked', to=found_player.socket_id, timeout=10)

    db.session.delete(found_player)
    session.pop('player_id')
    broadcast_lobby_update(game)

    db.session.commit()

    return ''

@main.route('/close-lobby')
def close_lobby():
    # TODO: 
    # when host closes the lobby, remove all players and delete the lobby from the DB
    if 'host_id' not in session:
        abort(403)

    game = db.get_or_404(Game, session['host_id'])

    # If user is also a player in the game they are hosting, clear the player_id too
    if 'player_id' in session:
        player = db.get_or_404(Player, session['player_id'])

        if game.host_id == player.game_id:
            session.pop('player_id')

    current_app.logger.debug(f"Host closed Game={game.invite_code}, deleting...")

    for player in game.players:
        try:
            # Require players to acknowledge lobby closure before deleting them
            socketio.call('lobby-closed', to=player.socket_id, timeout=10)
            db.session.delete(player)
        except TimeoutError:
            print("timeout error whoopsies")

    db.session.delete(game)
    db.session.commit()

    session.pop('host_id')

    return ''

# /api/change-lobby-settings
# POST endpoint called when a host updates the settings of their lobby
#
# Updates the game's settings and broadcasts a 'settings-update' to all
# players in the lobby
#
# Expected POST request body:
#   JSON:
#   {
#       "timeLimit": Integer,
#       "numRounds": Integer
#       # NOTE: Other fields TBD
#   }
@main.route('/change-lobby-settings', methods=['POST'])
def change_lobby_settings():
    if 'host_id' not in session:
        return 'Error: User is not the host of a lobby', 403

    game = db.get_or_404(Game, session['host_id'])
    game.time_limit_minutes = request.json['timeLimit']
    game.rount_count = request.json['numRounds']
    db.session.commit()

    current_app.logger.info(f"Game={game.invite_code}'s settings updated to time_limit={game.time_limit_minutes}")

    broadcast_settings_update(game)

    return ''

# /api/submit-panel
# POST endpoint called when a player submits the panel they were assigned
# during a round.
#
# Expected POST request body:
#   dataURL representing a PNG
@main.route('/submit-panel', methods=['POST'])
def submit_panel():
    if 'player_id' not in session:
        return 'Error: user is not a Player', 403

    #db.session.commit()

    player = db.get_or_404(Player, session['player_id'])

    if player.assigned_comic_id is None:
        current_app.logger.warning(f"Player={player.username} attempted submission without an active assignment")
        return "Error: Player does not have a comic assigned.", 400

    comic = db.get_or_404(Comic, player.assigned_comic_id)
    image_data = request.get_data()
    
    panel = Panel(comic_id=comic.comic_id,
                  comic=comic,
                  image=image_data)

    db.session.add(panel)

    # Clear assignment to indicate player submitted
    player.assigned_comic_id = None
    player.game.num_players_unsubmitted -= 1
    db.session.commit()

    broadcast_player_submission_update(player.game)

    current_app.logger.debug(f"Player={player.username} submitted panel for Comic={comic.comic_name}")

    return ''
