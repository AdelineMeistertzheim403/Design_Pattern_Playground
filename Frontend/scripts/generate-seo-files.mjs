import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fallbackPatterns } from '../src/patterns/catalog.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')
const today = new Date().toISOString().slice(0, 10)

function normalizeSiteUrl(rawValue) {
  const normalized = `${rawValue ?? ''}`.trim().replace(/\/$/, '')
  return normalized || null
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

  return normalizeSiteUrl(process.env.VITE_SITE_URL || envFromFiles.VITE_SITE_URL)
}

function buildRobotsTxt(siteUrl, usesPlaceholder) {
  const comment = usesPlaceholder
    ? '# VITE_SITE_URL is not set yet. Replace example.com before production deployment.\n'
    : ''

  return `${comment}User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
}

function buildSitemapXml(siteUrl, usesPlaceholder) {
  const urls = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/aide', priority: '0.7', changefreq: 'monthly' },
    { path: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
    ...fallbackPatterns.map((pattern) => ({
      path: `/patterns/${pattern.code}`,
      priority: '0.8',
      changefreq: 'monthly',
    })),
  ]

  const comment = usesPlaceholder
    ? '  <!-- Set VITE_SITE_URL to your public domain before production deployment. -->\n'
    : ''

  const urlEntries = urls
    .map((entry) => {
      const location = `${siteUrl}${entry.path}`
      return [
        '  <url>',
        `    <loc>${location}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    comment.trimEnd(),
    urlEntries,
    '</urlset>',
    '',
  ]
    .filter(Boolean)
    .join('\n')
}

async function main() {
  const configuredSiteUrl = await resolveSiteUrl()
  const siteUrl = configuredSiteUrl || 'https://example.com'
  const usesPlaceholder = !configuredSiteUrl

  await fs.mkdir(publicDir, { recursive: true })
  await fs.writeFile(path.join(publicDir, 'robots.txt'), buildRobotsTxt(siteUrl, usesPlaceholder), 'utf8')
  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), buildSitemapXml(siteUrl, usesPlaceholder), 'utf8')

  if (usesPlaceholder) {
    console.warn('[seo] VITE_SITE_URL is missing. Generated robots.txt and sitemap.xml with https://example.com.')
    return
  }

  console.log(`[seo] Generated robots.txt and sitemap.xml for ${siteUrl}`)
}

main().catch((error) => {
  console.error('[seo] Failed to generate SEO files.')
  console.error(error)
  process.exitCode = 1
})
