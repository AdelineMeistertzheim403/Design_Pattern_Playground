import { useEffect, useMemo, useRef, useState } from 'react'
import { getUserUmlDiagram, saveUserUmlDiagram } from '../lib/api'
import { loadPatternUmlDiagram } from '../patterns/loaders'
import {
  consumePendingUmlStudioLaunch,
  findSavedUmlStudioDocument,
  loadCurrentUmlStudioDocument,
  saveCurrentUmlStudioDocument,
  saveUmlStudioDocument,
} from '../app/umlStudioStorage'
import UmlStudioCanvas from '../components/umlStudio/UmlStudioCanvas'
import UmlStudioHeaderActions from '../components/umlStudio/UmlStudioHeaderActions'
import {
  buildViewBox,
  clamp,
  cloneDocument,
  createActivityNode,
  createBox,
  createEmptyDocument,
  createTextBlock,
  exportFile,
  findAttachmentTarget,
  getDiagramNodes,
  insertRelationPoint,
  normalizeDocument,
  parseViewBox,
  slugify,
} from '../components/umlStudio/umlStudioDocument'
import UmlStudioInspector from '../components/umlStudio/UmlStudioInspector'
import UmlStudioPalette from '../components/umlStudio/UmlStudioPalette'
import VisualizationModal from '../components/VisualizationModal'

