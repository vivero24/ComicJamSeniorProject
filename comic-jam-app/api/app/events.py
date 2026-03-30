from flask import session
from flask_socketio import emit, join_room, leave_room
from .models import db, Player, Game
from . import socketio

# Websocket Events
@socketio.on('connect')
def connect_handler():
    print('Connection established')

@socketio.on('disconnect')
def disconnect_handler():
    print('User disconnected')

@socketio.on('test-player')
def test_player():
    player_id = session['player_id']
    print(player_id)

@socketio.on('create-lobby-socket')
def socket_create(invite_code):
    join_room(invite_code, namespace = '/')
    

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
    player_id = session.get('player_id')
    player = db.get_or_404(Player, player_id)
    invite_code = player.game.invite_code
    game_id = player.game_id

    db.session.delete(player)
    db.session.commit()
    leave_room(invite_code, namespace= '/')

    game = db.get_or_404(Game, game_id)
    usernames = []
    for p in game.players:
        usernames.append(p.username)
    emit('lobby-update', usernames, namespace = '/', to = invite_code)

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
    emit('lobby-update', usernames, to= invite_code)
        




