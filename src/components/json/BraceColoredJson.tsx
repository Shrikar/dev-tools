interface BraceColoredJsonProps {
  jsonText: string
}

const BRACE_COLORS = ['#60a5fa', '#38bdf8', '#22d3ee', '#34d399', '#a3e635', '#f59e0b']

interface Token {
  text: string
  color?: string
}

function tokenizeBraces(input: string): Token[] {
  const tokens: Token[] = []
  let depth = 0

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]

    if (ch === '{' || ch === '[') {
      const color = BRACE_COLORS[depth % BRACE_COLORS.length]
      tokens.push({ text: ch, color })
      depth += 1
      continue
    }

    if (ch === '}' || ch === ']') {
      depth = Math.max(0, depth - 1)
      const color = BRACE_COLORS[depth % BRACE_COLORS.length]
      tokens.push({ text: ch, color })
      continue
    }

    tokens.push({ text: ch })
  }

  return tokens
}

export default function BraceColoredJson({ jsonText }: BraceColoredJsonProps) {
  const tokens = tokenizeBraces(jsonText)

  return (
    <pre className="brace-json">
      {tokens.map((token, index) => (
        <span key={index} style={token.color ? { color: token.color, fontWeight: 700 } : undefined}>
          {token.text}
        </span>
      ))}
    </pre>
  )
}
