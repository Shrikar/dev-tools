import { useMemo, useState } from 'react'
import MonacoTextEditor from '../components/editor/MonacoTextEditor'
import './tool-shell.css'

type Frequency = 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly'

const WEEKDAYS = [
  { label: 'SUN', value: '0' },
  { label: 'MON', value: '1' },
  { label: 'TUE', value: '2' },
  { label: 'WED', value: '3' },
  { label: 'THU', value: '4' },
  { label: 'FRI', value: '5' },
  { label: 'SAT', value: '6' },
]

const PRESETS: Array<{ label: string; apply: () => Partial<{ frequency: Frequency; minute: string; hour: string; weekday: string; dayOfMonth: string }> }> = [
  { label: 'Every minute', apply: () => ({ frequency: 'minutely', minute: '*' }) },
  { label: 'Every hour', apply: () => ({ frequency: 'hourly', minute: '0' }) },
  { label: 'Daily at midnight', apply: () => ({ frequency: 'daily', hour: '0', minute: '0' }) },
  { label: 'Monday at 9am', apply: () => ({ frequency: 'weekly', weekday: '1', hour: '9', minute: '0' }) },
  { label: '1st of month', apply: () => ({ frequency: 'monthly', dayOfMonth: '1', hour: '0', minute: '0' }) },
  { label: 'Weekly (Sunday)', apply: () => ({ frequency: 'weekly', weekday: '0', hour: '0', minute: '0' }) },
]

export default function CronBuilderTool() {
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('0')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [weekday, setWeekday] = useState('1')

  const cron = useMemo(() => {
    if (frequency === 'minutely') return '* * * * *'
    if (frequency === 'hourly') return `${minute} * * * *`
    if (frequency === 'daily') return `${minute} ${hour} * * *`
    if (frequency === 'weekly') return `${minute} ${hour} * * ${weekday}`
    return `${minute} ${hour} ${dayOfMonth} * *`
  }, [frequency, minute, hour, weekday, dayOfMonth])

  const summary = useMemo(() => {
    if (frequency === 'minutely') return 'Every minute'
    if (frequency === 'hourly') return `At minute ${minute}, every hour`
    if (frequency === 'daily') return `At ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}, every day`
    if (frequency === 'weekly') {
      const label = WEEKDAYS.find((item) => item.value === weekday)?.label ?? weekday
      return `At ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}, every ${label}`
    }
    return `At ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}, on day ${dayOfMonth} of every month`
  }, [frequency, minute, hour, weekday, dayOfMonth])

  const applyPreset = (presetLabel: string) => {
    const preset = PRESETS.find((item) => item.label === presetLabel)
    if (!preset) return
    const next = preset.apply()
    if (next.frequency) setFrequency(next.frequency)
    if (next.minute !== undefined) setMinute(next.minute)
    if (next.hour !== undefined) setHour(next.hour)
    if (next.weekday !== undefined) setWeekday(next.weekday)
    if (next.dayOfMonth !== undefined) setDayOfMonth(next.dayOfMonth)
  }

  return (
    <div className="tool-shell">
      <section className="tool-card" style={{ display: 'grid', gap: 14 }}>
        <div style={{ color: '#cbd5e1', fontSize: 14 }}>Quick Presets</div>
        <div className="tool-actions" style={{ marginTop: 0 }}>
          {PRESETS.map((preset) => (
            <button key={preset.label} className="tool-button secondary" onClick={() => applyPreset(preset.label)}>
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section className="tool-card" style={{ display: 'grid', gap: 12 }}>
        <div className="tool-actions" style={{ marginTop: 0 }}>
          <label>Frequency</label>
          <select className="tool-select" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} style={{ maxWidth: 220 }}>
            <option value="minutely">Every minute</option>
            <option value="hourly">Every hour</option>
            <option value="daily">Every day</option>
            <option value="weekly">Every week</option>
            <option value="monthly">Every month</option>
          </select>
        </div>

        <div className="tool-actions" style={{ marginTop: 0 }}>
          {frequency !== 'minutely' && (
            <>
              <label>At minute</label>
              <input className="tool-input" value={minute} onChange={(e) => setMinute(e.target.value)} style={{ maxWidth: 90 }} />
            </>
          )}
          {frequency !== 'minutely' && frequency !== 'hourly' && (
            <>
              <label>At hour</label>
              <input className="tool-input" value={hour} onChange={(e) => setHour(e.target.value)} style={{ maxWidth: 90 }} />
            </>
          )}
          {frequency === 'weekly' && (
            <>
              <label>Weekday</label>
              <select className="tool-select" value={weekday} onChange={(e) => setWeekday(e.target.value)} style={{ maxWidth: 140 }}>
                {WEEKDAYS.map((day) => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </>
          )}
          {frequency === 'monthly' && (
            <>
              <label>Day of month</label>
              <input className="tool-input" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} style={{ maxWidth: 110 }} />
            </>
          )}
        </div>
      </section>

      <section className="tool-card" style={{ display: 'grid', gap: 10 }}>
        <label style={{ color: '#93c5fd', fontSize: 13 }}>Your cron expression</label>
        <MonacoTextEditor value={cron} readOnly height="70px" language="plaintext" />
        <div className="tool-actions" style={{ marginTop: 0 }}>
          <button className="tool-button secondary" onClick={() => navigator.clipboard.writeText(cron)}>Copy</button>
        </div>

        <label style={{ color: '#93c5fd', fontSize: 13 }}>In plain English</label>
        <MonacoTextEditor value={summary} readOnly height="70px" language="plaintext" />
      </section>
    </div>
  )
}
