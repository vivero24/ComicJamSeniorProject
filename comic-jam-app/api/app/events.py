from flask import session, abort
from flask_socketio import emit, join_room, leave_room
from .models import db, Player, Game
from . import socketio

# Websocket Listeners
@socketio.on('connect')
def connect_handler():
    invite_code: str
    if 'player_id' in session:
        player = db.get_or_404(Player, session['player_id'])
        game = player.game
        invite_code = player.game.invite_code
        print(f"Player {player.username} joined lobby {player.game.invite_code}")

    elif 'host_id' in session:
        game = db.get_or_404(Game, session['host_id'])
        invite_code = game.invite_code
        print(f"Host connected to game {game.invite_code}")

    else:
        print("No ID in session, refusing connection")
        return ConnectionRefusedError

    join_room(invite_code)

    broadcast_lobby_update(game)
    
    settings = {
            'inviteCode': invite_code
        # TODO: to be expanded later
    }
    emit('settings-update', settings, broadcast=True, to=invite_code)

@socketio.on('disconnect')
def disconnect_handler():
    print('User disconnected')

@socketio.on('test-player')
def test_player():
    player_id = session['player_id']
    print(player_id)

# Websocket Emitters

def broadcast_lobby_update(game: Game):
    usernames = []
    for p in game.players:
        usernames.append(p.username)

    emit('lobby-update', usernames, broadcast=True, namespace='/', to=game.invite_code)

'''
@socketio.on('create-lobby-socket')
def socket_create(invite_code):
    join_room(invite_code, namespace = '/')
    print('Host joined room ', invite_code)
    

@socketio.on('join-lobby-socket')
def socket_join(invite_code):
    player_id = session.get('player_id')
    if not player_id:
        return
    
    player = db.get_or_404(Player, player_id)
    join_room(invite_code, namespace = '/')

    usernames = []
    for p in player.game.players:
        usernames.append(p.username)

    print('Player ', player.username, ' is joining room ', invite_code)

    emit('lobby-update', usernames ,namespace='/', to = invite_code)

@socketio.on('player-leave')
def socket_leave():
    host_id = session.get('host_id')
    player_id = session.get('player_id')

    if host_id:
        game = db.get_or_404(Game, host_id)
        invite_code = game.invite_code
        db.session.delete(game)
        db.session.commit()
        session.pop('host_id', None)
        leave_room(invite_code)
        
    elif player_id:
        player = db.get_or_404(Player, player_id)
        invite_code = player.game.invite_code
        game_id = player.game_id

        db.session.delete(player)
        db.session.commit()

        session.pop('player_id', None)

        game = db.get_or_404(Game, game_id)
        usernames = []
        for p in game.players:
            usernames.append(p.username)
        emit('lobby-update', usernames, to = invite_code)
        leave_room(invite_code)

@socketio.on('rejoin-room')
def rejoin(invite_code):
    print('rejoining room')
    join_room(invite_code)

    host_id = session.get('host_id')
    player_id = session.get('player_id')

    if host_id:
        game = db.get_or_404(Game, host_id)
        usernames = []
        for p in game.players:
            usernames.append(p.username)
    elif player_id:
        player = db.get_or_404(Player, player_id)
        usernames = []
        for p in player.game.players:
            usernames.append(p.username)
    else:
        return
    emit('lobby-update', usernames, to=invite_code)
'''




