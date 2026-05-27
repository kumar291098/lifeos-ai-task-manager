import { Button, Tooltip } from 'antd'
import { Moon, Sun } from 'lucide-react'
import type { ThemeMode } from '../lib/theme'

type ThemeToggleProps = {
  theme: ThemeMode
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <Button aria-label="Toggle color theme" size="large" icon={isDark ? <Sun size={18} /> : <Moon size={18} />} onClick={onToggle} />
    </Tooltip>
  )
}
