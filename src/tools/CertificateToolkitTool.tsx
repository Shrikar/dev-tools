import { useMemo, useState } from 'react'
import { parse as parseYaml } from 'yaml'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

type AsnNode = {
  tag: number
  className: string
  constructed: boolean
  length: number
  offset: number
  end: number
  valueHex?: string
  valueText?: string
  children?: AsnNode[]
}

type PemBlock = {
  type: string
  base64: string
  bytes: Uint8Array
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function parsePemBlocks(input: string): PemBlock[] {
  const pattern = /-----BEGIN ([^-]+)-----([\s\S]*?)-----END \1-----/g
  const blocks: PemBlock[] = []
  let match: RegExpExecArray | null

  while ((match = pattern.exec(input)) !== null) {
    const type = match[1].trim()
    const base64 = match[2].replace(/[^A-Za-z0-9+/=]/g, '')
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
    blocks.push({ type, base64, bytes })
  }

  return blocks
}

function parseLength(bytes: Uint8Array, offset: number) {
  const first = bytes[offset]
  if (first < 0x80) {
    return { length: first, next: offset + 1 }
  }

  const count = first & 0x7f
  if (count === 0) throw new Error('Indefinite ASN.1 lengths are not supported.')
  let length = 0
  for (let i = 0; i < count; i += 1) {
    length = (length << 8) | bytes[offset + 1 + i]
  }

  return { length, next: offset + 1 + count }
}

function parseAsn1Node(bytes: Uint8Array, start: number): AsnNode {
  const tag = bytes[start]
  const classId = (tag & 0xc0) >> 6
  const constructed = (tag & 0x20) !== 0
  const tagNumber = tag & 0x1f

  const className = classId === 0 ? 'universal' : classId === 1 ? 'application' : classId === 2 ? 'context' : 'private'
  const { length, next } = parseLength(bytes, start + 1)
  const contentStart = next
  const end = contentStart + length

  if (end > bytes.length) throw new Error('ASN.1 length exceeds input size.')

  const node: AsnNode = {
    tag: tagNumber,
    className,
    constructed,
    length,
    offset: start,
    end,
  }

  if (constructed) {
    const children: AsnNode[] = []
    let cursor = contentStart
    while (cursor < end) {
      const child = parseAsn1Node(bytes, cursor)
      children.push(child)
      cursor = child.end
    }
    node.children = children
  } else {
    const value = bytes.slice(contentStart, end)
    node.valueHex = bytesToHex(value)
    if (tagNumber === 12 || tagNumber === 19 || tagNumber === 22 || tagNumber === 30 || tagNumber === 20) {
      node.valueText = new TextDecoder().decode(value)
    }
    if (tagNumber === 23 || tagNumber === 24) {
      node.valueText = new TextDecoder().decode(value)
    }
  }

  return node
}

function flatten(node: AsnNode): AsnNode[] {
  const out: AsnNode[] = [node]
  if (node.children) {
    for (const child of node.children) out.push(...flatten(child))
  }
  return out
}

function parseTime(value: string | undefined, tag: number): Date | null {
  if (!value) return null

  if (tag === 23) {
    const m = value.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/)
    if (!m) return null
    const yy = Number(m[1])
    const year = yy >= 50 ? 1900 + yy : 2000 + yy
    return new Date(Date.UTC(year, Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])))
  }

  if (tag === 24) {
    const m = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/)
    if (!m) return null
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])))
  }

  return null
}

function findValidity(root: AsnNode) {
  const nodes = flatten(root)
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const a = nodes[i]
    const b = nodes[i + 1]
    const aIsTime = a.className === 'universal' && (a.tag === 23 || a.tag === 24)
    const bIsTime = b.className === 'universal' && (b.tag === 23 || b.tag === 24)
    if (aIsTime && bIsTime) {
      const notBefore = parseTime(a.valueText, a.tag)
      const notAfter = parseTime(b.valueText, b.tag)
      if (notBefore && notAfter) return { notBefore, notAfter }
    }
  }
  return null
}

function summarizeNode(node: AsnNode, depth = 0, maxDepth = 5): string[] {
  const indent = '  '.repeat(depth)
  const tagLabel = `${node.className}:${node.tag}`
  const line = `${indent}- ${tagLabel} ${node.constructed ? '[constructed]' : ''} len=${node.length}`.trimEnd()
  const lines = [line]

  if (!node.constructed && node.valueText) {
    lines.push(`${indent}  text=${node.valueText}`)
  }

  if (node.children && depth < maxDepth) {
    for (const child of node.children) lines.push(...summarizeNode(child, depth + 1, maxDepth))
  }

  return lines
}

