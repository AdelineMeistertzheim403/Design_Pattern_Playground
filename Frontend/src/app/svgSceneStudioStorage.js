const SVG_SCENE_STUDIO_DOCUMENTS_KEY = 'dpp_svg_scene_studio_documents'
const SVG_SCENE_STUDIO_CURRENT_KEY = 'dpp_svg_scene_studio_current'

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

export function loadSavedSvgSceneStudioDocuments() {
  const value = readJson(SVG_SCENE_STUDIO_DOCUMENTS_KEY, [])
  return Array.isArray(value) ? value : []
}

export function saveSvgSceneStudioDocument(documentRecord) {
  const existingDocuments = loadSavedSvgSceneStudioDocuments()
  const nextDocuments = [
    documentRecord,
    ...existingDocuments.filter((item) => item.id !== documentRecord.id),
  ]

  writeLocalJson(SVG_SCENE_STUDIO_DOCUMENTS_KEY, nextDocuments)
  return nextDocuments
}

export function findSavedSvgSceneStudioDocument(documentId) {
  return loadSavedSvgSceneStudioDocuments().find((item) => item.id === documentId) ?? null
}

export function saveCurrentSvgSceneStudioDocument(documentRecord) {
  writeSessionJson(SVG_SCENE_STUDIO_CURRENT_KEY, documentRecord)
}

export function loadCurrentSvgSceneStudioDocument() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.sessionStorage.getItem(SVG_SCENE_STUDIO_CURRENT_KEY)
    return rawValue ? JSON.parse(rawValue) : null
  } catch {
    return null
  }
}
