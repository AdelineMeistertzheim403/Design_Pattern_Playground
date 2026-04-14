import { useMemo, useState } from 'react'
import CollapsiblePanel from '../../components/CollapsiblePanel'
import { missionSteps, MissionCard } from './missionPageShared'

const PAGE_SIZE = 3
const difficultyOrder = ['Debutant', 'Intermediaire', 'Avance']

function uniqueInOrder(values) {
  const seen = new Set()
  return values.filter((value) => {
    if (!value || seen.has(value)) return false
    seen.add(value)
    return true
  })
}

export default function MissionCatalogPage({ missions, onOpenMission }) {
  const [filters, setFilters] = useState({
    mode: 'ALL',
    difficulty: 'ALL',
    scope: 'ALL',
  })
  const [page, setPage] = useState(1)

  const modeOptions = useMemo(
    () => uniqueInOrder(missions.map((mission) => mission.mode)),
    [missions],
  )

  const difficultyOptions = useMemo(() => {
    const unique = uniqueInOrder(missions.map((mission) => mission.difficulty))
    return [
      ...difficultyOrder.filter((difficulty) => unique.includes(difficulty)),
      ...unique.filter((difficulty) => !difficultyOrder.includes(difficulty)),
    ]
  }, [missions])

  const filteredMissions = useMemo(() => {
    return missions.filter((mission) => {
      if (filters.mode !== 'ALL' && mission.mode !== filters.mode) {
        return false
      }
      if (filters.difficulty !== 'ALL' && mission.difficulty !== filters.difficulty) {
        return false
      }
      if (filters.scope !== 'ALL') {
        const expectedCount = mission.expectedPatterns?.length ?? 0
        const scope = expectedCount > 1 ? 'MULTI' : 'SINGLE'
        if (filters.scope !== scope) {
          return false
        }
      }
      return true
    })
  }, [missions, filters])

  const totalPages = Math.max(1, Math.ceil(filteredMissions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visibleMissions = filteredMissions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  function handleFilterChange(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
    setPage(1)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal relative overflow-hidden rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_30px_80px_rgba(47,37,22,0.14)] sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(36,107,94,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(194,87,55,0.2),transparent_35%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-600">Mode mission</p>
            <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Architecte logiciel en conditions reelles</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700 sm:text-lg">
              Choisis un scenario, puis ouvre sa page dediee pour composer la solution, configurer les patterns et verifier le systeme dans une scene SVG specifique a la mission.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {missionSteps.map((step, index) => (
                <div key={step} className="rounded-[20px] border border-black/10 bg-white/80 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Etape {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-black/10 bg-white/80 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Principe</p>
            <ul className="mt-3 grid gap-3 text-sm leading-7 text-stone-700">
              <li className="rounded-2xl border border-black/10 bg-[var(--panel)] px-4 py-3">
                1. Choisir un scenario metier.
              </li>
              <li className="rounded-2xl border border-black/10 bg-[var(--panel)] px-4 py-3">
                2. Ouvrir sa page dediee pour composer la solution.
              </li>
              <li className="rounded-2xl border border-black/10 bg-[var(--panel)] px-4 py-3">
                3. Configurer et verifier la mission dans une scene SVG specifique.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <CollapsiblePanel
        eyebrow="Missions"
        title="Choisir un scenario"
        description="Le catalogue sert uniquement a choisir une mission. Le clic ouvre ensuite une page detail distincte pour travailler sur ce scenario."
        bodyClassName="grid gap-3"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Mode</span>
            <select
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-black/20"
              value={filters.mode}
              onChange={(event) => handleFilterChange('mode', event.target.value)}
            >
              <option value="ALL">Tous les modes</option>
              {modeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Niveau</span>
            <select
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-black/20"
              value={filters.difficulty}
              onChange={(event) => handleFilterChange('difficulty', event.target.value)}
            >
              <option value="ALL">Tous les niveaux</option>
              {difficultyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Solution</span>
            <select
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-black/20"
              value={filters.scope}
              onChange={(event) => handleFilterChange('scope', event.target.value)}
            >
              <option value="ALL">Toutes les solutions</option>
              <option value="SINGLE">Mono-pattern</option>
              <option value="MULTI">Multi-patterns</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {visibleMissions.length > 0 ? (
            visibleMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onOpen={() => onOpenMission(mission.id)}
              />
            ))
          ) : (
            <div className="rounded-[26px] border border-dashed border-black/15 bg-[var(--panel)] px-5 py-10 text-sm leading-7 text-stone-600 lg:col-span-2">
              Aucun scenario ne correspond au filtre courant.
            </div>
          )}
        </div>

        {filteredMissions.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-45"
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Page precedente
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  pageNumber === currentPage
                    ? 'bg-stone-950 text-white'
                    : 'border border-black/10 bg-white text-stone-700'
                }`}
                type="button"
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-45"
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Page suivante
            </button>
          </div>
        ) : null}
      </CollapsiblePanel>
    </div>
  )
}
