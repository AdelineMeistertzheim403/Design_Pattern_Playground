export const flyweightProfiles = {
  TREE: {
    code: 'TREE',
    label: 'Arbres',
    intrinsicStateKb: 48,
    extrinsicStateKb: 6,
  },
  PARTICLE: {
    code: 'PARTICLE',
    label: 'Particules',
    intrinsicStateKb: 18,
    extrinsicStateKb: 3,
  },
  BULLET: {
    code: 'BULLET',
    label: 'Projectiles',
    intrinsicStateKb: 12,
    extrinsicStateKb: 2,
  },
}

export const decoratorBaseProfiles = {
  WARRIOR: {
    code: 'WARRIOR',
    label: 'Guardian Knight',
    description: 'Profil stable avec un bon socle defensif.',
    stats: { attack: 10, defense: 8, speed: 4, control: 2 },
  },
  MAGE: {
    code: 'MAGE',
    label: 'Arcane Weaver',
    description: 'Profil technique qui valorise les effets elementaires.',
    stats: { attack: 8, defense: 4, speed: 5, control: 9 },
  },
  ROGUE: {
    code: 'ROGUE',
    label: 'Shadow Runner',
    description: 'Profil mobile et offensif pour les empilements rapides.',
    stats: { attack: 9, defense: 5, speed: 8, control: 3 },
  },
}

export const decoratorDefinitions = {
  FIRE: {
    code: 'FIRE',
    layerLabel: 'FireDecorator',
    effect: 'Ajoute une aura offensive et des attaques enflammees.',
    stats: { attack: 6, defense: 0, speed: 0, control: 0 },
  },
  SHIELD: {
    code: 'SHIELD',
    layerLabel: 'ShieldDecorator',
    effect: 'Ajoute une surcouche defensive sans toucher au composant de base.',
    stats: { attack: 0, defense: 10, speed: 0, control: 0 },
  },
  SPEED: {
    code: 'SPEED',
    layerLabel: 'SpeedDecorator',
    effect: 'Ajoute un buff de mobilite visible immediatement dans les stats.',
    stats: { attack: 0, defense: 0, speed: 5, control: 0 },
  },
  ICE: {
    code: 'ICE',
    layerLabel: 'IceDecorator',
    effect: 'Ajoute du controle de zone et renforce legerement l offense et la defense.',
    stats: { attack: 4, defense: 4, speed: 0, control: 5 },
  },
}

export const builderProductTypes = {
  CAR: {
    code: 'CAR',
    label: 'Voiture',
    description: 'Assemble un vehicule personnalisable couche par couche dans un atelier visuel.',
    monolithicClassName: 'CarPreset',
    stageLabels: {
      SILHOUETTE: 'Chassis',
      CORE: 'Motorisation',
      ADDON: 'Module',
      FINISH: 'Finition',
    },
  },
  CHARACTER: {
    code: 'CHARACTER',
    label: 'Personnage',
    description: 'Assemble un hero modulaire avec equipement, support et finition.',
    monolithicClassName: 'HeroPreset',
    stageLabels: {
      SILHOUETTE: 'Silhouette',
      CORE: 'Noyau de role',
      ADDON: 'Accessoire',
      FINISH: 'Aura finale',
    },
  },
  HOUSE: {
    code: 'HOUSE',
    label: 'Maison',
    description: 'Assemble une maison progressive en posant structure, energie, extension et facade.',
    monolithicClassName: 'HousePreset',
    stageLabels: {
      SILHOUETTE: 'Structure',
      CORE: 'Noyau technique',
      ADDON: 'Extension',
      FINISH: 'Facade finale',
    },
  },
}

export const builderSilhouettes = {
  COMPACT: {
    code: 'COMPACT',
    stats: { agility: 5, resilience: 1, utility: 2, style: 2 },
    labels: {
      CAR: 'Sprint Chassis',
      CHARACTER: 'Agile Silhouette',
      HOUSE: 'Plan Compact',
    },
    details: {
      CAR: '{name} recoit un chassis court et nerveux, ideal pour l agilite.',
      CHARACTER: '{name} commence comme un profil rapide axe esquive et initiative.',
      HOUSE: '{name} pose une emprise reduite et un plan court a optimiser.',
    },
  },
  BALANCED: {
    code: 'BALANCED',
    stats: { agility: 3, resilience: 3, utility: 3, style: 2 },
    labels: {
      CAR: 'Touring Frame',
      CHARACTER: 'Balanced Stance',
      HOUSE: 'Pavillon Familial',
    },
    details: {
      CAR: '{name} prend un gabarit polyvalent facile a faire evoluer.',
      CHARACTER: '{name} demarre sur un profil souple qui ne sacrifie aucun axe.',
      HOUSE: '{name} se construit sur une base habitable bien repartie.',
    },
  },
  GRAND: {
    code: 'GRAND',
    stats: { agility: 1, resilience: 5, utility: 4, style: 3 },
    labels: {
      CAR: 'Titan Chassis',
      CHARACTER: 'Guardian Bulk',
      HOUSE: 'Manoir Panorama',
    },
    details: {
      CAR: '{name} adopte une base large, stable et orientee capacite.',
      CHARACTER: '{name} nait avec une stature massive tailee pour tenir la ligne.',
      HOUSE: '{name} lance une fondation ample destinee a porter plus d usages.',
    },
  },
}

