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
        <h1 style="margin:16px 0 0; font-size:48px; line-height:1.1; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Apprendre les design patterns avec des demos interactives</h1>
        <p style="margin:18px 0 0; max-width:840px; font-size:18px; line-height:1.8; color:#4f463d;">Design Pattern Playground aide a relier la theorie, le diagramme UML et le comportement a l execution. Chaque pattern dispose d une page dediee avec explication, demonstration visuelle et quiz.</p>
      </section>
      <section style="padding:18px 0 0;">
        <h2 style="margin:0 0 18px; font-size:34px; line-height:1.2; font-family:Space Grotesk, Trebuchet MS, sans-serif;">Catalogue des design patterns</h2>
        <div style="display:grid; gap:16px;">${patternCards}</div>
      </section>
    </main>
  `
}

export function buildPatternPrerenderMarkup(pattern, learningContent) {
  const stepsMarkup = (learningContent?.steps ?? [])
    .map((step) => `<li style="margin:0 0 10px;">${escapeHtml(step)}</li>`)
    .join('')

  return `
    <main style="max-width:1120px; margin:0 auto; padding:24px 16px 48px; color:#241f18; font-family:IBM Plex Sans, Segoe UI, sans-serif;">
      <article style="padding:28px 0 12px;">
        <p style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:0.18em; color:#6b655e;">${escapeHtml(pattern.type)} - ${escapeHtml(pattern.complexityLevel)}</p>
        <h1 style="margin:16px 0 0; font-size:48px; line-height:1.1; font-family:Space Grotesk, Trebuchet MS, sans-serif;">${escapeHtml(pattern.name)}</h1>
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
