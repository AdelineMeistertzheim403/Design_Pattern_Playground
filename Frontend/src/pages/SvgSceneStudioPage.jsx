import { useEffect, useMemo, useRef, useState } from 'react'
import VisualizationModal from '../components/VisualizationModal'
import UmlStudioHeaderActions from '../components/umlStudio/UmlStudioHeaderActions'
import SvgSceneStudioCanvas from '../components/svgSceneStudio/SvgSceneStudioCanvas'
import {
  buildImportedElementLabel,
  clampNumber,
  cloneDraft,
  cloneImportedElement,
  createDefaultDraft,
  createDraftFromMarkup,
  exportFile,
  findAttachmentTarget,
  formatViewBox,
  generateSvgMarkup,
  getElementCenter,
  getElementAnchor,
  moveArrayItem,
  parseStoredDraft,
  parseViewBox,
  slugify,
} from '../components/svgSceneStudio/svgSceneStudioDocument'
import SvgSceneStudioInspector from '../components/svgSceneStudio/SvgSceneStudioInspector'
import SvgSceneStudioPalette from '../components/svgSceneStudio/SvgSceneStudioPalette'
import { buildInitialParameters, normalizeParameters } from '../app/playgroundUtils'
import {
  findSavedSvgSceneStudioDocument,
  loadCurrentSvgSceneStudioDocument,
  saveCurrentSvgSceneStudioDocument,
  saveSvgSceneStudioDocument,
} from '../app/svgSceneStudioStorage'
import { consumePendingUmlStudioLaunch } from '../app/umlStudioStorage'
import { getPatternSvgScene, getUserSvgScene, saveUserSvgScene } from '../lib/api'
import { executeFallbackPattern, loadFallbackSchema, loadPatternSceneComponent } from '../patterns/loaders'

