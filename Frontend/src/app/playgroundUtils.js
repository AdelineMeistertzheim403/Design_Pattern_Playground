import { AUTH_USER_STORAGE_KEY, patternFieldUi } from './playgroundConstants'

const patternUseCaseCategoriesByCode = {
  'abstract-factory': 'CREATION',
  adapter: 'COMPOSITION',
  builder: 'CREATION',
  bridge: 'COMPOSITION',
  chain: 'FLOW',
  command: 'FLOW',
  decorator: 'COMPOSITION',
  facade: 'COMPOSITION',
  factory: 'CREATION',
  flyweight: 'OPTIMISATION',
  iterator: 'FLOW',
  mediator: 'COMMUNICATION',
  memento: 'FLOW',
  observer: 'COMMUNICATION',
  prototype: 'CREATION',
  proxy: 'INFRA',
  singleton: 'INFRA',
  state: 'FLOW',
  strategy: 'FLOW',
  template: 'FLOW',
  visitor: 'OPTIMISATION',
}

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

export function buildAdminUmlPath() {
  return '/admin/uml'
}

export function buildBadgesPath() {
  return '/progression/badges'
}

export function buildRecentActivityPath() {
  return '/progression/activite'
}

export function buildMissionPath(missionId = '') {
  const normalizedMissionId = `${missionId ?? ''}`.trim()
  return normalizedMissionId ? `/missions/${normalizedMissionId}` : '/missions'
}

export function buildLegalNoticePath() {
  return '/mentions-legales'
}

export function parseRoute(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/'

  if (normalized === '/') {
    return { name: 'home' }
  }

  if (normalized === '/progression') {
    return { name: 'progress' }
  }

  if (normalized === '/admin/uml') {
    return { name: 'adminUml' }
  }

  if (normalized === '/progression/badges') {
    return { name: 'badges' }
  }

  if (normalized === '/progression/activite') {
    return { name: 'activity' }
  }

  if (normalized === '/mentions-legales') {
    return { name: 'legalNotice' }
  }

  if (normalized === '/missions') {
    return { name: 'missions' }
  }

  const missionMatch = normalized.match(/^\/missions\/([a-z0-9-]+)$/)
  if (missionMatch) {
    return {
      name: 'missions',
      missionId: missionMatch[1],
    }
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

export function inferPatternUseCaseCategory(pattern) {
  const code = `${pattern?.code ?? ''}`.trim().toLowerCase()
  if (patternUseCaseCategoriesByCode[code]) {
    return patternUseCaseCategoriesByCode[code]
  }

  const haystack = `${pattern?.description ?? ''} ${pattern?.useCase ?? ''}`.toLowerCase()

  if (/(clon|assembl|creation|constructeur|fabriq)/.test(haystack)) {
    return 'CREATION'
  }

  if (/(notif|chat|message|abonn|orchestr)/.test(haystack)) {
    return 'COMMUNICATION'
  }

  if (/(etat|transition|commande|undo|workflow|pipeline|algorithme|requete)/.test(haystack)) {
    return 'FLOW'
  }

  if (/(adapter|decorat|facade|interface|sous-systeme|couche|compose)/.test(haystack)) {
    return 'COMPOSITION'
  }

  if (/(memoire|optimis|scanner|analyse|parcour|arbre|visitor)/.test(haystack)) {
    return 'OPTIMISATION'
  }

  return 'INFRA'
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
