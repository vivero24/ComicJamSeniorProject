import logging
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_session import Session

socketio = SocketIO(cors_allowed_origins='*', cors_credentials=True,
                    manage_session=False)

session = Session()

# App initialization + configuration
def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'REPLACE_WITH_SOMETHING_SECURE'
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_TYPE'] = 'filesystem'

    app.logger.setLevel(logging.DEBUG)

    CORS(app, supports_credentials=True)

    # Socket-IO initialization
    socketio.init_app(app)

    # Server-side session initialization
    session.init_app(app)

    # Blueprint initialization
    from .routes import main
    app.register_blueprint(main)
 
    # Database initialization
    from .models import db
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    db.init_app(app)

    with app.app_context():
        db.create_all()

    return app

# Import websocket events so they're recognized by SocketIO
from . import events

