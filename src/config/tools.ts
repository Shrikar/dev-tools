export interface ToolConfig {
  name: string
  path: string
  icon: string
  title: string
  description: string
}

export const tools: ToolConfig[] = [
  {
    name: 'Home',
    path: '/',
    icon: '⌂',
    title: 'Dev Tools',
    description: 'Privacy-first browser utilities for JSON, JWT, Base64, hashes, UUID, URLs, and timestamps.',
  },
  {
    name: 'REST Client',
    path: '/rest-client',
    icon: 'API',
    title: 'REST Client',
    description: 'Browser-only HTTP client with .http upload/download support.',
  },
  {
    name: 'JSON Formatter',
    path: '/json-formatter',
    icon: '{}',
    title: 'JSON Formatter',
    description: 'Validate, format, minify, and normalize JSON payloads in your browser.',
  },
  {
    name: 'JSON Compare',
    path: '/json-compare',
    icon: '⇄',
    title: 'JSON Compare',
    description: 'Compare two JSON payloads and inspect added, removed, and changed keys.',
  },
  {
    name: 'JSON Path',
    path: '/json-path',
    icon: 'JP',
    title: 'JSON Path Explorer',
    description: 'Click JSON fields to capture paths and resolve values by path.',
  },
  {
    name: 'JSON Escape',
    path: '/json-escape',
    icon: '\\"',
    title: 'JSON Escape Java String',
    description: 'Escape JSON so it can be pasted as a Java-style string literal.',
  },
  {
    name: 'YAML ↔ JSON',
    path: '/yaml-json-converter',
    icon: 'YJ',
    title: 'YAML JSON Converter',
    description: 'Convert between YAML and JSON formats.',
  },
  {
    name: 'Cron Helper',
    path: '/cron-expression-helper',
    icon: 'CR',
    title: 'Cron Expression Helper',
    description: 'Validate and describe 5-part cron expressions.',
  },
  {
    name: 'JWT Decoder',
    path: '/jwt-decoder',
    icon: 'JWT',
    title: 'JWT Decoder',
    description: 'Decode JWT headers and payloads and verify HS256 signatures locally.',
  },
  {
    name: 'Base64',
    path: '/base64',
    icon: '64',
    title: 'Base64 Encode Decode',
    description: 'Encode and decode Base64 strings with UTF-8-safe handling.',
  },
  {
    name: 'Hash Generator',
    path: '/hash-generator',
    icon: '#',
    title: 'Hash Generator',
    description: 'Generate SHA-256, SHA-512, and MD5 hashes instantly in your browser.',
  },
  {
    name: 'UUID Generator',
    path: '/uuid-generator',
    icon: 'ID',
    title: 'UUID Generator',
    description: 'Generate UUID v1/v3/v4/v5 and validate UUID strings.',
  },
  {
    name: 'URL Encode/Decode',
    path: '/url-encode-decode',
    icon: 'URL',
    title: 'URL Encode Decode',
    description: 'Encode and decode URL-safe strings.',
  },
  {
    name: 'Timestamp Converter',
    path: '/timestamp-converter',
    icon: '⏱',
    title: 'Timestamp Converter',
    description: 'Convert epoch and human-readable date/time values in both directions.',
  },
]

export const defaultMeta = {
  title: 'Dev Tools',
  description: 'All-in-one browser utilities for developers.',
}
