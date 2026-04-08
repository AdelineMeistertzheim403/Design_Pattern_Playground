export function normalizeInteger(value, fallbackValue, minimum, maximum) {
  const parsed = Math.round(Number(value ?? fallbackValue))

  if (!Number.isFinite(parsed)) {
    return fallbackValue
  }

  return Math.min(maximum, Math.max(minimum, parsed))
}

export function roundToSingleDecimal(value) {
  return Math.round(value * 10) / 10
}

export function normalizeUniqueList(rawValue) {
  return (Array.isArray(rawValue) ? rawValue : `${rawValue ?? ''}`.split(','))
    .map((value) => `${value}`.trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
}

export function normalizeOrderedList(rawValue) {
  return (Array.isArray(rawValue) ? rawValue : `${rawValue ?? ''}`.split(','))
    .map((value) => `${value}`.trim())
    .filter(Boolean)
}

export function normalizeOrderedUniqueList(rawValue) {
  return normalizeOrderedList(rawValue)
    .map((value) => value.toUpperCase())
    .filter((value, index, array) => array.indexOf(value) === index)
}

export function numericStat(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
