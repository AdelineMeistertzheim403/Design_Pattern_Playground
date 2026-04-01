export const fallbackPatterns = [
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
  factory: {
    fields: [
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

const fallbackExecutors = {
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
    const logs = [`Creation du contexte pour ${characterName} avec l etat initial ${initialState}.`]

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
      summary: "State encapsule les transitions dans chaque etat concret, ce qui rend le contexte plus lisible et plus simple a faire evoluer.",
      logs,
      output: {
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
          { id: 'context', label: 'CharacterContext', type: 'context', data: { detail: 'etat courant' } },
          { id: 'idle', label: 'IdleState', type: 'state', data: { active: currentState === 'IDLE', visited: visitedStates.includes('IDLE') } },
          { id: 'running', label: 'RunningState', type: 'state', data: { active: currentState === 'RUNNING', visited: visitedStates.includes('RUNNING') } },
          { id: 'jumping', label: 'JumpingState', type: 'state', data: { active: currentState === 'JUMPING', visited: visitedStates.includes('JUMPING') } },
          { id: 'attacking', label: 'AttackingState', type: 'state', data: { active: currentState === 'ATTACKING', visited: visitedStates.includes('ATTACKING') } },
          { id: 'result', label: 'Etat final', type: 'output', data: { message: `${currentState} apres ${timeline.length} action(s)` } },
        ],
        edges: [
          { from: 'context', to: currentState.toLowerCase(), label: 'holds' },
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
  factory: (parameters) => {
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
      summary: "Factory Method centralise la creation du produit derriere une interface stable.",
      logs: [
        'Creation du point d entree factory.',
        `Demande de creation pour le type ${vehicle.type}.`,
        `Instantiation du produit concret ${vehicle.label}.`,
        'Retour du produit sans exposer le constructeur au client.',
      ],
      output: {
        vehicleType: vehicle.type,
        vehicleLabel: vehicle.label,
        description: vehicle.description,
      },
      visualization: {
        nodes: [
          { id: 'client', label: 'Client', type: 'client', data: {} },
          { id: 'factory', label: 'VehicleFactory', type: 'factory', data: {} },
          { id: 'product', label: vehicle.label, type: 'product', data: { type: vehicle.type } },
        ],
        edges: [
          { from: 'client', to: 'factory', label: 'request' },
          { from: 'factory', to: 'product', label: 'create' },
        ],
      },
    }
  },
  observer: (parameters) => {
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
      summary: "Observer relie un sujet a plusieurs abonnes afin qu ils soient tous prevenus lorsqu un evenement survient.",
      logs: [
        `Creation du sujet : ${subjectName}.`,
        ...observers.map((observer) => `Abonnement de ${observer}.`),
        `Emission de l evenement : ${message}.`,
        `Le sujet notifie ${deliveries.length} observer(s).`,
        ...deliveries.map((delivery) => delivery.detail),
      ],
      output: {
        subjectName,
        observerCount: deliveries.length,
        message,
        observers,
        deliveries,
      },
      visualization: {
        nodes: [
          { id: 'subject', label: subjectName, type: 'subject', data: { active: true } },
          { id: 'event', label: 'Evenement', type: 'event', data: { message } },
          ...deliveries.map((delivery, index) => ({
            id: `observer-${index}`,
            label: delivery.observer,
            type: 'observer',
            data: { selected: true, detail: delivery.detail },
          })),
        ],
        edges: [
          { from: 'subject', to: 'event', label: 'publish' },
          ...deliveries.map((_, index) => ({
            from: 'event',
            to: `observer-${index}`,
            label: 'notify',
          })),
        ],
      },
    }
  },
  strategy: (parameters) => {
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
      summary: "Strategy laisse le contexte deleguer l execution a l algorithme choisi.",
      logs: [
        'Creation du contexte de paiement.',
        `Selection de la strategie : ${label}.`,
        'Execution du workflow de paiement avec un algorithme interchangeable.',
        `Resultat : ${message}`,
      ],
      output: {
        amount,
        selectedStrategy,
        selectedLabel: label,
        message,
      },
      visualization: {
        nodes: [
          { id: 'context', label: 'PaymentContext', type: 'context', data: { active: true } },
          { id: 'card', label: 'Carte', type: 'strategy', data: { selected: selectedStrategy === 'CARD' } },
          { id: 'paypal', label: 'Paypal', type: 'strategy', data: { selected: selectedStrategy === 'PAYPAL' } },
          { id: 'crypto', label: 'Crypto', type: 'strategy', data: { selected: selectedStrategy === 'CRYPTO' } },
          { id: 'result', label: 'Resultat', type: 'output', data: { message } },
        ],
        edges: [
          { from: 'context', to: 'card', label: 'disponible' },
          { from: 'context', to: 'paypal', label: 'disponible' },
          { from: 'context', to: 'crypto', label: 'disponible' },
          { from: selectedStrategy.toLowerCase(), to: 'result', label: 'execute' },
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
