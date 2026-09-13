from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.security import decode_token
from ..db.database import get_db
from ..models import User


def current_user(lifeos_session: str | None = Cookie(default=None), db: Session = Depends(get_db)) -> User:
    if not lifeos_session:
        raise HTTPException(status_code=401, detail='Not authenticated')
    try:
        user_id=decode_token(lifeos_session)
    except Exception:
        raise HTTPException(status_code=401, detail='Session expired')
    user=db.get(User,user_id)
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    return user
