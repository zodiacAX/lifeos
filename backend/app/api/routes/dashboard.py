from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...models import Completion
from ...repositories.rewards import RewardRepository
from ...services.game import GameService
from ..deps import current_user
from .helpers import quest_out, user_out

router=APIRouter(tags=['dashboard'])

@router.get('/dashboard')
def dashboard(user=Depends(current_user),db:Session=Depends(get_db)):
    game=GameService(db); quest_list=game.quests.list_for_user(user.id)
    reward_repo=RewardRepository(db); rewards=reward_repo.list(); inv=reward_repo.inventory_for_user(user.id); inv_map={i.reward_id:i for i in inv}
    entries=list(db.scalars(select(Completion).where(Completion.user_id==user.id).order_by(Completion.completed_at.desc()).limit(50)))
    return {
      'user':user_out(user),
      'quests':[quest_out(q) for q in quest_list],
      'rewards':[{'id':r.id,'name':r.name,'description':r.description,'cost':r.cost,'kind':r.kind,'slot':r.slot,'owned':r.id in inv_map,'equipped':bool(inv_map.get(r.id) and inv_map[r.id].equipped)} for r in rewards],
      'journal':[{'id':e.id,'title':e.quest_title,'xp':e.xp,'credits':e.credits,'category':e.category,'completed_at':e.completed_at.isoformat()} for e in entries],
      'weekly_completed':game.weekly_completed(user.id),'weekly_goal':7
    }
