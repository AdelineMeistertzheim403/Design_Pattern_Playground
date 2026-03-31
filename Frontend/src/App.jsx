import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import ExecutionScene from './components/ExecutionScene'
import UmlDiagram from './components/UmlDiagram'
import { executeFallbackPattern, fallbackPatterns, getFallbackSchema } from './data/fallbackPatterns'
import { getPatternLearningContent } from './data/patternLearningContent'
import { getPatternUmlDiagram } from './data/patternUmlDiagrams'
import { API_URL, executePattern, getPatternSchema, getPatterns } from './lib/api'

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
    message: "Schemas, metadata et executions proviennent du registre Spring Boot.",
  },
  fallback: {
    label: 'Mode local',
    tone: 'bg-stone-200 text-stone-800 ring-stone-300',
    message: "Le front degrade sur des demos locales tant que l API n est pas joignable.",
  },
}

const highlightCards = [
  {
    title: 'Scene SVG',
    body: 'Chaque pattern peut etre joue visuellement avec une scene runtime qui montre les objets actifs et leurs interactions.',
  },
  {
    title: 'UML Relie Au Runtime',
    body: 'Le diagramme UML explique la structure, pendant que la scene SVG montre ce qui se passe a l execution.',
  },
  {
    title: 'Mode Pedagogique',
    body: 'Le projet parle autant aux etudiants qu aux developpeurs avec des explications, des etapes et des cas d usage concrets.',
  },
]

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

function buildPreviewExecution(code, schema, formValues) {
  try {
    return executeFallbackPattern(code, normalizeParameters(schema, formValues))
  } catch {
    return null
  }
}

