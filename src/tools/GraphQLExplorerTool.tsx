import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

const INTROSPECTION_QUERY = `query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    types {
      name
      kind
      fields {
        name
      }
    }
  }
}`

export default function GraphQLExplorerTool() {
  const [endpoint, setEndpoint] = useState('https://countries.trevorblades.com/')
  const [query, setQuery] = useState('query { countries { code name } }')
  const [variables, setVariables] = useState('{}')
  const [responseText, setResponseText] = useState('')
  const [schemaText, setSchemaText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const runRequest = async (payloadQuery: string) => {
    setLoading(true)
    setError('')
    try {
      const parsedVariables = variables.trim() ? JSON.parse(variables) : {}
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: payloadQuery, variables: parsedVariables }),
      })

      const json = await response.json()
      return JSON.stringify(json, null, 2)
    } catch (err) {
      throw new Error((err as Error).message || 'GraphQL request failed')
    } finally {
      setLoading(false)
    }
  }

  const runQuery = async () => {
    try {
      const result = await runRequest(query)
      setResponseText(result)
    } catch (err) {
      setError((err as Error).message)
      setResponseText('')
    }
  }

  const loadSchema = async () => {
    try {
      const result = await runRequest(INTROSPECTION_QUERY)
      setSchemaText(result)
    } catch (err) {
      setError((err as Error).message)
      setSchemaText('')
    }
  }

  const typeSummary = useMemo(() => {
    if (!schemaText.trim()) return [] as string[]
    try {
      const parsed = JSON.parse(schemaText) as {
        data?: { __schema?: { types?: Array<{ name?: string; kind?: string }> } }
      }
      const types = parsed.data?.__schema?.types ?? []
      return types
        .filter((type) => type.name && !type.name.startsWith('__'))
        .slice(0, 80)
        .map((type) => `${type.name} (${type.kind})`)
    } catch {
      return []
    }
  }, [schemaText])

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h2>GraphQL Query Runner + Schema Explorer</h2>
      <p>Run GraphQL queries from the browser and inspect schema via introspection.</p>

      <section className="tool-card" style={{ marginBottom: 14 }}>
        <label className="tool-label">GraphQL endpoint</label>
        <input className="tool-input" value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder="https://api.example.com/graphql" />
        <div className="tool-actions">
          <button className="tool-button" onClick={runQuery} disabled={loading}>{loading ? 'Running...' : 'Run Query'}</button>
          <button className="tool-button secondary" onClick={loadSchema} disabled={loading}>Load Schema</button>
        </div>
        {error && <div style={{ color: '#fda4af' }}>{error}</div>}
      </section>

      <div className="tool-grid" style={{ alignItems: 'start' }}>
        <section className="tool-card">
          <label className="tool-label">Query</label>
          <MonacoTextEditor value={query} onChange={setQuery} height="34vh" language="graphql" />
          <label className="tool-label" style={{ marginTop: 12 }}>Variables (JSON)</label>
          <MonacoTextEditor value={variables} onChange={setVariables} height="20vh" language="json" />
        </section>

        <section style={{ display: 'grid', gap: 12 }}>
          <div className="tool-card">
            <label className="tool-label">Response</label>
            <MonacoTextEditor value={responseText} readOnly height="26vh" language="json" />
          </div>
          <div className="tool-card">
            <label className="tool-label">Schema introspection</label>
            <MonacoTextEditor value={schemaText} readOnly height="20vh" language="json" />
            <label className="tool-label" style={{ marginTop: 12 }}>Type preview</label>
            <MonacoTextEditor value={typeSummary.join('\n')} readOnly height="14vh" language="plaintext" />
          </div>
        </section>
      </div>
    </div>
  )
}
