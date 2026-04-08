import { normalizeUniqueList } from './executorCommon'

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
