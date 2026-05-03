export function toList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => `${entry ?? ''}`.trim()).filter(Boolean)
  }

  return `${value ?? ''}`
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function validateMode(config = {}, expectedFlag) {
  return `${config.mode ?? ''}`.trim() === expectedFlag
}
