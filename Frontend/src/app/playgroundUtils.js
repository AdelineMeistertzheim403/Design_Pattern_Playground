import { AUTH_USER_STORAGE_KEY, patternFieldUi } from './playgroundConstants'

function splitListValue(rawValue) {
  return `${rawValue ?? ''}`
    .replace(/\r/g, '')
    .split(/\n|,/)
    .map((value) => value.trim())
    .filter(Boolean)
}

export function buildPatternPath(code) {
  return `/patterns/${code}`
}

export function buildPatternQuizPath(code) {
  return `/patterns/${code}/quiz`
}

export function buildProgressPath() {
  return '/progression'
}

export function parseRoute(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/'

  if (normalized === '/') {
    return { name: 'home' }
  }

  if (normalized === '/progression') {
    return { name: 'progress' }
  }

  const quizMatch = normalized.match(/^\/patterns\/([a-z0-9-]+)\/quiz$/)
  if (quizMatch) {
    return {
      name: 'quiz',
      code: quizMatch[1],
    }
  }

  const patternMatch = normalized.match(/^\/patterns\/([a-z0-9-]+)$/)
  if (patternMatch) {
    return {
      name: 'pattern',
      code: patternMatch[1],
    }
  }

  return { name: 'notFound' }
}

export function buildInitialParameters(schema) {
  return Object.fromEntries(
    (schema?.fields ?? []).map((field) => {
      if (field.defaultValue !== null && field.defaultValue !== undefined) {
        if (field.type === 'BOOLEAN') {
          return [field.name, field.defaultValue === 'true']
        }

        if (field.type === 'LIST') {
          return [field.name, splitListValue(field.defaultValue)]
        }

        return [field.name, field.defaultValue]
      }

      if (field.type === 'BOOLEAN') {
        return [field.name, false]
      }

      if (field.type === 'LIST') {
        return [field.name, []]
      }

      return [field.name, '']
    }),
  )
}

export function normalizeParameters(schema, formValues) {
  return Object.fromEntries(
    (schema?.fields ?? []).map((field) => {
      const rawValue = formValues[field.name]

      if (field.type === 'NUMBER') {
        return [field.name, rawValue === '' ? null : Number(rawValue)]
      }

      if (field.type === 'BOOLEAN') {
        return [field.name, Boolean(rawValue)]
      }

      if (field.type === 'LIST') {
        if (Array.isArray(rawValue)) {
          return [field.name, rawValue]
        }

        return [field.name, splitListValue(rawValue)]
      }

      return [field.name, rawValue]
    }),
  )
}

export function formatOutputValue(value) {
  return typeof value === 'object' && value !== null
    ? JSON.stringify(value, null, 2)
    : `${value}`
}

export function getNumericFieldUi(patternCode, fieldName) {
  return patternFieldUi[patternCode]?.[fieldName] ?? null
}

export function getBooleanStateLabel(patternCode, fieldName, value) {
  if (patternCode === 'flyweight' && fieldName === 'useFlyweight') {
    return value ? 'Avec Flyweight' : 'Sans Flyweight'
  }

  return value ? 'Actif' : 'Inactif'
}

export function persistSession(user) {
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearPersistedSession() {
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

export function loadPersistedUser() {
  const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}
