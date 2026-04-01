import useQuizDashboard from '../hooks/useQuizDashboard'
import { typeLabels } from '../app/playgroundConstants'

function formatDate(value) {
  if (!value) {
    return 'Jamais'
  }

  return new Date(value).toLocaleString('fr-FR')
}

function getStatus(pattern) {
  if (pattern.badgeUnlocked) {
    return {
      label: 'Valide',
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    }
  }

  if (pattern.attemptsCount > 0) {
    return {
      label: 'En cours',
      tone: 'border-amber-200 bg-amber-50 text-amber-900',
    }
  }

  return {
    label: 'A demarrer',
    tone: 'border-black/10 bg-white text-stone-700',
  }
}

function DashboardGate({
  onNavigateHome,
  onOpenAuth,
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Progression utilisateur</p>
        <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Tableau de bord des quiz</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
          Connecte-toi pour suivre tes scores, tes badges valides et les patterns qu il te reste a consolider.
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
            onClick={() => onOpenAuth('register')}
          >
            Creer un compte
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

function StatCard({
  label,
  value,
  detail,
  tone = 'default',
}) {
  const toneClass = tone === 'success'
    ? 'border-emerald-200 bg-emerald-50'
    : 'border-black/10 bg-white/84'

  return (
    <article className={`rounded-[24px] border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{label}</p>
      <p className="mt-3 text-3xl text-stone-950">{value}</p>
      <p className="mt-3 text-sm leading-7 text-stone-700">{detail}</p>
    </article>
  )
}

function PatternProgressCard({
  pattern,
  onOpenPattern,
  onOpenQuiz,
}) {
  const status = getStatus(pattern)

  return (
    <article className="rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,240,226,0.92))] p-5 shadow-[0_14px_34px_rgba(47,37,22,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            {typeLabels[pattern.patternType] ?? pattern.patternType} · {pattern.complexityLevel}
          </p>
          <h2 className="mt-3 text-2xl text-stone-950">{pattern.patternName}</h2>
        </div>
        <span className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${status.tone}`}>
          {status.label}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-stone-700">{pattern.description}</p>
      <p className="mt-4 rounded-[22px] bg-[var(--teal-soft)]/72 px-4 py-4 text-sm leading-7 text-stone-700">
        Cas d usage : {pattern.useCase}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-black/10 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Meilleur score</p>
          <p className="mt-2 text-lg font-semibold text-stone-950">{pattern.bestPoints} / {pattern.maxPoints} pts</p>
          <p className="mt-1 text-sm text-stone-600">{pattern.bestPointsPercent}% max</p>
        </div>
        <div className="rounded-[20px] border border-black/10 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Reponses justes</p>
          <p className="mt-2 text-lg font-semibold text-stone-950">{pattern.bestCorrectPercent}%</p>
          <p className="mt-1 text-sm text-stone-600">Seuil badge : {pattern.passingPercent}%</p>
        </div>
        <div className="rounded-[20px] border border-black/10 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Tentatives</p>
          <p className="mt-2 text-lg font-semibold text-stone-950">{pattern.attemptsCount}</p>
          <p className="mt-1 text-sm text-stone-600">Derniere : {formatDate(pattern.lastAttemptAt)}</p>
        </div>
        <div className="rounded-[20px] border border-black/10 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Badge</p>
          <p className="mt-2 text-lg font-semibold text-stone-950">{pattern.badgeUnlocked ? pattern.badgeLabel : 'Non valide'}</p>
          <p className="mt-1 text-sm text-stone-600">
            {pattern.badgeUnlocked ? `Debloque le ${formatDate(pattern.badgeUnlockedAt)}` : 'A obtenir'}
          </p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/8">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            pattern.badgeUnlocked ? 'bg-emerald-500' : 'bg-stone-950'
          }`}
          style={{ width: `${Math.max(6, pattern.bestCorrectPercent)}%` }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          type="button"
          onClick={() => onOpenQuiz(pattern.patternCode)}
        >
          {pattern.attemptsCount > 0 ? 'Repasser le quiz' : 'Commencer le quiz'}
        </button>
        <button
          className="rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
          type="button"
          onClick={() => onOpenPattern(pattern.patternCode)}
        >
          Ouvrir le pattern
        </button>
      </div>
    </article>
  )
}

export default function QuizDashboardPage({
  backendStatus,
  currentUser,
  onNavigateHome,
  onOpenPattern,
  onOpenQuiz,
  onOpenAuth,
}) {
  const { dashboard, dashboardError, isDashboardLoading } = useQuizDashboard(
    backendStatus,
    Boolean(currentUser),
  )

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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Progression indisponible</p>
          <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Tableau de bord des quiz</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
            Cette page a besoin d une API connectee pour charger la progression persistante.
          </p>
        </section>
      </div>
    )
  }

  const sortedPatterns = [...(dashboard?.patterns ?? [])].sort((left, right) => {
    if (left.badgeUnlocked !== right.badgeUnlocked) {
      return left.badgeUnlocked ? -1 : 1
    }

    if ((left.attemptsCount > 0) !== (right.attemptsCount > 0)) {
      return left.attemptsCount > 0 ? -1 : 1
    }

    return right.bestCorrectPercent - left.bestCorrectPercent
  })

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
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
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Progression utilisateur</p>
              <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Tableau de bord des quiz</h1>
            </div>

            <p className="max-w-3xl text-base leading-7 text-stone-700">
              Suis ton score global, les badges deja valides et les patterns qu il te reste a consolider.
            </p>
          </div>

          <div className="grid gap-4 self-start md:grid-cols-2 xl:grid-cols-2">
            <StatCard
              detail={`Score total cumule sur tes meilleurs passages.`}
              label="Score global"
              value={dashboard ? `${dashboard.totalBestPoints} / ${dashboard.totalMaxPoints} pts` : '—'}
            />
            <StatCard
              detail="Nombre de patterns deja valides avec le seuil de 75%."
              label="Badges"
              tone="success"
              value={dashboard ? `${dashboard.validatedPatterns} / ${dashboard.totalPatterns}` : '—'}
            />
            <StatCard
              detail="Patterns deja commences, meme s ils ne sont pas encore valides."
              label="Progression"
              value={dashboard ? `${dashboard.startedPatterns} / ${dashboard.totalPatterns}` : '—'}
            />
            <StatCard
              detail="Nombre total de tentatives enregistrees."
              label="Tentatives"
              value={dashboard ? `${dashboard.totalAttempts}` : '—'}
            />
          </div>
        </div>
      </section>

      {isDashboardLoading ? (
        <div className="rounded-[26px] border border-black/10 bg-white/80 px-5 py-10 text-sm leading-7 text-stone-700 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          Chargement du tableau de bord en cours...
        </div>
      ) : null}

      {!isDashboardLoading && dashboardError ? (
        <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-10 text-sm leading-7 text-red-700">
          {dashboardError}
        </div>
      ) : null}

      {!isDashboardLoading && dashboard && sortedPatterns.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {sortedPatterns.map((pattern) => (
            <PatternProgressCard
              key={pattern.patternCode}
              pattern={pattern}
              onOpenPattern={onOpenPattern}
              onOpenQuiz={onOpenQuiz}
            />
          ))}
        </section>
      ) : null}
    </div>
  )
}
