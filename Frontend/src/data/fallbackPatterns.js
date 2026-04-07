export const fallbackPatterns = [
  {
    code: 'mediator',
    name: 'Mediator',
    type: 'BEHAVIORAL',
    description: "Centralise les echanges entre plusieurs objets pour qu ils passent par un hub commun au lieu de se connaitre tous directement.",
    useCase: "Construire un chat multijoueur ou les messages transitent par un salon central pour reduire le couplage entre participants.",
    complexityLevel: 'INTERMEDIATE',
  },
  {
    code: 'chain',
    name: 'Chain of Responsibility',
    type: 'BEHAVIORAL',
    description: "Fait circuler une requete dans une chaine de handlers capables de la laisser passer, de la bloquer ou de la traiter.",
    useCase: "Visualiser un pipeline auth -> validation -> traitement ou chaque maillon prend une decision locale sans gros controller central.",
    complexityLevel: 'INTERMEDIATE',
  },
  {
    code: 'command',
    name: 'Command',
    type: 'BEHAVIORAL',
    description: "Encapsule une action dans un objet pour pouvoir la declencher, l historiser, l annuler et la rejouer sans coupler l interface au receiver.",
    useCase: "Construire un simulateur undo / redo, un editeur ou un mini jeu d actions historisees avec piles de commandes.",
    complexityLevel: 'INTERMEDIATE',
  },
  {
    code: 'singleton',
    name: 'Singleton',
    type: 'CREATIONAL',
    description: "Garantit qu un service central ne possede qu une seule instance partagee dans toute l application.",
    useCase: "Partager la meme configuration globale, le meme logger ou le meme gestionnaire audio entre plusieurs clients.",
    complexityLevel: 'BEGINNER',
  },
  {
    code: 'state',
    name: 'State',
    type: 'BEHAVIORAL',
    description: "Fait varier le comportement d un contexte selon son etat interne sans multiplier les conditions dans le code client.",
    useCase: "Piloter une machine a etats de personnage, un workflow ou un cycle de vie UI avec des transitions explicites.",
    complexityLevel: 'INTERMEDIATE',
  },
  {
    code: 'flyweight',
    name: 'Flyweight',
    type: 'STRUCTURAL',
    description: "Partage l etat intrinseque entre de nombreux objets pour eviter de multiplier les instances lourdes en memoire.",
    useCase: "Afficher des milliers d arbres, particules ou projectiles en mutualisant textures, meshes et autres donnees communes.",
    complexityLevel: 'ADVANCED',
  },
  {
    code: 'decorator',
    name: 'Decorator',
    type: 'STRUCTURAL',
    description: "Ajoute des comportements a un objet en l enveloppant avec des couches successives, sans modifier sa classe d origine.",
    useCase: "Empiler des power-ups sur un personnage, enrichir un cafe customisable ou combiner des effets sans explosion de classes.",
    complexityLevel: 'INTERMEDIATE',
  },
  {
    code: 'factory',
    name: 'Factory Method',
    type: 'CREATIONAL',
    description: "Centralise la creation d objets derriere une fabrique specialisee.",
    useCase: "Choisir dynamiquement le bon type de vehicule sans dupliquer des constructeurs.",
    complexityLevel: 'BEGINNER',
  },
  {
    code: 'observer',
    name: 'Observer',
    type: 'BEHAVIORAL',
    description: "Relie un sujet a plusieurs abonnes qui recoivent automatiquement chaque notification.",
    useCase: "Propager un evenement de publication a plusieurs consommateurs sans les coupler entre eux.",
    complexityLevel: 'INTERMEDIATE',
  },
  {
    code: 'strategy',
    name: 'Strategy',
    type: 'BEHAVIORAL',
    description: "Permet de changer un algorithme a l execution sans modifier le contexte.",
    useCase: "Basculer entre plusieurs modes de paiement dans un meme workflow.",
    complexityLevel: 'INTERMEDIATE',
  },
]

