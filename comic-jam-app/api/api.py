from flask import Flask
from flask_socketio import SocketIO, emit

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

@socketio.on('lobby_submit')
#lobby data will be passed (JSON)
def handle_lobby_submit(settings):
    print(settings)



if __name__ == '__main__':
    socketio.run(app)
