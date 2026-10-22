import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { initials } from '../../utils/format.js'

const NAV_ITEMS = [
  { to: '/', label: 'Visão geral', end: true },
  { to: '/pacientes', label: 'Pacientes' },
  { to: '/agendamentos', label: 'Agendamentos' },
  { to: '/profissionais', label: 'Profissionais' },
]

const ROLE_LABELS = {
  admin: 'Administração',
  medico: 'Corpo clínico',
  recepcao: 'Recepção',
}

export default function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">+</span>
          <div>
            <strong>Clínica Vida Plena</strong>
            <small>gestão de atendimentos</small>
          </div>
        </div>

        <nav className="nav">
          <span className="nav-label">Operação</span>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{initials(user?.name || '')}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{ROLE_LABELS[user?.role] || 'Equipe'}</small>
            </div>
          </div>
          <button type="button" className="logout-button" onClick={logout}>
            Sair da conta
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
