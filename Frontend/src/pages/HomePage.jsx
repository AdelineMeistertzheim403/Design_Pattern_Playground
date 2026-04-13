import { complexityLabels, typeLabels, useCaseCategoryLabels } from '../app/playgroundConstants'
import SpaLink from '../components/SpaLink'
import { buildPatternPath } from '../app/playgroundUtils'
import { getPatternPreviewTagline } from '../patterns/catalog'

export default function HomePage({
  patterns,
  visiblePatterns,
  filteredPatternsCount,
  catalogFilters,
  catalogFilterOptions,
  catalogPage,
  totalPatternPages,
  status,
  currentUser,
  onCatalogFilterChange,
  onCatalogPageChange,
  onOpenAuth,
  onOpenPattern,
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal relative overflow-hidden rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_30px_80px_rgba(47,37,22,0.14)] sm:px-10 sm:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(36,107,94,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(194,87,55,0.2),transparent_35%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="max-w-xl text-sm uppercase tracking-[0.22em] text-stone-600">
                Comprendre les design patterns en les voyant fonctionner
              </p>
              <h1 className="max-w-4xl text-4xl text-stone-950 sm:text-5xl">
                Apprendre les design patterns avec des demos interactives
              </h1>
              <p className="max-w-3xl text-base leading-7 text-stone-700 sm:text-lg">
                Le but du site est simple : aider les etudiants, les developpeurs et les formateurs a relier
                la theorie, le diagramme UML et le comportement runtime. Choisis un pattern, ouvre sa page et
                manipule la demo.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!currentUser ? (
                <button
                  className="rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                  type="button"
                  onClick={() => onOpenAuth('register')}
                >
                  Creer un compte
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="reveal rounded-[34px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Catalogue</p>
            <h2 className="mt-3 text-3xl text-stone-950">Choisir un design pattern</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
              Depuis cette page, choisis un pattern et ouvre sa page detaillee pour acceder a sa configuration,
              sa demo visuelle, ses logs, son UML et son contenu pedagogique.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Type</span>
            <select
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-black/20"
              value={catalogFilters.type}
              onChange={(event) => onCatalogFilterChange('type', event.target.value)}
            >
              {catalogFilterOptions.type.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value === 'ALL' ? option.label : (typeLabels[option.label] ?? option.label)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Niveau</span>
            <select
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-black/20"
              value={catalogFilters.level}
              onChange={(event) => onCatalogFilterChange('level', event.target.value)}
            >
              {catalogFilterOptions.level.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value === 'ALL' ? option.label : (complexityLabels[option.label] ?? option.label)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Cas d usage</span>
            <select
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-black/20"
              value={catalogFilters.useCase}
              onChange={(event) => onCatalogFilterChange('useCase', event.target.value)}
            >
              {catalogFilterOptions.useCase.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value === 'ALL' ? option.label : (useCaseCategoryLabels[option.label] ?? option.label)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {visiblePatterns.length > 0 ? (
            visiblePatterns.map((pattern) => {
              const previewTagline = getPatternPreviewTagline(pattern.code) ?? pattern.useCase

              return (
                <article
                  key={pattern.code}
                  className="rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,240,226,0.92))] p-5 shadow-[0_14px_34px_rgba(47,37,22,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                        {typeLabels[pattern.type] ?? pattern.type}
                      </p>
                      <h3 className="mt-3 text-2xl text-stone-950">
                        <SpaLink
                          className="transition hover:text-[var(--accent)]"
                          href={buildPatternPath(pattern.code)}
                          onNavigate={() => onOpenPattern(pattern.code)}
                        >
                          {pattern.name}
                        </SpaLink>
                      </h3>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-900">
                      {complexityLabels[pattern.complexityLevel] ?? pattern.complexityLevel}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-stone-700">{pattern.description}</p>
                  <p className="mt-4 rounded-[22px] bg-[var(--teal-soft)]/72 px-4 py-4 text-sm leading-7 text-stone-700">
                    {previewTagline}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-stone-700">
                    Cas d usage : {pattern.useCase}
                  </p>

                  <SpaLink
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    href={buildPatternPath(pattern.code)}
                    onNavigate={() => onOpenPattern(pattern.code)}
                  >
                    Ouvrir la page du pattern
                  </SpaLink>
                </article>
              )
            })
          ) : (
            <div className="rounded-[26px] border border-dashed border-black/15 bg-[var(--panel)] px-5 py-10 text-sm leading-7 text-stone-600 lg:col-span-3">
              Aucun pattern ne correspond au filtre courant.
            </div>
          )}
        </div>

        {filteredPatternsCount > 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-45"
              type="button"
              disabled={catalogPage === 1}
              onClick={() => onCatalogPageChange(catalogPage - 1)}
            >
              Page precedente
            </button>

            {Array.from({ length: totalPatternPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  pageNumber === catalogPage
                    ? 'bg-stone-950 text-white'
                    : 'border border-black/10 bg-white text-stone-700'
                }`}
                type="button"
                onClick={() => onCatalogPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-45"
              type="button"
              disabled={catalogPage === totalPatternPages}
              onClick={() => onCatalogPageChange(catalogPage + 1)}
            >
              Page suivante
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
