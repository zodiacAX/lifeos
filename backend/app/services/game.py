from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..models import Completion, Inventory, Quest, Reward, User
from ..repositories.quests import QuestRepository
from ..repositories.rewards import RewardRepository
from .progression import momentum_from, quest_rewards, streak_multiplier, update_streak, xp_required

ATTRIBUTE_NAMES={'intelligence','strength','discipline','health','focus'}

class GameService:
    def __init__(self,db:Session):
        self.db=db; self.quests=QuestRepository(db); self.rewards=RewardRepository(db)

    def complete_quest(self,user:User,quest:Quest):
        if quest.status == 'completed': raise ValueError('Quest already completed')
        base_xp,base_cr=quest_rewards(quest.difficulty)
        # Allow authored defaults but never trust a client reward amount.
        xp = max(base_xp, quest.xp_reward)
        cr = max(base_cr, quest.credit_reward)
        mult=streak_multiplier(user.streak_days)
        xp=int(round(xp*mult))
        old_level=user.level
        user.xp += xp; user.credits += cr
        user.streak_days,user.last_active_date=update_streak(user.last_active_date,user.streak_days)
        quest.status='completed'; quest.progress=quest.target; quest.completed_at=datetime.now(timezone.utc)
        if quest.category in ATTRIBUTE_NAMES:
            current=getattr(user.stats,quest.category)
            setattr(user.stats,quest.category,min(100,current + (3 if quest.difficulty=='hard' else 2 if quest.difficulty=='medium' else 1)))
        while user.xp >= xp_required(user.level):
            user.xp -= xp_required(user.level); user.level += 1; user.available_points += 2
        weekly=self.weekly_completed(user.id)
        user.momentum=momentum_from(user.streak_days,weekly)
        self.quests.log_completion(Completion(user_id=user.id,quest_title=quest.title,category=quest.category,xp=xp,credits=cr))
        self.db.commit(); self.db.refresh(user); self.db.refresh(quest)
        return {'quest':quest,'user':user,'level_up':user.level>old_level,'old_level':old_level,'new_level':user.level,'xp_gained':xp,'credits_gained':cr}

    def weekly_completed(self,user_id:int)->int:
        cutoff=datetime.now(timezone.utc)-timedelta(days=7)
        return int(self.db.scalar(select(func.count(Completion.id)).where(Completion.user_id==user_id,Completion.completed_at>=cutoff)) or 0)

    def purchase(self,user:User,reward:Reward):
        existing=self.rewards.owned(user.id,reward.id)
        if existing: return existing
        if user.credits < reward.cost: raise ValueError('Not enough credits')
        user.credits -= reward.cost
        item=Inventory(user_id=user.id,reward_id=reward.id,equipped=False)
        self.rewards.add_inventory(item); self.db.commit(); self.db.refresh(user); return item

    def equip(self,user:User,item:Inventory):
        reward=item.reward
        if reward.kind != 'cosmetic': raise ValueError('This reward is not wearable')
        if reward.slot:
            inv=self.rewards.inventory_for_user(user.id)
            for other in inv:
                if other.reward.slot == reward.slot: other.equipped=False
        item.equipped=True; self.db.commit(); self.db.refresh(item); return item
