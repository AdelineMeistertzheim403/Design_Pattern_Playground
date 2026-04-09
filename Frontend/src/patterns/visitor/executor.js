const treePresets = {
  ASSET_PACK: {
    code: 'ASSET_PACK',
    label: 'Asset Pack',
    description: 'Pack d assets avec textures, audio et build final. Ideal pour le comptage, la valeur et le scan.',
    buildRoot() {
      return createFolder('root', 'asset-pack', [
        createFolder('textures', 'textures', [
          createFile('hero', 'hero.png', 18, false),
          createFile('boss', 'boss.png', 26, false),
        ]),
        createFolder('audio', 'audio', [
          createFile('ambient', 'ambient.ogg', 12, false),
          createFile('virus', 'virus_payload.dll', 7, true),
        ]),
        createFolder('build', 'build', [
          createFile('manifest', 'manifest.json', 3, false),
          createFile('notes', 'release-notes.md', 2, false),
        ]),
      ])
    },
  },
  TEAM_WORKSPACE: {
    code: 'TEAM_WORKSPACE',
    label: 'Team Workspace',
    description: 'Espace d equipe avec docs, source et operations.',
    buildRoot() {
      return createFolder('root', 'workspace', [
        createFolder('docs', 'docs', [
          createFile('roadmap', 'roadmap.md', 4, false),
          createFile('budget', 'budget.xlsx', 9, false),
        ]),
        createFolder('src', 'src', [
          createFile('app', 'App.jsx', 6, false),
          createFile('scanner', 'scanner.jar', 5, true),
        ]),
        createFolder('ops', 'ops', [
          createFile('deploy', 'deploy.sh', 3, false),
        ]),
      ])
    },
  },
  MEDIA_ARCHIVE: {
    code: 'MEDIA_ARCHIVE',
    label: 'Media Archive',
    description: 'Archive de medias avec dossiers video, photo et exports.',
    buildRoot() {
      return createFolder('root', 'media-archive', [
        createFolder('video', 'video', [
          createFile('intro', 'intro.mp4', 42, false),
          createFile('teaser', 'teaser.mov', 29, false),
        ]),
        createFolder('photo', 'photo', [
          createFile('cover', 'cover.png', 11, false),
          createFile('contact', 'contact-sheet.pdf', 8, false),
        ]),
        createFolder('exports', 'exports', [
          createFile('package', 'package.zip', 15, false),
          createFile('quarantine', 'trojan-sample.bin', 6, true),
        ]),
      ])
    },
  },
}

