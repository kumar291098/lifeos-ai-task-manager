import type { Task, TaskForm } from '../types/task'

export const emptyLink = () => ({ label: '', url: '' })

export const emptyForm = (): TaskForm => ({
  title: '',
  notes: '',
  links: [emptyLink()],
  importance: 3,
  deadline: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  reminderAt: '',
  recurrence: 'NONE',
  estimatedMinutes: 45,
})

export function toForm(task: Task): TaskForm {
  return {
    title: task.title,
    notes: task.notes ?? '',
    links: task.links.length > 0 ? task.links : [emptyLink()],
    importance: task.importance,
    deadline: task.deadline,
    reminderAt: task.reminderAt ? task.reminderAt.slice(0, 16) : '',
    recurrence: task.recurrence,
    estimatedMinutes: task.estimatedMinutes,
  }
}
