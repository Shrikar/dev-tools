export function validateJSON(input: string) {
  if (!input) return null
  return JSON.parse(input)
}

export function formatJSON(obj: any) {
  return JSON.stringify(obj, null, 2)
}
