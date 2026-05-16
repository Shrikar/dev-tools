import { parse, stringify } from 'yaml'

export function yamlToJson(input: string): unknown {
  const parsed = parse(input)
  if (parsed === null || parsed === undefined) {
    return {}
  }
  return parsed
}

export function jsonToYaml(input: string): string {
  const parsed = JSON.parse(input)
  return stringify(parsed, {
    indent: 2,
    lineWidth: 0,
    minContentWidth: 0,
  }).trim()
}

export function formatYaml(input: string): string {
  const parsed = yamlToJson(input)
  return stringify(parsed, {
    indent: 2,
    lineWidth: 0,
    minContentWidth: 0,
  }).trim()
}

export function formatJson(input: string): string {
  return JSON.stringify(JSON.parse(input), null, 2)
}
