export default function SiteHeader({
  currentUser,
  routeName,
  status,
  onNavigateHome,
  onNavigateProgress,
  onOpenAuth,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/8 bg-[rgba(243,234,217,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          className="flex items-center gap-4 text-left"
          type="button"
          onClick={onNavigateHome}
        >
          <img
            alt="Logo Design Pattern Playground"
            className="w-70 rounded-[1.75rem] object-contain"
            src="/logo.png"
          />
        </button>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ring-1 ${status.tone}`}>
            {status.label}
          </div>

          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              routeName === 'progress'
                ? 'border-stone-950 bg-stone-950 text-white'
                : 'border-black/10 bg-white/84 text-stone-800 hover:border-black/20'
            }`}
            type="button"
            onClick={onNavigateProgress}
          >
            Ma progression
          </button>

          {currentUser ? (
            <>
              <div className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800">
                @{currentUser.username}
              </div>
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onLogout}
              >
                Deconnexion
              </button>
            </>
          ) : (
            <>
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={() => onOpenAuth('login')}
              >
                Connexion
              </button>
              <button
                className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                type="button"
                onClick={() => onOpenAuth('register')}
              >
                Inscription
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
