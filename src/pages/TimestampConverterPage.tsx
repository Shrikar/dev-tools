import { useEffect, useMemo, useState } from 'react'

type EpochUnit = 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds'

type EpochNormalizeResult =
  | { ms: number; unit: EpochUnit }
  | { error: string }

const UNITS: EpochUnit[] = ['seconds', 'milliseconds', 'microseconds', 'nanoseconds']

function getCurrentEpoch(unit: EpochUnit, now = Date.now()) {
  switch (unit) {
    case 'seconds':
      return Math.floor(now / 1000).toString()
    case 'milliseconds':
      return now.toString()
    case 'microseconds':
      return `${now * 1000}`
    case 'nanoseconds':
      return `${now * 1000000}`
    default:
      return Math.floor(now / 1000).toString()
  }
}

function normalizeEpochToMilliseconds(input: string): EpochNormalizeResult {
  const cleaned = input.trim()
  if (!cleaned) {
    return { error: 'Enter a timestamp first.' }
  }

  const negative = cleaned.startsWith('-')
  const digits = negative ? cleaned.slice(1) : cleaned
  if (!/^[0-9]+$/.test(digits)) {
    return { error: 'Timestamp must be a numeric value.' }
  }

  const len = digits.length
  if (len === 10) {
    return { ms: Number(cleaned) * 1000, unit: 'seconds' as EpochUnit }
  }
  if (len === 13) {
    return { ms: Number(cleaned), unit: 'milliseconds' as EpochUnit }
  }
  if (len === 16) {
    return { ms: Number(cleaned) / 1000, unit: 'microseconds' as EpochUnit }
  }
  if (len === 19) {
    return { ms: Number(cleaned) / 1000000, unit: 'nanoseconds' as EpochUnit }
  }

  return {
    error:
      'Unable to detect unit. Use 10, 13, 16, or 19 digit timestamps for seconds, milliseconds, microseconds, or nanoseconds.',
  }
}

function formatDateOutputs(date: Date) {
  return {
    local: date.toString(),
    utc: date.toUTCString(),
    iso: date.toISOString(),
    relative: getRelativeTime(date),
  }
}

function getRelativeTime(date: Date) {
  const deltaMs = date.getTime() - Date.now()
  const deltaSeconds = Math.round(deltaMs / 1000)
  const absSeconds = Math.abs(deltaSeconds)

  if (absSeconds < 60) {
    return deltaSeconds === 0 ? 'now' : `${deltaSeconds} second${absSeconds === 1 ? '' : 's'} ${deltaSeconds > 0 ? 'from now' : 'ago'}`
  }
  const deltaMinutes = Math.round(deltaSeconds / 60)
  if (Math.abs(deltaMinutes) < 60) {
    return `${deltaMinutes} minute${Math.abs(deltaMinutes) === 1 ? '' : 's'} ${deltaMinutes > 0 ? 'from now' : 'ago'}`
  }
  const deltaHours = Math.round(deltaMinutes / 60)
  if (Math.abs(deltaHours) < 24) {
    return `${deltaHours} hour${Math.abs(deltaHours) === 1 ? '' : 's'} ${deltaHours > 0 ? 'from now' : 'ago'}`
  }
  const deltaDays = Math.round(deltaHours / 24)
  return `${deltaDays} day${Math.abs(deltaDays) === 1 ? '' : 's'} ${deltaDays > 0 ? 'from now' : 'ago'}`
}

function datePartsToDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  ampm: string,
  timezone: 'local' | 'utc'
) {
  let normalizedHour = hour % 12
  if (ampm === 'PM') normalizedHour += 12

  if (timezone === 'utc') {
    return new Date(Date.UTC(year, month - 1, day, normalizedHour, minute, second))
  }
  return new Date(year, month - 1, day, normalizedHour, minute, second)
}

