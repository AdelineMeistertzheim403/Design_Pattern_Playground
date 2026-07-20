import { buildPatternSeoFields } from './pageSeo.js'

function escapeHtml(value) {
  return `${value ?? ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildHomePrerenderMarkup(patterns) {
  const patternCards = patterns
    .map((pattern) => `
      <article style="border:1px solid rgba(0,0,0,0.08); border-radius:20px; padding:20px; background:#fffaf2;">
        <p style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:0.12em; color:#6b655e;">${escapeHtml(pattern.type)} - ${escapeHtml(pattern.complexityLevel)}</p>
        <h2 style="margin:12px 0 0; font-size:28px; line-height:1.2;"><a href="/patterns/${escapeHtml(pattern.code)}" style="color:#241f18; text-decoration:none;">${escapeHtml(pattern.name)}</a></h2>
        <p style="margin:14px 0 0; color:#4f463d; line-height:1.7;">${escapeHtml(pattern.description)}</p>
        <p style="margin:14px 0 0; color:#4f463d; line-height:1.7;"><strong>Cas d usage :</strong> ${escapeHtml(pattern.useCase)}</p>
      </article>
    `)
    .join('')

  return `
    <main style="max-width:1120px; margin:0 auto; padding:24px 16px 48px; color:#241f18; font-family:IBM Plex Sans, Segoe UI, sans-serif;">
      <section style="padding:28px 0 12px;">
        <p style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:0.18em; color:#6b655e;">Comprendre les design patterns en les voyant fonctionner</p>
        <h1 style="margin:16px 0 0; font-size:48px; line-height:1.1; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Apprendre les design patterns  avec des exemples interactifs</h1>
        <p style="margin:18px 0 0; max-width:840px; font-size:18px; line-height:1.8; color:#4f463d;">Design Pattern Playground aide a relier la theorie, le diagramme UML et le comportement a l execution. Chaque pattern dispose d une page dediee avec explication, demonstration visuelle et quiz.</p>
      <p style="margin:12px 0 0; max-width:840px; font-size:16px; line-height:1.8; color:#6b655e;">Les implementations sont en Java avec Spring Boot. L interface interactive est construite avec React. Explore les patterns GoF : Creational, Structural et Behavioral.</p>
      </section>
      <section style="padding:18px 0 0;">
        <h2 style="margin:0 0 18px; font-size:34px; line-height:1.2; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Catalogue des design patterns</h2>
        <div style="display:grid; gap:16px;">${patternCards}</div>
      </section>
    </main>
  `
}

export function buildPatternPrerenderMarkup(pattern, learningContent) {
  const patternSeo = buildPatternSeoFields(pattern, learningContent)
  const stepsMarkup = (learningContent?.steps ?? [])
    .map((step) => `<li style="margin:0 0 10px;">${escapeHtml(step)}</li>`)
    .join('')

  return `
    <main style="max-width:1120px; margin:0 auto; padding:24px 16px 48px; color:#241f18; font-family:IBM Plex Sans, Segoe UI, sans-serif;">
      <article style="padding:28px 0 12px;">
        <p style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:0.18em; color:#6b655e;">${escapeHtml(pattern.type)} - ${escapeHtml(pattern.complexityLevel)}</p>
        <h1 style="margin:16px 0 0; font-size:48px; line-height:1.1; font-family:Space Grotesk, Trebuchet MS, sans-serif;">${escapeHtml(patternSeo.h1)}</h1>
        <p style="margin:18px 0 0; max-width:860px; font-size:18px; line-height:1.8; color:#4f463d;">${escapeHtml(pattern.description)}</p>
        <p style="margin:14px 0 0; max-width:860px; font-size:17px; line-height:1.8; color:#4f463d;"><strong>Cas d usage :</strong> ${escapeHtml(pattern.useCase)}</p>
      </article>
      <section style="margin-top:24px;">
        <h2 style="margin:0; font-size:32px; line-height:1.2; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Pourquoi utiliser ce pattern ?</h2>
        <p style="margin:14px 0 0; max-width:860px; line-height:1.8; color:#4f463d;">${escapeHtml(learningContent?.intuition)}</p>
      </section>
      <section style="margin-top:24px;">
        <h2 style="margin:0; font-size:32px; line-height:1.2; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Lecture rapide</h2>
        <p style="margin:14px 0 0; max-width:860px; line-height:1.8; color:#4f463d;">${escapeHtml(learningContent?.strapline)}</p>
      </section>
      <section style="margin-top:24px;">
        <h2 style="margin:0; font-size:32px; line-height:1.2; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Etapes cles</h2>
        <ol style="margin:14px 0 0; padding-left:22px; max-width:860px; line-height:1.8; color:#4f463d;">${stepsMarkup}</ol>
      </section>
    </main>
  `
}

export function buildHelpPrerenderMarkup(patterns) {
  const patternLinks = patterns
    .map((pattern) => `
      <li style="margin:0 0 8px;">
        <a href="/patterns/${escapeHtml(pattern.code)}" style="color:#2f4f46; font-weight:700; text-decoration:none;">${escapeHtml(pattern.name)}</a>
        <span style="color:#6b655e;"> - ${escapeHtml(pattern.description)}</span>
      </li>
    `)
    .join('')

  return `
    <main style="max-width:1120px; margin:0 auto; padding:24px 16px 48px; color:#241f18; font-family:IBM Plex Sans, Segoe UI, sans-serif;">
      <section style="padding:28px 0 12px;">
        <p style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:0.18em; color:#6b655e;">Centre d'aide</p>
        <h1 style="margin:16px 0 0; font-size:48px; line-height:1.1; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Aide Design Pattern Playground</h1>
        <p style="margin:18px 0 0; max-width:860px; font-size:18px; line-height:1.8; color:#4f463d;">Retrouve les fiches de configuration, le fonctionnement des missions et les reperes essentiels pour construire des diagrammes UML lisibles.</p>
      </section>
      <section style="margin-top:24px;">
        <h2 style="margin:0; font-size:32px; line-height:1.2; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Configurer les design patterns</h2>
        <p style="margin:14px 0 0; max-width:860px; line-height:1.8; color:#4f463d;">Chaque fiche explique le role du scenario et les champs a regler avant de lancer la demonstration interactive.</p>
        <ul style="margin:18px 0 0; padding-left:22px; max-width:900px; line-height:1.7;">${patternLinks}</ul>
      </section>
      <section style="margin-top:24px;">
        <h2 style="margin:0; font-size:32px; line-height:1.2; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Missions et editeurs visuels</h2>
        <p style="margin:14px 0 0; max-width:860px; line-height:1.8; color:#4f463d;">Le mode mission transforme les patterns en exercices guides. Les editeurs UML et SVG servent a produire des supports visuels pour expliquer les responsabilites, relations et flux d'execution.</p>
      </section>
    </main>
  `
}

export function buildLegalNoticePrerenderMarkup() {
  return `
    <main style="max-width:960px; margin:0 auto; padding:24px 16px 48px; color:#241f18; font-family:IBM Plex Sans, Segoe UI, sans-serif;">
      <section style="padding:28px 0 12px;">
        <p style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:0.18em; color:#6b655e;">Mentions legales et confidentialite</p>
        <h1 style="margin:16px 0 0; font-size:48px; line-height:1.1; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Informations legales et traitement des donnees</h1>
        <p style="margin:18px 0 0; max-width:860px; font-size:18px; line-height:1.8; color:#4f463d;">Cette page presente les mentions legales applicables a ce site personnel non professionnel ainsi que les informations essentielles relatives aux donnees personnelles traitees dans l'application.</p>
      </section>
      <section style="margin-top:24px;">
        <h2 style="margin:0; font-size:32px; line-height:1.2; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Editeur et hebergement</h2>
        <p style="margin:14px 0 0; max-width:860px; line-height:1.8; color:#4f463d;">Design Pattern Playground est un site personnel edite a titre non professionnel. Le site est heberge par OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.</p>
      </section>
      <section style="margin-top:24px;">
        <h2 style="margin:0; font-size:32px; line-height:1.2; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Donnees personnelles</h2>
        <p style="margin:14px 0 0; max-width:860px; line-height:1.8; color:#4f463d;">Les donnees de compte, de session et de progression sont utilisees uniquement pour faire fonctionner l'authentification, les quiz et le suivi pedagogique. Aucun cookie publicitaire ni traceur marketing tiers n'est utilise.</p>
      </section>
    </main>
  `
}