const analysisTypes = {
  COUNT_ELEMENTS: {
    code: 'COUNT_ELEMENTS',
    label: 'Count Elements',
    description: 'Compte tous les elements de la structure.',
    buildVisitor() {
      let folderCount = 0
      let fileCount = 0
      return {
        visitFolder() {
          folderCount += 1
          return { matched: false, detail: 'Dossier compte dans le total.' }
        },
        visitFile() {
          fileCount += 1
          return { matched: false, detail: 'Fichier ajoute au total.' }
        },
        shouldStop() {
          return false
        },
        matchedIds() {
          return []
        },
        buildResultFields() {
          return {
            folderCount,
            fileCount,
            resultLabel: `${folderCount + fileCount} elements`,
            resultDetail: `${folderCount} dossiers analyses et ${fileCount} fichiers comptes.`,
          }
        },
      }
    },
  },
  CALCULATE_VALUE: {
    code: 'CALCULATE_VALUE',
    label: 'Calculate Value',
    description: 'Additionne la taille totale des fichiers.',
    buildVisitor() {
      let totalValueMb = 0
      let pricedFileCount = 0
      return {
        visitFolder() {
          return { matched: false, detail: 'Ouverture du dossier pour additionner les fichiers.' }
        },
        visitFile(file) {
          totalValueMb += file.sizeMb
          pricedFileCount += 1
          return { matched: false, detail: `${file.sizeMb} MB ajoutes a la valeur totale.` }
        },
        shouldStop() {
          return false
        },
        matchedIds() {
          return []
        },
        buildResultFields() {
          return {
            pricedFileCount,
            totalValueMb,
            resultLabel: `${totalValueMb} MB`,
            resultDetail: `Valeur totale calculee sur ${pricedFileCount} fichiers.`,
          }
        },
      }
    },
  },
  FIND_ELEMENT: {
    code: 'FIND_ELEMENT',
    label: 'Find Element',
    description: 'Recherche un element cible dans l arbre.',
    buildVisitor(searchTerm) {
      const normalizedSearchTerm = `${searchTerm ?? ''}`.trim().toLowerCase()
      let foundId = null
      let foundLabel = null

      function matches(label) {
        return normalizedSearchTerm.length > 0 && `${label}`.toLowerCase().includes(normalizedSearchTerm)
      }

      return {
        visitFolder(folder) {
          const matched = matches(folder.label)
          if (matched && !foundId) {
            foundId = folder.id
            foundLabel = folder.label
          }
          return { matched, detail: matched ? 'Cible trouvee dans un dossier.' : 'Dossier inspecte.' }
        },
        visitFile(file) {
          const matched = matches(file.label)
          if (matched && !foundId) {
            foundId = file.id
            foundLabel = file.label
          }
          return { matched, detail: matched ? 'Element recherche trouve.' : 'Fichier compare au terme de recherche.' }
        },
        shouldStop() {
          return Boolean(foundId)
        },
        matchedIds() {
          return foundId ? [foundId] : []
        },
        buildResultFields() {
          return {
            found: Boolean(foundId),
            foundLabel: foundLabel ?? '',
            resultLabel: foundId ? 'Trouve' : 'Introuvable',
            resultDetail: foundId
              ? `Element trouve : ${foundLabel}.`
              : `Aucun element ne correspond a "${normalizedSearchTerm}".`,
          }
        },
      }
    },
  },
  VIRUS_SCAN: {
    code: 'VIRUS_SCAN',
    label: 'Virus Scan',
    description: 'Detecte les fichiers marques comme infectes.',
    buildVisitor() {
      const infectedIds = []
      let infectedCount = 0
      return {
        visitFolder() {
          return { matched: false, detail: 'Scan du dossier en cours.' }
        },
        visitFile(file) {
          if (file.infected) {
            infectedCount += 1
            infectedIds.push(file.id)
            return { matched: true, detail: 'Menace detectee dans ce fichier.' }
          }
          return { matched: false, detail: 'Fichier sain.' }
        },
        shouldStop() {
          return false
        },
        matchedIds() {
          return [...infectedIds]
        },
        buildResultFields() {
          return {
            infectedCount,
            resultLabel: infectedCount === 0 ? 'Aucune menace' : `${infectedCount} menace(s)`,
            resultDetail: infectedCount === 0
              ? 'Le visitor n a trouve aucun fichier infecte.'
              : `${infectedCount} fichier(s) infecte(s) detecte(s).`,
          }
        },
      }
    },
  },
}

function createFolder(id, label, children) {
  return {
    id,
    label,
    kind: 'FOLDER',
    sizeMb: 0,
    infected: false,
    children,
  }
}

function createFile(id, label, sizeMb, infected) {
  return {
    id,
    label,
    kind: 'FILE',
    sizeMb,
    infected,
    children: [],
  }
}

function toStringValue(value, defaultValue) {
  const candidate = `${value ?? ''}`.trim()
  return candidate || defaultValue
}

function accept(component, visitor, steps, depth) {
  const feedback = component.kind === 'FOLDER'
    ? visitor.visitFolder(component)
    : visitor.visitFile(component)

  steps.push({
    nodeId: component.id,
    nodeLabel: component.label,
    nodeKind: component.kind,
    depth,
    detail: feedback.detail,
    matched: Boolean(feedback.matched),
  })

  if (visitor.shouldStop()) {
    return
  }

  if (component.kind === 'FOLDER') {
    component.children.forEach((child) => {
      if (!visitor.shouldStop()) {
        accept(child, visitor, steps, depth + 1)
      }
    })
  }
}

function flatten(component, nodes, parentId, depth, visitedIds, matchedIds) {
  nodes.push({
    id: component.id,
    parentId,
    label: component.label,
    kind: component.kind,
    depth,
    sizeMb: component.sizeMb,
    infected: component.infected,
    visited: visitedIds.has(component.id),
    matched: matchedIds.has(component.id),
  })

  component.children.forEach((child) => flatten(child, nodes, component.id, depth + 1, visitedIds, matchedIds))
}

function toStepMaps(steps) {
  return steps.map((step, index) => ({
    index: index + 1,
    nodeId: step.nodeId,
    nodeLabel: step.nodeLabel,
    nodeKind: step.nodeKind,
    depth: step.depth,
    detail: step.detail,
    matched: step.matched,
  }))
}

