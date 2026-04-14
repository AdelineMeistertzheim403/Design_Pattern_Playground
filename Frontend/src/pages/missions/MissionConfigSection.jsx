import PatternFormField from '../pattern-page/PatternFormField'

export default function MissionConfigSection({
  activeConfigPattern,
  activePatternConfig,
  activeSchema,
  mission,
  onFieldValueChange,
  onSelectPattern,
  patternsByCode,
  selectedPatterns,
}) {
  if (!selectedPatterns.length) {
    return null
  }

  return (
    <article className="rounded-[24px] border border-black/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Configuration dynamique</p>
          <p className="mt-1 text-sm leading-7 text-stone-600">
            Choisis une brique de la solution puis ajuste ses parametres avant la simulation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedPatterns.map((patternCode) => {
            const isActive = patternCode === activeConfigPattern
            const patternName = patternsByCode[patternCode]?.name ?? patternCode

            return (
              <button
                key={patternCode}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-stone-950 bg-stone-950 text-white'
                    : 'border-black/10 bg-[var(--panel)] text-stone-700'
                }`}
                type="button"
                onClick={() => onSelectPattern(patternCode)}
              >
                {patternName}
              </button>
            )
          })}
        </div>
      </div>

      {activeConfigPattern && activeSchema ? (
        <>
          {mission.configurationPrompts?.[activeConfigPattern]?.length ? (
            <div className="mt-4 rounded-[22px] border border-black/10 bg-[var(--panel)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Guide mission</p>
              <ul className="mt-2 grid gap-2 text-sm leading-7 text-stone-700">
                {mission.configurationPrompts[activeConfigPattern].map((hint) => (
                  <li key={hint} className="rounded-2xl border border-black/10 bg-white px-3 py-2">
                    {hint}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {(activeSchema.fields ?? []).map((field) => (
              <PatternFormField
                key={`${activeConfigPattern}-${field.name}`}
                field={field}
                formValues={activePatternConfig}
                patternCode={activeConfigPattern}
                onFieldValueChange={onFieldValueChange}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm leading-7 text-stone-600">
          Selectionne un pattern de la solution pour charger sa configuration.
        </p>
      )}
    </article>
  )
}
