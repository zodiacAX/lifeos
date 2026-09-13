from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from ..core.config import get_settings

settings = get_settings()
database_url = settings.resolved_database_url

if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)
else:
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=2,
        max_overflow=3,
    )

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
