# Dev Tools

Privacy-first developer utilities that run entirely in your browser.

## Included Tools

- JWT Decoder and HS256 signature verification
- Hash Generator (SHA-256, SHA-512, MD5)
- JSON Formatter (format, minify, sorted keys)
- JSON Compare
- JSON Path Explorer (click-to-path + path-to-value)
- Base64 Encode/Decode
- UUID Generator and Validator
- URL Encode/Decode
- Timestamp Converter

## Live demo

  - Visit the live site: https://shrikar.github.io/dev-tools
    
  - You can navigate directly to specific tools using the route paths (examples):
    - Home: /#/
    - JSON Formatter: /#/json-formatter
    - JSON Compare: /#/json-compare
    - JWT Decoder: /#/jwt-decoder
    - Base64: /#/base64
    - Hash Generator: /#/hash-generator
    - UUID Generator: /#/uuid-generator
    - URL Encode/Decode: /#/url-encode-decode
    - Timestamp Converter: /#/timestamp-converter

## Tech Stack

- React 19 + TypeScript
- Vite + React Router (HashRouter for GitHub Pages)
- Vitest for unit tests
- GitHub Actions for CI + Pages deploy

## Local Development

```bash
npm ci
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run test
npm run build
```

## Deployment

- GitHub Pages deploys from `main` via `.github/workflows/deploy.yml`
- Vite base path is set to `/dev-tools/`

## Architecture Notes

- `src/pages`: route-level pages
- `src/tools`: tool feature components
- `src/utils`: pure utility functions and tests
- `src/components/layout`: app shell + navigation
- `src/config/tools.ts`: navigation and SEO metadata source of truth
