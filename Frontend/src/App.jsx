import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { fallbackPatterns, getFallbackPatternDetail, getFallbackPreview } from './data/fallbackPatterns'
import { API_URL, getPatternDetail, getPatternPreview, getPatterns } from './lib/api'

const previewModes = [
  { value: 'text', label: 'Vue narrative' },
  { value: 'checklist', label: 'Checklist' },
]

const architectureCards = [
  {
    title: 'Backend Spring Boot',
    body: 'API REST, persistence JPA/H2, seeding de donnees et strategie de rendu pour exposer plusieurs previews d un meme pattern.',
  },
  {
    title: 'Passerelle Full Stack',
    body: 'Le frontend lit le catalogue depuis le backend et degrade proprement sur des donnees locales tant que l API n est pas lancee.',
  },
  {
    title: 'Frontend React + Tailwind',
    body: 'Interface de lecture, filtres, selection d un pattern et changement de mode de lecture sans changer la structure globale.',
  },
]

const extensionSteps = [
  'Ajouter un pattern par dossier cote backend avec une implementation reelle et des tests dedies.',
  'Connecter le detail React a du code source ou des snippets au lieu d une simple fiche descriptive.',
  'Transformer la preview en atelier interactif avec choix de strategy, observer ou decorator dans l interface.',
]

const statusMap = {
  loading: {
    label: 'Connexion en cours',
    tone: 'bg-amber-100 text-amber-900 ring-amber-300',
    message: 'Le frontend tente de joindre le backend local.',
  },
  connected: {
    label: 'Backend connecte',
    tone: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
    message: 'Les donnees proviennent de l API Spring Boot.',
  },
  fallback: {
    label: 'Mode local',
    tone: 'bg-stone-200 text-stone-800 ring-stone-300',
    message: 'Le catalogue fallback reste disponible tant que l API n est pas demarree.',
  },
}

