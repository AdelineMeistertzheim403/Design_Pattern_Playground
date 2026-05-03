import { useEffect } from 'react'
import {
  buildPageSeoPayload,
  buildStructuredData,
  normalizeOrigin,
  SITE_NAME,
} from '../seo/pageSeo'

function upsertMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

function upsertStructuredData(payloads) {
  let element = document.head.querySelector('script[data-seo-id="structured-data"]')

  if (!payloads.length) {
    element?.remove()
    return
  }

  if (!element) {
    element = document.createElement('script')
    element.setAttribute('type', 'application/ld+json')
    element.setAttribute('data-seo-id', 'structured-data')
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(payloads.length === 1 ? payloads[0] : payloads)
}

export default function SeoHead({
  learningContent,
  pageKind,
  patterns,
  selectedPattern,
}) {
  useEffect(() => {
    const configuredSiteUrl = normalizeOrigin(import.meta.env.VITE_SITE_URL)
    const currentOrigin = normalizeOrigin(window.location.origin)
    const siteOrigin = configuredSiteUrl || currentOrigin
    const pathname = window.location.pathname
    const payload = buildPageSeoPayload({
      learningContent,
      pageKind,
      pathname,
      selectedPattern,
      siteOrigin,
    })
    const structuredData = buildStructuredData({
      learningContent,
      pageKind,
      pathname,
      patterns,
      selectedPattern,
      siteOrigin,
    })

    document.title = payload.title

    upsertMeta('meta[name="description"]', { name: 'description' }, payload.description)
    upsertMeta('meta[name="robots"]', { name: 'robots' }, payload.robots)
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, payload.title)
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, payload.description)
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, payload.type)
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, payload.canonicalUrl)
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, payload.imageUrl)
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt' }, 'Logo Design Pattern Playground')
    if (payload.imageWidth) {
      upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width' }, payload.imageWidth)
      upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height' }, payload.imageHeight)
    }
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, SITE_NAME)
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale' }, 'fr_FR')
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, payload.title)
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, payload.description)
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, payload.imageUrl)
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt' }, 'Logo Design Pattern Playground')
    upsertLink('canonical', payload.canonicalUrl)
    upsertStructuredData(structuredData)
  }, [learningContent, pageKind, patterns, selectedPattern])

  return null
}
