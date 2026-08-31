import { FileCheck2, Files, LayoutDashboard, Menu, ScanText, Upload, UsersRound, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { label: 'Enviar documentos', to: '/upload', icon: Upload },
  { label: 'Conferência', to: '/review', icon: FileCheck2 },
  { label: 'Documentos', to: '/documents', icon: Files },
  { label: 'Pessoas', to: '/people', icon: UsersRound },
]

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <Brand />
        <div className="mobile-actions"><ThemeToggle compact /><button className="icon-button" type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button></div>
      </header>

      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <Brand />
        <p className="nav-section-label">Operação documental</p>
        <nav aria-label="Navegação principal">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}>
              <Icon size={19} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer"><ThemeToggle /><div className="sidebar-user" aria-label="Sessão demonstrativa">
          <span className="avatar" aria-hidden="true">AS</span>
          <span><strong>Ana Souza</strong><small>Revisora · sessão fictícia</small></span>
        </div></div>
      </aside>

      {menuOpen && <button className="menu-backdrop" type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
      <main className="main-content"><Outlet /></main>
    </div>
  )
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark"><ScanText size={23} aria-hidden="true" /></span>
      <span className="brand-name"><span><strong>DOC</strong> Intelligence</span><small>Central documental</small></span>
    </div>
  )
}
