from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ...core.config import get_settings
from ...core.security import create_token, hash_password, verify_password
from ...db.database import get_db
from ...models import User
from ...repositories.users import UserRepository
from ...schemas import AuthLogin, AuthRegister
from ...services.seed import seed_demo, seed_new_user
from ..deps import current_user
from .helpers import user_out

router = APIRouter(prefix="/auth", tags=["auth"])


def set_cookie(response: Response, user_id: int):
    settings = get_settings()
    response.set_cookie(
        "lifeos_session",
        create_token(user_id),
        httponly=True,
        samesite="lax",
        secure=settings.effective_cookie_secure,
        max_age=14 * 24 * 3600,
        path="/",
    )


@router.post("/register")
def register(payload: AuthRegister, response: Response, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    username = payload.username.strip().lower()
    display_name = payload.display_name.strip()
    if repo.by_username(username):
        raise HTTPException(409, "Handle already exists")
    user = User(
        username=username,
        display_name=display_name,
        password_hash=hash_password(payload.password),
    )
    seed_new_user(db, user)
    set_cookie(response, user.id)
    return user_out(user)


@router.post("/login")
def login(payload: AuthLogin, response: Response, db: Session = Depends(get_db)):
    username = payload.username.strip().lower()
    user = UserRepository(db).by_username(username)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid handle or access key")
    set_cookie(response, user.id)
    return user_out(user)


@router.post("/demo")
def demo(response: Response, db: Session = Depends(get_db)):
    user = seed_demo(db)
    set_cookie(response, user.id)
    return user_out(user)


@router.get("/me")
def me(user=Depends(current_user)):
    return user_out(user)


@router.post("/logout", status_code=204)
def logout(response: Response):
    settings = get_settings()
    response.delete_cookie(
        "lifeos_session",
        path="/",
        secure=settings.effective_cookie_secure,
        samesite="lax",
    )
