from typing import List
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, LargeBinary
from sqlalchemy.orm import DeclarativeBase, Mapped, MappedAsDataclass, mapped_column, relationship

class Base(MappedAsDataclass, DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class Game(db.Model, MappedAsDataclass):
    __tablename__ = 'game'

    host_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    invite_code: Mapped[str] = mapped_column(unique=True)

    players: Mapped[List["Player"]] = relationship(back_populates='game')
    num_players_unsubmitted: Mapped[int] = mapped_column(default=0)
    player_cap: Mapped[int] = mapped_column(default=4)
    rount_count: Mapped[int] = mapped_column(default=4)
    #current_round: Mapped[int] = mapped_column(default=0)
    time_limit_minutes: Mapped[int] = mapped_column(default=1)


class Player(db.Model, MappedAsDataclass):
    __tablename__ = 'player'

    player_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    username: Mapped[str]

    game_id: Mapped[int] = mapped_column(ForeignKey('game.host_id'), nullable=True)
    game: Mapped["Game"] = relationship(back_populates='players')

    socket_id: Mapped[str] = mapped_column(default='')

class Comic(db.Model, MappedAsDataclass):
    comic_id:  Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    #sketch_panels
    #completed_panels

class Panel(db.Model, MappedAsDataclass):
    panel_id:  Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    image: Mapped[str] = mapped_column(LargeBinary)
