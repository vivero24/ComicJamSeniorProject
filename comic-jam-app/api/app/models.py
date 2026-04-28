from typing import List, Optional
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, LargeBinary
from sqlalchemy.orm import DeclarativeBase, Mapped, MappedAsDataclass, mapped_column, relationship

class Base(MappedAsDataclass, DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class Game(db.Model, MappedAsDataclass):
    __tablename__ = 'game'

    host_id:    Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)

    invite_code: Mapped[str] = mapped_column(unique=True)

    players: Mapped[List['Player']] = relationship(back_populates='game')

    num_players_unsubmitted: Mapped[int] = mapped_column(default=0)

    player_cap: Mapped[int] = mapped_column(default=4)

    round_count: Mapped[int] = mapped_column(default=4)

    time_limit_minutes: Mapped[int] = mapped_column(default=10)
    lobby_availability: Mapped[bool] = mapped_column(default=True)


class Player(db.Model, MappedAsDataclass):
    __tablename__ = 'player'

    player_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)

    username: Mapped[str]

    game_id: Mapped[int] = mapped_column(ForeignKey('game.host_id'), nullable=True)
    game: Mapped["Game"] = relationship(back_populates='players')

    owned_comic: Mapped[Optional['Comic']] = relationship(back_populates='owner')

    # ID of the panel this player should complete during a round.
    # Will be None if the game has not started, or if the player has already submitted their drawing.
    assigned_panel_id: Mapped[Optional[int]]

    # Used to send events to specific users
    socket_id: Mapped[str] = mapped_column(default='')

class Comic(db.Model, MappedAsDataclass):
    __tablename__ = 'comic'

    comic_id:  Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)

    owner_id: Mapped[int] = mapped_column(ForeignKey('player.player_id'))
    owner: Mapped['Player'] = relationship(back_populates='owned_comic')

    panels: Mapped[List['Panel']] = relationship(back_populates='comic')

    comic_name: Mapped[str] = mapped_column(default='unnamed')

class Panel(db.Model, MappedAsDataclass):
    __tablename__ = 'panel'

    panel_id:  Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)

    comic_id: Mapped[int] = mapped_column(ForeignKey('comic.comic_id'))
    comic: Mapped['Comic'] = relationship(back_populates='panels')

    # Sentence or phrase of this panel's intended contents, set during round 0
    # of the game.
    prompt: Mapped[str]

    image: Mapped[Optional[bytes]] = mapped_column(LargeBinary, default=None)
