const collections = {
  QUEST_LOG: {
    code: 'QUEST_LOG',
    label: 'Quest Log',
    description: 'Une liste lineaire de missions a parcourir avec next() et previous().',
    iteratorBenefit: 'Traversal log stable',
    manualDriftDetail: 'Sans iterator, le retour arriere force une recalcul manuel de l index courant.',
    items: [
      { id: 'quest-intro', label: 'Briefing', kind: 'ENTRY', depth: 0, linearIndex: 0 },
      { id: 'quest-track', label: 'Track target', kind: 'ENTRY', depth: 0, linearIndex: 1 },
      { id: 'quest-breach', label: 'Breach gate', kind: 'ENTRY', depth: 0, linearIndex: 2 },
      { id: 'quest-extract', label: 'Extract core', kind: 'ENTRY', depth: 0, linearIndex: 3 },
      { id: 'quest-escape', label: 'Escape route', kind: 'ENTRY', depth: 0, linearIndex: 4 },
    ],
  },
  ASSET_TREE: {
    code: 'ASSET_TREE',
    label: 'Asset Tree',
    description: 'Un arbre aplati en parcours depth-first pour montrer qu un iterator peut cacher la structure de stockage.',
    iteratorBenefit: 'Depth-first traversal',
    manualDriftDetail: 'Sans iterator, revenir en arriere oblige a recalculer la position dans l arbre a partir du root.',
    items: [
      { id: 'root', label: 'assets', kind: 'ROOT', depth: 0, linearIndex: 0 },
      { id: 'folder-sprites', label: 'sprites', kind: 'FOLDER', depth: 1, linearIndex: 1 },
      { id: 'file-hero', label: 'hero_idle.png', kind: 'FILE', depth: 2, linearIndex: 2 },
      { id: 'file-enemy', label: 'enemy_boss.png', kind: 'FILE', depth: 2, linearIndex: 3 },
      { id: 'folder-audio', label: 'audio', kind: 'FOLDER', depth: 1, linearIndex: 4 },
      { id: 'file-ambient', label: 'ambient_loop.ogg', kind: 'FILE', depth: 2, linearIndex: 5 },
      { id: 'file-ui', label: 'ui_click.wav', kind: 'FILE', depth: 2, linearIndex: 6 },
    ],
  },
  TOOLBELT: {
    code: 'TOOLBELT',
    label: 'Toolbelt',
    description: 'Une ceinture d outils a parcourir dans les deux sens avec un curseur visuel unique.',
    iteratorBenefit: 'Bidirectional walk',
    manualDriftDetail: 'Sans iterator, le client garde lui-meme la position et finit vite par dupliquer la logique de navigation.',
    items: [
      { id: 'tool-map', label: 'Map scanner', kind: 'TOOL', depth: 0, linearIndex: 0 },
      { id: 'tool-hook', label: 'Grapple hook', kind: 'TOOL', depth: 0, linearIndex: 1 },
      { id: 'tool-drone', label: 'Scout drone', kind: 'TOOL', depth: 0, linearIndex: 2 },
      { id: 'tool-shield', label: 'Pulse shield', kind: 'TOOL', depth: 0, linearIndex: 3 },
      { id: 'tool-medkit', label: 'Med kit', kind: 'TOOL', depth: 0, linearIndex: 4 },
    ],
  },
}

const navigationPlan = ['START', 'NEXT', 'NEXT', 'PREVIOUS', 'NEXT', 'NEXT']

function createStep(index, action, actorLabel, targetId, targetLabel, pointerIndex, previousStable, detail) {
  return { index, action, actorLabel, targetId, targetLabel, pointerIndex, previousStable, detail }
}

function buildVisualization(useIterator, preset, currentItem) {
  return {
    nodes: [
      { id: 'client', label: 'TraversalClient', type: 'client', data: { detail: 'asks next / previous' } },
      {
        id: 'iterator',
        label: useIterator ? 'CollectionIterator' : 'ManualIndexWalker',
        type: 'context',
        data: { detail: useIterator ? 'encapsulated traversal' : 'client-owned cursor', active: useIterator },
      },
      { id: 'collection', label: preset.label, type: 'cluster', data: { detail: preset.code.toLowerCase() } },
      { id: 'cursor', label: currentItem.label, type: 'component', data: { detail: `cursor on ${currentItem.linearIndex}`, active: true } },
      {
        id: 'result',
        label: useIterator ? 'Stable traversal' : 'Manual backtrack',
        type: 'output',
        data: { message: useIterator ? 'next / previous hidden behind iterator' : 'navigation leaks to client' },
      },
    ],
    edges: [
      { from: 'client', to: 'iterator', label: 'navigate' },
      { from: 'iterator', to: 'collection', label: 'iterate' },
      { from: 'collection', to: 'cursor', label: 'current' },
      { from: 'iterator', to: 'result', label: useIterator ? 'stable' : 'fragile' },
    ],
  }
}

