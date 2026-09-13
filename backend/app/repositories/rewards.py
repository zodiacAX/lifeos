from sqlalchemy import select
from sqlalchemy.orm import Session
from ..models import Reward, Inventory

class RewardRepository:
    def __init__(self,db:Session):self.db=db
    def list(self): return list(self.db.scalars(select(Reward).order_by(Reward.cost.asc())))
    def get(self,reward_id:int): return self.db.get(Reward,reward_id)
    def inventory_for_user(self,user_id:int): return list(self.db.scalars(select(Inventory).where(Inventory.user_id==user_id)))
    def owned(self,user_id:int,reward_id:int): return self.db.scalar(select(Inventory).where(Inventory.user_id==user_id,Inventory.reward_id==reward_id))
    def add_inventory(self,item:Inventory): self.db.add(item); self.db.flush(); return item
