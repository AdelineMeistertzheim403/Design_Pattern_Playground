import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import AuthDialog from './components/AuthDialog'
import ExecutionScene from './components/ExecutionScene'
import UmlDiagram from './components/UmlDiagram'
import VisualizationModal from './components/VisualizationModal'
import { executeFallbackPattern, fallbackPatterns, getFallbackSchema } from './data/fallbackPatterns'
import { getPatternLearningContent } from './data/patternLearningContent'
import { getPatternUmlDiagram } from './data/patternUmlDiagrams'
import {
  executePattern,
  getCurrentUser,
  getPatternSchema,
  getPatterns,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from './lib/api'

const AUTH_USER_STORAGE_KEY = 'dpp_auth_user'

const typeLabels = {
  CREATIONAL: 'Creation',
  STRUCTURAL: 'Structure',
  BEHAVIORAL: 'Comportement',
}

const statusMap = {
  loading: {
    label: 'Connexion en cours',
    tone: 'bg-amber-100 text-amber-900 ring-amber-300',
    message: "Le frontend tente d utiliser l API dynamique du backend.",
  },
  connected: {
    label: 'Moteur backend actif',
    tone: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
    message: "Schemas, metadata, demo runtime et authentification proviennent du backend Spring Boot.",
  },
  fallback: {
    label: 'Mode local',
    tone: 'bg-stone-200 text-stone-800 ring-stone-300',
    message: "Le front degrade sur des demos locales tant que l API n est pas joignable. L authentification est alors desactivee.",
  },
}

const patternFieldUi = {
  flyweight: {
    objectCount: {
      min: 100,
      max: 10000,
      step: 100,
      unitLabel: 'objets',
      hint: "Monte jusqu a 10 000 pour observer l impact du pattern sur la taille de la foule.",
    },
    sharedVariantCount: {
      min: 1,
      max: 12,
      step: 1,
      unitLabel: 'variantes',
      hint: "Ces variantes representent les etats intrinsiques que le moteur peut partager.",
    },
  },
}

function buildPatternPath(code) {
  return `/patterns/${code}`
}

function parseRoute(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/'

  if (normalized === '/') {
    return { name: 'home' }
  }

  const patternMatch = normalized.match(/^\/patterns\/([a-z0-9-]+)$/)
  if (patternMatch) {
    return {
      name: 'pattern',
      code: patternMatch[1],
    }
  }

  return { name: 'notFound' }
}

function buildInitialParameters(schema) {
  return Object.fromEntries(
    (schema?.fields ?? []).map((field) => {
      if (field.defaultValue !== null && field.defaultValue !== undefined) {
        if (field.type === 'BOOLEAN') {
          return [field.name, field.defaultValue === 'true']
        }

        if (field.type === 'LIST') {
          return [field.name, field.defaultValue.split(',').map((value) => value.trim()).filter(Boolean)]
        }

        return [field.name, field.defaultValue]
      }

      if (field.type === 'BOOLEAN') {
        return [field.name, false]
      }

      if (field.type === 'LIST') {
        return [field.name, []]
      }

      return [field.name, '']
    }),
  )
}

function normalizeParameters(schema, formValues) {
  return Object.fromEntries(
    (schema?.fields ?? []).map((field) => {
      const rawValue = formValues[field.name]

      if (field.type === 'NUMBER') {
        return [field.name, rawValue === '' ? null : Number(rawValue)]
      }

      if (field.type === 'BOOLEAN') {
        return [field.name, Boolean(rawValue)]
      }

      if (field.type === 'LIST') {
        if (Array.isArray(rawValue)) {
          return [field.name, rawValue]
        }

        return [
          field.name,
          `${rawValue ?? ''}`
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        ]
      }

      return [field.name, rawValue]
    }),
  )
}

function formatOutputValue(value) {
  return typeof value === 'object' && value !== null
    ? JSON.stringify(value, null, 2)
    : `${value}`
}

function getNumericFieldUi(patternCode, fieldName) {
  return patternFieldUi[patternCode]?.[fieldName] ?? null
}

function getBooleanStateLabel(patternCode, fieldName, value) {
  if (patternCode === 'flyweight' && fieldName === 'useFlyweight') {
    return value ? 'Avec Flyweight' : 'Sans Flyweight'
  }

  return value ? 'Actif' : 'Inactif'
}

function buildPreviewExecution(code, schema, formValues) {
  try {
    return executeFallbackPattern(code, normalizeParameters(schema, formValues))
  } catch {
    return null
  }
}

function persistSession(user) {
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

function clearPersistedSession() {
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

function loadPersistedUser() {
  const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

function SiteHeader({
  currentUser,
  status,
  onNavigateHome,
  onOpenAuth,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/8 bg-[rgba(243,234,217,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          className="flex items-center gap-4 text-left"
          type="button"
          onClick={onNavigateHome}
        >
          <img
            alt="Logo Design Pattern Playground"
            className="w-70 rounded-[1.75rem] object-contain"
            src="/logo.png"
          />
        </button>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ring-1 ${status.tone}`}>
            {status.label}
          </div>

          {currentUser ? (
            <>
              <div className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800">
                @{currentUser.username}
              </div>
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onLogout}
              >
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={() => onOpenAuth('login')}
              >
                Connexion
              </button>
              <button
                className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                type="button"
                onClick={() => onOpenAuth('register')}
              >
                Inscription
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function HomePage({
  patterns,
  visiblePatterns,
  search,
  status,
  currentUser,
  onSearchChange,
  onOpenAuth,
  onOpenPattern,
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal relative overflow-hidden rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_30px_80px_rgba(47,37,22,0.14)] sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(36,107,94,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(194,87,55,0.2),transparent_35%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-black/10 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-700">
              Plateforme pedagogique et ludique
            </div>
            <div className="space-y-4">
              <p className="max-w-xl text-sm uppercase tracking-[0.22em] text-stone-600">
                Comprendre les design patterns en les voyant fonctionner
              </p>
              <p className="max-w-3xl text-base leading-7 text-stone-700 sm:text-lg">
                Le but du site est simple : aider les etudiants, les developpeurs et les formateurs a relier
                la theorie, le diagramme UML et le comportement runtime. Choisis un pattern, ouvre sa page et
                manipule la demo.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                type="button"
                onClick={() => onOpenPattern(patterns[0]?.code ?? fallbackPatterns[0].code)}
              >
                Ouvrir une premiere demo
              </button>
              {!currentUser ? (
                <button
                  className="rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                  type="button"
                  onClick={() => onOpenAuth('register')}
                >
                  Creer un compte
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 self-end">

            <article className="rounded-[26px] border border-black/10 bg-white/82 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Etat de l app</p>
              <div className={`mt-4 inline-flex rounded-full px-3 py-2 text-xs font-semibold ring-1 ${status.tone}`}>
                {status.label}
              </div>
              <p className="mt-4 text-sm leading-7 text-stone-700">{status.message}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="reveal rounded-[34px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Catalogue</p>
            <h2 className="mt-3 text-3xl text-stone-950">Choisir un design pattern</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
              Depuis cette page, choisis un pattern et ouvre sa page detaillee pour acceder a sa configuration,
              sa demo visuelle, ses logs, son UML et son contenu pedagogique.
            </p>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-[var(--panel)] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Patterns actifs</p>
            <p className="mt-2 text-3xl font-semibold text-stone-950">{patterns.length}</p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="sr-only">Filtrer les patterns</span>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-black/20"
            placeholder="Filtrer par nom, type ou cas d usage"
            type="search"
            value={search}
            onChange={onSearchChange}
          />
        </label>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {visiblePatterns.length > 0 ? (
            visiblePatterns.map((pattern) => {
              const learning = getPatternLearningContent(pattern.code)

              return (
                <article
                  key={pattern.code}
                  className="rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,240,226,0.92))] p-5 shadow-[0_14px_34px_rgba(47,37,22,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                        {typeLabels[pattern.type] ?? pattern.type}
                      </p>
                      <h3 className="mt-3 text-2xl text-stone-950">{pattern.name}</h3>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-900">
                      {pattern.complexityLevel}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-stone-700">{pattern.description}</p>
                  <p className="mt-4 rounded-[22px] bg-[var(--teal-soft)]/72 px-4 py-4 text-sm leading-7 text-stone-700">
                    {learning.strapline}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-stone-700">
                    Cas d usage : {pattern.useCase}
                  </p>

                  <button
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    type="button"
                    onClick={() => onOpenPattern(pattern.code)}
                  >
                    Ouvrir la page du pattern
                  </button>
                </article>
              )
            })
          ) : (
            <div className="rounded-[26px] border border-dashed border-black/15 bg-[var(--panel)] px-5 py-10 text-sm leading-7 text-stone-600 lg:col-span-3">
              Aucun pattern ne correspond au filtre courant.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function CollapsiblePanel({
  eyebrow,
  title,
  description,
  defaultExpanded = true,
  children,
  className = '',
  bodyClassName = '',
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <section
      className={`reveal rounded-[32px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-5">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{eyebrow}</p>
          <h2 className="mt-3 text-3xl text-stone-950">{title}</h2>
          {description ? (
            <p className="mt-4 text-sm leading-7 text-stone-700">{description}</p>
          ) : null}
        </div>

        <button
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span>{isExpanded ? 'Replier' : 'Deplier'}</span>
          <span className="text-base leading-none">{isExpanded ? '−' : '+'}</span>
        </button>
      </div>

      {isExpanded ? <div className={`mt-6 ${bodyClassName}`}>{children}</div> : null}
    </section>
  )
}

function PatternPage({
  selectedPattern,
  patterns,
  schema,
  formValues,
  execution,
  executionError,
  isExecuting,
  learningContent,
  umlDiagram,
  currentUser,
  status,
  onNavigateHome,
  onNavigatePattern,
  onOpenAuth,
  onFieldValueChange,
  onSubmit,
  visualExecution,
  visualSourceLabel,
  hasDraftChanges,
  onOpenSceneModal,
  onOpenUmlModal,
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onNavigateHome}
              >
                Retour a l accueil
              </button>
              <div className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ring-1 ${status.tone}`}>
                {status.label}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                {typeLabels[selectedPattern.type] ?? selectedPattern.type} · {selectedPattern.complexityLevel}
              </p>
              <h2 className="mt-3 text-4xl text-stone-950 sm:text-5xl">{selectedPattern.name}</h2>
            </div>

            <p className="max-w-3xl text-base leading-7 text-stone-700">{selectedPattern.description}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">But du pattern</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.intuition}</p>
              </article>

              <article className="rounded-[24px] border border-black/10 bg-[var(--teal-soft)]/82 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Lecture rapide</p>
                <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.strapline}</p>
              </article>
            </div>

            <p className="rounded-[24px] bg-[var(--accent-soft)]/62 px-5 py-4 text-sm leading-7 text-stone-700">
              Cas d usage : {selectedPattern.useCase}
            </p>
          </div>

          <div className="grid gap-4 self-end">
            <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Compte</p>
              {currentUser ? (
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Connecte en tant que <span className="font-semibold text-stone-950">@{currentUser.username}</span>.
                  Tu pourras plus tard sauvegarder tes scenarios et ton historique.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-sm leading-7 text-stone-700">
                    Un compte n est pas obligatoire pour tester un pattern, mais il permettra ensuite de suivre la progression.
                  </p>
                  <button
                    className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    type="button"
                    onClick={() => onOpenAuth('register')}
                  >
                    Creer un compte
                  </button>
                </div>
              )}
            </article>

            <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Autres patterns</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {patterns
                  .filter((pattern) => pattern.code !== selectedPattern.code)
                  .map((pattern) => (
                    <button
                      key={pattern.code}
                      className="rounded-full border border-black/10 bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                      type="button"
                      onClick={() => onNavigatePattern(pattern.code)}
                    >
                      {pattern.name}
                    </button>
                  ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <CollapsiblePanel
        bodyClassName="grid gap-4"
        description="Le formulaire est genere a partir du schema expose par le backend. La page du pattern reste donc stable meme quand la demo evolue."
        eyebrow="Configuration"
        title="Parametrer la demo"
      >
        <form className="grid gap-4 xl:grid-cols-2" onSubmit={onSubmit}>
          {(schema?.fields ?? []).map((field) => {
            const numericUi = getNumericFieldUi(selectedPattern.code, field.name)

            return (
              <label key={field.name} className="grid gap-2">
                <span className="text-sm font-semibold text-stone-800">
                  {field.label}
                  {field.required ? ' *' : ''}
                </span>

                {field.type === 'SELECT' ? (
                  <select
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
                    value={formValues[field.name] ?? ''}
                    onChange={(event) => onFieldValueChange(field, event.target.value)}
                  >
                    {(field.allowedValues ?? []).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'BOOLEAN' ? (
                  <button
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      formValues[field.name]
                        ? 'border-stone-950 bg-stone-950 text-white'
                        : 'border-black/10 bg-white text-stone-700'
                    }`}
                    type="button"
                    onClick={() => onFieldValueChange(field, !formValues[field.name])}
                  >
                    <span>{getBooleanStateLabel(selectedPattern.code, field.name, Boolean(formValues[field.name]))}</span>
                    <span>{field.name}</span>
                  </button>
                ) : field.type === 'NUMBER' && numericUi ? (
                  <div className="grid gap-3 rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                        {Number(formValues[field.name] ?? numericUi.min).toLocaleString('fr-FR')} {numericUi.unitLabel}
                      </span>
                      <input
                        className="w-28 rounded-2xl border border-black/10 bg-white px-3 py-2 text-right text-sm text-stone-900 outline-none focus:border-black/20"
                        max={numericUi.max}
                        min={numericUi.min}
                        step={numericUi.step}
                        type="number"
                        value={formValues[field.name] ?? ''}
                        onChange={(event) => onFieldValueChange(field, event.target.value)}
                      />
                    </div>
                    <input
                      className="flyweight-range"
                      max={numericUi.max}
                      min={numericUi.min}
                      step={numericUi.step}
                      type="range"
                      value={Number(formValues[field.name] ?? numericUi.min)}
                      onChange={(event) => onFieldValueChange(field, event.target.value)}
                    />
                    <p className="text-sm leading-7 text-stone-600">{numericUi.hint}</p>
                  </div>
                ) : field.type === 'LIST' ? (
                  <textarea
                    className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
                    value={Array.isArray(formValues[field.name]) ? formValues[field.name].join(', ') : formValues[field.name] ?? ''}
                    onChange={(event) => onFieldValueChange(field, event.target.value)}
                  />
                ) : (
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
                    type={field.type === 'NUMBER' ? 'number' : 'text'}
                    value={formValues[field.name] ?? ''}
                    onChange={(event) => onFieldValueChange(field, event.target.value)}
                  />
                )}
              </label>
            )
          })}

          <div className="xl:col-span-2">
            <button
              className="mt-2 inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isExecuting}
              type="submit"
            >
              {isExecuting ? 'Execution en cours...' : 'Lancer la demo'}
            </button>

            {executionError ? (
              <div className="mt-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {executionError}
              </div>
            ) : null}
          </div>
        </form>
      </CollapsiblePanel>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <CollapsiblePanel
          bodyClassName="p-0"
          description="La scene donne une lecture runtime du pattern. Tu peux l ouvrir en grand pour inspecter les objets, les relations et les etats."
          eyebrow="Scene SVG"
          title="Visualisation interactive"
        >
          <ExecutionScene
            execution={visualExecution}
            onOpenModal={onOpenSceneModal}
            patternCode={selectedPattern.code}
            sourceLabel={visualSourceLabel}
          />
        </CollapsiblePanel>

        <CollapsiblePanel
          bodyClassName="p-0"
          description="Le diagramme UML fige la structure du pattern. Il complete la scene runtime avec la vue conception."
          eyebrow="Diagramme UML"
          title="Structure du pattern"
        >
          <UmlDiagram
            diagram={umlDiagram}
            patternCode={selectedPattern.code}
            onOpenModal={onOpenUmlModal}
            patternName={selectedPattern.name}
          />
        </CollapsiblePanel>
      </section>

      <CollapsiblePanel
        description="Tu retrouves ici le resume, l output et les logs pedagogiques renvoyes par la demo executee."
        eyebrow="Resultat"
        title="Retour d execution"
      >
        {execution ? (
          <div className="grid gap-4">
            {hasDraftChanges ? (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
                Le formulaire a change depuis la derniere execution. La scene SVG affiche un apercu live, mais
                les logs et l output ci-dessous correspondent encore a la derniere execution.
              </div>
            ) : null}

            <article className="rounded-[26px] border border-black/10 bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Summary</p>
              <p className="mt-4 text-sm leading-7 text-stone-700">{execution.summary}</p>
            </article>

            <article className="rounded-[26px] border border-black/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Output</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(execution.output ?? {}).map(([key, value]) => (
                  <div key={key} className="rounded-2xl bg-stone-950 px-4 py-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">{key}</p>
                    <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-white/85">
                      {formatOutputValue(value)}
                    </pre>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[26px] border border-black/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Logs</p>
              <ul className="mt-4 grid gap-3">
                {(execution.logs ?? []).map((line, index) => (
                  <li key={`${line}-${index}`} className="rounded-2xl border border-black/10 bg-[var(--panel)] px-4 py-3 text-sm leading-7 text-stone-700">
                    {line}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        ) : (
          <div className="rounded-[26px] border border-dashed border-black/15 bg-[var(--panel)] px-5 py-10 text-sm leading-7 text-stone-600">
            Aucun resultat pour le moment. Tu peux deja observer la scene SVG en apercu live, puis lancer la demonstration pour figer un resultat complet.
          </div>
        )}
      </CollapsiblePanel>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <CollapsiblePanel eyebrow="Pedagogie" title="Comment lire cette page">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Guide De Lecture</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.readingGuide}</p>
            </article>

            <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Angle Etudiant</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.studentAngle}</p>
            </article>

            <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Angle Developpeur</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.developerAngle}</p>
            </article>

            <article className="rounded-[24px] border border-black/10 bg-[var(--accent-soft)]/58 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Exploration Ludique</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.playfulPrompt}</p>
            </article>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel eyebrow="Pas A Pas" title="Sequence de comprehension">
          <ol className="grid gap-3">
            {learningContent.steps.map((step, index) => (
              <li key={`${selectedPattern.code}-step-${index}`} className="flex gap-4 rounded-[24px] border border-black/10 bg-[var(--panel)] px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-7 text-stone-700">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Mini Lexique</p>
            <div className="mt-4 grid gap-3">
              {learningContent.glossary.map((item) => (
                <article key={`${selectedPattern.code}-${item.term}`} className="rounded-[24px] border border-black/10 bg-white px-5 py-4">
                  <p className="text-sm font-semibold text-stone-900">{item.term}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-700">{item.definition}</p>
                </article>
              ))}
            </div>
          </div>
        </CollapsiblePanel>
      </section>
    </div>
  )
}

function NotFoundPage({ onNavigateHome }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <section className="reveal rounded-[34px] border border-black/10 bg-white/80 p-8 text-center shadow-[0_24px_60px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Erreur de navigation</p>
        <h2 className="mt-4 text-4xl text-stone-950">Cette page n existe pas</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-700">
          Retourne a l accueil pour choisir un design pattern disponible et ouvrir sa page de demonstration.
        </p>
        <button
          className="mt-6 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          type="button"
          onClick={onNavigateHome}
        >
          Retour a l accueil
        </button>
      </section>
    </div>
  )
}

function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname))
  const [patterns, setPatterns] = useState(fallbackPatterns)
  const [schema, setSchema] = useState(getFallbackSchema(fallbackPatterns[0].code))
  const [formValues, setFormValues] = useState(
    buildInitialParameters(getFallbackSchema(fallbackPatterns[0].code)),
  )
  const [execution, setExecution] = useState(null)
  const [executionError, setExecutionError] = useState('')
  const [lastExecutedPayload, setLastExecutedPayload] = useState(null)
  const [backendStatus, setBackendStatus] = useState('loading')
  const [search, setSearch] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authFormValues, setAuthFormValues] = useState({ username: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authPending, setAuthPending] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => loadPersistedUser())
  const [activeVisualModal, setActiveVisualModal] = useState(null)
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const loadPatterns = async () => {
      try {
        const apiPatterns = await getPatterns()
        if (ignore || apiPatterns.length === 0) {
          return
        }

        setPatterns(apiPatterns)
        setBackendStatus('connected')
      } catch {
        if (!ignore) {
          setPatterns(fallbackPatterns)
          setBackendStatus('fallback')
        }
      }
    }

    loadPatterns()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (backendStatus !== 'connected') {
      return
    }

    let ignore = false

    const syncCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        if (ignore) {
          return
        }

        setCurrentUser(user)
        persistSession(user)
      } catch {
        try {
          const response = await refreshUserSession()
          if (ignore) {
            return
          }

          setCurrentUser(response.user)
          persistSession(response.user)
        } catch {
          if (!ignore) {
            clearPersistedSession()
            setCurrentUser(null)
          }
        }
      }
    }

    syncCurrentUser()

    return () => {
      ignore = true
    }
  }, [backendStatus])

  function applyAuthenticatedSession(response) {
    persistSession(response.user)
    setCurrentUser(response.user)
  }

  async function revokeSessionOnServer() {
    try {
      await logoutUser()
    } catch {
      // The local session will still be cleared below.
    }
  }

  const selectedPattern = route.name === 'pattern'
    ? (patterns.find((pattern) => pattern.code === route.code) ?? fallbackPatterns.find((pattern) => pattern.code === route.code) ?? null)
    : null

  const activePatternCode = selectedPattern?.code ?? fallbackPatterns[0].code

  useEffect(() => {
    setActiveVisualModal(null)
  }, [route.name, activePatternCode])

  useEffect(() => {
    let ignore = false

    const fallbackSchema = getFallbackSchema(activePatternCode)
    setSchema(fallbackSchema)
    setFormValues(buildInitialParameters(fallbackSchema))
    setExecution(null)
    setExecutionError('')
    setLastExecutedPayload(null)

    const loadSchema = async () => {
      if (backendStatus !== 'connected' || !selectedPattern) {
        return
      }

      try {
        const apiSchema = await getPatternSchema(activePatternCode)
        if (ignore) {
          return
        }

        setSchema(apiSchema)
        setFormValues(buildInitialParameters(apiSchema))
      } catch {
        if (!ignore) {
          setBackendStatus('fallback')
        }
      }
    }

    loadSchema()

    return () => {
      ignore = true
    }
  }, [activePatternCode, backendStatus, selectedPattern])

  const visiblePatterns = patterns.filter((pattern) => {
    const haystack = `${pattern.name} ${pattern.type} ${pattern.description} ${pattern.useCase}`.toLowerCase()
    return haystack.includes(deferredSearch.trim().toLowerCase())
  })

  const status = statusMap[backendStatus] ?? statusMap.fallback
  const learningContent = getPatternLearningContent(activePatternCode)
  const umlDiagram = getPatternUmlDiagram(activePatternCode)

  const draftPayload = {
    patternCode: activePatternCode,
    parameters: normalizeParameters(schema, formValues),
  }

  const previewExecution = selectedPattern
    ? buildPreviewExecution(activePatternCode, schema, formValues)
    : null

  const hasDraftChanges = Boolean(
    lastExecutedPayload
    && JSON.stringify(lastExecutedPayload) !== JSON.stringify(draftPayload),
  )

  const visualExecution = execution && !hasDraftChanges
    ? execution
    : (previewExecution ?? execution)

  const visualSourceLabel = execution && !hasDraftChanges ? 'Derniere execution' : 'Apercu live'
  const isSceneModalOpen = activeVisualModal === 'scene'
  const isUmlModalOpen = activeVisualModal === 'uml'

  function navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }

    setRoute(parseRoute(path))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openAuth(nextMode) {
    setAuthMode(nextMode)
    setAuthError('')
    setIsAuthOpen(true)
  }

  function updateFieldValue(field, nextValue) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field.name]: nextValue,
    }))
  }

  function updateAuthField(name, value) {
    setAuthFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleExecute(event) {
    event.preventDefault()
    setIsExecuting(true)
    setExecutionError('')

    const payload = draftPayload

    try {
      const result = backendStatus === 'connected'
        ? await executePattern(payload)
        : executeFallbackPattern(activePatternCode, payload.parameters)

      setExecution(result)
      setLastExecutedPayload(payload)
    } catch (error) {
      if (backendStatus === 'connected') {
        setBackendStatus('fallback')

        try {
          setExecution(executeFallbackPattern(activePatternCode, payload.parameters))
          setLastExecutedPayload(payload)
        } catch {
          setExecution(null)
          setLastExecutedPayload(null)
          setExecutionError(error.message ?? "L execution a echoue.")
        }
      } else {
        setExecution(null)
        setLastExecutedPayload(null)
        setExecutionError(error.message ?? "L execution a echoue.")
      }
    } finally {
      setIsExecuting(false)
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthPending(true)
    setAuthError('')

    try {
      const response = authMode === 'register'
        ? await registerUser(authFormValues)
        : await loginUser(authFormValues)

      applyAuthenticatedSession(response)
      setAuthFormValues({ username: '', password: '' })
      setIsAuthOpen(false)
    } catch (error) {
      setAuthError(error.message ?? "L authentification a echoue.")
    } finally {
      setAuthPending(false)
    }
  }

  async function handleLogout() {
    await revokeSessionOnServer()

    clearPersistedSession()
    setCurrentUser(null)
    setIsAuthOpen(false)
  }

  return (
    <>
      <SiteHeader
        currentUser={currentUser}
        status={status}
        onNavigateHome={() => navigate('/')}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
      />

      {route.name === 'home' ? (
        <HomePage
          currentUser={currentUser}
          patterns={patterns}
          visiblePatterns={visiblePatterns}
          search={search}
          status={status}
          onSearchChange={(event) => {
            const nextValue = event.target.value
            startTransition(() => setSearch(nextValue))
          }}
          onOpenAuth={openAuth}
          onOpenPattern={(code) => navigate(buildPatternPath(code))}
        />
      ) : route.name === 'pattern' && selectedPattern ? (
        <PatternPage
          currentUser={currentUser}
          execution={execution}
          executionError={executionError}
          formValues={formValues}
          hasDraftChanges={hasDraftChanges}
          isExecuting={isExecuting}
          learningContent={learningContent}
          onOpenSceneModal={() => setActiveVisualModal('scene')}
          onOpenUmlModal={() => setActiveVisualModal('uml')}
          patterns={patterns}
          schema={schema}
          selectedPattern={selectedPattern}
          status={status}
          umlDiagram={umlDiagram}
          visualExecution={visualExecution}
          visualSourceLabel={visualSourceLabel}
          onFieldValueChange={updateFieldValue}
          onNavigateHome={() => navigate('/')}
          onNavigatePattern={(code) => navigate(buildPatternPath(code))}
          onOpenAuth={openAuth}
          onSubmit={handleExecute}
        />
      ) : (
        <NotFoundPage onNavigateHome={() => navigate('/')} />
      )}

      {route.name === 'pattern' && selectedPattern && isSceneModalOpen ? (
        <VisualizationModal
          title={`Scene SVG ${selectedPattern.name}`}
          onClose={() => setActiveVisualModal(null)}
        >
          <ExecutionScene
            execution={visualExecution}
            isExpanded
            patternCode={selectedPattern.code}
            sourceLabel={visualSourceLabel}
          />
        </VisualizationModal>
      ) : null}

      {route.name === 'pattern' && selectedPattern && isUmlModalOpen ? (
        <VisualizationModal
          title={`Diagramme UML ${selectedPattern.name}`}
          onClose={() => setActiveVisualModal(null)}
        >
          <UmlDiagram
            diagram={umlDiagram}
            isExpanded
            patternCode={selectedPattern.code}
            patternName={selectedPattern.name}
          />
        </VisualizationModal>
      ) : null}

      <AuthDialog
        backendStatus={backendStatus}
        currentUser={currentUser}
        error={authError}
        formValues={authFormValues}
        isOpen={isAuthOpen}
        mode={authMode}
        pending={authPending}
        onClose={() => setIsAuthOpen(false)}
        onFieldChange={updateAuthField}
        onLogout={handleLogout}
        onModeChange={(nextMode) => {
          setAuthMode(nextMode)
          setAuthError('')
        }}
        onSubmit={handleAuthSubmit}
      />
    </>
  )
}

export default App