export const builderCoreModules = {
  ELECTRIC: {
    code: 'ELECTRIC',
    stats: { agility: 4, resilience: 1, utility: 4, style: 2 },
    labels: {
      CAR: 'Electric Engine',
      CHARACTER: 'Volt Arsenal',
      HOUSE: 'Battery Core',
    },
    details: {
      CAR: 'Le moteur electrique donne a {name} des reprises propres et une bonne utilite.',
      CHARACTER: 'Le noyau electrique arme {name} pour des engagements rapides.',
      HOUSE: 'Le coeur batterie apporte a {name} un socle technique compact et pratique.',
    },
  },
  ARCANE: {
    code: 'ARCANE',
    stats: { agility: 2, resilience: 2, utility: 5, style: 4 },
    labels: {
      CAR: 'Arcane Turbine',
      CHARACTER: 'Arcane Focus',
      HOUSE: 'Arcane Hearth',
    },
    details: {
      CAR: 'La turbine arcane pousse {name} vers un profil plus spectaculaire et technique.',
      CHARACTER: 'Le focus arcane ouvre des capacites de controle et de polyvalence.',
      HOUSE: 'L atre arcane transforme {name} en maison experientielle et expressive.',
    },
  },
  SOLAR: {
    code: 'SOLAR',
    stats: { agility: 1, resilience: 3, utility: 4, style: 5 },
    labels: {
      CAR: 'Solar Roof Core',
      CHARACTER: 'Solar Totem',
      HOUSE: 'Solar Atrium',
    },
    details: {
      CAR: 'Le coeur solaire augmente l autonomie et l identite visuelle du vehicule.',
      CHARACTER: 'Le totem solaire stabilise {name} et renforce son aura.',
      HOUSE: 'L atrium solaire augmente l autonomie et la signature architecturale.',
    },
  },
}

export const builderAddonModules = {
  DEFENSE: {
    code: 'DEFENSE',
    stats: { agility: 0, resilience: 5, utility: 1, style: 1 },
    labels: {
      CAR: 'Shield Plating',
      CHARACTER: 'Bastion Guard',
      HOUSE: 'Defensive Tower',
    },
    details: {
      CAR: '{name} gagne des renforts protecteurs sans refaire toute la structure.',
      CHARACTER: '{name} recoit une couche defensive orientee tenue de ligne.',
      HOUSE: '{name} ajoute une protection peripherique et un signal de solidite.',
    },
  },
  MOBILITY: {
    code: 'MOBILITY',
    stats: { agility: 4, resilience: 0, utility: 2, style: 2 },
    labels: {
      CAR: 'Booster Pack',
      CHARACTER: 'Dash Harness',
      HOUSE: 'Garage Bridge',
    },
    details: {
      CAR: '{name} recoit un module de poussee pour mieux se projeter.',
      CHARACTER: '{name} obtient de nouveaux outils de deplacement et de rythme.',
      HOUSE: '{name} facilite les circulations avec un acces ou une annexe mobile.',
    },
  },
  SUPPORT: {
    code: 'SUPPORT',
    stats: { agility: 1, resilience: 1, utility: 4, style: 1 },
    labels: {
      CAR: 'Utility Rack',
      CHARACTER: 'Support Drone',
      HOUSE: 'Workshop Garden',
    },
    details: {
      CAR: '{name} embarque de l outillage et du support sans casser la base.',
      CHARACTER: '{name} est accompagne d un support qui elargit ses usages.',
      HOUSE: '{name} etend ses usages avec un atelier ou une zone complementaire.',
    },
  },
}

