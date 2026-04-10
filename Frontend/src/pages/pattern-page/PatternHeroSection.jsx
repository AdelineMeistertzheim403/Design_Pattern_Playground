import { typeLabels } from '../../app/playgroundConstants'
import { buildPatternPath } from '../../app/playgroundUtils'
import SpaLink from '../../components/SpaLink'

export default function PatternHeroSection({
  selectedPattern,
  patterns,
  learningContent,
  currentUser,
  status,
  onNavigateHome,
  onNavigatePattern,
  onNavigateQuiz,
  onOpenAuth,
}) {
  return (
    <section className="reveal rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <SpaLink
              className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
              href="/"
              onNavigate={onNavigateHome}
            >
              Retour a l accueil
            </SpaLink>
            <div className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ring-1 ${status.tone}`}>
              {status.label}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              type="button"
              onClick={onNavigateQuiz}
            >
              {currentUser ? 'Ouvrir le quiz' : 'Connecte-toi pour debloquer le quiz'}
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              {typeLabels[selectedPattern.type] ?? selectedPattern.type} · {selectedPattern.complexityLevel}
            </p>
            <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">{selectedPattern.name}</h1>
          </div>

          <p className="max-w-3xl text-base leading-7 text-stone-700">{selectedPattern.description}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">But du pattern</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.intuition}</p>
            </article>

            <article className="rounded-[24px] border border-black/10 bg-[var(--teal-soft)]/82 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Lecture rapide</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.strapline}</p>
            </article>
          </div>

          <p className="rounded-[24px] bg-[var(--accent-soft)]/62 px-5 py-4 text-sm leading-7 text-stone-700">
            Cas d usage : {selectedPattern.useCase}
          </p>
        </div>

        <div className="grid gap-4 self-end">
          <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Compte</p>
            {currentUser ? (
              <p className="mt-3 text-sm leading-7 text-stone-700">
                Connecte en tant que <span className="font-semibold text-stone-950">@{currentUser.username}</span>.
                Tu pourras plus tard sauvegarder tes scenarios et ton historique.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm leading-7 text-stone-700">
                  Un compte n est pas obligatoire pour tester un pattern, mais il permettra ensuite de suivre la progression.
                </p>
                <button
                  className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  type="button"
                  onClick={() => onOpenAuth('register')}
                >
                  Creer un compte
                </button>
              </div>
            )}
          </article>

          <article className="rounded-[24px] border border-black/10 bg-white/84 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Autres patterns</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {patterns
                .filter((pattern) => pattern.code !== selectedPattern.code)
                .map((pattern) => (
                  <SpaLink
                    key={pattern.code}
                    className="rounded-full border border-black/10 bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                    href={buildPatternPath(pattern.code)}
                    onNavigate={() => onNavigatePattern(pattern.code)}
                  >
                    {pattern.name}
                  </SpaLink>
                ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
