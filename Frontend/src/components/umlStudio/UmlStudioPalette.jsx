export default function UmlStudioPalette({
  diagramType,
  onAddActivityNode,
  onAddClass,
  onAddRelation,
  onAddText,
  onGridToggle,
  onHeightChange,
  onZoomDecrease,
  onZoomIncrease,
  onZoomReset,
  onWidthChange,
  showGrid,
  viewBox,
  zoom,
}) {
  return (
    <aside className="rounded-[30px] border border-black/10 bg-white/88 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Palette</p>
      <div className="mt-4 flex flex-col gap-3">
        {/* Creation tools stay explicit instead of drag-from-palette to keep the editor usable on touchpads. */}
        {diagramType === 'activity' ? (
          <>
            <button className="rounded-2xl bg-stone-950 px-4 py-3 text-left text-sm font-semibold text-white" type="button" onClick={() => onAddActivityNode('start')}>
              Ajouter un point de depart
            </button>
            <button className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-stone-800" type="button" onClick={() => onAddActivityNode('end')}>
              Ajouter un point d arrivee
            </button>
            <button className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-stone-800" type="button" onClick={() => onAddActivityNode('action')}>
              Ajouter une action utilisateur
            </button>
            <button className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-stone-800" type="button" onClick={() => onAddActivityNode('decision')}>
              Ajouter une condition / boucle
            </button>
          </>
        ) : (
          <button className="rounded-2xl bg-stone-950 px-4 py-3 text-left text-sm font-semibold text-white" type="button" onClick={onAddClass}>
            Ajouter une boite UML
          </button>
        )}
        <button className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-stone-800" type="button" onClick={onAddRelation}>
          {diagramType === 'activity' ? 'Ajouter une fleche de flux' : 'Ajouter une fleche / relation'}
        </button>
        <button className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-stone-800" type="button" onClick={onAddText}>
          Ajouter une zone de texte
        </button>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-black/8 bg-white/70 px-4 py-3 text-sm text-stone-700">
          <div className="flex flex-wrap items-center gap-3">
            {/* The diagram surface can grow independently from the viewport, which is why the canvas itself scrolls. */}
            <span className="font-semibold text-stone-900">Zone du diagramme</span>
            <label className="flex items-center gap-2">
              <span>Largeur</span>
              <input
                className="w-24 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-900 outline-none"
                type="number"
                min="640"
                step="80"
                value={viewBox.width}
                onChange={(event) => onWidthChange(Number(event.target.value))}
              />
            </label>
            <label className="flex items-center gap-2">
              <span>Hauteur</span>
              <input
                className="w-24 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-900 outline-none"
                type="number"
                min="480"
                step="80"
                value={viewBox.height}
                onChange={(event) => onHeightChange(Number(event.target.value))}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Zoom changes the rendered size only; the underlying SVG viewBox remains the persisted source of truth. */}
              <button
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-stone-800"
                type="button"
                onClick={onZoomDecrease}
              >
                -
              </button>
              <span className="min-w-16 text-center font-semibold text-stone-900">{Math.round(zoom * 100)}%</span>
              <button
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-stone-800"
                type="button"
                onClick={onZoomIncrease}
              >
                +
              </button>
              <button
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-stone-800"
                type="button"
                onClick={onZoomReset}
              >
                100%
              </button>
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold text-stone-800">
              <input checked={showGrid} type="checkbox" onChange={(event) => onGridToggle(event.target.checked)} />
              Afficher le quadrillage
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-dashed border-black/12 bg-[rgba(247,240,226,0.62)] p-4 text-sm leading-7 text-stone-700">
        {diagramType === 'activity'
          ? 'Clique sur un element pour l editer. Les etapes et annotations se deplacent par glisser-deposer. Utilise l inspecteur d une fleche pour ajouter plusieurs points intermediaires et creer des angles.'
          : 'Clique sur un element pour l editer. Les boites et annotations se deplacent par glisser-deposer, et le carre en bas a droite sert au redimensionnement.'}
      </div>
    </aside>
  )
}
