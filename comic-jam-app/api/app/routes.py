import random
import string
import io
import zipfile

from flask import Blueprint, abort, jsonify, request, session, send_file

from .models import db, Game, Player, Comic
from sqlalchemy import select

from .events import broadcast_lobby_update

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
#   json containing the fields:
#   - userName (required)
#   - joinCode (required)
@main.route('/join-lobby', methods=['POST'])
def join_lobby():
    json = request.json
    print(f"RECV: {json}")

    # TODO: handle case where this user already has a
    # session, delete player or game from database

    # Validate invite code
    requested_invite_code = json['joinCode']
    game = db.first_or_404(select(Game).where(Game.invite_code == requested_invite_code))

    # Return 403: Forbidden if lobby is full
    #if game.player_cap == len(game.players):
    #abort(403)

    # Register player in database
    username = json['userName']

    player = Player(username=username, game_id=game.host_id, game=game)

    db.session.add(player)
    db.session.commit()

    # Create new flask session for this player
    session['player_id'] = player.player_id

    # Broadcast lobby-update event,
    # namespace parameter is required when emitting an event in a REST endpoint
    # TODO: Place users in rooms so this data isn't sent to users in other lobby 

    return jsonify({'invite_code': requested_invite_code})


# Helper function for create_lobby()
# Generates a random 5 character string
def generate_game_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

# /api/create-lobby
# POST endpoint called when a user creates a game lobby.
# Associates the ID of a Game object with the user's Flask session,
# accessible with the key 'host_id'.
#
# If the user is already associated with an existing Game or Player
# in the database, that object will be deleted and replaced with the Game
# object created in this endpoint.
#
# Expected POST request body:
#   json containing the fields:
#   - numOfPlayers (required)
#   - timeLimit (required)
@main.route('/create-lobby', methods=['POST'])
def create_lobby():
    json = request.json

    print(f"RECV: {json}")

    # TODO: handle case where this user already has a
    # session, delete player or game from database

    # Register host in databse
    player_cap = json['numOfPlayers']
    time_limit = json['timeLimit']

    game = Game(invite_code=generate_game_code(),
                player_cap=player_cap,
                time_limit_minutes=time_limit,
                current_round=0,
                rount_count=0,
                players=[])

    db.session.add(game)
    db.session.commit()

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

        print(f"Deleting player: username={player.username}")
        db.session.delete(player)
        session.pop('player_id')

        broadcast_lobby_update(game)
    elif 'host_id' in session:
        # TODO: handle game deletion, maybe place host deletion in a different
        # endpoint entirely? /api/close-lobby
        game = db.get_or_404(Game, session['host_id'])
        print(f"Deleting game: invite_code={game.invite_code}")

        db.session.delete(game)
        session.pop('host_id')
    else:
        return abort(403)

    db.session.commit()

    return ''

#Use the GET endpoint to return the list of comic folders
@main.route('/list-comics', methods=['GET'])
def list_comics():
   # Prefer player session, but allow host for showcase
   player_id = session.get('playerId')
   host_id = session.get('host_id')

   if not player_id and not host_id:
       abort(403)

   if player_id:
       # Player is requesting
       player = db.get_or_404(Player, player_id)
       game = player.game
       if not game:
           return jsonify({"comics": []})
   else:
       # host is requesting (showcase)
       game = db.session.execute(
           select(Game).where(Game.host_id == host_id)
       ).scalar_one_or_none()
       if game is None:
           abort(404)

   comics = []
   for p in game.players:
       if p.comic:
           comics.append({
               "comicId": p.comic.comic_id,
               "name": p.comic.name
           })

   return jsonify({"comics": comics})

# GET endpoint that downloads a comic as a ZIP file
@main.route('/download-comic', methods=['GET'])
def download_comic(game_id, comic_id):
    # Authorization via session
    player_id = session.get('playerId')
    host_id = session.get('host_id')

    if not player_id and not host_id:
        abort(403)

    # GET /download-comic?comicId=<id>
    comic_id = request.args.get('comicId', type=int)
    if not comic_id:
        return {"error": "comicId required"}, 400

    if player_id:
        player = db.get_or_404(Player, player_id)
        game = player.game
        if not game:
            return {"error": "Player is not in a game"}, 400
    else:
        game = db.session.execute(
            select(Game).where(Game.host_id == host_id)
        ).scalar_one_or_none()
        if game is None:
            return {"error": "Game not found"}, 404
    # Fetch the comic
    comic = db.get_or_404(Comic, comic_id)

    # Ensure the comic belongs to a player in the same game
    if not comic.player or comic.player.game_id != game.host_id:
        return {"error: "Comic does not belong to this game"}, 403

    # Create ZIP in memory
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
       for idx, panel in enumerate(comic.panels):
           filename = f"panel_{idx + 1}.png"
           zipf.writestr(filename, panel.image)

    memory_file.seek(0)

    return send_file(
       memory_file,
       mimetype='application/zip',
       as_attachment=True,
       download_name=f"{comic.name}.zip"
    )
