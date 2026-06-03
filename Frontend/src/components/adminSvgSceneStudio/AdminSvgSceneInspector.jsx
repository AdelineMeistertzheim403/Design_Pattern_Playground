import { getElementAnchor, TONES } from './adminSvgSceneDocument'

export default function AdminSvgSceneInspector({
  draft,
  onDeleteSelection,
  selectedArrow,
  selectedElement,
  selectedElementIds,
  svgMarkup,
  updateSelectedArrow,
  updateSelectedElement,
}) {
  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Inspecteur</p>
        {selectedElement ? (
          <div className="mt-4 flex flex-col gap-4">
            {selectedElementIds.length > 1 ? (
              <p className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
                {selectedElementIds.length} éléments sélectionnés
              </p>
            ) : null}
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Libellé</span>
              <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedElement.label} onChange={(event) => updateSelectedElement((element) => ({ ...element, label: event.target.value }))} />
            </label>
            {selectedElement.type !== 'text' ? (
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Sous-titre</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedElement.subtitle ?? ''} onChange={(event) => updateSelectedElement((element) => ({ ...element, subtitle: event.target.value }))} />
              </label>
            ) : null}
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Couleur</span>
              <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedElement.tone} onChange={(event) => updateSelectedElement((element) => ({ ...element, tone: event.target.value }))}>
                {Object.keys(TONES).map((tone) => <option key={tone} value={tone}>{tone}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['x', 'y', 'width', 'height', 'fontSize'].map((field) => (
                <label key={field} className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">{field}</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={selectedElement[field] ?? ''} onChange={(event) => updateSelectedElement((element) => ({ ...element, [field]: Number(event.target.value) }))} />
                </label>
              ))}
            </div>
            {selectedElement.type === 'raw' ? (
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Markup SVG de l'élément</span>
                <textarea
                  className="min-h-40 rounded-2xl border border-black/10 bg-[#241f18] px-3 py-3 font-mono text-[11px] leading-5 text-[#fffaf2] outline-none"
                  value={selectedElement.rawMarkup ?? ''}
                  onChange={(event) => updateSelectedElement((element) => ({ ...element, rawMarkup: event.target.value }))}
                />
              </label>
            ) : null}
            <button className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" type="button" onClick={onDeleteSelection}>Supprimer</button>
          </div>
        ) : selectedArrow ? (
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Étiquette</span>
              <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedArrow.label} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, label: event.target.value }))} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['x1', 'y1', 'x2', 'y2'].map((field) => (
                <label key={field} className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">{field}</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={selectedArrow[field]} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, [field]: Number(event.target.value) }))} />
                </label>
              ))}
            </div>
            <label className="flex items-center gap-3 text-sm text-stone-700">
              <input checked={selectedArrow.dashed} type="checkbox" onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, dashed: event.target.checked }))} />
              Trait pointillé
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Courbure</span>
              <input min="-300" max="300" step="10" type="range" value={selectedArrow.curvature ?? 0} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, curvature: Number(event.target.value) }))} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Depart accroche</span>
                <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedArrow.fromElementId ?? ''} onChange={(event) => {
                  const element = draft.elements.find((item) => item.id === event.target.value)
                  const side = selectedArrow.fromSide ?? 'right'
                  const anchor = element ? getElementAnchor(element, side) : null
                  updateSelectedArrow((arrow) => ({ ...arrow, fromElementId: event.target.value || undefined, ...(anchor ? { x1: anchor.x, y1: anchor.y } : {}) }))
                }}>
                  <option value="">Libre</option>
                  {draft.elements.map((element) => <option key={element.id} value={element.id}>{element.label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Cote depart</span>
                <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedArrow.fromSide ?? 'right'} onChange={(event) => {
                  const element = draft.elements.find((item) => item.id === selectedArrow.fromElementId)
                  const anchor = element ? getElementAnchor(element, event.target.value) : null
                  updateSelectedArrow((arrow) => ({ ...arrow, fromSide: event.target.value, ...(anchor ? { x1: anchor.x, y1: anchor.y } : {}) }))
                }}>
                  {['top', 'right', 'bottom', 'left'].map((side) => <option key={side} value={side}>{side}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Arrivee accroche</span>
                <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedArrow.toElementId ?? ''} onChange={(event) => {
                  const element = draft.elements.find((item) => item.id === event.target.value)
                  const side = selectedArrow.toSide ?? 'left'
                  const anchor = element ? getElementAnchor(element, side) : null
                  updateSelectedArrow((arrow) => ({ ...arrow, toElementId: event.target.value || undefined, ...(anchor ? { x2: anchor.x, y2: anchor.y } : {}) }))
                }}>
                  <option value="">Libre</option>
                  {draft.elements.map((element) => <option key={element.id} value={element.id}>{element.label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Cote arrivee</span>
                <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedArrow.toSide ?? 'left'} onChange={(event) => {
                  const element = draft.elements.find((item) => item.id === selectedArrow.toElementId)
                  const anchor = element ? getElementAnchor(element, event.target.value) : null
                  updateSelectedArrow((arrow) => ({ ...arrow, toSide: event.target.value, ...(anchor ? { x2: anchor.x, y2: anchor.y } : {}) }))
                }}>
                  {['top', 'right', 'bottom', 'left'].map((side) => <option key={side} value={side}>{side}</option>)}
                </select>
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm text-stone-700">
              <input checked={selectedArrow.animation?.enabled !== false} type="checkbox" onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...(arrow.animation ?? {}), enabled: event.target.checked } }))} />
              Animation active
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Durée</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" min="0.2" step="0.1" type="number" value={selectedArrow.animation?.durationSeconds ?? 1.8} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...(arrow.animation ?? {}), durationSeconds: Number(event.target.value) } }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Étape</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" min="0" type="number" value={selectedArrow.stepIndex ?? 0} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, stepIndex: Number(event.target.value) }))} />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Couleur animation</span>
              <input className="h-12 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-900 outline-none" type="color" value={selectedArrow.animation?.color ?? '#246b5e'} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...(arrow.animation ?? {}), color: event.target.value } }))} />
            </label>
            <button className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" type="button" onClick={onDeleteSelection}>Supprimer</button>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-stone-700">
            Sélectionne une forme, un texte ou une flèche pour modifier ses propriétés.
          </p>
        )}
      </section>

      <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">SVG genere</p>
        <textarea className="mt-4 h-56 w-full resize-y rounded-2xl border border-black/10 bg-[#241f18] px-3 py-3 font-mono text-[11px] leading-5 text-[#fffaf2] outline-none" readOnly value={svgMarkup} />
      </section>
    </aside>
  )
}
