// Helpers pour le wrapping et les tailles de texte des libelles UML.

const NO_SPACE_BEFORE_TOKENS = new Set([',', '.', ';', ':', ')', ']', '}', '>', '<', '(', '[', '{'])
const NO_SPACE_AFTER_CHARACTERS = new Set(['<', '(', '[', '{'])

function splitLongToken(token, maxChunkLength = 12) {
  if (!token || token.length <= maxChunkLength) {
    return [token]
  }

  const parts = []
  let cursor = 0

  while (cursor < token.length) {
    parts.push(token.slice(cursor, cursor + maxChunkLength))
    cursor += maxChunkLength
  }

  return parts
}

function tokenizeForWrap(text) {
  return `${text ?? ''}`
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([<>(){}\[\],.:;])/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .flatMap((token) => (
      /^[<>(){}\[\],.:;]$/.test(token)
        ? [token]
        : splitLongToken(token)
    ))
}

function appendToken(line, token) {
  if (!line) {
    return token
  }

  const lastCharacter = line[line.length - 1]

  if (NO_SPACE_BEFORE_TOKENS.has(token) || NO_SPACE_AFTER_CHARACTERS.has(lastCharacter)) {
    return `${line}${token}`
  }

  return `${line} ${token}`
}

export function wrapText(text, maxLength = 28) {
  if (!text) {
    return []
  }

  const words = tokenizeForWrap(text)
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const candidate = appendToken(currentLine, word)
    if (candidate.length <= maxLength) {
      currentLine = candidate
      continue
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export function estimateTextWidth(text, fontSize) {
  return `${text ?? ''}`.length * fontSize * 0.58
}

export function getFittedFontSize(lines, baseFontSize, minimumFontSize, availableWidth) {
  if (!lines?.length || availableWidth <= 0) {
    return baseFontSize
  }

  const widestLine = Math.max(...lines.map((line) => estimateTextWidth(line, baseFontSize)))
  if (widestLine <= availableWidth) {
    return baseFontSize
  }

  const scaledFontSize = Math.floor(baseFontSize * (availableWidth / widestLine))
  return Math.max(minimumFontSize, Math.min(baseFontSize, scaledFontSize))
}
