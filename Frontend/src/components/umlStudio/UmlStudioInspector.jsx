import { CLASS_SECTION_MIN_HEIGHT, getDiagramNodes, SIDE_OPTIONS } from './umlStudioDocument'

function TextAreaField({ label, onChange, placeholder, value }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-stone-700">
      <span className="font-semibold text-stone-900">{label}</span>
      <textarea
        className="min-h-24 rounded-2xl border border-black/10 bg-white px-3 py-3 font-mono text-xs text-stone-800 outline-none"
        placeholder={placeholder}
        value={value.join('\n')}
        onChange={(event) => onChange(event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))}
      />
    </label>
  )
}

export default function UmlStudioInspector({
  isPlacingRelationAngle,
  onBeginRelationPointPlacement,
  onDeleteSelectedItem,
  draft,
  selectedClass,
  selectedRelation,
  selectedText,
  updateSelectedClass,
  updateSelectedRelation,
  updateSelectedText,
}) {
  const isActivityDiagram = draft.diagramType === 'activity'
  const diagramNodes = getDiagramNodes(draft)

  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-[30px] border border-black/10 bg-white/88 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Inspecteur</p>

        {selectedClass ? (
          // Class editing exposes geometry and section sizes separately because the canvas
          // keeps header, attributes and methods as distinct layout regions.
          <div className="mt-4 flex flex-col gap-4">
            {isActivityDiagram ? (
              <>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Type d etape</span>
                  <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedClass.kind} onChange={(event) => updateSelectedClass((box) => ({ ...box, kind: event.target.value }))}>
                    <option value="start">Depart</option>
                    <option value="end">Arrivee</option>
                    <option value="action">Action utilisateur</option>
                    <option value="decision">Condition / boucle</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Libelle</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedClass.label} onChange={(event) => updateSelectedClass((box) => ({ ...box, label: event.target.value }))} />
                </label>
              </>
            ) : (
              <>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Titre</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedClass.title} onChange={(event) => updateSelectedClass((box) => ({ ...box, title: event.target.value }))} />
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Stereotype</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedClass.stereotype} onChange={(event) => updateSelectedClass((box) => ({ ...box, stereotype: event.target.value }))} />
                </label>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              {['x', 'y', 'width', 'height'].map((field) => (
                <label key={field} className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold capitalize text-stone-900">{field}</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={selectedClass[field]} onChange={(event) => updateSelectedClass((box) => ({ ...box, [field]: Number(event.target.value) }))} />
                </label>
              ))}
            </div>
            {!isActivityDiagram ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Hauteur attributs</span>
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                    type="number"
                    min={CLASS_SECTION_MIN_HEIGHT}
                    value={selectedClass.attributesHeight}
                    onChange={(event) => updateSelectedClass((box) => ({ ...box, attributesHeight: Number(event.target.value) }))}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Hauteur methodes</span>
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                    type="number"
                    min={CLASS_SECTION_MIN_HEIGHT}
                    value={selectedClass.methodsHeight}
                    onChange={(event) => updateSelectedClass((box) => ({ ...box, methodsHeight: Number(event.target.value) }))}
                  />
                </label>
              </div>
            ) : null}
            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Bordure</span>
                <input className="h-11 w-full rounded-2xl border border-black/10 bg-white p-1" type="color" value={selectedClass.borderColor} onChange={(event) => updateSelectedClass((box) => ({ ...box, borderColor: event.target.value }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Fond</span>
                <input className="h-11 w-full rounded-2xl border border-black/10 bg-white p-1" type="color" value={selectedClass.fillColor} onChange={(event) => updateSelectedClass((box) => ({ ...box, fillColor: event.target.value }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Police</span>
                <input className="h-11 w-full rounded-2xl border border-black/10 bg-white p-1" type="color" value={selectedClass.textColor} onChange={(event) => updateSelectedClass((box) => ({ ...box, textColor: event.target.value }))} />
              </label>
            </div>
            {!isActivityDiagram ? (
              <>
                <TextAreaField label="Attributs" value={selectedClass.fields} placeholder="+ field: Type" onChange={(fields) => updateSelectedClass((box) => ({ ...box, fields }))} />
                <TextAreaField label="Methodes" value={selectedClass.methods} placeholder="+ operation(): void" onChange={(methods) => updateSelectedClass((box) => ({ ...box, methods }))} />
              </>
            ) : null}
            <button className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" type="button" onClick={onDeleteSelectedItem}>
              Supprimer
            </button>
          </div>
        ) : null}

        {selectedRelation ? (
          // Relations can be edited both structurally (from/to/sides) and visually
          // (marker, stroke style, curvature) without reopening the creation flow.
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Etiquette</span>
              <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedRelation.label} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, label: event.target.value }))} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">De</span>
                <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedRelation.from} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, from: event.target.value }))}>
                  {diagramNodes.map((box) => <option key={box.id} value={box.id}>{box.title ?? box.label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Vers</span>
                <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedRelation.to} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, to: event.target.value }))}>
                  {diagramNodes.map((box) => <option key={box.id} value={box.id}>{box.title ?? box.label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Sortie</span>
                <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedRelation.fromSide} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, fromSide: event.target.value }))}>
                  {SIDE_OPTIONS.map((side) => <option key={side} value={side}>{side}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Entree</span>
                <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedRelation.toSide} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, toSide: event.target.value }))}>
                  {SIDE_OPTIONS.map((side) => <option key={side} value={side}>{side}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Marqueur</span>
                <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedRelation.marker} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, marker: event.target.value }))}>
                  <option value="arrow">Fleche</option>
                  <option value="triangle">Triangle</option>
                  <option value="diamond">Diamond</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Trace</span>
                <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedRelation.style} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, style: event.target.value }))}>
                  <option value="straight">Droite</option>
                  <option value="curved">Courbe</option>
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Courbure</span>
              <input type="range" min="-280" max="280" step="10" value={selectedRelation.curvature} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, curvature: Number(event.target.value) }))} />
            </label>
            <div className="flex flex-col gap-3 rounded-2xl border border-black/8 bg-[rgba(247,240,226,0.58)] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-stone-900">Points intermediaires</span>
                <button
                  className={`rounded-full border px-3 py-2 text-xs font-semibold ${isPlacingRelationAngle ? 'border-stone-950 bg-stone-950 text-white' : 'border-black/10 bg-white text-stone-800'}`}
                  type="button"
                  onClick={onBeginRelationPointPlacement}
                >
                  {isPlacingRelationAngle ? 'Clique sur la fleche...' : 'Ajouter un angle'}
                </button>
              </div>
              {(selectedRelation.points ?? []).length ? (
                <div className="flex flex-col gap-3">
                  {(selectedRelation.points ?? []).map((point, index) => (
                    <div key={`${selectedRelation.id}-point-${index}`} className="rounded-2xl border border-black/8 bg-white/70 p-3">
                      <div className="grid grid-cols-1 gap-2">
                        <label className="flex items-center gap-2 text-sm text-stone-700">
                          <span className="w-5 shrink-0 font-semibold text-stone-900">X</span>
                          <input className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={point.x} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, points: (relation.points ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, x: Number(event.target.value) } : item) }))} />
                        </label>
                        <label className="flex items-center gap-2 text-sm text-stone-700">
                          <span className="w-5 shrink-0 font-semibold text-stone-900">Y</span>
                          <input className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={point.y} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, points: (relation.points ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, y: Number(event.target.value) } : item) }))} />
                        </label>
                      </div>
                      <button className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700" type="button" onClick={() => updateSelectedRelation((relation) => ({ ...relation, points: (relation.points ?? []).filter((_, itemIndex) => itemIndex !== index) }))}>
                        Suppr.
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-600">Ajoute un ou plusieurs points pour plier la fleche et creer des angles.</p>
              )}
            </div>
            <label className="flex items-center gap-3 text-sm text-stone-700">
              <input checked={selectedRelation.dashed} type="checkbox" onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, dashed: event.target.checked }))} />
              Trait pointille
            </label>
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Couleur de la fleche</span>
              <input className="h-11 w-full rounded-2xl border border-black/10 bg-white p-1" type="color" value={selectedRelation.color} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, color: event.target.value }))} />
            </label>
            <button className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" type="button" onClick={onDeleteSelectedItem}>
              Supprimer
            </button>
          </div>
        ) : null}

        {selectedText ? (
          // Text blocks remain lightweight annotations, so the inspector focuses on content,
          // geometry and color rather than introducing a full rich-text model.
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Texte</span>
              <textarea className="min-h-28 rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedText.text} onChange={(event) => updateSelectedText((text) => ({ ...text, text: event.target.value }))} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['x', 'y', 'width', 'height', 'fontSize'].map((field) => (
                <label key={field} className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold capitalize text-stone-900">{field}</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={selectedText[field]} onChange={(event) => updateSelectedText((text) => ({ ...text, [field]: Number(event.target.value) }))} />
                </label>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Bordure</span>
                <input className="h-11 w-full rounded-2xl border border-black/10 bg-white p-1" type="color" value={selectedText.borderColor} onChange={(event) => updateSelectedText((text) => ({ ...text, borderColor: event.target.value }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Fond</span>
                <input className="h-11 w-full rounded-2xl border border-black/10 bg-white p-1" type="color" value={selectedText.fillColor} onChange={(event) => updateSelectedText((text) => ({ ...text, fillColor: event.target.value }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Police</span>
                <input className="h-11 w-full rounded-2xl border border-black/10 bg-white p-1" type="color" value={selectedText.textColor} onChange={(event) => updateSelectedText((text) => ({ ...text, textColor: event.target.value }))} />
              </label>
            </div>
            <button className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" type="button" onClick={onDeleteSelectedItem}>
              Supprimer
            </button>
          </div>
        ) : null}

        {!selectedClass && !selectedRelation && !selectedText ? (
          <p className="mt-4 text-sm leading-7 text-stone-700">
            Selectionne une boite, une fleche ou une zone de texte pour afficher ses proprietes.
          </p>
        ) : null}
      </section>
    </aside>
  )
}
