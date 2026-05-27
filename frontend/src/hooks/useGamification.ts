import { useEffect, useState } from 'react'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition: string
}

export const BADGES: Badge[] = [
  { id: 'first_task', name: 'First Victory', description: 'Complete your first task', icon: 'CheckCircle2', condition: 'First task completed' },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a task before 9:00 AM', icon: 'Sun', condition: 'Task completed before 9:00 AM' },
  { id: 'deep_work', name: 'Zen Master', description: 'Complete a task estimated at 60+ mins', icon: 'Clock', condition: 'Task estimate >= 60 mins' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a task in 15 mins or less', icon: 'Zap', condition: 'Task estimate <= 15 mins' },
  { id: 'streak_3', name: 'On Fire', description: 'Reach a 3-day completion streak', icon: 'Flame', condition: 'Streak >= 3 days' },
  { id: 'level_5', name: 'Level 5 Elite', description: 'Reach Level 5 in productivity', icon: 'Trophy', condition: 'Reach Level 5' }
]

const XP_KEY = 'lifeos_gamification_xp'
const LEVEL_KEY = 'lifeos_gamification_level'
const STREAK_KEY = 'lifeos_gamification_streak'
const LAST_ACTIVE_KEY = 'lifeos_gamification_last_active'
const BADGES_KEY = 'lifeos_gamification_badges'

export function useGamification() {
  const [xp, setXp] = useState<number>(() => Number(localStorage.getItem(XP_KEY)) || 0)
  const [level, setLevel] = useState<number>(() => Number(localStorage.getItem(LEVEL_KEY)) || 1)
  const [streak, setStreak] = useState<number>(() => Number(localStorage.getItem(STREAK_KEY)) || 0)
  const [badges, setBadges] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]')
    } catch {
      return []
    }
  })

  // Synchronize streak on mount based on date
  useEffect(() => {
    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY)
    if (lastActiveStr) {
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      
      if (lastActiveStr !== today && lastActiveStr !== yesterday) {
        // More than a day has passed since last activity, streak breaks
        setStreak(0)
        localStorage.setItem(STREAK_KEY, '0')
      }
    }
  }, [])

  // Helper to persist state
  const saveState = (newXp: number, newLevel: number, newStreak: number, newBadges: string[]) => {
    setXp(newXp)
    setLevel(newLevel)
    setStreak(newStreak)
    setBadges(newBadges)
    
    localStorage.setItem(XP_KEY, String(newXp))
    localStorage.setItem(LEVEL_KEY, String(newLevel))
    localStorage.setItem(STREAK_KEY, String(newStreak))
    localStorage.setItem(BADGES_KEY, JSON.stringify(newBadges))
    localStorage.setItem(LAST_ACTIVE_KEY, new Date().toDateString())
  }

  const addXp = (amount: number, onLevelUp?: (level: number) => void) => {
    let currentXp = xp + amount
    let currentLevel = level
    let leveledUp = false

    while (currentXp >= 100) {
      currentXp -= 100
      currentLevel += 1
      leveledUp = true
    }

    if (leveledUp && onLevelUp) {
      onLevelUp(currentLevel)
    }

    saveState(currentXp, currentLevel, streak, badges)
    return { xp: currentXp, level: currentLevel, leveledUp }
  }

  const recordTaskCompletion = (
    estimatedMinutes: number,
    importance: number,
    onLevelUp?: (level: number) => void,
    onBadgeUnlocked?: (badgeName: string) => void
  ) => {
    // 1. Calculate XP: base 10 XP + complexity metrics
    const base = 15
    const importanceWeight = importance * 5
    const effortWeight = Math.min(20, Math.floor(estimatedMinutes * 0.2))
    const earnedXp = base + importanceWeight + effortWeight

    // 2. Track Streaks
    const todayStr = new Date().toDateString()
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString()
    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY)
    
    let newStreak = streak
    if (!lastActiveStr) {
      newStreak = 1
    } else if (lastActiveStr === yesterdayStr) {
      newStreak = streak + 1
    } else if (lastActiveStr !== todayStr) {
      // Was broken, reset to 1
      newStreak = 1
    }
    // If lastActiveStr === todayStr, streak remains the same

    // 3. Evaluate Badge unlocking conditions
    const updatedBadges = [...badges]
    const checkAndUnlock = (badgeId: string) => {
      if (!updatedBadges.includes(badgeId)) {
        updatedBadges.push(badgeId)
        const badge = BADGES.find(b => b.id === badgeId)
        if (badge && onBadgeUnlocked) {
          onBadgeUnlocked(badge.name)
        }
      }
    }

    // Badge 1: First Victory
    checkAndUnlock('first_task')

    // Badge 2: Early Bird (completed before 9am)
    const hour = new Date().getHours()
    if (hour < 9) {
      checkAndUnlock('early_bird')
    }

    // Badge 3: Deep Work Master (estimate >= 60m)
    if (estimatedMinutes >= 60) {
      checkAndUnlock('deep_work')
    }

    // Badge 4: Speed Demon (estimate <= 15m)
    if (estimatedMinutes <= 15) {
      checkAndUnlock('speed_demon')
    }

    // Badge 5: Streak 3
    if (newStreak >= 3) {
      checkAndUnlock('streak_3')
    }

    // Calculate XP updates
    let currentXp = xp + earnedXp
    let currentLevel = level
    let leveledUp = false

    while (currentXp >= 100) {
      currentXp -= 100
      currentLevel += 1
      leveledUp = true
    }

    if (leveledUp && onLevelUp) {
      onLevelUp(currentLevel)
    }

    // Badge 6: Level 5 Elite
    if (currentLevel >= 5) {
      if (!updatedBadges.includes('level_5')) {
        updatedBadges.push('level_5')
        const badge = BADGES.find(b => b.id === 'level_5')
        if (badge && onBadgeUnlocked) {
          onBadgeUnlocked(badge.name)
        }
      }
    }

    saveState(currentXp, currentLevel, newStreak, updatedBadges)
    return { earnedXp, leveledUp }
  }

  return {
    xp,
    level,
    streak,
    badges,
    recordTaskCompletion,
    addXp
  }
}
