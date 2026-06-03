function shorten(text, maxLength = 118) {
  const raw = `${text ?? ''}`.trim()
  if (!raw) {
    return ''
  }

  if (raw.length <= maxLength) {
    return raw
  }

  return `${raw.slice(0, Math.max(0, maxLength - 1)).trim()}...`
}

function firstAllowedValue(allowedValues, preferredValues = [], fallbackValue = null) {
  const safeAllowedValues = Array.isArray(allowedValues) ? allowedValues : []
  if (!safeAllowedValues.length) {
    return fallbackValue
  }

  for (const preferredValue of preferredValues) {
    if (safeAllowedValues.includes(preferredValue)) {
      return preferredValue
    }
  }

  if (fallbackValue && safeAllowedValues.includes(fallbackValue)) {
    return fallbackValue
  }

  return safeAllowedValues[0]
}

function lockPatternModeField(field, missionTitle) {
  if (field.type !== 'SELECT' || field.name !== 'mode') {
    return field
  }

  const withValue = firstAllowedValue(
    field.allowedValues,
    (field.allowedValues ?? []).filter((value) => `${value}`.startsWith('WITH_')),
    field.defaultValue,
  )

  return {
    ...field,
    label: 'Mode mission',
    allowedValues: withValue ? [withValue] : field.allowedValues,
    defaultValue: withValue ?? field.defaultValue,
    allowedValueLabels: withValue
      ? {
          [withValue]: `Pattern appliqué dans la mission ${missionTitle}`,
        }
      : undefined,
    description: 'Le mode est verrouillé sur la version orientée pattern pour rester cohérent avec le scénario mission.',
  }
}

function applyMissionFieldOverride(field, override) {
  if (!override) {
    return field
  }

  const nextField = {
    ...field,
  }

  if (override.label) {
    nextField.label = override.label
  }

  if (override.description) {
    nextField.description = override.description
  }

  if (override.allowedValueLabels) {
    nextField.allowedValueLabels = {
      ...(field.allowedValueLabels ?? {}),
      ...override.allowedValueLabels,
    }
  }

  if (override.readOnly !== undefined) {
    nextField.readOnly = Boolean(override.readOnly)
  }

  if (override.missionCritical !== undefined) {
    nextField.missionCritical = Boolean(override.missionCritical)
  }

  if (override.missionImpactScore !== undefined && override.missionImpactScore !== null) {
    const parsedScore = Number(override.missionImpactScore)
    nextField.missionImpactScore = Number.isNaN(parsedScore) ? 0 : Math.max(0, parsedScore)
  }

  if (override.allowedValues && Array.isArray(field.allowedValues)) {
    nextField.allowedValues = field.allowedValues.filter((value) => override.allowedValues.includes(value))
  }

  if (override.defaultValue !== undefined && override.defaultValue !== null) {
    if (!Array.isArray(nextField.allowedValues) || nextField.allowedValues.length === 0 || nextField.allowedValues.includes(override.defaultValue)) {
      nextField.defaultValue = override.defaultValue
    }
  }

  if (override.defaultCandidates && Array.isArray(override.defaultCandidates)) {
    const candidate = firstAllowedValue(nextField.allowedValues, override.defaultCandidates, nextField.defaultValue)
    if (candidate) {
      nextField.defaultValue = candidate
    }
  }

  return nextField
}

function inferMissionReadonly(field) {
  if (field.name === 'mode') {
    return true
  }

  const readonlyNarrativeFields = new Set([
    'missionName',
    'workspaceName',
    'subjectName',
    'roomName',
    'boardName',
    'rootName',
    'actorName',
    'objectName',
  ])

  return readonlyNarrativeFields.has(field.name)
}

