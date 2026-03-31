const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const API_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, '')
  : ''

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
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

export function executePattern(payload) {
  return request('/api/patterns/execute', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
