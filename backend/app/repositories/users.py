from sqlalchemy import select
from sqlalchemy.orm import Session
from ..models import User

class UserRepository:
    def __init__(self, db: Session): self.db = db
    def by_id(self, user_id:int) -> User | None:
        return self.db.get(User, user_id)
    def by_username(self, username:str) -> User | None:
        return self.db.scalar(select(User).where(User.username == username))
    def add(self, user:User) -> User:
        self.db.add(user); self.db.flush(); return user
