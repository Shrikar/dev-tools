import { NavLink } from 'react-router-dom'
import type { CategoryConfig } from '../../config/tools'

interface SuiteTabsProps {
  category: CategoryConfig
}

export default function SuiteTabs({ category }: SuiteTabsProps) {
  return (
    <div className="tool-actions" style={{ marginTop: 0 }}>
      {category.tools.map((tool) => (
        <NavLink
          key={tool.id}
          to={`${category.path}/${tool.slug}`}
          className={({ isActive }) => `tool-button${isActive ? '' : ' secondary'}`}
          style={{ textDecoration: 'none' }}
        >
          {tool.name}
        </NavLink>
      ))}
    </div>
  )
}
