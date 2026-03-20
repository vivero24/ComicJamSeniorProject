from flask import Flask
from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins='*')

def create_app():
    app = Flask(__name__)
    socketio.init_app(app)
    
    # Blueprint initialization
    from .routes import main
    app.register_blueprint(main)

    # Database initialization
    from .models import db
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
    db.init_app(app)
    
    with app.app_context():
        db.create_all()

    return app

# Import websocket events so they're recognized by SocketIO
from . import events