function inferMissionCritical(patternCode, field) {
  const criticalByPattern = {
    strategy: new Set(['strategy']),
    decorator: new Set(['decorators']),
    singleton: new Set(['clients']),
    flyweight: new Set(['objectCount', 'sharedVariantCount']),
    factory: new Set(['vehicleType']),
    observer: new Set(['observers']),
    memento: new Set(['restoreTarget']),
    command: new Set(['actions']),
    composite: new Set(['blueprintCode']),
    chain: new Set(['tokenState', 'payloadState', 'processingTarget']),
    proxy: new Set(['requesterRole', 'resourceCode']),
    mediator: new Set(['participants']),
    bridge: new Set(['shapeCode', 'renderCode']),
    visitor: new Set(['visitorType', 'treePreset']),
    interpreter: new Set(['objective', 'scriptLines']),
  }

  return criticalByPattern[patternCode]?.has(field.name) ?? false
}

function inferMissionImpactScore(patternCode, field) {
  const impactByPattern = {
    strategy: { strategy: 5 },
    decorator: { decorators: 5 },
    singleton: { clients: 4 },
    flyweight: { objectCount: 5, sharedVariantCount: 5 },
    factory: { vehicleType: 4 },
    observer: { observers: 5 },
    memento: { restoreTarget: 5 },
    command: { actions: 5 },
    composite: { blueprintCode: 4 },
    chain: { tokenState: 5, payloadState: 4, processingTarget: 4 },
    proxy: { requesterRole: 5, resourceCode: 5 },
    mediator: { participants: 4 },
    bridge: { shapeCode: 4, renderCode: 5 },
    visitor: { visitorType: 5, treePreset: 4 },
    interpreter: { objective: 5, scriptLines: 5 },
  }

  const score = impactByPattern[patternCode]?.[field.name]
  if (typeof score === 'number') {
    return score
  }

  if (field.type === 'LIST') {
    return 4
  }

  if (field.type === 'SELECT') {
    return 3
  }

  return 2
}

function buildFallbackDescription({ mission, patternCode, field }) {
  const patternPrompt = mission?.patternPrompts?.[patternCode]

  if (field.name === 'mode') {
    return `Scénario mission : ${shorten(patternPrompt || mission?.objective, 92)}`
  }

  if (field.type === 'NUMBER') {
    return `Règle ce paramètre pour représenter la charge du scénario ${shorten(mission?.title, 40)}.`
  }

  if (field.type === 'TEXT') {
    return `Contexte mission : ${shorten(mission?.context, 92)}`
  }

  if (field.type === 'SELECT' || field.type === 'LIST') {
    return `Choix guidé par l’énoncé : ${shorten(patternPrompt || mission?.objective, 92)}`
  }

  return ''
}

