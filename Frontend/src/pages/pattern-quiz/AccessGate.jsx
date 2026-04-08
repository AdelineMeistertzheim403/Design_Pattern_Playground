export default function AccessGate({
  selectedPattern,
  onNavigateHome,
  onNavigatePattern,
  onOpenAuth,
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Quiz protege</p>
        <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">{selectedPattern.name}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
          Les quiz sont reserves aux utilisateurs connectes pour pouvoir enregistrer le score, la progression et le badge de validation.
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
            onClick={onNavigatePattern}
          >
            Retour au playground
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
