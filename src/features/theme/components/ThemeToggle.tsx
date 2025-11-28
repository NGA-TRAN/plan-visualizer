// Theme Toggle Component
// Light/Dark/System theme switcher

import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import { useTheme } from '../hooks/useTheme'
import type { ThemeMode } from '@/types'

export interface ThemeToggleProps {
  variant?: 'button' | 'dropdown'
}

export function ThemeToggle({ variant = 'button' }: ThemeToggleProps) {
  const { mode, resolved, setThemeMode, toggleTheme } = useTheme()

  if (variant === 'button') {
    // toggleTheme updates the app theme (via store) which:
    // 1. Adds/removes 'dark' class on document.documentElement (for Tailwind dark: classes)
    // 2. Updates the store's theme state
    // 3. PlanVisualizerPage subscribes to theme.resolved and passes it to ExcalidrawCanvas
    // 4. ExcalidrawCanvas receives theme prop and passes it to Excalidraw component
    // This ensures both the app UI and Excalidraw panel update together
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleTheme()
          // Force immediate DOM update as backup
          const html = document.documentElement
          const newTheme = resolved === 'light' ? 'dark' : 'light'
          if (newTheme === 'dark') {
            html.classList.add('dark')
          } else {
            html.classList.remove('dark')
          }
        }}
        aria-label={`Switch to ${resolved === 'light' ? 'dark' : 'light'} mode`}
      >
        {resolved === 'light' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>
    )
  }

  // Dropdown variant with all three options
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <ThemeButton
        themeMode="light"
        currentMode={mode}
        onClick={() => setThemeMode('light')}
        icon={<Sun className="h-4 w-4" />}
        label="Light"
      />
      <ThemeButton
        themeMode="dark"
        currentMode={mode}
        onClick={() => setThemeMode('dark')}
        icon={<Moon className="h-4 w-4" />}
        label="Dark"
      />
      <ThemeButton
        themeMode="system"
        currentMode={mode}
        onClick={() => setThemeMode('system')}
        icon={<Monitor className="h-4 w-4" />}
        label="System"
      />
    </div>
  )
}

interface ThemeButtonProps {
  themeMode: ThemeMode
  currentMode: ThemeMode
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function ThemeButton({ themeMode, currentMode, onClick, icon, label }: ThemeButtonProps) {
  const isActive = themeMode === currentMode

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
      )}
      aria-label={`Use ${label} theme`}
      aria-pressed={isActive}
    >
      {icon}
      <span className="sr-only sm:not-sr-only">{label}</span>
    </button>
  )
}

