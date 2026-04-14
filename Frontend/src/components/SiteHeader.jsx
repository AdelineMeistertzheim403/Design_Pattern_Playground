import { buildMissionPath, buildProgressPath } from '../app/playgroundUtils'
import SpaLink from './SpaLink'

export default function SiteHeader({
  currentUser,
  routeName,
  onNavigateHome,
  onNavigateProgress,
  onNavigateMissions,
  onOpenAuth,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/8 bg-[rgba(243,234,217,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <SpaLink
          className="flex items-center gap-4 text-left"
          href="/"
          onNavigate={onNavigateHome}
        >
          <img
            alt="Logo Design Pattern Playground"
            className="w-70 rounded-[1.75rem] object-contain"
            src="/logo.png"
          />
        </SpaLink>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <SpaLink
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              routeName === 'missions'
                ? 'border-stone-950 bg-stone-950 text-white'
                : 'border-black/10 bg-white/84 text-stone-800 hover:border-black/20'
            }`}
            href={buildMissionPath()}
            onNavigate={onNavigateMissions}
          >
            Mode mission
          </SpaLink>

          <SpaLink
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              routeName === 'progress' || routeName === 'badges' || routeName === 'activity'
                ? 'border-stone-950 bg-stone-950 text-white'
                : 'border-black/10 bg-white/84 text-stone-800 hover:border-black/20'
            }`}
            href={buildProgressPath()}
            onNavigate={onNavigateProgress}
          >
            Ma progression
          </SpaLink>

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
