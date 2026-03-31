const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const API_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, '')
  : ''

async function request(path) {
  const response = await fetch(`${API_URL}${path}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export function getPatterns() {
  return request('/api/patterns')
}

export function getPatternDetail(slug) {
  return request(`/api/patterns/${slug}`)
}

export function getPatternPreview(slug, format) {
  return request(`/api/patterns/${slug}/preview?format=${format}`)
}
