import { useMemo, useState } from 'react'
import MD5 from 'crypto-js/md5'
import SHA1 from 'crypto-js/sha1'

const NAMESPACES = [
  { label: 'DNS', value: 'DNS' },
  { label: 'URL', value: 'URL' },
  { label: 'OID', value: 'OID' },
  { label: 'X500', value: 'X500' },
]

function randomBytes(length: number) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
}

function bytesToUuid(bytes: number[]) {
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`
}

function uuidFromBytes(bytes: number[], versionNumber: number) {
  const cloned = [...bytes]
  cloned[6] = (cloned[6] & 0x0f) | (versionNumber << 4)
  cloned[8] = (cloned[8] & 0x3f) | 0x80
  return bytesToUuid(cloned)
}

function namespaceToBytes(namespace: string) {
  const trimmed = namespace.trim().toLowerCase()
  const match = trimmed.match(/^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i)
  if (!match) return null
  return match.slice(1).join('').match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
}

function stringToBytes(input: string) {
  return Array.from(new TextEncoder().encode(input))
}

function md5Bytes(data: number[]) {
  const wordArray = MD5(new Uint8Array(data) as any)
  const hex = wordArray.toString()
  return hex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
}

function sha1Bytes(data: number[]) {
  const wordArray = SHA1(new Uint8Array(data) as any)
  const hex = wordArray.toString()
  return hex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)).slice(0, 16)
}

function uuidV1() {
  const timestamp = Date.now()
  const timeLow = timestamp & 0xffffffff
  const timeMid = (timestamp >>> 32) & 0xffff
  const timeHi = ((timestamp >>> 48) & 0x0fff) | 0x1000
  const clockSeq = randomBytes(2)
  const node = randomBytes(6)

  const bytes = [
    (timeLow >>> 24) & 0xff,
    (timeLow >>> 16) & 0xff,
    (timeLow >>> 8) & 0xff,
    timeLow & 0xff,
    (timeMid >>> 8) & 0xff,
    timeMid & 0xff,
    (timeHi >>> 8) & 0xff,
    timeHi & 0xff,
    (clockSeq[0] & 0x3f) | 0x80,
    clockSeq[1],
    ...node,
  ]

  return bytesToUuid(bytes)
}

function uuidV3(name: string, namespaceUuid: string) {
  const namespaceBytes = namespaceToBytes(namespaceUuid)
  if (!namespaceBytes) return 'Invalid namespace UUID'

  const bytes = md5Bytes([...namespaceBytes, ...stringToBytes(name)])
  return uuidFromBytes(bytes, 3)
}

function uuidV4() {
  return uuidFromBytes(randomBytes(16), 4)
}

function uuidV5(name: string, namespaceUuid: string) {
  const namespaceBytes = namespaceToBytes(namespaceUuid)
  if (!namespaceBytes) return 'Invalid namespace UUID'

  const bytes = sha1Bytes([...namespaceBytes, ...stringToBytes(name)])
  return uuidFromBytes(bytes, 5)
}

function uuidV7() {
  const bytes = randomBytes(16)
  const now = Date.now()

  bytes[0] = (now / 0x10000000000) & 0xff
  bytes[1] = (now / 0x100000000) & 0xff
  bytes[2] = (now >>> 24) & 0xff
  bytes[3] = (now >>> 16) & 0xff
  bytes[4] = (now >>> 8) & 0xff
  bytes[5] = now & 0xff

  return uuidFromBytes(bytes, 7)
}

function validateUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim())
}

function getUuidVersion(value: string) {
  const match = value.trim().match(/^[0-9a-f]{8}-[0-9a-f]{4}-([1-7])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  return match ? Number(match[1]) : null
}

export default function UUIDGenerator() {
  const [output, setOutput] = useState('')
  const [versionChoice, setVersionChoice] = useState<'1' | '3' | '4' | '5' | '7'>('4')
  const [name, setName] = useState('example.com')
  const [namespace, setNamespace] = useState<'DNS' | 'URL' | 'OID' | 'X500'>('DNS')
  const [validatorInput, setValidatorInput] = useState('')

  const namespaceMap: Record<string, string> = {
    DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
  }

  const validation = useMemo(() => {
    const trimmed = validatorInput.trim()
    if (!trimmed) {
      return { status: 'empty', message: 'Paste a UUID to validate it.' }
    }

    if (!validateUuid(trimmed)) {
      return { status: 'invalid', message: 'Invalid UUID format.' }
    }

    const uuidVersion = getUuidVersion(trimmed)
    return { status: 'valid', message: `Valid UUID version ${uuidVersion}.` }
  }, [validatorInput])

  const handleGenerate = () => {
    let id = ''

    if (versionChoice === '1') {
      id = uuidV1()
    } else if (versionChoice === '4') {
      id = uuidV4()
    } else if (versionChoice === '3') {
      id = uuidV3(name || 'example.com', namespaceMap[namespace])
    } else if (versionChoice === '5') {
      id = uuidV5(name || 'example.com', namespaceMap[namespace])
    } else if (versionChoice === '7') {
      id = uuidV7()
    }

    setOutput(id)
  }

  const sectionStyle = {
    background: '#111827',
    border: '1px solid #334155',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  }

  const inputStyle = {
    width: '100%',
    borderRadius: 14,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#f8fafc',
    padding: '12px 14px',
    fontSize: 15,
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    color: '#94a3b8',
    fontSize: 13,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', color: '#e5e7eb' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: '2.1rem', color: '#60a5fa', fontFamily: 'inherit' }}>UUID Generator</h1>
        <p style={{ marginTop: 10, color: '#94a3b8', maxWidth: 760 }}>
          Generate UUID versions and validate existing UUID strings directly in the browser.
        </p>
      </header>

      <section style={sectionStyle}>
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'minmax(0, 180px) 1fr', alignItems: 'end' }}>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={labelStyle}>UUID version</span>
              <select
                value={versionChoice}
                onChange={(event) => setVersionChoice(event.target.value as '1' | '3' | '4' | '5' | '7')}
                style={inputStyle}
              >
                <option value="1">Version 1</option>
                <option value="3">Version 3</option>
                <option value="4">Version 4</option>
                <option value="5">Version 5</option>
                <option value="7">Version 7</option>
              </select>
            </label>

            <button
              type="button"
              onClick={handleGenerate}
              style={{
                border: 'none',
                borderRadius: 14,
                background: '#60a5fa',
                color: '#020617',
                padding: '14px 18px',
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: 150,
              }}
            >
              Generate UUID
            </button>
          </div>

          {(versionChoice === '3' || versionChoice === '5') && (
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr' }}>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} placeholder="example.com" />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>Namespace</span>
                <select value={namespace} onChange={(event) => setNamespace(event.target.value as any)} style={inputStyle}>
                  {NAMESPACES.map((ns) => (
                    <option key={ns.value} value={ns.value}>
                      {ns.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div style={{ display: 'grid', gap: 10 }}>
            <span style={{ ...labelStyle, marginBottom: 0 }}>Generated UUID</span>
            <pre style={{ margin: 0, padding: 18, background: '#020617', borderRadius: 18, border: '1px solid #334155', overflowX: 'auto', color: '#e5e7eb' }}>{output || 'No UUID generated yet.'}</pre>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ margin: 0, color: '#60a5fa', fontSize: '1.35rem', fontFamily: 'inherit' }}>UUID Validator</h2>
        <p style={{ marginTop: 10, color: '#94a3b8' }}>Validate a UUID string and detect its version.</p>

        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={labelStyle}>UUID input</span>
            <input
              value={validatorInput}
              onChange={(event) => setValidatorInput(event.target.value)}
              placeholder="Paste UUID to validate"
              style={inputStyle}
            />
          </label>

          <div
            style={{
              padding: 18,
              borderRadius: 18,
              background: '#020617',
              border: '1px solid #334155',
              color: validation.status === 'valid' ? '#a7f3d0' : '#fecaca',
            }}
          >
            {validation.message}
          </div>
        </div>
      </section>
    </div>
  )
}
