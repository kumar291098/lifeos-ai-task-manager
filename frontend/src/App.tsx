import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Recurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
type AlertLevel = 'NONE' | 'REMINDER' | 'DUE_TODAY' | 'OVERDUE'

type Task = {
  id: number
  title: string
  notes: string | null
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

type PlannerItem = {
  startTime: string
  endTime: string
  task: Task
}

type Analytics = {
  totalTasks: number
  openTasks: number
  completedTasks: number
  overdueTasks: number
  completionRate: number
  remainingFocusMinutes: number
  bestNextAction: string
}

type Dashboard = {
  tasks: Task[]
  recommendation: Task | null
  dailyPlan: PlannerItem[]
  analytics: Analytics
  alerts: Task[]
}

type TaskForm = {
  title: string
  notes: string
  importance: number
  deadline: string
  reminderAt: string
  recurrence: Recurrence
  estimatedMinutes: number
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api'
const THEME_KEY = 'lifeos-theme'
type Theme = 'light' | 'dark'

const emptyForm = (): TaskForm => ({
  title: '',
  notes: '',
  importance: 3,
  deadline: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  reminderAt: '',
  recurrence: 'NONE',
  estimatedMinutes: 45,
})

function toForm(task: Task): TaskForm {
  return {
    title: task.title,
    notes: task.notes ?? '',
    importance: task.importance,
    deadline: task.deadline,
    reminderAt: task.reminderAt ? task.reminderAt.slice(0, 16) : '',
    recurrence: task.recurrence,
    estimatedMinutes: task.estimatedMinutes,
  }
}

function toPayload(form: TaskForm) {
  return {
    ...form,
    notes: form.notes.trim(),
    reminderAt: form.reminderAt ? form.reminderAt : null,
  }
}

export default function App() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [form, setForm] = useState<TaskForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const openTasks = useMemo(() => dashboard?.tasks.filter((task) => !task.completed) ?? [], [dashboard])
  const completedTasks = useMemo(() => dashboard?.tasks.filter((task) => task.completed) ?? [], [dashboard])

  async function loadDashboard() {
    setError(null)
    const response = await fetch(`${API}/dashboard`)
    if (!response.ok) {
      throw new Error('Backend is not responding yet')
    }
    setDashboard(await response.json())
    setLoading(false)
  }

  useEffect(() => {
    loadDashboard().catch((err: Error) => {
      setError(err.message)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = await fetch(editingId ? `${API}/tasks/${editingId}` : `${API}/tasks`, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toPayload(form)),
    })
    if (!response.ok) {
      setError('Could not save task. Check required fields.')
      return
    }
    setForm(emptyForm())
    setEditingId(null)
    await loadDashboard()
  }

  async function completeTask(id: number) {
    await fetch(`${API}/tasks/${id}/complete`, { method: 'PATCH' })
    await loadDashboard()
  }

  async function deleteTask(id: number) {
    await fetch(`${API}/tasks/${id}`, { method: 'DELETE' })
    await loadDashboard()
  }

  async function acknowledge(id: number) {
    await fetch(`${API}/tasks/${id}/acknowledge-reminder`, { method: 'PATCH' })
    await loadDashboard()
  }

  async function reorder(dropId: number) {
    if (!dashboard || draggedId === null || draggedId === dropId) {
      return
    }
    const ids = dashboard.tasks.map((task) => task.id)
    const from = ids.indexOf(draggedId)
    const to = ids.indexOf(dropId)
    ids.splice(to, 0, ids.splice(from, 1)[0])
    setDraggedId(null)
    await fetch(`${API}/tasks/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: ids }),
    })
    await loadDashboard()
  }

  function edit(task: Task) {
    setEditingId(task.id)
    setForm(toForm(task))
  }

  if (loading) {
    return <main className="app-shell status-screen">Loading smart workspace...</main>
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">LifeOS</p>
          <h1>Smart Task Manager</h1>
        </div>
        <div className="topbar-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="score-card">
            <span>{dashboard?.analytics.completionRate ?? 0}%</span>
            <small>completion</small>
          </div>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="recommendation">
        <div>
          <p className="eyebrow">AI recommendation</p>
          <h2>
            {dashboard?.recommendation
              ? `Complete "${dashboard.recommendation.title}" first`
              : 'All tasks are complete'}
          </h2>
          <p>
            {dashboard?.recommendation
              ? `Because ${dashboard.recommendation.aiReason}.`
              : 'Your board is clear. Add a task when the next priority appears.'}
          </p>
        </div>
        {dashboard?.recommendation && (
          <div className="priority-meter">
            <span>{dashboard.recommendation.aiScore}</span>
            <small>AI priority</small>
          </div>
        )}
      </section>

      <div className="workspace">
        <section className="panel task-panel">
          <div className="panel-heading">
            <h2>Tasks</h2>
            <span>{openTasks.length} open</span>
          </div>
          <div className="task-list">
            {openTasks.map((task) => (
              <article
                className={`task-row alert-${task.alertLevel.toLowerCase()}`}
                key={task.id}
                draggable
                onDragStart={() => setDraggedId(task.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => reorder(task.id)}
              >
                <div className="drag-handle">::</div>
                <div className="task-main">
                  <div className="task-title-line">
                    <h3>{task.title}</h3>
                    <span className="pill">{task.aiScore}</span>
                  </div>
                  <p>{task.aiReason}</p>
                  <div className="meta-line">
                    <span>Due {task.deadline}</span>
                    <span>Importance {task.importance}/5</span>
                    <span>{task.estimatedMinutes} min</span>
                    <span>{task.recurrence.toLowerCase()}</span>
                  </div>
                </div>
                <div className="row-actions">
                  {task.alertLevel === 'REMINDER' && <button onClick={() => acknowledge(task.id)}>Ack</button>}
                  <button onClick={() => edit(task)}>Edit</button>
                  <button onClick={() => completeTask(task.id)}>Done</button>
                  <button className="ghost" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>

          {completedTasks.length > 0 && (
            <details className="completed">
              <summary>{completedTasks.length} completed</summary>
              {completedTasks.map((task) => <p key={task.id}>{task.title}</p>)}
            </details>
          )}
        </section>

        <aside className="side-stack">
          <form className="panel form-panel" onSubmit={saveTask}>
            <div className="panel-heading">
              <h2>{editingId ? 'Edit Task' : 'New Task'}</h2>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm()) }}>Clear</button>}
            </div>
            <label>
              Task
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            </label>
            <label>
              Notes
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
            <div className="form-grid">
              <label>
                Importance
                <input type="number" min="1" max="5" value={form.importance} onChange={(event) => setForm({ ...form, importance: Number(event.target.value) })} />
              </label>
              <label>
                Minutes
                <input type="number" min="5" step="5" value={form.estimatedMinutes} onChange={(event) => setForm({ ...form, estimatedMinutes: Number(event.target.value) })} />
              </label>
            </div>
            <label>
              Deadline
              <input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} required />
            </label>
            <label>
              Reminder
              <input type="datetime-local" value={form.reminderAt} onChange={(event) => setForm({ ...form, reminderAt: event.target.value })} />
            </label>
            <label>
              Recurring
              <select value={form.recurrence} onChange={(event) => setForm({ ...form, recurrence: event.target.value as Recurrence })}>
                <option value="NONE">None</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </label>
            <button className="primary" type="submit">{editingId ? 'Save Changes' : 'Add Task'}</button>
          </form>

          <section className="panel">
            <div className="panel-heading">
              <h2>Daily Planner</h2>
              <span>9:00 start</span>
            </div>
            <div className="timeline">
              {dashboard?.dailyPlan.map((item) => (
                <div className="timeline-item" key={`${item.startTime}-${item.task.id}`}>
                  <time>{item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}</time>
                  <strong>{item.task.title}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel analytics">
            <div className="panel-heading">
              <h2>Analytics</h2>
            </div>
            <div className="metric-grid">
              <Metric label="Open" value={dashboard?.analytics.openTasks ?? 0} />
              <Metric label="Overdue" value={dashboard?.analytics.overdueTasks ?? 0} />
              <Metric label="Focus min" value={dashboard?.analytics.remainingFocusMinutes ?? 0} />
              <Metric label="Done" value={dashboard?.analytics.completedTasks ?? 0} />
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}
