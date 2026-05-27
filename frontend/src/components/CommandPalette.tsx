import { useEffect, useRef, useState } from 'react'
import { Search, SunMoon, Play, RotateCw } from 'lucide-react'
import type { Task } from '../types/task'

interface CommandPaletteProps {
  visible: boolean
  onClose: () => void
  activeTasks: Task[]
  onToggleTheme: () => void
  onLaunchZen: (task: Task) => void
  onClearCompleted?: () => void
  onRefresh: () => void
}

export function CommandPalette({
  visible,
  onClose,
  activeTasks,
  onToggleTheme,
  onLaunchZen,
  onRefresh
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when visible
  useEffect(() => {
    if (visible) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [visible])

  // Handle global keyboard trigger (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (visible) {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible, onClose])

  if (!visible) return null

  // Define commands
  const commands = [
    {
      id: 'cmd-theme',
      label: 'Toggle Theme (Light / Dark)',
      shortcut: 'T',
      icon: <SunMoon size={16} />,
      action: () => {
        onToggleTheme()
        onClose()
      }
    },
    {
      id: 'cmd-refresh',
      label: 'Refresh Dashboard Data',
      shortcut: 'R',
      icon: <RotateCw size={16} />,
      action: () => {
        onRefresh()
        onClose()
      }
    }
  ]

  // Filter tasks based on query
  const filteredTasks = activeTasks.filter(task =>
    task.title.toLowerCase().includes(query.toLowerCase()) ||
    (task.notes || '').toLowerCase().includes(query.toLowerCase())
  )

  // Combined list of items for arrow navigation
  const listItems = [
    ...commands.map(cmd => ({ type: 'command' as const, id: cmd.id, data: cmd })),
    ...filteredTasks.map(task => ({ type: 'task' as const, id: `task-${task.id}`, data: task }))
  ]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % listItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + listItems.length) % listItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = listItems[selectedIndex]
      if (selected) {
        if (selected.type === 'command') {
          selected.data.action()
        } else {
          // Open Zen Mode for task
          onLaunchZen(selected.data)
          onClose()
        }
      }
    }
  }

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-box" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="cmd-input-container">
          <Search size={18} style={{ color: 'var(--subtle)' }} />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type a command or search active tasks..."
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
          />
          <span className="cmd-shortcut">ESC</span>
        </div>

        <div className="cmd-results">
          {listItems.length === 0 ? (
            <div className="cmd-empty">No results found matching "{query}"</div>
          ) : (
            <>
              {/* Commands Section */}
              {listItems.some(item => item.type === 'command') && (
                <>
                  <div className="cmd-group-title">System Actions</div>
                  {listItems.map((item, idx) => {
                    if (item.type !== 'command') return null
                    const cmd = item.data
                    const isSelected = idx === selectedIndex
                    return (
                      <div
                        key={cmd.id}
                        className={`cmd-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          cmd.action()
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <span className="cmd-item-label">
                          {cmd.icon}
                          {cmd.label}
                        </span>
                        <span className="cmd-shortcut">{cmd.shortcut}</span>
                      </div>
                    )
                  })}
                </>
              )}

              {/* Tasks Section */}
              {listItems.some(item => item.type === 'task') && (
                <>
                  <div className="cmd-group-title">Active Tasks (Start Focus Mode)</div>
                  {listItems.map((item, idx) => {
                    if (item.type !== 'task') return null
                    const task = item.data
                    const isSelected = idx === selectedIndex
                    return (
                      <div
                        key={task.id}
                        className={`cmd-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          onLaunchZen(task)
                          onClose()
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <span className="cmd-item-label">
                          <Play size={14} style={{ color: '#38bdf8' }} />
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '340px' }}>
                            {task.title}
                          </span>
                        </span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span className="cmd-shortcut">AI {task.aiScore}</span>
                          <span className="cmd-shortcut" style={{ fontSize: '0.65rem' }}>Focus</span>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
