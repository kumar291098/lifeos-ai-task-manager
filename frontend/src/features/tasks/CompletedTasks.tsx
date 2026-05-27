import { Check } from 'lucide-react'
import type { Task } from '../../types/task'

export function CompletedTasks({ tasks }: { tasks: Task[] }) {
  return (
    <section className="panel completed-panel">
      <div className="completed-heading">
        <div>
          <p className="eyebrow">Progress</p>
          <h2>Completed</h2>
        </div>
        <span>{tasks.length} finished</span>
      </div>
      {tasks.length === 0 ? (
        <p className="completed-empty">Finished tasks will appear here, so completion feels visible instead of disappearing.</p>
      ) : (
        <div className="completed-list">
          {tasks.slice(0, 6).map((task) => (
            <div className="completed-item" key={task.id}>
              <span className="checkmark"><Check size={16} /></span>
              <div>
                <strong>{task.title}</strong>
                <span>{task.completedAt ? `Completed ${new Date(task.completedAt).toLocaleString()}` : 'Completed'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
