import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/useTheme'

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      className={`theme-toggle ${compact ? 'theme-toggle--compact' : ''}`}
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
    >
      <span className="theme-toggle-icon">{dark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}</span>
      {!compact ? <span><strong>{dark ? 'Tema claro' : 'Tema escuro'}</strong><small>{dark ? 'Aumentar luminosidade' : 'Reduzir luminosidade'}</small></span> : null}
    </button>
  )
}
