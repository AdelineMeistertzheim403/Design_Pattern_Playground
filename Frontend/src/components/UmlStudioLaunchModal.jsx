import { useEffect, useMemo, useState } from 'react'
import VisualizationModal from './VisualizationModal'
import { loadSavedUmlStudioDocuments } from '../app/umlStudioStorage'
import { loadSavedSvgSceneStudioDocuments } from '../app/svgSceneStudioStorage'
import { listUserSvgScenes, listUserUmlDiagrams } from '../lib/api'

export default function UmlStudioLaunchModal({
  backendStatus,
  currentUser,
  patterns,
  onClose,
  onCreateBlank,
  onOpenSaved,
  onOpenTemplate,
}) {
  const [mode, setMode] = useState('blank')
  const [editorType, setEditorType] = useState('uml')
  const [umlDiagramType, setUmlDiagramType] = useState('class')
  const [selectedPatternCode, setSelectedPatternCode] = useState(patterns[0]?.code ?? '')
  const [selectedSavedId, setSelectedSavedId] = useState('')
  const [remoteSavedDocuments, setRemoteSavedDocuments] = useState([])
  const [isRemoteSavedLoading, setIsRemoteSavedLoading] = useState(false)
  const localSavedDocuments = useMemo(() => loadSavedUmlStudioDocuments(), [])
  const localSavedSvgScenes = useMemo(() => loadSavedSvgSceneStudioDocuments(), [])
  const effectivePatternCode = selectedPatternCode || patterns[0]?.code || ''
  const canUseRemoteSavedDocuments = backendStatus === 'connected' && Boolean(currentUser)
  const savedDocuments = useMemo(() => {
    const remoteDocuments = canUseRemoteSavedDocuments
      ? remoteSavedDocuments.map((item) => ({ ...item, storage: 'remote' }))
      : []
    const localDocuments = editorType === 'svg-scene'
      ? localSavedSvgScenes.map((item) => ({ ...item, storage: 'local' }))
      : localSavedDocuments.map((item) => ({ ...item, storage: 'local' }))

    return canUseRemoteSavedDocuments ? remoteDocuments : localDocuments
  }, [canUseRemoteSavedDocuments, editorType, localSavedDocuments, localSavedSvgScenes, remoteSavedDocuments])

  useEffect(() => {
    if (!selectedPatternCode && patterns[0]?.code) {
      setSelectedPatternCode(patterns[0].code)
    }
  }, [patterns, selectedPatternCode])

  useEffect(() => {
    let ignore = false

    if (!canUseRemoteSavedDocuments) {
      setRemoteSavedDocuments([])
      return () => {
        ignore = true
      }
    }

    const loadRemoteSavedDocuments = async () => {
      setIsRemoteSavedLoading(true)
      try {
        const documents = editorType === 'svg-scene'
          ? await listUserSvgScenes()
          : await listUserUmlDiagrams()
        if (!ignore) {
          setRemoteSavedDocuments(Array.isArray(documents) ? documents : [])
        }
      } catch {
        if (!ignore) {
          setRemoteSavedDocuments([])
        }
      } finally {
        if (!ignore) {
          setIsRemoteSavedLoading(false)
        }
      }
    }

    loadRemoteSavedDocuments()

    return () => {
      ignore = true
    }
  }, [canUseRemoteSavedDocuments, editorType])

  useEffect(() => {
    if (editorType === 'uml' && umlDiagramType === 'activity' && mode === 'template') {
      setMode('blank')
    }
  }, [editorType, mode, umlDiagramType])

  return (
    <VisualizationModal title="Ouvrir l'éditeur UML" onClose={onClose}>
      <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.94))] p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Studio UML</p>
        <h1 className="mt-3 text-4xl text-stone-950">Choisis un point de départ</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-700">
          Ouvre un canvas vide, charge un template basé sur un design pattern, ou reprends un diagramme déjà sauvegardé.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { id: 'uml', title: 'Diagramme de classe' },
            { id: 'svg-scene', title: 'Scène SVG' },
          ].map((option) => (
            <button
              key={option.id}
              className={`rounded-[24px] border px-5 py-4 text-left transition ${
                editorType === option.id
                  ? 'border-stone-950 bg-stone-950 text-white'
                  : 'border-black/10 bg-white/88 text-stone-800 hover:border-black/20'
              }`}
              type="button"
              onClick={() => {
                setEditorType(option.id)
                setSelectedSavedId('')
              }}
            >
              <p className="text-base font-semibold">{option.title}</p>
            </button>
          ))}
        </div>

        {editorType === 'uml' ? (
          <label className="mt-6 flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold text-stone-900">Type de diagramme UML</span>
            <select
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none"
              value={umlDiagramType}
              onChange={(event) => setUmlDiagramType(event.target.value)}
            >
              <option value="class">Diagramme de classe</option>
              <option value="activity">Diagramme d'activité</option>
            </select>
          </label>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            {
              id: 'blank',
              title: 'Nouveau diagramme',
              description: editorType === 'svg-scene' ? 'Démarrer avec une scène SVG vide.' : 'Démarrer avec un canvas UML vide.',
            },
            {
              id: 'template',
              title: 'Depuis un template',
              description: editorType === 'svg-scene'
                ? "Partir d'une scène SVG de design pattern existante."
                : umlDiagramType === 'activity'
                  ? 'Les templates UML concernent pour l instant les diagrammes de classe.'
                  : "Partir d'un diagramme de design pattern existant.",
            },
            {
              id: 'saved',
              title: 'Ouvrir un diagramme',
              description: editorType === 'svg-scene' ? 'Reprendre une scène sauvegardée en base ou localement.' : 'Reprendre un diagramme sauvegardé en base ou localement.',
            },
          ].map((option) => {
            const isDisabled = option.id === 'template' && editorType === 'uml' && umlDiagramType === 'activity'

            return (
            <button
              key={option.id}
              className={`rounded-[28px] border p-5 text-left transition ${
                isDisabled
                  ? 'cursor-not-allowed border-black/8 bg-stone-100/80 text-stone-400'
                  : mode === option.id
                    ? 'border-stone-950 bg-stone-950 text-white'
                    : 'border-black/10 bg-white/88 text-stone-800 hover:border-black/20'
              }`}
              disabled={isDisabled}
              type="button"
              onClick={() => {
                if (!isDisabled) {
                  setMode(option.id)
                }
              }}
            >
              <p className="text-lg font-semibold">{option.title}</p>
              <p className={`mt-2 text-sm leading-6 ${
                mode === option.id
                  ? 'text-white/80'
                  : isDisabled
                    ? 'text-stone-400'
                    : 'text-stone-600'
              }`}>
                {option.description}
              </p>
            </button>
            )
          })}
        </div>

        {mode === 'template' ? (
          <label className="mt-6 flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold text-stone-900">Template de pattern</span>
            <select
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none"
              value={effectivePatternCode}
              onChange={(event) => setSelectedPatternCode(event.target.value)}
            >
              {patterns.map((pattern) => (
                <option key={pattern.code} value={pattern.code}>
                  {pattern.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {editorType === 'uml' && umlDiagramType === 'activity' && mode === 'template' ? (
          <p className="mt-4 rounded-2xl border border-dashed border-black/12 bg-white/80 px-4 py-4 text-sm text-stone-600">
            Les templates UML disponibles alimentent encore uniquement le diagramme de classe. Pour un diagramme d'activité, ouvre un canvas vide ou un diagramme sauvegardé.
          </p>
        ) : null}

        {mode === 'saved' ? (
          isRemoteSavedLoading ? (
            <p className="mt-6 rounded-2xl border border-dashed border-black/12 bg-white/80 px-4 py-4 text-sm text-stone-600">
              Chargement des diagrammes sauvegardés...
            </p>
          ) : savedDocuments.length > 0 ? (
            <label className="mt-6 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Diagramme sauvegardé</span>
              <select
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none"
                value={selectedSavedId}
                onChange={(event) => setSelectedSavedId(event.target.value)}
              >
                <option value="">Choisir un diagramme</option>
                {savedDocuments.map((documentItem) => (
                  <option
                    key={`${documentItem.storage}-${documentItem.code ?? documentItem.id}`}
                    value={`${documentItem.storage}:${documentItem.code ?? documentItem.id}`}
                  >
                    {documentItem.name} ({documentItem.storage === 'remote' ? 'BDD' : 'local'} - {new Date(documentItem.updatedAt).toLocaleString('fr-FR')})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-black/12 bg-white/80 px-4 py-4 text-sm text-stone-600">
              {canUseRemoteSavedDocuments
                ? "Aucun diagramme UML n'est encore sauvegardé sur ton compte."
                : "Aucun diagramme UML n'est encore sauvegardé sur cet appareil."}
            </p>
          )
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            className="rounded-full border border-black/10 bg-white/88 px-5 py-3 text-sm font-semibold text-stone-800"
            type="button"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
            type="button"
            onClick={() => {
              if (mode === 'blank') {
                onCreateBlank(editorType, umlDiagramType)
                return
              }

              if (mode === 'template' && effectivePatternCode && !(editorType === 'uml' && umlDiagramType === 'activity')) {
                onOpenTemplate(editorType, effectivePatternCode, umlDiagramType)
                return
              }

              if (selectedSavedId) {
                const [storage, documentId] = selectedSavedId.split(':')
                onOpenSaved({ editorType, storage, id: documentId, diagramType: umlDiagramType })
              }
            }}
            disabled={(mode === 'template' && (!effectivePatternCode || (editorType === 'uml' && umlDiagramType === 'activity'))) || (mode === 'saved' && !selectedSavedId && savedDocuments.length > 0)}
          >
            Ouvrir l'éditeur
          </button>
        </div>
      </section>
    </VisualizationModal>
  )
}