export const builderFinishStyles = {
  CLASSIC: {
    code: 'CLASSIC',
    stats: { agility: 0, resilience: 1, utility: 1, style: 2 },
    labels: {
      CAR: 'Classic Paint',
      CHARACTER: 'Heritage Cape',
      HOUSE: 'Traditional Facade',
    },
    details: {
      CAR: 'La finition classique donne a {name} une lecture immediate et rassurante.',
      CHARACTER: '{name} termine son build sur un rendu heroique et lisible.',
      HOUSE: '{name} affiche une facade lisible et intemporelle.',
    },
  },
  NEON: {
    code: 'NEON',
    stats: { agility: 1, resilience: 0, utility: 1, style: 4 },
    labels: {
      CAR: 'Neon Livery',
      CHARACTER: 'Neon Aura',
      HOUSE: 'Neon Facade',
    },
    details: {
      CAR: 'La finition neon rend {name} spectaculaire et tres lisible en demo.',
      CHARACTER: '{name} se ferme sur une aura vive qui dramatise le profil.',
      HOUSE: '{name} assume une facade expressive et plus audacieuse.',
    },
  },
  ECO: {
    code: 'ECO',
    stats: { agility: 0, resilience: 1, utility: 2, style: 3 },
    labels: {
      CAR: 'Eco Trim',
      CHARACTER: 'Verdant Aura',
      HOUSE: 'Eco Facade',
    },
    details: {
      CAR: 'La finition eco met en avant la sobriete et les usages durables.',
      CHARACTER: '{name} obtient une identite plus organique et durable.',
      HOUSE: '{name} conclut son chantier avec une facade orientee durabilite.',
    },
  },
}

export const adapterScenarios = {
  VGA_TO_HDMI: {
    code: 'VGA_TO_HDMI',
    label: 'Legacy console -> Smart screen',
    sourceSystem: 'LegacyConsole',
    sourceInterface: 'VGA output',
    sourceProtocol: 'Analog video',
    sourceSignalTemplate: '%s :: 640x480 analog frame',
    adapterClassName: 'VgaToHdmiAdapter',
    adapterRole: 'Convertit un flux VGA analogique vers une sortie HDMI comprise par l ecran moderne.',
    targetSystem: 'SmartScreen',
    targetInterface: 'HDMI input',
    targetProtocol: 'HDMI digital',
    adaptedSignalTemplate: '%s :: HDMI 1080p bridge',
    failureReason: 'Le SmartScreen attend une entree HDMI numerique. Un branchement direct VGA echoue.',
    successDetail: 'L adaptateur encapsule le signal analogique et expose une sortie HDMI exploitable.',
  },
  SERIAL_TO_REST: {
    code: 'SERIAL_TO_REST',
    label: 'Factory sensor -> Cloud dashboard',
    sourceSystem: 'FactorySensor',
    sourceInterface: 'RS-232 port',
    sourceProtocol: 'Serial frames',
    sourceSignalTemplate: 'FRAME[%s]|crc=42',
    adapterClassName: 'SerialToRestAdapter',
    adapterRole: 'Traduit des trames serie vers un appel REST JSON attendu par le dashboard cloud.',
    targetSystem: 'CloudDashboard',
    targetInterface: 'HTTPS endpoint',
    targetProtocol: 'REST JSON',
    adaptedSignalTemplate: '{"event":"%s","transport":"https"}',
    failureReason: 'Le dashboard cloud attend une requete REST JSON. Une trame serie brute ne peut pas etre consommee telle quelle.',
    successDetail: 'L adaptateur mappe la trame serie et publie un payload JSON sur l endpoint HTTP cible.',
  },
  XML_TO_JSON: {
    code: 'XML_TO_JSON',
    label: 'Legacy CRM -> Mobile API',
    sourceSystem: 'LegacyCRM',
    sourceInterface: 'SOAP XML feed',
    sourceProtocol: 'XML envelope',
    sourceSignalTemplate: '<event><label>%s</label></event>',
    adapterClassName: 'XmlToJsonAdapter',
    adapterRole: 'Traduit un message XML historique vers un DTO JSON accepte par une API mobile moderne.',
    targetSystem: 'MobileApi',
    targetInterface: 'JSON endpoint',
    targetProtocol: 'REST JSON',
    adaptedSignalTemplate: '{"label":"%s","source":"legacy-crm"}',
    failureReason: 'L API mobile ne parle pas SOAP XML. Le contrat cible impose un payload JSON simple.',
    successDetail: 'L adaptateur consomme le XML historique et renvoie un DTO JSON compatible avec l API.',
  },
}

export function normalizeInteger(value, fallbackValue, minimum, maximum) {
  const parsed = Math.round(Number(value ?? fallbackValue))

  if (!Number.isFinite(parsed)) {
    return fallbackValue
  }

  return Math.min(maximum, Math.max(minimum, parsed))
}

export function formatAdapterSignal(template, payloadLabel) {
  return template.replace('%s', payloadLabel)
}

export function createAdapterStep(index, stageCode, title, systemLabel, protocolLabel, signalLabel, detail, success) {
  return {
    index,
    stageCode,
    title,
    systemLabel,
    protocolLabel,
    signalLabel,
    detail,
    success,
  }
}