function App() {
  const [patterns, setPatterns] = useState(fallbackPatterns)
  const [selectedSlug, setSelectedSlug] = useState(fallbackPatterns[0].slug)
  const [selectedPattern, setSelectedPattern] = useState(
    getFallbackPatternDetail(fallbackPatterns[0].slug),
  )
  const [previewMode, setPreviewMode] = useState('text')
  const [previewLines, setPreviewLines] = useState(
    getFallbackPreview(fallbackPatterns[0].slug, 'text'),
  )
  const [backendStatus, setBackendStatus] = useState('loading')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    let ignore = false

    const loadCatalog = async () => {
      try {
        const catalog = await getPatterns()
        if (ignore || catalog.length === 0) {
          return
        }

        setPatterns(catalog)
        setBackendStatus('connected')
        setSelectedSlug((currentSlug) =>
          catalog.some((pattern) => pattern.slug === currentSlug)
            ? currentSlug
            : catalog[0].slug,
        )
      } catch {
        if (!ignore) {
          setPatterns(fallbackPatterns)
          setBackendStatus('fallback')
        }
      }
    }

    loadCatalog()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const visibleSlugs = patterns
      .filter((pattern) => {
        const haystack = `${pattern.name} ${pattern.category} ${pattern.intent}`.toLowerCase()
        return haystack.includes(deferredSearch.trim().toLowerCase())
      })
      .map((pattern) => pattern.slug)

    if (visibleSlugs.length > 0 && !visibleSlugs.includes(selectedSlug)) {
      setSelectedSlug(visibleSlugs[0])
    }
  }, [deferredSearch, patterns, selectedSlug])

  useEffect(() => {
    let ignore = false

    const fallbackDetail = getFallbackPatternDetail(selectedSlug)
    const fallbackPreview = getFallbackPreview(selectedSlug, previewMode)

    setSelectedPattern(fallbackDetail)
    setPreviewLines(fallbackPreview)

    const loadDetail = async () => {
      if (backendStatus !== 'connected') {
        return
      }

      try {
        const [detail, preview] = await Promise.all([
          getPatternDetail(selectedSlug),
          getPatternPreview(selectedSlug, previewMode),
        ])

        if (ignore) {
          return
        }

        setSelectedPattern(detail)
        setPreviewLines(preview.lines)
      } catch {
        if (!ignore) {
          setBackendStatus('fallback')
        }
      }
    }

    loadDetail()

    return () => {
      ignore = true
    }
  }, [backendStatus, previewMode, selectedSlug])

  const visiblePatterns = patterns.filter((pattern) => {
    const haystack = `${pattern.name} ${pattern.category} ${pattern.intent}`.toLowerCase()
    return haystack.includes(deferredSearch.trim().toLowerCase())
  })

  const status = statusMap[backendStatus] ?? statusMap.fallback

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <section className="reveal relative overflow-hidden rounded-[32px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_30px_80px_rgba(47,37,22,0.14)] sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(36,107,94,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(194,87,55,0.2),transparent_35%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-700">
              Design Pattern Playground
            </div>
            <div className="space-y-4">
              <p className="max-w-xl text-sm uppercase tracking-[0.22em] text-stone-600">
                Spring Boot JPA, H2, React 19, Tailwind et une base de catalogue pret a etendre
              </p>
              <h1 className="max-w-3xl text-4xl leading-none text-stone-950 sm:text-6xl">
                Un terrain de jeu pour montrer les patterns cote backend et frontend.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
                Le backend expose un catalogue de patterns et une preview strategique. Le frontend consomme
                cette API, reste lisible hors ligne et sert de point de depart pour vos prochaines demos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex items-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                href="#catalogue"
              >
                Explorer le catalogue
              </a>
              <a
                className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20 hover:bg-white"
                href="#roadmap"
              >
                Etendre le projet
              </a>
            </div>
          </div>

          <div className="grid gap-3 self-end">
            <div className="rounded-[24px] border border-black/10 bg-white/80 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">API cible</p>
              <p className="mt-3 font-mono text-sm text-stone-800">{API_URL}/api/patterns</p>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-white/80 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Patterns seedes</p>
              <p className="mt-3 text-4xl font-semibold text-stone-950">{fallbackPatterns.length}</p>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-white/80 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Preview modes</p>
              <p className="mt-3 text-4xl font-semibold text-stone-950">{previewModes.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {architectureCards.map((card, index) => (
          <article
            key={card.title}
            className="reveal rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-[0_16px_40px_rgba(47,37,22,0.08)] backdrop-blur-sm"
            style={{ animationDelay: `${120 * (index + 1)}ms` }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Bloc {index + 1}
            </p>
            <h2 className="mt-4 text-2xl text-stone-950">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-700">{card.body}</p>
          </article>
        ))}
      </section>

      <section
        id="catalogue"
        className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]"
      >
        <div className="reveal rounded-[32px] border border-black/10 bg-[var(--panel-strong)] p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Catalogue</p>
              <h2 className="mt-3 text-3xl text-stone-950">Patterns disponibles</h2>
            </div>
            <div className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ring-1 ${status.tone}`}>
              {status.label}
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-stone-700">{status.message}</p>

          <label className="mt-6 block">
            <span className="sr-only">Filtrer les patterns</span>
            <input
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-black/20"
              placeholder="Filtrer par nom, categorie ou intention"
              type="search"
              value={search}
              onChange={(event) => {
                const nextValue = event.target.value
                startTransition(() => setSearch(nextValue))
              }}
            />
          </label>

          <div className="mt-5 grid gap-3">
            {visiblePatterns.length > 0 ? (
              visiblePatterns.map((pattern) => {
                const isActive = pattern.slug === selectedSlug

                return (
                  <button
                    key={pattern.slug}
                    className={`text-left rounded-[24px] border px-4 py-4 transition ${
                      isActive
                        ? 'border-stone-950 bg-stone-950 text-white shadow-[0_20px_35px_rgba(28,25,23,0.18)]'
                        : 'border-black/10 bg-white/85 text-stone-900 hover:-translate-y-0.5 hover:border-black/20'
                    }`}
                    type="button"
                    onClick={() => setSelectedSlug(pattern.slug)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`text-xs font-semibold uppercase tracking-[0.24em] ${
                            isActive ? 'text-white/70' : 'text-stone-500'
                          }`}
                        >
                          {pattern.category}
                        </p>
                        <h3 className="mt-3 text-xl">{pattern.name}</h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                          isActive ? 'bg-white/12 text-white' : 'bg-[var(--accent-soft)] text-stone-900'
                        }`}
                      >
                        Demo
                      </span>
                    </div>
                    <p className={`mt-4 text-sm leading-6 ${isActive ? 'text-white/82' : 'text-stone-700'}`}>
                      {pattern.intent}
                    </p>
                  </button>
                )
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-black/15 bg-white/65 px-4 py-8 text-sm text-stone-600">
                Aucun pattern ne correspond au filtre courant.
              </div>
            )}
          </div>
        </div>

        <div className="reveal rounded-[32px] border border-black/10 bg-white/80 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Fiche active</p>
              <h2 className="mt-3 text-3xl text-stone-950">{selectedPattern.name}</h2>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                {selectedPattern.category}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {previewModes.map((mode) => {
                const isSelected = mode.value === previewMode
                return (
                  <button
                    key={mode.value}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isSelected
                        ? 'bg-stone-950 text-white'
                        : 'border border-black/10 bg-white text-stone-700 hover:border-black/20'
                    }`}
                    type="button"
                    onClick={() => setPreviewMode(mode.value)}
                  >
                    {mode.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-[28px] border border-black/10 bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Intent</p>
              <p className="mt-4 text-sm leading-7 text-stone-700">{selectedPattern.intent}</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Backend</p>
                  <p className="mt-3 text-sm leading-7 text-stone-700">{selectedPattern.backendFocus}</p>
                </div>
                <div className="rounded-[24px] bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Frontend</p>
                  <p className="mt-3 text-sm leading-7 text-stone-700">{selectedPattern.frontendFocus}</p>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-black/10 bg-stone-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Preview</p>
              <ul className="mt-4 space-y-3">
                {previewLines.map((line) => (
                  <li key={line} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm leading-7 text-white/85">
                    {line}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <article className="mt-4 rounded-[28px] border border-black/10 bg-[var(--accent-soft)]/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Note de lecture</p>
            <p className="mt-4 text-sm leading-7 text-stone-700">{selectedPattern.notes}</p>
          </article>
        </div>
      </section>

      <section
        id="roadmap"
        className="reveal rounded-[32px] border border-black/10 bg-[var(--panel)] px-6 py-7 shadow-[0_18px_45px_rgba(47,37,22,0.08)]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Roadmap</p>
            <h2 className="mt-3 text-3xl text-stone-950">Comment faire vivre ce playground</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-700">
            Chaque pattern peut devenir un mini module backend plus une scene frontend qui illustre le meme
            besoin vu sous deux angles complementaires.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {extensionSteps.map((step, index) => (
            <article key={step} className="rounded-[26px] border border-black/10 bg-white/85 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Etape 0{index + 1}</p>
              <p className="mt-4 text-sm leading-7 text-stone-700">{step}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
