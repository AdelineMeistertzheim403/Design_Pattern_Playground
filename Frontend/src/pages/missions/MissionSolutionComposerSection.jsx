import SpaLink from '../../components/SpaLink'
import { buildPatternPath } from '../../app/playgroundUtils'
import {
  CandidatePatternCard,
  SolutionDropzone,
} from './missionPageShared'

export default function MissionSolutionComposerSection({
  activeConfigPattern,
  error,
  executionPending,
  mission,
  onAddPattern,
  onExecuteMission,
  onNavigatePattern,
  onRemovePattern,
  onSelectPattern,
  patternsByCode,
  selectedPatterns,
}) {
  return (
    <article className="rounded-[24px] border border-black/10 bg-white p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Composer la solution</p>
        <p className="mt-1 text-sm leading-7 text-stone-600">
          Glisse les patterns candidats dans la zone solution. La page ne revele pas la bonne combinaison.
        </p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-3">
          {mission.candidatePatterns.map((patternCode) => (
            <CandidatePatternCard
              key={patternCode}
              missionPrompt={mission.patternPrompts?.[patternCode]}
              pattern={patternsByCode[patternCode]}
              onAdd={onAddPattern}
            />
          ))}
        </div>

        <SolutionDropzone
          onDropPattern={onAddPattern}
          onRemove={onRemovePattern}
          onSelect={onSelectPattern}
          patternsByCode={patternsByCode}
          selectedPatterns={selectedPatterns}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={executionPending || selectedPatterns.length === 0}
          type="submit"
          onClick={onExecuteMission}
        >
          {executionPending ? 'Simulation en cours...' : 'Lancer la mission'}
        </button>

        {activeConfigPattern ? (
          <SpaLink
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
            href={buildPatternPath(activeConfigPattern)}
            onNavigate={() => onNavigatePattern(activeConfigPattern)}
          >
            Ouvrir la page du pattern
          </SpaLink>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </article>
  )
}
