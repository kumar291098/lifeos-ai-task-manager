import { Alert, Button, Card, ConfigProvider, Space, Typography, theme as antTheme } from 'antd'
import { useEffect, useState } from 'react'
import { AlertCircle, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import './App.css'
import { taskApi } from './api/tasks'
import { MetricCard } from './components/MetricCard'
import { ThemeToggle } from './components/ThemeToggle'
import { AnalyticsPanel } from './features/dashboard/AnalyticsPanel'
import { PlannerPanel } from './features/dashboard/PlannerPanel'
import { RecommendationPanel } from './features/dashboard/RecommendationPanel'
import { CompletedTasks } from './features/tasks/CompletedTasks'
import { TaskFormPanel } from './features/tasks/TaskFormPanel'
import { TaskList } from './features/tasks/TaskList'
import { useDashboard } from './hooks/useDashboard'
import { emptyForm, toForm } from './lib/forms'
import { THEME_KEY, getInitialTheme, type ThemeMode } from './lib/theme'
import type { Task, TaskForm } from './types/task'

// New imports for premium features
import { useGamification } from './hooks/useGamification'
import { BadgesPanel } from './components/BadgesPanel'
import { ZenFocusRoom } from './components/ZenFocusRoom'
import { CommandPalette } from './components/CommandPalette'

export default function App() {
  const { dashboard, openTasks, completedTasks, loading, error, setError, refresh } = useDashboard()
  const [form, setForm] = useState<TaskForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  // Gamification state
  const { xp, level, streak, badges, recordTaskCompletion } = useGamification()

  // Zen Mode & Command Palette state
  const [zenTask, setZenTask] = useState<Task | null>(null)
  const [cmdPaletteVisible, setCmdPaletteVisible] = useState<boolean>(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // Register global Cmd+K shortcut
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdPaletteVisible((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleGlobalKeys)
    return () => window.removeEventListener('keydown', handleGlobalKeys)
  }, [])

  async function runAction(action: () => Promise<void>, failure: string) {
    try {
      setError(null)
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : failure)
    }
  }

  async function saveTask() {
    await runAction(async () => {
      if (editingId) {
        await taskApi.update(editingId, form)
      } else {
        await taskApi.create(form)
      }
      setNotice(editingId ? 'Task updated.' : 'Task added to your active list.')
      setEditingId(null)
      setForm(emptyForm())
      await refresh()
    }, 'Could not save task. Check required fields.')
  }

  async function completeTask(task: Task) {
    await runAction(async () => {
      await taskApi.complete(task.id)
      
      // Calculate and trigger gamification awards
      const result = recordTaskCompletion(
        task.estimatedMinutes,
        task.importance,
        (newLvl) => {
          // Level Up callback
          setNotice(`🎉 LEVEL UP! You reached Level ${newLvl}! Keep crushing it!`)
          // Large level up confetti blast
          confetti({
            particleCount: 160,
            spread: 80,
            origin: { y: 0.55 }
          })
        },
        (badgeName) => {
          // Achievement unlocked callback
          setNotice(`🏆 ACHIEVEMENT UNLOCKED: "${badgeName}"! Check your collection below!`)
        }
      )

      // Play normal completion confetti if it wasn't a level up
      if (!result.leveledUp) {
        setNotice(`"${task.title}" completed. +${result.earnedXp} XP earned!`)
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        })
      }

      await refresh()
    }, 'Could not complete this task. Please try again.')
  }

  async function deleteTask(id: number) {
    await runAction(async () => {
      await taskApi.delete(id)
      setNotice('Task deleted.')
      await refresh()
    }, 'Could not delete this task.')
  }

  async function acknowledge(id: number) {
    await runAction(async () => {
      await taskApi.acknowledge(id)
      await refresh()
    }, 'Could not acknowledge this reminder.')
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
    await runAction(async () => {
      await taskApi.reorder(ids)
      await refresh()
    }, 'Could not reorder tasks.')
  }

  function edit(task: Task) {
    setEditingId(task.id)
    setForm(toForm(task))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
  }

  const analytics = dashboard?.analytics

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: theme === 'dark' ? '#38bdf8' : '#0284c7',
          borderRadius: 12,
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      }}
    >
      <main className="app-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">LifeOS</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <h1>Smart Task Manager</h1>
              {streak > 0 && (
                <div className="streak-widget" title={`${streak} Consecutive Active Days!`}>
                  🔥 {streak} day streak
                </div>
              )}
            </div>
            <Typography.Text type="secondary">
              Plan priorities, save useful links, and press <kbd style={{ background: 'var(--surface-soft)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.8rem', fontWeight: 'bold' }}>Ctrl + K</kbd> for shortcuts.
            </Typography.Text>
          </div>
          <Space className="topbar-actions" align="center" wrap>
            {/* Gamified level bar */}
            <div className="xp-header" title={`XP: ${xp}/100 to next level`}>
              <span>LVL {level}</span>
              <div className="xp-bar-container">
                <div className="xp-bar-fill" style={{ width: `${xp}%` }} />
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{xp}%</span>
            </div>

            <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
            <Card className="score-card" size="small" style={{ minWidth: 100, padding: '4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <strong style={{ fontSize: '1.4rem', display: 'block', fontWeight: 800 }}>{analytics?.completionRate ?? 0}%</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>completion</span>
            </Card>
          </Space>
        </header>

        {error && (
          <Alert type="error" showIcon icon={<AlertCircle size={18} />} message={error} className="app-alert" />
        )}
        {notice && (
          <Alert type="success" showIcon icon={<Sparkles size={18} />} message={notice} closable onClose={() => setNotice(null)} className="app-alert" />
        )}

        {loading || !dashboard || !analytics ? (
          <div className="status-screen">Loading smart workspace...</div>
        ) : (
          <>
            <RecommendationPanel task={dashboard.recommendation} />

            <section className="quick-stats">
              <MetricCard label="Active tasks" value={analytics.openTasks} />
              <MetricCard label="Completed" value={analytics.completedTasks} />
              <MetricCard label="Overdue" value={analytics.overdueTasks} />
              <MetricCard label="Focus minutes" value={analytics.remainingFocusMinutes} />
            </section>

            <div className="workspace">
              <div className="main-stack">
                <TaskList
                  tasks={openTasks}
                  draggedId={draggedId}
                  onDragStart={setDraggedId}
                  onDrop={(id) => void reorder(id)}
                  onEdit={edit}
                  onComplete={(task) => void completeTask(task)}
                  onDelete={(id) => void deleteTask(id)}
                  onAcknowledge={(id) => void acknowledge(id)}
                  onLaunchZen={(task) => setZenTask(task)}
                />
                <CompletedTasks tasks={completedTasks} />
              </div>

              <aside className="side-stack">
                <TaskFormPanel
                  form={form}
                  editing={editingId !== null}
                  onChange={setForm}
                  onCancelEdit={cancelEdit}
                  onSubmit={() => void saveTask()}
                />
                <PlannerPanel items={dashboard.dailyPlan} />
                <AnalyticsPanel
                  analytics={analytics}
                  completedTasks={completedTasks}
                  activeTasks={openTasks}
                />
                <BadgesPanel unlockedBadgeIds={badges} />
                <Button onClick={() => void refresh()}>Refresh dashboard</Button>
              </aside>
            </div>
          </>
        )}

        {/* Full Screen Zen Timer overlay */}
        {zenTask && (
          <ZenFocusRoom
            task={zenTask}
            onClose={() => setZenTask(null)}
            onComplete={() => {
              const taskToComplete = zenTask
              setZenTask(null)
              void completeTask(taskToComplete)
            }}
          />
        )}

        {/* Global Quick Action Command Palette */}
        {dashboard && (
          <CommandPalette
            visible={cmdPaletteVisible}
            onClose={() => setCmdPaletteVisible(false)}
            activeTasks={openTasks}
            onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onLaunchZen={(task) => setZenTask(task)}
            onRefresh={() => void refresh()}
          />
        )}
      </main>
    </ConfigProvider>
  )
}
