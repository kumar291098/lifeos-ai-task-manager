import { Button, Input, InputNumber, Select } from 'antd'
import { Plus, Save, Trash2, X } from 'lucide-react'
import type { TaskForm } from '../../types/task'
import { emptyLink } from '../../lib/forms'

type TaskFormPanelProps = {
  form: TaskForm
  editing: boolean
  onChange: (form: TaskForm) => void
  onCancelEdit: () => void
  onSubmit: () => void
}

export function TaskFormPanel({ form, editing, onChange, onCancelEdit, onSubmit }: TaskFormPanelProps) {
  function updateLink(index: number, field: 'label' | 'url', value: string) {
    onChange({
      ...form,
      links: form.links.map((link, linkIndex) => (linkIndex === index ? { ...link, [field]: value } : link)),
    })
  }

  function removeLink(index: number) {
    const nextLinks = form.links.filter((_, linkIndex) => linkIndex !== index)
    onChange({ ...form, links: nextLinks.length > 0 ? nextLinks : [emptyLink()] })
  }

  return (
    <form className="panel form-panel" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Capture</p>
          <h2>{editing ? 'Edit Task' : 'New Task'}</h2>
        </div>
        {editing && (
          <Button type="text" icon={<X size={16} />} onClick={onCancelEdit}>
            Clear
          </Button>
        )}
      </div>

      <label>
        Task
        <Input value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} required />
      </label>
      <label>
        Notes
        <Input.TextArea rows={3} value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} />
      </label>

      <div className="link-fieldset">
        <div className="link-fieldset-heading">
          <span className="field-label">Links</span>
          <Button size="small" icon={<Plus size={14} />} onClick={() => onChange({ ...form, links: [...form.links, emptyLink()] })}>
            Add link
          </Button>
        </div>
        {form.links.map((link, index) => (
          <div className="link-editor" key={index}>
            <Input placeholder="Label" value={link.label} onChange={(event) => updateLink(index, 'label', event.target.value)} />
            <Input placeholder="https://example.com" value={link.url} onChange={(event) => updateLink(index, 'url', event.target.value)} />
            <Button aria-label="Remove link" danger type="text" icon={<Trash2 size={16} />} onClick={() => removeLink(index)} />
          </div>
        ))}
      </div>

      <div className="form-grid">
        <label>
          Importance
          <InputNumber min={1} max={5} value={form.importance} onChange={(value) => onChange({ ...form, importance: Number(value) || 1 })} />
        </label>
        <label>
          Minutes
          <InputNumber min={5} step={5} value={form.estimatedMinutes} onChange={(value) => onChange({ ...form, estimatedMinutes: Number(value) || 5 })} />
        </label>
      </div>
      <label>
        Deadline
        <Input type="date" value={form.deadline} onChange={(event) => onChange({ ...form, deadline: event.target.value })} required />
      </label>
      <label>
        Reminder
        <Input type="datetime-local" value={form.reminderAt} onChange={(event) => onChange({ ...form, reminderAt: event.target.value })} />
      </label>
      <label>
        Recurring
        <Select
          options={[
            { value: 'NONE', label: 'None' },
            { value: 'DAILY', label: 'Daily' },
            { value: 'WEEKLY', label: 'Weekly' },
            { value: 'MONTHLY', label: 'Monthly' },
          ]}
          value={form.recurrence}
          onChange={(value) => onChange({ ...form, recurrence: value as TaskForm['recurrence'] })}
        />
      </label>
      <Button type="primary" htmlType="submit" icon={editing ? <Save size={16} /> : <Plus size={16} />}>
        {editing ? 'Save Changes' : 'Add Task'}
      </Button>
    </form>
  )
}
