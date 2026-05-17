import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

type Encoding = 'utf8' | 'bin' | 'oct' | 'dec' | 'hex' | 'base32' | 'base58' | 'base64'
type NumberBase = 'bin' | 'oct' | 'dec' | 'hex'

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBytes(input: string) {
  const cleaned = input.replace(/\s+/g, '').toLowerCase()
  if (cleaned.length % 2 !== 0) throw new Error('Hex input must contain an even number of characters.')
  if (!/^[0-9a-f]*$/.test(cleaned)) throw new Error('Hex input contains invalid characters.')
  const out = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    out[i / 2] = parseInt(cleaned.slice(i, i + 2), 16)
  }
  return out
}

function bytesToRadixList(bytes: Uint8Array, base: 2 | 8 | 10) {
  return Array.from(bytes)
    .map((byte) => byte.toString(base).padStart(base === 2 ? 8 : base === 8 ? 3 : 1, '0'))
    .join(' ')
}

function radixListToBytes(input: string, base: 2 | 8 | 10) {
  const parts = input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return new Uint8Array()

  const out = new Uint8Array(parts.length)
  for (let i = 0; i < parts.length; i += 1) {
    const token = parts[i]
    if (!new RegExp(`^[0-${base === 10 ? '9' : base === 8 ? '7' : '1'}]+$`).test(token)) {
      throw new Error(`Invalid base-${base} token: ${token}`)
    }
    const value = parseInt(token, base)
    if (!Number.isFinite(value) || value < 0 || value > 255) {
      throw new Error(`Base-${base} token out of byte range (0-255): ${token}`)
    }
    out[i] = value
  }
  return out
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(input: string) {
  const cleaned = input.replace(/\s+/g, '')
  let binary: string
  try {
    binary = atob(cleaned)
  } catch {
    throw new Error('Invalid Base64 input.')
  }
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i)
  return out
}

function bytesToBase32(bytes: Uint8Array) {
  let bits = 0
  let value = 0
  let output = ''

  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  while (output.length % 8 !== 0) output += '='
  return output
}

function base32ToBytes(input: string) {
  const cleaned = input.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '')
  if (!/^[A-Z2-7]*$/.test(cleaned)) throw new Error('Invalid Base32 input.')

  let bits = 0
  let value = 0
  const out: number[] = []

  for (const char of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(char)
    if (idx < 0) throw new Error('Invalid Base32 input.')
    value = (value << 5) | idx
    bits += 5

    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return new Uint8Array(out)
}

function bytesToBase58(bytes: Uint8Array) {
  if (bytes.length === 0) return ''

  let num = 0n
  for (const byte of bytes) num = (num << 8n) | BigInt(byte)

  let encoded = ''
  while (num > 0n) {
    const remainder = Number(num % 58n)
    num /= 58n
    encoded = BASE58_ALPHABET[remainder] + encoded
  }

  for (const byte of bytes) {
    if (byte === 0) encoded = '1' + encoded
    else break
  }

  return encoded || '1'
}

function base58ToBytes(input: string) {
  const cleaned = input.trim()
  if (!cleaned) return new Uint8Array()

  let num = 0n
  for (const char of cleaned) {
    const idx = BASE58_ALPHABET.indexOf(char)
    if (idx < 0) throw new Error('Invalid Base58 input.')
    num = num * 58n + BigInt(idx)
  }

  const out: number[] = []
  while (num > 0n) {
    out.unshift(Number(num & 255n))
    num >>= 8n
  }

  for (const char of cleaned) {
    if (char === '1') out.unshift(0)
    else break
  }

  return new Uint8Array(out)
}

function utf8ToBytes(input: string) {
  return new TextEncoder().encode(input)
}

function bytesToUtf8(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes)
}

function parseInput(input: string, encoding: Encoding): Uint8Array {
  switch (encoding) {
    case 'utf8':
      return utf8ToBytes(input)
    case 'bin':
      return radixListToBytes(input, 2)
    case 'oct':
      return radixListToBytes(input, 8)
    case 'dec':
      return radixListToBytes(input, 10)
    case 'hex':
      return hexToBytes(input)
    case 'base32':
      return base32ToBytes(input)
    case 'base58':
      return base58ToBytes(input)
    case 'base64':
      return base64ToBytes(input)
    default:
      return new Uint8Array()
  }
}

function renderOutputs(bytes: Uint8Array) {
  return {
    utf8: bytesToUtf8(bytes),
    bin: bytesToRadixList(bytes, 2),
    oct: bytesToRadixList(bytes, 8),
    dec: bytesToRadixList(bytes, 10),
    hex: bytesToHex(bytes),
    base32: bytesToBase32(bytes),
    base58: bytesToBase58(bytes),
    base64: bytesToBase64(bytes),
  }
}

function normalizeNumberInput(value: string, base: NumberBase) {
  const trimmed = value.trim().toLowerCase().replace(/\s+/g, '')
  if (!trimmed) return ''
  const sign = trimmed.startsWith('-') ? '-' : ''
  const body = sign ? trimmed.slice(1) : trimmed
  if (!body) throw new Error('Enter a number value.')

  const patterns: Record<NumberBase, RegExp> = {
    bin: /^[01]+$/,
    oct: /^[0-7]+$/,
    dec: /^[0-9]+$/,
    hex: /^[0-9a-f]+$/,
  }

  if (!patterns[base].test(body)) {
    throw new Error(`Invalid ${base.toUpperCase()} number.`)
  }

  return sign + body
}

