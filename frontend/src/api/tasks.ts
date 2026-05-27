import type { Dashboard, Task, TaskForm } from '../types/task'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8082/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!response.ok) {
    throw new Error(response.status === 400 ? 'Please check the task details.' : 'Backend is not responding yet.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function cleanLinks(form: TaskForm) {
  return form.links
    .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
    .filter((link) => link.label && link.url)
}

export function toPayload(form: TaskForm) {
  return {
    ...form,
    notes: form.notes.trim(),
    links: cleanLinks(form),
    reminderAt: form.reminderAt ? form.reminderAt : null,
  }
}

export const taskApi = {
  dashboard: () => request<Dashboard>('/dashboard'),
  create: (form: TaskForm) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(toPayload(form)) }),
  update: (id: number, form: TaskForm) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(toPayload(form)) }),
  complete: (id: number) => request<Task>(`/tasks/${id}/complete`, { method: 'PATCH' }),
  acknowledge: (id: number) => request<Task>(`/tasks/${id}/acknowledge-reminder`, { method: 'PATCH' }),
  delete: (id: number) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  reorder: (orderedIds: number[]) =>
    request<Task[]>('/tasks/reorder', { method: 'POST', body: JSON.stringify({ orderedIds }) }),
}
