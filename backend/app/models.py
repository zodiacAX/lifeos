from __future__ import annotations
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(80))
    password_hash: Mapped[str] = mapped_column(String(255))
    level: Mapped[int] = mapped_column(Integer, default=1)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    credits: Mapped[int] = mapped_column(Integer, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    momentum: Mapped[int] = mapped_column(Integer, default=0)
    available_points: Mapped[int] = mapped_column(Integer, default=0)
    last_active_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    stats: Mapped[UserStats] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)
    quests: Mapped[list[Quest]] = relationship(back_populates="user", cascade="all, delete-orphan")
    completions: Mapped[list[Completion]] = relationship(back_populates="user", cascade="all, delete-orphan")
    inventory: Mapped[list[Inventory]] = relationship(back_populates="user", cascade="all, delete-orphan")

class UserStats(Base):
    __tablename__ = "user_stats"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    intelligence: Mapped[int] = mapped_column(Integer, default=15)
    strength: Mapped[int] = mapped_column(Integer, default=15)
    discipline: Mapped[int] = mapped_column(Integer, default=15)
    health: Mapped[int] = mapped_column(Integer, default=15)
    focus: Mapped[int] = mapped_column(Integer, default=15)
    user: Mapped[User] = relationship(back_populates="stats")

class Quest(Base):
    __tablename__ = "quests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(24), default="focus")
    difficulty: Mapped[str] = mapped_column(String(12), default="medium")
    xp_reward: Mapped[int] = mapped_column(Integer, default=60)
    credit_reward: Mapped[int] = mapped_column(Integer, default=20)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    target: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(16), default="active")
    repeat_rule: Mapped[str] = mapped_column(String(16), default="once")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    user: Mapped[User] = relationship(back_populates="quests")

class Completion(Base):
    __tablename__ = "completions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    quest_title: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(24))
    xp: Mapped[int] = mapped_column(Integer)
    credits: Mapped[int] = mapped_column(Integer)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    user: Mapped[User] = relationship(back_populates="completions")

class Reward(Base):
    __tablename__ = "rewards"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    description: Mapped[str] = mapped_column(Text)
    cost: Mapped[int] = mapped_column(Integer)
    kind: Mapped[str] = mapped_column(String(16), default="real_life")
    slot: Mapped[str | None] = mapped_column(String(24), nullable=True)

class Inventory(Base):
    __tablename__ = "inventory"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    reward_id: Mapped[int] = mapped_column(ForeignKey("rewards.id"), index=True)
    equipped: Mapped[bool] = mapped_column(Boolean, default=False)
    purchased_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    user: Mapped[User] = relationship(back_populates="inventory")
    reward: Mapped[Reward] = relationship()
