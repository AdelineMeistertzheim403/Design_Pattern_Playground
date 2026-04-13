const blueprints = {
  GAME_ASSETS: {
    code: 'GAME_ASSETS',
    label: 'Game Assets',
    description: 'Arbre de production jeu avec dossiers sprites, audio et atlas UI.',
    compositeBenefit: 'Une seule operation peut balayer tout le pack d assets quand les dossiers et fichiers partagent le meme contrat.',
    manualGapDetail: 'Sans Composite, le client oublie les sprites imbriques dans player et ne traite que le premier niveau.',
  },
  DESIGN_SYSTEM: {
    code: 'DESIGN_SYSTEM',
    label: 'Design System',
    description: 'Bibliotheque UI avec composants, tokens et document Storybook.',
    compositeBenefit: 'Le root delegue la meme operation a des branches heterogenes sans if speciaux.',
    manualGapDetail: 'Sans Composite, les fichiers enfouis dans components et tokens restent hors du parcours manuel.',
  },
  DOCS_SPACE: {
    code: 'DOCS_SPACE',
    label: 'Docs Space',
    description: 'Espace documentaire avec guides, API et readme central.',
    compositeBenefit: 'Le meme appel de traversal couvre guides, API et documents feuilles.',
    manualGapDetail: 'Sans Composite, la documentation profonde n est pas consolidee quand le client reste au niveau racine.',
  },
}

function createSeed(id, parentId, label, kind, depth, sizeMb) {
  return { id, parentId, label, kind, depth, sizeMb }
}

function buildSeeds(blueprintCode, rootName, extraLeafCount) {
  const seeds = [createSeed('root', null, rootName, 'ROOT', 0, 0)]

  if (blueprintCode === 'GAME_ASSETS') {
    seeds.push(
      createSeed('sprites', 'root', 'sprites', 'FOLDER', 1, 0),
      createSeed('audio', 'root', 'audio', 'FOLDER', 1, 0),
      createSeed('ui-atlas', 'root', 'ui_atlas.png', 'FILE', 1, 18),
      createSeed('player', 'sprites', 'player', 'FOLDER', 2, 0),
      createSeed('enemies', 'sprites', 'enemies.png', 'FILE', 2, 22),
      createSeed('ambient', 'audio', 'ambient.ogg', 'FILE', 2, 34),
      createSeed('impact', 'audio', 'impact.wav', 'FILE', 2, 8),
      createSeed('idle', 'player', 'hero_idle.png', 'FILE', 3, 12),
      createSeed('run', 'player', 'hero_run.png', 'FILE', 3, 14),
    )

    for (let index = 1; index <= extraLeafCount; index += 1) {
      seeds.push(createSeed(`variant-${index}`, 'player', `variant_${index}.png`, 'FILE', 3, 6 + index))
    }
  } else if (blueprintCode === 'DESIGN_SYSTEM') {
    seeds.push(
      createSeed('components', 'root', 'components', 'FOLDER', 1, 0),
      createSeed('tokens', 'root', 'tokens', 'FOLDER', 1, 0),
      createSeed('storybook', 'root', 'storybook.mdx', 'FILE', 1, 11),
      createSeed('button', 'components', 'Button.tsx', 'FILE', 2, 7),
      createSeed('card', 'components', 'Card.tsx', 'FILE', 2, 8),
      createSeed('colors', 'tokens', 'color.tokens.json', 'FILE', 2, 5),
      createSeed('spacing', 'tokens', 'spacing.tokens.json', 'FILE', 2, 4),
    )

    for (let index = 1; index <= extraLeafCount; index += 1) {
      seeds.push(createSeed(`widget-${index}`, 'components', `Widget${index}.tsx`, 'FILE', 2, 6 + index))
    }
  } else {
    seeds.push(
      createSeed('guides', 'root', 'guides', 'FOLDER', 1, 0),
      createSeed('api', 'root', 'api', 'FOLDER', 1, 0),
      createSeed('readme', 'root', 'README.md', 'FILE', 1, 3),
      createSeed('onboarding', 'guides', 'onboarding.md', 'FILE', 2, 6),
      createSeed('architecture', 'guides', 'architecture.md', 'FILE', 2, 9),
      createSeed('auth', 'api', 'auth.md', 'FILE', 2, 5),
      createSeed('patterns', 'api', 'patterns.md', 'FILE', 2, 7),
    )

    for (let index = 1; index <= extraLeafCount; index += 1) {
      seeds.push(createSeed(`appendix-${index}`, 'guides', `appendix-${index}.md`, 'FILE', 2, 2 + index))
    }
  }

  return seeds
}

function createStep(index, stageCode, title, actorLabel, status, detail) {
  return { index, stageCode, title, actorLabel, status, detail }
}

function buildVisualization(treeNodes, complete) {
  const nodes = treeNodes.map((node) => ({
    id: node.id,
    label: node.label,
    type: node.kind === 'ROOT' ? 'context' : node.kind === 'FOLDER' ? 'cluster' : 'event',
    data: {
      detail: node.kind === 'FILE' ? `${node.sizeMb} MB` : node.kind.toLowerCase(),
      active: node.processed,
    },
  }))

  const edges = treeNodes
    .filter((node) => node.parentId)
    .map((node) => ({ from: node.parentId, to: node.id, label: 'contains' }))

  nodes.push({
    id: 'result',
    label: complete ? 'Tree complete' : 'Tree partial',
    type: 'output',
    data: { message: complete ? 'all descendants reached' : 'deep nodes missed' },
  })
  edges.push({ from: 'root', to: 'result', label: complete ? 'aggregate' : 'partial' })

  return { nodes, edges }
}

