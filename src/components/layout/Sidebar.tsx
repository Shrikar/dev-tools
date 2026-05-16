import { NavLink } from 'react-router-dom'
import { categories, standaloneTools } from '../../config/tools'

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
        <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-icon">⌂</span>
          <span>Home</span>
        </NavLink>

        {categories.map((category) => (
          <NavLink
            key={category.id}
            to={`${category.path}/${category.defaultToolSlug}`}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{category.icon}</span>
            <span>{category.name}</span>
          </NavLink>
        ))}

        {standaloneTools.map((tool) => (
          <NavLink
            key={tool.id}
            to={tool.path}
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