const SAMPLE = `-----BEGIN CERTIFICATE-----
MIIBnTCCAUKgAwIBAgIUP11e35J5Hzs2R7zQY5L7Wmq4C8gwCgYIKoZIzj0EAwIw
EzERMA8GA1UEAwwIRGV2IFRlc3QwHhcNMjUwMTAxMDAwMDAwWhcNMjcwMTAxMDAw
MDAwWjATMREwDwYDVQQDDAhEZXYgVGVzdDBZMBMGByqGSM49AgEGCCqGSM49AwEH
A0IABB3VC8L8tgREJpXQ1x96U4Q+YzlNj9pcqXR8v6jKNfcn6Wf9x7nX2gmu3R+0
4YJizvL3YwRgB5Awjv7P3jta4K2jUzBRMB0GA1UdDgQWBBTz0+vLEHlvryX0u2sP
0BsZP8U5FzAfBgNVHSMEGDAWgBTz0+vLEHlvryX0u2sP0BsZP8U5FzAPBgNVHRMB
Af8EBTADAQH/MAoGCCqGSM49BAMCA0kAMEYCIQDMc6MWm9juv7aWQhBGjTQx8wew
fR6txvyek62ZoU8m8QIhAJS+vKY6tIcbWwxYQlHGi8g0ywZQH2nK3DxQVQBc7QVU
-----END CERTIFICATE-----`

const SAMPLE_SOPS = `apiVersion: v1
kind: Secret
metadata:
  name: app-secret
data:
  username: ENC[AES256_GCM,data:abc123,iv:def456,tag:ghi789,type:str]
  password: ENC[AES256_GCM,data:jkl123,iv:mno456,tag:pqr789,type:str]
sops:
  kms: []
  gcp_kms: []
  azure_kv: []
  hc_vault: []
  age:
    - recipient: age1exampleexampleexampleexampleexampleexample
      enc: |
        -----BEGIN AGE ENCRYPTED FILE-----
        ...
        -----END AGE ENCRYPTED FILE-----
  lastmodified: "2026-01-01T00:00:00Z"
  mac: ENC[AES256_GCM,data:aaa,iv:bbb,tag:ccc,type:str]
  version: "3.9.0"
`

