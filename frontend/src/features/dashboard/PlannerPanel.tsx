import type { PlannerItem } from '../../types/task'

export function PlannerPanel({ items }: { items: PlannerItem[] }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Today</p>
          <h2>Daily Planner</h2>
        </div>
        <span>9:00 start</span>
      </div>
      <div className="timeline">
        {items.map((item) => (
          <div className="timeline-item" key={`${item.startTime}-${item.task.id}`}>
            <time>{item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}</time>
            <strong>{item.task.title}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}
