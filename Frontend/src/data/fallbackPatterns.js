export const fallbackPatterns = [
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

const fallbackExecutors = {
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
    const observers = (Array.isArray(parameters.observers) ? parameters.observers : `${parameters.observers ?? ''}`.split(','))
      .map((value) => `${value}`.trim())
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index)

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
