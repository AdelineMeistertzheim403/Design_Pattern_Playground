import ImportedElementPreview from './ImportedElementPreview'

function buildSceneGridPattern() {
  return (
    <pattern id="svg-scene-studio-grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(122,90,63,0.12)" strokeWidth="1" />
    </pattern>
  )
}

export { buildSceneGridPattern }

export default function SvgSceneStudioPalette({
  importedPatternElements,
  importPatternCode,
  importPatternCodeValue,
  loadPending,
  onAddArrow,
  onAddElement,
  onHeightChange,
  onImportPatternCodeChange,
  onImportPatternElement,
  onImportPatternScene,
  onShowGridChange,
  onWidthChange,
  patterns,
  showGrid,
  viewBox,
}) {
  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Palette</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => onAddElement('rect')}>Boite</button>
          <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => onAddElement('ellipse')}>Noeud</button>
          <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => onAddElement('text')}>Texte</button>
          <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={onAddArrow}>Fleche</button>
        </div>

        <label className="mt-5 flex flex-col gap-2 text-sm text-stone-700">
          <span className="font-semibold text-stone-900">Importer des elements de scene</span>
          <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={importPatternCodeValue} onChange={(event) => onImportPatternCodeChange(event.target.value)}>
            {patterns.map((pattern) => (
              <option key={pattern.code} value={pattern.code}>{pattern.name}</option>
            ))}
          </select>
        </label>
        <button className="mt-3 w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800 disabled:opacity-60" type="button" disabled={loadPending} onClick={onImportPatternScene}>
          {loadPending ? 'Chargement...' : 'Charger les elements du pattern'}
        </button>

        {importedPatternElements.length ? (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Elements disponibles
            </p>
            <div className="max-h-72 overflow-y-auto rounded-2xl border border-black/10 bg-[#fffaf2] p-3">
              <div className="flex flex-col gap-3">
                {importedPatternElements.map((element) => (
                  <div key={`${importPatternCode}-${element.importIndex}`} className="rounded-2xl border border-black/10 bg-white/90 p-3">
                    <ImportedElementPreview element={element} label={element.displayLabel} />
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-stone-900">{element.displayLabel}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                          {element.type === 'raw' ? 'svg' : element.type}
                        </p>
                      </div>
                      <button
                        className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-stone-800"
                        type="button"
                        onClick={() => onImportPatternElement(element, element.importIndex)}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold text-stone-900">Largeur</span>
            <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={viewBox.width} onChange={(event) => onWidthChange(Number(event.target.value) || 1200)} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold text-stone-900">Hauteur</span>
            <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={viewBox.height} onChange={(event) => onHeightChange(Number(event.target.value) || 720)} />
          </label>
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm text-stone-700">
          <input checked={showGrid} type="checkbox" onChange={(event) => onShowGridChange(event.target.checked)} />
          Afficher le quadrillage
        </label>
      </section>
    </aside>
  )
}
