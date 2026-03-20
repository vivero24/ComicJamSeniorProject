from flask import Flask
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, MappedAsDataclass, mapped_column

app = Flask(__name__)

# SocketIO
app.config['SECRET_KEY'] = 'replace_with_something_secure'
socketio = SocketIO(app, cors_allowed_origins='*')

# SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'

class Base(MappedAsDataclass, DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
db.init_app(app)

class User(db.Model, MappedAsDataclass):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    username: Mapped[str]
    email: Mapped[str]

with app.app_context():
    db.create_all()

connection_count = 0

# Websocket Events
@socketio.on('connect')
def connect_handler():
    print('Connection established')
    
    sample = User(username='temp', email='mail')

    db.session.add(sample)
    db.session.commit()

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

# Init
if __name__ == '__main__':
       socketio.run(app)
