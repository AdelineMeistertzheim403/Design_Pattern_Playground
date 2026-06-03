import { useState } from 'react'
import CollapsiblePanel from '../components/CollapsiblePanel'
import useQuizDashboard from '../hooks/useQuizDashboard'

function getBadgeRarity(badge) {
  if (badge.secret || badge.category === 'LEGENDARY') {
    return 'LEGENDARY'
  }

  if (badge.category === 'MASTERY') {
    return 'EPIC'
  }

  if (badge.category === 'PERFORMANCE') {
    return 'RARE'
  }

  return 'COMMON'
}

function getRarityTone(rarity) {
  if (rarity === 'LEGENDARY') {
    return 'border-amber-300 bg-amber-50'
  }

  if (rarity === 'EPIC') {
    return 'border-fuchsia-200 bg-fuchsia-50'
  }

  if (rarity === 'RARE') {
    return 'border-sky-200 bg-sky-50'
  }

  return 'border-black/10 bg-white'
}

function formatDate(value) {
  if (!value) {
    return 'Jamais'
  }

  return new Date(value).toLocaleString('fr-FR')
}

function getBadgeUnlockCondition(badge) {
  const explicitRules = {
    first_steps: 'Terminer une première démo.',
    collector: 'Lancer au moins une démo pour chaque pattern du playground.',
    quiz_passed: 'Valider un quiz avec au moins 75% de bonnes réponses.',
    perfect_quiz: 'Obtenir 100% sur un quiz.',
    streak_3: 'Enchaîner 3 réussites consécutives.',
    mission_solver: 'Réussir 5 missions.',
    architect_confirmed: 'Réussir 10 missions.',
    fusion_success: 'Réussir une mission multi-pattern.',
    fusion_master: 'Réussir 5 missions multi-pattern.',
    untouchable: 'Réussir 3 missions difficiles sans échec.',
    playground_archivist: 'Débloquer 20 badges.',
    playground_master: 'Maîtriser tous les patterns.',
  }

  if (explicitRules[badge.code]) {
    return explicitRules[badge.code]
  }

  if (badge.category === 'MASTERY' && badge.code.startsWith('master_')) {
    const patternName = badge.code.replace('master_', '').replace(/_/g, ' ')
    return `Atteindre 100% de maîtrise sur ${patternName}.`
  }

  if (badge.secret) {
    return 'Condition tenue secrète tant que le badge n’est pas débloqué.'
  }

  return badge.description
}

const masteryPatternAliases = {
  master_strategy: 'strategy',
  master_observer: 'observer',
  master_singleton: 'singleton',
  master_state: 'state',
  master_decorator: 'decorator',
  master_flyweight: 'flyweight',
  master_builder: 'builder',
  master_command: 'command',
  master_mediator: 'mediator',
  master_visitor: 'visitor',
}

function getBadgeProgress(badge, dashboard) {
  const profile = dashboard?.profile
  const missions = dashboard?.missions
  const patterns = dashboard?.patterns ?? []

  if (!profile || !missions) {
    return null
  }

  const masteryCount = patterns.filter((pattern) => pattern.mastered).length

  const progressByCode = {
    mission_solver: { current: missions.successfulMissions, target: 5, unit: 'missions' },
    architect_confirmed: { current: missions.successfulMissions, target: 10, unit: 'missions' },
    fusion_success: { current: missions.multiPatternMissionSuccesses, target: 1, unit: 'missions fusion' },
    fusion_master: { current: missions.multiPatternMissionSuccesses, target: 5, unit: 'missions fusion' },
    untouchable: { current: missions.bestHardMissionSuccessStreak, target: 3, unit: 'missions difficiles' },
    playground_archivist: { current: profile.unlockedBadgeCount, target: 20, unit: 'badges' },
    playground_master: { current: masteryCount, target: patterns.length || 23, unit: 'patterns maîtrisés' },
  }

  if (badge.category === 'MASTERY' && badge.code.startsWith('master_')) {
    const patternCode = masteryPatternAliases[badge.code] ?? badge.code.replace('master_', '').replace(/_/g, '-')
    const pattern = patterns.find((entry) => entry.patternCode === patternCode)
    return {
      current: pattern?.masteryPercent ?? 0,
      target: 100,
      unit: '%',
    }
  }

  return progressByCode[badge.code] ?? null
}

function DashboardGate({
  onNavigateHome,
  onOpenAuth,
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Badges</p>
        <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Collection de récompenses</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
          Connecte-toi pour voir les badges déjà débloqués, ceux qui restent à viser et la rareté de chaque famille.
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
            Retour à l’accueil
          </button>
        </div>
      </section>
    </div>
  )
}

