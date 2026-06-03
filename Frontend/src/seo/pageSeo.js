export const SITE_NAME = 'Design Pattern Playground'
export const DEFAULT_IMAGE_PATH = '/logo.png'
export const DEFAULT_DESCRIPTION = 'Comprendre les design patterns grace a des demonstrations interactives, des schemas UML et des quiz.'

function joinDescriptionParts(parts, maxLength = 175) {
  const filteredParts = parts
    .map((part) => `${part ?? ''}`.trim())
    .filter(Boolean)

  const combined = filteredParts.join(' ')

  if (combined.length <= maxLength) {
    return combined
  }

  return `${combined.slice(0, maxLength - 3).trimEnd()}...`
}

export function normalizeOrigin(rawValue) {
  return `${rawValue ?? ''}`.trim().replace(/\/$/, '')
}

export function buildPageSeoPayload({
  learningContent,
  pageKind,
  pathname = '/',
  selectedPattern,
  siteOrigin,
}) {
  const canonicalUrl = `${siteOrigin}${pathname}`
  const imageUrl = `${siteOrigin}${DEFAULT_IMAGE_PATH}`

  if (pageKind === 'pattern' && selectedPattern) {
    return {
      canonicalUrl,
      description: joinDescriptionParts([
        `${selectedPattern.name} : ${selectedPattern.description}`,
        `Cas d usage : ${selectedPattern.useCase}.`,
        learningContent?.strapline,
      ]),
      imageUrl,
      imageWidth: '1020',
      imageHeight: '235',
      robots: 'index,follow',
      title: `${selectedPattern.name} design pattern Java : explication, UML et demo interactive | ${SITE_NAME}`,
      type: 'article',
    }
  }

  if (pageKind === 'quiz' && selectedPattern) {
    return {
      canonicalUrl,
      description: `Quiz de validation consacre au pattern ${selectedPattern.name}.`,
      imageUrl,
      robots: 'noindex,follow',
      title: `Quiz ${selectedPattern.name} | ${SITE_NAME}`,
      type: 'website',
    }
  }

  if (pageKind === 'progress') {
    return {
      canonicalUrl,
      description: 'Tableau de bord personnel de progression et de resultats sur les quiz.',
      imageUrl,
      robots: 'noindex,follow',
      title: `Ma progression | ${SITE_NAME}`,
      type: 'website',
    }
  }

  if (pageKind === 'help') {
    return {
      canonicalUrl,
      description: "Centre d'aide pour configurer les design patterns, utiliser le mode mission et construire des diagrammes dans l'editeur UML.",
      imageUrl,
      imageWidth: '1020',
      imageHeight: '235',
      robots: 'index,follow',
      title: `Aide et fiches pedagogiques | ${SITE_NAME}`,
      type: 'website',
    }
  }

  if (pageKind === 'legalNotice') {
    return {
      canonicalUrl,
      description: 'Mentions legales, hebergement, politique de confidentialite et informations sur les donnees personnelles du site.',
      imageUrl,
      imageWidth: '1020',
      imageHeight: '235',
      robots: 'index,follow',
      title: `Mentions legales et confidentialite | ${SITE_NAME}`,
      type: 'website',
    }
  }

  if (pageKind === 'notFound') {
    return {
      canonicalUrl,
      description: 'La page demandee est introuvable.',
      imageUrl,
      robots: 'noindex,follow',
      title: `Page introuvable | ${SITE_NAME}`,
      type: 'website',
    }
  }

  return {
    canonicalUrl,
    description: 'Apprends les design patterns GoF en Java et Spring Boot avec des demos interactives, des schemas UML et des quiz. Exemples concrets en React.',
    imageUrl,
    imageWidth: '1020',
    imageHeight: '235',
    robots: 'index,follow',
    title: `${SITE_NAME} | Apprendre les design patterns Java avec demos interactives et UML`,
    type: 'website',
  }
}

export function buildStructuredData({
  learningContent,
  pageKind,
  pathname = '/',
  patterns = [],
  selectedPattern,
  siteOrigin,
}) {
  const canonicalUrl = `${siteOrigin}${pathname}`

  if (pageKind === 'pattern' && selectedPattern) {
    const article = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: `${selectedPattern.name} design pattern`,
      description: buildPageSeoPayload({
        learningContent,
        pageKind,
        pathname,
        selectedPattern,
        siteOrigin,
      }).description,
      inLanguage: 'fr-FR',
      mainEntityOfPage: canonicalUrl,
      url: canonicalUrl,
      about: [
        'Design patterns',
        selectedPattern.name,
        selectedPattern.type,
      ],
      publisher: {
        '@type': 'Person',
        name: 'Adeline Meistertzheim',
      },
    }

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: `${siteOrigin}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: selectedPattern.name,
          item: canonicalUrl,
        },
      ],
    }

    return [article, breadcrumb]
  }

  if (pageKind === 'home') {
    const website = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: canonicalUrl,
      inLanguage: 'fr-FR',
      description: buildPageSeoPayload({
        pageKind,
        pathname,
        siteOrigin,
      }).description,
    }

    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Catalogue des design patterns',
      itemListElement: patterns.map((pattern, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: pattern.name,
        url: `${siteOrigin}/patterns/${pattern.code}`,
      })),
    }

    return [website, itemList]
  }

  return []
}
