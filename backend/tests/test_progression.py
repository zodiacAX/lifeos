from backend.app.services.progression import xp_required, streak_multiplier, update_streak
from datetime import date, timedelta

def test_level_curve_is_nonlinear():
    assert xp_required(10) > xp_required(5) * 2
    assert xp_required(18) > 9000

def test_streak_bonus_is_capped():
    assert streak_multiplier(0) == 1.0
    assert streak_multiplier(100) <= 1.35

def test_streak_continues_from_yesterday():
    today=date(2026,9,13)
    streak, stamp=update_streak((today-timedelta(days=1)).isoformat(), 4, today)
    assert streak == 5
    assert stamp == today.isoformat()
