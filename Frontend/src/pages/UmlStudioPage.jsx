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
import VisualizationModal from '../components/VisualizationModal'

const DEFAULT_VIEW_BOX = '0 0 1440 960'
const BOX_DEFAULTS = { width: 220, height: 132 }
const TEXT_DEFAULTS = { width: 240, height: 90 }
const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left']
const CLASS_HEADER_HEIGHT = 58
const CLASS_SECTION_MIN_HEIGHT = 48
const CLASS_BOTTOM_PADDING = 18
const DEFAULT_BOX_BORDER_COLOR = '#7a5a3f'
const DEFAULT_BOX_FILL_COLOR = '#fff9ef'
const DEFAULT_BOX_TEXT_COLOR = '#3d2d20'
const DEFAULT_RELATION_COLOR = '#7a5a3f'
const DEFAULT_TEXT_BORDER_COLOR = '#6a5544'
const DEFAULT_TEXT_FILL_COLOR = '#ffffff'
const DEFAULT_TEXT_COLOR = '#3d2d20'

function slugify(value) {
  return `${value ?? ''}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function cloneDocument(value) {
  return JSON.parse(JSON.stringify(value))
}

function buildViewBox(minX, minY, width, height) {
  return `${Math.round(minX)} ${Math.round(minY)} ${Math.max(640, Math.round(width))} ${Math.max(480, Math.round(height))}`
}

function parseViewBox(viewBox) {
  const parts = `${viewBox ?? DEFAULT_VIEW_BOX}`.split(/\s+/).map(Number)
  if (parts.length === 4 && parts.every(Number.isFinite)) {
    return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] }
  }

  return { minX: 0, minY: 0, width: 1440, height: 960 }
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map((item) => `${item ?? ''}`).filter(Boolean) : []
}

function normalizePoint(point) {
  const x = Number(point?.x)
  const y = Number(point?.y)
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null
}

function resolveClassSectionLayout(box) {
  const attributesHeight = Math.max(
    CLASS_SECTION_MIN_HEIGHT,
    Number.isFinite(Number(box?.attributesHeight)) ? Number(box.attributesHeight) : 58,
  )
  const methodsHeight = Math.max(
    CLASS_SECTION_MIN_HEIGHT,
    Number.isFinite(Number(box?.methodsHeight)) ? Number(box.methodsHeight) : 58,
  )
  const minimumHeight = CLASS_HEADER_HEIGHT + attributesHeight + methodsHeight + CLASS_BOTTOM_PADDING
  const height = Math.max(
    minimumHeight,
    Number.isFinite(Number(box?.height)) ? Number(box.height) : BOX_DEFAULTS.height,
  )

  return {
    attributesHeight,
    methodsHeight,
    height,
  }
}

function normalizeDocument(document) {
  const source = document && typeof document === 'object' ? document : {}
  const sourceClasses = Array.isArray(source.classes) ? source.classes : []
  const sourceTexts = Array.isArray(source.texts) ? source.texts : []
  const sourceRelations = Array.isArray(source.relations) ? source.relations : []

  return {
    id: source.id ?? `uml-${Date.now()}`,
    name: source.name ?? 'Nouveau diagramme UML',
    viewBox: source.viewBox ?? DEFAULT_VIEW_BOX,
    classes: sourceClasses.map((box, index) => ({
      ...resolveClassSectionLayout(box),
      id: box?.id ?? `class-${index + 1}`,
      title: box?.title ?? `Classe${index + 1}`,
      stereotype: box?.stereotype ?? 'Component',
      fields: normalizeList(box?.fields),
      methods: normalizeList(box?.methods),
      x: Number.isFinite(Number(box?.x)) ? Number(box.x) : 120 + index * 240,
      y: Number.isFinite(Number(box?.y)) ? Number(box.y) : 120,
      width: Number.isFinite(Number(box?.width)) ? Number(box.width) : BOX_DEFAULTS.width,
      borderColor: box?.borderColor ?? DEFAULT_BOX_BORDER_COLOR,
      fillColor: box?.fillColor ?? DEFAULT_BOX_FILL_COLOR,
      textColor: box?.textColor ?? DEFAULT_BOX_TEXT_COLOR,
    })),
    texts: sourceTexts.map((text, index) => ({
      id: text?.id ?? `text-${index + 1}`,
      text: text?.text ?? 'Nouvelle annotation',
      x: Number.isFinite(Number(text?.x)) ? Number(text.x) : 260,
      y: Number.isFinite(Number(text?.y)) ? Number(text.y) : 480 + index * 40,
      width: Number.isFinite(Number(text?.width)) ? Number(text.width) : TEXT_DEFAULTS.width,
      height: Number.isFinite(Number(text?.height)) ? Number(text.height) : TEXT_DEFAULTS.height,
      fontSize: Number.isFinite(Number(text?.fontSize)) ? Number(text.fontSize) : 18,
      borderColor: text?.borderColor ?? DEFAULT_TEXT_BORDER_COLOR,
      fillColor: text?.fillColor ?? DEFAULT_TEXT_FILL_COLOR,
      textColor: text?.textColor ?? DEFAULT_TEXT_COLOR,
    })),
    relations: sourceRelations.map((relation, index) => ({
      id: relation?.id ?? `relation-${index + 1}`,
      from: relation?.from ?? '',
      to: relation?.to ?? '',
      label: relation?.label ?? `relation-${index + 1}`,
      marker: relation?.marker ?? 'arrow',
      dashed: relation?.dashed === true,
      fromSide: SIDE_OPTIONS.includes(relation?.fromSide) ? relation.fromSide : 'right',
      toSide: SIDE_OPTIONS.includes(relation?.toSide) ? relation.toSide : 'left',
      style: relation?.style === 'curved' ? 'curved' : 'straight',
      curvature: Number.isFinite(Number(relation?.curvature)) ? Number(relation.curvature) : 0,
      points: sourceRelations[index]?.points?.map(normalizePoint).filter(Boolean) ?? [],
      labelPosition: Number.isFinite(Number(relation?.labelPosition)) ? clamp(Number(relation.labelPosition), 0, 1) : 0.5,
      color: relation?.color ?? DEFAULT_RELATION_COLOR,
    })),
  }
}

function createEmptyDocument() {
  return normalizeDocument({ viewBox: DEFAULT_VIEW_BOX, classes: [], texts: [], relations: [] })
}

function createBox(index) {
  return {
    ...resolveClassSectionLayout({ attributesHeight: 58, methodsHeight: 58, height: BOX_DEFAULTS.height }),
    id: `class-${Date.now()}-${index}`,
    title: `Classe${index}`,
    stereotype: 'Component',
    fields: ['+ attribut: Type'],
    methods: ['+ operation(): void'],
    x: 140 + index * 24,
    y: 120 + index * 24,
    width: BOX_DEFAULTS.width,
    borderColor: DEFAULT_BOX_BORDER_COLOR,
    fillColor: DEFAULT_BOX_FILL_COLOR,
    textColor: DEFAULT_BOX_TEXT_COLOR,
  }
}

function createTextBlock(index) {
  return {
    id: `text-${Date.now()}-${index}`,
    text: 'Ajoute ici une note ou un commentaire.',
    x: 220 + index * 20,
    y: 520 + index * 24,
    width: TEXT_DEFAULTS.width,
    height: TEXT_DEFAULTS.height,
    fontSize: 18,
    borderColor: DEFAULT_TEXT_BORDER_COLOR,
    fillColor: DEFAULT_TEXT_FILL_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
  }
}

function getAnchor(box, side) {
  if (side === 'left') {
    return { x: box.x, y: box.y + box.height / 2 }
  }
  if (side === 'top') {
    return { x: box.x + box.width / 2, y: box.y }
  }
  if (side === 'bottom') {
    return { x: box.x + box.width / 2, y: box.y + box.height }
  }
  return { x: box.x + box.width, y: box.y + box.height / 2 }
}

function getNearestSide(box, point) {
  const distances = [
    { side: 'top', distance: Math.abs(point.y - box.y) },
    { side: 'right', distance: Math.abs(point.x - (box.x + box.width)) },
    { side: 'bottom', distance: Math.abs(point.y - (box.y + box.height)) },
    { side: 'left', distance: Math.abs(point.x - box.x) },
  ]

  distances.sort((left, right) => left.distance - right.distance)
  return distances[0]?.side ?? 'right'
}

function findAttachmentTarget(point, boxes) {
  const margin = 28
  let bestTarget = null

  boxes.forEach((box) => {
    const isNearBox = (
      point.x >= box.x - margin
      && point.x <= box.x + box.width + margin
      && point.y >= box.y - margin
      && point.y <= box.y + box.height + margin
    )

    if (!isNearBox) {
      return
    }

    const side = getNearestSide(box, point)
    const anchor = getAnchor(box, side)
    const distance = Math.hypot(point.x - anchor.x, point.y - anchor.y)

    if (!bestTarget || distance < bestTarget.distance) {
      bestTarget = {
        boxId: box.id,
        side,
        anchor,
        distance,
      }
    }
  })

  return bestTarget?.distance <= 120 ? bestTarget : null
}

function buildRelationPath(relation, boxesById) {
  const fromBox = boxesById[relation.from]
  const toBox = boxesById[relation.to]
  if (!fromBox || !toBox) {
    return null
  }

  const start = getAnchor(fromBox, relation.fromSide)
  const end = getAnchor(toBox, relation.toSide)
  const points = (relation.points ?? []).map(normalizePoint).filter(Boolean)

  if (relation.style === 'curved' && points.length === 0) {
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.hypot(dx, dy) || 1
    const normalX = -dy / length
    const normalY = dx / length
    const control = {
      x: midX + normalX * Number(relation.curvature ?? 0),
      y: midY + normalY * Number(relation.curvature ?? 0),
    }

    const labelPositionAt = (progress) => {
      const t = clamp(progress, 0, 1)
      const inv = 1 - t
      return {
        x: inv * inv * start.x + 2 * inv * t * control.x + t * t * end.x,
        y: inv * inv * start.y + 2 * inv * t * control.y + t * t * end.y,
      }
    }

    return {
      start,
      end,
      d: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
      labelPositionAt,
    }
  }

  const polyline = [start, ...points, end]
  const segmentLengths = []
  let totalLength = 0

  for (let index = 0; index < polyline.length - 1; index += 1) {
    const length = Math.hypot(polyline[index + 1].x - polyline[index].x, polyline[index + 1].y - polyline[index].y)
    segmentLengths.push(length)
    totalLength += length
  }

  return {
    start,
    end,
    d: polyline.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '),
    labelPositionAt(progress) {
      const t = clamp(progress, 0, 1)
      if (totalLength <= 0) {
        return start
      }

      let distance = totalLength * t
      for (let index = 0; index < segmentLengths.length; index += 1) {
        const segmentLength = segmentLengths[index]
        if (distance <= segmentLength || index === segmentLengths.length - 1) {
          const ratio = segmentLength > 0 ? distance / segmentLength : 0
          return {
            x: polyline[index].x + (polyline[index + 1].x - polyline[index].x) * ratio,
            y: polyline[index].y + (polyline[index + 1].y - polyline[index].y) * ratio,
          }
        }

        distance -= segmentLength
      }

      return end
    },
  }
}

function markerEnd(defsId, relation) {
  if (relation.marker === 'triangle') {
    return `url(#${defsId}-triangle)`
  }
  if (relation.marker === 'diamond') {
    return undefined
  }
  return `url(#${defsId}-arrow)`
}