export default function TimestampConverterPage() {
  const [currentUnit, setCurrentUnit] = useState<EpochUnit>('seconds')
  const [timestampInput, setTimestampInput] = useState('')
  const [timestampError, setTimestampError] = useState('')
  const [timestampResult, setTimestampResult] = useState<{ local: string; utc: string; iso: string; relative: string } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [nowMs, setNowMs] = useState(Date.now())

  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth() + 1)
  const [day, setDay] = useState(() => new Date().getDate())
  const [hour, setHour] = useState(() => {
    const h = new Date().getHours()
    return h % 12 === 0 ? 12 : h % 12
  })
  const [minute, setMinute] = useState(() => new Date().getMinutes())
  const [second, setSecond] = useState(() => new Date().getSeconds())
  const [ampm, setAmPm] = useState(() => (new Date().getHours() >= 12 ? 'PM' : 'AM'))
  const [timezone, setTimezone] = useState<'local' | 'utc'>('local')
  const [dateError, setDateError] = useState('')
  const [dateResult, setDateResult] = useState<{ seconds: string; milliseconds: string; microseconds: string; nanoseconds: string } | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const currentEpoch = useMemo(() => getCurrentEpoch(currentUnit, nowMs), [currentUnit, nowMs])

  const handleConvertTimestamp = () => {
    const normalized = normalizeEpochToMilliseconds(timestampInput)
    if ('error' in normalized) {
      setTimestampError(normalized.error)
      setTimestampResult(null)
      return
    }

    const date = new Date(normalized.ms)
    if (Number.isNaN(date.getTime())) {
      setTimestampError('Invalid epoch timestamp.')
      setTimestampResult(null)
      return
    }

    setTimestampError('')
    setTimestampResult(formatDateOutputs(date))
  }

  const handleConvertDate = () => {
    const targetDate = datePartsToDate(year, month, day, hour, minute, second, ampm, timezone)

    if (Number.isNaN(targetDate.getTime())) {
      setDateError('Please enter a valid date and time.')
      setDateResult(null)
      return
    }

    setDateError('')
    const ms = targetDate.getTime()
    setDateResult({
      seconds: Math.floor(ms / 1000).toString(),
      milliseconds: ms.toString(),
      microseconds: `${ms * 1000}`,
      nanoseconds: `${ms * 1000000}`,
    })
  }

  const sectionStyle = {
    background: '#111827',
    border: '1px solid #29415b',
    borderRadius: 18,
    padding: 24,
    marginTop: 24,
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#f8fafc',
    fontSize: 15,
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    marginBottom: 8,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  }

  return (
    <div style={{ padding: 24, color: '#e2e8f0', minHeight: '100%', background: '#020617' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 32, lineHeight: 1, color: '#f973ac' }}>⏱</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: '#f973ac', fontFamily: 'Georgia, serif' }}>Epoch</span>
              <span style={{ fontSize: 42, fontWeight: 400, color: '#f8fafc', fontFamily: 'Georgia, serif' }}>Converter</span>
            </div>
            <p style={{ margin: '10px 0 0', maxWidth: 760, color: '#94a3b8' }}>
              Epoch & Unix Timestamp Conversion Tools for browser-only local time, UTC time, and timestamp conversions.
            </p>
          </div>
        </header>

        <div style={{ height: 1, background: '#334155', marginBottom: 24 }} />

        <section style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Current epoch time</span>
              </div>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: 18, lineHeight: 1.5 }}>
                The current Unix epoch time is <span style={{ color: '#f973ac', fontWeight: 700 }}>{currentEpoch}</span>
              </p>
            </div>
            <label style={{ display: 'inline-flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
              <span style={labelStyle}>Units</span>
              <select
                value={currentUnit}
                onChange={(event) => setCurrentUnit(event.target.value as EpochUnit)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#f8fafc',
                  fontSize: 15,
                }}
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, color: '#f973ac', fontSize: 24, fontFamily: 'Georgia, serif' }}>
                Convert epoch to human-readable date and vice versa
              </h2>
              <p style={{ marginTop: 10, color: '#94a3b8', maxWidth: 700 }}>
                Paste a timestamp and automatically detect seconds, milliseconds, microseconds, or nanoseconds by length.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              style={{
                border: '1px solid #334155',
                borderRadius: 12,
                background: '#020617',
                color: '#f8fafc',
                padding: '12px 14px',
                cursor: 'pointer',
                minWidth: 48,
              }}
              title="Settings"
            >
              ⚙
            </button>
          </div>

          {showSettings && (
            <div style={{ marginTop: 18, color: '#cbd5e1', background: '#0f172a', border: '1px solid #334155', borderRadius: 14, padding: 16 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>
                Timestamp detection uses exact length: 10 digits = seconds, 13 digits = milliseconds, 16 digits = microseconds, 19 digits = nanoseconds.
              </p>
            </div>
          )}

          <div style={{ marginTop: 24, display: 'grid', gap: 18 }}>
            <label style={{ width: '100%' }}>
              <span style={labelStyle}>Timestamp input</span>
              <input
                value={timestampInput}
                onChange={(event) => setTimestampInput(event.target.value)}
                placeholder="Enter epoch timestamp"
                style={inputStyle}
              />
            </label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleConvertTimestamp}
                style={{
                  background: '#f973ac',
                  color: '#020617',
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px 18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Timestamp to readable date
              </button>
            </div>

            {timestampError && (
              <div style={{ color: '#f87171', fontSize: 14 }}>{timestampError}</div>
            )}

            {timestampResult && (
              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                <div style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Output</div>
                <div style={{ padding: 18, borderRadius: 14, background: '#020617', border: '1px solid #334155' }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: '#cbd5e1', fontWeight: 700 }}>Local time</div>
                    <div style={{ marginTop: 4 }}>{timestampResult.local}</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: '#cbd5e1', fontWeight: 700 }}>UTC time</div>
                    <div style={{ marginTop: 4 }}>{timestampResult.utc}</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: '#cbd5e1', fontWeight: 700 }}>ISO 8601</div>
                    <div style={{ marginTop: 4 }}>{timestampResult.iso}</div>
                  </div>
                  <div>
                    <div style={{ color: '#cbd5e1', fontWeight: 700 }}>Relative time</div>
                    <div style={{ marginTop: 4 }}>{timestampResult.relative}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, color: '#f973ac', fontSize: 24, fontFamily: 'Georgia, serif' }}>
                Convert human-readable date to epoch timestamp
              </h2>
              <p style={{ marginTop: 10, color: '#94a3b8', maxWidth: 700 }}>
                Select a date and time, then convert it to Unix seconds, milliseconds, microseconds, or nanoseconds.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>Yr</span>
                <input
                  type="number"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>Mon</span>
                <input
                  type="number"
                  value={month}
                  min={1}
                  max={12}
                  onChange={(event) => setMonth(Number(event.target.value))}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>Day</span>
                <input
                  type="number"
                  value={day}
                  min={1}
                  max={31}
                  onChange={(event) => setDay(Number(event.target.value))}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>Hr</span>
                <input
                  type="number"
                  value={hour}
                  min={1}
                  max={12}
                  onChange={(event) => setHour(Number(event.target.value))}
                  style={inputStyle}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>Min</span>
                <input
                  type="number"
                  value={minute}
                  min={0}
                  max={59}
                  onChange={(event) => setMinute(Number(event.target.value))}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>Sec</span>
                <input
                  type="number"
                  value={second}
                  min={0}
                  max={59}
                  onChange={(event) => setSecond(Number(event.target.value))}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>AM/PM</span>
                <select value={ampm} onChange={(event) => setAmPm(event.target.value)} style={inputStyle}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>Timezone</span>
                <select value={timezone} onChange={(event) => setTimezone(event.target.value as 'local' | 'utc')} style={inputStyle}>
                  <option value="local">Local</option>
                  <option value="utc">GMT/UTC</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleConvertDate}
                style={{
                  background: '#f973ac',
                  color: '#020617',
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px 18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Date to timestamp
              </button>
              <span style={{ color: '#94a3b8', fontSize: 14 }}>Converted values appear below.</span>
            </div>

            {dateError && <div style={{ color: '#f87171', fontSize: 14 }}>{dateError}</div>}

            {dateResult && (
              <div style={{ padding: 18, borderRadius: 14, background: '#020617', border: '1px solid #334155' }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#cbd5e1', fontWeight: 700 }}>Unix seconds</div>
                  <div style={{ marginTop: 4 }}>{dateResult.seconds}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#cbd5e1', fontWeight: 700 }}>Milliseconds</div>
                  <div style={{ marginTop: 4 }}>{dateResult.milliseconds}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#cbd5e1', fontWeight: 700 }}>Microseconds</div>
                  <div style={{ marginTop: 4 }}>{dateResult.microseconds}</div>
                </div>
                <div>
                  <div style={{ color: '#cbd5e1', fontWeight: 700 }}>Nanoseconds</div>
                  <div style={{ marginTop: 4 }}>{dateResult.nanoseconds}</div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
