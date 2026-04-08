import CollapsiblePanel from '../../components/CollapsiblePanel'
import PatternFormField from './PatternFormField'

function isComparisonField(patternCode, field) {
  if (!field) {
    return false
  }

  if (patternCode === 'flyweight' && field.name === 'useFlyweight' && field.type === 'BOOLEAN') {
    return true
  }

  return field.name === 'mode'
    && field.type === 'SELECT'
    && Array.isArray(field.allowedValues)
    && field.allowedValues.length === 2
}

function humanizeModeTarget(rawValue) {
  return `${rawValue ?? ''}`
    .split('_')
    .filter(Boolean)
    .map((part) => `${part.charAt(0)}${part.slice(1).toLowerCase()}`)
    .join(' ')
}

function formatComparisonOptionLabel(patternCode, field, value) {
  if (field.type === 'BOOLEAN') {
    return value ? 'Avec Flyweight' : 'Sans Flyweight'
  }

  const normalized = `${value ?? ''}`.trim().toUpperCase()

  if (normalized.startsWith('WITHOUT_')) {
    return `Sans ${humanizeModeTarget(normalized.slice('WITHOUT_'.length))}`
  }

  if (normalized.startsWith('WITH_')) {
    return `Avec ${humanizeModeTarget(normalized.slice('WITH_'.length))}`
  }

  return normalized
}

function getComparisonOptions(patternCode, field) {
  if (!field) {
    return []
  }

  if (field.type === 'BOOLEAN') {
    return [
      { value: true, label: formatComparisonOptionLabel(patternCode, field, true) },
      { value: false, label: formatComparisonOptionLabel(patternCode, field, false) },
    ]
  }

  return (field.allowedValues ?? []).map((value) => ({
    value,
    label: formatComparisonOptionLabel(patternCode, field, value),
  }))
}

export default function PatternConfigurationSection({
  selectedPattern,
  schema,
  formValues,
  isExecuting,
  executionError,
  onFieldValueChange,
  onSubmit,
}) {
  const comparisonField = (schema?.fields ?? []).find((field) => isComparisonField(selectedPattern.code, field)) ?? null
  const visibleFields = (schema?.fields ?? []).filter((field) => field.name !== comparisonField?.name)
  const comparisonOptions = comparisonField
    ? getComparisonOptions(selectedPattern.code, comparisonField)
    : []

  return (
    <CollapsiblePanel
      bodyClassName="grid gap-4"
      description="Le formulaire est genere a partir du schema expose par le backend. La page du pattern reste donc stable meme quand la demo evolue."
      eyebrow="Configuration"
      title="Parametrer la demo"
    >
      <form className="grid gap-4 xl:grid-cols-2" onSubmit={onSubmit}>
        {visibleFields.map((field) => (
          <PatternFormField
            key={field.name}
            field={field}
            formValues={formValues}
            patternCode={selectedPattern.code}
            onFieldValueChange={onFieldValueChange}
          />
        ))}

        <div className="xl:col-span-2">
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {comparisonField ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Comparaison
                </span>
                {comparisonOptions.map((option) => {
                  const isSelected = formValues[comparisonField.name] === option.value

                  return (
                    <button
                      key={`${comparisonField.name}-${option.label}`}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-black/10 bg-white text-stone-700 hover:border-black/20'
                      }`}
                      type="button"
                      onClick={() => onFieldValueChange(comparisonField, option.value)}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            ) : null}

            <button
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isExecuting}
              type="submit"
            >
              {isExecuting ? 'Execution en cours...' : 'Lancer la demo'}
            </button>
          </div>

          {executionError ? (
            <div className="mt-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {executionError}
            </div>
          ) : null}
        </div>
      </form>
    </CollapsiblePanel>
  )
}
