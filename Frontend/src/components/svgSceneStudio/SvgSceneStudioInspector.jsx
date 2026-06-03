import { clampNumber, normalizeArrowAnimation, normalizeElementAnimation, TONES } from './svgSceneStudioDocument'

export default function SvgSceneStudioInspector({
  onDeleteSelection,
  onMoveSelectedElementLayer,
  selectedArrow,
  selectedElement,
  updateSelectedArrow,
  updateSelectedElement,
}) {
  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Inspecteur</p>
        {selectedElement ? (
          <div className="mt-4 flex flex-col gap-4">
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
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 text-sm text-stone-700">
                <input checked={selectedElement.animation?.enabled !== false} type="checkbox" onChange={(event) => updateSelectedElement((element) => ({ ...element, animation: { ...normalizeElementAnimation(element.animation), enabled: event.target.checked } }))} />
                Animation d'apparition
              </label>
              <div />
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Étape d'apparition</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" min="0" value={selectedElement.animation?.stepIndex ?? 0} onChange={(event) => updateSelectedElement((element) => ({ ...element, animation: { ...normalizeElementAnimation(element.animation), stepIndex: Math.max(0, Number(event.target.value) || 0) } }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Fondu (s)</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" min="0.1" step="0.1" value={selectedElement.animation?.fadeInSeconds ?? 0.45} onChange={(event) => updateSelectedElement((element) => ({ ...element, animation: { ...normalizeElementAnimation(element.animation), fadeInSeconds: clampNumber(event.target.value, 0.45, 0.1) } }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Délai (s)</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" min="0" step="0.1" value={selectedElement.animation?.delaySeconds ?? 0} onChange={(event) => updateSelectedElement((element) => ({ ...element, animation: { ...normalizeElementAnimation(element.animation), delaySeconds: clampNumber(event.target.value, 0, 0) } }))} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => onMoveSelectedElementLayer('down')}>
                Descendre le calque
              </button>
              <button className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => onMoveSelectedElementLayer('up')}>
                Monter le calque
              </button>
            </div>
            {selectedElement.type === 'raw' ? (
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Markup SVG</span>
                <textarea className="min-h-40 rounded-2xl border border-black/10 bg-[#241f18] px-3 py-3 font-mono text-[11px] leading-5 text-[#fffaf2] outline-none" value={selectedElement.rawMarkup ?? ''} onChange={(event) => updateSelectedElement((element) => ({ ...element, rawMarkup: event.target.value }))} />
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
            <label className="flex items-center gap-3 text-sm text-stone-700">
              <input checked={selectedArrow.dashed} type="checkbox" onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, dashed: event.target.checked }))} />
              Trait pointillé
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Courbure</span>
              <input min="-300" max="300" step="10" type="range" value={selectedArrow.curvature ?? 0} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, curvature: Number(event.target.value) }))} />
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Ordre animation / étape</span>
              <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" min="0" value={selectedArrow.stepIndex ?? 0} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, stepIndex: Math.max(0, Number(event.target.value) || 0) }))} />
            </label>
            <label className="flex items-center gap-3 text-sm text-stone-700">
              <input checked={selectedArrow.animation?.enabled !== false} type="checkbox" onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...arrow.animation, enabled: event.target.checked } }))} />
              Animation active
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Durée (s)</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" min="0.2" step="0.1" value={selectedArrow.animation?.durationSeconds ?? 1.8} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...arrow.animation, durationSeconds: Number(event.target.value) || 1.8 } }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Couleur animation</span>
                <input className="h-12 rounded-2xl border border-black/10 bg-white px-2 py-2" type="color" value={selectedArrow.animation?.color ?? '#246b5e'} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...arrow.animation, color: event.target.value } }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Taille du point</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" min="1" step="1" value={selectedArrow.animation?.pointRadius ?? 5} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...normalizeArrowAnimation(arrow.animation), pointRadius: clampNumber(event.target.value, 5, 1) } }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Délai animation (s)</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" min="0" step="0.1" value={selectedArrow.animation?.delaySeconds ?? 0} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...normalizeArrowAnimation(arrow.animation), delaySeconds: clampNumber(event.target.value, 0, 0) } }))} />
              </label>
            </div>
            <button className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" type="button" onClick={onDeleteSelection}>Supprimer</button>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-black/12 bg-white/80 px-4 py-4 text-sm text-stone-600">
            Sélectionne un élément ou une flèche pour modifier ses propriétés.
          </p>
        )}
      </section>
    </aside>
  )
}
