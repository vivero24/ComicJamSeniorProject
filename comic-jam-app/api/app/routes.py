from flask import Blueprint, request, session
from .models import db

main = Blueprint("main", __name__, url_prefix='/api')

# create-lobby
    # register user as host
# join-lobby
    # register user as player

@main.route('/join-lobby', methods=['POST'])
def join_lobby():
    print('revc')

    json = request.get_json(force=True)
    session['username'] = json['userName']
    return 'SUCCESS!!'

@main.route('/username')
def get_username():
    if session.get('username'):
        return session['username']
    return ''



