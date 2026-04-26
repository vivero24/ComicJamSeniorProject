from io import BytesIO
import random
import string
import data_url
import zipfile

from flask import Blueprint, abort, current_app, jsonify, request, send_file, session

from .models import db, Game, Player, Comic, Panel
from sqlalchemy import select

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
                    assigned_panel_id=None)

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

    game = Game(invite_code=generate_game_code(), players=[])

    db.session.add(game)
    db.session.commit()

    current_app.logger.debug(f"Game={game.invite_code} created.")
    # Create new flask session for this host
    session['host_id'] = game.host_id

    return jsonify({'invite_code': game.invite_code})

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
    elif 'host_id' in session:
        # TODO: handle game deletion, maybe place host deletion in a different
        # endpoint entirely? /api/close-lobby
        game = db.get_or_404(Game, session['host_id'])
        current_app.logger.debug(f"Host closed Game={game.invite_code}, deleting...")
        db.session.delete(game)
        session.pop('host_id')
    else:
        return abort(403)

    db.session.commit()

    return ''

# /api/lobby-settings
# GET/POST endpoint called when a host updates the settings of their lobby
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
@main.route('/lobby-settings', methods=['GET', 'POST'])
def change_lobby_settings():

    if request.method == 'POST' and 'host_id' not in session:
        return 'Error: User is not the host of a lobby', 403
    
    game: Game
    if 'player_id' in session:
        player = db.get_or_404(Player, session['player_id'])
        game = player.game
    elif 'host_id' in session:
        game = db.get_or_404(Game, session['host_id'])
    else:
        abort(403)

    if request.method == 'POST':
        game.time_limit_minutes = request.json['timeLimit']
        game.round_count = request.json['numRounds']
        db.session.commit()

        current_app.logger.info(f"Game={game.invite_code}'s settings updated to time_limit={game.time_limit_minutes}")
        broadcast_settings_update(game)
        return 'Updated settings', 200

    else: #
        return jsonify({
        'inviteCode': game.invite_code,
        'timeLimit': game.time_limit_minutes,
        'numRounds': game.round_count,
        })

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

    player = db.get_or_404(Player, session['player_id'])

    if player.assigned_panel_id is None:
        current_app.logger.warning(f"Player={player.username} attempted submission without an active assignment")
        return "Error: Player does not have a panel assigned.", 400

    panel = db.get_or_404(Panel, player.assigned_panel_id)
    image_data = request.get_data()

    panel.image = image_data

    # Clear assignment to indicate player submitted
    player.assigned_panel_id = None
    player.game.num_players_unsubmitted -= 1
    db.session.commit()

    broadcast_player_submission_update(player.game)

    current_app.logger.debug(f"Player={player.username} submitted panel={panel.panel_id} for Comic={panel.comic.comic_name}")

    return ''

# /api/submit-prompt
# POST endpoint called when a player finishes writing the
# text prompts for each panel in their comic.
#
# Expected POST request body:
#   JSON array of strings
@main.route('/submit-prompts', methods=['POST'])
def submit_prompt():
    if 'player_id' not in session:
        return 'Error: user is not a Player', 403

    json = request.json
    player = db.get_or_404(Player, session['player_id'])

    if player.owned_comic is None:
        current_app.logger.warning(f"Player={player.username} attempted prompt submission before game start")
        return "Error: Prompts not expected at this time.", 400

    player.owned_comic.comic_name = json['comicTitle']

    recieved_prompts = json['prompts']
    for index in range(player.game.round_count):
        panel = player.owned_comic.panels[index]
        panel.prompt = recieved_prompts[index]
        current_app.logger.debug(f"Assigned prompt=\"{recieved_prompts[index]}\" to panel={index} of comic={player.owned_comic.comic_name}")

    player.game.num_players_unsubmitted -= 1
    db.session.commit()
    broadcast_player_submission_update(player.game)

    return ''

@main.route('/list-comics', methods=['GET'])
def list_comics():
    game: Game
    if 'host_id' in session:
        game = db.get_or_404(Game, session['host_id'])
    elif 'player_id' in session:
        game = db.get_or_404(Player, session['player_id']).game
    else:
        abort(403)

    comics = []
    for player in game.players:
        curr_comic = player.owned_comic

        if curr_comic is None:
            continue

        comic_json = {
            'comicID': curr_comic.comic_id,
            'comicName': curr_comic.comic_name,
            'creator': curr_comic.owner.username
        }

        comics.append(comic_json)

    return jsonify(comics)

@main.route('/download-comic', methods=['GET'])
def download_comic():
    if 'player_id' not in session or 'host_id' not in session:
        abort(403)

    comic_id = request.args.get('comicID')

    comic = db.get_or_404(Comic, comic_id)

    comic_archive = BytesIO()
    with zipfile.ZipFile(comic_archive, 'w') as zip:
        for idx, panel in enumerate(comic.panels):
            if panel.image is None:
                error_str = f"ZIP archive could not be created -- unable to retrieve panel={idx} of comic={panel.comic.comic_name}"
                current_app.logger.error(error_str)
                return error_str, 500

            image_URL_raw = data_url.DataURL.from_url(panel.image.decode())

            if image_URL_raw is None:
                error_str = f"Failed to create data URL for panel={panel.panel_id} in comic={comic_id}"

                current_app.logger.error(error_str)
                return error_str, 500

            URL_data = image_URL_raw.data
            zip.writestr(f"{comic.comic_name}-{idx+1}.png",
                         URL_data)
    comic_archive.seek(0)
    return send_file(comic_archive, mimetype='application/zip')
