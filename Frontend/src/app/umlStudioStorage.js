const UML_STUDIO_DOCUMENTS_KEY = 'dpp_uml_studio_documents'
const UML_STUDIO_PENDING_KEY = 'dpp_uml_studio_pending'
const UML_STUDIO_CURRENT_KEY = 'dpp_uml_studio_current'

function readJson(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const rawValue = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallbackValue
  } catch {
    return fallbackValue
  }
}

function writeLocalJson(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function writeSessionJson(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(key, JSON.stringify(value))
}

export function loadSavedUmlStudioDocuments() {
  const value = readJson(UML_STUDIO_DOCUMENTS_KEY, [])
  return Array.isArray(value) ? value : []
}

export function saveUmlStudioDocument(documentRecord) {
  const existingDocuments = loadSavedUmlStudioDocuments()
  const nextDocuments = [
    documentRecord,
    ...existingDocuments.filter((item) => item.id !== documentRecord.id),
  ]

  writeLocalJson(UML_STUDIO_DOCUMENTS_KEY, nextDocuments)
  return nextDocuments
}

export function findSavedUmlStudioDocument(documentId) {
  return loadSavedUmlStudioDocuments().find((item) => item.id === documentId) ?? null
}

export function savePendingUmlStudioLaunch(payload) {
  writeSessionJson(UML_STUDIO_PENDING_KEY, payload)
}

export function consumePendingUmlStudioLaunch() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.sessionStorage.getItem(UML_STUDIO_PENDING_KEY)
    window.sessionStorage.removeItem(UML_STUDIO_PENDING_KEY)
    return rawValue ? JSON.parse(rawValue) : null
  } catch {
    window.sessionStorage.removeItem(UML_STUDIO_PENDING_KEY)
    return null
  }
}

export function saveCurrentUmlStudioDocument(documentRecord) {
  writeSessionJson(UML_STUDIO_CURRENT_KEY, documentRecord)
}

export function loadCurrentUmlStudioDocument() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.sessionStorage.getItem(UML_STUDIO_CURRENT_KEY)
    return rawValue ? JSON.parse(rawValue) : null
  } catch {
    return null
  }
}
