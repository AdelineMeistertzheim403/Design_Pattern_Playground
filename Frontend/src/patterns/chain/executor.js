import {
  buildChainVisualization,
  chainPayloadStates,
  chainProcessingTargets,
  chainTokenStates,
  createChainStep,
} from '../shared/executorShared'

export default function executeChainPattern(parameters) {
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
}
