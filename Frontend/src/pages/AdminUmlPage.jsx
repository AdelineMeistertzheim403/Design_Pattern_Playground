import { useEffect, useMemo, useRef, useState } from 'react'
import UmlDiagram from '../components/UmlDiagram'
import {
  getPatternUml,
  listAdminUmlDiagrams,
  saveAdminUmlDiagram,
} from '../lib/api'
import { loadPatternUmlDiagram } from '../patterns/loaders'

const DEFAULT_VIEW_BOX = '0 0 1440 960'
const BOX_DEFAULTS = {
  width: 220,
  height: 132,
}
const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left']

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function slugify(value) {
  return `${value ?? ''}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseViewBox(viewBox) {
  const parts = `${viewBox ?? DEFAULT_VIEW_BOX}`.split(/\s+/).map(Number)
  if (parts.length === 4 && parts.every(Number.isFinite)) {
    return {
      minX: parts[0],
      minY: parts[1],
      width: parts[2],
      height: parts[3],
    }
  }

  return { minX: 0, minY: 0, width: 1440, height: 960 }
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => `${item ?? ''}`).filter(Boolean)
  }

  return []
}

function normalizePoint(point) {
  const x = Number(point?.x)
  const y = Number(point?.y)

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }

  return { x, y }
}

function normalizeDiagram(diagram) {
  const safeDiagram = diagram && typeof diagram === 'object' ? diagram : {}
  const sourceClasses = Array.isArray(safeDiagram.classes) ? safeDiagram.classes : []

  return {
    layout: 'absolute',
    viewBox: safeDiagram.viewBox ?? DEFAULT_VIEW_BOX,
    classes: sourceClasses.map((box, index) => ({
      id: box?.id ?? `class-${index + 1}`,
      title: box?.title ?? `Class${index + 1}`,
      stereotype: box?.stereotype ?? 'Component',
      fields: normalizeList(box?.fields),
      methods: normalizeList(box?.methods),
      x: Number.isFinite(Number(box?.x)) ? Number(box.x) : 120 + index * 260,
      y: Number.isFinite(Number(box?.y)) ? Number(box.y) : 120,
      width: Number.isFinite(Number(box?.width)) ? Number(box.width) : BOX_DEFAULTS.width,
      height: Number.isFinite(Number(box?.height)) ? Number(box.height) : BOX_DEFAULTS.height,
      tone: box?.tone ?? 'sand',
    })),
    relations: (Array.isArray(safeDiagram.relations) ? safeDiagram.relations : []).map((relation, index) => ({
      from: relation?.from ?? '',
      to: relation?.to ?? '',
      label: relation?.label ?? `relation-${index + 1}`,
      marker: relation?.marker ?? 'arrow',
      dashed: relation?.dashed === true,
      fromSide: SIDE_OPTIONS.includes(relation?.fromSide) ? relation.fromSide : 'right',
      toSide: SIDE_OPTIONS.includes(relation?.toSide) ? relation.toSide : 'left',
      style: relation?.style === 'curved' ? 'curved' : 'straight',
      curvature: Number.isFinite(Number(relation?.curvature)) ? Number(relation.curvature) : 0,
      points: (Array.isArray(relation?.points) ? relation.points : []).map(normalizePoint).filter(Boolean),
      labelPosition: Number.isFinite(Number(relation?.labelPosition))
        ? clamp(Number(relation.labelPosition), 0, 1)
        : 0.5,
    })),
  }
}

function createEmptyDiagram() {
  return normalizeDiagram({
    layout: 'absolute',
    viewBox: DEFAULT_VIEW_BOX,
    classes: [],
    relations: [],
  })
}

function createDefaultBox(index) {
  return {
    id: `class-${Date.now()}-${index}`,
    title: `Classe${index}`,
    stereotype: 'Component',
    fields: [],
    methods: ['+ operation(): void'],
    x: 120 + index * 40,
    y: 120 + index * 28,
    width: BOX_DEFAULTS.width,
    height: BOX_DEFAULTS.height,
    tone: 'sand',
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

function getLabelPosition(pathData) {
  if (pathData.labelPositionAt) {
    return pathData.labelPositionAt(pathData.defaultLabelPosition ?? 0.5)
  }

  if (pathData.points?.length) {
    const midPoint = pathData.points[Math.floor(pathData.points.length / 2)]
    return { x: midPoint.x, y: midPoint.y }
  }

  return { x: 0, y: 0 }
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
    const curvature = Number(relation.curvature ?? 0)
    const control = {
      x: midX + normalX * curvature,
      y: midY + normalY * curvature,
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
      control,
      labelPositionAt,
      defaultLabelPosition: relation.labelPosition ?? 0.5,
      isCurved: true,
    }
  }

  const polyline = [start, ...points, end]
  const segmentLengths = []
  let totalLength = 0

  for (let index = 0; index < polyline.length - 1; index += 1) {
    const current = polyline[index]
    const next = polyline[index + 1]
    const length = Math.hypot(next.x - current.x, next.y - current.y)
    segmentLengths.push(length)
    totalLength += length
  }

  const labelPositionAt = (progress) => {
    const t = clamp(progress, 0, 1)
    if (totalLength <= 0) {
      return start
    }

    let distance = totalLength * t
    for (let index = 0; index < segmentLengths.length; index += 1) {
      const segmentLength = segmentLengths[index]
      const current = polyline[index]
      const next = polyline[index + 1]

      if (distance <= segmentLength || index === segmentLengths.length - 1) {
        const ratio = segmentLength > 0 ? distance / segmentLength : 0
        return {
          x: current.x + (next.x - current.x) * ratio,
          y: current.y + (next.y - current.y) * ratio,
        }
      }

      distance -= segmentLength
    }

    return end
  }

  return {
    start,
    end,
    d: polyline.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '),
    points: polyline,
    labelPositionAt,
    defaultLabelPosition: relation.labelPosition ?? 0.5,
    isCurved: false,
  }
}

function projectPointOnSegment(point, start, end) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared <= 0) {
    return { x: start.x, y: start.y, t: 0, distance: Math.hypot(point.x - start.x, point.y - start.y) }
  }

  const rawT = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared
  const t = clamp(rawT, 0, 1)
  const projection = {
    x: start.x + dx * t,
    y: start.y + dy * t,
  }

  return {
    ...projection,
    t,
    distance: Math.hypot(point.x - projection.x, point.y - projection.y),
  }
}

function getLabelProgressForPoint(pathData, point) {
  if (pathData.isCurved) {
    let best = null

    for (let index = 0; index <= 80; index += 1) {
      const progress = index / 80
      const candidate = pathData.labelPositionAt(progress)
      const distance = Math.hypot(point.x - candidate.x, point.y - candidate.y)

      if (!best || distance < best.distance) {
        best = { progress, distance }
      }
    }

    return best?.progress ?? 0.5
  }

  const points = pathData.points ?? []
  if (points.length < 2) {
    return 0.5
  }

  const segmentLengths = []
  let totalLength = 0

  for (let index = 0; index < points.length - 1; index += 1) {
    const length = Math.hypot(points[index + 1].x - points[index].x, points[index + 1].y - points[index].y)
    segmentLengths.push(length)
    totalLength += length
  }

  if (totalLength <= 0) {
    return 0.5
  }

  let best = null
  let traversed = 0

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index]
    const end = points[index + 1]
    const projection = projectPointOnSegment(point, start, end)
    const segmentLength = segmentLengths[index]
    const progress = (traversed + segmentLength * projection.t) / totalLength

    if (!best || projection.distance < best.distance) {
      best = { progress, distance: projection.distance }
    }

    traversed += segmentLength
  }

  return best?.progress ?? 0.5
}

function relationMarkerEnd(defsId, relation) {
  if (relation.marker === 'triangle') {
    return `url(#${defsId}-triangle)`
  }

  if (relation.marker === 'diamond') {
    return undefined
  }

  return `url(#${defsId}-arrow)`
}