function BadgeFilter({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</span>
      <select
        className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-stone-950"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function BadgeCard({ badge, progress }) {
  const rarity = getBadgeRarity(badge)

  return (
    <article className={`rounded-[24px] border p-5 shadow-[0_14px_34px_rgba(47,37,22,0.06)] ${getRarityTone(rarity)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            {badge.category} · {rarity}
          </p>
          <h2 className="mt-2 text-xl text-stone-950">{badge.name}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${badge.unlocked ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600'}`}>
          {badge.unlocked ? 'Débloqué' : badge.secret ? 'Secret' : 'Verrouillé'}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-stone-700">
        {badge.unlocked || !badge.secret ? badge.description : 'Les conditions de ce badge restent cachées tant qu’il n’est pas débloqué.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-700">
          {badge.unlocked ? `Obtenu le ${formatDate(badge.unlockedAt)}` : 'Pas encore obtenu'}
        </span>
        {progress ? (
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-700">
            Progression : {progress.current}/{progress.target} {progress.unit}
          </span>
        ) : null}
      </div>
    </article>
  )
}

function BadgeDetailPanel({ badge, progress }) {
  if (!badge) {
    return (
      <article className="rounded-[24px] border border-dashed border-black/15 bg-[var(--panel)] px-5 py-10 text-sm leading-7 text-stone-600">
        Choisis un badge pour afficher sa fiche détaillée.
      </article>
    )
  }

  return (
    <article className={`rounded-[28px] border p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] ${getRarityTone(badge.rarity)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            {badge.category} · {badge.rarity}
          </p>
          <h2 className="mt-2 text-2xl text-stone-950">{badge.name}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${badge.unlocked ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600'}`}>
          {badge.unlocked ? 'Débloqué' : badge.secret ? 'Secret' : 'Verrouillé'}
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Description</p>
          <p className="mt-2 text-sm leading-7 text-stone-700">
            {badge.unlocked || !badge.secret ? badge.description : 'Le contenu de ce badge reste caché tant qu’il n’est pas débloqué.'}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Condition de déblocage</p>
          <p className="mt-2 text-sm leading-7 text-stone-700">
            {badge.secret && !badge.unlocked ? 'Condition masquée pour conserver l’effet secret.' : getBadgeUnlockCondition(badge)}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">État</p>
          <p className="mt-2 text-sm leading-7 text-stone-700">
            {badge.unlocked ? `Badge obtenu le ${formatDate(badge.unlockedAt)}.` : 'Badge pas encore obtenu.'}
          </p>
        </div>

        {progress ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Compteur visible</p>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              {progress.current}/{progress.target} {progress.unit}
            </p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-stone-950 transition-[width] duration-500"
                style={{ width: `${Math.max(4, Math.min(100, (progress.current * 100) / Math.max(1, progress.target)))}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default function BadgesPage({
  backendStatus,
  currentUser,
  onNavigateHome,
  onNavigateProgress,
  onOpenAuth,
}) {
  const { dashboard, dashboardError, isDashboardLoading } = useQuizDashboard(
    backendStatus,
    Boolean(currentUser),
  )

  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [rarityFilter, setRarityFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortOrder, setSortOrder] = useState('RECENT')
  const [activeBadgeCode, setActiveBadgeCode] = useState(null)

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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Badges indisponibles</p>
          <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Collection de récompenses</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
            Cette page a besoin d’une API connectée pour charger les badges persistants.
          </p>
        </section>
      </div>
    )
  }

  const badges = dashboard?.badges ?? []
  const enrichedBadges = badges.map((badge) => ({
    ...badge,
    rarity: getBadgeRarity(badge),
  }))

  const filteredBadges = enrichedBadges.filter((badge) => {
    if (categoryFilter !== 'ALL' && badge.category !== categoryFilter) {
      return false
    }

    if (rarityFilter !== 'ALL' && badge.rarity !== rarityFilter) {
      return false
    }

    if (statusFilter === 'UNLOCKED' && !badge.unlocked) {
      return false
    }

    if (statusFilter === 'LOCKED' && badge.unlocked) {
      return false
    }

    return true
  }).sort((left, right) => {
      if (sortOrder === 'UNLOCKED') {
        if (left.unlocked !== right.unlocked) {
          return left.unlocked ? -1 : 1
        }
        return left.name.localeCompare(right.name, 'fr')
    }

    if (sortOrder === 'RARITY') {
      const rarityRank = {
        LEGENDARY: 4,
        EPIC: 3,
        RARE: 2,
        COMMON: 1,
      }
      if (rarityRank[left.rarity] !== rarityRank[right.rarity]) {
        return rarityRank[right.rarity] - rarityRank[left.rarity]
      }
      return left.name.localeCompare(right.name, 'fr')
    }

    const leftDate = left.unlockedAt ? new Date(left.unlockedAt).getTime() : 0
    const rightDate = right.unlockedAt ? new Date(right.unlockedAt).getTime() : 0
    if (leftDate !== rightDate) {
      return rightDate - leftDate
    }
    if (left.unlocked !== right.unlocked) {
      return left.unlocked ? -1 : 1
    }
      return left.name.localeCompare(right.name, 'fr')
  })

  const unlockedCount = enrichedBadges.filter((badge) => badge.unlocked).length
  const secretCount = enrichedBadges.filter((badge) => badge.secret).length
  const activeBadge = filteredBadges.find((badge) => badge.code === activeBadgeCode)
    ?? filteredBadges[0]
    ?? null
  const activeBadgeProgress = activeBadge ? getBadgeProgress(activeBadge, dashboard) : null

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
                Retour à l’accueil
              </button>
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onNavigateProgress}
              >
                Retour à la progression
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Badges</p>
              <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">Collection de récompenses</h1>
            </div>

            <p className="max-w-3xl text-base leading-7 text-stone-700">
              Filtre tes badges par catégorie, rareté et statut pour voir ce qui est déjà acquis et ce qu’il reste à débloquer.
            </p>
          </div>

          <div className="grid gap-4 self-start md:grid-cols-3 xl:grid-cols-3">
            <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Débloqués</p>
              <p className="mt-3 text-3xl text-stone-950">{unlockedCount}</p>
            </article>
            <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Secrets</p>
              <p className="mt-3 text-3xl text-stone-950">{secretCount}</p>
            </article>
            <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Total</p>
              <p className="mt-3 text-3xl text-stone-950">{enrichedBadges.length}</p>
            </article>
          </div>
        </div>
      </section>

      {isDashboardLoading ? (
        <div className="rounded-[26px] border border-black/10 bg-white/80 px-5 py-10 text-sm leading-7 text-stone-700 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          Chargement des badges en cours...
        </div>
      ) : null}

      {!isDashboardLoading && dashboardError ? (
        <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-10 text-sm leading-7 text-red-700">
          {dashboardError}
        </div>
      ) : null}

      {!isDashboardLoading && !dashboardError ? (
        <>
          <CollapsiblePanel
            eyebrow="Filtres"
            title="Explorer la collection"
            description="Trie par récence, rareté ou statut de déblocage, puis ouvre un badge pour afficher sa fiche détaillée."
            bodyClassName="grid gap-4"
          >
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <BadgeFilter
                label="Catégorie"
                value={categoryFilter}
                options={[
                  { value: 'ALL', label: 'Toutes les catégories' },
                  { value: 'DISCOVERY', label: 'Découverte' },
                  { value: 'MASTERY', label: 'Maîtrise' },
                  { value: 'PERFORMANCE', label: 'Performance' },
                  { value: 'LEGENDARY', label: 'Légendaire' },
                ]}
                onChange={setCategoryFilter}
              />
              <BadgeFilter
                label="Rareté"
                value={rarityFilter}
                options={[
                  { value: 'ALL', label: 'Toutes les raretés' },
                  { value: 'COMMON', label: 'Common' },
                  { value: 'RARE', label: 'Rare' },
                  { value: 'EPIC', label: 'Epic' },
                  { value: 'LEGENDARY', label: 'Legendary' },
                ]}
                onChange={setRarityFilter}
              />
              <BadgeFilter
                label="Statut"
                value={statusFilter}
                options={[
                  { value: 'ALL', label: 'Tous les statuts' },
                  { value: 'UNLOCKED', label: 'Débloqués' },
                  { value: 'LOCKED', label: 'Verrouillés' },
                ]}
                onChange={setStatusFilter}
              />
              <BadgeFilter
                label="Tri"
                value={sortOrder}
                options={[
                  { value: 'RECENT', label: 'Plus récents' },
                  { value: 'RARITY', label: 'Plus rares' },
                  { value: 'UNLOCKED', label: 'Déjà débloqués' },
                ]}
                onChange={setSortOrder}
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredBadges.map((badge) => (
                  <button
                    key={badge.code}
                    className="text-left"
                    type="button"
                    onClick={() => setActiveBadgeCode(badge.code)}
                  >
                    <div className={activeBadge?.code === badge.code ? 'ring-2 ring-stone-950 rounded-[24px]' : 'rounded-[24px]'}>
                      <BadgeCard badge={badge} progress={getBadgeProgress(badge, dashboard)} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="xl:sticky xl:top-24 xl:self-start">
                <BadgeDetailPanel badge={activeBadge} progress={activeBadgeProgress} />
              </div>
            </section>
          </CollapsiblePanel>

          {!filteredBadges.length ? (
            <div className="rounded-[24px] border border-dashed border-black/15 bg-[var(--panel)] px-5 py-10 text-sm leading-7 text-stone-600">
              Aucun badge ne correspond aux filtres actuels.
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