const missionFieldOverridesById = {
  'memory-overload': {
    flyweight: {
      assetType: {
        label: 'Type d’asset massivement dupliqué',
      },
      objectCount: {
        label: 'Nombre d’entités à afficher',
        defaultValue: '10000',
        missionCritical: true,
      },
      sharedVariantCount: {
        label: 'Nombre de variantes partagées',
        defaultValue: '5',
        missionCritical: true,
      },
    },
  },
  'global-logger': {
    singleton: {
      clients: {
        label: 'Modules branchés sur le logger',
        defaultValue: 'UI Panel, Backend Job, Analytics Service, Alert Engine',
        missionCritical: true,
      },
      settingKey: {
        label: 'Clé de config globale',
        defaultValue: 'logLevel',
      },
      settingValue: {
        label: 'Valeur partagée',
        defaultValue: 'INFO',
      },
    },
  },
  'dynamic-payment-system': {
    strategy: {
      amount: {
        label: 'Montant checkout',
        defaultValue: '180',
      },
      strategy: {
        label: 'Canal de paiement actif',
        missionCritical: true,
      },
    },
  },
  'notification-system': {
    observer: {
      subjectName: {
        label: 'Nom du producteur d’événement',
        defaultValue: 'Release Bus',
      },
      observers: {
        label: 'Récepteurs abonnés',
        defaultValue: 'Mobile, Support, Back Office, Audit',
        missionCritical: true,
      },
      message: {
        label: 'Message diffusé',
        defaultValue: 'Nouvelle release critique disponible',
      },
    },
  },
  'power-up-system': {
    decorator: {
      characterName: {
        label: 'Nom du personnage buffé',
        defaultValue: 'Arena Champion',
      },
      decorators: {
        label: 'Bonus à empiler',
        defaultValue: 'FIRE, SHIELD, SPEED',
        missionCritical: true,
      },
    },
  },
  'undo-system': {
    command: {
      boardName: {
        label: 'Nom du terrain de simulation',
        defaultValue: 'Mission Grid',
      },
      actorName: {
        label: 'Acteur principal',
        defaultValue: 'Operator Unit',
      },
      actions: {
        label: 'Séquence d’actions historisée',
        defaultValue: 'ADD_BEACON, MOVE_RIGHT, MOVE_UP, UNDO, REDO',
        missionCritical: true,
      },
    },
  },
  'request-processing-pipeline': {
    chain: {
      requestName: {
        label: 'Nom de la requête API',
        defaultValue: 'Accès export sécurisé',
      },
      processingTarget: {
        label: 'Opération cible',
        defaultCandidates: ['PASSWORD_RESET', 'REPORT_EXPORT'],
        missionCritical: true,
      },
    },
  },
  'complex-combat-system': {
    strategy: {
      amount: {
        label: 'Intensité de l’attaque',
        defaultValue: '220',
      },
      strategy: {
        label: 'Style tactique actif',
        missionCritical: true,
        allowedValueLabels: {
          CARD: 'Style précision',
          PAYPAL: 'Style agilité',
          CRYPTO: 'Style puissance',
        },
        defaultCandidates: ['PAYPAL', 'CARD', 'CRYPTO'],
      },
    },
    decorator: {
      characterName: {
        label: 'Combattant de référence',
        defaultValue: 'Vanguard Unit',
      },
      decorators: {
        label: 'Buffs cumulables',
        defaultValue: 'FIRE, SHIELD, SPEED',
        missionCritical: true,
      },
    },
  },
  'massive-multiplayer-world': {
    factory: {
      vehicleType: {
        label: 'Archétype d’entité créée',
        missionCritical: true,
        allowedValueLabels: {
          CAR: 'Entité mêlée',
          BIKE: 'Entité rapide',
        },
      },
    },
    flyweight: {
      objectCount: {
        label: 'Population simulée',
        defaultValue: '12000',
        missionCritical: true,
      },
      sharedVariantCount: {
        label: 'Variantes partagées',
        defaultValue: '8',
        missionCritical: true,
      },
    },
  },
  'smart-notification-platform': {
    strategy: {
      amount: {
        label: 'Volume de notifications',
        defaultValue: '350',
      },
      strategy: {
        label: 'Canal prioritaire',
        missionCritical: true,
        allowedValueLabels: {
          CARD: 'EMAIL',
          PAYPAL: 'SMS',
          CRYPTO: 'PUSH',
        },
        defaultCandidates: ['CRYPTO', 'PAYPAL', 'CARD'],
      },
    },
    observer: {
      subjectName: {
        label: 'Hub émetteur',
        defaultValue: 'SmartAlertHub',
      },
      observers: {
        label: 'Abonnés',
        defaultValue: 'Mobile App, Support Desk, Back Office, Audit Log',
        missionCritical: true,
      },
      message: {
        label: 'Alerte diffusée',
        defaultValue: 'Alerte prioritaire : incident de paiement détecté',
      },
    },
  },
  'game-save-system': {
    command: {
      boardName: {
        label: 'Zone de progression',
        defaultValue: 'Checkpoint Grid',
      },
      actorName: {
        label: 'Avatar suivi',
        defaultValue: 'Runner Unit',
      },
      actions: {
        label: 'Historique d’actions',
        defaultValue: 'ADD_BEACON, MOVE_RIGHT, MOVE_UP, MOVE_LEFT, UNDO, REDO',
        missionCritical: true,
      },
    },
    memento: {
      workspaceName: {
        label: 'Nom de la session de sauvegarde',
        defaultValue: 'Checkpoint Session',
      },
      presetCode: {
        label: 'Preset de scène',
        defaultCandidates: ['CONTROL_ROOM', 'ARCADE_HUB', 'PIXEL_GARDEN'],
      },
      restoreTarget: {
        label: 'Snapshot à restaurer',
        defaultCandidates: ['SNAPSHOT_BETA', 'SNAPSHOT_ALPHA'],
        missionCritical: true,
      },
    },
  },
  'modular-ui-system': {
    composite: {
      rootName: {
        label: 'Nom du shell UI',
        defaultValue: 'ui-shell',
      },
      blueprintCode: {
        label: 'Blueprint de structure',
        defaultCandidates: ['DESIGN_SYSTEM', 'DOCS_SPACE', 'GAME_ASSETS'],
        missionCritical: true,
      },
      operationLabel: {
        label: 'Opération de rendu',
        defaultValue: 'Render module tree',
      },
    },
    decorator: {
      characterName: {
        label: 'Composant de base',
        defaultValue: 'Widget Core',
      },
      decorators: {
        label: 'Layers visuels à empiler',
        defaultValue: 'SHIELD, SPEED, FIRE',
        missionCritical: true,
        allowedValueLabels: {
          SHIELD: 'Layer Badge',
          SPEED: 'Layer Accent',
          FIRE: 'Layer Glow',
          ICE: 'Layer Frost',
        },
      },
    },
  },
  'secure-api-gateway': {
    chain: {
      requestName: {
        label: 'Nom de la requête sensible',
        defaultValue: 'Gateway secure access',
      },
      tokenState: {
        label: 'État du token auth',
        defaultCandidates: ['VALID'],
        missionCritical: true,
      },
      payloadState: {
        label: 'État du payload',
        defaultCandidates: ['VALID'],
        missionCritical: true,
      },
      processingTarget: {
        label: 'Ressource demandée',
        defaultCandidates: ['PASSWORD_RESET', 'REPORT_EXPORT'],
        missionCritical: true,
      },
    },
    proxy: {
      requestLabel: {
        label: 'Libellé de la requête',
        defaultValue: 'Access secure endpoint',
      },
      requesterRole: {
        label: 'Rôle appelant',
        defaultCandidates: ['MEMBER', 'GUEST', 'ADMIN'],
        missionCritical: true,
      },
      resourceCode: {
        label: 'Ressource protégée',
        defaultCandidates: ['LIVE_DASHBOARD', 'REPORT_ARCHIVE', 'VAULT_VIDEO'],
        missionCritical: true,
      },
    },
  },
  'multi-device-control-system': {
    command: {
      boardName: {
        label: 'Plan de contrôle devices',
        defaultValue: 'Device Control Board',
      },
      actorName: {
        label: 'Source de commande',
        defaultValue: 'Mobile Controller',
      },
      actions: {
        label: 'Macros de contrôle',
        defaultValue: 'ADD_BEACON, MOVE_RIGHT, MOVE_UP, MOVE_LEFT, UNDO, REDO',
        missionCritical: true,
        allowedValueLabels: {
          ADD_BEACON: 'Activer TV',
          MOVE_RIGHT: 'Allumer lampe',
          MOVE_UP: 'Lancer musique',
          MOVE_LEFT: 'Baisser lumière',
          DELETE_BEACON: 'Couper appareil',
          UNDO: 'Annuler macro',
          REDO: 'Rejouer macro',
        },
      },
    },
    mediator: {
      roomName: {
        label: 'Nom du hub de coordination',
        defaultValue: 'Living Room Hub',
      },
      participants: {
        label: 'Devices reliés',
        defaultValue: 'TV, Lamp, Music System',
        missionCritical: true,
      },
      senderName: {
        label: 'Contrôleur principal',
        defaultValue: 'Mobile App',
      },
      message: {
        label: 'Ordre diffusé',
        defaultValue: 'Activer scène cinéma synchronisée',
      },
    },
  },
  'dynamic-rendering-engine': {
    strategy: {
      amount: {
        label: 'Intensité rendu',
        defaultValue: '260',
      },
      strategy: {
        label: 'Profil de rendu dynamique',
        missionCritical: true,
        allowedValueLabels: {
          CARD: 'Raster pipeline',
          PAYPAL: 'Vector pipeline',
          CRYPTO: 'Hybrid pipeline',
        },
        defaultCandidates: ['CRYPTO', 'PAYPAL', 'CARD'],
      },
    },
    bridge: {
      shapeCode: {
        label: 'Famille d’abstraction',
        defaultCandidates: ['BANNER', 'CIRCLE', 'TRIANGLE'],
        missionCritical: true,
      },
      renderCode: {
        label: 'Moteur de rendu',
        defaultCandidates: ['GLOW_ENGINE', 'VECTOR_ENGINE', 'PIXEL_ENGINE'],
        missionCritical: true,
      },
      objectName: {
        label: 'Objet à rendre',
        defaultValue: 'Runtime Render Node',
      },
    },
  },
  'intelligent-file-scanner': {
    composite: {
      rootName: {
        label: 'Racine du scan',
        defaultValue: 'scan-root',
      },
      blueprintCode: {
        label: 'Arbre cible',
        defaultCandidates: ['DOCS_SPACE', 'MEDIA_ARCHIVE', 'GAME_ASSETS'],
        missionCritical: true,
      },
      operationLabel: {
        label: 'Opération appliquée',
        defaultValue: 'Scan recursive tree',
      },
    },
    visitor: {
      treePreset: {
        label: 'Preset de structure',
        defaultCandidates: ['MEDIA_ARCHIVE', 'TEAM_WORKSPACE', 'ASSET_PACK'],
      },
      visitorType: {
        label: 'Type d’analyse',
        defaultCandidates: ['VIRUS_SCAN', 'FIND_ELEMENT', 'COUNT_ELEMENTS'],
        missionCritical: true,
      },
      searchTerm: {
        label: 'Terme de détection',
        defaultValue: 'malware',
      },
    },
  },
  'smart-code-interpreter': {
    composite: {
      rootName: {
        label: 'Nom du script root',
        defaultValue: 'script-root',
      },
      blueprintCode: {
        label: 'Template de script',
        defaultCandidates: ['GAME_ASSETS', 'DOCS_SPACE', 'DESIGN_SYSTEM'],
      },
      operationLabel: {
        label: 'Opération interprétée',
        defaultValue: 'Interpret script tree',
      },
    },
    interpreter: {
      missionName: {
        label: 'Nom du scénario script',
        defaultValue: 'Smart Mission Script',
      },
      objective: {
        label: 'Objectif runtime',
        defaultCandidates: ['GATE_SWITCH', 'RELAY_BEACON', 'TARGET_DUMMY'],
        missionCritical: true,
      },
      scriptLines: {
        label: 'Script mission',
        defaultValue: 'MOVE 1\nTURN RIGHT\nMOVE 2\nREPEAT 2 {\nMOVE 1\nTURN LEFT\n}\nATTACK',
        missionCritical: true,
      },
    },
  },
}

export function buildMissionSchema({ mission, patternCode, schema, patternName }) {
  const safeFields = Array.isArray(schema?.fields) ? schema.fields : []
  const missionPatternOverrides = missionFieldOverridesById[mission.id]?.[patternCode] ?? {}

  const nextFields = safeFields.map((field) => {
    let nextField = lockPatternModeField(field, mission.title)
    nextField = applyMissionFieldOverride(nextField, missionPatternOverrides[field.name])

    if (nextField.readOnly === undefined) {
      nextField.readOnly = inferMissionReadonly(nextField)
    }

    if (nextField.missionCritical === undefined) {
      nextField.missionCritical = inferMissionCritical(patternCode, nextField)
    }

    if (nextField.missionImpactScore === undefined) {
      nextField.missionImpactScore = nextField.missionCritical
        ? inferMissionImpactScore(patternCode, nextField)
        : 0
    }

    if (!nextField.description) {
      nextField.description = buildFallbackDescription({
        mission,
        patternCode,
        field: nextField,
      })
    }

    if (!nextField.description && patternName) {
      nextField.description = `Configuration mission pour ${patternName}.`
    }

    return nextField
  })

  return {
    ...(schema ?? {}),
    fields: nextFields,
  }
}
