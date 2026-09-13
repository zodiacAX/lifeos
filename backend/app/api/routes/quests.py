from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...models import Quest
from ...schemas import QuestCreate, QuestPatch
from ...services.game import GameService
from ...services.progression import quest_rewards
from ..deps import current_user
from .helpers import quest_out, user_out

router=APIRouter(prefix='/quests',tags=['quests'])

@router.get('')
def list_quests(user=Depends(current_user),db:Session=Depends(get_db)):
    return [quest_out(q) for q in GameService(db).quests.list_for_user(user.id)]

@router.post('')
def create_quest(payload:QuestCreate,user=Depends(current_user),db:Session=Depends(get_db)):
    xp,cr=quest_rewards(payload.difficulty)
    q=Quest(user_id=user.id,title=payload.title,description=payload.description,category=payload.category,difficulty=payload.difficulty,repeat_rule=payload.repeat_rule,xp_reward=xp,credit_reward=cr)
    GameService(db).quests.add(q);db.commit();db.refresh(q);return quest_out(q)

@router.patch('/{quest_id}')
def patch_quest(quest_id:int,payload:QuestPatch,user=Depends(current_user),db:Session=Depends(get_db)):
    service=GameService(db);q=service.quests.get_for_user(user.id,quest_id)
    if not q: raise HTTPException(404,'Quest not found')
    for key,val in payload.model_dump(exclude_none=True).items(): setattr(q,key,val)
    if payload.difficulty:
        q.xp_reward,q.credit_reward=quest_rewards(payload.difficulty)
    db.commit();db.refresh(q);return quest_out(q)

@router.delete('/{quest_id}',status_code=204)
def delete_quest(quest_id:int,user=Depends(current_user),db:Session=Depends(get_db)):
    service=GameService(db);q=service.quests.get_for_user(user.id,quest_id)
    if not q: raise HTTPException(404,'Quest not found')
    service.quests.remove(q);db.commit();return Response(status_code=204)

@router.post('/{quest_id}/complete')
def complete_quest(quest_id:int,user=Depends(current_user),db:Session=Depends(get_db)):
    service=GameService(db);q=service.quests.get_for_user(user.id,quest_id)
    if not q: raise HTTPException(404,'Quest not found')
    try:r=service.complete_quest(user,q)
    except ValueError as e: raise HTTPException(409,str(e))
    return {'quest':quest_out(r['quest']),'user':user_out(r['user']),'level_up':r['level_up'],'old_level':r['old_level'],'new_level':r['new_level'],'xp_gained':r['xp_gained'],'credits_gained':r['credits_gained']}
