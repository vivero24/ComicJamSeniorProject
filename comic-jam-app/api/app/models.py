from typing import List, Optional
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ARRAY, JSON, ForeignKey, LargeBinary, String
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
    rount_count: Mapped[int] = mapped_column(default=4)
    time_limit_minutes: Mapped[int] = mapped_column(default=10)


class Player(db.Model, MappedAsDataclass):
    __tablename__ = 'player'

    player_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    username: Mapped[str]

    game_id: Mapped[int] = mapped_column(ForeignKey('game.host_id'), nullable=True)
    game: Mapped["Game"] = relationship(back_populates='players')

    owned_comic: Mapped[Optional['Comic']] = relationship(back_populates='owner')

    assigned_comic_id: Mapped[Optional[int]]
    assigned_prompt: Mapped[Optional[str]]
    # Unused until the sketch phase is implemented.
    # It might also be worth combining these into a tuple
    # or dictionary to reduce the book keeping required.
    # assigned_panel_id: Mapped[Optional[int]]

    # Used to send events to specific users
    socket_id: Mapped[str] = mapped_column(default='')

# NOTE: If we're still going ahead with the sketch phase
# another sketch panel object will have to be created to allow
# the many-to-one relationship
class Comic(db.Model, MappedAsDataclass):
    __tablename__ = 'comic'
    comic_id:  Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)

    owner_id: Mapped[int] = mapped_column(ForeignKey('player.player_id'))
    owner: Mapped['Player'] = relationship(back_populates='owned_comic')
    completed_panels: Mapped[List['Panel']] = relationship(back_populates='comic')
    #panel_prompts: Mapped[List[str]] = mapped_column(JSON)
    # sketch_panels --- unimplemented for now
    comic_name: Mapped[str] = mapped_column(default='unnamed')

class Panel(db.Model, MappedAsDataclass):
    __tablename__ = 'panel'

    panel_id:  Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)

    comic_id: Mapped[int] = mapped_column(ForeignKey('comic.comic_id'))
    comic: Mapped['Comic'] = relationship(back_populates='completed_panels')

    prompt: Mapped[str]
    image: Mapped[Optional[bytes]] = mapped_column(LargeBinary, default=None)
