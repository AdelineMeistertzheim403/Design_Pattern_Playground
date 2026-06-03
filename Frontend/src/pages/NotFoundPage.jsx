import SpaLink from '../components/SpaLink'

export default function NotFoundPage({ onNavigateHome }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <section className="reveal rounded-[34px] border border-black/10 bg-white/80 p-8 text-center shadow-[0_24px_60px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Erreur de navigation</p>
        <h1 className="mt-4 text-4xl text-stone-950">Cette page n existe pas</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-700">
          Retourne à l'accueil pour choisir un design pattern disponible et ouvrir sa page de démonstration.
        </p>
        <SpaLink
          className="mt-6 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          href="/"
          onNavigate={onNavigateHome}
        >
          Retour à l'accueil
        </SpaLink>
      </section>
    </div>
  )
}
