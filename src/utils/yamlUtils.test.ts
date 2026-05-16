import { describe, expect, it } from 'vitest'
import { formatJson, formatYaml, jsonToYaml, yamlToJson } from './yamlUtils'

describe('yamlUtils', () => {
  it('converts yaml to json object', () => {
    expect(yamlToJson('name: alice\nage: 21\nactive: true')).toEqual({
      name: 'alice',
      age: 21,
      active: true,
    })
  })

  it('converts json to formatted yaml', () => {
    expect(jsonToYaml('{"name":"alice","age":21}')).toBe('name: alice\nage: 21')
  })

  it('formats json consistently', () => {
    expect(formatJson('{"a":1,"b":{"c":2}}')).toBe(`{
  "a": 1,
  "b": {
    "c": 2
  }
}`)
  })

  it('formats yaml consistently', () => {
    expect(formatYaml('name: alice\nage: 21')).toBe('name: alice\nage: 21')
  })
})
