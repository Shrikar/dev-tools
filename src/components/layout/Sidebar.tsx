import { NavLink } from 'react-router-dom'
import { tools } from '../../config/tools'

export default function Sidebar() {
  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">
        <div className="sidebar-logo">DT</div>
        <div>
          <h1>Dev Tools</h1>
          <p>Browser-only utilities</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {tools.map((tool) => (
          <NavLink
            key={tool.path}
            to={tool.path}
            end={tool.path === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{tool.icon}</span>
            <span>{tool.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">Runs locally in your browser</div>
    </aside>
  )
}
