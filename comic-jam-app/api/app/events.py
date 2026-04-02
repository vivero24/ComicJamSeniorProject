from flask import session
from flask_socketio import emit, join_room
from .models import db, Player, Game
from . import socketio

# Websocket Listeners

# Listener for initial 'connect' event
#
# Attempts to place the user in a SocketIO room based
# on the player/host ID stored in their Flask session,
# then emits a 'lobby-update' and 'settings-update' event
# so the lobby and settings can populate.
#
# NOTE: React should connect the socket upon entering the lobby
# pages. Otherwise, the emitter may not trigger properly and a
# refresh may be required. This could be solved in the future
# by creating a GET endpoint that the frontend can call when needed.
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

# Websocket Emitters

# Emitter for 'lobby-update' event
#
# Broadcasts the usernames of all players in the
# given lobby to the SocketIO room (keyed by invite code)
#
# Sends a JSON array of strings
def broadcast_lobby_update(game: Game):
    usernames = []
    for p in game.players:
        usernames.append(p.username)

    emit('lobby-update', usernames, broadcast=True, namespace='/', to=game.invite_code)
