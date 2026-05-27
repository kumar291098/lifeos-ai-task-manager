export type Recurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
export type AlertLevel = 'NONE' | 'REMINDER' | 'DUE_TODAY' | 'OVERDUE'

export type TaskLink = {
  label: string
  url: string
}

export type Task = {
  id: number
  title: string
  notes: string | null
  links: TaskLink[]
  importance: number
  deadline: string
  reminderAt: string | null
  recurrence: Recurrence
  estimatedMinutes: number
  completed: boolean
  completedAt: string | null
  manualOrder: number
  aiScore: number
  aiReason: string
  alertLevel: AlertLevel
}

export type PlannerItem = {
  startTime: string
  endTime: string
  task: Task
}

export type Analytics = {
  totalTasks: number
  openTasks: number
  completedTasks: number
  overdueTasks: number
  completionRate: number
  remainingFocusMinutes: number
  bestNextAction: string
}

export type Dashboard = {
  tasks: Task[]
  recommendation: Task | null
  dailyPlan: PlannerItem[]
  analytics: Analytics
  alerts: Task[]
}

export type TaskForm = {
  title: string
  notes: string
  links: TaskLink[]
  importance: number
  deadline: string
  reminderAt: string
  recurrence: Recurrence
  estimatedMinutes: number
}
