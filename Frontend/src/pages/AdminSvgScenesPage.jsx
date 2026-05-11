import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getAdminSvgScene,
  listAdminSvgScenes,
  saveAdminSvgScene,
} from '../lib/api'
import {
  executeFallbackPattern,
  loadFallbackSchema,
  loadPatternSceneComponent,
} from '../patterns/loaders'
import {
  buildInitialParameters,
  normalizeParameters,
} from '../app/playgroundUtils'
import AdminSvgSceneCanvas from '../components/adminSvgSceneStudio/AdminSvgSceneCanvas'
import AdminSvgSceneInspector from '../components/adminSvgSceneStudio/AdminSvgSceneInspector'
import AdminSvgSceneSidebar from '../components/adminSvgSceneStudio/AdminSvgSceneSidebar'
import {
  createDefaultDraft,
  createDraftFromPatternExecution,
  createDraftFromRenderedSvg,
  findAttachmentTarget,
  formatViewBox,
  generateSvgMarkup,
  getElementAnchor,
  getElementCenter,
  parseStoredDraft,
  parseViewBox,
  slugify,
} from '../components/adminSvgSceneStudio/adminSvgSceneDocument'

function AccessMessage({ currentUser, onNavigateHome }) {
  const isAdmin = currentUser?.role === 'ADMIN'
  const title = !currentUser ? 'Edition SVG reservee' : isAdmin ? 'Mode Admin SVG indisponible' : 'Acces admin requis'
  const message = !currentUser
    ? 'Cette page necessite une session authentifiee avec un compte admin.'
    : isAdmin
      ? 'Le backend doit etre actif pour charger et enregistrer les scenes SVG.'
      : 'Le compte courant n a pas le role ADMIN.'

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-white/85 p-8 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Admin SVG</p>
        <h1 className="mt-3 text-4xl text-stone-950">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">{message}</p>
        {!currentUser ? (
          <button className="mt-6 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white" type="button" onClick={onNavigateHome}>
            Retour a l accueil
          </button>
        ) : null}
      </section>
    </div>
  )
}

