from flask import Flask
from flask_socketio import SocketIO, emit, join_room
import random
import string

#helper method
def generate_game_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

app = Flask(__name__)
app.config['SECRET_KEY'] = 'replace_with_something_secure'
socketio = SocketIO(app, cors_allowed_origins='*')

connection_count = 0

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

@socketio.on('lobby-create')

def handle_lobby_submit(settings):
    #print('message received: ', settings)
    room_code = generate_game_code()
    print('room code', room_code)
    join_room(room_code)
    
    return {'status': 'ok',
            'room_code' : room_code}

@socketio.on('player-join')
def handle_player_join(player):
    print('player info received: ', player)
    join_room(player['joinCode'])
    print('player: ', player['userName'], ' has joined the room')

    return {'status': 'ok',
            'player' : player['userName']}




if __name__ == '__main__':
    socketio.run(app)
