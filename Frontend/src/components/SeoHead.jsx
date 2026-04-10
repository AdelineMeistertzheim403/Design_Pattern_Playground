import { useEffect } from 'react'

const SITE_NAME = 'Design Pattern Playground'
const DEFAULT_DESCRIPTION = 'Comprendre les design patterns grace a des demonstrations interactives, des schemas UML et des quiz.'
const DEFAULT_IMAGE_PATH = '/logo.png'

function normalizeOrigin(rawValue) {
  return `${rawValue ?? ''}`.trim().replace(/\/$/, '')
}

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

function buildSeoPayload(pageKind, selectedPattern) {
  if (pageKind === 'pattern' && selectedPattern) {
    return {
      description: `Decouvre le pattern ${selectedPattern.name} : definition, cas d usage, schema UML et demonstration interactive pour mieux comprendre son fonctionnement.`,
      robots: 'index,follow',
      title: `${selectedPattern.name} : UML, explication et demo interactive | ${SITE_NAME}`,
      type: 'article',
    }
  }

  if (pageKind === 'quiz' && selectedPattern) {
    return {
      description: `Quiz de validation consacre au pattern ${selectedPattern.name}.`,
      robots: 'noindex,follow',
      title: `Quiz ${selectedPattern.name} | ${SITE_NAME}`,
      type: 'website',
    }
  }

  if (pageKind === 'progress') {
    return {
      description: 'Tableau de bord personnel de progression et de resultats sur les quiz.',
      robots: 'noindex,follow',
      title: `Ma progression | ${SITE_NAME}`,
      type: 'website',
    }
  }

  if (pageKind === 'legalNotice') {
    return {
      description: 'Mentions legales, hebergement, politique de confidentialite et informations sur les donnees personnelles du site.',
      robots: 'index,follow',
      title: `Mentions legales et confidentialite | ${SITE_NAME}`,
      type: 'website',
    }
  }

  if (pageKind === 'notFound') {
    return {
      description: 'La page demandee est introuvable.',
      robots: 'noindex,follow',
      title: `Page introuvable | ${SITE_NAME}`,
      type: 'website',
    }
  }

  return {
    description: DEFAULT_DESCRIPTION,
    robots: 'index,follow',
    title: `${SITE_NAME} | Apprendre les design patterns avec des demos interactives`,
    type: 'website',
  }
}

export default function SeoHead({
  pageKind,
  selectedPattern,
}) {
  useEffect(() => {
    const payload = buildSeoPayload(pageKind, selectedPattern)
    const configuredSiteUrl = normalizeOrigin(import.meta.env.VITE_SITE_URL)
    const currentOrigin = normalizeOrigin(window.location.origin)
    const siteOrigin = configuredSiteUrl || currentOrigin
    const canonicalUrl = `${siteOrigin}${window.location.pathname}`
    const imageUrl = `${siteOrigin}${DEFAULT_IMAGE_PATH}`

    document.title = payload.title

    upsertMeta('meta[name="description"]', { name: 'description' }, payload.description)
    upsertMeta('meta[name="robots"]', { name: 'robots' }, payload.robots)
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, payload.title)
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, payload.description)
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, payload.type)
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl)
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, imageUrl)
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt' }, 'Logo Design Pattern Playground')
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, SITE_NAME)
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale' }, 'fr_FR')
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, payload.title)
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, payload.description)
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, imageUrl)
    upsertLink('canonical', canonicalUrl)
  }, [pageKind, selectedPattern])

  return null
}