function parseBigIntFromBase(value: string, base: NumberBase) {
  const normalized = normalizeNumberInput(value, base)
  if (!normalized) return null
  const negative = normalized.startsWith('-')
  const body = negative ? normalized.slice(1) : normalized
  const prefix: Record<NumberBase, string> = { bin: '0b', oct: '0o', dec: '', hex: '0x' }
  const parsed = BigInt(prefix[base] + body)
  return negative ? -parsed : parsed
}

function formatBigIntToBase(value: bigint, base: NumberBase) {
  const negative = value < 0n
  const abs = negative ? -value : value
  const radix: Record<NumberBase, number> = { bin: 2, oct: 8, dec: 10, hex: 16 }
  const out = abs.toString(radix[base])
  return `${negative ? '-' : ''}${base === 'hex' ? out.toUpperCase() : out}`
}

export default function BaseNConverterTool() {
  const [sourceEncoding, setSourceEncoding] = useState<Encoding>('utf8')
  const [input, setInput] = useState('Hello Dev Tools')
  const [numberInput, setNumberInput] = useState('42')
  const [numberFromBase, setNumberFromBase] = useState<NumberBase>('dec')
  const [numberToBase, setNumberToBase] = useState<NumberBase>('hex')

  const result = useMemo(() => {
    try {
      const bytes = parseInput(input, sourceEncoding)
      const outputs = renderOutputs(bytes)
      return { outputs, error: '' }
    } catch (err) {
      return {
        outputs: {
          utf8: '',
          bin: '',
          oct: '',
          dec: '',
          hex: '',
          base32: '',
          base58: '',
          base64: '',
        },
        error: (err as Error).message,
      }
    }
  }, [input, sourceEncoding])

  const numberResult = useMemo(() => {
    try {
      const parsed = parseBigIntFromBase(numberInput, numberFromBase)
      if (parsed === null) return { output: '', error: '' }
      return { output: formatBigIntToBase(parsed, numberToBase), error: '' }
    } catch (err) {
      return { output: '', error: (err as Error).message }
    }
  }, [numberInput, numberFromBase, numberToBase])

  return (
    <div className="tool-shell" style={{ maxWidth: '100%' }}>
      <h1>Base-N Converter Suite</h1>
      <p>Convert between binary, octal, decimal, hex, base32, base58, and base64 using a shared byte representation.</p>

      <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
        <label className="tool-label">Number Conversion</label>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'minmax(0, 1fr) 160px minmax(0, 1fr) 160px' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">Input number</span>
            <input className="tool-input" value={numberInput} onChange={(event) => setNumberInput(event.target.value)} placeholder="255" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">From base</span>
            <select className="tool-select" value={numberFromBase} onChange={(event) => setNumberFromBase(event.target.value as NumberBase)}>
              <option value="dec">Decimal</option>
              <option value="bin">Binary</option>
              <option value="oct">Octal</option>
              <option value="hex">Hex</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">Output</span>
            <input className="tool-input" value={numberResult.output} readOnly placeholder="Converted value" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">To base</span>
            <select className="tool-select" value={numberToBase} onChange={(event) => setNumberToBase(event.target.value as NumberBase)}>
              <option value="hex">Hex</option>
              <option value="bin">Binary</option>
              <option value="oct">Octal</option>
              <option value="dec">Decimal</option>
            </select>
          </label>
        </div>
        {numberResult.error && <div style={{ color: '#fca5a5' }}>Number conversion error: {numberResult.error}</div>}
      </section>

      <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '220px 1fr' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tool-label">Source encoding</span>
            <select className="tool-select" value={sourceEncoding} onChange={(event) => setSourceEncoding(event.target.value as Encoding)}>
              <option value="utf8">UTF-8 text</option>
              <option value="bin">Binary bytes</option>
              <option value="oct">Octal bytes</option>
              <option value="dec">Decimal bytes</option>
              <option value="hex">Hex</option>
              <option value="base32">Base32</option>
              <option value="base58">Base58</option>
              <option value="base64">Base64</option>
            </select>
          </label>
        </div>
        <label className="tool-label">Input</label>
        <MonacoTextEditor value={input} onChange={setInput} height="20vh" language="plaintext" />
        {result.error && <div style={{ color: '#fca5a5' }}>Input error: {result.error}</div>}
      </section>

      <div className="tool-grid" style={{ alignItems: 'start' }}>
        {([
          ['utf8', 'UTF-8 text'],
          ['bin', 'Binary'],
          ['oct', 'Octal'],
          ['dec', 'Decimal'],
          ['hex', 'Hex'],
          ['base32', 'Base32'],
          ['base58', 'Base58'],
          ['base64', 'Base64'],
        ] as Array<[keyof ReturnType<typeof renderOutputs>, string]>).map(([key, label]) => (
          <section key={key} className="tool-card" style={{ display: 'grid', gap: 8 }}>
            <label className="tool-label">{label}</label>
            <MonacoTextEditor value={result.outputs[key]} readOnly height="16vh" language="plaintext" />
          </section>
        ))}
      </div>
    </div>
  )
}
