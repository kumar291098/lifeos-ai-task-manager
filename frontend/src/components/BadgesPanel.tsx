import { CheckCircle2, Sun, Clock, Zap, Flame, Trophy, Lock } from 'lucide-react'
import { BADGES } from '../hooks/useGamification'

interface BadgesPanelProps {
  unlockedBadgeIds: string[]
}

export function BadgesPanel({ unlockedBadgeIds }: BadgesPanelProps) {
  const getIcon = (iconName: string, isUnlocked: boolean) => {
    const size = 18
    if (!isUnlocked) return <Lock size={size} />
    
    switch (iconName) {
      case 'CheckCircle2':
        return <CheckCircle2 size={size} />
      case 'Sun':
        return <Sun size={size} />
      case 'Clock':
        return <Clock size={size} />
      case 'Zap':
        return <Zap size={size} />
      case 'Flame':
        return <Flame size={size} />
      case 'Trophy':
        return <Trophy size={size} />
      default:
        return <CheckCircle2 size={size} />
    }
  }

  return (
    <section className="panel badges-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Milestones</p>
          <h2>Achievements</h2>
          <p className="panel-subtitle">Complete tasks to unlock badges and level up.</p>
        </div>
        <span className="count-pill">
          {unlockedBadgeIds.length} / {BADGES.length}
        </span>
      </div>

      <div className="badges-grid">
        {BADGES.map((badge) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id)
          return (
            <div
              key={badge.id}
              className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
              title={`${badge.name}: ${badge.description} (${badge.condition})`}
            >
              <div className="badge-icon-wrapper">
                {getIcon(badge.icon, isUnlocked)}
              </div>
              <span className="badge-name">{badge.name}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