export default function executeCompositePattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_COMPOSITE'}`.trim().toUpperCase()
  const useComposite = mode !== 'WITHOUT_COMPOSITE'
  const rootName = `${parameters.rootName ?? ''}`.trim() || 'workspace'
  const blueprint = blueprints[`${parameters.blueprintCode ?? 'GAME_ASSETS'}`.trim().toUpperCase()] ?? blueprints.GAME_ASSETS
  const rawLeafCount = Number(parameters.extraLeafCount ?? 3)
  const extraLeafCount = Number.isFinite(rawLeafCount) ? Math.min(8, Math.max(0, Math.round(rawLeafCount))) : 3
  const operationLabel = `${parameters.operationLabel ?? ''}`.trim() || 'Scan tree'

  const treeNodes = buildSeeds(blueprint.code, rootName, extraLeafCount).map((seed) => ({
    ...seed,
    processed: useComposite || seed.depth <= 1,
  }))

  const nodeCount = treeNodes.length
  const fileCount = treeNodes.filter((node) => node.kind === 'FILE').length
  const containerCount = nodeCount - fileCount
  const processedCount = treeNodes.filter((node) => node.processed).length
  const missedCount = nodeCount - processedCount
  const processedLeafCount = treeNodes.filter((node) => node.processed && node.kind === 'FILE').length
  const totalSizeMb = treeNodes.reduce((sum, node) => sum + node.sizeMb, 0)
  const processedSizeMb = treeNodes.filter((node) => node.processed).reduce((sum, node) => sum + node.sizeMb, 0)
  const maxDepth = treeNodes.reduce((maxDepthValue, node) => Math.max(maxDepthValue, node.depth), 0)

  const steps = [
    createStep(1, 'TRIGGER', 'Declenchement', 'TreeBuilderClient', 'SENT', `Le client lance ${operationLabel} sur le root du blueprint ${blueprint.label}.`),
    createStep(
      2,
      useComposite ? 'COMPONENT_CALL' : 'MANUAL_SPLIT',
      useComposite ? 'Appel uniforme' : 'Gestion separee',
      useComposite ? 'WorkspaceComponent' : 'TreeBuilderClient',
      useComposite ? 'UNIFIED' : 'MANUAL',
      useComposite
        ? 'Le meme contrat est applique au root, aux dossiers et aux feuilles.'
        : 'Le client distingue dossier et fichier avec des branches manuelles.',
    ),
    createStep(3, 'TOP_LEVEL', 'Premier niveau', 'workspace', 'READY', 'Le premier niveau est visite sans probleme.'),
    createStep(
      4,
      useComposite ? 'RECURSIVE_WALK' : 'DESCENDANT_GAP',
      useComposite ? 'Descente recursive' : 'Sous-arbre oublie',
      useComposite ? 'CompositeFolder' : 'TreeBuilderClient',
      useComposite ? 'READY' : 'MISSED',
      useComposite ? 'Les appels descendent automatiquement vers tous les descendants.' : blueprint.manualGapDetail,
    ),
    createStep(
      5,
      'AGGREGATE',
      'Agregation',
      'workspace',
      missedCount === 0 ? 'READY' : 'PARTIAL',
      `${processedLeafCount} feuille(s) sur ${fileCount} consolidees.`,
    ),
    createStep(
      6,
      'RESULT',
      'Verdict',
      'TreeBuilderClient',
      missedCount === 0 ? 'READY' : 'PARTIAL',
      missedCount === 0
        ? 'Le root produit un resultat complet sur toute la structure.'
        : `Le resultat reste partiel car ${missedCount} noeud(s) profond(s) n ont pas ete traites.`,
    ),
  ]

  return {
    patternCode: 'composite',
    summary: useComposite
      ? 'Composite permet de lancer la meme operation sur le root, un dossier ou un fichier sans changer le code client. La recursion descend naturellement dans tout l arbre.'
      : 'Sans Composite, le client distingue dossiers et fichiers et oublie facilement les descendants plus profonds. Le parcours reste partiel et plus fragile.',
    logs: [
      `Le client lance ${operationLabel} sur le root ${rootName}.`,
      useComposite
        ? 'Le root, les dossiers et les fichiers partagent le meme contrat CompositeComponent.'
        : 'Sans Composite, le client garde des branches separees pour les dossiers et les fichiers.',
      useComposite ? blueprint.compositeBenefit : blueprint.manualGapDetail,
      `Feuilles traitees : ${processedLeafCount} / ${fileCount}.`,
      missedCount === 0
        ? 'Aucun sous-arbre n est perdu pendant le parcours.'
        : `${missedCount} noeud(s) restent hors parcours a cause du traitement manuel.`,
    ],
    output: {
      mode,
      modeLabel: useComposite ? 'Avec Composite' : 'Sans Composite',
      rootName,
      blueprintCode: blueprint.code,
      blueprintLabel: blueprint.label,
      blueprintDescription: blueprint.description,
      operationLabel,
      uniformTraversal: useComposite,
      operationResultLabel: missedCount === 0 ? 'Arbre complet traite' : 'Sous-arbre manque',
      compositeBenefit: blueprint.compositeBenefit,
      manualGapDetail: blueprint.manualGapDetail,
      nodeCount,
      containerCount,
      fileCount,
      processedCount,
      missedCount,
      processedLeafCount,
      totalSizeMb,
      processedSizeMb,
      maxDepth,
      stepCount: steps.length,
      steps,
      treeNodes,
    },
    visualization: buildVisualization(treeNodes, missedCount === 0),
  }
}