function App() {
  const [patterns, setPatterns] = useState(fallbackPatterns)
  const [selectedCode, setSelectedCode] = useState(fallbackPatterns[0].code)
  const [schema, setSchema] = useState(getFallbackSchema(fallbackPatterns[0].code))
  const [formValues, setFormValues] = useState(
    buildInitialParameters(getFallbackSchema(fallbackPatterns[0].code)),
  )
  const [execution, setExecution] = useState(null)
  const [executionError, setExecutionError] = useState('')
  const [lastExecutedPayload, setLastExecutedPayload] = useState(null)
  const [backendStatus, setBackendStatus] = useState('loading')
  const [isExecuting, setIsExecuting] = useState(false)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

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
        setSelectedCode((currentCode) =>
          apiPatterns.some((pattern) => pattern.code === currentCode)
            ? currentCode
            : apiPatterns[0].code,
        )
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

  const visiblePatterns = patterns.filter((pattern) => {
    const haystack = `${pattern.name} ${pattern.type} ${pattern.description} ${pattern.useCase}`.toLowerCase()
    return haystack.includes(deferredSearch.trim().toLowerCase())
  })

  useEffect(() => {
    if (visiblePatterns.length > 0 && !visiblePatterns.some((pattern) => pattern.code === selectedCode)) {
      setSelectedCode(visiblePatterns[0].code)
    }
  }, [selectedCode, visiblePatterns])

  useEffect(() => {
    let ignore = false

    const fallbackSchema = getFallbackSchema(selectedCode)
    setSchema(fallbackSchema)
    setFormValues(buildInitialParameters(fallbackSchema))
    setExecution(null)
    setExecutionError('')
    setLastExecutedPayload(null)

    const loadSchema = async () => {
      if (backendStatus !== 'connected') {
        return
      }

      try {
        const apiSchema = await getPatternSchema(selectedCode)
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
  }, [backendStatus, selectedCode])

  const selectedPattern = patterns.find((pattern) => pattern.code === selectedCode) ?? fallbackPatterns[0]
  const learningContent = getPatternLearningContent(selectedCode)
  const umlDiagram = getPatternUmlDiagram(selectedCode)
  const status = statusMap[backendStatus] ?? statusMap.fallback
  const apiTarget = `${API_URL}/api/patterns`
  const draftPayload = {
    patternCode: selectedCode,
    parameters: normalizeParameters(schema, formValues),
  }
  const previewExecution = buildPreviewExecution(selectedCode, schema, formValues)
  const hasDraftChanges = Boolean(
    lastExecutedPayload
    && JSON.stringify(lastExecutedPayload) !== JSON.stringify(draftPayload),
  )
  const visualExecution = execution && !hasDraftChanges ? execution : (previewExecution ?? execution)
  const visualSourceLabel = execution && !hasDraftChanges ? 'Derniere execution' : 'Apercu live'

  async function handleExecute(event) {
    event.preventDefault()
    setIsExecuting(true)
    setExecutionError('')

    const payload = draftPayload

    try {
      const result = backendStatus === 'connected'
        ? await executePattern(payload)
        : executeFallbackPattern(selectedCode, payload.parameters)

      setExecution(result)
      setLastExecutedPayload(payload)
    } catch (error) {
      if (backendStatus === 'connected') {
        setBackendStatus('fallback')

        try {
          setExecution(executeFallbackPattern(selectedCode, payload.parameters))
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

  function updateFieldValue(field, nextValue) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field.name]: nextValue,
    }))
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <section className="reveal relative overflow-hidden rounded-[32px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_30px_80px_rgba(47,37,22,0.14)] sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(36,107,94,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(194,87,55,0.2),transparent_35%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-700">
              Pattern Simulator MVP
            </div>
            <div className="space-y-4">
              <p className="max-w-xl text-sm uppercase tracking-[0.22em] text-stone-600">
                Playground visuel, schemas dynamiques, UML et demos runtime
              </p>
              <h1 className="max-w-3xl text-4xl leading-none text-stone-950 sm:text-6xl">
                Un laboratoire de design patterns pour comprendre, voir et manipuler chaque mecanique.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
                Choisis un pattern, joue avec ses parametres, observe son comportement en SVG puis compare
                la scene runtime avec son UML. Le meme ecran doit aider a apprendre, reviser et expliquer.
              </p>
            </div>
          </div>

          <div className="grid gap-3 self-end">
            <div className="rounded-[24px] border border-black/10 bg-white/80 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">API cible</p>
              <p className="mt-3 font-mono text-sm text-stone-800">{apiTarget}</p>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-white/80 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Patterns actifs</p>
              <p className="mt-3 text-4xl font-semibold text-stone-950">{patterns.length}</p>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-white/80 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Etat backend</p>
              <div className={`mt-3 inline-flex rounded-full px-3 py-2 text-xs font-semibold ring-1 ${status.tone}`}>
                {status.label}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlightCards.map((card, index) => (
          <article
            key={card.title}
            className="reveal rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-[0_16px_40px_rgba(47,37,22,0.08)] backdrop-blur-sm"
            style={{ animationDelay: `${120 * (index + 1)}ms` }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Pillar {index + 1}
            </p>
            <h2 className="mt-4 text-2xl text-stone-950">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-700">{card.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.72fr_0.98fr_1.1fr]">
        <aside className="reveal rounded-[32px] border border-black/10 bg-[var(--panel-strong)] p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Catalogue</p>
              <h2 className="mt-3 text-3xl text-stone-950">Patterns</h2>
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
              placeholder="Filtrer par nom, type ou cas d usage"
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
                const isActive = pattern.code === selectedCode

                return (
                  <button
                    key={pattern.code}
                    className={`rounded-[24px] border px-4 py-4 text-left transition ${
                      isActive
                        ? 'border-stone-950 bg-stone-950 text-white shadow-[0_20px_35px_rgba(28,25,23,0.18)]'
                        : 'border-black/10 bg-white/85 text-stone-900 hover:-translate-y-0.5 hover:border-black/20'
                    }`}
                    type="button"
                    onClick={() => setSelectedCode(pattern.code)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${
                          isActive ? 'text-white/70' : 'text-stone-500'
                        }`}>
                          {typeLabels[pattern.type] ?? pattern.type}
                        </p>
                        <h3 className="mt-3 text-xl">{pattern.name}</h3>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                        isActive ? 'bg-white/12 text-white' : 'bg-[var(--accent-soft)] text-stone-900'
                      }`}>
                        {pattern.complexityLevel}
                      </span>
                    </div>
                    <p className={`mt-4 text-sm leading-6 ${isActive ? 'text-white/82' : 'text-stone-700'}`}>
                      {pattern.description}
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
        </aside>

        <section className="reveal rounded-[32px] border border-black/10 bg-white/80 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm">
          <div className="border-b border-black/10 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Configuration</p>
            <h2 className="mt-3 text-3xl text-stone-950">{selectedPattern.name}</h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              {typeLabels[selectedPattern.type] ?? selectedPattern.type} · {selectedPattern.complexityLevel}
            </p>
            <p className="mt-4 text-sm leading-7 text-stone-700">{selectedPattern.description}</p>
            <p className="mt-3 rounded-[22px] bg-[var(--accent-soft)]/70 px-4 py-4 text-sm leading-7 text-stone-700">
              Cas d usage : {selectedPattern.useCase}
            </p>
            <p className="mt-3 rounded-[22px] bg-[var(--teal-soft)]/85 px-4 py-4 text-sm leading-7 text-stone-700">
              Lecture pedagogique : {learningContent.strapline}
            </p>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleExecute}>
            {(schema?.fields ?? []).map((field) => (
              <label key={field.name} className="grid gap-2">
                <span className="text-sm font-semibold text-stone-800">
                  {field.label}
                  {field.required ? ' *' : ''}
                </span>

                {field.type === 'SELECT' ? (
                  <select
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
                    value={formValues[field.name] ?? ''}
                    onChange={(event) => updateFieldValue(field, event.target.value)}
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
                    onClick={() => updateFieldValue(field, !formValues[field.name])}
                  >
                    <span>{formValues[field.name] ? 'Actif' : 'Inactif'}</span>
                    <span>{field.name}</span>
                  </button>
                ) : field.type === 'LIST' ? (
                  <textarea
                    className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
                    value={Array.isArray(formValues[field.name]) ? formValues[field.name].join(', ') : formValues[field.name] ?? ''}
                    onChange={(event) => updateFieldValue(field, event.target.value)}
                  />
                ) : (
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
                    type={field.type === 'NUMBER' ? 'number' : 'text'}
                    value={formValues[field.name] ?? ''}
                    onChange={(event) => updateFieldValue(field, event.target.value)}
                  />
                )}
              </label>
            ))}

            <button
              className="mt-2 inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isExecuting}
              type="submit"
            >
              {isExecuting ? 'Execution en cours...' : 'Lancer la demo'}
            </button>

            {executionError ? (
              <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {executionError}
              </div>
            ) : null}
          </form>
        </section>

        <section className="reveal rounded-[32px] border border-black/10 bg-white/80 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm">
          <div className="border-b border-black/10 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Execution</p>
            <h2 className="mt-3 text-3xl text-stone-950">Resultat</h2>
            <p className="mt-4 text-sm leading-7 text-stone-700">
              Lance la demo pour voir un resume, les logs pedagogiques et le graphe simplifie du pattern.
            </p>
          </div>

          {execution ? (
            <div className="mt-6 grid gap-4">
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
                <div className="mt-4 grid gap-3 md:grid-cols-2">
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
                <ul className="mt-4 space-y-3">
                  {(execution.logs ?? []).map((line, index) => (
                    <li key={`${line}-${index}`} className="rounded-2xl border border-black/10 bg-[var(--panel)] px-4 py-3 text-sm leading-7 text-stone-700">
                      {line}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-[26px] border border-black/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Visualization</p>
                <div className="mt-4 grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(execution.visualization?.nodes ?? []).map((node) => (
                      <div
                        key={node.id}
                        className={`rounded-2xl border px-4 py-4 ${
                          node.data?.selected || node.data?.active
                            ? 'border-stone-950 bg-stone-950 text-white'
                            : 'border-black/10 bg-[var(--panel)] text-stone-800'
                        }`}
                      >
                        <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
                          node.data?.selected || node.data?.active ? 'text-white/60' : 'text-stone-500'
                        }`}>
                          {node.type}
                        </p>
                        <h3 className="mt-2 text-lg">{node.label}</h3>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    {(execution.visualization?.edges ?? []).map((edge, index) => (
                      <div key={`${edge.from}-${edge.to}-${index}`} className="rounded-2xl border border-dashed border-black/15 bg-white px-4 py-3 text-sm text-stone-700">
                        {edge.from} → {edge.to} · {edge.label}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          ) : (
            <div className="mt-6 rounded-[26px] border border-dashed border-black/15 bg-[var(--panel)] px-5 py-10 text-sm leading-7 text-stone-600">
              Aucun resultat pour le moment. Choisis une configuration puis lance la demonstration.
            </div>
          )}
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <section className="reveal">
          <ExecutionScene
            execution={visualExecution}
            patternCode={selectedCode}
            sourceLabel={visualSourceLabel}
          />
        </section>

        <section className="reveal">
          <UmlDiagram
            diagram={umlDiagram}
            patternName={selectedPattern.name}
          />
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <section className="reveal rounded-[32px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Pedagogie</p>
          <h2 className="mt-3 text-3xl text-stone-950">Comment lire ce pattern</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Intuition</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.intuition}</p>
            </article>

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
          </div>

          <div className="mt-4 rounded-[24px] border border-black/10 bg-[var(--accent-soft)]/55 px-5 py-5 text-sm leading-7 text-stone-700">
            Exploration ludique : {learningContent.playfulPrompt}
          </div>
        </section>

        <section className="reveal rounded-[32px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Sequence</p>
          <h2 className="mt-3 text-3xl text-stone-950">Pas a pas</h2>

          <ol className="mt-6 grid gap-3">
            {learningContent.steps.map((step, index) => (
              <li key={`${selectedCode}-step-${index}`} className="flex gap-4 rounded-[24px] border border-black/10 bg-[var(--panel)] px-5 py-4">
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
                <article key={`${selectedCode}-${item.term}`} className="rounded-[24px] border border-black/10 bg-white px-5 py-4">
                  <p className="text-sm font-semibold text-stone-900">{item.term}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-700">{item.definition}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