function relationMarkerStart(defsId, relation) {
  if (relation.marker === 'diamond') {
    return `url(#${defsId}-diamond)`
  }

  return undefined
}

function TextAreaListField({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-stone-700">
      <span className="font-semibold text-stone-900">{label}</span>
      <textarea
        className="min-h-24 rounded-2xl border border-black/10 bg-white px-3 py-3 font-mono text-xs text-stone-800 outline-none transition focus:border-stone-400"
        placeholder={placeholder}
        value={value.join('\n')}
        onChange={(event) => onChange(event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))}
      />
    </label>
  )
}

export default function AdminUmlPage({
  backendStatus,
  currentUser,
  patterns,
  onNavigateHome,
}) {
  const [storedDiagrams, setStoredDiagrams] = useState([])
  const [selectedCode, setSelectedCode] = useState('')
  const [diagramName, setDiagramName] = useState('')
  const [draft, setDraft] = useState(createEmptyDiagram)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedRelationIndex, setSelectedRelationIndex] = useState(-1)
  const [savePending, setSavePending] = useState(false)
  const [loadPending, setLoadPending] = useState(false)
  const [notice, setNotice] = useState('')
  const [newDiagramCode, setNewDiagramCode] = useState('')
  const [newDiagramName, setNewDiagramName] = useState('')
  const [attachPreview, setAttachPreview] = useState(null)
  const svgRef = useRef(null)
  const dragStateRef = useRef(null)

  const isAdmin = currentUser?.role === 'ADMIN'
  const viewBox = parseViewBox(draft.viewBox)
  const defsId = `admin-uml-${selectedCode || 'draft'}`
  const boxesById = useMemo(
    () => Object.fromEntries(draft.classes.map((box) => [box.id, box])),
    [draft.classes],
  )

  const diagramOptions = useMemo(() => {
    const fromPatterns = patterns.map((pattern) => ({
      code: pattern.code,
      name: pattern.name,
      source: 'pattern',
    }))
    const customOnly = storedDiagrams
      .filter((item) => !fromPatterns.some((pattern) => pattern.code === item.code))
      .map((item) => ({
        code: item.code,
        name: item.name,
        source: 'custom',
      }))

    const combined = [...fromPatterns, ...customOnly]
    if (selectedCode && !combined.some((item) => item.code === selectedCode)) {
      combined.push({
        code: selectedCode,
        name: diagramName || selectedCode,
        source: 'draft',
      })
    }

    return combined
      .sort((left, right) => left.name.localeCompare(right.name, 'fr'))
  }, [diagramName, patterns, selectedCode, storedDiagrams])

  const getSvgPoint = (event) => {
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
    if (!isAdmin || backendStatus !== 'connected') {
      return
    }

    let ignore = false

    const loadAdminIndex = async () => {
      try {
        const items = await listAdminUmlDiagrams()
        if (!ignore) {
          setStoredDiagrams(items ?? [])
          setSelectedCode((currentCode) => currentCode || patterns[0]?.code || items[0]?.code || '')
        }
      } catch (error) {
        if (!ignore) {
          setNotice(error.message)
        }
      }
    }

    loadAdminIndex()
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

    const loadSelectedDiagram = async () => {
      try {
        const stored = await getPatternUml(selectedCode)
        if (ignore) {
          return
        }

        if (stored?.diagram) {
          setDraft(normalizeDiagram(stored.diagram))
          setDiagramName(stored.name ?? selectedCode)
          setSelectedClassId(stored.diagram?.classes?.[0]?.id ?? '')
          setSelectedRelationIndex(-1)
          return
        }
      } catch {
        // Fallback on local diagrams for built-in patterns.
      }

      const localDiagram = await loadPatternUmlDiagram(selectedCode)
      if (ignore) {
        return
      }

      const option = diagramOptions.find((item) => item.code === selectedCode)
      setDraft(localDiagram ? normalizeDiagram(localDiagram) : createEmptyDiagram())
      setDiagramName((currentName) => option?.name ?? currentName ?? selectedCode)
      setSelectedClassId(localDiagram?.classes?.[0]?.id ?? '')
      setSelectedRelationIndex(-1)
    }

    loadSelectedDiagram()
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
  }, [backendStatus, diagramOptions, isAdmin, selectedCode])

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

      if (dragState.mode === 'attach-endpoint') {
        setAttachPreview({
          endpoint: dragState.endpoint,
          relationIndex: dragState.relationIndex,
          pointer: currentPoint,
          target: findAttachmentTarget(currentPoint, draft.classes),
        })
        return
      }

      if (dragState.mode === 'move-label') {
        const relation = draft.relations[dragState.relationIndex]
        if (!relation) {
          return
        }

        const pathData = buildRelationPath(relation, boxesById)
        if (!pathData) {
          return
        }

        const labelPosition = getLabelProgressForPoint(pathData, currentPoint)
        setDraft((currentDraft) => ({
          ...currentDraft,
          relations: currentDraft.relations.map((currentRelation, index) => (
            index === dragState.relationIndex
              ? { ...currentRelation, labelPosition }
              : currentRelation
          )),
        }))
        return
      }

      setDraft((currentDraft) => ({
        ...currentDraft,
        classes: currentDraft.classes.map((box) => {
          if (box.id !== dragState.classId) {
            return box
          }

          if (dragState.mode === 'move') {
            return {
              ...box,
              x: Math.round(dragState.startBox.x + (currentPoint.x - dragState.startPoint.x)),
              y: Math.round(dragState.startBox.y + (currentPoint.y - dragState.startPoint.y)),
            }
          }

          return {
            ...box,
            width: Math.max(120, Math.round(dragState.startBox.width + (currentPoint.x - dragState.startPoint.x))),
            height: Math.max(90, Math.round(dragState.startBox.height + (currentPoint.y - dragState.startPoint.y))),
          }
        }),
      }))
    }

    const handlePointerUp = () => {
      const dragState = dragStateRef.current
      if (dragState?.mode === 'attach-endpoint' && attachPreview?.target) {
        setDraft((currentDraft) => ({
          ...currentDraft,
          relations: currentDraft.relations.map((relation, index) => {
            if (index !== dragState.relationIndex) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachPreview, boxesById, draft.classes, draft.relations, viewBox.height, viewBox.minX, viewBox.minY, viewBox.width])

  if (!currentUser) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-black/10 bg-white/85 p-8 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Admin</p>
          <h1 className="mt-3 text-4xl text-stone-950">Edition UML reservee</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">
            Cette page necessite une session authentifiee avec un compte admin.
          </p>
          <button
            className="mt-6 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
            type="button"
            onClick={onNavigateHome}
          >
            Retour a l accueil
          </button>
        </section>
      </div>
    )
  }

  if (!isAdmin || backendStatus !== 'connected') {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-black/10 bg-white/85 p-8 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Admin</p>
          <h1 className="mt-3 text-4xl text-stone-950">Mode Admin UML indisponible</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">
            {isAdmin
              ? 'Le backend doit etre actif pour charger et enregistrer les diagrammes UML.'
              : 'Le compte courant n a pas le role ADMIN.'}
          </p>
        </section>
      </div>
    )
  }

  if (currentUser.forcePasswordChange) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-amber-200 bg-amber-50 p-8 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Admin</p>
          <h1 className="mt-3 text-4xl text-stone-950">Changement de mot de passe requis</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">
            Le compte admin par defaut doit d abord changer son mot de passe initial depuis la fenetre Compte.
          </p>
        </section>
      </div>
    )
  }

  const selectedClass = draft.classes.find((box) => box.id === selectedClassId) ?? null
  const selectedRelation = draft.relations[selectedRelationIndex] ?? null

  const updateSelectedClass = (updater) => {
    if (!selectedClass) {
      return
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      classes: currentDraft.classes.map((box) => (
        box.id === selectedClass.id ? updater(box) : box
      )),
    }))
  }

  const updateSelectedRelation = (updater) => {
    if (!selectedRelation) {
      return
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      relations: currentDraft.relations.map((relation, index) => (
        index === selectedRelationIndex ? updater(relation) : relation
      )),
    }))
  }

  const handleCreateDiagram = () => {
    const code = slugify(newDiagramCode)
    const name = newDiagramName.trim()
    if (!code || !name) {
      setNotice('Renseigne un code et un nom pour creer un diagramme.')
      return
    }

    setSelectedCode(code)
    setDiagramName(name)
    setDraft(createEmptyDiagram())
    setSelectedClassId('')
    setSelectedRelationIndex(-1)
    setNotice('Nouveau diagramme initialise. Tu peux maintenant l editer puis le sauvegarder.')
  }

  const handleAddClass = () => {
    const nextBox = createDefaultBox(draft.classes.length + 1)
    setDraft((currentDraft) => ({
      ...currentDraft,
      classes: [...currentDraft.classes, nextBox],
    }))
    setSelectedClassId(nextBox.id)
    setSelectedRelationIndex(-1)
  }

  const handleDeleteClass = () => {
    if (!selectedClass) {
      return
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      classes: currentDraft.classes.filter((box) => box.id !== selectedClass.id),
      relations: currentDraft.relations.filter((relation) => relation.from !== selectedClass.id && relation.to !== selectedClass.id),
    }))
    setSelectedClassId('')
    setSelectedRelationIndex(-1)
  }

  const handleAddRelation = () => {
    if (draft.classes.length < 2) {
      setNotice('Ajoute au moins deux boites avant de creer une relation.')
      return
    }

    const relation = {
      from: draft.classes[0].id,
      to: draft.classes[1].id,
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

    setDraft((currentDraft) => ({
      ...currentDraft,
      relations: [...currentDraft.relations, relation],
    }))
    setSelectedRelationIndex(draft.relations.length)
    setSelectedClassId('')
  }

  const handleDeleteRelation = () => {
    if (selectedRelationIndex < 0) {
      return
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      relations: currentDraft.relations.filter((_, index) => index !== selectedRelationIndex),
    }))
    setSelectedRelationIndex(-1)
  }

  const handleSave = async () => {
    if (!selectedCode) {
      setNotice('Choisis un diagramme ou cree un nouveau code avant de sauvegarder.')
      return
    }

    setSavePending(true)
    setNotice('')

    try {
      const payload = {
        code: selectedCode,
        name: diagramName.trim() || selectedCode,
        diagram: {
          ...draft,
          layout: 'absolute',
        },
      }

      const saved = await saveAdminUmlDiagram(selectedCode, payload)
      const freshIndex = await listAdminUmlDiagrams()
      setStoredDiagrams(freshIndex ?? [])
      setDraft(normalizeDiagram(saved.diagram))
      setDiagramName(saved.name)
      setNotice(`Diagramme enregistre par ${saved.updatedBy}.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setSavePending(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.92))] p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Admin UML</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl text-stone-950">Editeur de diagrammes UML SVG</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
              Cree des diagrammes, modifie les boites, deplace-les dans le canvas, redimensionne-les, regle les fleches et sauvegarde le JSON en base.
            </p>
          </div>
          <button
            className="rounded-full border border-black/10 bg-white/90 px-5 py-3 text-sm font-semibold text-stone-900"
            type="button"
            onClick={handleSave}
          >
            {savePending ? 'Enregistrement...' : 'Sauvegarder en base'}
          </button>
        </div>
        {notice ? (
          <p className="mt-4 rounded-2xl border border-black/8 bg-white/80 px-4 py-3 text-sm text-stone-700">{notice}</p>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
        <aside className="flex flex-col gap-6">
          <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Source</p>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Diagramme a editer</span>
              <select
                className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                value={selectedCode}
                onChange={(event) => setSelectedCode(event.target.value)}
              >
                <option value="">Choisir un diagramme</option>
                {diagramOptions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Nom du diagramme</span>
              <input
                className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                value={diagramName}
                onChange={(event) => setDiagramName(event.target.value)}
              />
            </label>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">ViewBox</span>
              <input
                className="rounded-2xl border border-black/10 bg-white px-3 py-3 font-mono text-sm text-stone-900 outline-none"
                value={draft.viewBox}
                onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, viewBox: event.target.value }))}
              />
            </label>
            {loadPending ? <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">Chargement...</p> : null}
          </section>

          <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Nouveau</p>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Code</span>
              <input
                className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                placeholder="mon-nouveau-diagramme"
                value={newDiagramCode}
                onChange={(event) => setNewDiagramCode(event.target.value)}
              />
            </label>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Nom</span>
              <input
                className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                placeholder="Nouveau diagramme"
                value={newDiagramName}
                onChange={(event) => setNewDiagramName(event.target.value)}
              />
            </label>
            <button
              className="mt-4 rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white"
              type="button"
              onClick={handleCreateDiagram}
            >
              Creer un brouillon
            </button>
          </section>

          <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Boites</p>
              <button
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700"
                type="button"
                onClick={handleAddClass}
              >
                Ajouter
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {draft.classes.map((box) => (
                <button
                  key={box.id}
                  className={`rounded-2xl border px-3 py-3 text-left text-sm transition ${
                    box.id === selectedClassId
                      ? 'border-stone-950 bg-stone-950 text-white'
                      : 'border-black/10 bg-white text-stone-800'
                  }`}
                  type="button"
                  onClick={() => {
                    setSelectedClassId(box.id)
                    setSelectedRelationIndex(-1)
                  }}
                >
                  {box.title}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Relations</p>
              <button
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700"
                type="button"
                onClick={handleAddRelation}
              >
                Ajouter
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {draft.relations.map((relation, index) => (
                <button
                  key={`${relation.from}-${relation.to}-${index}`}
                  className={`rounded-2xl border px-3 py-3 text-left text-sm transition ${
                    index === selectedRelationIndex
                      ? 'border-stone-950 bg-stone-950 text-white'
                      : 'border-black/10 bg-white text-stone-800'
                  }`}
                  type="button"
                  onClick={() => {
                    setSelectedRelationIndex(index)
                    setSelectedClassId('')
                  }}
                >
                  {relation.from} {'->'} {relation.to}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.94))] p-4 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <div className="rounded-[28px] border border-black/10 bg-[#fffaf2] p-3">
            <svg
              ref={svgRef}
              className="h-auto w-full rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(231,198,167,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,235,220,0.92))]"
              viewBox={draft.viewBox}
              onPointerDown={(event) => {
                if (event.target !== event.currentTarget) {
                  return
                }

                setSelectedClassId('')
                setSelectedRelationIndex(-1)
              }}
            >
              <defs>
                <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f" />
                </marker>
                <marker id={`${defsId}-triangle`} markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                  <path d="M 0 6 L 10 0 L 10 12 z" fill="#fff9ef" stroke="#7a5a3f" strokeWidth="1.2" />
                </marker>
                <marker id={`${defsId}-diamond`} markerWidth="12" markerHeight="12" refX="0" refY="6" orient="auto">
                  <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="#fff9ef" stroke="#7a5a3f" strokeWidth="1.2" />
                </marker>
              </defs>

              {draft.relations.map((relation, index) => {
                const pathData = buildRelationPath(relation, boxesById)
                if (!pathData) {
                  return null
                }

                const labelPosition = pathData.labelPositionAt
                  ? pathData.labelPositionAt(relation.labelPosition ?? pathData.defaultLabelPosition ?? 0.5)
                  : getLabelPosition(pathData)
                const isActive = index === selectedRelationIndex

                return (
                  <g key={`${relation.from}-${relation.to}-${index}`}>
                    <path
                      d={pathData.d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="20"
                      className="cursor-pointer"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        setSelectedRelationIndex(index)
                        setSelectedClassId('')
                      }}
                    />
                    <path
                      d={pathData.d}
                      fill="none"
                      stroke={isActive ? '#c25737' : '#7a5a3f'}
                      strokeWidth={isActive ? '4' : '2.4'}
                      strokeDasharray={relation.dashed ? '10 8' : '0'}
                      markerEnd={relationMarkerEnd(defsId, relation)}
                      markerStart={relationMarkerStart(defsId, relation)}
                      className="cursor-pointer"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        setSelectedRelationIndex(index)
                        setSelectedClassId('')
                      }}
                    />
                    <rect
                      x={labelPosition.x - 54}
                      y={labelPosition.y - 14}
                      width="108"
                      height="28"
                      rx="14"
                      fill="rgba(255,250,242,0.94)"
                      stroke="rgba(36,31,24,0.08)"
                      className="cursor-grab"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        setSelectedRelationIndex(index)
                        setSelectedClassId('')
                        dragStateRef.current = {
                          mode: 'move-label',
                          relationIndex: index,
                        }
                      }}
                    />
                    <text
                      x={labelPosition.x}
                      y={labelPosition.y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      letterSpacing="0.14em"
                      fill={isActive ? '#c25737' : '#6a5544'}
                      className="cursor-grab select-none"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        setSelectedRelationIndex(index)
                        setSelectedClassId('')
                        dragStateRef.current = {
                          mode: 'move-label',
                          relationIndex: index,
                        }
                      }}
                    >
                      {relation.label.toUpperCase()}
                    </text>
                    {isActive ? (
                      <>
                        <circle
                          cx={pathData.start.x}
                          cy={pathData.start.y}
                          r="10"
                          fill="#fffaf2"
                          stroke="#c25737"
                          strokeWidth="3"
                          className="cursor-grab"
                          onPointerDown={(event) => {
                            event.stopPropagation()
                            const startPoint = getSvgPoint(event)
                            if (!startPoint) {
                              return
                            }
                            dragStateRef.current = {
                              mode: 'attach-endpoint',
                              relationIndex: index,
                              endpoint: 'from',
                              startPoint,
                            }
                            setAttachPreview({
                              relationIndex: index,
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
                          stroke="#c25737"
                          strokeWidth="3"
                          className="cursor-grab"
                          onPointerDown={(event) => {
                            event.stopPropagation()
                            const startPoint = getSvgPoint(event)
                            if (!startPoint) {
                              return
                            }
                            dragStateRef.current = {
                              mode: 'attach-endpoint',
                              relationIndex: index,
                              endpoint: 'to',
                              startPoint,
                            }
                            setAttachPreview({
                              relationIndex: index,
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
                const isActive = box.id === selectedClassId

                return (
                  <g
                    key={box.id}
                    transform={`translate(${box.x} ${box.y})`}
                    className="cursor-pointer"
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      setSelectedClassId(box.id)
                      setSelectedRelationIndex(-1)
                    }}
                  >
                    <rect
                      width={box.width}
                      height={box.height}
                      rx="18"
                      fill={isActive ? 'rgba(231,198,167,0.92)' : 'rgba(255,249,239,0.98)'}
                      stroke={isActive ? '#c25737' : '#7a5a3f'}
                      strokeWidth={isActive ? '3.2' : '2.4'}
                      className="cursor-move"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        const startPoint = getSvgPoint(event)
                        if (!startPoint) {
                          return
                        }
                        dragStateRef.current = {
                          mode: 'move',
                          classId: box.id,
                          startPoint,
                          startBox: box,
                        }
                        setSelectedClassId(box.id)
                        setSelectedRelationIndex(-1)
                      }}
                    />
                    <text x={box.width / 2} y="20" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6a5544">
                      {`<<${box.stereotype}>>`}
                    </text>
                    <text x={box.width / 2} y="46" textAnchor="middle" fontSize="18" fontWeight="700" fill="#3d2d20">
                      {box.title}
                    </text>
                    {box.fields.slice(0, 4).map((line, index) => (
                      <text key={`${box.id}-field-${index}`} x="18" y={72 + index * 18} fontSize="12" fill="#4d3827">
                        {line}
                      </text>
                    ))}
                    {box.methods.slice(0, 4).map((line, index) => (
                      <text key={`${box.id}-method-${index}`} x="18" y={Math.min(box.height - 18, 108 + index * 18)} fontSize="12" fill="#4d3827">
                        {line}
                      </text>
                    ))}
                    <rect
                      x={box.width - 14}
                      y={box.height - 14}
                      width="14"
                      height="14"
                      rx="4"
                      fill={isActive ? '#c25737' : '#7a5a3f'}
                      className="cursor-se-resize"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        const startPoint = getSvgPoint(event)
                        if (!startPoint) {
                          return
                        }
                        dragStateRef.current = {
                          mode: 'resize',
                          classId: box.id,
                          startPoint,
                          startBox: box,
                        }
                        setSelectedClassId(box.id)
                        setSelectedRelationIndex(-1)
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
                    />
                  ) : null}
                </>
              ) : null}
            </svg>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-black/10 bg-white/85 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Edition</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">
                Clique sur une boite ou une relation pour la selectionner. Glisse une boite dans le canvas, utilise le carre en bas a droite pour la redimensionner, puis attrape une extremite de relation pour la rattacher a un cote de boite.
              </p>
            </div>
            <UmlDiagram
              diagram={{ ...draft, layout: 'absolute' }}
              isExpanded
              patternCode={selectedCode}
              patternName={diagramName || selectedCode}
            />
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Inspecteur</p>
            {selectedClass ? (
              <div className="mt-4 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Identifiant</span>
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                    value={selectedClass.id}
                    onChange={(event) => updateSelectedClass((box) => ({ ...box, id: slugify(event.target.value) || box.id }))}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Titre</span>
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                    value={selectedClass.title}
                    onChange={(event) => updateSelectedClass((box) => ({ ...box, title: event.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Stereotype</span>
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                    value={selectedClass.stereotype}
                    onChange={(event) => updateSelectedClass((box) => ({ ...box, stereotype: event.target.value }))}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['x', 'y', 'width', 'height'].map((field) => (
                    <label key={field} className="flex flex-col gap-2 text-sm text-stone-700">
                      <span className="font-semibold capitalize text-stone-900">{field}</span>
                      <input
                        className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                        type="number"
                        value={selectedClass[field]}
                        onChange={(event) => updateSelectedClass((box) => ({ ...box, [field]: Number(event.target.value) }))}
                      />
                    </label>
                  ))}
                </div>
                <TextAreaListField
                  label="Attributs"
                  value={selectedClass.fields}
                  placeholder="+ field: Type"
                  onChange={(fields) => updateSelectedClass((box) => ({ ...box, fields }))}
                />
                <TextAreaListField
                  label="Methodes"
                  value={selectedClass.methods}
                  placeholder="+ operation(): ReturnType"
                  onChange={(methods) => updateSelectedClass((box) => ({ ...box, methods }))}
                />
                <button
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  type="button"
                  onClick={handleDeleteClass}
                >
                  Supprimer la boite
                </button>
              </div>
            ) : selectedRelation ? (
              <div className="mt-4 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Etiquette</span>
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                    value={selectedRelation.label}
                    onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, label: event.target.value }))}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">De</span>
                    <select
                      className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                      value={selectedRelation.from}
                      onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, from: event.target.value }))}
                    >
                      {draft.classes.map((box) => <option key={box.id} value={box.id}>{box.title}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Vers</span>
                    <select
                      className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                      value={selectedRelation.to}
                      onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, to: event.target.value }))}
                    >
                      {draft.classes.map((box) => <option key={box.id} value={box.id}>{box.title}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Sortie</span>
                    <select
                      className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                      value={selectedRelation.fromSide}
                      onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, fromSide: event.target.value }))}
                    >
                      {SIDE_OPTIONS.map((side) => <option key={side} value={side}>{side}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Entree</span>
                    <select
                      className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                      value={selectedRelation.toSide}
                      onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, toSide: event.target.value }))}
                    >
                      {SIDE_OPTIONS.map((side) => <option key={side} value={side}>{side}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Marqueur</span>
                    <select
                      className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                      value={selectedRelation.marker}
                      onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, marker: event.target.value }))}
                    >
                      <option value="arrow">Fleche</option>
                      <option value="triangle">Triangle</option>
                      <option value="diamond">Diamond</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Trace</span>
                    <select
                      className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                      value={selectedRelation.style}
                      onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, style: event.target.value }))}
                    >
                      <option value="straight">Droite</option>
                      <option value="curved">Courbe</option>
                    </select>
                  </label>
                </div>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Courbure</span>
                  <input
                    type="range"
                    min="-280"
                    max="280"
                    step="10"
                    value={selectedRelation.curvature}
                    onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, curvature: Number(event.target.value) }))}
                  />
                </label>
                <label className="flex items-center gap-3 text-sm text-stone-700">
                  <input
                    checked={selectedRelation.dashed}
                    type="checkbox"
                    onChange={(event) => updateSelectedRelation((relation) => ({ ...relation, dashed: event.target.checked }))}
                  />
                  Trait pointille
                </label>
                <TextAreaListField
                  label="Points intermediaires"
                  value={(selectedRelation.points ?? []).map((point) => `${point.x},${point.y}`)}
                  placeholder="640,320"
                  onChange={(lines) => updateSelectedRelation((relation) => ({
                    ...relation,
                    points: lines
                      .map((line) => {
                        const [x, y] = line.split(',').map((value) => Number(value.trim()))
                        return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null
                      })
                      .filter(Boolean),
                  }))}
                />
                <button
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  type="button"
                  onClick={handleDeleteRelation}
                >
                  Supprimer la relation
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-stone-700">
                Selectionne une boite ou une relation pour afficher ses proprietes.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
