import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import './AppLayout.css'
import PageMeta from '../common/PageMeta'
import { defaultMeta, tools } from '../../config/tools'
import { incrementToolUsage } from '../../utils/toolUsageStats'

export default function AppLayout() {
  const { pathname } = useLocation()
  const routeMeta = tools.find((tool) => tool.path === pathname)

  useEffect(() => {
    incrementToolUsage(pathname)
  }, [pathname])

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
