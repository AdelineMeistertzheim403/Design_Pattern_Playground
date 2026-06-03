import { useState } from 'react'

export const missionSteps = [
  'Problème',
  'Analyse',
  'Composition de la solution',
  'Configuration',
  'Simulation',
  'Résultat',
]

export function MissionBrief({ mission, compact = false }) {
  return (
    <div className={`grid gap-3 ${compact ? '' : 'lg:grid-cols-3'}`}>
      <article className="rounded-[18px] border border-black/10 bg-[var(--panel)] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">1. Comprendre</p>
        <p className="mt-1 text-sm leading-6 text-stone-700">{mission.context}</p>
      </article>

      <article className="rounded-[18px] border border-black/10 bg-[var(--panel)] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">2. Diagnostiquer</p>
        <ul className="mt-1 grid gap-1.5 text-sm leading-6 text-stone-700">
          {mission.problems.map((problem) => (
            <li key={problem}>- {problem}</li>
          ))}
        </ul>
      </article>

      <article className="rounded-[18px] border border-black/10 bg-[var(--panel)] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">3. Décider</p>
        <p className="mt-1 text-sm leading-6 text-stone-700">{mission.objective}</p>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Choisis le ou les patterns qui couvrent ce besoin, puis configure seulement ce qui permet de le prouver.
        </p>
      </article>
    </div>
  )
}

export function MissionCard({ mission, onOpen }) {
  return (
    <button
      className="w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 text-left text-stone-800 transition hover:border-black/20 hover:-translate-y-0.5"
      type="button"
      onClick={onOpen}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{mission.mode}</p>
        <span className="rounded-full bg-[var(--panel)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-600">
          {mission.difficulty}
        </span>
      </div>
      <h3 className="mt-2 text-xl">{mission.title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-700">{mission.description}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
        {mission.expectedPatterns?.length > 1 ? 'Solution à composer' : 'Pattern à identifier'}
      </p>
    </button>
  )
}

export function ResultPill({ children, tone = 'neutral' }) {
  const toneClassName = tone === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : tone === 'danger'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-black/10 bg-[var(--panel)] text-stone-700'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClassName}`}>
      {children}
    </span>
  )
}

export function mapPatternsByCode(patterns) {
  return Object.fromEntries((patterns ?? []).map((pattern) => [pattern.code, pattern]))
}

export async function executeMissionPattern({ backendStatus, patternCode, parameters, executePattern, executeFallbackPattern }) {
  if (backendStatus === 'connected') {
    try {
      return await executePattern({
        patternCode,
        parameters,
      })
    } catch {
      return executeFallbackPattern(patternCode, parameters)
    }
  }

  return executeFallbackPattern(patternCode, parameters)
}

export function CandidatePatternCard({ pattern, onAdd }) {
  function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', pattern.code)
    event.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      draggable
      className="rounded-[22px] border border-black/10 bg-[var(--panel)] px-4 py-4"
      onDragStart={handleDragStart}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-base font-semibold text-stone-900">{pattern.name}</span>
        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          {pattern.type}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-stone-600">{pattern.description ?? pattern.useCase}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
          type="button"
          onClick={() => onAdd(pattern.code)}
        >
          Ajouter
        </button>
        <span className="rounded-full border border-dashed border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          Drag & drop
        </span>
      </div>
    </div>
  )
}

export function SolutionDropzone({ selectedPatterns, patternsByCode, onRemove, onDropPattern, onSelect }) {
  const [isOver, setIsOver] = useState(false)

  function handleDrop(event) {
    event.preventDefault()
    setIsOver(false)
    const patternCode = event.dataTransfer.getData('text/plain')
    if (patternCode) {
      onDropPattern(patternCode)
    }
  }

  return (
    <div
      className={`rounded-[24px] border-2 border-dashed p-4 transition ${isOver ? 'border-stone-950 bg-stone-50' : 'border-black/10 bg-white'}`}
      onDragOver={(event) => {
        event.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Zone solution</p>
      <p className="mt-1 text-sm leading-7 text-stone-600">
        Glisse les patterns ici pour composer ta solution mission. Tu peux aussi les ajouter au clic.
      </p>

      {selectedPatterns.length ? (
        <div className="mt-4 grid gap-3">
          {selectedPatterns.map((patternCode, index) => {
            const pattern = patternsByCode[patternCode]

            return (
              <div key={`${patternCode}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-black/10 bg-[var(--panel)] px-4 py-4">
                <button className="text-left" type="button" onClick={() => onSelect(patternCode)}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">Slot {index + 1}</p>
                  <p className="mt-1 text-base font-semibold text-stone-900">{pattern?.name ?? patternCode}</p>
                </button>
                <button
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700"
                  type="button"
                  onClick={() => onRemove(patternCode)}
                >
                  Retirer
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-[20px] border border-dashed border-black/10 bg-[var(--panel)] px-4 py-8 text-sm leading-7 text-stone-600">
          Aucune brique dans la solution pour le moment.
        </div>
      )}
    </div>
  )
}
