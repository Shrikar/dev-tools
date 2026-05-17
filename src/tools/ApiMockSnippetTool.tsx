import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

const SAMPLE = `{
  "id": 1,
  "userId": 1,
  "title": "delectus aut autem",
  "body": "quia et suscipit suscipit recusandae"
}`

type JsonLike = null | boolean | number | string | JsonLike[] | { [key: string]: JsonLike }

function makeRandomValue(value: JsonLike, key: string, seed: number): JsonLike {
  if (value === null) return null
  if (Array.isArray(value)) {
    if (value.length === 0) return []
    return [makeRandomValue(value[0], key, seed)]
  }
  if (typeof value === 'object') {
    const out: Record<string, JsonLike> = {}
    for (const [childKey, childValue] of Object.entries(value)) {
      out[childKey] = makeRandomValue(childValue, childKey, seed)
    }
    return out
  }
  if (typeof value === 'boolean') return seed % 2 === 0
  if (typeof value === 'number') return seed

  const lowerKey = key.toLowerCase()
  if (lowerKey.includes('email')) return `user${seed}@example.com`
  if (lowerKey.includes('title')) return `Sample title ${seed}`
  if (lowerKey.includes('name')) return `User ${seed}`
  if (lowerKey.includes('body') || lowerKey.includes('description')) return `Generated text for record ${seed}`
  return `value-${seed}`
}

function generateRows(template: JsonLike, total: number) {
  return Array.from({ length: total }, (_, index) => {
    const n = index + 1
    if (template && typeof template === 'object' && !Array.isArray(template)) {
      const base = makeRandomValue(template, 'item', n) as Record<string, JsonLike>
      if ('id' in base) base.id = n
      if ('postId' in base) base.postId = n
      return base
    }
    return makeRandomValue(template, 'item', n)
  })
}

function guessFakerExpression(value: JsonLike, key: string): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return `[${guessFakerExpression(value[0], key)}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value).map(([childKey, childValue]) => `    ${JSON.stringify(childKey)}: ${guessFakerExpression(childValue, childKey)}`)
    return `({\n${entries.join(',\n')}\n  })`
  }
  if (typeof value === 'boolean') return 'faker.datatype.boolean()'
  if (typeof value === 'number') {
    const lowerKey = key.toLowerCase()
    if (lowerKey === 'id') return 'index + 1'
    if (lowerKey.endsWith('id')) return 'faker.number.int({ min: 1, max: 1000 })'
    return 'faker.number.int({ min: 1, max: 10000 })'
  }

  const lowerKey = key.toLowerCase()
  if (lowerKey.includes('email')) return 'faker.internet.email()'
  if (lowerKey.includes('title')) return 'faker.lorem.sentence()'
  if (lowerKey.includes('name')) return 'faker.person.fullName()'
  if (lowerKey.includes('body') || lowerKey.includes('description')) return 'faker.lorem.paragraph()'
  if (lowerKey.includes('url')) return 'faker.internet.url()'
  return 'faker.lorem.word()'
}

function buildSnippet(resource: string, template: JsonLike, count: number) {
  const collection = resource.replace(/^\/+/, '') || 'posts'
  const singular = collection.endsWith('s') ? collection.slice(0, -1) : collection
  const itemFactory = guessFakerExpression(template, singular)

  return `import express from 'express'
import { faker } from '@faker-js/faker'

const app = express()
app.use(express.json())

const ${collection} = Array.from({ length: ${count} }, (_, index) => {
  const item = ${itemFactory}
  if (item && typeof item === 'object' && 'id' in item) item.id = index + 1
  return item
})

function paginate(items, page = 1, limit = 10) {
  const p = Math.max(1, Number(page) || 1)
  const l = Math.max(1, Number(limit) || 10)
  const start = (p - 1) * l
  const data = items.slice(start, start + l)
  return { page: p, limit: l, total: items.length, totalPages: Math.ceil(items.length / l), data }
}

// GET /${collection}
app.get('/${collection}', (req, res) => {
  const { page = 1, limit = 10 } = req.query
  res.json(paginate(${collection}, page, limit))
})

// GET /${collection}/1
app.get('/${collection}/:id', (req, res) => {
  const item = ${collection}.find((x) => Number(x.id) === Number(req.params.id))
  if (!item) return res.status(404).json({ message: '${singular} not found' })
  res.json(item)
})

// GET /${collection}/1/comments
app.get('/${collection}/:id/comments', (req, res) => {
  const postId = Number(req.params.id)
  const comments = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    postId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    body: faker.lorem.sentences(2),
  }))
  res.json(comments)
})

