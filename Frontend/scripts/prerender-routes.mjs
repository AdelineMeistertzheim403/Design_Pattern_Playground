import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { fallbackPatterns } from '../src/patterns/catalog.js'
import { defaultLearningContent } from '../src/patterns/defaults.js'
import { buildPageSeoPayload, buildStructuredData, normalizeOrigin } from '../src/seo/pageSeo.js'
import { buildHomePrerenderMarkup, buildPatternPrerenderMarkup } from '../src/seo/prerenderTemplates.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

function escapeAttribute(value) {
  return `${value ?? ''}`
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function readEnvFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return ''
  }
}

async function resolveSiteUrl() {
  const candidateFiles = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.production.local',
  ]

  const envFromFiles = {}

  for (const fileName of candidateFiles) {
    const rawFile = await readEnvFile(path.join(rootDir, fileName))

    rawFile
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .forEach((line) => {
        const separatorIndex = line.indexOf('=')
        const key = line.slice(0, separatorIndex).trim()
        const value = line.slice(separatorIndex + 1).trim()
        envFromFiles[key] = value
      })
  }

  return normalizeOrigin(process.env.VITE_SITE_URL || envFromFiles.VITE_SITE_URL || 'https://example.com')
}

async function loadPatternLearningContent(code) {
  try {
    const modulePath = pathToFileURL(path.join(rootDir, 'src', 'patterns', code, 'data.js')).href
    const module = await import(modulePath)
    return module.patternLearningContent ?? defaultLearningContent
  } catch {
    return defaultLearningContent
  }
}

function replaceOrInsert(html, regex, replacement, anchor = '</head>') {
  if (regex.test(html)) {
    return html.replace(regex, replacement)
  }

  return html.replace(anchor, `${replacement}\n${anchor}`)
}

function injectHead(html, payload, structuredData) {
  let nextHtml = html

  nextHtml = replaceOrInsert(nextHtml, /<title>.*?<\/title>/s, `<title>${escapeAttribute(payload.title)}</title>`)
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/s, `<meta name="description" content="${escapeAttribute(payload.description)}" />`)
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/s, `<meta name="robots" content="${escapeAttribute(payload.robots)}" />`)
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:title" content="${escapeAttribute(payload.title)}" />`)
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:description" content="${escapeAttribute(payload.description)}" />`)
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:type" content="${escapeAttribute(payload.type)}" />`)
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/s, '<meta property="og:site_name" content="Design Pattern Playground" />')
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/s, '<meta property="og:locale" content="fr_FR" />')
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/s, '<meta name="twitter:card" content="summary_large_image" />')
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:url" content="${escapeAttribute(payload.canonicalUrl)}" />`)
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/s, `<meta property="og:image" content="${escapeAttribute(payload.imageUrl)}" />`)
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/s, '<meta property="og:image:alt" content="Logo Design Pattern Playground" />')
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/s, `<meta name="twitter:title" content="${escapeAttribute(payload.title)}" />`)
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/s, `<meta name="twitter:description" content="${escapeAttribute(payload.description)}" />`)
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/s, `<meta name="twitter:image" content="${escapeAttribute(payload.imageUrl)}" />`)
  nextHtml = replaceOrInsert(nextHtml, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/s, `<link rel="canonical" href="${escapeAttribute(payload.canonicalUrl)}" />`)

  const structuredDataTag = `<script type="application/ld+json" data-seo-id="structured-data">${JSON.stringify(structuredData.length === 1 ? structuredData[0] : structuredData)}</script>`
  nextHtml = replaceOrInsert(
    nextHtml,
    /<script\s+type="application\/ld\+json"\s+data-seo-id="structured-data">.*?<\/script>/s,
    structuredDataTag,
  )

  return nextHtml
}

function injectRootMarkup(html, markup) {
  return html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${markup}</div>`,
  )
}

async function writeRouteHtml(relativePath, html) {
  const targetPath = path.join(distDir, relativePath)
  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  await fs.writeFile(targetPath, html, 'utf8')
}

async function main() {
  const siteOrigin = await resolveSiteUrl()
  const baseHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8')

  const homePayload = buildPageSeoPayload({
    pageKind: 'home',
    pathname: '/',
    patterns: fallbackPatterns,
    siteOrigin,
  })
  const homeStructuredData = buildStructuredData({
    pageKind: 'home',
    pathname: '/',
    patterns: fallbackPatterns,
    siteOrigin,
  })
  const homeHtml = injectRootMarkup(
    injectHead(baseHtml, homePayload, homeStructuredData),
    buildHomePrerenderMarkup(fallbackPatterns),
  )

  await writeRouteHtml('index.html', homeHtml)

  for (const pattern of fallbackPatterns) {
    const learningContent = await loadPatternLearningContent(pattern.code)
    const pathname = `/patterns/${pattern.code}`
    const payload = buildPageSeoPayload({
      learningContent,
      pageKind: 'pattern',
      pathname,
      selectedPattern: pattern,
      siteOrigin,
    })
    const structuredData = buildStructuredData({
      learningContent,
      pageKind: 'pattern',
      pathname,
      selectedPattern: pattern,
      siteOrigin,
    })
    const patternHtml = injectRootMarkup(
      injectHead(baseHtml, payload, structuredData),
      buildPatternPrerenderMarkup(pattern, learningContent),
    )

    await writeRouteHtml(path.join('patterns', pattern.code, 'index.html'), patternHtml)
  }

  console.log(`[prerender] Generated static HTML snapshots for home and ${fallbackPatterns.length} pattern pages.`)
}

main().catch((error) => {
  console.error('[prerender] Failed to generate static route snapshots.')
  console.error(error)
  process.exitCode = 1
})
