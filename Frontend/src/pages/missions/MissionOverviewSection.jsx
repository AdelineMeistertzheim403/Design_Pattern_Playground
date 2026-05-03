import SpaLink from '../../components/SpaLink'
import { buildMissionPath } from '../../app/playgroundUtils'
import { ResultPill } from './missionPageShared'

export default function MissionOverviewSection({ mission, onNavigateMission }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <ResultPill>{mission.mode}</ResultPill>
          <ResultPill>{mission.difficulty}</ResultPill>
        </div>
        <SpaLink
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
          href={buildMissionPath()}
          onNavigate={() => onNavigateMission('')}
        >
          Retour au catalogue
        </SpaLink>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Contexte</p>
          <p className="mt-2 text-sm leading-7 text-stone-700">{mission.context}</p>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Problemes</p>
          <ul className="mt-2 grid gap-2 text-sm leading-7 text-stone-700">
            {mission.problems.map((problem) => (
              <li key={problem} className="rounded-2xl border border-black/10 bg-white px-3 py-2">
                {problem}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Objectif</p>
          <p className="mt-2 text-sm leading-7 text-stone-700">{mission.objective}</p>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Critere de reussite</p>
          <ul className="mt-2 grid gap-2 text-sm leading-7 text-stone-700">
            {mission.successCriteria.map((criterion) => (
              <li key={criterion} className="rounded-2xl border border-black/10 bg-white px-3 py-2">
                {criterion}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </>
  )
}