const fallbackSchemas = {
  mediator: {
    fields: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'SELECT',
        required: true,
        allowedValues: ['WITH_MEDIATOR', 'WITHOUT_MEDIATOR'],
        defaultValue: 'WITH_MEDIATOR',
      },
      {
        name: 'roomName',
        label: 'Nom du salon',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'Arena Chat',
      },
      {
        name: 'participants',
        label: 'Participants',
        type: 'LIST',
        required: true,
        allowedValues: null,
        defaultValue: 'Luna, Kiro, Nova',
      },
      {
        name: 'senderName',
        label: 'Expediteur',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'Luna',
      },
      {
        name: 'message',
        label: 'Message',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'Focus target center lane',
      },
    ],
  },
  chain: {
    fields: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'SELECT',
        required: true,
        allowedValues: ['WITH_CHAIN', 'WITHOUT_CHAIN'],
        defaultValue: 'WITH_CHAIN',
      },
      {
        name: 'requestName',
        label: 'Nom de la requete',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'Export mensuel',
      },
      {
        name: 'tokenState',
        label: 'Etat du token',
        type: 'SELECT',
        required: true,
        allowedValues: ['VALID', 'EXPIRED', 'MISSING'],
        defaultValue: 'VALID',
      },
      {
        name: 'payloadState',
        label: 'Etat du payload',
        type: 'SELECT',
        required: true,
        allowedValues: ['VALID', 'INVALID'],
        defaultValue: 'VALID',
      },
      {
        name: 'processingTarget',
        label: 'Traitement cible',
        type: 'SELECT',
        required: true,
        allowedValues: ['REPORT_EXPORT', 'BULK_IMPORT', 'PASSWORD_RESET'],
        defaultValue: 'REPORT_EXPORT',
      },
    ],
  },
  command: {
    fields: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'SELECT',
        required: true,
        allowedValues: ['WITH_COMMAND', 'WITHOUT_COMMAND'],
        defaultValue: 'WITH_COMMAND',
      },
      {
        name: 'boardName',
        label: 'Nom de la grille',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'Arena Grid',
      },
      {
        name: 'actorName',
        label: 'Nom de l agent',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'Pixel Bot',
      },
      {
        name: 'actions',
        label: 'Sequence d actions',
        type: 'LIST',
        required: true,
        allowedValues: ['ADD_BEACON', 'MOVE_RIGHT', 'MOVE_UP', 'MOVE_LEFT', 'DELETE_BEACON', 'UNDO', 'REDO'],
        defaultValue: 'ADD_BEACON, MOVE_RIGHT, MOVE_UP, UNDO, REDO, DELETE_BEACON',
      },
    ],
  },
  singleton: {
    fields: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'SELECT',
        required: true,
        allowedValues: ['WITH_SINGLETON', 'WITHOUT_SINGLETON'],
        defaultValue: 'WITH_SINGLETON',
      },
      {
        name: 'clients',
        label: 'Clients',
        type: 'LIST',
        required: true,
        allowedValues: null,
        defaultValue: 'UI Panel, Backend Job, Analytics Service',
      },
      {
        name: 'settingKey',
        label: 'Cle de configuration',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'theme',
      },
      {
        name: 'settingValue',
        label: 'Valeur appliquee',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'emerald',
      },
    ],
  },
  state: {
    fields: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'SELECT',
        required: true,
        allowedValues: ['WITH_STATE', 'WITHOUT_STATE'],
        defaultValue: 'WITH_STATE',
      },
      {
        name: 'characterName',
        label: 'Nom du personnage',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'Arena Bot',
      },
      {
        name: 'initialState',
        label: 'Etat initial',
        type: 'SELECT',
        required: true,
        allowedValues: ['IDLE', 'RUNNING', 'JUMPING', 'ATTACKING'],
        defaultValue: 'IDLE',
      },
      {
        name: 'actions',
        label: 'Sequence d actions',
        type: 'LIST',
        required: true,
        allowedValues: null,
        defaultValue: 'START_RUN, JUMP, LAND, ATTACK, FINISH_ATTACK, STOP',
      },
    ],
  },
  flyweight: {
    fields: [
      {
        name: 'assetType',
        label: 'Type d objet',
        type: 'SELECT',
        required: true,
        allowedValues: ['TREE', 'PARTICLE', 'BULLET'],
        defaultValue: 'TREE',
      },
      {
        name: 'objectCount',
        label: 'Nombre d objets',
        type: 'NUMBER',
        required: true,
        allowedValues: null,
        defaultValue: '2400',
      },
      {
        name: 'sharedVariantCount',
        label: 'Variantes partagees',
        type: 'NUMBER',
        required: true,
        allowedValues: null,
        defaultValue: '6',
      },
      {
        name: 'useFlyweight',
        label: 'Mode Flyweight',
        type: 'BOOLEAN',
        required: true,
        allowedValues: null,
        defaultValue: 'true',
      },
    ],
  },
  decorator: {
    fields: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'SELECT',
        required: true,
        allowedValues: ['WITH_DECORATOR', 'WITHOUT_DECORATOR'],
        defaultValue: 'WITH_DECORATOR',
      },
      {
        name: 'characterName',
        label: 'Nom du personnage',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'Ember Knight',
      },
      {
        name: 'baseType',
        label: 'Archetype de base',
        type: 'SELECT',
        required: true,
        allowedValues: ['WARRIOR', 'MAGE', 'ROGUE'],
        defaultValue: 'WARRIOR',
      },
      {
        name: 'decorators',
        label: 'Decorators',
        type: 'LIST',
        required: true,
        allowedValues: ['FIRE', 'SHIELD', 'SPEED', 'ICE'],
        defaultValue: 'FIRE, SHIELD',
      },
    ],
  },
  factory: {
    fields: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'SELECT',
        required: true,
        allowedValues: ['WITH_FACTORY', 'WITHOUT_FACTORY'],
        defaultValue: 'WITH_FACTORY',
      },
      {
        name: 'vehicleType',
        label: 'Type de vehicule',
        type: 'SELECT',
        required: true,
        allowedValues: ['CAR', 'BIKE'],
        defaultValue: 'CAR',
      },
    ],
  },
  strategy: {
    fields: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'SELECT',
        required: true,
        allowedValues: ['WITH_STRATEGY', 'WITHOUT_STRATEGY'],
        defaultValue: 'WITH_STRATEGY',
      },
      {
        name: 'amount',
        label: 'Montant',
        type: 'NUMBER',
        required: true,
        allowedValues: null,
        defaultValue: '100',
      },
      {
        name: 'strategy',
        label: 'Strategie',
        type: 'SELECT',
        required: true,
        allowedValues: ['CARD', 'PAYPAL', 'CRYPTO'],
        defaultValue: 'CARD',
      },
    ],
  },
  observer: {
    fields: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'SELECT',
        required: true,
        allowedValues: ['WITH_OBSERVER', 'WITHOUT_OBSERVER'],
        defaultValue: 'WITH_OBSERVER',
      },
      {
        name: 'subjectName',
        label: 'Nom du sujet',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'ReleasePublisher',
      },
      {
        name: 'observers',
        label: 'Observers',
        type: 'LIST',
        required: true,
        allowedValues: null,
        defaultValue: 'Mobile App, Back Office, Audit Log',
      },
      {
        name: 'message',
        label: 'Notification',
        type: 'TEXT',
        required: true,
        allowedValues: null,
        defaultValue: 'Nouvelle version 1.0 publiee',
      },
    ],
  },
}

