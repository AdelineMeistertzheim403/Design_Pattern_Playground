export default function RewardToast({
  reward,
  onDismiss,
}) {
  if (!reward) {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 max-w-sm">
      <article className="pointer-events-auto rounded-[26px] border border-emerald-200 bg-[linear-gradient(180deg,rgba(234,255,246,0.98),rgba(212,242,229,0.98))] p-5 shadow-[0_24px_70px_rgba(36,107,94,0.22)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Progression</p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">Recompense debloquee</h2>
          </div>
          <button
            className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-800"
            type="button"
            onClick={onDismiss}
          >
            Fermer
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900">+{reward.xpGained} XP</span>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900">Niveau {reward.level}</span>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900">{reward.rank}</span>
        </div>

        {reward.newlyUnlockedBadges?.length ? (
          <div className="mt-4 grid gap-2">
            {reward.newlyUnlockedBadges.map((badge) => (
              <div key={badge.code} className="rounded-[18px] border border-emerald-200 bg-white/90 px-4 py-3">
                <p className="text-sm font-semibold text-stone-900">{badge.name}</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">{badge.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-stone-700">
            L XP et le rang ont ete mis a jour dans ton tableau de bord.
          </p>
        )}
      </article>
    </div>
  )
}
