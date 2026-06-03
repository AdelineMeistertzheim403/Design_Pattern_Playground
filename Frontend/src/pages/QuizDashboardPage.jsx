import useQuizDashboard from '../hooks/useQuizDashboard'
import CollapsiblePanel from '../components/CollapsiblePanel'
import { typeLabels } from '../app/playgroundConstants'
import { missionCatalog } from '../missions/catalog'

function formatDate(value) {
  if (!value) {
    return 'Jamais'
  }

  return new Date(value).toLocaleString('fr-FR')
}

function getStatus(pattern) {
  if (pattern.badgeUnlocked) {
    return {
      label: 'Validé',
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
    label: 'À démarrer',
    tone: 'border-black/10 bg-white text-stone-700',
  }
}

function getMasteryTone(percent) {
  if (percent >= 100) {
    return 'bg-emerald-500'
  }
  if (percent >= 75) {
    return 'bg-teal-500'
  }
  if (percent >= 50) {
    return 'bg-amber-500'
  }
  if (percent >= 25) {
    return 'bg-orange-500'
  }
  return 'bg-sky-500'
}

function BadgeCard({ badge }) {
  return (
    <article className={`rounded-[22px] border px-4 py-4 ${badge.unlocked ? 'border-emerald-200 bg-emerald-50/80' : 'border-black/10 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">{badge.name}</p>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            {badge.unlocked || !badge.secret ? badge.description : 'Badge secret'}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${badge.unlocked ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
          {badge.unlocked ? 'Débloqué' : 'Verrouillé'}
        </span>
      </div>
    </article>
  )
}

function MissionStatCard({
  label,
  value,
  detail,
}) {
  return (
    <article className="rounded-[22px] border border-black/10 bg-[var(--panel)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-stone-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone-600">{detail}</p>
    </article>
  )
}

function buildMissionObjective(dashboard) {
  const missionSummary = dashboard?.missions
  const successfulMissions = missionSummary?.successfulMissions ?? 0
  const successfulAdvancedMissions = missionSummary?.successfulAdvancedMissions ?? 0
  const multiPatternMissionSuccesses = missionSummary?.multiPatternMissionSuccesses ?? 0

  if (successfulMissions < 5) {
    return `Encore ${5 - successfulMissions} mission(s) pour viser le badge mission_solver.`
  }

  if (successfulMissions < 10) {
    return `Encore ${10 - successfulMissions} mission(s) pour viser le badge architect_confirmed.`
  }

  if (multiPatternMissionSuccesses < 1) {
    return 'Réussis une mission multi-pattern pour débloquer fusion_success.'
  }

  if (multiPatternMissionSuccesses < 5) {
    return `Encore ${5 - multiPatternMissionSuccesses} mission(s) fusion pour viser fusion_master.`
  }

  if (successfulAdvancedMissions < 3) {
    return `Encore ${3 - successfulAdvancedMissions} mission(s) avancées pour consolider ton niveau expert.`
  }

  return 'Toutes les familles de mission sont bien engagées. Tu peux maintenant viser la maîtrise complète du playground.'
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
          Connecte-toi pour suivre tes scores, tes badges validés et les patterns qu’il te reste à consolider.
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
            Créer un compte
          </button>
          <button
            className="rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
            type="button"
            onClick={onNavigateHome}
          >
            Retour à l’accueil
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
        Cas d’usage : {pattern.useCase}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-black/10 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Meilleur score</p>
          <p className="mt-2 text-lg font-semibold text-stone-950">{pattern.bestPoints} / {pattern.maxPoints} pts</p>
          <p className="mt-1 text-sm text-stone-600">{pattern.bestPointsPercent}% max</p>
        </div>
        <div className="rounded-[20px] border border-black/10 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Réponses justes</p>
          <p className="mt-2 text-lg font-semibold text-stone-950">{pattern.bestCorrectPercent}%</p>
          <p className="mt-1 text-sm text-stone-600">Seuil badge : {pattern.passingPercent}%</p>
        </div>
        <div className="rounded-[20px] border border-black/10 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Tentatives</p>
          <p className="mt-2 text-lg font-semibold text-stone-950">{pattern.attemptsCount}</p>
          <p className="mt-1 text-sm text-stone-600">Dernière : {formatDate(pattern.lastAttemptAt)}</p>
        </div>
        <div className="rounded-[20px] border border-black/10 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Badge</p>
          <p className="mt-2 text-lg font-semibold text-stone-950">{pattern.badgeUnlocked ? pattern.badgeLabel : 'Non validé'}</p>
          <p className="mt-1 text-sm text-stone-600">
            {pattern.badgeUnlocked ? `Débloqué le ${formatDate(pattern.badgeUnlockedAt)}` : 'À obtenir'}
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
  onOpenActivity,
  onOpenBadges,
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
            Cette page a besoin d’une API connectée pour charger la progression persistante.
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
  const totalMissionCount = missionCatalog.length
  const advancedMissionCount = missionCatalog.filter((mission) => mission.difficulty === 'Avancé').length
  const multiPatternMissionCount = missionCatalog.filter((mission) => mission.expectedPatterns.length > 1).length
  const missionSuccessPercent = totalMissionCount
    ? Math.round(((dashboard?.missions?.successfulMissions ?? 0) * 100) / totalMissionCount)
    : 0
  const advancedMissionPercent = advancedMissionCount
    ? Math.round(((dashboard?.missions?.successfulAdvancedMissions ?? 0) * 100) / advancedMissionCount)
    : 0
  const fusionMissionPercent = multiPatternMissionCount
    ? Math.round(((dashboard?.missions?.multiPatternMissionSuccesses ?? 0) * 100) / multiPatternMissionCount)
    : 0
  const missionObjective = buildMissionObjective(dashboard)

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
                Retour à l’accueil
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Progression utilisateur</p>
              <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Tableau de bord de progression</h1>
            </div>

            <p className="max-w-3xl text-base leading-7 text-stone-700">
              Suis ton XP global, tes badges, tes missions réussies et les patterns qu’il te reste à maîtriser.
            </p>
          </div>

          <div className="grid gap-4 self-start md:grid-cols-2 xl:grid-cols-2">
            <StatCard
              detail="Niveau global dérivé de ton expérience cumulée."
              label="Niveau"
              value={dashboard?.profile ? `${dashboard.profile.level}` : '—'}
            />
            <StatCard
              detail="Rang actuel du playground."
              label="Rang"
              tone="success"
              value={dashboard?.profile ? dashboard.profile.rank : '—'}
            />
            <StatCard
              detail="Expérience totale et prochain palier."
              label="XP"
              value={dashboard?.profile ? `${dashboard.profile.totalXp}` : '—'}
            />
            <StatCard
              detail="Nombre total de badges déjà débloqués."
              label="Badges"
              tone="success"
              value={dashboard?.profile ? `${dashboard.profile.unlockedBadgeCount} / ${dashboard.profile.totalBadgeCount}` : '—'}
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
        <>
          <section className="grid gap-4 xl:grid-cols-3">
            <StatCard
              detail="Score cumulé sur tes meilleurs passages aux quiz."
              label="Score global"
              value={`${dashboard.totalBestPoints} / ${dashboard.totalMaxPoints} pts`}
            />
            <StatCard
              detail="Missions réussies sur l’ensemble du playground."
              label="Missions"
              value={`${dashboard.missions.successfulMissions} réussies`}
            />
            <StatCard
              detail="Réussites avancées et multi-pattern mémorisées."
              label="Fusion / avancé"
              value={`${dashboard.missions.successfulAdvancedMissions} avancées · ${dashboard.missions.multiPatternMissionSuccesses} fusion`}
            />
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
              type="button"
              onClick={onOpenActivity}
            >
              Voir l’activité récente
            </button>
          </div>

          <CollapsiblePanel
            eyebrow="Missions"
            title="Campagne et progression scénario"
            description={`Objectif courant : ${missionObjective}`}
            defaultExpanded
            bodyClassName="grid gap-6"
          >
            <div className="grid gap-4 xl:grid-cols-4">
              <MissionStatCard
                detail={`${dashboard.missions.attemptedMissions} mission(s) tentée(s) sur ${totalMissionCount}.`}
                label="Campagne"
                value={`${dashboard.missions.successfulMissions} / ${totalMissionCount}`}
              />
              <MissionStatCard
                detail={`${advancedMissionCount} mission(s) avancées disponibles.`}
                label="Avancé"
                value={`${dashboard.missions.successfulAdvancedMissions} / ${advancedMissionCount}`}
              />
              <MissionStatCard
                detail={`${multiPatternMissionCount} mission(s) fusion dans le catalogue.`}
                label="Fusion"
                value={`${dashboard.missions.multiPatternMissionSuccesses} / ${multiPatternMissionCount}`}
              />
              <MissionStatCard
                detail="Meilleure série de réussites consécutives mémorisée."
                label="Série"
                value={`${dashboard.missions.bestSuccessStreak}`}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-900">Taux de réussite mission</p>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-800">{missionSuccessPercent}%</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-stone-950 transition-[width] duration-500" style={{ width: `${Math.max(4, missionSuccessPercent)}%` }} />
                </div>
              </article>

              <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-900">Progression avancée</p>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-800">{advancedMissionPercent}%</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-amber-500 transition-[width] duration-500" style={{ width: `${Math.max(4, advancedMissionPercent)}%` }} />
                </div>
              </article>

              <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-900">Progression fusion</p>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-800">{fusionMissionPercent}%</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-teal-500 transition-[width] duration-500" style={{ width: `${Math.max(4, fusionMissionPercent)}%` }} />
                </div>
              </article>
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            eyebrow="Badges"
            title="Dernières récompenses"
            description={`XP actuelle : ${dashboard.profile.totalXp} · prochain palier : ${dashboard.profile.nextLevelXp ?? 'max'}`}
            defaultExpanded={false}
            bodyClassName="grid gap-5"
          >
            <div className="flex flex-wrap justify-end">
              <button
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onOpenBadges}
              >
                Voir tous les badges
              </button>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-black/8">
              <div
                className="h-full rounded-full bg-stone-950 transition-[width] duration-500"
                style={{
                  width: dashboard.profile.nextLevelXp
                    ? `${Math.max(6, ((dashboard.profile.totalXp - dashboard.profile.currentLevelXp) * 100) / (dashboard.profile.nextLevelXp - dashboard.profile.currentLevelXp))}%`
                    : '100%',
                }}
              />
            </div>

            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {dashboard.badges.slice(0, 9).map((badge) => (
                <BadgeCard key={badge.code} badge={badge} />
              ))}
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            eyebrow="Maîtrise"
            title="Collection et progression"
            description="Chaque pattern progresse via la démo, le quiz, les missions simples et les missions avancées."
            defaultExpanded={false}
            bodyClassName="grid gap-4 lg:grid-cols-2"
          >
            <div className="grid gap-4 lg:grid-cols-2 lg:col-span-2">
              {sortedPatterns.map((pattern) => (
                <article key={`${pattern.patternCode}-mastery`} className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{pattern.patternName}</p>
                      <p className="mt-1 text-sm text-stone-600">{pattern.masteryLabel}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-800">
                      {pattern.masteryPercent}%
                    </span>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${getMasteryTone(pattern.masteryPercent)}`}
                      style={{ width: `${Math.max(4, pattern.masteryPercent)}%` }}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                    <span className={`rounded-full px-3 py-1 ${pattern.demoCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-stone-500'}`}>Démo</span>
                    <span className={`rounded-full px-3 py-1 ${pattern.quizPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-stone-500'}`}>Quiz</span>
                    <span className={`rounded-full px-3 py-1 ${pattern.missionCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-stone-500'}`}>Mission</span>
                    <span className={`rounded-full px-3 py-1 ${pattern.advancedMissionCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-stone-500'}`}>Mission avancée</span>
                  </div>
                </article>
              ))}
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            eyebrow="Quiz"
            title="Historique détaillé par pattern"
            description="Cette section liste les scores, tentatives et badges pattern par pattern."
            defaultExpanded={false}
            bodyClassName="grid gap-4 lg:grid-cols-2"
          >
            {sortedPatterns.map((pattern) => (
              <PatternProgressCard
                key={pattern.patternCode}
                pattern={pattern}
                onOpenPattern={onOpenPattern}
                onOpenQuiz={onOpenQuiz}
              />
            ))}
          </CollapsiblePanel>
        </>
      ) : null}
    </div>
  )
}
