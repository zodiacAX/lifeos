from datetime import date, timedelta

DIFFICULTY = {
    'easy': (40, 14),
    'medium': (70, 24),
    'hard': (110, 38),
}

def xp_required(level:int)->int:
    # Non-linear per-level requirement. Level 18 ~= 10k-scale cumulative progress.
    return int(500 + 166 * (level ** 1.40))

def quest_rewards(difficulty:str)->tuple[int,int]:
    return DIFFICULTY.get(difficulty, DIFFICULTY['medium'])

def streak_multiplier(streak:int)->float:
    return min(1.35, 1.0 + min(streak, 14) * 0.02)

def update_streak(last_active:str|None, current_streak:int, today:date|None=None)->tuple[int,str]:
    today = today or date.today()
    if not last_active:
        return 1, today.isoformat()
    try: last=date.fromisoformat(last_active)
    except ValueError: return 1,today.isoformat()
    if last == today: return current_streak, today.isoformat()
    if last == today - timedelta(days=1): return current_streak + 1, today.isoformat()
    return 1, today.isoformat()

def momentum_from(streak:int, weekly_completed:int)->int:
    return min(100, 28 + streak*4 + min(weekly_completed,7)*5)
