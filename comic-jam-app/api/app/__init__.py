from flask import Flask
from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins='*')

def create_app():
    app = Flask(__name__)
    socketio.init_app(app)

    from .models import db
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
    db.init_app(app)
    
    with app.app_context():
        db.create_all()

    return app

from . import events

