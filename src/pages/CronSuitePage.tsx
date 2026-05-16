import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SuiteTabs from '../components/layout/SuiteTabs'
import { categories } from '../config/tools'
import { incrementSubToolUsage } from '../utils/toolUsageStats'
import CronExpressionHelperTool from '../tools/CronExpressionHelperTool'
import CronBuilderTool from '../tools/CronBuilderTool'

const category = categories.find((item) => item.id === 'cron')!

export default function CronSuitePage() {
  const { tool } = useParams()
  const navigate = useNavigate()

  const activeTool = category.tools.find((item) => item.slug === tool) ?? category.tools[0]

  useEffect(() => {
    if (!tool || !category.tools.some((item) => item.slug === tool)) {
      navigate(`${category.path}/${category.defaultToolSlug}`, { replace: true })
      return
    }
    incrementSubToolUsage(activeTool.id)
  }, [tool, activeTool.id, navigate])

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>{category.name}</h1>
      <p>{category.description}</p>
      <SuiteTabs category={category} />
      {activeTool.slug === 'helper' && <CronExpressionHelperTool />}
      {activeTool.slug === 'builder' && <CronBuilderTool />}
    </div>
  )
}
