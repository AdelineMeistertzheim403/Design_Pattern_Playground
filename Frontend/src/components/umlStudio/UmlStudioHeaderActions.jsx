function ActionButton({ disabled = false, icon, label, onClick, variant = 'default' }) {
  const className = variant === 'primary'
    ? 'rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60'
    : 'rounded-full border border-black/10 bg-white/88 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <button
      className={className}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Icon-only buttons keep the header compact; title and aria-label preserve discoverability. */}
      <i className={icon} aria-hidden="true" />
    </button>
  )
}

export default function UmlStudioHeaderActions({
  diagramName,
  onDiagramNameChange,
  onExportPng,
  onExportSvg,
  onPreviewOpen,
  onSave,
  onUndo,
  savePending,
}) {
  return (
    <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:items-end xl:justify-end xl:gap-4">
      <label className="flex min-w-0 flex-col gap-2 text-sm text-stone-700 xl:w-[320px]">
        <span className="font-semibold text-stone-900">Nom du diagramme</span>
        <input
          className="rounded-2xl border border-black/10 bg-white/88 px-4 py-3 text-sm text-stone-900 outline-none"
          value={diagramName}
          onChange={(event) => onDiagramNameChange(event.target.value)}
        />
      </label>
      {/* Buttons stay on one row on large screens; smaller screens can scroll horizontally instead of wrapping. */}
      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto xl:overflow-visible">
        <ActionButton icon="fa-solid fa-rotate-left" label="Annuler la derniere action" onClick={onUndo} />
        <ActionButton
          icon={savePending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'}
          label={savePending ? 'Sauvegarde en cours' : 'Sauvegarder'}
          onClick={onSave}
          variant="primary"
          disabled={savePending}
        />
        <ActionButton icon="fa-solid fa-eye" label="Apercu" onClick={onPreviewOpen} />
        <ActionButton icon="fa-solid fa-file-code" label="Exporter en SVG" onClick={onExportSvg} />
        <ActionButton icon="fa-solid fa-file-image" label="Exporter en PNG" onClick={onExportPng} />
      </div>
    </div>
  )
}
