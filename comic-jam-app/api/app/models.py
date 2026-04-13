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
    player_cap: Mapped[int]
    rount_count: Mapped[int]
    current_round: Mapped[int]
    time_limit_minutes: Mapped[int]

    players: Mapped[List["Player"]] = relationship(back_populates='game')
   
class Player(db.Model, MappedAsDataclass):
    __tablename__ = 'player'

    player_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    username: Mapped[str]

    game_id: Mapped[int] = mapped_column(ForeignKey('game.host_id'), nullable=True)
    game: Mapped["Game"] = relationship(back_populates='players')

    # A player has exactly one comic
    comic: Mapped["Comic"] = relationship(back_populates='player', uselist=False)


class Comic(db.Model, MappedAsDataclass):
    __tablename__ = 'comic'
    
    comic_id:  Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)

    # Required by routes.py
    name: Mapped[str]

    # Connect Comic to Player (one-to-one)
    player_id: Mapped[int] = mapped_column(ForeignKey('player.player_id'), unique=True)
    player: Mapped["Player"] = relationship(back_populates='comic')

    # Comic has many panels
    panels: Mapped[List["Panel"]] = relationship(back_populates='comic')

class Panel(db.Model, MappedAsDataclass):
    __tablename__ = 'panel'
    
    panel_id:  Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    image: Mapped[str] = mapped_column(LargeBinary)

    # Connect Panel to the Comic
    comic_id: Mapped[int] = mapped_column(ForeignKey('comic.comic_id'))
    comic: Mapped["Comic"] = relationship(back_populates='panels')


