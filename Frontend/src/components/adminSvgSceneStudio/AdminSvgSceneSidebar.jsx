export default function AdminSvgSceneSidebar({
  draft,
  loadPending,
  newSceneCode,
  newSceneName,
  onCreateScene,
  onDraftChange,
  onHeightChange,
  onNewSceneCodeChange,
  onNewSceneNameChange,
  onReimportPatternScene,
  onResetCanvas,
  onSelectCode,
  onSceneNameChange,
  sceneName,
  sceneOptions,
  selectedCode,
  viewBox,
  onWidthChange,
  onAddElement,
  onAddArrow,
}) {
  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Source</p>
        <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
          <span className="font-semibold text-stone-900">Scene a editer</span>
          <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedCode} onChange={(event) => onSelectCode(event.target.value)}>
            <option value="">Choisir une scene</option>
            {sceneOptions.map((item) => (
              <option key={item.code} value={item.code}>{item.name} ({item.code})</option>
            ))}
          </select>
        </label>
        <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
          <span className="font-semibold text-stone-900">Nom de la scene</span>
          <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={sceneName} onChange={(event) => onSceneNameChange(event.target.value)} />
        </label>
        <button
          className="mt-4 w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800 disabled:opacity-60"
          disabled={!selectedCode || loadPending}
          type="button"
          onClick={onReimportPatternScene}
        >
          Reimporter la scene du pattern
        </button>
        <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
          <span className="font-semibold text-stone-900">ViewBox</span>
          <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 font-mono text-sm text-stone-900 outline-none" value={draft.viewBox} onChange={(event) => onDraftChange((currentDraft) => ({ ...currentDraft, viewBox: event.target.value }))} />
        </label>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold text-stone-900">Largeur scene</span>
            <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={viewBox.width} onChange={(event) => onWidthChange(Number(event.target.value) || 1200)} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold text-stone-900">Hauteur scene</span>
            <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={viewBox.height} onChange={(event) => onHeightChange(Number(event.target.value) || 720)} />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
          <span className="font-semibold text-stone-900">Lecture</span>
          <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={draft.playbackMode ?? 'auto'} onChange={(event) => onDraftChange((currentDraft) => ({ ...currentDraft, playbackMode: event.target.value }))}>
            <option value="auto">Animation automatique</option>
            <option value="step">Pas a pas</option>
          </select>
        </label>
        <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
          <span className="font-semibold text-stone-900">Etapes</span>
          <textarea
            className="min-h-24 rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
            value={(draft.steps ?? []).map((step) => step.label).join('\n')}
            onChange={(event) => onDraftChange((currentDraft) => ({
              ...currentDraft,
              steps: event.target.value.split('\n').map((label) => ({ label: label.trim() })).filter((step) => step.label),
            }))}
          />
        </label>
        {loadPending ? <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">Chargement...</p> : null}
      </section>

      <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Ajouter</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => onAddElement('rect')}>Boite</button>
          <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => onAddElement('ellipse')}>Cercle</button>
          <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => onAddElement('text')}>Texte</button>
          <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={onAddArrow}>Fleche</button>
        </div>
        <button className="mt-4 w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800" type="button" onClick={onResetCanvas}>
          Reinitialiser le canvas
        </button>
      </section>

      <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Nouveau</p>
        <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
          <span className="font-semibold text-stone-900">Code</span>
          <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" placeholder="ma-nouvelle-scene" value={newSceneCode} onChange={(event) => onNewSceneCodeChange(event.target.value)} />
        </label>
        <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
          <span className="font-semibold text-stone-900">Nom</span>
          <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" placeholder="Nouvelle scene" value={newSceneName} onChange={(event) => onNewSceneNameChange(event.target.value)} />
        </label>
        <button className="mt-4 rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white" type="button" onClick={onCreateScene}>
          Creer un brouillon
        </button>
      </section>
    </aside>
  )
}
