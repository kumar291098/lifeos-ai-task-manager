import { useCallback, useEffect, useMemo, useState } from 'react'
import { taskApi } from '../api/tasks'
import type { Dashboard } from '../types/task'

export function useDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      setDashboard(await taskApi.dashboard())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => window.clearTimeout(id)
  }, [refresh])

  const openTasks = useMemo(() => dashboard?.tasks.filter((task) => !task.completed) ?? [], [dashboard])
  const completedTasks = useMemo(() => dashboard?.tasks.filter((task) => task.completed) ?? [], [dashboard])

  return { dashboard, openTasks, completedTasks, loading, error, setError, refresh }
}
