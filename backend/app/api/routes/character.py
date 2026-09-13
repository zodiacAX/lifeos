from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...schemas import AllocateStat
from ..deps import current_user
from .helpers import user_out

router=APIRouter(prefix='/character',tags=['character'])

@router.post('/allocate')
def allocate(payload:AllocateStat,user=Depends(current_user),db:Session=Depends(get_db)):
    if user.available_points <= 0: raise HTTPException(409,'No unspent attribute points')
    current=getattr(user.stats,payload.attribute);setattr(user.stats,payload.attribute,min(100,current+1));user.available_points-=1;db.commit();db.refresh(user);return user_out(user)
