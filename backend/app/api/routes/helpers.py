from ...services.progression import xp_required

def user_out(user):
    return {
      'id':user.id,'username':user.username,'display_name':user.display_name,'level':user.level,'xp':user.xp,'xp_next':xp_required(user.level),'credits':user.credits,
      'streak_days':user.streak_days,'momentum':user.momentum,'available_points':user.available_points,
      'attributes':{'intelligence':user.stats.intelligence,'strength':user.stats.strength,'discipline':user.stats.discipline,'health':user.stats.health,'focus':user.stats.focus}
    }

def quest_out(q):
    return {'id':q.id,'title':q.title,'description':q.description,'category':q.category,'difficulty':q.difficulty,'xp_reward':q.xp_reward,'credit_reward':q.credit_reward,
            'progress':q.progress,'target':q.target,'status':q.status,'repeat_rule':q.repeat_rule,'created_at':q.created_at.isoformat(),'completed_at':q.completed_at.isoformat() if q.completed_at else None}
