from sqlalchemy import select
from sqlalchemy.orm import Session
from ..core.security import hash_password
from ..models import Quest, Reward, User, UserStats, Inventory, Completion

REWARDS = [
    ('MOVIE NIGHT','Take the night off intentionally. Pick a film, put the phone away.',150,'real_life',None),
    ('GAMING SESSION','A guilt-free gaming block earned by completing real-world work.',200,'real_life',None),
    ('FAVOURITE MEAL','Redeem a meal you actually look forward to.',300,'real_life',None),
    ('CRIMSON UTILITY JACKET','Cosmetic identity module inspired by the core character.',420,'cosmetic','jacket'),
    ('CYAN GOGGLE TINT','Switch the character HUD accent to a colder cyan lens profile.',360,'cosmetic','goggles'),
    ('HEAVY BOOT PATCH','A cosmetic boot badge for movement-focused players.',280,'cosmetic','boots'),
    ('DOUBLE-BUN PROFILE','Signature hair profile from the LIFE//OS identity model.',260,'cosmetic','hair'),
    ('FOREARM MODULE // C7','Cosmetic cybernetic module slot.',500,'cosmetic','cybernetic'),
    ('CUSTOM PROFILE THEME','Unlock a special profile badge and identity treatment.',500,'cosmetic','badge'),
]

DEMO_QUESTS = [
    ('COMPLETE ML LESSON','Finish one machine-learning lesson and write three notes.','intelligence','medium','daily'),
    ('WORKOUT 30 MINUTES','Move continuously for thirty minutes. No perfect plan required.','strength','medium','daily'),
    ('READ 20 PAGES','Read twenty focused pages without switching apps.','discipline','easy','daily'),
    ('BUILD PERSONAL PROJECT','Ship one concrete piece of the project, not just planning.','focus','hard','weekly'),
    ('SLEEP BEFORE 11:30','Protect tomorrow by ending today on time.','health','medium','daily'),
]

def ensure_rewards(db: Session):
    if db.scalar(select(Reward.id).limit(1)) is None:
        for name,desc,cost,kind,slot in REWARDS:
            db.add(Reward(name=name,description=desc,cost=cost,kind=kind,slot=slot))
        db.commit()

def seed_demo(db: Session):
    ensure_rewards(db)
    user=db.scalar(select(User).where(User.username=='user_07'))
    if user: return user
    user=User(username='user_07',display_name='USER_07',password_hash=hash_password('demo1234'),level=18,xp=8420,credits=2840,streak_days=12,momentum=82,available_points=2,last_active_date=None)
    user.stats=UserStats(intelligence=82,strength=67,discipline=91,health=78,focus=74)
    db.add(user); db.flush()
    for title,desc,cat,diff,repeat in DEMO_QUESTS:
        base={'easy':(40,14),'medium':(70,24),'hard':(110,38)}[diff]
        db.add(Quest(user_id=user.id,title=title,description=desc,category=cat,difficulty=diff,xp_reward=base[0],credit_reward=base[1],repeat_rule=repeat,target=1,progress=0,status='active'))
    # Add a few historical completions so the journal is alive on first load.
    history=[('MORNING WALK','health',55,18),('REVIEW DSA NOTES','intelligence',70,24),('DEEP WORK BLOCK','focus',110,38),('CALL FAMILY','discipline',45,14),('WORKOUT 30 MINUTES','strength',70,24)]
    from datetime import datetime, timezone, timedelta
    for i,(title,cat,xp,cr) in enumerate(history):
        db.add(Completion(user_id=user.id,quest_title=title,category=cat,xp=xp,credits=cr,completed_at=datetime.now(timezone.utc)-timedelta(days=i)))
    db.commit(); db.refresh(user); return user

def seed_new_user(db: Session,user:User):
    user.stats=UserStats()
    starter=[
      ('PLAN TOMORROW','Write tomorrow’s three most important actions.','discipline','easy','daily'),
      ('MOVE FOR 20 MINUTES','Walk, lift, stretch, or do anything that raises your pulse.','strength','medium','daily'),
      ('FOCUS BLOCK','Do one 45-minute block with notifications off.','focus','medium','daily'),
    ]
    db.add(user); db.flush()
    for title,desc,cat,diff,repeat in starter:
        base={'easy':(40,14),'medium':(70,24),'hard':(110,38)}[diff]
        db.add(Quest(user_id=user.id,title=title,description=desc,category=cat,difficulty=diff,xp_reward=base[0],credit_reward=base[1],repeat_rule=repeat))
    db.commit(); db.refresh(user); return user