const flyweightProfiles = {
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

const decoratorBaseProfiles = {
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

const decoratorDefinitions = {
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

function normalizeInteger(value, fallbackValue, minimum, maximum) {
  const parsed = Math.round(Number(value ?? fallbackValue))

  if (!Number.isFinite(parsed)) {
    return fallbackValue
  }

  return Math.min(maximum, Math.max(minimum, parsed))
}

function roundToSingleDecimal(value) {
  return Math.round(value * 10) / 10
}

function distributeObjects(objectCount, variantCount, variantIndex) {
  const base = Math.floor(objectCount / variantCount)
  const remainder = objectCount % variantCount
  return base + (variantIndex < remainder ? 1 : 0)
}

function normalizeUniqueList(rawValue) {
  return (Array.isArray(rawValue) ? rawValue : `${rawValue ?? ''}`.split(','))
    .map((value) => `${value}`.trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
}

function normalizeOrderedList(rawValue) {
  return (Array.isArray(rawValue) ? rawValue : `${rawValue ?? ''}`.split(','))
    .map((value) => `${value}`.trim())
    .filter(Boolean)
}

function normalizeOrderedUniqueList(rawValue) {
  return normalizeOrderedList(rawValue)
    .map((value) => value.toUpperCase())
    .filter((value, index, array) => array.indexOf(value) === index)
}

const stateActionLabels = {
  START_RUN: 'Courir',
  STOP: 'Stop',
  JUMP: 'Sauter',
  LAND: 'Atterrir',
  ATTACK: 'Attaquer',
  FINISH_ATTACK: 'Fin attaque',
}

const stateDefinitions = {
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

const commandActionLabels = {
  ADD_BEACON: 'Ajouter balise',
  MOVE_RIGHT: 'Deplacer a droite',
  MOVE_UP: 'Monter',
  MOVE_LEFT: 'Deplacer a gauche',
  DELETE_BEACON: 'Supprimer balise',
  UNDO: 'Undo',
  REDO: 'Redo',
}

const chainTokenStates = {
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

const chainPayloadStates = {
  VALID: {
    code: 'VALID',
    label: 'Payload valide',
  },
  INVALID: {
    code: 'INVALID',
    label: 'Payload invalide',
  },
}

const chainProcessingTargets = {
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

function normalizeMediatorParticipants(rawValue, senderName) {
  const values = normalizeUniqueList(rawValue)

  if (!values.includes(senderName)) {
    return normalizeUniqueList([senderName, ...values])
  }

  return values
}

function createMediatorVisualization(useMediator, roomName, senderName, recipients, message) {
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

function createChainStep(index, handlerCode, handlerLabel, status, passed, detail) {
  return {
    index,
    handlerCode,
    handlerLabel,
    status,
    passed,
    detail,
  }
}

function buildChainVisualization(useChain, requestName, tokenLabel, payloadLabel, processingLabel, steps, accepted) {
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

function createCommandBoard(boardName, actorName, gridSize = 5) {
  return {
    boardName,
    actorName,
    gridSize,
    x: 0,
    y: 0,
    beaconCount: 0,
  }
}

function snapshotCommandBoard(board) {
  return {
    x: board.x,
    y: board.y,
    beaconCount: board.beaconCount,
  }
}

function restoreCommandBoard(board, snapshot) {
  board.x = snapshot.x
  board.y = snapshot.y
  board.beaconCount = snapshot.beaconCount
}

function applyCommandBoardAction(board, actionCode) {
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

function createCommandEntry(rawEntry) {
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

function createCommandStep(index, actionCode, operationType, accepted, detail, board, undoStack, redoStack) {
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

function commandExecutionDetail(actorName, actionCode) {
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

function commandDirectDetail(actorName, actionCode) {
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

function buildCommandVisualization(useCommand, board, undoStack, redoStack) {
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

function simulateStateTransition(currentState, actionCode, characterName) {
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

function buildFlyweightVisualization({
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

function numericStat(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function addDecoratorStats(baseStats, bonusStats) {
  return {
    attack: numericStat(baseStats.attack) + numericStat(bonusStats.attack),
    defense: numericStat(baseStats.defense) + numericStat(bonusStats.defense),
    speed: numericStat(baseStats.speed) + numericStat(bonusStats.speed),
    control: numericStat(baseStats.control) + numericStat(bonusStats.control),
  }
}

function buildDecoratorVisualization(baseProfile, stack, finalStats, challengeMet) {
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

const fallbackExecutors = {
  mediator: (parameters) => {
    const mode = `${parameters.mode ?? 'WITH_MEDIATOR'}`.trim().toUpperCase()
    const useMediator = mode !== 'WITHOUT_MEDIATOR'
    const roomName = `${parameters.roomName ?? ''}`.trim() || 'Arena Chat'
    const senderName = `${parameters.senderName ?? ''}`.trim() || 'Luna'
    const participants = normalizeMediatorParticipants(parameters.participants, senderName)
    const message = `${parameters.message ?? ''}`.trim() || 'Focus target center lane'

    if (participants.length < 3) {
      throw new Error('Au moins trois participants sont requis pour la demo Mediator.')
    }

    const recipients = participants.filter((participant) => participant !== senderName)
    const deliveries = recipients.map((recipient, index) => ({
      index: index + 1,
      from: senderName,
      to: recipient,
      via: useMediator ? roomName : 'direct link',
      transport: useMediator ? 'MEDIATED' : 'DIRECT',
      detail: `${recipient} recoit "${message}" depuis ${senderName} via ${useMediator ? roomName : 'direct link'}.`,
    }))
    const logs = useMediator
      ? [
        `Creation du ChatRoomMediator ${roomName}.`,
        `Enregistrement des participants dans le mediator : ${participants.join(', ')}.`,
        `${senderName} envoie son message au hub central.`,
        ...deliveries.map((delivery) => `${roomName} transmet le message a ${delivery.to}.`),
      ]
      : [
        `Mode sans Mediator : ${senderName} connait directement tous les autres joueurs.`,
        ...deliveries.map((delivery) => `${senderName} envoie directement un message a ${delivery.to}.`),
      ]

    return {
      patternCode: 'mediator',
      summary: useMediator
        ? 'Mediator centralise les conversations dans un hub unique. Les participants ne dependent plus directement les uns des autres.'
        : 'Sans Mediator, l expediteur connait chaque destinataire et multiplie les liens directs entre objets du chat.',
      logs,
      output: {
        mode,
        modeLabel: useMediator ? 'Avec Mediator' : 'Sans Mediator',
        roomName,
        participants,
        participantCount: participants.length,
        senderName,
        recipients,
        recipientCount: recipients.length,
        message,
        deliveredCount: deliveries.length,
        senderCouplingCount: useMediator ? 1 : recipients.length,
        directLinkCount: useMediator ? 0 : recipients.length,
        deliveryModeLabel: useMediator ? 'Transit via mediator' : 'Messages directs',
        deliveries,
      },
      visualization: createMediatorVisualization(useMediator, roomName, senderName, recipients, message),
    }
  },
  chain: (parameters) => {
    const mode = `${parameters.mode ?? 'WITH_CHAIN'}`.trim().toUpperCase()
    const useChain = mode !== 'WITHOUT_CHAIN'
    const requestName = `${parameters.requestName ?? ''}`.trim() || 'Export mensuel'
    const tokenState = chainTokenStates[`${parameters.tokenState ?? 'VALID'}`.trim().toUpperCase()] ?? chainTokenStates.VALID
    const payloadState = chainPayloadStates[`${parameters.payloadState ?? 'VALID'}`.trim().toUpperCase()] ?? chainPayloadStates.VALID
    const processingTarget = chainProcessingTargets[`${parameters.processingTarget ?? 'REPORT_EXPORT'}`.trim().toUpperCase()]
      ?? chainProcessingTargets.REPORT_EXPORT
    const logs = []
    const steps = []

    if (useChain) {
      logs.push('Construction de la chaine AuthenticationHandler -> ValidationHandler -> ProcessingHandler.')
      logs.push(`La requete ${requestName} entre dans le premier maillon.`)

      if (tokenState.code === 'VALID') {
        steps.push(createChainStep(
          1,
          'AUTH',
          'AuthenticationHandler',
          'PASSED',
          true,
          `Token valide : ${requestName} peut passer au maillon suivant.`,
        ))
      } else {
        steps.push(createChainStep(
          1,
          'AUTH',
          'AuthenticationHandler',
          'REJECTED',
          false,
          tokenState.code === 'EXPIRED'
            ? 'Token expire : la requete est arretee des le controle d authentification.'
            : 'Aucun token fourni : la requete est rejetee avant toute validation metier.',
        ))
      }

      if (steps[steps.length - 1].passed) {
        if (payloadState.code === 'VALID') {
          steps.push(createChainStep(
            2,
            'VALIDATION',
            'ValidationHandler',
            'PASSED',
            true,
            `Payload valide : ${requestName} peut continuer jusqu au traitement.`,
          ))
        } else {
          steps.push(createChainStep(
            2,
            'VALIDATION',
            'ValidationHandler',
            'REJECTED',
            false,
            'Payload invalide : la chaine stoppe avant le service metier.',
          ))
        }
      }

      if (steps[steps.length - 1].passed) {
        steps.push(createChainStep(
          3,
          'PROCESSING',
          'ProcessingHandler',
          'HANDLED',
          true,
          processingTarget.handledMessage,
        ))
      }
    } else {
      logs.push('Mode sans Chain of Responsibility : un RequestController centralise tous les controles.')
      logs.push(`La requete ${requestName} traverse une suite de if / else dans une seule classe.`)

      if (tokenState.code === 'VALID') {
        steps.push(createChainStep(
          1,
          'AUTH',
          'Inline auth check',
          'PASSED',
          true,
          'Le controller valide le token dans une condition inline.',
        ))
      } else {
        steps.push(createChainStep(
          1,
          'AUTH',
          'Inline auth check',
          'REJECTED',
          false,
          tokenState.code === 'EXPIRED'
            ? 'Le controller detecte un token expire et arrete la requete.'
            : 'Le controller detecte l absence de token et bloque la requete.',
        ))
      }

      if (steps[steps.length - 1].passed) {
        if (payloadState.code === 'VALID') {
          steps.push(createChainStep(
            2,
            'VALIDATION',
            'Inline validation check',
            'PASSED',
            true,
            'Le payload passe la validation inline du controller.',
          ))
        } else {
          steps.push(createChainStep(
            2,
            'VALIDATION',
            'Inline validation check',
            'REJECTED',
            false,
            'Le controller refuse le payload avant le traitement metier.',
          ))
        }
      }

      if (steps[steps.length - 1].passed) {
        steps.push(createChainStep(
          3,
          'PROCESSING',
          'Inline processing branch',
          'HANDLED',
          true,
          processingTarget.handledMessage,
        ))
      }
    }

    steps.forEach((step) => {
      logs.push(`Etape ${step.index} - ${step.handlerLabel} : ${step.detail}`)
    })

    const lastStep = steps[steps.length - 1]
    const accepted = lastStep?.status === 'HANDLED'
    const handledBy = accepted
      ? (useChain ? 'ProcessingHandler' : 'RequestController')
      : lastStep?.handlerLabel ?? ''
    const stoppedAt = lastStep?.handlerCode ?? 'AUTH'

    return {
      patternCode: 'chain',
      summary: useChain
        ? 'Chaque maillon decide s il traite la requete, la rejette ou la transmet au suivant. La chaine reste modulaire et chaque controle est localise.'
        : 'Sans chaine, les controles restent regroupes dans un seul controller procedural, ce qui centralise les conditions et rigidifie le flux.',
      logs,
      output: {
        mode,
        modeLabel: useChain ? 'Avec Chain of Responsibility' : 'Sans Chain of Responsibility',
        requestName,
        tokenState: tokenState.code,
        tokenLabel: tokenState.label,
        payloadState: payloadState.code,
        payloadLabel: payloadState.label,
        processingTarget: processingTarget.code,
        processingTargetLabel: processingTarget.label,
        finalDecision: accepted ? 'ACCEPTED' : 'REJECTED',
        decisionLabel: accepted
          ? `Requete acceptee et traitee par ${handledBy}.`
          : `Requete stoppee par ${handledBy}.`,
        accepted,
        handledBy,
        stoppedAt,
        visitedHandlers: steps.map((step) => step.handlerCode),
        passedHandlers: steps.filter((step) => step.passed).length,
        stepCount: steps.length,
        steps,
      },
      visualization: buildChainVisualization(
        useChain,
        requestName,
        tokenState.label,
        payloadState.label,
        processingTarget.label,
        steps,
        accepted,
      ),
    }
  },
  command: (parameters) => {
    const mode = `${parameters.mode ?? 'WITH_COMMAND'}`.toUpperCase()
    const useCommand = mode !== 'WITHOUT_COMMAND'
    const boardName = `${parameters.boardName ?? ''}`.trim() || 'Arena Grid'
    const actorName = `${parameters.actorName ?? ''}`.trim() || 'Pixel Bot'
    const actions = normalizeOrderedList(parameters.actions).map((value) => `${value}`.trim().toUpperCase()).filter(Boolean)
    const board = createCommandBoard(boardName, actorName)
    const logs = []
    const history = []
    const undoStack = []
    const redoStack = []

    if (actions.length === 0) {
      throw new Error('Au moins une action est obligatoire.')
    }

    if (useCommand) {
      logs.push(`Creation du receiver ${boardName} pour ${actorName}.`)
      logs.push('Initialisation du CommandInvoker avec deux piles : undo et redo.')

      actions.forEach((actionCode, index) => {
        if (actionCode === 'UNDO') {
          if (undoStack.length === 0) {
            const step = createCommandStep(
              index + 1,
              actionCode,
              'UNDO',
              false,
              'Aucune commande a annuler : la pile undo est vide.',
              board,
              undoStack,
              redoStack,
            )
            logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
            history.push(step)
            return
          }

          const lastCommand = undoStack.shift()
          restoreCommandBoard(board, lastCommand.beforeState)
          redoStack.unshift(lastCommand)
          const step = createCommandStep(
            index + 1,
            actionCode,
            'UNDO',
            true,
            `Undo retire ${lastCommand.actionLabel.toLowerCase()} de la pile active et restaure l etat precedent.`,
            board,
            undoStack.map(({ actionCode: code }) => code),
            redoStack.map(({ actionCode: code }) => code),
          )
          logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
          history.push(step)
          return
        }

        if (actionCode === 'REDO') {
          if (redoStack.length === 0) {
            const step = createCommandStep(
              index + 1,
              actionCode,
              'REDO',
              false,
              'Aucune commande a rejouer : la pile redo est vide.',
              board,
              undoStack.map(({ actionCode: code }) => code),
              redoStack.map(({ actionCode: code }) => code),
            )
            logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
            history.push(step)
            return
          }

          const replayedCommand = redoStack.shift()
          replayedCommand.beforeState = snapshotCommandBoard(board)
          applyCommandBoardAction(board, replayedCommand.actionCode)
          undoStack.unshift(replayedCommand)
          const step = createCommandStep(
            index + 1,
            actionCode,
            'REDO',
            true,
            `Redo rejoue ${replayedCommand.actionLabel.toLowerCase()} depuis la pile redo.`,
            board,
            undoStack.map(({ actionCode: code }) => code),
            redoStack.map(({ actionCode: code }) => code),
          )
          logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
          history.push(step)
          return
        }

        const commandRecord = {
          actionCode,
          actionLabel: commandActionLabels[actionCode] ?? actionCode,
          beforeState: snapshotCommandBoard(board),
        }
        applyCommandBoardAction(board, actionCode)
        undoStack.unshift(commandRecord)
        redoStack.length = 0
        const step = createCommandStep(
          index + 1,
          actionCode,
          'EXECUTE',
          true,
          commandExecutionDetail(actorName, actionCode),
          board,
          undoStack.map(({ actionCode: code }) => code),
          redoStack.map(({ actionCode: code }) => code),
        )
        logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
        history.push(step)
      })
    } else {
      logs.push(`Mode sans Command : ${actorName} modifie directement ${boardName}.`)
      logs.push('Aucune pile de commandes n est maintenue, donc undo et redo ne peuvent pas fonctionner.')

      actions.forEach((actionCode, index) => {
        if (actionCode === 'UNDO' || actionCode === 'REDO') {
          const step = createCommandStep(
            index + 1,
            actionCode,
            'BLOCKED',
            false,
            `Le controleur direct ne stocke aucune commande : ${(commandActionLabels[actionCode] ?? actionCode).toLowerCase()} est impossible.`,
            board,
            [],
            [],
          )
          logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
          history.push(step)
          return
        }

        applyCommandBoardAction(board, actionCode)
        const step = createCommandStep(
          index + 1,
          actionCode,
          'DIRECT',
          true,
          commandDirectDetail(actorName, actionCode),
          board,
          [],
          [],
        )
        logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
        history.push(step)
      })
    }

    const blockedCommands = history.filter((step) => !step.accepted).length
    const successfulControlCommands = history.filter((step) => (
      step.accepted && (step.actionCode === 'UNDO' || step.actionCode === 'REDO')
    )).length
    const visitedCells = [...new Set(history.map((step) => `${step.positionX},${step.positionY}`))]
    const finalUndoStack = useCommand
      ? undoStack.map((entry) => createCommandEntry(entry.actionCode))
      : []
    const finalRedoStack = useCommand
      ? redoStack.map((entry) => createCommandEntry(entry.actionCode))
      : []

    return {
      patternCode: 'command',
      summary: useCommand
        ? "Command encapsule chaque action dans un objet autonome. L invoker peut donc conserver un historique, annuler et rejouer des operations."
        : "Sans Command, l interface appelle directement le receiver. Les actions partent, mais aucune pile n existe pour les annuler proprement.",
      logs,
      output: {
        mode: useCommand ? 'WITH_COMMAND' : 'WITHOUT_COMMAND',
        modeLabel: useCommand ? 'Avec Command' : 'Sans Command',
        boardName,
        actorName,
        boardSize: board.gridSize,
        positionX: board.x,
        positionY: board.y,
        beaconCount: board.beaconCount,
        actionCount: actions.length,
        executedCommands: history.filter((step) => step.accepted).length,
        blockedCommands,
        successfulControlCommands,
        undoStack: finalUndoStack,
        redoStack: finalRedoStack,
        visitedCells,
        history,
      },
      visualization: buildCommandVisualization(useCommand, board, finalUndoStack, finalRedoStack),
    }
  },
  singleton: (parameters) => {
    const mode = `${parameters.mode ?? 'WITH_SINGLETON'}`.toUpperCase()
    const useSingleton = mode !== 'WITHOUT_SINGLETON'
    const settingKey = `${parameters.settingKey ?? ''}`.trim() || 'theme'
    const settingValue = `${parameters.settingValue ?? ''}`.trim() || 'emerald'
    const clients = normalizeUniqueList(parameters.clients)

    if (clients.length === 0) {
      throw new Error('Au moins un client est obligatoire.')
    }

    const writerClient = clients[0]
    const clientViews = useSingleton
      ? clients.map((client) => ({
          client,
          instanceId: 'instance-1',
          visibleValue: settingValue,
          shared: true,
        }))
      : clients.map((client, index) => ({
          client,
          instanceId: `instance-${index + 1}`,
          visibleValue: client === writerClient ? settingValue : 'non defini',
          shared: false,
        }))
    const uniqueInstanceIds = [...new Set(clientViews.map((view) => view.instanceId))]
    const coherenceLabel = useSingleton
      ? 'Tous les clients observent la meme configuration.'
      : 'Chaque client voit un etat local different.'

    return {
      patternCode: 'singleton',
      summary: useSingleton
        ? "Singleton distribue une seule instance partagee, ce qui aligne tous les clients sur le meme etat global."
        : "Sans Singleton, chaque client cree sa propre instance et les modifications se propagent mal.",
      logs: useSingleton
        ? [
            'Activation du mode Singleton.',
            ...clients.flatMap((client) => (
              client === writerClient
                ? [
                    `${client} demande l instance globale.`,
                    `${client} modifie ${settingKey} = ${settingValue}.`,
                    `${client} recupere l instance instance-1 et lit ${settingKey} = ${settingValue}.`,
                  ]
                : [
                    `${client} demande l instance globale.`,
                    `${client} recupere l instance instance-1 et lit ${settingKey} = ${settingValue}.`,
                  ]
            )),
          ]
        : [
            'Mode sans Singleton : chaque client cree sa propre instance.',
            ...clients.flatMap((client, index) => (
              client === writerClient
                ? [
                    `${client} cree instance-${index + 1}.`,
                    `${client} modifie ${settingKey} = ${settingValue} sur sa copie locale.`,
                    `${client} lit ${settingKey} = ${settingValue} sur instance-${index + 1}.`,
                  ]
                : [
                    `${client} cree instance-${index + 1}.`,
                    `${client} lit ${settingKey} = non defini sur instance-${index + 1}.`,
                  ]
            )),
          ],
      output: {
        mode: useSingleton ? 'WITH_SINGLETON' : 'WITHOUT_SINGLETON',
        modeLabel: useSingleton ? 'Avec Singleton' : 'Sans Singleton',
        writerClient,
        settingKey,
        settingValue,
        clientCount: clients.length,
        instanceCount: uniqueInstanceIds.length,
        coherent: useSingleton,
        coherenceLabel,
        uniqueInstanceIds,
        clientViews,
      },
      visualization: {
        nodes: [
          { id: 'summary', label: 'Etat global', type: 'output', data: { message: coherenceLabel } },
          ...clientViews.map((view, index) => ({
            id: `client-${index}`,
            label: view.client,
            type: 'client',
            data: { selected: index === 0 },
          })),
          ...uniqueInstanceIds.map((instanceId) => {
            const view = clientViews.find((item) => item.instanceId === instanceId)
            return {
              id: `instance-${instanceId}`,
              label: useSingleton ? 'GlobalSettingsManager' : instanceId,
              type: useSingleton ? 'singleton' : 'instance',
              data: { detail: `${settingKey} = ${view?.visibleValue ?? 'non defini'}` },
            }
          }),
        ],
        edges: [
          ...clientViews.map((view, index) => ({
            from: `client-${index}`,
            to: `instance-${view.instanceId}`,
            label: 'getInstance',
          })),
          ...uniqueInstanceIds.map((instanceId) => ({
            from: `instance-${instanceId}`,
            to: 'summary',
            label: 'state',
          })),
        ],
      },
    }
  },
  state: (parameters) => {
    const mode = `${parameters.mode ?? 'WITH_STATE'}`.toUpperCase()
    const useState = mode !== 'WITHOUT_STATE'
    const characterName = `${parameters.characterName ?? ''}`.trim() || 'Arena Bot'
    const initialState = `${parameters.initialState ?? 'IDLE'}`.trim().toUpperCase()
    const actions = normalizeOrderedList(parameters.actions).map((action) => action.toUpperCase())

    if (!stateDefinitions[initialState]) {
      throw new Error(`Etat initial inconnu : ${initialState}`)
    }

    if (actions.length === 0) {
      throw new Error('Au moins une action est obligatoire.')
    }

    let currentState = initialState
    const logs = [
      useState
        ? `Creation du contexte pour ${characterName} avec l etat initial ${initialState}.`
        : `Mode sans State : creation d un controleur conditionnel pour ${characterName} avec l etat initial ${initialState}.`,
    ]

    const timeline = actions.map((actionCode, index) => {
      const fromState = currentState
      const result = simulateStateTransition(currentState, actionCode, characterName)
      currentState = result.nextState

      const step = {
        index: index + 1,
        actionCode,
        actionLabel: stateActionLabels[actionCode] ?? actionCode,
        fromState,
        toState: currentState,
        accepted: result.accepted,
        detail: result.detail,
      }

      logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
      return step
    })

    const acceptedTransitions = timeline.filter((step) => step.accepted).length
    const ignoredActions = timeline.length - acceptedTransitions
    const visitedStates = []

    timeline.forEach((step) => {
      if (!visitedStates.includes(step.fromState)) {
        visitedStates.push(step.fromState)
      }
      if (!visitedStates.includes(step.toState)) {
        visitedStates.push(step.toState)
      }
    })

    if (visitedStates.length === 0) {
      visitedStates.push(initialState)
    }

    return {
      patternCode: 'state',
      summary: useState
        ? "State encapsule les transitions dans chaque etat concret, ce qui rend le contexte plus lisible et plus simple a faire evoluer."
        : "Sans State, la logique de transition reste centralisee dans des conditions, ce qui complique l evolution du contexte.",
      logs,
      output: {
        mode: useState ? 'WITH_STATE' : 'WITHOUT_STATE',
        modeLabel: useState ? 'Avec State' : 'Sans State',
        characterName,
        initialState,
        finalState: currentState,
        currentStateLabel: stateDefinitions[currentState]?.label ?? currentState,
        actionCount: timeline.length,
        acceptedTransitions,
        ignoredActions,
        availableActions: stateDefinitions[currentState]?.availableActions ?? [],
        visitedStates,
        timeline,
      },
      visualization: {
        nodes: [
          {
            id: 'context',
            label: useState ? 'CharacterContext' : 'SwitchController',
            type: 'context',
            data: { detail: useState ? 'etat courant' : 'if / else centralise' },
          },
          { id: 'idle', label: 'IdleState', type: 'state', data: { active: currentState === 'IDLE', visited: visitedStates.includes('IDLE') } },
          { id: 'running', label: 'RunningState', type: 'state', data: { active: currentState === 'RUNNING', visited: visitedStates.includes('RUNNING') } },
          { id: 'jumping', label: 'JumpingState', type: 'state', data: { active: currentState === 'JUMPING', visited: visitedStates.includes('JUMPING') } },
          { id: 'attacking', label: 'AttackingState', type: 'state', data: { active: currentState === 'ATTACKING', visited: visitedStates.includes('ATTACKING') } },
          { id: 'result', label: 'Etat final', type: 'output', data: { message: `${currentState} apres ${timeline.length} action(s)` } },
        ],
        edges: [
          { from: 'context', to: currentState.toLowerCase(), label: useState ? 'holds' : 'switch' },
          { from: 'idle', to: 'running', label: 'START_RUN' },
          { from: 'running', to: 'idle', label: 'STOP' },
          { from: 'idle', to: 'jumping', label: 'JUMP' },
          { from: 'running', to: 'jumping', label: 'JUMP' },
          { from: 'jumping', to: 'idle', label: 'LAND' },
          { from: 'idle', to: 'attacking', label: 'ATTACK' },
          { from: 'running', to: 'attacking', label: 'ATTACK' },
          { from: 'attacking', to: 'idle', label: 'FINISH_ATTACK' },
          { from: currentState.toLowerCase(), to: 'result', label: 'current' },
        ],
      },
    }
  },
  flyweight: (parameters) => {
    const assetType = `${parameters.assetType ?? 'TREE'}`.toUpperCase()
    const profile = flyweightProfiles[assetType] ?? flyweightProfiles.TREE
    const objectCount = normalizeInteger(parameters.objectCount, 2400, 100, 10000)
    const sharedVariantCount = normalizeInteger(parameters.sharedVariantCount, 6, 1, 12)
    const variantCount = Math.min(sharedVariantCount, objectCount)
    const useFlyweight = parameters.useFlyweight === undefined
      ? true
      : Boolean(parameters.useFlyweight)
    const realInstances = useFlyweight ? variantCount : objectCount
    const baselineMemoryKb = objectCount * (profile.intrinsicStateKb + profile.extrinsicStateKb)
    const currentMemoryKb = useFlyweight
      ? variantCount * profile.intrinsicStateKb + objectCount * profile.extrinsicStateKb
      : baselineMemoryKb
    const savedMemoryKb = Math.max(0, baselineMemoryKb - currentMemoryKb)
    const savingsPercent = baselineMemoryKb === 0
      ? 0
      : roundToSingleDecimal((savedMemoryKb * 100) / baselineMemoryKb)
    const simulatedFrameCostMs = roundToSingleDecimal(
      (useFlyweight ? 8.5 : 11)
      + objectCount * (useFlyweight ? 0.0019 : 0.0046)
      + realInstances * (useFlyweight ? 0.11 : 0.002),
    )
    const performanceLabel = simulatedFrameCostMs >= 38
      ? (useFlyweight ? 'Charge tres haute mais encore contenue' : 'Lag probable')
      : simulatedFrameCostMs >= 24
        ? (useFlyweight ? 'Charge visible mais stable' : 'Charge sensible')
        : (useFlyweight ? 'Stable malgre la foule' : 'Acceptable a petite echelle')
    const variants = Array.from({ length: variantCount }, (_, index) => ({
      code: `${profile.code}-${index + 1}`,
      label: `${profile.label} ${index + 1}`,
      objects: distributeObjects(objectCount, variantCount, index),
      shared: useFlyweight,
    }))

    return {
      patternCode: 'flyweight',
      summary: useFlyweight
        ? "Flyweight mutualise les donnees lourdes pour alimenter une foule d objets legerement differencies."
        : "Sans Flyweight, chaque objet garde son etat complet et la pression memoire grimpe lineairement.",
      logs: [
        `Chargement du profil ${profile.label}.`,
        `Simulation de ${objectCount} objet(s) avec ${variantCount} variante(s) visuelles.`,
        useFlyweight
          ? `Activation du cache Flyweight : ${variantCount} instance(s) partagee(s) seulement.`
          : 'Mode sans Flyweight : chaque objet embarque son etat complet.',
        useFlyweight
          ? 'Chaque objet garde uniquement son etat extrinseque : position, echelle et variation.'
          : `Le moteur recree donc ${realInstances} instance(s) concretes en memoire.`,
        `Memoire theorique sans partage : ${baselineMemoryKb} KB.`,
        `Memoire theorique dans le mode courant : ${currentMemoryKb} KB.`,
        useFlyweight
          ? `Gain estime : ${savedMemoryKb} KB economises (${savingsPercent}%).`
          : 'Aucun gain : le pattern n est pas active.',
      ],
      output: {
        mode: useFlyweight ? 'WITH_FLYWEIGHT' : 'WITHOUT_FLYWEIGHT',
        modeLabel: useFlyweight ? 'Avec Flyweight' : 'Sans Flyweight',
        assetType: profile.code,
        assetLabel: profile.label,
        objectCount,
        sharedVariantCount: variantCount,
        realInstances,
        intrinsicStateKb: profile.intrinsicStateKb,
        extrinsicStateKb: profile.extrinsicStateKb,
        memoryCurrentKb: currentMemoryKb,
        memoryWithoutFlyweightKb: baselineMemoryKb,
        savedMemoryKb,
        savingsPercent,
        simulatedFrameCostMs,
        performanceLabel,
        variants,
      },
      visualization: buildFlyweightVisualization({
        assetLabel: profile.label,
        baselineMemoryKb,
        currentMemoryKb,
        objectCount,
        performanceLabel,
        realInstances,
        useFlyweight,
        variantCount,
      }),
    }
  },
  decorator: (parameters) => {
    const mode = `${parameters.mode ?? 'WITH_DECORATOR'}`.toUpperCase()
    const useDecorator = mode !== 'WITHOUT_DECORATOR'
    const characterName = `${parameters.characterName ?? ''}`.trim() || 'Ember Knight'
    const baseType = `${parameters.baseType ?? 'WARRIOR'}`.toUpperCase()
    const baseProfile = decoratorBaseProfiles[baseType] ?? decoratorBaseProfiles.WARRIOR
    const decorators = normalizeOrderedUniqueList(parameters.decorators)

    decorators.forEach((code) => {
      if (!decoratorDefinitions[code]) {
        throw new Error(`Decorator inconnu : ${code}`)
      }
    })

    const logs = [
      `Creation du composant de base ${characterName} sur le profil ${baseProfile.label}.`,
      `Stats de depart : ATK ${baseProfile.stats.attack} / DEF ${baseProfile.stats.defense} / SPD ${baseProfile.stats.speed} / CTRL ${baseProfile.stats.control}.`,
    ]
    const activeEffects = [`Socle de base ${baseProfile.label}`]

    const stack = [
      {
        code: 'BASE',
        layerClass: 'BaseCharacter',
        layerLabel: baseProfile.label,
        effect: baseProfile.description,
        ...baseProfile.stats,
      },
    ]

    let runningStats = { ...baseProfile.stats }

    if (useDecorator) {
      decorators.forEach((code) => {
        const definition = decoratorDefinitions[code]
        runningStats = addDecoratorStats(runningStats, definition.stats)
        logs.push(`Ajout de ${definition.layerLabel} autour du composant courant.`)
        logs.push(`Effet applique : ${definition.effect}`)
        activeEffects.push(definition.effect)
        stack.push({
          code: definition.code,
          layerClass: definition.layerLabel,
          layerLabel: definition.layerLabel,
          effect: definition.effect,
          ...runningStats,
        })
      })
    } else {
      logs.push('Mode sans Decorator : les effets sont regroupes dans une classe concrete specialisee.')
      decorators.forEach((code) => {
        const definition = decoratorDefinitions[code]
        runningStats = addDecoratorStats(runningStats, definition.stats)
        logs.push(`Effet ${definition.layerLabel} integre directement dans une classe monolithique.`)
        logs.push(`Variation appliquee : ${definition.effect}`)
        activeEffects.push(definition.effect)
      })

      if (decorators.length > 0) {
        stack.push({
          code: 'MONOLITH',
          layerClass: `${baseProfile.label.replaceAll(' ', '')}Combo`,
          layerLabel: 'Monolithic build',
          effect: 'Toutes les variations sont codees dans une seule classe concrete.',
          ...runningStats,
        })
      }
    }

    const challengeGoal = 'attaque >= 20 et defense >= 10'
    const challengeMet = runningStats.attack >= 20 && runningStats.defense >= 10

    logs.push(
      `Stats finales : ATK ${runningStats.attack} / DEF ${runningStats.defense} / SPD ${runningStats.speed} / CTRL ${runningStats.control}.`,
    )
    logs.push(
      challengeMet
        ? 'Objectif atteint : le build depasse le seuil cible.'
        : 'Objectif non atteint : il reste de la marge pour optimiser la pile de decorators.',
    )

    return {
      patternCode: 'decorator',
      summary: useDecorator
        ? (decorators.length === 0
          ? "Sans Decorator, le personnage reste un composant de base. Chaque nouvel effet demanderait sinon une nouvelle classe specialisee."
          : "Decorator empile des effets autour du meme composant pour faire evoluer le build sans toucher a la classe d origine.")
        : "Sans Decorator, les memes effets sont fusionnes dans une classe concrete specialisee plus rigide et moins composable.",
      logs,
      output: {
        mode: useDecorator ? 'WITH_DECORATOR' : 'WITHOUT_DECORATOR',
        modeLabel: useDecorator ? 'Avec Decorator' : 'Sans Decorator',
        characterName,
        baseType: baseProfile.code,
        baseLabel: baseProfile.label,
        decoratorCount: decorators.length,
        decorators,
        attack: runningStats.attack,
        defense: runningStats.defense,
        speed: runningStats.speed,
        control: runningStats.control,
        activeEffects,
        challengeGoal,
        challengeMet,
        classExplosionExamples: [
          `${baseProfile.label.replaceAll(' ', '')}FireShield`,
          `${baseProfile.label.replaceAll(' ', '')}FireSpeed`,
          `${baseProfile.label.replaceAll(' ', '')}ShieldIce`,
        ],
        stack,
      },
      visualization: buildDecoratorVisualization(baseProfile, stack, runningStats, challengeMet),
    }
  },
  factory: (parameters) => {
    const mode = `${parameters.mode ?? 'WITH_FACTORY'}`.toUpperCase()
    const useFactory = mode !== 'WITHOUT_FACTORY'
    const vehicleType = `${parameters.vehicleType ?? 'CAR'}`.toUpperCase()
    const vehicle = vehicleType === 'BIKE'
      ? {
          type: 'BIKE',
          label: 'Moto',
          description: "Vehicule agile cree pour des scenarios de livraison ou de mobilite rapide.",
        }
      : {
          type: 'CAR',
          label: 'Voiture',
          description: "Vehicule routier cree pour des scenarios urbains ou longue distance.",
        }

    return {
      patternCode: 'factory',
      summary: useFactory
        ? "Factory Method centralise la creation du produit derriere une interface stable."
        : "Sans Factory, le client instancie directement le produit concret et reste couple a son constructeur.",
      logs: useFactory
        ? [
          'Creation du point d entree factory.',
          `Demande de creation pour le type ${vehicle.type}.`,
          `Instantiation du produit concret ${vehicle.label}.`,
          'Retour du produit sans exposer le constructeur au client.',
        ]
        : [
          'Mode sans Factory : le client connait le type concret.',
          `Le client choisit le constructeur pour ${vehicle.type}.`,
          `Le code appelant execute directement new ${vehicle.label}().`,
          'Le changement de type oblige a modifier le code client.',
        ],
      output: {
        mode: useFactory ? 'WITH_FACTORY' : 'WITHOUT_FACTORY',
        modeLabel: useFactory ? 'Avec Factory' : 'Sans Factory',
        vehicleType: vehicle.type,
        vehicleLabel: vehicle.label,
        description: vehicle.description,
        creationStyle: useFactory ? 'Factory centralisee' : 'Instantiation directe',
      },
      visualization: {
        nodes: [
          { id: 'client', label: 'Client', type: 'client', data: {} },
          {
            id: 'factory',
            label: useFactory ? 'VehicleFactory' : `new ${vehicle.label}()`,
            type: useFactory ? 'factory' : 'cluster',
            data: { detail: useFactory ? 'creation centralisee' : 'constructeur concret expose' },
          },
          { id: 'product', label: vehicle.label, type: 'product', data: { type: vehicle.type } },
        ],
        edges: [
          { from: 'client', to: 'factory', label: useFactory ? 'request' : 'new' },
          { from: 'factory', to: 'product', label: useFactory ? 'create' : 'return' },
        ],
      },
    }
  },
  observer: (parameters) => {
    const mode = `${parameters.mode ?? 'WITH_OBSERVER'}`.toUpperCase()
    const useObserver = mode !== 'WITHOUT_OBSERVER'
    const subjectName = `${parameters.subjectName ?? ''}`.trim()
    const message = `${parameters.message ?? ''}`.trim()
    const observers = normalizeUniqueList(parameters.observers)

    if (!subjectName) {
      throw new Error('subjectName est obligatoire.')
    }

    if (!message) {
      throw new Error('message est obligatoire.')
    }

    if (observers.length === 0) {
      throw new Error('Au moins un observer est obligatoire.')
    }

    const deliveries = observers.map((observer) => ({
      observer,
      detail: `${observer} recoit la notification de ${subjectName} : ${message}`,
    }))

    return {
      patternCode: 'observer',
      summary: useObserver
        ? "Observer relie un sujet a plusieurs abonnes afin qu ils soient tous prevenus lorsqu un evenement survient."
        : "Sans Observer, l emetteur appelle directement chaque cible concrete et augmente son couplage.",
      logs: useObserver
        ? [
          `Creation du sujet : ${subjectName}.`,
          ...observers.map((observer) => `Abonnement de ${observer}.`),
          `Emission de l evenement : ${message}.`,
          `Le sujet notifie ${deliveries.length} observer(s).`,
          ...deliveries.map((delivery) => delivery.detail),
        ]
        : [
          `Mode sans Observer : ${subjectName} connait explicitement toutes les cibles.`,
          `Emission de l evenement : ${message}.`,
          `Boucle manuelle sur ${deliveries.length} dependance(s) concretes.`,
          ...deliveries.map((delivery) => delivery.detail),
        ],
      output: {
        mode: useObserver ? 'WITH_OBSERVER' : 'WITHOUT_OBSERVER',
        modeLabel: useObserver ? 'Avec Observer' : 'Sans Observer',
        subjectName,
        observerCount: deliveries.length,
        message,
        observers,
        deliveries,
      },
      visualization: {
        nodes: [
          { id: 'subject', label: subjectName, type: 'subject', data: { active: true } },
          {
            id: 'event',
            label: useObserver ? 'Evenement' : 'Manual loop',
            type: 'event',
            data: { message: useObserver ? message : 'couplage direct' },
          },
          ...deliveries.map((delivery, index) => ({
            id: `observer-${index}`,
            label: delivery.observer,
            type: 'observer',
            data: { selected: true, detail: delivery.detail },
          })),
        ],
        edges: [
          { from: 'subject', to: 'event', label: useObserver ? 'publish' : 'iterate' },
          ...deliveries.map((_, index) => ({
            from: 'event',
            to: `observer-${index}`,
            label: useObserver ? 'notify' : 'call',
          })),
        ],
      },
    }
  },
  strategy: (parameters) => {
    const mode = `${parameters.mode ?? 'WITH_STRATEGY'}`.toUpperCase()
    const useStrategy = mode !== 'WITHOUT_STRATEGY'
    const selectedStrategy = `${parameters.strategy ?? 'CARD'}`.toUpperCase()
    const amount = Number(parameters.amount ?? 100)

    const strategyLabels = {
      CARD: 'Carte',
      PAYPAL: 'Paypal',
      CRYPTO: 'Crypto',
    }

    const label = strategyLabels[selectedStrategy] ?? strategyLabels.CARD
    const message = `Paiement de ${amount} EUR traite avec ${label}.`

    return {
      patternCode: 'strategy',
      summary: useStrategy
        ? "Strategy laisse le contexte deleguer l execution a l algorithme choisi."
        : "Sans Strategy, le service garde un bloc if/else pour chaque variante d algorithme.",
      logs: useStrategy
        ? [
          'Creation du contexte de paiement.',
          `Selection de la strategie : ${label}.`,
          'Execution du workflow de paiement avec un algorithme interchangeable.',
          `Resultat : ${message}`,
        ]
        : [
          'Mode sans Strategy : PaymentService garde un bloc if/else.',
          `Evaluation de la branche ${label}.`,
          'Le service choisit l algorithme en fonction de la valeur recue.',
          `Resultat : ${message}`,
        ],
      output: {
        mode: useStrategy ? 'WITH_STRATEGY' : 'WITHOUT_STRATEGY',
        modeLabel: useStrategy ? 'Avec Strategy' : 'Sans Strategy',
        amount,
        selectedStrategy,
        selectedLabel: label,
        message,
      },
      visualization: {
        nodes: [
          {
            id: 'context',
            label: useStrategy ? 'PaymentContext' : 'PaymentService',
            type: 'context',
            data: { active: true },
          },
          {
            id: 'card',
            label: useStrategy ? 'Carte' : 'if CARD',
            type: 'strategy',
            data: { selected: selectedStrategy === 'CARD', detail: useStrategy ? '' : 'branche conditionnelle' },
          },
          {
            id: 'paypal',
            label: useStrategy ? 'Paypal' : 'if PAYPAL',
            type: 'strategy',
            data: { selected: selectedStrategy === 'PAYPAL', detail: useStrategy ? '' : 'branche conditionnelle' },
          },
          {
            id: 'crypto',
            label: useStrategy ? 'Crypto' : 'if CRYPTO',
            type: 'strategy',
            data: { selected: selectedStrategy === 'CRYPTO', detail: useStrategy ? '' : 'branche conditionnelle' },
          },
          { id: 'result', label: 'Resultat', type: 'output', data: { message } },
        ],
        edges: [
          { from: 'context', to: 'card', label: useStrategy ? 'disponible' : 'if/else' },
          { from: 'context', to: 'paypal', label: useStrategy ? 'disponible' : 'if/else' },
          { from: 'context', to: 'crypto', label: useStrategy ? 'disponible' : 'if/else' },
          { from: selectedStrategy.toLowerCase(), to: 'result', label: useStrategy ? 'execute' : 'branch' },
        ],
      },
    }
  },
}

export function getFallbackSchema(code) {
  return fallbackSchemas[code] ?? fallbackSchemas.strategy
}

export function executeFallbackPattern(code, parameters) {
  const executor = fallbackExecutors[code]

  if (!executor) {
    throw new Error(`No local executor available for ${code}`)
  }

  return executor(parameters)
}