function buildVisualization(useVisitor, analysisType, matchCount) {
  return {
    nodes: [
      { id: 'client', label: 'Structure Analyzer', type: 'client', data: { detail: 'explorer' } },
      {
        id: useVisitor ? 'visitor' : 'manual',
        label: useVisitor ? `${analysisType.label} Visitor` : 'Manual Analyzer',
        type: useVisitor ? 'context' : 'component',
        data: { detail: useVisitor ? 'accept(visitor)' : 'instanceof + switch' },
      },
      { id: 'tree', label: 'Workspace Tree', type: 'cluster', data: { detail: 'folders + files' } },
      {
        id: 'result',
        label: matchCount > 0 ? 'Matches' : 'Result',
        type: 'output',
        data: { message: matchCount > 0 ? `${matchCount} noeud(s) mis en evidence` : analysisType.label },
      },
    ],
    edges: [
      { from: 'client', to: useVisitor ? 'visitor' : 'manual', label: useVisitor ? 'select visitor' : 'manual rules' },
      { from: useVisitor ? 'visitor' : 'manual', to: 'tree', label: 'traverse' },
      { from: 'tree', to: 'result', label: 'aggregate' },
    ],
  }
}

function analyzeWithoutVisitor(root, analysisType, searchTerm) {
  const state = {
    folderCount: 0,
    fileCount: 0,
    pricedFileCount: 0,
    totalValueMb: 0,
    infectedCount: 0,
    foundLabel: null,
    matchedIds: [],
  }
  const steps = []
  const normalizedSearchTerm = `${searchTerm ?? ''}`.trim().toLowerCase()

  function traverse(component, depth) {
    let matched = false
    let detail = 'Element inspecte.'

    if (component.kind === 'FOLDER') {
      switch (analysisType.code) {
        case 'COUNT_ELEMENTS':
          state.folderCount += 1
          detail = 'Dossier compte par le moteur manuel.'
          break
        case 'CALCULATE_VALUE':
          detail = 'Dossier ouvert pour une addition manuelle.'
          break
        case 'FIND_ELEMENT':
          matched = normalizedSearchTerm.length > 0 && component.label.toLowerCase().includes(normalizedSearchTerm)
          if (matched && !state.foundLabel) {
            state.foundLabel = component.label
            state.matchedIds.push(component.id)
          }
          detail = matched ? 'Cible trouvee dans un dossier.' : 'Dossier inspecte.'
          break
        case 'VIRUS_SCAN':
          detail = 'Scan manuel du dossier.'
          break
        default:
          break
      }

      steps.push({
        nodeId: component.id,
        nodeLabel: component.label,
        nodeKind: component.kind,
        depth,
        detail,
        matched,
      })

      if (analysisType.code === 'FIND_ELEMENT' && state.foundLabel) {
        return
      }

      component.children.forEach((child) => {
        if (!(analysisType.code === 'FIND_ELEMENT' && state.foundLabel)) {
          traverse(child, depth + 1)
        }
      })
      return
    }

    switch (analysisType.code) {
      case 'COUNT_ELEMENTS':
        state.fileCount += 1
        detail = 'Fichier compte manuellement.'
        break
      case 'CALCULATE_VALUE':
        state.totalValueMb += component.sizeMb
        state.pricedFileCount += 1
        detail = `${component.sizeMb} MB ajoutes a la valeur manuelle.`
        break
      case 'FIND_ELEMENT':
        matched = normalizedSearchTerm.length > 0 && component.label.toLowerCase().includes(normalizedSearchTerm)
        if (matched && !state.foundLabel) {
          state.foundLabel = component.label
          state.matchedIds.push(component.id)
        }
        detail = matched ? 'Element recherche trouve.' : 'Fichier compare au terme de recherche.'
        break
      case 'VIRUS_SCAN':
        matched = Boolean(component.infected)
        if (matched) {
          state.infectedCount += 1
          state.matchedIds.push(component.id)
        }
        detail = matched ? 'Menace detectee par le scan manuel.' : 'Fichier sain.'
        break
      default:
        break
    }

    steps.push({
      nodeId: component.id,
      nodeLabel: component.label,
      nodeKind: component.kind,
      depth,
      detail,
      matched,
    })
  }

  traverse(root, 0)

  switch (analysisType.code) {
    case 'COUNT_ELEMENTS':
      return {
        steps,
        resultFields: {
          folderCount: state.folderCount,
          fileCount: state.fileCount,
          resultLabel: `${state.folderCount + state.fileCount} elements`,
          resultDetail: `${state.folderCount} dossiers analyses et ${state.fileCount} fichiers comptes.`,
        },
        matchedIds: [...state.matchedIds],
      }
    case 'CALCULATE_VALUE':
      return {
        steps,
        resultFields: {
          pricedFileCount: state.pricedFileCount,
          totalValueMb: state.totalValueMb,
          resultLabel: `${state.totalValueMb} MB`,
          resultDetail: `Valeur totale calculee sur ${state.pricedFileCount} fichiers.`,
        },
        matchedIds: [...state.matchedIds],
      }
    case 'FIND_ELEMENT':
      return {
        steps,
        resultFields: {
          found: Boolean(state.foundLabel),
          foundLabel: state.foundLabel ?? '',
          resultLabel: state.foundLabel ? 'Trouve' : 'Introuvable',
          resultDetail: state.foundLabel
            ? `Element trouve : ${state.foundLabel}.`
            : `Aucun element ne correspond a "${normalizedSearchTerm}".`,
        },
        matchedIds: [...state.matchedIds],
      }
    default:
      return {
        steps,
        resultFields: {
          infectedCount: state.infectedCount,
          resultLabel: state.infectedCount === 0 ? 'Aucune menace' : `${state.infectedCount} menace(s)`,
          resultDetail: state.infectedCount === 0
            ? 'Le scan manuel n a trouve aucun fichier infecte.'
            : `${state.infectedCount} fichier(s) infecte(s) detecte(s).`,
        },
        matchedIds: [...state.matchedIds],
      }
  }
}

