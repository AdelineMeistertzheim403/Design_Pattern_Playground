import {
  getBooleanStateLabel,
  getNumericFieldUi,
} from '../../app/playgroundUtils'

function normalizeListFieldValue(value) {
  return (Array.isArray(value) ? value : `${value ?? ''}`.replace(/\r/g, '').split(/\n|,/))
    .map((item) => `${item}`.trim())
    .filter(Boolean)
}

function isInterpreterScriptField(patternCode, field) {
  return patternCode === 'interpreter' && field.type === 'LIST' && field.name === 'scriptLines'
}

function getListFieldOrderLabel(patternCode, field) {
  if (patternCode === 'command' && field.name === 'actions') {
    return 'Ordre de la sequence'
  }

  return 'Ordre d empilement'
}

function getListFieldEmptyMessage(patternCode, field) {
  if (patternCode === 'command' && field.name === 'actions') {
    return "Aucune action selectionnee. La demo ne pourra pas illustrer la pile de commandes."
  }

  return 'Aucun element selectionne pour cette liste.'
}

function getListFieldHint(patternCode, field) {
  if (patternCode === 'command' && field.name === 'actions') {
    return "Clique pour ajouter une action a la sequence. Tu peux repeter plusieurs fois la meme action, puis retirer chaque etape individuellement."
  }

  return "Clique pour ajouter ou retirer des elements. L ordre affiche correspond a l ordre courant de la liste."
}

function moveListValue(values, fromIndex, toIndex) {
  if (!Array.isArray(values) || fromIndex < 0 || toIndex < 0 || fromIndex >= values.length || toIndex >= values.length) {
    return values
  }

  const nextValues = [...values]
  const [item] = nextValues.splice(fromIndex, 1)
  nextValues.splice(toIndex, 0, item)
  return nextValues
}

