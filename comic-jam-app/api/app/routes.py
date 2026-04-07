import random
import string

from flask import Blueprint, abort, jsonify, request, session

from .models import db, Game, Player
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
    os = __import__('os')

    # All the comics are listed inside a folder named "comics"
    comics_root = 'comics'

    # If the directory doesn't exist, return an empty list instead of an error
    if not os.path.exists(comics_root):
        return {'comics': []}

    #This collects all subfolders(each folder contains one comic)
    comics = []
    for name in os.listdir(comics_root):
        folder_path = os.path.join(comics_root, name)
        if os.path.isdir(folder_path):
            comics.append(name)

    # This returns the list of comic folder names
    return {'comics': comics}
    

# GET endpoint that downloads a comic as a ZIP file
@main.route('/download-comic', methods=['GET'])
def download_comic(game_id, comic_id):
    os = __import__('os')                  # For file paths and directory walking
    zipfile = __import__('zipfile')        # Used for creating ZIP files
    flask = __import__('flask')            # Necessary for the send_file method

    
    #This reads the JSON body
    json = flask.request.json
    comic_id = json.get('comicId')

    if not comic_id:
        abort(400)   # Bad request if missing

    # Path to the comic folder
    comic_folder = os.path.join('comics', comic_id)

    # If the comic folder doesn't exist, returns a 404 error
    if not os.path.exists(comic_folder):
        abort(404)

    # This creates a temporary ZIP file in /tmp
    # /tmp is a temporary directory used by servers
    zip_path = f"/tmp/{comic_id}.zip"

    
    #Creates the ZIP file and adds all comic pages to it
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Walks through the comic folder and add each file
        for root, dirs, files in os.walk(comic_folder):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, comic_folder)
                zipf.write(full_path, arcname)

    # Send the ZIP file to the browser as a download
    return flask.send_file(
        zip_path,
        mimetype='application/zip',
        as_attachment=True,
        download_name=f"{comic_id}.zip"
    )