export default function executeVisitorPattern(parameters) {
  const mode = toStringValue(parameters.mode, 'WITH_VISITOR').toUpperCase()
  const useVisitor = mode !== 'WITHOUT_VISITOR'
  const treePreset = treePresets[toStringValue(parameters.treePreset, 'ASSET_PACK').toUpperCase()] ?? treePresets.ASSET_PACK
  const analysisType = analysisTypes[toStringValue(parameters.visitorType, 'COUNT_ELEMENTS').toUpperCase()] ?? analysisTypes.COUNT_ELEMENTS
  const searchTerm = toStringValue(parameters.searchTerm, 'virus')
  const root = treePreset.buildRoot()

  let traversalSteps
  let resultFields
  let matchedIds
  const logs = []

  if (useVisitor) {
    const visitor = analysisType.buildVisitor(searchTerm)
    traversalSteps = []
    accept(root, visitor, traversalSteps, 0)
    resultFields = visitor.buildResultFields()
    matchedIds = visitor.matchedIds()

    logs.push('Le client choisit un visitor puis lance accept(visitor) sur le root.')
    logs.push('Chaque element dispatch automatiquement vers visitFolder ou visitFile sans switch metier dans le client.')
    logs.push('Le comportement change en remplaçant le visitor, pas en modifiant les classes de la structure.')
  } else {
    const manualResult = analyzeWithoutVisitor(root, analysisType, searchTerm)
    traversalSteps = manualResult.steps
    resultFields = manualResult.resultFields
    matchedIds = manualResult.matchedIds

    logs.push('Sans Visitor, le client centralise l analyse avec des instanceof et des branches par type.')
    logs.push('Ajouter un nouveau calcul impose alors de retoucher le moteur de traversal manuel.')
    logs.push('Le resultat peut etre juste, mais le couplage au modele grandit a chaque nouveau comportement.')
  }

  const visitedIds = new Set(traversalSteps.map((step) => step.nodeId))
  const matchedIdSet = new Set(matchedIds)
  const treeNodes = []
  flatten(root, treeNodes, null, 0, visitedIds, matchedIdSet)

  logs.push(
    useVisitor
      ? `Le visitor ${analysisType.label} parcourt ${visitedIds.size} noeuds sur la structure.`
      : `Le parcours manuel visite ${visitedIds.size} noeuds avec une logique d analyse centralisee.`,
  )

  return {
    patternCode: 'visitor',
    summary: useVisitor
      ? 'Visitor ajoute de nouveaux comportements sur la structure sans modifier les classes des dossiers et fichiers. Le traversal reste stable, seule l analyse change.'
      : 'Sans Visitor, chaque nouvelle analyse ajoute des branches de type dans un moteur central. La structure reste la meme, mais la logique grossit a chaque besoin.',
    logs,
    output: {
      mode,
      modeLabel: useVisitor ? 'Avec Visitor' : 'Sans Visitor',
      treePreset: treePreset.code,
      treeLabel: treePreset.label,
      treeDescription: treePreset.description,
      visitorType: analysisType.code,
      visitorLabel: analysisType.label,
      visitorDescription: analysisType.description,
      searchTerm,
      visitedCount: visitedIds.size,
      matchedCount: matchedIds.length,
      treeNodes,
      traversalSteps: toStepMaps(traversalSteps),
      matchedNodeIds: matchedIds,
      ...resultFields,
    },
    visualization: buildVisualization(useVisitor, analysisType, matchedIds.length),
  }
}
