import time

from flask import logging, session, request, abort, current_app
from flask_socketio import emit, join_room
from .models import db, Player, Game
from . import socketio

# Websocket Listeners

# Listener for a host requesting to start a game
#
# Spawns a new thread to handle the game loop +
# synchronizing game state between players
@socketio.on('host-started-game')
def begin_game_loop():
    if 'host_id' not in session:
        abort(403)

    from .game_manager import manage_game_loop

    # It is very important that the app be passed as a parameter here,
    # otherwise the background task won't have access to the  Flask app 
    # context and will throw errors.
    app = current_app._get_current_object() # # pyright: ignore[reportAttributeAccessIssue]
    socketio.start_background_task(manage_game_loop, session['host_id'], app)

# Listener for initial 'connect' event
#
# Attempts to place the user in a SocketIO room based
# on the player/host ID stored in their Flask session,
# then emits a 'lobby-update' and 'settings-update' event
# so the lobby and settings can populate.
#
# NOTE: React should connect the socket upon entering the lobby
# pages. Otherwise, the emitters may not trigger properly and a
# refresh may be required. This could be solved in the future
# by creating a GET endpoint that the frontend can call when needed.
@socketio.on('connect')
def connect_handler():

    game: Game

    if 'player_id' in session:
        player = db.get_or_404(Player, session['player_id'])

        # Store socket ID for later so we can send events to specific players
        # during the game
        player.socket_id = request.sid # # pyright: ignore[reportAttributeAccessIssue]
        db.session.commit()

        game = player.game

        current_app.logger.info(f"Player={player.username} joined Game={game.invite_code} with SID={player.socket_id}")

    elif 'host_id' in session:
        game = db.get_or_404(Game, session['host_id'])

        current_app.logger.info(f"Host connected to Game={game.invite_code} with SID={request.sid}") # # pyright: ignore[reportAttributeAccessIssue]
    else:
        current_app.logger.warning("User has no ID in session, refusing connection")
        return ConnectionRefusedError

    join_room(game.invite_code)
    broadcast_lobby_update(game)

    settings = {
        'inviteCode': game.invite_code
        # TODO: to be expanded later
    }
    emit('settings-update', settings, broadcast=True, to=game.invite_code)

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