export function buildAdapterVisualization(scenario, sourceSignal, adaptedSignal, compatible) {
  return {
    nodes: [
      {
        id: 'source',
        label: scenario.sourceSystem,
        type: 'client',
        data: { detail: scenario.sourceProtocol },
      },
      {
        id: 'source-port',
        label: scenario.sourceInterface,
        type: 'component',
        data: { detail: sourceSignal },
      },
      {
        id: 'adapter',
        label: compatible ? scenario.adapterClassName : 'NoAdapter',
        type: 'decorator',
        data: { detail: compatible ? 'conversion bridge' : 'missing translation' },
      },
      {
        id: 'target-port',
        label: scenario.targetInterface,
        type: 'strategy',
        data: { detail: scenario.targetProtocol },
      },
      {
        id: 'target',
        label: scenario.targetSystem,
        type: 'observer',
        data: { detail: compatible ? adaptedSignal : 'incompatible input' },
      },
      {
        id: 'result',
        label: compatible ? 'Compatible' : 'Rejected',
        type: 'output',
        data: { message: compatible ? scenario.successDetail : scenario.failureReason },
      },
    ],
    edges: compatible
      ? [
          { from: 'source', to: 'source-port', label: 'emit' },
          { from: 'source-port', to: 'adapter', label: 'adapt' },
          { from: 'adapter', to: 'target-port', label: 'convert' },
          { from: 'target-port', to: 'target', label: 'deliver' },
          { from: 'target', to: 'result', label: 'ready' },
        ]
      : [
          { from: 'source', to: 'source-port', label: 'emit' },
          { from: 'source-port', to: 'target-port', label: 'mismatch' },
          { from: 'target-port', to: 'target', label: 'reject' },
          { from: 'target', to: 'result', label: 'stop' },
        ],
  }
}

export function roundToSingleDecimal(value) {
  return Math.round(value * 10) / 10
}

export function distributeObjects(objectCount, variantCount, variantIndex) {
  const base = Math.floor(objectCount / variantCount)
  const remainder = objectCount % variantCount
  return base + (variantIndex < remainder ? 1 : 0)
}

