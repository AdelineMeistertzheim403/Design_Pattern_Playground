import CollapsiblePanel from '../../components/CollapsiblePanel'
import { formatOutputValue } from '../../app/playgroundUtils'

function ExecutionResultContent({
  execution,
  executionSource,
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Summary</p>
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
            {executionSource === 'api' ? 'Source: API' : 'Source: inconnue'}
          </span>
        </div>
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

export default function PatternExecutionResultSection({
  execution,
  executionSource,
  hasDraftChanges,
}) {
  return (
    <CollapsiblePanel
      description="Tu retrouves ici le resume, l output et les logs pedagogiques renvoyes par la demo executee."
      eyebrow="Resultat"
      title="Retour d execution"
    >
      <ExecutionResultContent
        execution={execution}
        executionSource={executionSource}
        hasDraftChanges={hasDraftChanges}
      />
    </CollapsiblePanel>
  )
}
