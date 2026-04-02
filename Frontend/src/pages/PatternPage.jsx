import CollapsiblePanel from '../components/CollapsiblePanel'
import ExecutionScene from '../components/ExecutionScene'
import UmlDiagram from '../components/UmlDiagram'
import { typeLabels } from '../app/playgroundConstants'
import {
  formatOutputValue,
  getBooleanStateLabel,
  getNumericFieldUi,
} from '../app/playgroundUtils'

function normalizeListFieldValue(value) {
  return (Array.isArray(value) ? value : `${value ?? ''}`.split(','))
    .map((item) => `${item}`.trim())
    .filter(Boolean)
}

function PatternFormField({
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Ordre d empilement</p>
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
                Aucun decorator selectionne. La demo montrera alors uniquement le composant de base.
              </p>
            )}
          </div>

          <p className="text-sm leading-7 text-stone-600">
            Clique pour ajouter ou retirer une couche. L ordre affiche correspond a l ordre d empilement des wrappers.
          </p>
        </div>
      ) : field.type === 'LIST' ? (
        <textarea
          className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
          value={Array.isArray(formValues[field.name]) ? formValues[field.name].join(', ') : formValues[field.name] ?? ''}
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

function ExecutionResultSection({
  execution,
  hasDraftChanges,
}) {
  if (!execution) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-[var(--panel)] px-5 py-10 text-sm leading-7 text-stone-600">
        Aucun resultat pour le moment. Tu peux deja observer la scene SVG en apercu live, puis lancer la demonstration pour figer un resultat complet.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {hasDraftChanges ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
          Le formulaire a change depuis la derniere execution. La scene SVG affiche un apercu live, mais
          les logs et l output ci-dessous correspondent encore a la derniere execution.
        </div>
      ) : null}

      <article className="rounded-[26px] border border-black/10 bg-[var(--panel)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Summary</p>
        <p className="mt-4 text-sm leading-7 text-stone-700">{execution.summary}</p>
      </article>

      <article className="rounded-[26px] border border-black/10 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Output</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(execution.output ?? {}).map(([key, value]) => (
            <div key={key} className="rounded-2xl bg-stone-950 px-4 py-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">{key}</p>
              <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-white/85">
                {formatOutputValue(value)}
              </pre>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[26px] border border-black/10 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Logs</p>
        <ul className="mt-4 grid gap-3">
          {(execution.logs ?? []).map((line, index) => (
            <li key={`${line}-${index}`} className="rounded-2xl border border-black/10 bg-[var(--panel)] px-4 py-3 text-sm leading-7 text-stone-700">
              {line}
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
}

export default function PatternPage({
  selectedPattern,
  patterns,
  schema,
  formValues,
  execution,
  executionError,
  isExecuting,
  learningContent,
  umlDiagram,
  currentUser,
  status,
  onNavigateHome,
  onNavigatePattern,
  onNavigateQuiz,
  onOpenAuth,
  onFieldValueChange,
  onSubmit,
  visualExecution,
  visualSourceLabel,
  hasDraftChanges,
  onOpenSceneModal,
  onOpenUmlModal,
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onNavigateHome}
              >
                Retour a l accueil
              </button>
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
              <h2 className="mt-3 text-4xl text-stone-950 sm:text-5xl">{selectedPattern.name}</h2>
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
                    <button
                      key={pattern.code}
                      className="rounded-full border border-black/10 bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                      type="button"
                      onClick={() => onNavigatePattern(pattern.code)}
                    >
                      {pattern.name}
                    </button>
                  ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <CollapsiblePanel
        bodyClassName="grid gap-4"
        description="Le formulaire est genere a partir du schema expose par le backend. La page du pattern reste donc stable meme quand la demo evolue."
        eyebrow="Configuration"
        title="Parametrer la demo"
      >
        <form className="grid gap-4 xl:grid-cols-2" onSubmit={onSubmit}>
          {(schema?.fields ?? []).map((field) => (
            <PatternFormField
              key={field.name}
              field={field}
              formValues={formValues}
              patternCode={selectedPattern.code}
              onFieldValueChange={onFieldValueChange}
            />
          ))}

          <div className="xl:col-span-2">
            <button
              className="mt-2 inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isExecuting}
              type="submit"
            >
              {isExecuting ? 'Execution en cours...' : 'Lancer la demo'}
            </button>

            {executionError ? (
              <div className="mt-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {executionError}
              </div>
            ) : null}
          </div>
        </form>
      </CollapsiblePanel>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <CollapsiblePanel
          bodyClassName="p-0"
          description="La scene donne une lecture runtime du pattern. Tu peux l ouvrir en grand pour inspecter les objets, les relations et les etats."
          eyebrow="Scene SVG"
          title="Visualisation interactive"
        >
          <ExecutionScene
            execution={visualExecution}
            onOpenModal={onOpenSceneModal}
            patternCode={selectedPattern.code}
            sourceLabel={visualSourceLabel}
          />
        </CollapsiblePanel>

        <CollapsiblePanel
          bodyClassName="p-0"
          description="Le diagramme UML fige la structure du pattern. Il complete la scene runtime avec la vue conception."
          eyebrow="Diagramme UML"
          title="Structure du pattern"
        >
          <UmlDiagram
            diagram={umlDiagram}
            patternCode={selectedPattern.code}
            onOpenModal={onOpenUmlModal}
            patternName={selectedPattern.name}
          />
        </CollapsiblePanel>
      </section>

      <CollapsiblePanel
        description="Tu retrouves ici le resume, l output et les logs pedagogiques renvoyes par la demo executee."
        eyebrow="Resultat"
        title="Retour d execution"
      >
        <ExecutionResultSection
          execution={execution}
          hasDraftChanges={hasDraftChanges}
        />
      </CollapsiblePanel>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <CollapsiblePanel eyebrow="Pedagogie" title="Comment lire cette page">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Guide De Lecture</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.readingGuide}</p>
            </article>

            <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Angle Etudiant</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.studentAngle}</p>
            </article>

            <article className="rounded-[24px] border border-black/10 bg-[var(--panel)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Angle Developpeur</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.developerAngle}</p>
            </article>

            <article className="rounded-[24px] border border-black/10 bg-[var(--accent-soft)]/58 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Exploration Ludique</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{learningContent.playfulPrompt}</p>
            </article>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel eyebrow="Pas A Pas" title="Sequence de comprehension">
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
    </div>
  )
}
