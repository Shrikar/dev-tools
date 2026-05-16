export interface SubToolConfig {
  id: string
  name: string
  slug: string
  title: string
  description: string
}

export interface CategoryConfig {
  id: string
  name: string
  path: string
  icon: string
  title: string
  description: string
  defaultToolSlug: string
  tools: SubToolConfig[]
}

export interface StandaloneToolConfig {
  id: string
  name: string
  path: string
  icon: string
  title: string
  description: string
}

export const categories: CategoryConfig[] = [
  {
    id: 'json',
    name: 'JSON Suite',
    path: '/json',
    icon: '{}',
    title: 'JSON Suite',
    description: 'Formatter, compare, path explorer, and JSON escape tools.',
    defaultToolSlug: 'formatter',
    tools: [
      { id: 'json.formatter', name: 'Formatter', slug: 'formatter', title: 'JSON Formatter', description: 'Format, minify, and sort JSON.' },
      { id: 'json.compare', name: 'Compare', slug: 'compare', title: 'JSON Compare', description: 'Compare two JSON payloads.' },
      { id: 'json.path', name: 'Path', slug: 'path', title: 'JSON Path Explorer', description: 'Find values by JSON path.' },
      { id: 'json.escape', name: 'Escape', slug: 'escape', title: 'JSON Escape', description: 'Escape/unescape JSON for string literals.' },
    ],
  },
  {
    id: 'jwt',
    name: 'JWT Suite',
    path: '/jwt',
    icon: 'JWT',
    title: 'JWT Suite',
    description: 'Decode/verify tokens and generate signed JWTs.',
    defaultToolSlug: 'decoder',
    tools: [
      { id: 'jwt.decoder', name: 'Decoder', slug: 'decoder', title: 'JWT Decoder', description: 'Decode and verify JWT tokens.' },
      { id: 'jwt.signer', name: 'Generator/Signer', slug: 'generator-signer', title: 'JWT Generator Signer', description: 'Generate and sign HS256 JWTs.' },
    ],
  },
  {
    id: 'cron',
    name: 'Cron Suite',
    path: '/cron',
    icon: 'CR',
    title: 'Cron Suite',
    description: 'Build and parse cron expressions with visual controls and readable output.',
    defaultToolSlug: 'builder',
    tools: [
      { id: 'cron.builder', name: 'Build Expression', slug: 'builder', title: 'Cron Builder', description: 'Build cron expression from schedule options.' },
      { id: 'cron.helper', name: 'Parse Expression', slug: 'helper', title: 'Cron Expression Parser', description: 'Parse and explain cron expressions.' },
    ],
  },
  {
    id: 'api',
    name: 'API Suite',
    path: '/api',
    icon: 'AP',
    title: 'API Suite',
    description: 'Converters and explorers for cURL, GraphQL, and OpenAPI workflows.',
    defaultToolSlug: 'curl-converter',
    tools: [
      { id: 'api.curl-converter', name: 'cURL Converter', slug: 'curl-converter', title: 'cURL Fetch HTTPie Converter', description: 'Convert cURL commands to fetch and HTTPie formats.' },
      { id: 'api.graphql', name: 'GraphQL', slug: 'graphql', title: 'GraphQL Runner Explorer', description: 'Run GraphQL queries and inspect schema introspection.' },
      { id: 'api.openapi', name: 'OpenAPI', slug: 'openapi', title: 'OpenAPI Viewer Request Generator', description: 'Inspect OpenAPI specs and generate request templates.' },
    ],
  },
]

export const standaloneTools: StandaloneToolConfig[] = [
  { id: 'shell', name: 'Shell', path: '/shell', icon: '>_', title: 'Dev Shell', description: 'Terminal-style command interface for tool navigation and quick transforms.' },
  { id: 'rest-client', name: 'REST Client', path: '/rest-client', icon: 'API', title: 'REST Client', description: 'Browser-only HTTP client with .http upload/download support.' },
  { id: 'yaml-json', name: 'YAML ↔ JSON', path: '/yaml-json-converter', icon: 'YJ', title: 'YAML JSON Converter', description: 'Convert between YAML and JSON formats.' },
  { id: 'base64', name: 'Base64', path: '/base64', icon: '64', title: 'Base64 Encode Decode', description: 'Encode and decode Base64 strings.' },
  { id: 'hash-generator', name: 'Hash Generator', path: '/hash-generator', icon: '#', title: 'Hash Generator', description: 'Generate SHA-256, SHA-512, and MD5 hashes.' },
  { id: 'uuid-generator', name: 'UUID Generator', path: '/uuid-generator', icon: 'ID', title: 'UUID Generator', description: 'Generate and validate UUID strings.' },
  { id: 'url-encode', name: 'URL Encode/Decode', path: '/url-encode-decode', icon: 'URL', title: 'URL Encode Decode', description: 'Encode and decode URL-safe strings.' },
  { id: 'timestamp', name: 'Timestamp Converter', path: '/timestamp-converter', icon: '⏱', title: 'Timestamp Converter', description: 'Convert epoch and date/time values.' },
]

export const legacyRedirects: Record<string, string> = {
  '/json-formatter': '/json/formatter',
  '/json-compare': '/json/compare',
  '/json-path': '/json/path',
  '/json-escape': '/json/escape',
  '/jwt-decoder': '/jwt/decoder',
  '/cron-expression-helper': '/cron/helper',
}

export const legacyPathToToolId: Record<string, string> = {
  '/json-formatter': 'json.formatter',
  '/json-compare': 'json.compare',
  '/json-path': 'json.path',
  '/json-escape': 'json.escape',
  '/jwt-decoder': 'jwt.decoder',
  '/cron-expression-helper': 'cron.helper',
  '/shell': 'shell',
  '/rest-client': 'rest-client',
  '/yaml-json-converter': 'yaml-json',
  '/base64': 'base64',
  '/hash-generator': 'hash-generator',
  '/uuid-generator': 'uuid-generator',
  '/url-encode-decode': 'url-encode',
  '/timestamp-converter': 'timestamp',
}

export const defaultMeta = {
  title: 'Dev Tools',
  description: 'All-in-one browser utilities for developers.',
}
