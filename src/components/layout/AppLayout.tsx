import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import Sidebar from './Sidebar'
import './AppLayout.css'
import PageMeta from '../common/PageMeta'
import { categories, defaultMeta, legacyPathToToolId, standaloneTools } from '../../config/tools'
import { ensureUsageMigration, incrementCategoryUsage, incrementSubToolUsage } from '../../utils/toolUsageStats'

function resolveMeta(pathname: string) {
  for (const category of categories) {
    if (pathname.startsWith(`${category.path}/`)) {
      const slug = pathname.slice(category.path.length + 1)
      const sub = category.tools.find((tool) => tool.slug === slug) ?? category.tools[0]
      return { title: sub.title, description: sub.description }
    }
  }

  const standalone = standaloneTools.find((tool) => tool.path === pathname)
  if (standalone) return { title: standalone.title, description: standalone.description }

  return defaultMeta
}


function resolveStandaloneToolId(pathname: string) {
  const standalone = standaloneTools.find((tool) => tool.path === pathname)
  return standalone?.id ?? null
}

function resolveCategoryId(pathname: string) {
  const match = categories.find((category) => pathname === category.path || pathname.startsWith(`${category.path}/`))
  return match?.id ?? null
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const routeMeta = useMemo(() => resolveMeta(pathname), [pathname])

  useEffect(() => {
    ensureUsageMigration(legacyPathToToolId)
  }, [])

  useEffect(() => {
    const categoryId = resolveCategoryId(pathname)
    if (categoryId) {
      incrementCategoryUsage(categoryId)
      return
    }

    const standaloneToolId = resolveStandaloneToolId(pathname)
    if (standaloneToolId) {
      incrementSubToolUsage(standaloneToolId)
    }
  }, [pathname])

  return (
    <div className="app-layout">
      <PageMeta title={routeMeta.title} description={routeMeta.description} path={pathname} />
      <Sidebar />
      <main className="app-content">
        <div className="tool-page">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