export function normalizeUniqueList(rawValue) {
  return (Array.isArray(rawValue) ? rawValue : `${rawValue ?? ''}`.split(','))
    .map((value) => `${value}`.trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
}

export function normalizeOrderedList(rawValue) {
  return (Array.isArray(rawValue) ? rawValue : `${rawValue ?? ''}`.split(','))
    .map((value) => `${value}`.trim())
    .filter(Boolean)
}

export function normalizeOrderedUniqueList(rawValue) {
  return normalizeOrderedList(rawValue)
    .map((value) => value.toUpperCase())
    .filter((value, index, array) => array.indexOf(value) === index)
}

export const stateActionLabels = {
  START_RUN: 'Courir',
  STOP: 'Stop',
  JUMP: 'Sauter',
  LAND: 'Atterrir',
  ATTACK: 'Attaquer',
  FINISH_ATTACK: 'Fin attaque',
}

export const stateDefinitions = {
  IDLE: {
    label: 'Idle',
    availableActions: ['START_RUN', 'JUMP', 'ATTACK'],
  },
  RUNNING: {
    label: 'Running',
    availableActions: ['STOP', 'JUMP', 'ATTACK'],
  },
  JUMPING: {
    label: 'Jumping',
    availableActions: ['LAND'],
  },
  ATTACKING: {
    label: 'Attacking',
    availableActions: ['FINISH_ATTACK'],
  },
}

export const commandActionLabels = {
  ADD_BEACON: 'Ajouter balise',
  MOVE_RIGHT: 'Deplacer a droite',
  MOVE_UP: 'Monter',
  MOVE_LEFT: 'Deplacer a gauche',
  DELETE_BEACON: 'Supprimer balise',
  UNDO: 'Undo',
  REDO: 'Redo',
}

export const chainTokenStates = {
  VALID: {
    code: 'VALID',
    label: 'Token valide',
  },
  EXPIRED: {
    code: 'EXPIRED',
    label: 'Token expire',
  },
  MISSING: {
    code: 'MISSING',
    label: 'Token manquant',
  },
}

export const chainPayloadStates = {
  VALID: {
    code: 'VALID',
    label: 'Payload valide',
  },
  INVALID: {
    code: 'INVALID',
    label: 'Payload invalide',
  },
}

export const chainProcessingTargets = {
  REPORT_EXPORT: {
    code: 'REPORT_EXPORT',
    label: 'Export de rapport',
    handledMessage: 'Le service de reporting genere le fichier demande.',
  },
  BULK_IMPORT: {
    code: 'BULK_IMPORT',
    label: 'Import en masse',
    handledMessage: 'Le service d import planifie le traitement des donnees.',
  },
  PASSWORD_RESET: {
    code: 'PASSWORD_RESET',
    label: 'Reinitialisation de mot de passe',
    handledMessage: 'Le service IAM emet un jeton de reinitialisation.',
  },
}

export function normalizeMediatorParticipants(rawValue, senderName) {
  const values = normalizeUniqueList(rawValue)

  if (!values.includes(senderName)) {
    return normalizeUniqueList([senderName, ...values])
  }

  return values
}

export function createMediatorVisualization(useMediator, roomName, senderName, recipients, message) {
  const nodes = [
    {
      id: 'sender',
      label: senderName,
      type: 'client',
      data: { detail: 'expediteur' },
    },
    {
      id: 'mediator',
      label: useMediator ? 'ChatRoomMediator' : 'Mediator bypassed',
      type: 'context',
      data: { detail: roomName },
    },
    ...recipients.map((recipient, index) => ({
      id: `recipient-${index}`,
      label: recipient,
      type: 'observer',
      data: { detail: 'colleague' },
    })),
    {
      id: 'result',
      label: 'Deliveries',
      type: 'output',
      data: { message },
    },
  ]

  const edges = useMediator
    ? [
        { from: 'sender', to: 'mediator', label: 'send' },
        ...recipients.map((_, index) => ({ from: 'mediator', to: `recipient-${index}`, label: 'relay' })),
        { from: 'mediator', to: 'result', label: 'summary' },
      ]
    : [
        ...recipients.map((_, index) => ({ from: 'sender', to: `recipient-${index}`, label: 'direct' })),
        { from: 'sender', to: 'result', label: 'summary' },
      ]

  return { nodes, edges }
}

export function createChainStep(index, handlerCode, handlerLabel, status, passed, detail) {
  return {
    index,
    handlerCode,
    handlerLabel,
    status,
    passed,
    detail,
  }
}

export function buildChainVisualization(useChain, requestName, tokenLabel, payloadLabel, processingLabel, steps, accepted) {
  const activeHandler = steps[steps.length - 1]?.handlerCode ?? 'AUTH'

  return {
    nodes: [
      {
        id: 'request',
        label: requestName,
        type: 'client',
        data: { detail: processingLabel },
      },
      {
        id: 'controller',
        label: useChain ? 'Handler chain' : 'RequestController',
        type: 'context',
        data: { detail: useChain ? 'maillons relies' : 'if / else centralises' },
      },
      {
        id: 'auth',
        label: useChain ? 'AuthenticationHandler' : 'Auth check',
        type: 'decorator',
        data: { detail: tokenLabel, active: activeHandler === 'AUTH' },
      },
      {
        id: 'validation',
        label: useChain ? 'ValidationHandler' : 'Validation check',
        type: 'decorator',
        data: { detail: payloadLabel, active: activeHandler === 'VALIDATION' },
      },
      {
        id: 'processing',
        label: useChain ? 'ProcessingHandler' : 'Processing branch',
        type: 'component',
        data: { detail: processingLabel, active: activeHandler === 'PROCESSING' },
      },
      {
        id: 'result',
        label: accepted ? 'Requete acceptee' : 'Requete rejetee',
        type: 'output',
        data: { message: steps[steps.length - 1]?.detail ?? '' },
      },
    ],
    edges: useChain
      ? [
          { from: 'request', to: 'auth', label: 'enter' },
          { from: 'auth', to: 'validation', label: 'pass' },
          { from: 'validation', to: 'processing', label: 'pass' },
          { from: 'processing', to: 'result', label: accepted ? 'handle' : 'stop' },
        ]
      : [
          { from: 'request', to: 'controller', label: 'dispatch' },
          { from: 'controller', to: 'auth', label: 'check' },
          { from: 'controller', to: 'validation', label: 'check' },
          { from: 'controller', to: 'processing', label: 'branch' },
          { from: 'processing', to: 'result', label: accepted ? 'handle' : 'stop' },
        ],
  }
}

export function createCommandBoard(boardName, actorName, gridSize = 5) {
  return {
    boardName,
    actorName,
    gridSize,
    x: 0,
    y: 0,
    beaconCount: 0,
  }
}

export function snapshotCommandBoard(board) {
  return {
    x: board.x,
    y: board.y,
    beaconCount: board.beaconCount,
  }
}

export function restoreCommandBoard(board, snapshot) {
  board.x = snapshot.x
  board.y = snapshot.y
  board.beaconCount = snapshot.beaconCount
}

export function applyCommandBoardAction(board, actionCode) {
  switch (actionCode) {
    case 'ADD_BEACON':
      board.beaconCount += 1
      break
    case 'MOVE_RIGHT':
      board.x = Math.min(board.gridSize - 1, board.x + 1)
      break
    case 'MOVE_UP':
      board.y = Math.min(board.gridSize - 1, board.y + 1)
      break
    case 'MOVE_LEFT':
      board.x = Math.max(0, board.x - 1)
      break
    case 'DELETE_BEACON':
      board.beaconCount = Math.max(0, board.beaconCount - 1)
      break
    default:
      break
  }
}

export function createCommandEntry(rawEntry) {
  const actionCode = typeof rawEntry === 'string'
    ? rawEntry
    : `${rawEntry?.actionCode ?? rawEntry?.code ?? 'COMMAND'}`

  return {
    actionCode,
    actionLabel: commandActionLabels[actionCode] ?? actionCode,
    commandClass: `${actionCode
      .toLowerCase()
      .split('_')
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join('')}Command`,
  }
}

export function createCommandStep(index, actionCode, operationType, accepted, detail, board, undoStack, redoStack) {
  return {
    index,
    actionCode,
    actionLabel: commandActionLabels[actionCode] ?? actionCode,
    operationType,
    accepted,
    detail,
    positionX: board.x,
    positionY: board.y,
    beaconCount: board.beaconCount,
    undoDepth: undoStack.length,
    redoDepth: redoStack.length,
    undoStack: undoStack.map(createCommandEntry),
    redoStack: redoStack.map(createCommandEntry),
  }
}

export function commandExecutionDetail(actorName, actionCode) {
  switch (actionCode) {
    case 'ADD_BEACON':
      return `${actorName} depose une balise sur la grille.`
    case 'MOVE_RIGHT':
      return `${actorName} avance d une case vers la droite.`
    case 'MOVE_UP':
      return `${actorName} monte d une case.`
    case 'MOVE_LEFT':
      return `${actorName} recule d une case vers la gauche.`
    case 'DELETE_BEACON':
      return `${actorName} retire une balise active.`
    default:
      return 'Action executee.'
  }
}

export function commandDirectDetail(actorName, actionCode) {
  switch (actionCode) {
    case 'ADD_BEACON':
      return `${actorName} ajoute directement une balise sans objet commande.`
    case 'MOVE_RIGHT':
      return `${actorName} est deplace a droite par le controleur direct.`
    case 'MOVE_UP':
      return `${actorName} est deplace vers le haut par le controleur direct.`
    case 'MOVE_LEFT':
      return `${actorName} est deplace a gauche par le controleur direct.`
    case 'DELETE_BEACON':
      return `${actorName} supprime une balise par appel direct.`
    default:
      return 'Mutation directe.'
  }
}

export function buildCommandVisualization(useCommand, board, undoStack, redoStack) {
  return {
    nodes: [
      {
        id: 'controller',
        label: useCommand ? 'CommandInvoker' : 'DirectController',
        type: 'context',
        data: { detail: useCommand ? 'dispatch + history' : 'mutations directes' },
      },
      {
        id: 'command',
        label: useCommand ? 'BoardCommand' : 'Inline actions',
        type: 'cluster',
        data: { detail: useCommand ? 'actions encapsulees' : 'aucun objet commande' },
      },
      {
        id: 'receiver',
        label: 'ArenaBoard',
        type: 'component',
        data: { detail: `${board.actorName} sur ${board.boardName}` },
      },
      {
        id: 'undo',
        label: 'Undo stack',
        type: 'decorator',
        data: { detail: `${undoStack.length} commande(s)` },
      },
      {
        id: 'redo',
        label: 'Redo stack',
        type: 'decorator',
        data: { detail: `${redoStack.length} commande(s)` },
      },
      {
        id: 'result',
        label: 'Etat final',
        type: 'output',
        data: { message: `x=${board.x} y=${board.y} balises=${board.beaconCount}` },
      },
    ],
    edges: [
      { from: 'controller', to: 'command', label: useCommand ? 'dispatch' : 'inline' },
      { from: 'command', to: 'receiver', label: useCommand ? 'execute' : 'mutate' },
      { from: 'receiver', to: 'result', label: 'state' },
      { from: 'controller', to: 'undo', label: useCommand ? 'push/pop' : 'empty' },
      { from: 'controller', to: 'redo', label: useCommand ? 'redo' : 'empty' },
    ],
  }
}

export function simulateStateTransition(currentState, actionCode, characterName) {
  switch (currentState) {
    case 'IDLE':
      if (actionCode === 'START_RUN') {
        return {
          nextState: 'RUNNING',
          accepted: true,
          detail: `${characterName} quitte Idle et passe en Running.`,
        }
      }

      if (actionCode === 'JUMP') {
        return {
          nextState: 'JUMPING',
          accepted: true,
          detail: `${characterName} saute depuis Idle et entre en Jumping.`,
        }
      }

      if (actionCode === 'ATTACK') {
        return {
          nextState: 'ATTACKING',
          accepted: true,
          detail: `${characterName} declenche une attaque depuis Idle.`,
        }
      }
      break
    case 'RUNNING':
      if (actionCode === 'STOP') {
        return {
          nextState: 'IDLE',
          accepted: true,
          detail: `${characterName} s arrete et revient en Idle.`,
        }
      }

      if (actionCode === 'JUMP') {
        return {
          nextState: 'JUMPING',
          accepted: true,
          detail: `${characterName} saute en gardant son elan et passe en Jumping.`,
        }
      }

      if (actionCode === 'ATTACK') {
        return {
          nextState: 'ATTACKING',
          accepted: true,
          detail: `${characterName} interrompt sa course pour attaquer.`,
        }
      }
      break
    case 'JUMPING':
      if (actionCode === 'LAND') {
        return {
          nextState: 'IDLE',
          accepted: true,
          detail: `${characterName} atterrit et repasse en Idle.`,
        }
      }
      break
    case 'ATTACKING':
      if (actionCode === 'FINISH_ATTACK') {
        return {
          nextState: 'IDLE',
          accepted: true,
          detail: `${characterName} termine son attaque et revient en Idle.`,
        }
      }
      break
    default:
      break
  }

  const actionLabel = stateActionLabels[actionCode] ?? actionCode
  return {
    nextState: currentState,
    accepted: false,
    detail: `${actionLabel} est ignoree tant que ${characterName} est en ${stateDefinitions[currentState]?.label ?? currentState}.`,
  }
}

export function buildFlyweightVisualization({
  assetLabel,
  currentMemoryKb,
  objectCount,
  performanceLabel,
  realInstances,
  useFlyweight,
  variantCount,
  baselineMemoryKb,
}) {
  return {
    nodes: [
      {
        id: 'scene',
        label: `${objectCount} ${assetLabel.toLowerCase()}`,
        type: 'cluster',
        data: { detail: useFlyweight ? 'etat extrinseque par objet' : 'etat complet duplique' },
      },
      {
        id: 'factory',
        label: 'SceneObjectFlyweightFactory',
        type: 'pool',
        data: { detail: useFlyweight ? 'cache actif' : 'cache contourne' },
      },
      {
        id: 'metrics',
        label: 'Memoire',
        type: 'output',
        data: { message: `${currentMemoryKb} KB / ${baselineMemoryKb} KB - ${performanceLabel}` },
      },
      ...Array.from({ length: Math.min(variantCount, 4) }, (_, index) => ({
        id: `flyweight-${index + 1}`,
        label: `${assetLabel} ${index + 1}`,
        type: 'flyweight',
        data: {
          detail: useFlyweight
            ? 'instance partagee'
            : `${distributeObjects(objectCount, variantCount, index)} copie(s) independante(s)`,
        },
      })),
      {
        id: 'instances',
        label: `${realInstances} instance(s)`,
        type: 'memory',
        data: { message: useFlyweight ? 'partage actif' : 'duplication totale' },
      },
    ],
    edges: [
      { from: 'scene', to: 'factory', label: 'spawn' },
      { from: 'factory', to: 'metrics', label: 'measure' },
      ...Array.from({ length: Math.min(variantCount, 4) }, (_, index) => ({
        from: 'factory',
        to: `flyweight-${index + 1}`,
        label: useFlyweight ? 'share' : 'copy',
      })),
      { from: 'scene', to: 'instances', label: 'allocate' },
    ],
  }
}

export function numericStat(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function addDecoratorStats(baseStats, bonusStats) {
  return {
    attack: numericStat(baseStats.attack) + numericStat(bonusStats.attack),
    defense: numericStat(baseStats.defense) + numericStat(bonusStats.defense),
    speed: numericStat(baseStats.speed) + numericStat(bonusStats.speed),
    control: numericStat(baseStats.control) + numericStat(bonusStats.control),
  }
}

export function buildDecoratorVisualization(baseProfile, stack, finalStats, challengeMet) {
  const decoratorLayers = stack.slice(1)
  const nodes = [
    {
      id: 'base',
      label: baseProfile.label,
      type: 'component',
      data: { detail: 'composant de base' },
    },
  ]
  const edges = []

  let wrappedId = 'base'
  let outermostId = 'base'

  decoratorLayers.forEach((layer, index) => {
    const nodeId = `decorator-${index + 1}`
    nodes.push({
      id: nodeId,
      label: layer.layerLabel,
      type: 'decorator',
      data: { detail: layer.effect },
    })
    edges.push({
      from: nodeId,
      to: wrappedId,
      label: 'wraps',
    })
    wrappedId = nodeId
    outermostId = nodeId
  })

  nodes.push({
    id: 'result',
    label: challengeMet ? 'Build valide' : 'Build final',
    type: 'output',
    data: {
      message: `ATK ${finalStats.attack} / DEF ${finalStats.defense} / SPD ${finalStats.speed} / CTRL ${finalStats.control}`,
    },
  })
  edges.push({
    from: outermostId,
    to: 'result',
    label: 'render',
  })

  return { nodes, edges }
}

export function addBuilderStats(baseStats, bonusStats) {
  return {
    agility: numericStat(baseStats.agility) + numericStat(bonusStats.agility),
    resilience: numericStat(baseStats.resilience) + numericStat(bonusStats.resilience),
    utility: numericStat(baseStats.utility) + numericStat(bonusStats.utility),
    style: numericStat(baseStats.style) + numericStat(bonusStats.style),
  }
}

export function fillBuilderTemplate(template, buildName) {
  return `${template ?? ''}`.replaceAll('{name}', buildName)
}

export function createBuilderStage(product, stageCode, option, buildName, runningStats) {
  const nextStats = addBuilderStats(runningStats, option.stats)

  return {
    stage: {
      index: ['SILHOUETTE', 'CORE', 'ADDON', 'FINISH'].indexOf(stageCode) + 1,
      stageCode,
      stageLabel: product.stageLabels[stageCode],
      optionCode: option.code,
      optionLabel: option.labels[product.code],
      detail: fillBuilderTemplate(option.details[product.code], buildName),
      deltaAgility: option.stats.agility,
      deltaResilience: option.stats.resilience,
      deltaUtility: option.stats.utility,
      deltaStyle: option.stats.style,
      agility: nextStats.agility,
      resilience: nextStats.resilience,
      utility: nextStats.utility,
      style: nextStats.style,
      totalScore: nextStats.agility + nextStats.resilience + nextStats.utility + nextStats.style,
    },
    nextStats,
  }
}

export function buildBuilderVisualization(product, stages, readyLabel, useBuilder, buildName, finalStats) {
  const nodes = [
    {
      id: 'client',
      label: 'Client',
      type: 'client',
      data: { detail: buildName },
    },
  ]

  if (useBuilder) {
    nodes.push(
      {
        id: 'director',
        label: 'ArtifactDirector',
        type: 'context',
        data: { detail: 'orchestration stable' },
      },
      {
        id: 'builder',
        label: 'WorkshopArtifactBuilder',
        type: 'factory',
        data: { detail: product.label },
      },
      ...stages.map((stage) => ({
        id: `stage-${stage.stageCode.toLowerCase()}`,
        label: stage.optionLabel,
        type: 'component',
        data: { detail: stage.stageLabel },
      })),
      {
        id: 'product',
        label: product.label,
        type: 'product',
        data: { detail: buildName },
      },
      {
        id: 'result',
        label: readyLabel,
        type: 'output',
        data: {
          message: `AGI ${finalStats.agility} / RES ${finalStats.resilience} / UTI ${finalStats.utility} / STYLE ${finalStats.style}`,
        },
      },
    )

    return {
      nodes,
      edges: [
        { from: 'client', to: 'director', label: 'request' },
        { from: 'director', to: 'builder', label: 'orchestrates' },
        ...stages.map((stage) => ({
          from: `stage-${stage.stageCode.toLowerCase()}`,
          to: 'builder',
          label: 'step',
        })),
        { from: 'builder', to: 'product', label: 'build' },
        { from: 'product', to: 'result', label: 'ready' },
      ],
    }
  }

  nodes.push(
    {
      id: 'constructor',
      label: product.monolithicClassName,
      type: 'context',
      data: { detail: 'constructeur geant' },
    },
    ...stages.map((stage) => ({
      id: `param-${stage.stageCode.toLowerCase()}`,
      label: stage.optionLabel,
      type: 'component',
      data: { detail: 'parametre' },
    })),
    {
      id: 'product',
      label: product.label,
      type: 'product',
      data: { detail: buildName },
    },
    {
      id: 'result',
      label: readyLabel,
      type: 'output',
      data: {
        message: `AGI ${finalStats.agility} / RES ${finalStats.resilience} / UTI ${finalStats.utility} / STYLE ${finalStats.style}`,
      },
    },
  )

  return {
    nodes,
    edges: [
      { from: 'client', to: 'constructor', label: 'new(...)' },
      ...stages.map((stage) => ({
        from: `param-${stage.stageCode.toLowerCase()}`,
        to: 'constructor',
        label: 'param',
      })),
      { from: 'constructor', to: 'product', label: 'instantiate' },
      { from: 'product', to: 'result', label: 'ready' },
    ],
  }
}