function parseSopsDocument(input: string) {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('SOPS input is empty.')

  const doc = trimmed.startsWith('{') || trimmed.startsWith('[') ? JSON.parse(trimmed) : parseYaml(trimmed)
  if (!doc || typeof doc !== 'object') throw new Error('Invalid SOPS document.')

  const root = doc as Record<string, unknown>
  const sops = root.sops
  if (!sops || typeof sops !== 'object') throw new Error('No `sops` metadata object found.')

  const metadata = sops as Record<string, unknown>
  const report: string[] = []

  report.push(`version: ${String(metadata.version ?? 'unknown')}`)
  report.push(`lastmodified: ${String(metadata.lastmodified ?? 'unknown')}`)
  report.push(`mac present: ${metadata.mac ? 'yes' : 'no'}`)
  report.push(`age recipients: ${Array.isArray(metadata.age) ? metadata.age.length : 0}`)
  report.push(`kms recipients: ${Array.isArray(metadata.kms) ? metadata.kms.length : 0}`)
  report.push(`pgp recipients: ${Array.isArray(metadata.pgp) ? metadata.pgp.length : 0}`)
  report.push('')

  const encryptedPaths: string[] = []
  const clearPaths: string[] = []

  const walk = (value: unknown, path: string) => {
    if (path === 'sops') return
    if (typeof value === 'string') {
      if (/^ENC\[.+\]$/s.test(value)) encryptedPaths.push(path)
      else clearPaths.push(path)
      return
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`))
      return
    }
    if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        const next = path ? `${path}.${key}` : key
        walk(child, next)
      }
    }
  }

  walk(root, '')

  report.push(`encrypted value nodes: ${encryptedPaths.length}`)
  report.push(`cleartext value nodes: ${clearPaths.length}`)
  report.push('')
  report.push('encrypted paths:')
  report.push(...(encryptedPaths.length > 0 ? encryptedPaths : ['(none)']))
  report.push('')
  report.push('cleartext paths:')
  report.push(...(clearPaths.length > 0 ? clearPaths.slice(0, 50) : ['(none)']))
  if (clearPaths.length > 50) report.push(`... and ${clearPaths.length - 50} more`)
  report.push('')
  report.push('browser limitation: full SOPS encrypt/decrypt requires age/PGP private keys or cloud KMS access.')

  return report
}

export default function CertificateToolkitTool() {
  const [input, setInput] = useState(SAMPLE)
  const [sopsInput, setSopsInput] = useState(SAMPLE_SOPS)

  const result = useMemo(() => {
    try {
      const blocks = parsePemBlocks(input)
      if (blocks.length === 0) {
        return { blocks: [] as PemBlock[], details: [] as string[], error: 'No PEM blocks found.' }
      }

      const details: string[] = []

      for (const block of blocks) {
        details.push(`Type: ${block.type}`)
        details.push(`DER bytes: ${block.bytes.length}`)

        if (block.type.includes('CERTIFICATE') || block.type.includes('REQUEST') || block.type.includes('CSR')) {
          try {
            const root = parseAsn1Node(block.bytes, 0)
            details.push('ASN.1 preview:')
            details.push(...summarizeNode(root))

            if (block.type.includes('CERTIFICATE')) {
              const validity = findValidity(root)
              if (validity) {
                const now = new Date()
                const isNotYetValid = now < validity.notBefore
                const isExpired = now > validity.notAfter
                const status = isNotYetValid ? 'Not yet valid' : isExpired ? 'Expired' : 'Valid now'

                details.push(`notBefore: ${validity.notBefore.toISOString()}`)
                details.push(`notAfter: ${validity.notAfter.toISOString()}`)
                details.push(`status: ${status}`)
              } else {
                details.push('Validity window not detected.')
              }
            }
          } catch (err) {
            details.push(`ASN.1 decode error: ${(err as Error).message}`)
          }
        }

        details.push('')
      }

      return { blocks, details, error: '' }
    } catch (err) {
      return { blocks: [] as PemBlock[], details: [] as string[], error: (err as Error).message }
    }
  }, [input])

  const sopsReport = useMemo(() => {
    try {
      return { lines: parseSopsDocument(sopsInput), error: '' }
    } catch (err) {
      return { lines: [] as string[], error: (err as Error).message }
    }
  }, [sopsInput])

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>Certificate Toolkit</h1>
      <p>Decode PEM/CSR/X.509 blocks and run certificate validity checks in-browser, plus SOPS metadata operations.</p>

      <div className="tool-grid" style={{ alignItems: 'start' }}>
        <section className="tool-card">
          <label className="tool-label">PEM / CSR / Certificate input</label>
          <MonacoTextEditor value={input} onChange={setInput} height="70vh" language="plaintext" />
        </section>

        <section style={{ display: 'grid', gap: 12 }}>
          <div className="tool-card">
            <label className="tool-label">Detected blocks</label>
            <MonacoTextEditor
              value={result.blocks.length > 0 ? result.blocks.map((b, idx) => `${idx + 1}. ${b.type} (${b.bytes.length} bytes)`).join('\n') : ''}
              readOnly
              height="18vh"
              language="plaintext"
            />
          </div>

          <div className="tool-card">
            <label className="tool-label">Decode + validity report</label>
            <MonacoTextEditor value={result.details.join('\n')} readOnly height="48vh" language="plaintext" />
            {result.error && <div style={{ color: '#fca5a5', marginTop: 8 }}>{result.error}</div>}
          </div>
        </section>
      </div>

      <section className="tool-card" style={{ marginTop: 2 }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#93c5fd' }}>SOPS Operations</h2>
        <p style={{ marginTop: 6, marginBottom: 0, color: '#94a3b8' }}>
          Browser-safe SOPS checks: metadata summary, encrypted path detection, and cleartext path audit.
        </p>
      </section>

      <div className="tool-grid" style={{ alignItems: 'start' }}>
        <section className="tool-card">
          <label className="tool-label">SOPS YAML/JSON input (metadata inspection)</label>
          <MonacoTextEditor value={sopsInput} onChange={setSopsInput} height="56vh" language="yaml" />
        </section>

        <section className="tool-card">
          <label className="tool-label">SOPS operations report</label>
          <MonacoTextEditor value={sopsReport.lines.join('\n')} readOnly height="56vh" language="plaintext" />
          {sopsReport.error && <div style={{ color: '#fca5a5', marginTop: 8 }}>{sopsReport.error}</div>}
        </section>
      </div>
    </div>
  )
}
