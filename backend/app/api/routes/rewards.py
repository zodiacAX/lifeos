from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...services.game import GameService
from ..deps import current_user
from .helpers import user_out

router=APIRouter(prefix='/rewards',tags=['rewards'])

def reward_out(r,owned=True,equipped=False):
    return {'id':r.id,'name':r.name,'description':r.description,'cost':r.cost,'kind':r.kind,'slot':r.slot,'owned':owned,'equipped':equipped}

@router.post('/{reward_id}/purchase')
def purchase(reward_id:int,user=Depends(current_user),db:Session=Depends(get_db)):
    game=GameService(db);reward=game.rewards.get(reward_id)
    if not reward: raise HTTPException(404,'Reward not found')
    try:item=game.purchase(user,reward)
    except ValueError as e: raise HTTPException(409,str(e))
    return {'reward':reward_out(reward,True,item.equipped),'user':user_out(user)}

@router.post('/{reward_id}/equip')
def equip(reward_id:int,user=Depends(current_user),db:Session=Depends(get_db)):
    game=GameService(db);item=game.rewards.owned(user.id,reward_id)
    if not item: raise HTTPException(404,'Unlock this cosmetic first')
    try:item=game.equip(user,item)
    except ValueError as e: raise HTTPException(409,str(e))
    return reward_out(item.reward,True,item.equipped)
