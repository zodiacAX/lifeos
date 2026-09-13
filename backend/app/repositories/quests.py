from sqlalchemy import select
from sqlalchemy.orm import Session
from ..models import Quest, Completion

class QuestRepository:
    def __init__(self, db:Session): self.db=db
    def list_for_user(self,user_id:int):
        return list(self.db.scalars(select(Quest).where(Quest.user_id==user_id).order_by(Quest.status.asc(), Quest.created_at.desc())))
    def get_for_user(self,user_id:int,quest_id:int):
        return self.db.scalar(select(Quest).where(Quest.id==quest_id, Quest.user_id==user_id))
    def add(self,q:Quest): self.db.add(q); self.db.flush(); return q
    def remove(self,q:Quest): self.db.delete(q)
    def log_completion(self, c:Completion): self.db.add(c); self.db.flush(); return c
