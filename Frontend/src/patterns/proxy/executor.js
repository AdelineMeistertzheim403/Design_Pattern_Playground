const requesterRoles = {
  ADMIN: { code: 'ADMIN', label: 'Admin' },
  MEMBER: { code: 'MEMBER', label: 'Member' },
  GUEST: { code: 'GUEST', label: 'Guest' },
}

const cacheStates = {
  COLD: { code: 'COLD', label: 'Cache froid' },
  WARM: { code: 'WARM', label: 'Cache chaud' },
}

const resources = {
  VAULT_VIDEO: {
    code: 'VAULT_VIDEO',
    label: 'Vault Video',
    description: 'Flux premium chiffre et assez lourd pour justifier une strategie de chargement differe.',
    subjectLabel: 'SecureMediaService',
    payloadLabel: 'stream aes-256',
    payloadWeightMb: 480,
    lazyCapable: true,
    allowedRoles: ['ADMIN', 'MEMBER'],
  },
  REPORT_ARCHIVE: {
    code: 'REPORT_ARCHIVE',
    label: 'Report Archive',
    description: 'Archive sensible reservee aux admins, parfaite pour montrer un refus net par le proxy.',
    subjectLabel: 'ArchiveRepository',
    payloadLabel: 'bundle zip signe',
    payloadWeightMb: 220,
    lazyCapable: true,
    allowedRoles: ['ADMIN'],
  },
  LIVE_DASHBOARD: {
    code: 'LIVE_DASHBOARD',
    label: 'Live Dashboard',
    description: 'Tableau temps reel leger et public, utile pour voir un acces presque immediat.',
    subjectLabel: 'RealtimeGateway',
    payloadLabel: 'delta metrics',
    payloadWeightMb: 64,
    lazyCapable: false,
    allowedRoles: ['ADMIN', 'MEMBER', 'GUEST'],
  },
}

function computeLatency(blocked, lazyLoadTriggered, eagerLoadTriggered, cacheHit, securityLeak) {
  if (blocked) return 48
  if (securityLeak) return 930
  if (lazyLoadTriggered) return 640
  if (eagerLoadTriggered) return 880
  if (cacheHit) return 96
  return 220
}

function createStep(index, stageCode, title, actorLabel, status, detail, latencyMs) {
  return { index, stageCode, title, actorLabel, status, detail, latencyMs }
}

function buildVisualization(useProxy, resource, blocked, lazyLoadTriggered, eagerLoadTriggered, securityLeak) {
  const nodes = [
    {
      id: 'client',
      label: 'Client request',
      type: 'client',
      data: { detail: 'entry point' },
    },
  ]
  const edges = []

  if (useProxy) {
    nodes.push({
      id: 'proxy',
      label: 'AccessProxy',
      type: 'context',
      data: { detail: blocked ? 'blocked' : 'gate + cache' },
    })
    nodes.push({
      id: 'resource',
      label: resource.subjectLabel,
      type: 'component',
      data: { detail: resource.label },
    })
    if (lazyLoadTriggered) {
      nodes.push({
        id: 'loader',
        label: 'Lazy load',
        type: 'event',
        data: { detail: resource.payloadLabel },
      })
    }
    nodes.push({
      id: 'result',
      label: blocked ? 'Blocked' : 'Delivered',
      type: 'output',
      data: { message: blocked ? 'request refused' : 'controlled response' },
    })

    edges.push({ from: 'client', to: 'proxy', label: 'request' })
    if (blocked) {
      edges.push({ from: 'proxy', to: 'result', label: 'block' })
    } else if (lazyLoadTriggered) {
      edges.push({ from: 'proxy', to: 'loader', label: 'load' })
      edges.push({ from: 'loader', to: 'resource', label: 'hydrate' })
      edges.push({ from: 'resource', to: 'result', label: 'deliver' })
    } else {
      edges.push({ from: 'proxy', to: 'resource', label: 'forward' })
      edges.push({ from: 'resource', to: 'result', label: 'deliver' })
    }
  } else {
    nodes.push({
      id: 'resource',
      label: resource.subjectLabel,
      type: 'component',
      data: { detail: eagerLoadTriggered ? 'eager load' : resource.label },
    })
    if (eagerLoadTriggered) {
      nodes.push({
        id: 'loader',
        label: 'Eager load',
        type: 'event',
        data: { detail: resource.payloadLabel },
      })
    }
    nodes.push({
      id: 'result',
      label: securityLeak ? 'Exposed' : 'Delivered',
      type: 'output',
      data: { message: securityLeak ? 'unguarded resource' : 'direct response' },
    })

    edges.push({ from: 'client', to: 'resource', label: 'direct' })
    if (eagerLoadTriggered) {
      edges.push({ from: 'resource', to: 'loader', label: 'load' })
      edges.push({ from: 'loader', to: 'result', label: securityLeak ? 'expose' : 'return' })
    } else {
      edges.push({ from: 'resource', to: 'result', label: securityLeak ? 'expose' : 'return' })
    }
  }

  return { nodes, edges }
}