export default function SvgSceneStudioPage({ backendStatus, currentUser, launchRequest, patterns, onOpenAuth }) {
  const [draft, setDraft] = useState(createDefaultDraft)
  const [selectedElementIds, setSelectedElementIds] = useState([])
  const [selectedArrowId, setSelectedArrowId] = useState('')
  const [undoStack, setUndoStack] = useState([])
  const [notice, setNotice] = useState('')
  const [savePending, setSavePending] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [loadPending, setLoadPending] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [importPatternCode, setImportPatternCode] = useState(patterns[0]?.code ?? '')
  const [importedPatternDraft, setImportedPatternDraft] = useState(null)
  const [renderedImportSource, setRenderedImportSource] = useState(null)
  const svgRef = useRef(null)
  const hiddenSceneRef = useRef(null)
  const dragRef = useRef(null)

  const viewBox = parseViewBox(draft.viewBox)
  const selectedElement = draft.elements.find((element) => element.id === selectedElementIds[0]) ?? null
  const selectedArrow = draft.arrows.find((arrow) => arrow.id === selectedArrowId) ?? null
  const HiddenSceneComponent = renderedImportSource?.SceneComponent ?? null
  const previewSvgMarkup = isPreviewOpen ? generateSvgMarkup(draft) : null
  const importedPatternElements = useMemo(
    () => importedPatternDraft?.elements?.map((element, index) => ({
      ...element,
      importIndex: index,
      displayLabel: buildImportedElementLabel(element, index),
    })) ?? [],
    [importedPatternDraft],
  )

  function pushUndoSnapshot(snapshot) {
    setUndoStack((current) => [...current.slice(-49), snapshot])
  }

  function applyDraftChange(updater) {
    const currentDraft = cloneDraft(draft)
    const nextDraft = updater(cloneDraft(draft))
    if (JSON.stringify(currentDraft) === JSON.stringify(nextDraft)) {
      return
    }

    pushUndoSnapshot(currentDraft)
    setDraft(nextDraft)
  }

  useEffect(() => {
    let ignore = false

    async function restoreInitialDocument() {
      const pendingLaunch = launchRequest ?? consumePendingUmlStudioLaunch()

      if (pendingLaunch?.editorType && pendingLaunch.editorType !== 'svg-scene') {
        return
      }

      if (pendingLaunch?.kind === 'blank') {
        if (!ignore) {
          setDraft(createDefaultDraft())
          setSelectedElementIds([])
          setSelectedArrowId('')
          setUndoStack([])
          setNotice('Scene SVG vide initialisee.')
        }
        return
      }

      if (pendingLaunch?.kind === 'template' && pendingLaunch.code) {
        setLoadPending(true)
        const loadedDraft = await loadPatternDraft(pendingLaunch.code, pendingLaunch.code)
        if (!ignore) {
          setDraft(loadedDraft)
          setSelectedElementIds([])
          setSelectedArrowId('')
          setUndoStack([])
          setNotice('Template SVG charge.')
          setLoadPending(false)
        }
        return
      }

      if (pendingLaunch?.kind === 'saved' && pendingLaunch.id) {
        if (pendingLaunch.storage === 'remote') {
          try {
            const savedScene = await getUserSvgScene(pendingLaunch.id)
            if (savedScene?.svgMarkup && !ignore) {
              setDraft(parseStoredDraft(savedScene.svgMarkup, savedScene.name, savedScene.code))
              setSelectedElementIds([])
              setSelectedArrowId('')
              setUndoStack([])
              setNotice(`Scene "${savedScene.name}" chargee depuis la BDD.`)
            }
          } catch {
            if (!ignore) {
              setNotice('Impossible de charger cette scene depuis la BDD.')
            }
          }
          return
        }

        const savedDocument = findSavedSvgSceneStudioDocument(pendingLaunch.id)
        if (savedDocument && !ignore) {
          setDraft(savedDocument.document)
          setSelectedElementIds([])
          setSelectedArrowId('')
          setUndoStack([])
          setNotice(`Scene "${savedDocument.name}" chargee.`)
        }
        return
      }

      const currentDocument = loadCurrentSvgSceneStudioDocument()
      if (currentDocument && !ignore) {
        setDraft(currentDocument)
      }
    }

    restoreInitialDocument()
    return () => {
      ignore = true
    }
  }, [launchRequest])

  useEffect(() => {
    saveCurrentSvgSceneStudioDocument(draft)
  }, [draft])

  async function loadPatternDraft(patternCode, fallbackName) {
    try {
      const scene = await getPatternSvgScene(patternCode)
      if (scene?.svgMarkup) {
        return parseStoredDraft(scene.svgMarkup, scene.name || fallbackName, patternCode)
      }
    } catch {
      // Fall through to local component import.
    }

    const SceneComponent = await loadPatternSceneComponent(patternCode)
    if (!SceneComponent) {
      return createDefaultDraft(fallbackName, patternCode)
    }

    const schema = await loadFallbackSchema(patternCode)
    const execution = await executeFallbackPattern(patternCode, normalizeParameters(schema, buildInitialParameters(schema)))
    return new Promise((resolve) => {
      setRenderedImportSource({ patternCode, execution, SceneComponent, resolve, fallbackName })
    })
  }

  useEffect(() => {
    if (!renderedImportSource || !HiddenSceneComponent) {
      return
    }

    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const svg = hiddenSceneRef.current?.querySelector('svg')
        if (!svg || cancelled) {
          return
        }

        const markup = new XMLSerializer().serializeToString(svg)
        renderedImportSource.resolve(createDraftFromMarkup(markup, renderedImportSource.fallbackName, renderedImportSource.patternCode))
        setRenderedImportSource(null)
      }, 0)
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
    }
  }, [HiddenSceneComponent, renderedImportSource])

  function getSvgPoint(event) {
    const svg = svgRef.current
    if (!svg) {
      return null
    }

    const rect = svg.getBoundingClientRect()
    return {
      x: Math.round(viewBox.minX + (event.clientX - rect.left) * (viewBox.width / rect.width)),
      y: Math.round(viewBox.minY + (event.clientY - rect.top) * (viewBox.height / rect.height)),
    }
  }

  useEffect(() => {
    const handlePointerMove = (event) => {
      const drag = dragRef.current
      if (!drag) {
        return
      }

      const point = getSvgPoint(event)
      if (!point) {
        return
      }

      if (drag.mode === 'move-element') {
        setDraft((currentDraft) => ({
          ...currentDraft,
          elements: currentDraft.elements.map((element) => {
            if (!drag.selectedIds.includes(element.id)) {
              return element
            }

            return {
              ...element,
              x: (drag.startElements[element.id]?.x ?? element.x) + point.x - drag.startPoint.x,
              y: (drag.startElements[element.id]?.y ?? element.y) + point.y - drag.startPoint.y,
            }
          }),
          arrows: currentDraft.arrows.map((arrow) => {
            let nextArrow = arrow
            if (arrow.fromElementId && drag.selectedIds.includes(arrow.fromElementId)) {
              const startElement = drag.startElements[arrow.fromElementId]
              const nextElement = {
                ...startElement,
                x: startElement.x + point.x - drag.startPoint.x,
                y: startElement.y + point.y - drag.startPoint.y,
              }
              const anchor = getElementAnchor(nextElement, arrow.fromSide ?? 'right')
              nextArrow = { ...nextArrow, x1: anchor.x, y1: anchor.y }
            }
            if (arrow.toElementId && drag.selectedIds.includes(arrow.toElementId)) {
              const startElement = drag.startElements[arrow.toElementId]
              const nextElement = {
                ...startElement,
                x: startElement.x + point.x - drag.startPoint.x,
                y: startElement.y + point.y - drag.startPoint.y,
              }
              const anchor = getElementAnchor(nextElement, arrow.toSide ?? 'left')
              nextArrow = { ...nextArrow, x2: anchor.x, y2: anchor.y }
            }
            return nextArrow
          }),
        }))
        return
      }

      if (drag.mode === 'resize-element') {
        setDraft((currentDraft) => ({
          ...currentDraft,
          elements: currentDraft.elements.map((element) => (
            element.id === drag.id
              ? {
                ...element,
                width: Math.max(element.type === 'text' ? 80 : 120, drag.startElement.width + point.x - drag.startPoint.x),
                height: Math.max(element.type === 'text' ? 40 : 80, drag.startElement.height + point.y - drag.startPoint.y),
              }
              : element
          )),
        }))
        return
      }

      if (drag.mode === 'arrow-start' || drag.mode === 'arrow-end') {
        const target = findAttachmentTarget(point, draft.elements)
        const nextPoint = target?.anchor ?? point
        setDraft((currentDraft) => ({
          ...currentDraft,
          arrows: currentDraft.arrows.map((arrow) => {
            if (arrow.id !== drag.id) {
              return arrow
            }

            return drag.mode === 'arrow-start'
              ? { ...arrow, x1: nextPoint.x, y1: nextPoint.y, fromElementId: target?.elementId, fromSide: target?.side }
              : { ...arrow, x2: nextPoint.x, y2: nextPoint.y, toElementId: target?.elementId, toSide: target?.side }
          }),
        }))
      }
    }

    const handlePointerUp = () => {
      const drag = dragRef.current
      if (drag?.originDraft && JSON.stringify(drag.originDraft) !== JSON.stringify(draft)) {
        pushUndoSnapshot(drag.originDraft)
      }
      dragRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draft, viewBox.height, viewBox.minX, viewBox.minY, viewBox.width])

  function handleUndo() {
    setUndoStack((currentStack) => {
      if (!currentStack.length) {
        return currentStack
      }

      const nextStack = [...currentStack]
      const previousDraft = nextStack.pop()
      setDraft(previousDraft)
      setSelectedElementIds([])
      setSelectedArrowId('')
      return nextStack
    })
  }

  function moveSelectedElementLayer(direction) {
    if (!selectedElement) {
      return
    }

    applyDraftChange((currentDraft) => {
      const currentIndex = currentDraft.elements.findIndex((element) => element.id === selectedElement.id)
      const nextIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1
      return {
        ...currentDraft,
        elements: moveArrayItem(currentDraft.elements, currentIndex, nextIndex),
      }
    })
  }

  function handleElementSelect(event, elementId) {
    event.stopPropagation()
    const multi = event?.ctrlKey || event?.metaKey || event?.shiftKey
    setSelectedArrowId('')
    setSelectedElementIds((currentIds) => {
      if (!multi) {
        return [elementId]
      }
      return currentIds.includes(elementId)
        ? currentIds.filter((id) => id !== elementId)
        : [...currentIds, elementId]
    })
  }

  function handleElementDragStart(event, element) {
    event.stopPropagation()
    const point = getSvgPoint(event)
    if (!point) {
      return
    }

    const selectedIds = selectedElementIds.includes(element.id) ? selectedElementIds : [element.id]
    const startElements = Object.fromEntries(
      draft.elements.filter((currentElement) => selectedIds.includes(currentElement.id)).map((currentElement) => [currentElement.id, currentElement]),
    )

    dragRef.current = {
      mode: 'move-element',
      id: element.id,
      selectedIds,
      startPoint: point,
      startElements,
      originDraft: cloneDraft(draft),
    }
    handleElementSelect(event, element.id)
  }

  function handleElementResizeStart(event, element) {
    event.stopPropagation()
    const point = getSvgPoint(event)
    if (!point) {
      return
    }
    dragRef.current = { mode: 'resize-element', id: element.id, startPoint: point, startElement: element, originDraft: cloneDraft(draft) }
  }

  function handleAddElement(type) {
    applyDraftChange((currentDraft) => {
      const seed = Date.now()
      const element = {
        id: `element-${seed}`,
        type,
        label: type === 'text' ? 'Texte' : type === 'ellipse' ? 'Noeud' : 'Element',
        subtitle: type === 'text' ? '' : 'detail',
        x: 150 + currentDraft.elements.length * 24,
        y: 120 + currentDraft.elements.length * 24,
        width: type === 'text' ? 180 : 230,
        height: type === 'text' ? 48 : 120,
        fontSize: type === 'text' ? 30 : 24,
        tone: type === 'ellipse' ? 'blue' : 'paper',
        animation: {
          enabled: true,
          stepIndex: currentDraft.elements.length,
          fadeInSeconds: 0.45,
          delaySeconds: 0,
        },
      }

      setSelectedElementIds([element.id])
      setSelectedArrowId('')
      return { ...currentDraft, elements: [...currentDraft.elements, element] }
    })
  }

  function handleAddArrow() {
    applyDraftChange((currentDraft) => {
      const first = currentDraft.elements[0] ? getElementCenter(currentDraft.elements[0]) : { x: 250, y: 250 }
      const second = currentDraft.elements[1] ? getElementCenter(currentDraft.elements[1]) : { x: 520, y: 250 }
      const arrow = {
        id: `arrow-${Date.now()}`,
        label: 'flow',
        x1: first.x,
        y1: first.y,
        x2: second.x,
        y2: second.y,
        dashed: false,
        curvature: 0,
        stepIndex: currentDraft.arrows.length,
        animation: { enabled: true, durationSeconds: 1.8, color: '#246b5e', pointRadius: 5, delaySeconds: 0 },
      }

      setSelectedArrowId(arrow.id)
      setSelectedElementIds([])
      return {
        ...currentDraft,
        arrows: [...currentDraft.arrows, arrow],
        steps: [...(currentDraft.steps ?? []), { label: arrow.label }],
      }
    })
  }

  async function handleImportPatternScene() {
    if (!importPatternCode) {
      return
    }

    setLoadPending(true)
    try {
      const importedDraft = await loadPatternDraft(importPatternCode, patterns.find((pattern) => pattern.code === importPatternCode)?.name || importPatternCode)
      setImportedPatternDraft(importedDraft)
      setNotice(`Bibliotheque d elements chargee depuis le pattern "${importPatternCode}".`)
    } catch (error) {
      setNotice(error.message || 'Impossible d importer la scene du pattern.')
    } finally {
      setLoadPending(false)
    }
  }

  function handleImportPatternElement(templateElement, importIndex) {
    applyDraftChange((currentDraft) => {
      const importedElement = cloneImportedElement(templateElement, importIndex)
      setSelectedElementIds([importedElement.id])
      setSelectedArrowId('')
      return {
        ...currentDraft,
        elements: [...currentDraft.elements, importedElement],
      }
    })
    setNotice(`Element "${buildImportedElementLabel(templateElement, importIndex)}" ajoute a la scene.`)
  }

  async function handleSave() {
    const name = draft.name.trim() || 'Scene SVG'
    const code = slugify(draft.code || name) || `scene-svg-${Date.now()}`
    const nextDraft = { ...draft, code, name }
    const svgMarkup = generateSvgMarkup(nextDraft)

    setDraft(nextDraft)
    setSavePending(true)
    setNotice('')

    if (backendStatus === 'connected' && currentUser) {
      try {
        const savedScene = await saveUserSvgScene(code, { code, name, svgMarkup })
        setNotice(`Scene "${savedScene.name}" sauvegardee en BDD.`)
        return
      } catch (error) {
        setNotice(error.message || 'La sauvegarde BDD a echoue. Sauvegarde locale conservee.')
      } finally {
        setSavePending(false)
      }
    } else if (!currentUser && typeof onOpenAuth === 'function') {
      onOpenAuth('login')
    }

    const record = {
      id: code,
      code,
      name,
      updatedAt: new Date().toISOString(),
      document: nextDraft,
    }

    saveSvgSceneStudioDocument(record)
    setNotice(`Scene "${name}" sauvegardee dans le navigateur.`)
    setSavePending(false)
  }

  function handleExportSvg() {
    const svgMarkup = generateSvgMarkup(draft)
    exportFile(`${slugify(draft.name) || 'scene-svg'}.svg`, new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }))
  }

  function handleExportPng() {
    const svgMarkup = generateSvgMarkup(draft)
    const image = new Image()
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(viewBox.width)
    canvas.height = Math.round(viewBox.height)
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    image.onload = () => {
      context.fillStyle = '#fffaf2'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          exportFile(`${slugify(draft.name) || 'scene-svg'}.png`, blob)
        }
      }, 'image/png')
    }

    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`
  }

  function handleDeleteSelection() {
    if (selectedElementIds.length) {
      applyDraftChange((currentDraft) => ({
        ...currentDraft,
        elements: currentDraft.elements.filter((element) => !selectedElementIds.includes(element.id)),
        arrows: currentDraft.arrows.filter((arrow) => !selectedElementIds.includes(arrow.fromElementId) && !selectedElementIds.includes(arrow.toElementId)),
      }))
      setSelectedElementIds([])
      return
    }

    if (selectedArrow) {
      applyDraftChange((currentDraft) => ({
        ...currentDraft,
        arrows: currentDraft.arrows.filter((arrow) => arrow.id !== selectedArrow.id),
      }))
      setSelectedArrowId('')
    }
  }

  function updateSelectedElement(updater) {
    if (!selectedElement) {
      return
    }

    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      elements: currentDraft.elements.map((element) => (
        element.id === selectedElement.id ? updater(element) : element
      )),
    }))
  }

  function updateSelectedArrow(updater) {
    if (!selectedArrow) {
      return
    }

    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      arrows: currentDraft.arrows.map((arrow) => (
        arrow.id === selectedArrow.id ? updater(arrow) : arrow
      )),
    }))
  }

  function handleCanvasBackgroundPointerDown(event) {
    if (event.target === event.currentTarget) {
      setSelectedElementIds([])
      setSelectedArrowId('')
    }
  }

  function handleArrowSelect(event, arrowId) {
    event.stopPropagation()
    setSelectedArrowId(arrowId)
    setSelectedElementIds([])
  }

  function handleArrowEndpointPointerDown(event, arrowId, endpoint) {
    event.stopPropagation()
    dragRef.current = { mode: endpoint === 'start' ? 'arrow-start' : 'arrow-end', id: arrowId, originDraft: cloneDraft(draft) }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {HiddenSceneComponent ? (
        <div ref={hiddenSceneRef} className="pointer-events-none fixed left-[-10000px] top-0 w-[1200px] opacity-0" aria-hidden="true">
          <HiddenSceneComponent execution={renderedImportSource.execution} isExpanded panelClassName="p-0" svgClassName="h-auto w-full" TitleTag="h2" sourceLabel="Import scene" />
        </div>
      ) : null}

      <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.94))] p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Studio SVG</p>
            <h1 className="mt-3 text-4xl text-stone-950">Editeur de scenes SVG</h1>
          </div>
          <UmlStudioHeaderActions
            diagramName={draft.name}
            nameLabel="Nom de la scene"
            onDiagramNameChange={(name) => setDraft((currentDraft) => ({ ...currentDraft, name }))}
            onExportPng={handleExportPng}
            onExportSvg={handleExportSvg}
            onPreviewOpen={() => setIsPreviewOpen(true)}
            onSave={handleSave}
            onUndo={handleUndo}
            savePending={savePending}
          />
        </div>
        {notice ? <p className="mt-4 rounded-2xl border border-black/8 bg-white/80 px-4 py-3 text-sm text-stone-700">{notice}</p> : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <SvgSceneStudioPalette
          importedPatternElements={importedPatternElements}
          importPatternCode={importPatternCode}
          importPatternCodeValue={importPatternCode}
          loadPending={loadPending}
          onAddArrow={handleAddArrow}
          onAddElement={handleAddElement}
          onHeightChange={(height) => setDraft((currentDraft) => ({ ...currentDraft, viewBox: formatViewBox({ ...parseViewBox(currentDraft.viewBox), height }) }))}
          onImportPatternCodeChange={setImportPatternCode}
          onImportPatternElement={handleImportPatternElement}
          onImportPatternScene={handleImportPatternScene}
          onPlaybackModeChange={(value) => setDraft((currentDraft) => ({ ...currentDraft, playbackMode: value }))}
          onShowGridChange={setShowGrid}
          onWidthChange={(width) => setDraft((currentDraft) => ({ ...currentDraft, viewBox: formatViewBox({ ...parseViewBox(currentDraft.viewBox), width }) }))}
          playbackMode={draft.playbackMode ?? 'auto'}
          patterns={patterns}
          showGrid={showGrid}
          viewBox={viewBox}
        />

        <SvgSceneStudioCanvas
          draft={draft}
          onArrowEndpointPointerDown={handleArrowEndpointPointerDown}
          onArrowSelect={handleArrowSelect}
          onBackgroundPointerDown={handleCanvasBackgroundPointerDown}
          onElementDragStart={handleElementDragStart}
          onElementResizeStart={handleElementResizeStart}
          onElementSelect={handleElementSelect}
          selectedArrowId={selectedArrowId}
          selectedElementIds={selectedElementIds}
          showGrid={showGrid}
          svgRef={svgRef}
          viewBox={viewBox}
        />

        <SvgSceneStudioInspector
          onDeleteSelection={handleDeleteSelection}
          onMoveSelectedElementLayer={moveSelectedElementLayer}
          selectedArrow={selectedArrow}
          selectedElement={selectedElement}
          updateSelectedArrow={updateSelectedArrow}
          updateSelectedElement={updateSelectedElement}
        />
      </div>

      {isPreviewOpen && previewSvgMarkup ? (
        <VisualizationModal title={`Apercu ${draft.name}`} onClose={() => setIsPreviewOpen(false)}>
          <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.95))] p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <div className="overflow-auto rounded-[28px] border border-black/10 bg-[#fffaf2] p-4">
              <div className="mx-auto w-fit" dangerouslySetInnerHTML={{ __html: previewSvgMarkup }} />
            </div>
          </section>
        </VisualizationModal>
      ) : null}
    </div>
  )
}
