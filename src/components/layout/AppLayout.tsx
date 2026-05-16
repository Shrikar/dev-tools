import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import './AppLayout.css'
import PageMeta from '../common/PageMeta'
import { defaultMeta, tools } from '../../config/tools'

export default function AppLayout() {
  const { pathname } = useLocation()
  const routeMeta = tools.find((tool) => tool.path === pathname)

  return (
    <div className="app-layout">
      <PageMeta
        title={routeMeta?.title ?? defaultMeta.title}
        description={routeMeta?.description ?? defaultMeta.description}
        path={pathname}
      />
      <Sidebar />
      <main className="app-content">
        <div className="tool-page">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