function markerStart(defsId, relation) {
  if (relation.marker === 'diamond') {
    return `url(#${defsId}-diamond)`
  }
  return undefined
}

function exportFile(fileName, blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function TextAreaField({ label, value, onChange, placeholder }) {
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
  const svgRef = useRef(null)
  const dragStateRef = useRef(null)

  const viewBox = parseViewBox(draft.viewBox)
  const defsId = `uml-studio-${draft.id}`
  const boxesById = useMemo(() => Object.fromEntries(draft.classes.map((box) => [box.id, box])), [draft.classes])

  useEffect(() => {
    let ignore = false

    const restoreInitialDocument = async () => {
      const pendingLaunch = launchRequest ?? consumePendingUmlStudioLaunch()

      if (pendingLaunch?.kind === 'blank') {
        if (!ignore) {
          setDraft(createEmptyDocument())
          setSelectedItem(null)
          setUndoStack([])
          setNotice('Canvas UML vide initialise.')
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
          target: findAttachmentTarget(currentPoint, draft.classes),
        })
        return
      }

      if (dragState.kind === 'class-move' || dragState.kind === 'class-resize') {
        setDraft((currentDraft) => normalizeDocument({
          ...currentDraft,
          classes: currentDraft.classes.map((box) => {
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
    ? draft.classes.find((box) => box.id === selectedItem.id) ?? null
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
      classes: currentDraft.classes.map((box) => (box.id === selectedClass.id ? updater(box) : box)),
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
    const nextBox = createBox(draft.classes.length + 1)
    applyDraftChange((currentDraft) => ({
      ...currentDraft,
      classes: [...currentDraft.classes, nextBox],
    }))
    setSelectedItem({ type: 'class', id: nextBox.id })
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
    if (draft.classes.length < 2) {
      setNotice('Ajoute au moins deux boites avant de creer une relation.')
      return
    }

    const fromBox = selectedClass ?? draft.classes[0]
    const toBox = draft.classes.find((box) => box.id !== fromBox.id) ?? draft.classes[1]
    const relation = {
      id: `relation-${Date.now()}`,
      from: fromBox.id,
      to: toBox.id,
      label: 'depends',
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

  const previewSvgMarkup = isPreviewOpen ? buildExportSvg() : null

  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.94))] p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Studio UML</p>
            <h1 className="mt-3 text-4xl text-stone-950">Editeur UML utilisateur</h1>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <aside className="rounded-[30px] border border-black/10 bg-white/88 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Palette</p>
          <div className="mt-4 flex flex-col gap-3">
            <button className="rounded-2xl bg-stone-950 px-4 py-3 text-left text-sm font-semibold text-white" type="button" onClick={handleAddClass}>
              Ajouter une boite UML
            </button>
            <button className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-stone-800" type="button" onClick={handleAddRelation}>
              Ajouter une fleche / relation
            </button>
            <button className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-stone-800" type="button" onClick={handleAddText}>
              Ajouter une zone de texte
            </button>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-black/8 bg-white/70 px-4 py-3 text-sm text-stone-700">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-stone-900">Zone du diagramme</span>
                <label className="flex items-center gap-2">
                  <span>Largeur</span>
                  <input
                    className="w-24 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-900 outline-none"
                    type="number"
                    min="640"
                    step="80"
                    value={viewBox.width}
                    onChange={(event) => setDraft((currentDraft) => ({
                      ...currentDraft,
                      viewBox: buildViewBox(viewBox.minX, viewBox.minY, Number(event.target.value), viewBox.height),
                    }))}
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
                    onChange={(event) => setDraft((currentDraft) => ({
                      ...currentDraft,
                      viewBox: buildViewBox(viewBox.minX, viewBox.minY, viewBox.width, Number(event.target.value)),
                    }))}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-stone-800"
                    type="button"
                    onClick={() => setZoom((value) => clamp(Number((value - 0.1).toFixed(2)), 0.4, 2.5))}
                  >
                    -
                  </button>
                  <span className="min-w-16 text-center font-semibold text-stone-900">{Math.round(zoom * 100)}%</span>
                  <button
                    className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-stone-800"
                    type="button"
                    onClick={() => setZoom((value) => clamp(Number((value + 0.1).toFixed(2)), 0.4, 2.5))}
                  >
                    +
                  </button>
                  <button
                    className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-stone-800"
                    type="button"
                    onClick={() => setZoom(1)}
                  >
                    100%
                  </button>
                </div>
                <label className="flex items-center gap-3 text-sm font-semibold text-stone-800">
                  <input checked={showGrid} type="checkbox" onChange={(event) => setShowGrid(event.target.checked)} />
                  Afficher le quadrillage
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-dashed border-black/12 bg-[rgba(247,240,226,0.62)] p-4 text-sm leading-7 text-stone-700">
            Clique sur un element pour l editer. Les boites et annotations se deplacent par glisser-deposer, et le carre en bas a droite sert au redimensionnement.
          </div>
        </aside>

        <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.95))] p-4 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <div className="rounded-[28px] border border-black/10 bg-[#fffaf2] p-3">

            <div className="max-h-[72vh] overflow-auto rounded-[24px] border border-black/8 bg-[rgba(255,250,242,0.88)]">
            <svg
              ref={svgRef}
              className="block rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(231,198,167,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,235,220,0.92))]"
              viewBox={draft.viewBox}
              style={{ width: `${Math.round(viewBox.width * zoom)}px`, height: `${Math.round(viewBox.height * zoom)}px` }}
              preserveAspectRatio="xMinYMin meet"
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) {
                  setSelectedItem(null)
                }
              }}
            >
              <defs>
                <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
                </marker>
                <marker id={`${defsId}-triangle`} markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                  <path d="M 0 6 L 10 0 L 10 12 z" fill="#fff9ef" stroke="context-stroke" strokeWidth="1.2" />
                </marker>
                <marker id={`${defsId}-diamond`} markerWidth="12" markerHeight="12" refX="0" refY="6" orient="auto">
                  <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="#fff9ef" stroke="context-stroke" strokeWidth="1.2" />
                </marker>
                <pattern id={`${defsId}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(122,90,63,0.12)" strokeWidth="1" />
                </pattern>
              </defs>

              {showGrid ? (
                <rect
                  x={viewBox.minX}
                  y={viewBox.minY}
                  width={viewBox.width}
                  height={viewBox.height}
                  fill={`url(#${defsId}-grid)`}
                  pointerEvents="none"
                />
              ) : null}

              {draft.relations.map((relation) => {
                const pathData = buildRelationPath(relation, boxesById)
                if (!pathData) {
                  return null
                }

                const isActive = selectedRelation?.id === relation.id
                const labelPoint = pathData.labelPositionAt(relation.labelPosition ?? 0.5)

                return (
                  <g key={relation.id}>
                    <path
                      d={pathData.d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="18"
                      className="cursor-pointer"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        setSelectedItem({ type: 'relation', id: relation.id })
                      }}
                    />
                    <path
                      d={pathData.d}
                      fill="none"
                      stroke={relation.color}
                      strokeWidth={isActive ? '4' : '2.5'}
                      strokeDasharray={relation.dashed ? '10 8' : '0'}
                      markerEnd={markerEnd(defsId, relation)}
                      markerStart={markerStart(defsId, relation)}
                    />
                    <rect x={labelPoint.x - 56} y={labelPoint.y - 14} width="112" height="28" rx="14" fill="rgba(255,250,242,0.94)" stroke="rgba(36,31,24,0.08)" />
                    <text x={labelPoint.x} y={labelPoint.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.14em" fill={relation.color}>
                      {relation.label.toUpperCase()}
                    </text>
                    {isActive ? (
                      <>
                        <circle
                          cx={pathData.start.x}
                          cy={pathData.start.y}
                          r="10"
                          fill="#fffaf2"
                          stroke={relation.color}
                          strokeWidth="3"
                          className="cursor-grab"
                          data-editor-only="true"
                          onPointerDown={(event) => {
                            event.stopPropagation()
                            const startPoint = getSvgPoint(event)
                            if (!startPoint) return
                            dragStateRef.current = {
                              kind: 'attach-endpoint',
                              id: relation.id,
                              endpoint: 'from',
                              startPoint,
                              originDraft: cloneDocument(draft),
                            }
                            setAttachPreview({
                              relationId: relation.id,
                              endpoint: 'from',
                              pointer: startPoint,
                              target: findAttachmentTarget(startPoint, draft.classes),
                            })
                          }}
                        />
                        <circle
                          cx={pathData.end.x}
                          cy={pathData.end.y}
                          r="10"
                          fill="#fffaf2"
                          stroke={relation.color}
                          strokeWidth="3"
                          className="cursor-grab"
                          data-editor-only="true"
                          onPointerDown={(event) => {
                            event.stopPropagation()
                            const startPoint = getSvgPoint(event)
                            if (!startPoint) return
                            dragStateRef.current = {
                              kind: 'attach-endpoint',
                              id: relation.id,
                              endpoint: 'to',
                              startPoint,
                              originDraft: cloneDocument(draft),
                            }
                            setAttachPreview({
                              relationId: relation.id,
                              endpoint: 'to',
                              pointer: startPoint,
                              target: findAttachmentTarget(startPoint, draft.classes),
                            })
                          }}
                        />
                      </>
                    ) : null}
                  </g>
                )
              })}

              {draft.classes.map((box) => {
                const isActive = selectedClass?.id === box.id
                const attributesStartY = CLASS_HEADER_HEIGHT + 14
                const methodsStartY = CLASS_HEADER_HEIGHT + box.attributesHeight + 14
                const methodsDividerY = CLASS_HEADER_HEIGHT + box.attributesHeight

                return (
                  <g
                    key={box.id}
                    transform={`translate(${box.x} ${box.y})`}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      setSelectedItem({ type: 'class', id: box.id })
                    }}
                  >
                    <rect
                      width={box.width}
                      height={box.height}
                      rx="18"
                      fill={box.fillColor}
                      stroke={box.borderColor}
                      strokeWidth={isActive ? '3.2' : '2.4'}
                      className="cursor-move"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        const startPoint = getSvgPoint(event)
                        if (!startPoint) return
                        dragStateRef.current = { kind: 'class-move', id: box.id, startPoint, startItem: box, originDraft: cloneDocument(draft) }
                        setSelectedItem({ type: 'class', id: box.id })
                      }}
                    />
                    <text x={box.width / 2} y="20" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={box.textColor} pointerEvents="none">
                      {`<<${box.stereotype}>>`}
                    </text>
                    <text x={box.width / 2} y="46" textAnchor="middle" fontSize="18" fontWeight="700" fill={box.textColor} pointerEvents="none">
                      {box.title}
                    </text>
                    <line
                      x1="12"
                      y1={CLASS_HEADER_HEIGHT}
                      x2={box.width - 12}
                      y2={CLASS_HEADER_HEIGHT}
                      stroke={box.borderColor}
                      strokeOpacity="0.45"
                      strokeWidth="1.4"
                      pointerEvents="none"
                    />
                    <line
                      x1="12"
                      y1={methodsDividerY}
                      x2={box.width - 12}
                      y2={methodsDividerY}
                      stroke={box.borderColor}
                      strokeOpacity="0.35"
                      strokeWidth="1.2"
                      pointerEvents="none"
                    />
                    {box.fields.slice(0, 4).map((line, index) => (
                      <text key={`${box.id}-field-${index}`} x="18" y={attributesStartY + index * 18} fontSize="12" fill={box.textColor} pointerEvents="none">
                        {line}
                      </text>
                    ))}
                    {box.methods.slice(0, 4).map((line, index) => (
                      <text key={`${box.id}-method-${index}`} x="18" y={Math.min(box.height - 18, methodsStartY + index * 18)} fontSize="12" fill={box.textColor} pointerEvents="none">
                        {line}
                      </text>
                    ))}
                    <rect
                      x={box.width - 14}
                      y={box.height - 14}
                      width="14"
                      height="14"
                      rx="4"
                      fill={box.borderColor}
                      className="cursor-se-resize"
                      data-editor-only="true"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        const startPoint = getSvgPoint(event)
                        if (!startPoint) return
                        dragStateRef.current = { kind: 'class-resize', id: box.id, startPoint, startItem: box, originDraft: cloneDocument(draft) }
                        setSelectedItem({ type: 'class', id: box.id })
                      }}
                    />
                  </g>
                )
              })}

              {draft.texts.map((text) => {
                const isActive = selectedText?.id === text.id

                return (
                  <g
                    key={text.id}
                    transform={`translate(${text.x} ${text.y})`}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      setSelectedItem({ type: 'text', id: text.id })
                    }}
                  >
                    <rect
                      width={text.width}
                      height={text.height}
                      rx="18"
                      fill={text.fillColor}
                      stroke={text.borderColor}
                      strokeWidth={isActive ? '3' : '2'}
                      strokeDasharray="8 7"
                      className="cursor-move"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        const startPoint = getSvgPoint(event)
                        if (!startPoint) return
                        dragStateRef.current = { kind: 'text-move', id: text.id, startPoint, startItem: text, originDraft: cloneDocument(draft) }
                        setSelectedItem({ type: 'text', id: text.id })
                      }}
                    />
                    {text.text.split('\n').slice(0, 4).map((line, index) => (
                      <text key={`${text.id}-${index}`} x="18" y={28 + index * (text.fontSize + 4)} fontSize={text.fontSize} fill={text.textColor} pointerEvents="none">
                        {line}
                      </text>
                    ))}
                    <rect
                      x={text.width - 14}
                      y={text.height - 14}
                      width="14"
                      height="14"
                      rx="4"
                      fill={text.borderColor}
                      className="cursor-se-resize"
                      data-editor-only="true"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        const startPoint = getSvgPoint(event)
                        if (!startPoint) return
                        dragStateRef.current = { kind: 'text-resize', id: text.id, startPoint, startItem: text, originDraft: cloneDocument(draft) }
                        setSelectedItem({ type: 'text', id: text.id })
                      }}
                    />
                  </g>
                )
              })}

              {attachPreview?.pointer ? (
                <>
                  <circle
                    cx={attachPreview.pointer.x}
                    cy={attachPreview.pointer.y}
                    r="8"
                    fill="rgba(194,87,55,0.18)"
                    stroke="#c25737"
                    strokeWidth="2"
                    pointerEvents="none"
                    data-editor-only="true"
                  />
                  {attachPreview.target ? (
                    <circle
                      cx={attachPreview.target.anchor.x}
                      cy={attachPreview.target.anchor.y}
                      r="12"
                      fill="rgba(194,87,55,0.12)"
                      stroke="#c25737"
                      strokeWidth="3"
                      pointerEvents="none"
                      data-editor-only="true"
                    />
                  ) : null}
                </>
              ) : null}
            </svg>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-[30px] border border-black/10 bg-white/88 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Actions</p>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Nom du diagramme</span>
              <input
                className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                value={draft.name}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, name: event.target.value }))}
              />
            </label>
            <div className="mt-4 grid gap-3">
              <button className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800" type="button" onClick={handleUndo}>
                Annuler la derniere action
              </button>
              <button
                className="rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                type="button"
                onClick={handleSave}
                disabled={savePending}
              >
                {savePending ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => setIsPreviewOpen(true)}>
                Apercu
              </button>
              <button className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800" type="button" onClick={handleExportSvg}>
                Exporter en SVG
              </button>
              <button className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800" type="button" onClick={handleExportPng}>
                Exporter en PNG
              </button>
            </div>
          </section>

          <section className="rounded-[30px] border border-black/10 bg-white/88 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Inspecteur</p>

            {selectedClass ? (
              <div className="mt-4 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Titre</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedClass.title} onChange={(event) => updateSelectedClass((box) => ({ ...box, title: event.target.value }))} />
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Stereotype</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedClass.stereotype} onChange={(event) => updateSelectedClass((box) => ({ ...box, stereotype: event.target.value }))} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['x', 'y', 'width', 'height'].map((field) => (
                    <label key={field} className="flex flex-col gap-2 text-sm text-stone-700">
                      <span className="font-semibold capitalize text-stone-900">{field}</span>
                      <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={selectedClass[field]} onChange={(event) => updateSelectedClass((box) => ({ ...box, [field]: Number(event.target.value) }))} />
                    </label>
                  ))}
                </div>
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
                <TextAreaField label="Attributs" value={selectedClass.fields} placeholder="+ field: Type" onChange={(fields) => updateSelectedClass((box) => ({ ...box, fields }))} />
                <TextAreaField label="Methodes" value={selectedClass.methods} placeholder="+ operation(): void" onChange={(methods) => updateSelectedClass((box) => ({ ...box, methods }))} />
              </div>
            ) : null}

            {selectedRelation ? (
              <div className="mt-4 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Etiquette</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedRelation.label} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, label: event.target.value }))} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">De</span>
                    <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedRelation.from} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, from: event.target.value }))}>
                      {draft.classes.map((box) => <option key={box.id} value={box.id}>{box.title}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Vers</span>
                    <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedRelation.to} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, to: event.target.value }))}>
                      {draft.classes.map((box) => <option key={box.id} value={box.id}>{box.title}</option>)}
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
                <label className="flex items-center gap-3 text-sm text-stone-700">
                  <input checked={selectedRelation.dashed} type="checkbox" onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, dashed: event.target.checked }))} />
                  Trait pointille
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Couleur de la fleche</span>
                  <input className="h-11 w-full rounded-2xl border border-black/10 bg-white p-1" type="color" value={selectedRelation.color} onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, color: event.target.value }))} />
                </label>
              </div>
            ) : null}

            {selectedText ? (
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
              </div>
            ) : null}

            {!selectedClass && !selectedRelation && !selectedText ? (
              <p className="mt-4 text-sm leading-7 text-stone-700">
                Selectionne une boite, une fleche ou une zone de texte pour afficher ses proprietes.
              </p>
            ) : null}
          </section>
        </aside>
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
