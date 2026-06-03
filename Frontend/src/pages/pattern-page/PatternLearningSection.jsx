import CollapsiblePanel from '../../components/CollapsiblePanel'

export default function PatternLearningSection({
  selectedPattern,
  learningContent,
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <CollapsiblePanel eyebrow="Pédagogie" title="Comment lire cette page">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Guide de lecture</p>
            <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.readingGuide}</p>
          </article>

          <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Angle étudiant</p>
            <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.studentAngle}</p>
          </article>

          <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Angle développeur</p>
            <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.developerAngle}</p>
          </article>

          <article className="rounded-[24px] border border-black/10 bg-[var(--accent-soft)]/58 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Exploration Ludique</p>
            <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.playfulPrompt}</p>
          </article>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel eyebrow="Pas à pas" title="Séquence de compréhension">
        <ol className="grid gap-3">
          {learningContent.steps.map((step, index) => (
            <li key={`${selectedPattern.code}-step-${index}`} className="flex gap-4 rounded-[24px] border border-black/10 bg-[var(--panel)] px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <p className="pt-1 text-sm leading-7 text-stone-700">{step}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Mini Lexique</p>
          <div className="mt-4 grid gap-3">
            {learningContent.glossary.map((item) => (
              <article key={`${selectedPattern.code}-${item.term}`} className="rounded-[24px] border border-black/10 bg-white px-5 py-4">
                <p className="text-sm font-semibold text-stone-900">{item.term}</p>
                <p className="mt-2 text-sm leading-7 text-stone-700">{item.definition}</p>
              </article>
            ))}
          </div>
        </div>
      </CollapsiblePanel>
    </section>
  )
}
