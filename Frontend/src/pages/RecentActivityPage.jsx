import { useMemo, useState } from 'react'
import useRecentActivity from '../hooks/useRecentActivity'

function formatDate(value) {
  if (!value) {
    return 'Date inconnue'
  }

  return new Date(value).toLocaleString('fr-FR')
}

function getActivityTone(type) {
  if (type === 'BADGE_UNLOCKED') {
    return 'border-emerald-200 bg-emerald-50'
  }
  if (type === 'MISSION_SUCCESS') {
    return 'border-teal-200 bg-teal-50'
  }
  if (type === 'MISSION_ATTEMPT') {
    return 'border-amber-200 bg-amber-50'
  }
  if (type === 'PATTERN_MASTERED') {
    return 'border-fuchsia-200 bg-fuchsia-50'
  }
  return 'border-black/10 bg-white'
}

function getActivityLabel(type) {
  switch (type) {
    case 'BADGE_UNLOCKED':
      return 'Badge'
    case 'MISSION_SUCCESS':
      return 'Mission reussie'
    case 'MISSION_ATTEMPT':
      return 'Mission a revoir'
    case 'PATTERN_MASTERED':
      return 'Pattern maitrise'
    case 'QUIZ_SUBMITTED':
      return 'Quiz'
    default:
      return 'Activite'
  }
}

function DashboardGate({
  onNavigateHome,
  onOpenAuth,
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Activite recente</p>
        <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Journal de progression</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
          Connecte-toi pour voir les derniers quiz termines, badges debloques, missions reussies et patterns maitrises.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            type="button"
            onClick={() => onOpenAuth('login')}
          >
            Se connecter
          </button>
          <button
            className="rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
            type="button"
            onClick={onNavigateHome}
          >
            Retour a l accueil
          </button>
        </div>
      </section>
    </div>
  )
}

export default function RecentActivityPage({
  backendStatus,
  currentUser,
  onNavigateHome,
  onNavigateProgress,
  onOpenAuth,
}) {
  const [typeFilter, setTypeFilter] = useState('ALL')
  const { activity, activityError, isActivityLoading } = useRecentActivity(
    backendStatus,
    Boolean(currentUser),
    40,
  )

  const filteredActivity = useMemo(() => (
    activity.filter((item) => typeFilter === 'ALL' || item.type === typeFilter)
  ), [activity, typeFilter])

  if (!currentUser) {
    return (
      <DashboardGate
        onNavigateHome={onNavigateHome}
        onOpenAuth={onOpenAuth}
      />
    )
  }

  if (backendStatus !== 'connected') {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Activite indisponible</p>
          <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Journal de progression</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
            Cette page a besoin d une API connectee pour charger l activite recente persistante.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onNavigateHome}
              >
                Retour a l accueil
              </button>
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onNavigateProgress}
              >
                Retour a la progression
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Activite recente</p>
              <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Journal de progression</h1>
            </div>

            <p className="max-w-3xl text-base leading-7 text-stone-700">
              Cette page rassemble les derniers evenements persistants du playground : quiz, badges, missions et maitrise de pattern.
            </p>
          </div>

          <div className="grid gap-4 self-start md:grid-cols-3 xl:grid-cols-3">
            <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Evenements</p>
              <p className="mt-3 text-3xl text-stone-950">{activity.length}</p>
            </article>
            <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Affiches</p>
              <p className="mt-3 text-3xl text-stone-950">{filteredActivity.length}</p>
            </article>
            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Filtre</span>
              <select
                className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-stone-950"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="ALL">Tout afficher</option>
                <option value="BADGE_UNLOCKED">Badges</option>
                <option value="QUIZ_SUBMITTED">Quiz</option>
                <option value="MISSION_SUCCESS">Missions reussies</option>
                <option value="MISSION_ATTEMPT">Missions a revoir</option>
                <option value="PATTERN_MASTERED">Patterns maitrises</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {isActivityLoading ? (
        <div className="rounded-[26px] border border-black/10 bg-white/80 px-5 py-10 text-sm leading-7 text-stone-700 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          Chargement de l activite recente...
        </div>
      ) : null}

      {!isActivityLoading && activityError ? (
        <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-10 text-sm leading-7 text-red-700">
          {activityError}
        </div>
      ) : null}

      {!isActivityLoading && !activityError ? (
        <section className="grid gap-4">
          {filteredActivity.map((item) => (
            <article key={`${item.type}-${item.relatedCode}-${item.occurredAt}`} className={`rounded-[24px] border p-5 shadow-[0_14px_34px_rgba(47,37,22,0.06)] ${getActivityTone(item.type)}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{getActivityLabel(item.type)}</p>
                  <h2 className="mt-2 text-xl text-stone-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-700">{item.detail}</p>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-700">
                  {formatDate(item.occurredAt)}
                </span>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!isActivityLoading && !activityError && filteredActivity.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-black/15 bg-[var(--panel)] px-5 py-10 text-sm leading-7 text-stone-600">
          Aucun evenement ne correspond au filtre actuel.
        </div>
      ) : null}
    </div>
  )
}
