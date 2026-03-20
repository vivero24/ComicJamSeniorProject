from flask_socketio import emit
from . import socketio

connection_count = 0

# Websocket Events
@socketio.on('connect')
def connect_handler():
    print('Connection established')
    
  
    global connection_count

    if connection_count + 1 > 5:
        raise ConnectionRefusedError

    connection_count = connection_count + 1
    emit('user-count-update', connection_count, broadcast=True)

@socketio.on('disconnect')
def disconnect_handler():
    print('User disconnected')

    global connection_count
    connection_count = connection_count - 1
    emit('user-count-update', connection_count, broadcast=True)