export default function AdminSvgScenesPage({
  backendStatus,
  currentUser,
  patterns,
  onNavigateHome,
}) {
  const [storedScenes, setStoredScenes] = useState([])
  const [selectedCode, setSelectedCode] = useState('')
  const [sceneName, setSceneName] = useState('')
  const [draft, setDraft] = useState(() => createDefaultDraft())
  const [selectedElementId, setSelectedElementId] = useState('')
  const [selectedElementIds, setSelectedElementIds] = useState([])
  const [selectedArrowId, setSelectedArrowId] = useState('')
  const [newSceneCode, setNewSceneCode] = useState('')
  const [newSceneName, setNewSceneName] = useState('')
  const [notice, setNotice] = useState('')
  const [loadPending, setLoadPending] = useState(false)
  const [savePending, setSavePending] = useState(false)
  const [renderedSource, setRenderedSource] = useState(null)
  const svgRef = useRef(null)
  const sourceSceneRef = useRef(null)
  const dragRef = useRef(null)

  const isAdmin = currentUser?.role === 'ADMIN'
  const viewBox = parseViewBox(draft.viewBox)
  const selectedElement = draft.elements.find((element) => element.id === selectedElementId) ?? null
  const selectedArrow = draft.arrows.find((arrow) => arrow.id === selectedArrowId) ?? null
  const SourceSceneComponent = renderedSource?.SceneComponent ?? null
  const svgMarkup = useMemo(() => generateSvgMarkup(draft), [draft])

  const sceneOptions = useMemo(() => {
    const fromPatterns = patterns.map((pattern) => ({ code: pattern.code, name: pattern.name }))
    const customOnly = storedScenes
      .filter((item) => !fromPatterns.some((pattern) => pattern.code === item.code))
      .map((item) => ({ code: item.code, name: item.name }))

    const combined = [...fromPatterns, ...customOnly]
    if (selectedCode && !combined.some((item) => item.code === selectedCode)) {
      combined.push({ code: selectedCode, name: sceneName || selectedCode })
    }

    return combined.sort((left, right) => left.name.localeCompare(right.name, 'fr'))
  }, [patterns, sceneName, selectedCode, storedScenes])

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

  function clearSelection() {
    setSelectedElementId('')
    setSelectedElementIds([])
    setSelectedArrowId('')
  }

  function selectElement(elementId, event) {
    const multi = event?.ctrlKey || event?.metaKey || event?.shiftKey
    setSelectedArrowId('')
    setSelectedElementId(elementId)
    setSelectedElementIds((currentIds) => {
      if (!multi) {
        return [elementId]
      }

      return currentIds.includes(elementId)
        ? currentIds.filter((id) => id !== elementId)
        : [...currentIds, elementId]
    })
  }

  useEffect(() => {
    if (!isAdmin || backendStatus !== 'connected') {
      return
    }

    let ignore = false
    const loadIndex = async () => {
      try {
        const items = await listAdminSvgScenes()
        if (!ignore) {
          setStoredScenes(items ?? [])
          setSelectedCode((currentCode) => currentCode || patterns[0]?.code || items[0]?.code || '')
        }
      } catch (error) {
        if (!ignore) {
          setNotice(error.message)
        }
      }
    }

    loadIndex()
    return () => {
      ignore = true
    }
  }, [backendStatus, isAdmin, patterns])

  useEffect(() => {
    if (!selectedCode || !isAdmin || backendStatus !== 'connected') {
      return
    }

    let ignore = false
    setLoadPending(true)
    setNotice('')

    const loadScene = async () => {
      const option = sceneOptions.find((item) => item.code === selectedCode)
      const fallbackName = option?.name ?? selectedCode
      setRenderedSource(null)

      try {
        const stored = await getAdminSvgScene(selectedCode)
        if (ignore) {
          return
        }

        if (stored?.svgMarkup) {
          setSceneName(stored.name ?? fallbackName)
          setDraft(parseStoredDraft(stored.svgMarkup, stored.name ?? fallbackName))
          clearSelection()
          return
        }
      } catch {
        // Built-in patterns may not have a persisted custom scene yet.
      }

      if (!ignore) {
        setSceneName(fallbackName)
        const schema = await loadFallbackSchema(selectedCode)
        const parameters = normalizeParameters(schema, buildInitialParameters(schema))
        const execution = await executeFallbackPattern(selectedCode, parameters)
        const SceneComponent = await loadPatternSceneComponent(selectedCode)

        if (SceneComponent) {
          setDraft(createDefaultDraft(fallbackName))
          setRenderedSource({
            code: selectedCode,
            execution,
            SceneComponent,
          })
          setNotice('Import de la scene SVG existante en cours...')
        } else {
          setDraft(await createDraftFromPatternExecution(
            selectedCode,
            fallbackName,
            async () => schema,
            async () => execution,
            normalizeParameters,
            buildInitialParameters,
          ))
        }
        clearSelection()
      }
    }

    loadScene()
      .catch((error) => {
        if (!ignore) {
          setNotice(error.message)
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadPending(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [backendStatus, isAdmin, sceneOptions, selectedCode])

  useEffect(() => {
    if (!renderedSource || renderedSource.code !== selectedCode) {
      return
    }

    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        if (cancelled) {
          return
        }

        const svg = sourceSceneRef.current?.querySelector('svg')
        if (!svg) {
          setNotice('Impossible de trouver le SVG rendu par la scene existante.')
          return
        }

        setDraft(createDraftFromRenderedSvg(svg, sceneName || selectedCode, renderedSource.execution))
        clearSelection()
        setNotice('Scene SVG existante importee depuis le rendu du pattern.')
      }, 0)
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
    }
  }, [renderedSource, sceneName, selectedCode])

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
        const selectedIds = drag.selectedIds?.length ? drag.selectedIds : [drag.id]
        setDraft((currentDraft) => ({
          ...currentDraft,
          elements: currentDraft.elements.map((element) => {
            if (!selectedIds.includes(element.id)) {
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
            const movedFrom = arrow.fromElementId && selectedIds.includes(arrow.fromElementId)
              ? currentDraft.elements.find((element) => element.id === arrow.fromElementId)
              : null
            const movedTo = arrow.toElementId && selectedIds.includes(arrow.toElementId)
              ? currentDraft.elements.find((element) => element.id === arrow.toElementId)
              : null

            if (movedFrom) {
              const startElement = drag.startElements[movedFrom.id] ?? movedFrom
              const nextElement = {
                ...movedFrom,
                x: startElement.x + point.x - drag.startPoint.x,
                y: startElement.y + point.y - drag.startPoint.y,
              }
              const anchor = getElementAnchor(nextElement, arrow.fromSide ?? 'right')
              nextArrow = { ...nextArrow, x1: anchor.x, y1: anchor.y }
            }

            if (movedTo) {
              const startElement = drag.startElements[movedTo.id] ?? movedTo
              const nextElement = {
                ...movedTo,
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
          arrows: currentDraft.arrows.map((arrow) => {
            const nextElement = {
              ...drag.startElement,
              width: Math.max(drag.startElement.type === 'text' ? 80 : 120, drag.startElement.width + point.x - drag.startPoint.x),
              height: Math.max(drag.startElement.type === 'text' ? 40 : 80, drag.startElement.height + point.y - drag.startPoint.y),
            }
            let nextArrow = arrow
            if (arrow.fromElementId === drag.id) {
              const anchor = getElementAnchor(nextElement, arrow.fromSide ?? 'right')
              nextArrow = { ...nextArrow, x1: anchor.x, y1: anchor.y }
            }
            if (arrow.toElementId === drag.id) {
              const anchor = getElementAnchor(nextElement, arrow.toSide ?? 'left')
              nextArrow = { ...nextArrow, x2: anchor.x, y2: anchor.y }
            }
            return nextArrow
          }),
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
      dragRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draft.elements, viewBox.height, viewBox.minX, viewBox.minY, viewBox.width])

  function updateSelectedElement(updater) {
    if (!selectedElement) {
      return
    }

    setDraft((currentDraft) => ({
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

    setDraft((currentDraft) => ({
      ...currentDraft,
      arrows: currentDraft.arrows.map((arrow) => (
        arrow.id === selectedArrow.id ? updater(arrow) : arrow
      )),
    }))
  }

  function startElementDrag(event, element) {
    event.stopPropagation()
    const point = getSvgPoint(event)
    if (!point) {
      return
    }

    const selectedIds = selectedElementIds.includes(element.id)
      ? selectedElementIds
      : [element.id]
    const startElements = Object.fromEntries(
      draft.elements
        .filter((currentElement) => selectedIds.includes(currentElement.id))
        .map((currentElement) => [currentElement.id, currentElement]),
    )

    dragRef.current = {
      mode: 'move-element',
      id: element.id,
      selectedIds,
      startPoint: point,
      startElements,
    }
    selectElement(element.id, event)
  }

  function startElementResize(event, element) {
    event.stopPropagation()
    const point = getSvgPoint(event)
    if (point) {
      dragRef.current = { mode: 'resize-element', id: element.id, startPoint: point, startElement: element }
    }
  }

  function startArrowEndpointDrag(event, arrowId, endpoint) {
    event.stopPropagation()
    dragRef.current = { mode: endpoint === 'start' ? 'arrow-start' : 'arrow-end', id: arrowId }
  }

  function addElement(type) {
    const element = {
      id: `element-${Date.now()}`,
      type,
      label: type === 'text' ? 'Texte' : type === 'ellipse' ? 'Noeud' : 'Element',
      subtitle: type === 'rect' ? 'detail' : '',
      x: 160 + draft.elements.length * 28,
      y: 140 + draft.elements.length * 24,
      width: type === 'text' ? 180 : 230,
      height: type === 'text' ? 48 : 120,
      fontSize: type === 'text' ? 30 : 26,
      tone: type === 'ellipse' ? 'blue' : 'paper',
    }

    setDraft((currentDraft) => ({ ...currentDraft, elements: [...currentDraft.elements, element] }))
    setSelectedElementId(element.id)
    setSelectedElementIds([element.id])
    setSelectedArrowId('')
  }

  function addArrow() {
    const first = draft.elements[0] ? getElementCenter(draft.elements[0]) : { x: 250, y: 250 }
    const second = draft.elements[1] ? getElementCenter(draft.elements[1]) : { x: 520, y: 250 }
    const arrow = {
      id: `arrow-${Date.now()}`,
      label: 'flow',
      x1: first.x,
      y1: first.y,
      x2: second.x,
      y2: second.y,
      dashed: false,
      curvature: 0,
      stepIndex: draft.arrows.length,
      animation: { enabled: true, durationSeconds: 1.8, color: '#246b5e' },
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      arrows: [...currentDraft.arrows, arrow],
      steps: [...(currentDraft.steps ?? []), { label: arrow.label }],
    }))
    setSelectedArrowId(arrow.id)
    setSelectedElementId('')
    setSelectedElementIds([])
  }

  function deleteSelection() {
    if (selectedElementIds.length > 0) {
      setDraft((currentDraft) => ({
        ...currentDraft,
        elements: currentDraft.elements.filter((element) => !selectedElementIds.includes(element.id)),
      }))
      setSelectedElementId('')
      setSelectedElementIds([])
      return
    }

    if (selectedArrow) {
      setDraft((currentDraft) => ({
        ...currentDraft,
        arrows: currentDraft.arrows.filter((arrow) => arrow.id !== selectedArrow.id),
      }))
      setSelectedArrowId('')
    }
  }

  function handleCreateScene() {
    const code = slugify(newSceneCode)
    const name = newSceneName.trim()
    if (!code || !name) {
      setNotice('Renseigne un code et un nom pour creer une scene.')
      return
    }

    setSelectedCode(code)
    setSceneName(name)
    setDraft(createDefaultDraft(name))
    clearSelection()
    setNotice('Nouvelle scene initialisee. Tu peux maintenant la composer dans le canvas.')
  }

  async function handleReimportPatternScene() {
    if (!selectedCode) {
      setNotice('Choisis un pattern avant de reimporter sa scene SVG.')
      return
    }

    setLoadPending(true)
    setNotice('')

    try {
      const option = sceneOptions.find((item) => item.code === selectedCode)
      const fallbackName = option?.name ?? sceneName ?? selectedCode
      const schema = await loadFallbackSchema(selectedCode)
      const parameters = normalizeParameters(schema, buildInitialParameters(schema))
      const execution = await executeFallbackPattern(selectedCode, parameters)
      const SceneComponent = await loadPatternSceneComponent(selectedCode)

      setSceneName((currentName) => currentName || fallbackName)
      if (SceneComponent) {
        setDraft(createDefaultDraft(fallbackName))
        setRenderedSource({
          code: selectedCode,
          execution,
          SceneComponent,
        })
        setNotice('Reimport de la scene SVG existante en cours...')
      } else {
        setRenderedSource(null)
        setDraft(await createDraftFromPatternExecution(
          selectedCode,
          fallbackName,
          loadFallbackSchema,
          executeFallbackPattern,
          normalizeParameters,
          buildInitialParameters,
        ))
        setNotice('Scene reconstruite depuis la visualisation du pattern.')
      }
      clearSelection()
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoadPending(false)
    }
  }

  async function handleSave() {
    if (!selectedCode) {
      setNotice('Choisis une scene ou cree un nouveau code avant de sauvegarder.')
      return
    }

    setSavePending(true)
    setNotice('')

    try {
      const saved = await saveAdminSvgScene(selectedCode, {
        code: selectedCode,
        name: sceneName.trim() || selectedCode,
        svgMarkup,
      })
      const freshIndex = await listAdminSvgScenes()
      setStoredScenes(freshIndex ?? [])
      setSceneName(saved.name)
      setDraft(parseStoredDraft(saved.svgMarkup, saved.name))
      setNotice(`Scene SVG enregistree par ${saved.updatedBy}.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setSavePending(false)
    }
  }

  if (!currentUser || !isAdmin || backendStatus !== 'connected') {
    return <AccessMessage currentUser={currentUser} onNavigateHome={onNavigateHome} />
  }

  if (currentUser.forcePasswordChange) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-amber-200 bg-amber-50 p-8 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Admin SVG</p>
          <h1 className="mt-3 text-4xl text-stone-950">Changement de mot de passe requis</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">
            Le compte admin par defaut doit d abord changer son mot de passe initial depuis la fenetre Compte.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {SourceSceneComponent ? (
        <div
          ref={sourceSceneRef}
          className="pointer-events-none fixed left-[-10000px] top-0 w-[1200px] opacity-0"
          aria-hidden="true"
        >
          <SourceSceneComponent
            execution={renderedSource.execution}
            isExpanded
            panelClassName="p-0"
            svgClassName="h-auto w-full"
            TitleTag="h2"
            sourceLabel="Import admin"
          />
        </div>
      ) : null}

      <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.92))] p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Admin SVG</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl text-stone-950">Editeur visuel de scenes SVG</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
              Compose la scene dans le canvas, deplace les elements, redimensionne-les, ajuste les fleches et sauvegarde le SVG en base.
            </p>
          </div>
          <button
            className="rounded-full border border-black/10 bg-stone-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={savePending}
            type="button"
            onClick={handleSave}
          >
            {savePending ? 'Enregistrement...' : 'Sauvegarder en base'}
          </button>
        </div>
        {notice ? <p className="mt-4 rounded-2xl border border-black/8 bg-white/80 px-4 py-3 text-sm text-stone-700">{notice}</p> : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)_340px]">
        <AdminSvgSceneSidebar
          draft={draft}
          loadPending={loadPending}
          newSceneCode={newSceneCode}
          newSceneName={newSceneName}
          onAddArrow={addArrow}
          onAddElement={addElement}
          onCreateScene={handleCreateScene}
          onDraftChange={setDraft}
          onHeightChange={(height) => setDraft((currentDraft) => ({ ...currentDraft, viewBox: formatViewBox({ ...parseViewBox(currentDraft.viewBox), height }) }))}
          onNewSceneCodeChange={setNewSceneCode}
          onNewSceneNameChange={setNewSceneName}
          onReimportPatternScene={handleReimportPatternScene}
          onResetCanvas={() => setDraft(createDefaultDraft(sceneName || selectedCode || 'Scene SVG'))}
          onSceneNameChange={setSceneName}
          onSelectCode={setSelectedCode}
          onWidthChange={(width) => setDraft((currentDraft) => ({ ...currentDraft, viewBox: formatViewBox({ ...parseViewBox(currentDraft.viewBox), width }) }))}
          sceneName={sceneName}
          sceneOptions={sceneOptions}
          selectedCode={selectedCode}
          viewBox={viewBox}
        />

        <AdminSvgSceneCanvas
          draft={draft}
          onArrowEndpointPointerDown={startArrowEndpointDrag}
          onArrowSelect={(event, arrowId) => {
            event.stopPropagation()
            setSelectedArrowId(arrowId)
            setSelectedElementId('')
            setSelectedElementIds([])
          }}
          onBackgroundPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              clearSelection()
            }
          }}
          onElementDragStart={startElementDrag}
          onElementResizeStart={startElementResize}
          onElementSelect={(event, elementId) => {
            event.stopPropagation()
            selectElement(elementId, event)
          }}
          selectedArrowId={selectedArrowId}
          selectedElementIds={selectedElementIds}
          svgRef={svgRef}
          viewBox={viewBox}
        />

        <AdminSvgSceneInspector
          draft={draft}
          onDeleteSelection={deleteSelection}
          selectedArrow={selectedArrow}
          selectedElement={selectedElement}
          selectedElementIds={selectedElementIds}
          svgMarkup={svgMarkup}
          updateSelectedArrow={updateSelectedArrow}
          updateSelectedElement={updateSelectedElement}
        />
      </div>
    </div>
  )
}
