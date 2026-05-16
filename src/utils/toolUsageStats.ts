const NEW_STORAGE_KEY = 'devtools.toolUsage.v2'
const LEGACY_STORAGE_KEY = 'devtools.toolUsage'

interface UsageStore {
  categoryCounts: Record<string, number>
  toolCounts: Record<string, number>
  migratedLegacy: boolean
}

const emptyStore = (): UsageStore => ({
  categoryCounts: {},
  toolCounts: {},
  migratedLegacy: false,
})

function readStore(): UsageStore {
  if (typeof window === 'undefined') return emptyStore()

  try {
    const raw = window.localStorage.getItem(NEW_STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as UsageStore
    return {
      categoryCounts: parsed.categoryCounts ?? {},
      toolCounts: parsed.toolCounts ?? {},
      migratedLegacy: Boolean(parsed.migratedLegacy),
    }
  } catch {
    return emptyStore()
  }
}

function writeStore(store: UsageStore) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // ignore
  }
}

export function ensureUsageMigration(pathToToolId: Record<string, string>) {
  const store = readStore()
  if (store.migratedLegacy || typeof window === 'undefined') return

  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (raw) {
      const legacy = JSON.parse(raw) as Record<string, number>
      Object.entries(legacy).forEach(([path, count]) => {
        const toolId = pathToToolId[path]
        if (toolId) {
          store.toolCounts[toolId] = (store.toolCounts[toolId] ?? 0) + (Number(count) || 0)
        }
      })
    }
  } catch {
    // ignore
  }

  store.migratedLegacy = true
  writeStore(store)
}

export function incrementCategoryUsage(categoryId: string) {
  if (!categoryId) return
  const store = readStore()
  store.categoryCounts[categoryId] = (store.categoryCounts[categoryId] ?? 0) + 1
  writeStore(store)
}

export function incrementSubToolUsage(toolId: string) {
  if (!toolId) return
  const store = readStore()
  store.toolCounts[toolId] = (store.toolCounts[toolId] ?? 0) + 1
  writeStore(store)
}

export function getSubToolUsageCount(toolId: string): number {
  return readStore().toolCounts[toolId] ?? 0
}

export function getCategoryUsageCount(categoryId: string): number {
  return readStore().categoryCounts[categoryId] ?? 0
}
