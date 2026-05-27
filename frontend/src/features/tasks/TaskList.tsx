import { Button, Space, Tag } from 'antd'
import { CheckCircle2, Edit3, ExternalLink, GripVertical, Trash2, Play } from 'lucide-react'
import type { Task } from '../../types/task'

type TaskListProps = {
  tasks: Task[]
  draggedId: number | null
  onDragStart: (id: number) => void
  onDrop: (id: number) => void
  onEdit: (task: Task) => void
  onComplete: (task: Task) => void
  onDelete: (id: number) => void
  onAcknowledge: (id: number) => void
  onLaunchZen: (task: Task) => void
}

export function TaskList(props: TaskListProps) {
  const { tasks, draggedId, onDragStart, onDrop, onEdit, onComplete, onDelete, onAcknowledge, onLaunchZen } = props

  const getCategory = (task: Task) => {
    const title = task.title.toLowerCase()
    const notes = (task.notes || '').toLowerCase()
    if (title.includes('work') || title.includes('release') || title.includes('code') || title.includes('bug') || title.includes('job') || title.includes('office') || title.includes('client') || notes.includes('meeting')) {
      return 'Work'
    }
    if (title.includes('gym') || title.includes('run') || title.includes('health') || title.includes('sleep') || title.includes('workout') || title.includes('meditat') || title.includes('doctor')) {
      return 'Health'
    }
    if (title.includes('study') || title.includes('read') || title.includes('learn') || title.includes('course') || title.includes('book') || title.includes('tutorial')) {
      return 'Learning'
    }
    return 'Personal'
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Work': return 'blue'
      case 'Health': return 'emerald'
      case 'Learning': return 'orange'
      default: return 'purple'
    }
  }

  return (
    <section className="panel task-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Priority Queue</p>
          <h2>Active Tasks</h2>
          <p className="panel-subtitle">Drag a row to reorder, then jump straight into its saved links.</p>
        </div>
        <span className="count-pill">{tasks.length} open</span>
      </div>

      <div className="task-list">
        {tasks.length === 0 && (
          <div className="empty-state">
            <strong>No active tasks</strong>
            <span>Add a new task or enjoy the clean board.</span>
          </div>
        )}

        {tasks.map((task, index) => {
          const category = getCategory(task)
          const catColor = getCategoryColor(category)
          
          // Glow class based on AI priority
          let glowClass = ''
          if (task.aiScore >= 80) {
            glowClass = 'priority-glow-danger'
          } else if (task.aiScore >= 55) {
            glowClass = 'priority-glow-warning'
          }

          return (
            <article
              className={`task-row alert-${task.alertLevel.toLowerCase()} ${glowClass} ${draggedId === task.id ? 'is-dragging' : ''}`}
              key={task.id}
              draggable
              onDragStart={() => onDragStart(task.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDrop(task.id)}
            >
              <div className="task-rank" aria-label="Drag task">
                <GripVertical size={16} />
                <span>{index + 1}</span>
              </div>
              <div className="task-main">
                <div className="task-title-line">
                  <h3>{task.title}</h3>
                  <Tag color={task.aiScore >= 80 ? 'red' : task.aiScore >= 55 ? 'orange' : 'blue'}>
                    AI {task.aiScore}
                  </Tag>
                  <Tag color={catColor}>{category}</Tag>
                  {task.alertLevel !== 'NONE' && <Tag color="gold">{task.alertLevel.replace('_', ' ')}</Tag>}
                </div>
                <p>{task.aiReason}</p>
                {task.notes && <p className="task-notes">{task.notes}</p>}
                {task.links.length > 0 && (
                  <div className="link-list">
                    {task.links.map((link) => (
                      <a href={link.url} target="_blank" rel="noreferrer" key={`${task.id}-${link.url}`}>
                        <ExternalLink size={12} />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
                <div className="meta-line">
                  <span>Due {task.deadline}</span>
                  <span>Importance {task.importance}/5</span>
                  <span>{task.estimatedMinutes} min</span>
                  <span>{task.recurrence.toLowerCase()}</span>
                </div>
              </div>
              <div className="row-actions">
                <Space size={6} wrap>
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    style={{ background: '#38bdf8', color: '#0f172a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    icon={<Play size={12} style={{ fill: '#0f172a' }} />}
                    title="Start Zen Focus Mode"
                    onClick={() => onLaunchZen(task)}
                  />
                  {task.alertLevel === 'REMINDER' && <Button size="small" onClick={() => onAcknowledge(task.id)}>Ack</Button>}
                  <Button type="text" size="small" icon={<Edit3 size={12} />} onClick={() => onEdit(task)}>Edit</Button>
                  <Button type="primary" size="small" icon={<CheckCircle2 size={12} />} onClick={() => onComplete(task)}>Done</Button>
                  <Button danger type="text" size="small" icon={<Trash2 size={12} />} onClick={() => onDelete(task.id)}>Delete</Button>
                </Space>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
