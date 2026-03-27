from os import name
import random
import string

from flask import Blueprint, abort, jsonify, request, session
from flask_socketio import emit

from .models import db, Game, Player
from sqlalchemy import select

main = Blueprint("main", __name__, url_prefix='/api')

# Temporary function to test lobby joining

@main.route('/lobby-contents')
def get_lobby_contents():
    player_id = session['player_id']
    
    player = db.get_or_404(Player, player_id)
    usernames = []
    for p in player.game.players:
        usernames.append(p.username)
    
    return jsonify(usernames)


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

    # Gather other all usernames in the lobby and broadcast
    # lobby-update

    usernames = []
    for p in player.game.players:
        usernames.append(p.username)

    emit('lobby-update', usernames, broadcast=True, namespace='/')

    return "lobby joined"

def generate_game_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

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

    return "lobby created"

