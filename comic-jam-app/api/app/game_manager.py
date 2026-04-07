import time

from flask import Flask

from . import socketio
from .models import db, Game, Player


# Each round, emit a round start event that sends the game state as JSON
#       Also use call() here,
#           If call doesn't allow rooms, track socket id on connect in Flask session
#   Begin timer then broadcast round-over event after it expires
#       Can't use a blocking sleep, since we need to poll whether all users have submitted and 
#       end the round early in that case
#           Also requires tracking the users that have already submitted in the database
#               Can't be a local variable, since the values could be edited outside of the 
#               background task, e.g. a submit endpoint
#       If the last round has finished, broadcast a game-over event instead

# TODO: how does this work with threading?
def broadcast_round_start(game: Game, current_round: int):
    for player in game.players:
        
        # TODO: assign each player an image

        game_state = {
            'currentRound': current_round,
            'totalRounds': game.rount_count,
            'timeLimit': game.time_limit_minutes,
            # TODO: include sketch image as BLOB
        }

        try:
            socketio.call('round-start', game_state, to=player.socket_id, timeout=10)
        except TimeoutError:
            print(f"Player={player.username} in game={game.invite_code} did not acknowledge round start request, moving on...")

    return None

def broadcast_round_end(game: Game):
    for player in game.players:
        try:
            socketio.call('round-end', to=player.socket_id, timeout=10)
        except TimeoutError:
            print(f"Player={player.username} in game={game.invite_code} did not acknowledge round end, moving on...")

def broadcast_game_end(game: Game):
    for player in game.players:
        try:
            socketio.call('game-end', to=player.socket_id, timeout=10)
        except TimeoutError:
            print(f"Player={player.username} in game={game.invite_code} did not acknowledge round end, moving on...")

def manage_game_loop(game_id: int, app: Flask):
    app.app_context().push()
    #with app.app_context():
    game = db.get_or_404(Game, game_id)


# Let all players know game has started, only continue after all have acknowledged
# or the time expires
    print(f"Beginning game={game.invite_code}")
    for player in game.players:
        try:
            socketio.call('game-start-ack-requested', to=player.socket_id, timeout=10)
        except TimeoutError:
            print(f"Player={player.username} in game={game.invite_code} did not acknowledge game start request, moving on...")

    socketio.emit('all-players-ready', to=game.invite_code)


    current_round = 1
    while current_round <= game.rount_count:
        broadcast_round_start(game, current_round)

        print(f"Game={game.invite_code} started round={current_round}")
        # NOTE: Using seconds for debugging, should be minutes in the future
        #
        time.sleep(game.time_limit_minutes)

        #round_start_time = time.time()
        # NOTE: Using seconds for debugging, should be minutes in the future
        #while(time.time() - round_start_time < game.time_limit_minutes):
        #    time.sleep(0.1)

        if current_round == game.rount_count:
            print(f"Game={game.invite_code} ended round={current_round}")
            broadcast_game_end(game)
        else:
            print(f"Game={game.invite_code} concluded")
            broadcast_round_end(game)

        current_round += 1
