export function toISO(input: string){
  const n = Number(input)
  if (Number.isNaN(n)) return 'Invalid epoch'
  return new Date(n * 1000).toISOString()
}

export function fromISO(input: string){
  const d = new Date(input)
  if (isNaN(d.getTime())) return 'Invalid date'
  return Math.floor(d.getTime() / 1000).toString()
}
