const modeCopy = {
  login: {
    title: 'Connexion',
    subtitle: "Retrouve ton espace de demo et poursuis l exploration des patterns.",
    submitLabel: 'Se connecter',
    switchLabel: 'Pas encore de compte ?',
    switchAction: 'Creer un compte',
  },
  register: {
    title: 'Inscription',
    subtitle: "Cree un compte avec un pseudo et un mot de passe pour personnaliser la suite du playground.",
    submitLabel: 'Creer mon compte',
    switchLabel: 'Tu as deja un compte ?',
    switchAction: 'Se connecter',
  },
}

export default function AuthDialog({
  isOpen,
  mode,
  formValues,
  pending,
  error,
  currentUser,
  backendStatus,
  onClose,
  onModeChange,
  onFieldChange,
  onSubmit,
  onLogout,
}) {
  if (!isOpen) {
    return null
  }

  const copy = modeCopy[mode] ?? modeCopy.login
  const authUnavailable = backendStatus === 'fallback'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(22,18,12,0.58)] px-4 py-6 backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.96))] p-6 shadow-[0_28px_90px_rgba(24,20,14,0.24)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Compte</p>
            <h2 className="mt-3 text-3xl text-stone-950">{currentUser ? 'Session active' : copy.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-700">
              {currentUser
                ? "Tu es connecte. L authentification repose maintenant sur des cookies HttpOnly et une session rafraichie cote serveur."
                : copy.subtitle}
            </p>
          </div>

          <button
            className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20"
            type="button"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>

        {currentUser ? (
          <div className="mt-6 grid gap-4">
            <article className="rounded-[26px] border border-black/10 bg-white/88 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Profil</p>
              <p className="mt-4 text-2xl text-stone-950">{currentUser.username}</p>
              <p className="mt-2 text-sm text-stone-600">Compte cree le {new Date(currentUser.createdAt).toLocaleString('fr-FR')}</p>
            </article>

            <div className="rounded-[24px] border border-black/10 bg-[var(--teal-soft)]/75 px-5 py-4 text-sm leading-7 text-stone-700">
              Le compte servira ensuite a ajouter la sauvegarde de scenarios, l historique et les parcours de progression.
            </div>

            <button
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              type="button"
              onClick={onLogout}
            >
              Se deconnecter
            </button>
          </div>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <div className="inline-flex rounded-full border border-black/10 bg-white/78 p-1">
              {['login', 'register'].map((candidateMode) => (
                <button
                  key={candidateMode}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    mode === candidateMode
                      ? 'bg-stone-950 text-white'
                      : 'text-stone-700'
                  }`}
                  type="button"
                  onClick={() => onModeChange(candidateMode)}
                >
                  {candidateMode === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-800">Pseudo</span>
              <input
                autoComplete="username"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
                maxLength={20}
                placeholder="ex: design.student"
                type="text"
                value={formValues.username}
                onChange={(event) => onFieldChange('username', event.target.value)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-800">Mot de passe</span>
              <input
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
                placeholder="6 caracteres minimum"
                type="password"
                value={formValues.password}
                onChange={(event) => onFieldChange('password', event.target.value)}
              />
            </label>

            <div className="rounded-[24px] border border-black/10 bg-[var(--panel)] px-5 py-4 text-sm leading-7 text-stone-700">
              Cette version d apprentissage stocke les comptes et les refresh tokens dans PostgreSQL. Les cookies HttpOnly evitent aussi d exposer les jetons au JavaScript du navigateur.
            </div>

            {authUnavailable ? (
              <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                L authentification necessite un backend actif. Le frontend est actuellement en mode local.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending || authUnavailable}
              type="submit"
            >
              {pending ? 'Traitement...' : copy.submitLabel}
            </button>

            <p className="text-center text-sm text-stone-600">
              {copy.switchLabel}{' '}
              <button
                className="font-semibold text-stone-950 underline-offset-4 hover:underline"
                type="button"
                onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
              >
                {copy.switchAction}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
