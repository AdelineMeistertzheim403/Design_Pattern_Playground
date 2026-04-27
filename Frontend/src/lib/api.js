const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const API_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, '')
  : ''

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    throw new Error(payload?.message ?? `Request failed with status ${response.status}`)
  }

  return payload
}

export function getPatterns() {
  return request('/api/patterns')
}

export function getPattern(code) {
  return request(`/api/patterns/${code}`)
}

export function getPatternSchema(code) {
  return request(`/api/patterns/${code}/schema`)
}

export function getPatternUml(code) {
  return request(`/api/patterns/${code}/uml`)
}

export function getPatternSvgScene(code) {
  return request(`/api/patterns/${code}/svg-scene`)
}

export function getPatternQuiz(code) {
  return request(`/api/patterns/${code}/quiz`)
}

export function getPatternQuizProgress(code) {
  return request(`/api/patterns/${code}/quiz/progress`)
}

export function submitPatternQuiz(code, payload) {
  return request(`/api/patterns/${code}/quiz/submissions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getQuizDashboard() {
  return request('/api/quiz/dashboard')
}

export function executePattern(payload) {
  return request('/api/patterns/execute', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerUser(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginUser(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function refreshUserSession() {
  return request('/api/auth/refresh', {
    method: 'POST',
  })
}

export function getCurrentUser() {
  return request('/api/auth/me')
}

export function logoutUser() {
  return request('/api/auth/logout', {
    method: 'POST',
  })
}

export function changeUserPassword(payload) {
  return request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function listAdminUmlDiagrams() {
  return request('/api/admin/uml-diagrams')
}

export function saveAdminUmlDiagram(code, payload) {
  return request(`/api/admin/uml-diagrams/${code}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function listAdminSvgScenes() {
  return request('/api/admin/svg-scenes')
}

export function getAdminSvgScene(code) {
  return request(`/api/admin/svg-scenes/${code}`)
}

export function saveAdminSvgScene(code, payload) {
  return request(`/api/admin/svg-scenes/${code}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
