from typing import List, Optional
import time

from flask import Flask, current_app
from socketio.exceptions import TimeoutError

from app.events import broadcast_player_submission_update

from . import socketio
from .models import Panel, Player, db, Game, Comic

from enum import StrEnum
class Game_Event(StrEnum):
    GAME_START = 'game-start-ack-requested'
    ROUND_START = 'round-start'
    ROUND_END = 'round-end'
    GAME_END = 'game-end'

# Broadcasts the specified event to all players in a game's lobby and
# waits for each player to acknowledge the event before returning.
def broadcast_game_event(event: Game_Event, game: Game, data: Optional[dict]=None):
    for player in game.players:
        try:
            current_app.logger.debug(f"Pinging Player={player.username} in Game={game.invite_code} to acknowledge event={event}.")

            if event == Game_Event.ROUND_START:

                if data is None:
                    data = {}

                panel = db.get_or_404(Panel, player.assigned_panel_id)
                data['assignedTitle'] = panel.comic.comic_name
                data['assignedPrompt'] = panel.prompt

            socketio.call(event, data, to=player.socket_id, timeout=10)
        except TimeoutError:
            current_app.logger.warning(f"Player={player.username} in game={game.invite_code} did not acknowledge event={event}.")

# Assigns each player another player's comic. The
# current round number is used to "rotate" assignments so
# players create at least one panel for each comic.
#
# Called at the start of each round.
#
# NOTE: - Will produce strange results since round count is not
# currently bound to player count.
# - May change require changes to account for sketching round
def assign_comics(game: Game, current_round: int):
    # When indexing panels, use -2 since drawing starts at
    # round 1, and zero-indexed array

    # collect comic IDs in array
    # For each player, use assignment algorithm to
    # determine which comicID goes to a player
    #   Set assigned_comic_id using algorthm result
    #   Set assigned_prompt using current_round-2 mentioned above
    
    # collect comic IDs
    comics: List[Comic] = []
    for player in game.players:
        if player.owned_comic is not None:
            comics.append(player.owned_comic)


    # Commit first to fix bug where assigned_comic_id would
    # become None after the later commit. It might have to do
    # with syncing the DB sessions between threads?
    # Might be hiding a race condition, further testing needed.
    db.session.commit()

    # Drawing begins at round 1
    drawing_round = current_round - 1
    num_players = len(game.players)
    for index, player in enumerate(game.players):
        
        # debug code
        if num_players == 1:
            offset = 0
        else:
            offset = int((drawing_round) / (num_players - 1))

        comic_index = ((index + drawing_round + 1) + offset) % num_players

        player.assigned_panel_id = comics[comic_index].panels[drawing_round].panel_id

        db.session.commit()

        current_app.logger.debug(f"Player={player.username}, id={player.player_id} assigned panel={player.assigned_panel_id}")

 
def manage_game_loop(game_id: int, app: Flask):
    app.app_context().push()

    # Seems to be important that the Game is retrieved inside
    # this function rather than passed as a parameter. Otherwise
    # "Parent instance not bound to session" errors pop up.
    game = db.get_or_404(Game, game_id)

    # Initialize comics for all players
    for player in game.players:
        comic = Comic(comic_name='unnamed',
                      owner_id=player.player_id,
                      owner=player,
                      panels=[])

        db.session.add(comic)

        # NOTE: In the future, initialize the image with a placeholder
        # "image not found"
        for _ in range(game.round_count):
            panel = Panel(comic_id=comic.comic_id,
                          comic=comic,
                          prompt = 'no prompt')

            db.session.add(panel)

            db.session.commit()

    # Let all players know game has started
    broadcast_game_event(Game_Event.GAME_START, game)

    # Is this event necessary? Intended effect is to cause all players to wait until
    # the server gives the all clear, but that might achieved by broadcasting round-start
    socketio.emit('all-players-ready', to=game.invite_code)

    # Starting at round 0 so account for prompting phase,
    # drawing takes place during all rounds after
    current_round = 0
    while current_round <= game.round_count:
        game_state = {
            'currentRound': current_round,
            'totalRounds': game.round_count,
            'timeLimit': game.time_limit_minutes,
        }

        # Rotate assignment based on round
        assign_comics(game, current_round)

        game.num_players_unsubmitted = len(game.players)
        broadcast_player_submission_update(game)

        db.session.commit()

        # Let players know a new round has started
        broadcast_game_event(Game_Event.ROUND_START, game, game_state)

        current_app.logger.debug(f"Game={game.invite_code} started round {current_round} of {game.round_count}.")

        # TODO:
        # - Currently using seconds for debugging, but it should be changed
        # to minutes in the future.
        round_end = time.time() + game.time_limit_minutes
        while (time.time() < round_end):
            # Commit before check to sync with other sessions
            db.session.commit()
            if (game.num_players_unsubmitted == 0):
                break

            time.sleep(.5)

        if current_round == game.round_count:
            broadcast_game_event(Game_Event.GAME_END, game)
            current_app.logger.debug(f"Game={game.invite_code} concluded.")
        else:
            broadcast_game_event(Game_Event.ROUND_END, game)
            current_app.logger.debug(f"Game={game.invite_code} ended round {current_round} of {game.round_count}.")

        current_round += 1