export default function UmlStudioPage({ backendStatus, currentUser, launchRequest, patterns, onNavigateHome, onOpenAuth }) {
  const [draft, setDraft] = useState(createEmptyDocument)
  const [selectedItem, setSelectedItem] = useState(null)
  const [undoStack, setUndoStack] = useState([])
  const [notice, setNotice] = useState('')
  const [attachPreview, setAttachPreview] = useState(null)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [savePending, setSavePending] = useState(false)
  const [placingRelationPoint, setPlacingRelationPoint] = useState(null)
  const svgRef = useRef(null)
  const dragStateRef = useRef(null)

  const viewBox = parseViewBox(draft.viewBox)
  const defsId = `uml-studio-${draft.id}`
  const diagramNodes = useMemo(() => getDiagramNodes(draft), [draft])
  const boxesById = useMemo(() => Object.fromEntries(diagramNodes.map((box) => [box.id, box])), [diagramNodes])

  useEffect(() => {
    let ignore = false

    const restoreInitialDocument = async () => {
      const pendingLaunch = launchRequest ?? consumePendingUmlStudioLaunch()

      if (pendingLaunch?.kind === 'blank') {
        if (!ignore) {
          setDraft(createEmptyDocument(pendingLaunch.diagramType ?? 'class'))
          setSelectedItem(null)
          setUndoStack([])
          setNotice(`Canvas UML ${pendingLaunch.diagramType === 'activity' ? 'd activite' : 'de classe'} vide initialise.`)
        }
        return
      }

      if (pendingLaunch?.kind === 'template' && pendingLaunch.code) {
        const template = await loadPatternUmlDiagram(pendingLaunch.code)
        if (ignore) {
          return
        }
        if (!template?.classes?.length) {
          setNotice(`Aucun template UML n a ete trouve pour "${pendingLaunch.code}".`)
          return
        }
        const pattern = patterns.find((item) => item.code === pendingLaunch.code)
        setDraft(normalizeDocument({
          ...template,
          diagramType: pendingLaunch.diagramType ?? 'class',
          id: `uml-${Date.now()}`,
          name: pattern ? `${pattern.name} - copie` : 'Template UML',
          texts: [],
        }))
        setSelectedItem(null)
        setUndoStack([])
        setNotice('Template charge. Tu peux maintenant adapter le diagramme a ton besoin.')
        return
      }

      if (pendingLaunch?.kind === 'saved' && pendingLaunch.id) {
        if (pendingLaunch.storage === 'remote') {
          try {
            const savedDocument = await getUserUmlDiagram(pendingLaunch.id)
            if (savedDocument?.diagram && !ignore) {
              setDraft(normalizeDocument({
                ...savedDocument.diagram,
                id: savedDocument.code,
                name: savedDocument.name,
              }))
              setSelectedItem(null)
              setUndoStack([])
              setNotice(`Diagramme "${savedDocument.name}" charge depuis la BDD.`)
            }
          } catch {
            if (!ignore) {
              setNotice('Impossible de charger ce diagramme depuis la BDD.')
            }
          }
          return
        }

        const savedDocument = findSavedUmlStudioDocument(pendingLaunch.id)
        if (savedDocument && !ignore) {
          setDraft(normalizeDocument(savedDocument.document))
          setSelectedItem(null)
          setUndoStack([])
          setNotice(`Diagramme "${savedDocument.name}" charge.`)
        }
        return
      }

      const currentDocument = loadCurrentUmlStudioDocument()
      if (currentDocument && !ignore) {
        setDraft(normalizeDocument(currentDocument))
      }
    }

    restoreInitialDocument()
    return () => {
      ignore = true
    }
  }, [launchRequest, patterns])

  useEffect(() => {
    saveCurrentUmlStudioDocument(draft)
  }, [draft])

  function applyDraftChange(updater) {
    const currentDraft = cloneDocument(draft)
    const nextDraft = normalizeDocument(updater(cloneDocument(draft)))

    if (JSON.stringify(currentDraft) === JSON.stringify(nextDraft)) {
      return
    }

    setUndoStack((currentStack) => [...currentStack.slice(-49), currentDraft])
    setDraft(nextDraft)
  }

  function getSvgPoint(event) {
    const svg = svgRef.current
    if (!svg) {
      return null
    }

    const rect = svg.getBoundingClientRect()
    return {
      x: viewBox.minX + (event.clientX - rect.left) * (viewBox.width / rect.width),
      y: viewBox.minY + (event.clientY - rect.top) * (viewBox.height / rect.height),
    }
  }

  useEffect(() => {
    const handlePointerMove = (event) => {
      const dragState = dragStateRef.current
      if (!dragState) {
        return
      }

      const currentPoint = getSvgPoint(event)
      if (!currentPoint) {
        return
      }

      if (dragState.kind === 'attach-endpoint') {
        setAttachPreview({
          endpoint: dragState.endpoint,
          relationId: dragState.id,
          pointer: currentPoint,
          target: findAttachmentTarget(currentPoint, diagramNodes),
        })
        return
      }

      if (dragState.kind === 'relation-point-move') {
        setDraft((currentDraft) => normalizeDocument({
          ...currentDraft,
          relations: currentDraft.relations.map((relation) => {
            if (relation.id !== dragState.id) {
              return relation
            }

            return {
              ...relation,
              points: (relation.points ?? []).map((point, index) => (
                index === dragState.pointIndex
                  ? { x: Math.round(currentPoint.x), y: Math.round(currentPoint.y) }
                  : point
              )),
            }
          }),
        }))
        return
      }

      if (dragState.kind === 'class-move' || dragState.kind === 'class-resize') {
        setDraft((currentDraft) => normalizeDocument({
          ...currentDraft,
          [currentDraft.diagramType === 'activity' ? 'activityNodes' : 'classes']: getDiagramNodes(currentDraft).map((box) => {
            if (box.id !== dragState.id) {
              return box
            }

            if (dragState.kind === 'class-move') {
              return {
                ...box,
                x: Math.round(dragState.startItem.x + (currentPoint.x - dragState.startPoint.x)),
                y: Math.round(dragState.startItem.y + (currentPoint.y - dragState.startPoint.y)),
              }
            }

            return {
              ...box,
              width: Math.max(120, Math.round(dragState.startItem.width + (currentPoint.x - dragState.startPoint.x))),
              height: Math.max(90, Math.round(dragState.startItem.height + (currentPoint.y - dragState.startPoint.y))),
            }
          }),
        }))
        return
      }

      if (dragState.kind === 'text-move' || dragState.kind === 'text-resize') {
        setDraft((currentDraft) => normalizeDocument({
          ...currentDraft,
          texts: currentDraft.texts.map((text) => {
            if (text.id !== dragState.id) {
              return text
            }

            if (dragState.kind === 'text-move') {
              return {
                ...text,
                x: Math.round(dragState.startItem.x + (currentPoint.x - dragState.startPoint.x)),
                y: Math.round(dragState.startItem.y + (currentPoint.y - dragState.startPoint.y)),
              }
            }

            return {
              ...text,
              width: Math.max(140, Math.round(dragState.startItem.width + (currentPoint.x - dragState.startPoint.x))),
              height: Math.max(60, Math.round(dragState.startItem.height + (currentPoint.y - dragState.startPoint.y))),
            }
          }),
        }))
      }
    }

    const handlePointerUp = () => {
      const dragState = dragStateRef.current
      if (!dragState) {
        return
      }

      if (dragState.kind === 'attach-endpoint' && attachPreview?.target) {
        setUndoStack((currentStack) => [...currentStack.slice(-49), dragState.originDraft])
        setDraft((currentDraft) => normalizeDocument({
          ...currentDraft,
          relations: currentDraft.relations.map((relation) => {
            if (relation.id !== dragState.id) {
              return relation
            }

            if (dragState.endpoint === 'from') {
              return {
                ...relation,
                from: attachPreview.target.boxId,
                fromSide: attachPreview.target.side,
              }
            }

            return {
              ...relation,
              to: attachPreview.target.boxId,
              toSide: attachPreview.target.side,
            }
          }),
        }))
        dragStateRef.current = null
        setAttachPreview(null)
        return
      }

      if (dragState.kind === 'relation-point-move') {
        if (JSON.stringify(dragState.originDraft) !== JSON.stringify(draft)) {
          setUndoStack((currentStack) => [...currentStack.slice(-49), dragState.originDraft])
        }
        dragStateRef.current = null
        setAttachPreview(null)
        return
      }

      if (JSON.stringify(dragState.originDraft) !== JSON.stringify(draft)) {
        setUndoStack((currentStack) => [...currentStack.slice(-49), dragState.originDraft])
      }
      dragStateRef.current = null
      setAttachPreview(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [attachPreview, draft, viewBox.height, viewBox.minX, viewBox.minY, viewBox.width])

  const selectedClass = selectedItem?.type === 'class'
    ? diagramNodes.find((box) => box.id === selectedItem.id) ?? null
    : null
  const selectedText = selectedItem?.type === 'text'
    ? draft.texts.find((text) => text.id === selectedItem.id) ?? null
    : null
  const selectedRelation = selectedItem?.type === 'relation'
    ? draft.relations.find((relation) => relation.id === selectedItem.id) ?? null
    : null

  function updateSelectedClass(updater) {
    if (!selectedClass) return
    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      [currentDraft.diagramType === 'activity' ? 'activityNodes' : 'classes']: getDiagramNodes(currentDraft).map((box) => (box.id === selectedClass.id ? updater(box) : box)),
    }))
  }

  function updateSelectedRelation(updater) {
    if (!selectedRelation) return
    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      relations: currentDraft.relations.map((relation) => (relation.id === selectedRelation.id ? updater(relation) : relation)),
    }))
  }

  function updateSelectedText(updater) {
    if (!selectedText) return
    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      texts: currentDraft.texts.map((text) => (text.id === selectedText.id ? updater(text) : text)),
    }))
  }

  function handleAddClass() {
    const nextBox = draft.diagramType === 'activity'
      ? createActivityNode('action', diagramNodes.length + 1)
      : createBox(diagramNodes.length + 1)
    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      [currentDraft.diagramType === 'activity' ? 'activityNodes' : 'classes']: [...getDiagramNodes(currentDraft), nextBox],
    }))
    setSelectedItem({ type: 'class', id: nextBox.id })
  }

  function handleAddActivityNode(kind) {
    const nextNode = createActivityNode(kind, diagramNodes.length + 1)
    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      activityNodes: [...(currentDraft.activityNodes ?? []), nextNode],
      diagramType: 'activity',
    }))
    setSelectedItem({ type: 'class', id: nextNode.id })
  }

  function handleAddText() {
    const nextText = createTextBlock(draft.texts.length + 1)
    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      texts: [...currentDraft.texts, nextText],
    }))
    setSelectedItem({ type: 'text', id: nextText.id })
  }

  function handleAddRelation() {
    if (diagramNodes.length < 2) {
      setNotice(`Ajoute au moins deux ${draft.diagramType === 'activity' ? 'etapes' : 'boites'} avant de creer une relation.`)
      return
    }

    const fromBox = selectedClass ?? diagramNodes[0]
    const toBox = diagramNodes.find((box) => box.id !== fromBox.id) ?? diagramNodes[1]
    const relation = {
      id: `relation-${Date.now()}`,
      from: fromBox.id,
      to: toBox.id,
      label: draft.diagramType === 'activity' ? 'flux' : 'depends',
      marker: 'arrow',
      dashed: false,
      fromSide: 'right',
      toSide: 'left',
      style: 'straight',
      curvature: 0,
      points: [],
      labelPosition: 0.5,
    }

    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      relations: [...currentDraft.relations, relation],
    }))
    setSelectedItem({ type: 'relation', id: relation.id })
  }

  function handleUndo() {
    const previousDraft = undoStack[undoStack.length - 1]
    if (!previousDraft) {
      setNotice('Aucune action a annuler pour le moment.')
      return
    }

    setDraft(normalizeDocument(previousDraft))
    setUndoStack((currentStack) => currentStack.slice(0, -1))
    setSelectedItem(null)
    setNotice('Derniere action annulee.')
  }

  function handleDeleteSelectedItem() {
    if (!selectedItem) {
      return
    }

    applyDraftChange((currentDraft) => {
      if (selectedItem.type === 'class') {
        const nextNodes = getDiagramNodes(currentDraft).filter((box) => box.id !== selectedItem.id)
        return {
          ...currentDraft,
          [currentDraft.diagramType === 'activity' ? 'activityNodes' : 'classes']: nextNodes,
          relations: currentDraft.relations.filter((relation) => relation.from !== selectedItem.id && relation.to !== selectedItem.id),
        }
      }

      if (selectedItem.type === 'relation') {
        return {
          ...currentDraft,
          relations: currentDraft.relations.filter((relation) => relation.id !== selectedItem.id),
        }
      }

      if (selectedItem.type === 'text') {
        return {
          ...currentDraft,
          texts: currentDraft.texts.filter((text) => text.id !== selectedItem.id),
        }
      }

      return currentDraft
    })

    setPlacingRelationPoint(null)
    setSelectedItem(null)
    setNotice('Element supprime.')
  }

  async function handleSave() {
    const name = draft.name.trim() || 'Diagramme UML'
    const code = slugify(draft.id || draft.name || name) || `uml-${Date.now()}`
    const record = {
      id: draft.id || code,
      name,
      updatedAt: new Date().toISOString(),
      document: { ...draft, id: draft.id || code, name },
    }

    if (backendStatus === 'connected' && currentUser) {
      setSavePending(true)
      try {
        const savedDocument = await saveUserUmlDiagram(code, {
          code,
          name,
          diagram: record.document,
        })
        setDraft(normalizeDocument({
          ...savedDocument.diagram,
          id: savedDocument.code,
          name: savedDocument.name,
        }))
        setNotice(`Diagramme "${savedDocument.name}" sauvegarde en BDD.`)
        return
      } catch (error) {
        setNotice(error.message || 'La sauvegarde BDD a echoue. Sauvegarde locale conservee.')
      } finally {
        setSavePending(false)
      }
    } else if (!currentUser && typeof onOpenAuth === 'function') {
      onOpenAuth('login')
    }

    saveUmlStudioDocument(record)
    setDraft(normalizeDocument(record.document))
    setNotice(`Diagramme "${name}" sauvegarde dans le navigateur.`)
  }

  function buildExportSvg() {
    const svg = svgRef.current
    if (!svg) {
      return null
    }

    const exportSvg = svg.cloneNode(true)
    exportSvg.querySelectorAll('[data-editor-only="true"]').forEach((node) => node.remove())
    exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    return new XMLSerializer().serializeToString(exportSvg)
  }

  function handleExportSvg() {
    const svgMarkup = buildExportSvg()
    if (!svgMarkup) {
      return
    }

    exportFile(`${slugify(draft.name) || 'diagramme-uml'}.svg`, new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }))
  }

  function handleExportPng() {
    const svgMarkup = buildExportSvg()
    if (!svgMarkup) {
      return
    }

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
          exportFile(`${slugify(draft.name) || 'diagramme-uml'}.png`, blob)
        }
      }, 'image/png')
    }

    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`
  }

  function handleCanvasBackgroundPointerDown(event) {
    if (event.target === event.currentTarget) {
      setPlacingRelationPoint(null)
      setSelectedItem(null)
    }
  }

  function handleRelationSelect(event, relationId) {
    event.stopPropagation()
    setPlacingRelationPoint(null)
    setSelectedItem({ type: 'relation', id: relationId })
  }

  function handleRelationEndpointPointerDown(event, relation, endpoint) {
    event.stopPropagation()
    setPlacingRelationPoint(null)
    const startPoint = getSvgPoint(event)
    if (!startPoint) return
    dragStateRef.current = {
      kind: 'attach-endpoint',
      id: relation.id,
      endpoint,
      startPoint,
      originDraft: cloneDocument(draft),
    }
    setAttachPreview({
      relationId: relation.id,
      endpoint,
      pointer: startPoint,
      target: findAttachmentTarget(startPoint, diagramNodes),
    })
  }

  function handleBeginRelationPointPlacement() {
    if (!selectedRelation) {
      return
    }
    setPlacingRelationPoint(selectedRelation.id)
    setNotice('Clique sur la fleche selectionnee pour placer un angle.')
  }

  function handleRelationPlacementClick(event, relation) {
    event.stopPropagation()
    const point = getSvgPoint(event)
    if (!point) {
      return
    }

    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      relations: currentDraft.relations.map((currentRelation) => (
        currentRelation.id === relation.id
          ? { ...currentRelation, points: insertRelationPoint(currentRelation, boxesById, point) }
          : currentRelation
      )),
    }))
    setPlacingRelationPoint(null)
    setNotice('Angle ajoute. Tu peux maintenant le deplacer directement sur la fleche.')
    setSelectedItem({ type: 'relation', id: relation.id })
  }

  function handleRelationPointPointerDown(event, relation, pointIndex) {
    event.stopPropagation()
    const startPoint = getSvgPoint(event)
    if (!startPoint) {
      return
    }

    dragStateRef.current = {
      kind: 'relation-point-move',
      id: relation.id,
      pointIndex,
      startPoint,
      originDraft: cloneDocument(draft),
    }
    setSelectedItem({ type: 'relation', id: relation.id })
  }

  function handleClassSelect(event, boxId) {
    event.stopPropagation()
    setPlacingRelationPoint(null)
    setSelectedItem({ type: 'class', id: boxId })
  }

  function handleClassMoveStart(event, box) {
    event.stopPropagation()
    const startPoint = getSvgPoint(event)
    if (!startPoint) return
    dragStateRef.current = { kind: 'class-move', id: box.id, startPoint, startItem: box, originDraft: cloneDocument(draft) }
    setSelectedItem({ type: 'class', id: box.id })
  }

  function handleClassResizeStart(event, box) {
    event.stopPropagation()
    const startPoint = getSvgPoint(event)
    if (!startPoint) return
    dragStateRef.current = { kind: 'class-resize', id: box.id, startPoint, startItem: box, originDraft: cloneDocument(draft) }
    setSelectedItem({ type: 'class', id: box.id })
  }

  function handleTextSelect(event, textId) {
    event.stopPropagation()
    setPlacingRelationPoint(null)
    setSelectedItem({ type: 'text', id: textId })
  }

  function handleTextMoveStart(event, text) {
    event.stopPropagation()
    const startPoint = getSvgPoint(event)
    if (!startPoint) return
    dragStateRef.current = { kind: 'text-move', id: text.id, startPoint, startItem: text, originDraft: cloneDocument(draft) }
    setSelectedItem({ type: 'text', id: text.id })
  }

  function handleTextResizeStart(event, text) {
    event.stopPropagation()
    const startPoint = getSvgPoint(event)
    if (!startPoint) return
    dragStateRef.current = { kind: 'text-resize', id: text.id, startPoint, startItem: text, originDraft: cloneDocument(draft) }
    setSelectedItem({ type: 'text', id: text.id })
  }

  const previewSvgMarkup = isPreviewOpen ? buildExportSvg() : null

  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.94))] p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Studio UML</p>
            <h1 className="mt-3 text-4xl text-stone-950">Editeur UML {draft.diagramType === 'activity' ? 'd activite' : ''}</h1>
          </div>
          <UmlStudioHeaderActions
            diagramName={draft.name}
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
        <UmlStudioPalette
          diagramType={draft.diagramType}
          onAddActivityNode={handleAddActivityNode}
          onAddClass={handleAddClass}
          onAddRelation={handleAddRelation}
          onAddText={handleAddText}
          onGridToggle={setShowGrid}
          onHeightChange={(height) => setDraft((currentDraft) => ({
            ...currentDraft,
            viewBox: buildViewBox(viewBox.minX, viewBox.minY, viewBox.width, height),
          }))}
          onWidthChange={(width) => setDraft((currentDraft) => ({
            ...currentDraft,
            viewBox: buildViewBox(viewBox.minX, viewBox.minY, width, viewBox.height),
          }))}
          onZoomDecrease={() => setZoom((value) => clamp(Number((value - 0.1).toFixed(2)), 0.4, 2.5))}
          onZoomIncrease={() => setZoom((value) => clamp(Number((value + 0.1).toFixed(2)), 0.4, 2.5))}
          onZoomReset={() => setZoom(1)}
          showGrid={showGrid}
          viewBox={viewBox}
          zoom={zoom}
        />

        <UmlStudioCanvas
          attachPreview={attachPreview}
          boxesById={boxesById}
          defsId={defsId}
          draft={draft}
          isPlacingRelationAngle={placingRelationPoint === selectedRelation?.id}
          onBackgroundPointerDown={handleCanvasBackgroundPointerDown}
          onClassMoveStart={handleClassMoveStart}
          onClassResizeStart={handleClassResizeStart}
          onRelationPlacementClick={handleRelationPlacementClick}
          onRelationPointPointerDown={handleRelationPointPointerDown}
          onClassSelect={handleClassSelect}
          onRelationEndpointPointerDown={handleRelationEndpointPointerDown}
          onRelationSelect={handleRelationSelect}
          onTextMoveStart={handleTextMoveStart}
          onTextResizeStart={handleTextResizeStart}
          onTextSelect={handleTextSelect}
          selectedClass={selectedClass}
          selectedRelation={selectedRelation}
          selectedText={selectedText}
          showGrid={showGrid}
          svgRef={svgRef}
          viewBox={viewBox}
          zoom={zoom}
        />

        <UmlStudioInspector
          draft={draft}
          isPlacingRelationAngle={placingRelationPoint === selectedRelation?.id}
          onBeginRelationPointPlacement={handleBeginRelationPointPlacement}
          onDeleteSelectedItem={handleDeleteSelectedItem}
          selectedClass={selectedClass}
          selectedRelation={selectedRelation}
          selectedText={selectedText}
          updateSelectedClass={updateSelectedClass}
          updateSelectedRelation={updateSelectedRelation}
          updateSelectedText={updateSelectedText}
        />
      </div>

      {isPreviewOpen && previewSvgMarkup ? (
        <VisualizationModal title={`Apercu ${draft.name}`} onClose={() => setIsPreviewOpen(false)}>
          <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.95))] p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <div className="overflow-auto rounded-[28px] border border-black/10 bg-[#fffaf2] p-4">
              <div
                className="mx-auto w-fit"
                dangerouslySetInnerHTML={{ __html: previewSvgMarkup }}
              />
            </div>
          </section>
        </VisualizationModal>
      ) : null}
    </div>
  )
}