// GET /comments?postId=1
app.get('/comments', (req, res) => {
  const postId = Number(req.query.postId || 1)
  const comments = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    postId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    body: faker.lorem.sentences(2),
  }))
  res.json(comments)
})

// POST /${collection}
app.post('/${collection}', (req, res) => {
  const created = { ...req.body, id: ${collection}.length + 1 }
  ${collection}.push(created)
  res.status(201).json(created)
})

// PUT /${collection}/1
app.put('/${collection}/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = ${collection}.findIndex((x) => Number(x.id) === id)
  if (index === -1) return res.status(404).json({ message: '${singular} not found' })
  ${collection}[index] = { ...req.body, id }
  res.json(${collection}[index])
})

// PATCH /${collection}/1
app.patch('/${collection}/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = ${collection}.findIndex((x) => Number(x.id) === id)
  if (index === -1) return res.status(404).json({ message: '${singular} not found' })
  ${collection}[index] = { ...${collection}[index], ...req.body, id }
  res.json(${collection}[index])
})

// DELETE /${collection}/1
app.delete('/${collection}/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = ${collection}.findIndex((x) => Number(x.id) === id)
  if (index === -1) return res.status(404).json({ message: '${singular} not found' })
  const removed = ${collection}.splice(index, 1)[0]
  res.json(removed)
})

app.listen(3000, () => {
  console.log('Mock API running on http://localhost:3000')
})`
}

export default function ApiMockSnippetTool() {
  const [resource, setResource] = useState('posts')
  const [sampleJson, setSampleJson] = useState(SAMPLE)
  const [total, setTotal] = useState(50)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const parsed = useMemo(() => {
    try {
      const value = JSON.parse(sampleJson) as JsonLike
      return { value, error: '' }
    } catch (err) {
      return { value: null as JsonLike | null, error: (err as Error).message }
    }
  }, [sampleJson])

  const preview = useMemo(() => {
    if (!parsed.value) return null
    const rows = generateRows(parsed.value, Math.max(1, total))
    const safePage = Math.max(1, page)
    const safeLimit = Math.max(1, limit)
    const start = (safePage - 1) * safeLimit
    return {
      page: safePage,
      limit: safeLimit,
      total: rows.length,
      totalPages: Math.max(1, Math.ceil(rows.length / safeLimit)),
      data: rows.slice(start, start + safeLimit),
    }
  }, [parsed.value, total, page, limit])

  const snippet = useMemo(() => {
    if (!parsed.value) return ''
    return buildSnippet(resource, parsed.value, Math.max(1, total))
  }, [resource, parsed.value, total])

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h2>API Mock Server Snippet Generator</h2>
      <p>Generate faker-based Express mock server snippets with JSONPlaceholder-style routes and pagination.</p>

      <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1.2fr repeat(3, minmax(0, 120px))' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">Resource name</span>
            <input className="tool-input" value={resource} onChange={(event) => setResource(event.target.value)} placeholder="posts" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">Total rows</span>
            <input className="tool-input" type="number" min={1} value={total} onChange={(event) => setTotal(Number(event.target.value) || 1)} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">Page</span>
            <input className="tool-input" type="number" min={1} value={page} onChange={(event) => setPage(Number(event.target.value) || 1)} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">Limit</span>
            <input className="tool-input" type="number" min={1} value={limit} onChange={(event) => setLimit(Number(event.target.value) || 1)} />
          </label>
        </div>
      </section>

      <div className="tool-grid" style={{ alignItems: 'start' }}>
        <section className="tool-card">
          <label className="tool-label">Sample JSON (single item shape)</label>
          <MonacoTextEditor value={sampleJson} onChange={setSampleJson} height="36vh" language="json" />
          {parsed.error && <div style={{ color: '#fca5a5', marginTop: 10 }}>Invalid JSON: {parsed.error}</div>}
          <div style={{ marginTop: 10, color: '#94a3b8', fontSize: 13 }}>
            Supported routes: GET /{resource}, GET /{resource}/1, GET /{resource}/1/comments, GET /comments?postId=1, POST /{resource}, PUT /{resource}/1, PATCH /{resource}/1, DELETE /{resource}/1
          </div>
        </section>

        <section className="tool-card">
          <label className="tool-label">Paginated response preview</label>
          <MonacoTextEditor value={preview ? JSON.stringify(preview, null, 2) : ''} readOnly height="36vh" language="json" />
        </section>
      </div>

      <section className="tool-card">
        <label className="tool-label">Generated mock server snippet (Express + faker)</label>
        <MonacoTextEditor value={snippet} readOnly height="48vh" language="javascript" />
      </section>
    </div>
  )
}