export default function PatternFormField({
  field,
  formValues,
  patternCode,
  onFieldValueChange,
}) {
  const numericUi = getNumericFieldUi(patternCode, field.name)
  const selectedListValues = normalizeListFieldValue(formValues[field.name])

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-stone-800">
        {field.label}
        {field.required ? ' *' : ''}
      </span>

      {field.type === 'SELECT' ? (
        <select
          className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
          value={formValues[field.name] ?? ''}
          onChange={(event) => onFieldValueChange(field, event.target.value)}
        >
          {(field.allowedValues ?? []).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      ) : field.type === 'BOOLEAN' ? (
        <button
          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
            formValues[field.name]
              ? 'border-stone-950 bg-stone-950 text-white'
              : 'border-black/10 bg-white text-stone-700'
          }`}
          type="button"
          onClick={() => onFieldValueChange(field, !formValues[field.name])}
        >
          <span>{getBooleanStateLabel(patternCode, field.name, Boolean(formValues[field.name]))}</span>
          <span>{field.name}</span>
        </button>
      ) : field.type === 'NUMBER' && numericUi ? (
        <div className="grid gap-3 rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
              {Number(formValues[field.name] ?? numericUi.min).toLocaleString('fr-FR')} {numericUi.unitLabel}
            </span>
            <input
              className="w-28 rounded-2xl border border-black/10 bg-white px-3 py-2 text-right text-sm text-stone-900 outline-none focus:border-black/20"
              max={numericUi.max}
              min={numericUi.min}
              step={numericUi.step}
              type="number"
              value={formValues[field.name] ?? ''}
              onChange={(event) => onFieldValueChange(field, event.target.value)}
            />
          </div>
          <input
            className="flyweight-range"
            max={numericUi.max}
            min={numericUi.min}
            step={numericUi.step}
            type="range"
            value={Number(formValues[field.name] ?? numericUi.min)}
            onChange={(event) => onFieldValueChange(field, event.target.value)}
          />
          <p className="text-sm leading-7 text-stone-600">{numericUi.hint}</p>
        </div>
      ) : field.type === 'LIST' && patternCode === 'command' && field.name === 'actions' && (field.allowedValues?.length ?? 0) > 0 ? (
        <div className="grid gap-3 rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
          <div className="flex flex-wrap gap-2">
            {(field.allowedValues ?? []).map((value) => (
              <button
                key={value}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:-translate-y-0.5 hover:border-black/20"
                type="button"
                onClick={() => onFieldValueChange(field, [...selectedListValues, value])}
              >
                + {value}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-black/8 bg-white/72 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{getListFieldOrderLabel(patternCode, field)}</p>
              {selectedListValues.length > 0 ? (
                <button
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600 transition hover:border-black/20"
                  type="button"
                  onClick={() => onFieldValueChange(field, [])}
                >
                  Vider
                </button>
              ) : null}
            </div>

            {selectedListValues.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {selectedListValues.map((value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-black/8 bg-stone-950 px-3 py-2 text-white"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-white/14 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-white/86">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold">{value}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-full border border-white/18 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/84 transition hover:bg-white/10 disabled:opacity-35"
                        disabled={index === 0}
                        type="button"
                        onClick={() => onFieldValueChange(field, moveListValue(selectedListValues, index, index - 1))}
                      >
                        ↑
                      </button>
                      <button
                        className="rounded-full border border-white/18 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/84 transition hover:bg-white/10 disabled:opacity-35"
                        disabled={index === selectedListValues.length - 1}
                        type="button"
                        onClick={() => onFieldValueChange(field, moveListValue(selectedListValues, index, index + 1))}
                      >
                        ↓
                      </button>
                      <button
                        className="rounded-full border border-white/18 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/84 transition hover:bg-white/10"
                        type="button"
                        onClick={() => onFieldValueChange(field, selectedListValues.filter((_, itemIndex) => itemIndex !== index))}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-stone-600">
                {getListFieldEmptyMessage(patternCode, field)}
              </p>
            )}
          </div>

          <p className="text-sm leading-7 text-stone-600">
            {getListFieldHint(patternCode, field)}
          </p>
        </div>
      ) : field.type === 'LIST' && (field.allowedValues?.length ?? 0) > 0 ? (
        <div className="grid gap-3 rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
          <div className="flex flex-wrap gap-2">
            {(field.allowedValues ?? []).map((value) => {
              const isSelected = selectedListValues.includes(value)

              return (
                <button
                  key={value}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isSelected
                      ? 'border-stone-950 bg-stone-950 text-white'
                      : 'border-black/10 bg-white text-stone-700'
                  }`}
                  type="button"
                  onClick={() => {
                    const nextValues = isSelected
                      ? selectedListValues.filter((item) => item !== value)
                      : [...selectedListValues, value]

                    onFieldValueChange(field, nextValues)
                  }}
                >
                  {value}
                </button>
              )
            })}
          </div>

          <div className="rounded-2xl border border-black/8 bg-white/72 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{getListFieldOrderLabel(patternCode, field)}</p>
            {selectedListValues.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedListValues.map((value, index) => (
                  <span
                    key={`${value}-${index}`}
                    className="rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-white"
                  >
                    {index + 1}. {value}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-stone-600">
                {getListFieldEmptyMessage(patternCode, field)}
              </p>
            )}
          </div>

          <p className="text-sm leading-7 text-stone-600">
            {getListFieldHint(patternCode, field)}
          </p>
        </div>
      ) : isInterpreterScriptField(patternCode, field) ? (
        <div className="grid gap-3 rounded-[24px] border border-black/10 bg-[var(--panel)] p-4">
          <textarea
            className="min-h-52 rounded-2xl border border-black/10 bg-white px-4 py-3 font-mono text-sm leading-7 text-stone-900 outline-none focus:border-black/20"
            spellCheck={false}
            value={Array.isArray(formValues[field.name]) ? formValues[field.name].join('\n') : formValues[field.name] ?? ''}
            onChange={(event) => onFieldValueChange(field, event.target.value)}
          />
          <p className="text-sm leading-7 text-stone-600">
            Ecris une instruction par ligne. Le mini langage accepte `MOVE n`, `TURN LEFT`, `TURN RIGHT`, `ATTACK`, `WAIT` et les blocs `REPEAT n {'{'} ... {'}'}`.
          </p>
        </div>
      ) : field.type === 'LIST' ? (
        <textarea
          className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
          value={Array.isArray(formValues[field.name]) ? formValues[field.name].join('\n') : formValues[field.name] ?? ''}
          onChange={(event) => onFieldValueChange(field, event.target.value)}
        />
      ) : (
        <input
          className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
          type={field.type === 'NUMBER' ? 'number' : 'text'}
          value={formValues[field.name] ?? ''}
          onChange={(event) => onFieldValueChange(field, event.target.value)}
        />
      )}
    </label>
  )
}