export default function executeProxyPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_PROXY'}`.trim().toUpperCase()
  const useProxy = mode !== 'WITHOUT_PROXY'
  const requestLabel = `${parameters.requestLabel ?? ''}`.trim() || 'Open premium vault'
  const requesterRole = requesterRoles[`${parameters.requesterRole ?? 'GUEST'}`.trim().toUpperCase()] ?? requesterRoles.GUEST
  const resource = resources[`${parameters.resourceCode ?? 'VAULT_VIDEO'}`.trim().toUpperCase()] ?? resources.VAULT_VIDEO
  const cacheState = cacheStates[`${parameters.cacheState ?? 'COLD'}`.trim().toUpperCase()] ?? cacheStates.COLD
  const accessGranted = resource.allowedRoles.includes(requesterRole.code)
  const cacheHit = cacheState.code === 'WARM'
  const blocked = useProxy && !accessGranted
  const lazyLoadTriggered = useProxy && accessGranted && !cacheHit && resource.lazyCapable
  const eagerLoadTriggered = !useProxy && !cacheHit
  const securityLeak = !useProxy && !accessGranted
  const latencyMs = computeLatency(blocked, lazyLoadTriggered, eagerLoadTriggered, cacheHit, securityLeak)

  const steps = [
    createStep(
      1,
      'REQUEST',
      'Emission',
      requesterRole.label,
      'SENT',
      `La requete ${requestLabel} part du client vers ${useProxy ? 'le proxy' : 'la ressource reelle'}.`,
      32,
    ),
    ...(useProxy
      ? [
          createStep(
            2,
            'PROXY_GATE',
            'Controle d acces',
            'AccessProxy',
            accessGranted ? 'ALLOWED' : 'BLOCKED',
            accessGranted
              ? `Le proxy valide le role ${requesterRole.label} pour ${resource.label}.`
              : `Le proxy bloque le role ${requesterRole.label} avant d atteindre ${resource.subjectLabel}.`,
            blocked ? 16 : 48,
          ),
          ...(accessGranted
            ? [
                cacheHit
                  ? createStep(
                      3,
                      'CACHE_HIT',
                      'Cache hit',
                      'AccessProxy',
                      'READY',
                      `Le proxy sert une version deja preparee sans toucher au ${resource.subjectLabel}.`,
                      24,
                    )
                  : lazyLoadTriggered
                    ? createStep(
                        3,
                        'LAZY_LOAD',
                        'Lazy loading',
                        resource.subjectLabel,
                        'LOADING',
                        `Le proxy declenche le chargement differe du payload ${resource.payloadLabel}.`,
                        latencyMs - 80,
                      )
                    : createStep(
                        3,
                        'FORWARD',
                        'Forward',
                        resource.subjectLabel,
                        'FETCH',
                        'Le proxy transmet immediatement vers la ressource reelle.',
                        120,
                      ),
                createStep(
                  4,
                  'DELIVER',
                  'Livraison controlee',
                  'AccessProxy',
                  'DELIVERED',
                  'La reponse retourne au client avec une mediation unique et lisible.',
                  28,
                ),
              ]
            : []),
        ]
      : [
          createStep(
            2,
            'DIRECT_ACCESS',
            'Acces direct',
            resource.subjectLabel,
            accessGranted ? 'OPEN' : 'UNGUARDED',
            accessGranted
              ? 'Le client touche directement la ressource sans garde intermediaire.'
              : 'La ressource sensible est atteinte sans verification centralisee.',
            46,
          ),
          ...(eagerLoadTriggered
            ? [
                createStep(
                  3,
                  'EAGER_LOAD',
                  'Chargement eager',
                  resource.subjectLabel,
                  'LOADING',
                  `La ressource charge tout de suite ${resource.payloadWeightMb} MB avant de repondre.`,
                  latencyMs - 60,
                ),
              ]
            : []),
          createStep(
            eagerLoadTriggered ? 4 : 3,
            'RETURN',
            'Retour client',
            resource.subjectLabel,
            securityLeak ? 'EXPOSED' : 'DELIVERED',
            securityLeak
              ? "Le payload revient alors que le role n aurait jamais du y acceder."
              : 'Le resultat revient sans mediation.',
            24,
          ),
        ]),
  ]

  const logs = [
    `${requesterRole.label} demande ${requestLabel} sur ${resource.label}.`,
    ...(useProxy
      ? [
          `Le proxy se place devant ${resource.subjectLabel} et expose le meme contrat au client.`,
          ...(blocked
            ? ['Le proxy refuse l acces avant le vrai sujet. Aucun chargement reseau lourd ne demarre.']
            : cacheHit
              ? ['Le proxy sert la reponse depuis son cache et evite de recontacter la ressource reelle.']
              : lazyLoadTriggered
                ? ['Le proxy declenche un lazy loading uniquement maintenant, car la ressource est vraiment demandee.']
                : ['Le proxy forwarde directement la demande vers la ressource reelle.']),
        ]
      : [
          `Sans proxy, le client cible directement ${resource.subjectLabel}.`,
          ...(eagerLoadTriggered ? ['Le chargement commence immediatement, meme si la ressource est lourde.'] : []),
          ...(securityLeak ? ['Comme aucune garde n intercepte la requete, la ressource sensible est exposee a un role non autorise.'] : []),
        ]),
  ]

  const accessDecisionLabel = blocked
    ? 'Refuse par le proxy'
    : securityLeak
      ? 'Ressource exposee sans garde'
      : lazyLoadTriggered
        ? 'Autorise apres lazy loading'
        : cacheHit && useProxy
          ? 'Autorise depuis le cache'
          : 'Acces direct'

  return {
    patternCode: 'proxy',
    summary: useProxy
      ? 'Proxy conserve le meme contrat que la ressource reelle tout en ajoutant un controle d acces et un chargement differe quand il devient utile.'
      : "Sans Proxy, le client frappe directement la ressource. Le controle d acces disparait du point d entree et les chargements lourds demarrent sans mediation.",
    logs,
    output: {
      mode,
      modeLabel: useProxy ? 'Avec Proxy' : 'Sans Proxy',
      requestLabel,
      requesterRole: requesterRole.code,
      requesterLabel: requesterRole.label,
      resourceCode: resource.code,
      resourceLabel: resource.label,
      resourceDescription: resource.description,
      subjectLabel: resource.subjectLabel,
      payloadLabel: resource.payloadLabel,
      payloadWeightMb: resource.payloadWeightMb,
      cacheState: cacheState.code,
      cacheLabel: cacheState.label,
      accessGranted,
      blocked,
      securityLeak,
      cacheHit,
      lazyLoadTriggered,
      eagerLoadTriggered,
      accessDecisionLabel,
      latencyMs,
      stepCount: steps.length,
      steps,
    },
    visualization: buildVisualization(useProxy, resource, blocked, lazyLoadTriggered, eagerLoadTriggered, securityLeak),
  }
}
