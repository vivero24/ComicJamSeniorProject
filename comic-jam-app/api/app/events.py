from flask import session
from flask_socketio import emit

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



