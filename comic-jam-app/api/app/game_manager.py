import time

from flask import Flask, current_app
from socketio.exceptions import TimeoutError

from . import socketio
from .models import db, Game

from enum import StrEnum
class Game_Event(StrEnum):
    GAME_START = 'game-start-ack-requested'
    ROUND_START = 'round-start'
    ROUND_END = 'round-end'
    GAME_END = 'game-end'

# Broadcasts the specified event to all players in a game's lobby and
# waits for each player to acknowledge the event before returning.
def broadcast_game_event(event: Game_Event, game: Game, data=None):
    for player in game.players:
        try:
            current_app.logger.info(f"Pinging Player={player.username} in Game={game.invite_code} to acknowledge event={event}.")
            socketio.call(event, data, to=player.socket_id, timeout=10)
        except TimeoutError:
            current_app.logger.warning(f"Player={player.username} in game={game.invite_code} did not acknowledge event={event}.")

def manage_game_loop(game_id: int, app: Flask):
    app.app_context().push()

    # Seems to be important that the Game is retrieved inside
    # this function rather than passed as a parameter. Otherwise
    # "Parent instance not bound to session" errors pop up.
    game = db.get_or_404(Game, game_id)

    # Let all players know game has started
    broadcast_game_event(Game_Event.GAME_START, game)

    # Is this event necessary? Intended effect is to cause all players to wait until
    # the server gives the all clear, but that might achieved by broadcasting round-start
    socketio.emit('all-players-ready', to=game.invite_code)

    current_round = 1
    while current_round <= game.rount_count:

        # TODO: Assign players a comic panel to complete
        # Sending images over sockets in ill-advised, so delegating
        # that to a fetch on the frontend may be the way to go.

        game_state = {
            'currentRound': current_round,
            'totalRounds': game.rount_count,
            'timeLimit': game.time_limit_minutes,
        }

        broadcast_game_event(Game_Event.ROUND_START, game, game_state)

        current_app.logger.info(f"Game={game.invite_code} started round {current_round} of {game.rount_count}.")

        # TODO:
        # - Currently using seconds for debugging, but it should be changed
        # to minutes in the future.
        # - Handle case where all players submit before the timer expires
        time.sleep(game.time_limit_minutes)

        if current_round == game.rount_count:
            broadcast_game_event(Game_Event.GAME_END, game)
            current_app.logger.info(f"Game={game.invite_code} concluded.")
        else:
            broadcast_game_event(Game_Event.ROUND_END, game)
            current_app.logger.info(f"Game={game.invite_code} ended round {current_round} of {game.rount_count}.")

        current_round += 1