export default function executeIteratorPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_ITERATOR'}`.trim().toUpperCase()
  const useIterator = mode !== 'WITHOUT_ITERATOR'
  const explorerName = `${parameters.explorerName ?? ''}`.trim() || 'Traversal Explorer'
  const preset = collections[`${parameters.collectionCode ?? 'ASSET_TREE'}`.trim().toUpperCase()] ?? collections.ASSET_TREE
  const items = preset.items
  const steps = []
  let pointerIndex = 0

  navigationPlan.forEach((action, index) => {
    let previousStable = true
    let detail = ''

    if (action === 'START') {
      detail = `${explorerName} positionne le curseur sur ${items[pointerIndex].label}.`
    } else if (action === 'NEXT') {
      pointerIndex = Math.min(pointerIndex + 1, items.length - 1)
      detail = useIterator
        ? `iterator.next() avance proprement vers ${items[pointerIndex].label}.`
        : `Le client incremente un index manuel pour atteindre ${items[pointerIndex].label}.`
    } else if (action === 'PREVIOUS') {
      pointerIndex = Math.max(pointerIndex - 1, 0)
      previousStable = useIterator
      detail = useIterator
        ? `iterator.previous() revient directement sur ${items[pointerIndex].label}.`
        : preset.manualDriftDetail
    }

    steps.push(createStep(
      index + 1,
      action,
      useIterator ? 'CollectionIterator' : 'TraversalClient',
      items[pointerIndex].id,
      items[pointerIndex].label,
      pointerIndex,
      previousStable,
      detail,
    ))
  })

  const currentItem = items[Math.max(0, Math.min(pointerIndex, items.length - 1))]
  const visitedIds = [...new Set(steps.map((step) => step.targetId))]
  const cursorTrail = steps.map((step) => step.targetId)
  const unstableBacktrackCount = steps.filter((step) => step.action === 'PREVIOUS' && !step.previousStable).length

  return {
    patternCode: 'iterator',
    summary: useIterator
      ? 'Iterator encapsule next() et previous() dans un objet de parcours. Le client avance sur la collection sans connaitre la structure ni recalculer les positions.'
      : 'Sans Iterator, le client gere lui-meme les index et le retour arriere. Le parcours fonctionne, mais la logique de navigation se repand vite dans le code appelant.',
    logs: [
      `${explorerName} explore ${preset.label}.`,
      useIterator
        ? 'Le client demande next() / previous() sans connaitre la representation interne de la collection.'
        : 'Sans iterator, le client manipule directement la position courante et recalcule les retours arriere.',
      useIterator ? preset.iteratorBenefit : preset.manualDriftDetail,
      unstableBacktrackCount === 0
        ? 'Le retour arriere reste stable sur tout le parcours.'
        : `${unstableBacktrackCount} retour(s) arriere demandent une logique manuelle fragile.`,
    ],
    output: {
      mode,
      modeLabel: useIterator ? 'Avec Iterator' : 'Sans Iterator',
      explorerName,
      collectionCode: preset.code,
      collectionLabel: preset.label,
      collectionDescription: preset.description,
      iteratorBenefit: preset.iteratorBenefit,
      manualDriftDetail: preset.manualDriftDetail,
      previousSupported: useIterator,
      stablePrevious: unstableBacktrackCount === 0,
      itemCount: items.length,
      visitedCount: visitedIds.length,
      finalPointerIndex: pointerIndex,
      currentItemId: currentItem.id,
      currentItemLabel: currentItem.label,
      resultLabel: useIterator ? 'Traversal stable' : 'Traversal manuelle',
      previousActionCount: steps.filter((step) => step.action === 'PREVIOUS').length,
      unstableBacktrackCount,
      navigationPlan,
      items,
      steps,
      cursorTrail,
      visitedIds,
      stepCount: steps.length,
    },
    visualization: buildVisualization(useIterator, preset, currentItem),
  }
}
