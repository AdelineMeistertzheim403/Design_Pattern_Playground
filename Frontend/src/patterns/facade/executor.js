const routines = {
  CINEMA_MODE: {
    code: 'CINEMA_MODE',
    label: 'Cinema Mode',
    description: 'Lance une seance en une seule action en coordonnant audio surround, lumiere tamisee et securite perimetrique.',
    ambianceLabel: 'immersive focus',
    audioAction: 'Passe en surround 7.1 et baisse les notifications.',
    lightAction: 'Tamise la piece a 18% avec une teinte ambre.',
    securityAction: 'Verrouille le perimetre en mode silencieux.',
    manualMissedSubsystem: 'SECURITY',
    manualMissedDetail: 'La lumiere et le son sont prets, mais la securite reste oubliee si le client pilote les modules a la main.',
  },
  NIGHT_SHUTDOWN: {
    code: 'NIGHT_SHUTDOWN',
    label: 'Night Shutdown',
    description: 'Coupe la maison pour la nuit avec extinction des medias, lumiere de circulation minimale et armement complet.',
    ambianceLabel: 'quiet safe',
    audioAction: 'Place l audio en veille complete.',
    lightAction: 'Eteint les zones principales et garde un chemin lumineux doux.',
    securityAction: 'Arme la maison en mode nuit.',
    manualMissedSubsystem: 'AUDIO',
    manualMissedDetail: 'La fermeture manuelle oublie souvent l audio, qui continue a tourner alors que le reste est coupe.',
  },
  PARTY_STARTUP: {
    code: 'PARTY_STARTUP',
    label: 'Party Startup',
    description: 'Declenche une ambiance festive avec preset audio, lumiere dynamique et securite adaptee aux invites.',
    ambianceLabel: 'open social',
    audioAction: 'Charge une playlist energique avec bass boost.',
    lightAction: 'Active des scenes couleur pulsees dans les espaces communs.',
    securityAction: 'Basculle la securite sur acces invites supervise.',
    manualMissedSubsystem: 'SECURITY',
    manualMissedDetail: 'Sans facade, l acces invites reste souvent non configure et casse l experience des arrivants.',
  },
}

function createStep(index, stageCode, systemCode, title, actorLabel, status, detail) {
  return { index, stageCode, systemCode, title, actorLabel, status, detail }
}

function collectMissedSubsystems(audioReady, lightReady, securityReady) {
  const missed = []
  if (!audioReady) missed.push('Audio')
  if (!lightReady) missed.push('Lumiere')
  if (!securityReady) missed.push('Securite')
  return missed
}

function subsystemStep(useFacade, index, systemCode, actorLabel, title, action, ready, manualMissedDetail) {
  return createStep(
    index,
    systemCode,
    systemCode,
    title,
    actorLabel,
    ready ? 'READY' : 'MISSED',
    ready
      ? `${useFacade ? 'Declenche par la facade. ' : 'Declenche directement par le client. '}${action}`
      : manualMissedDetail,
  )
}

function buildVisualization(useFacade, audioReady, lightReady, securityReady, systemsReady) {
  const nodes = [
    { id: 'client', label: 'Control Button', type: 'client', data: { detail: 'one-click trigger' } },
  ]
  const edges = []

  if (useFacade) {
    nodes.push({ id: 'facade', label: 'SmartHomeFacade', type: 'context', data: { detail: 'single entry point' } })
  }

  nodes.push(
    { id: 'audio', label: 'AudioSystem', type: 'component', data: { detail: audioReady ? 'ready' : 'missed', active: audioReady } },
    { id: 'light', label: 'LightSystem', type: 'component', data: { detail: lightReady ? 'ready' : 'missed', active: lightReady } },
    { id: 'security', label: 'SecuritySystem', type: 'component', data: { detail: securityReady ? 'ready' : 'missed', active: securityReady } },
    { id: 'result', label: systemsReady ? 'Routine active' : 'Routine partielle', type: 'output', data: { message: systemsReady ? 'all systems aligned' : 'manual drift' } },
  )

  if (useFacade) {
    edges.push(
      { from: 'client', to: 'facade', label: 'start' },
      { from: 'facade', to: 'audio', label: 'audio' },
      { from: 'facade', to: 'light', label: 'light' },
      { from: 'facade', to: 'security', label: 'security' },
      { from: 'facade', to: 'result', label: systemsReady ? 'ready' : 'partial' },
    )
  } else {
    edges.push(
      { from: 'client', to: 'audio', label: audioReady ? 'audio' : 'missed' },
      { from: 'client', to: 'light', label: lightReady ? 'light' : 'missed' },
      { from: 'client', to: 'security', label: securityReady ? 'security' : 'missed' },
      { from: 'client', to: 'result', label: systemsReady ? 'ready' : 'partial' },
    )
  }

  return { nodes, edges }
}

export default function executeFacadePattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_FACADE'}`.trim().toUpperCase()
  const useFacade = mode !== 'WITHOUT_FACADE'
  const triggerLabel = `${parameters.triggerLabel ?? ''}`.trim() || 'Start'
  const routine = routines[`${parameters.routineCode ?? 'CINEMA_MODE'}`.trim().toUpperCase()] ?? routines.CINEMA_MODE
  const audioReady = useFacade || routine.manualMissedSubsystem !== 'AUDIO'
  const lightReady = useFacade || routine.manualMissedSubsystem !== 'LIGHT'
  const securityReady = useFacade || routine.manualMissedSubsystem !== 'SECURITY'
  const systemsReady = audioReady && lightReady && securityReady
  const missedSubsystems = collectMissedSubsystems(audioReady, lightReady, securityReady)
  const manualTouchCount = useFacade ? 1 : 3
  const latencyMs = useFacade ? 210 : (systemsReady ? 360 : 470)
  let nextIndex = 1

  const steps = [
    createStep(
      nextIndex++,
      'TRIGGER',
      'CLIENT',
      'Appui utilisateur',
      'HomeAutomationClient',
      'SENT',
      `Le client presse ${triggerLabel} pour lancer ${routine.label}.`,
    ),
    ...(useFacade
      ? [
          createStep(
            nextIndex++,
            'FACADE',
            'FACADE',
            'Orchestration',
            'SmartHomeFacade',
            'ORCHESTRATING',
            'La facade decompose la routine en trois appels lisibles vers audio, lumiere et securite.',
          ),
        ]
      : []),
    subsystemStep(useFacade, nextIndex++, 'AUDIO', 'AudioSystem', 'Preset audio', routine.audioAction, audioReady, routine.manualMissedDetail),
    subsystemStep(useFacade, nextIndex++, 'LIGHT', 'LightSystem', 'Scene lumiere', routine.lightAction, lightReady, routine.manualMissedDetail),
    subsystemStep(useFacade, nextIndex++, 'SECURITY', 'SecuritySystem', 'Mode securite', routine.securityAction, securityReady, routine.manualMissedDetail),
    createStep(
      nextIndex,
      'RESULT',
      'RESULT',
      'Etat global',
      useFacade ? 'SmartHomeFacade' : 'HomeAutomationClient',
      systemsReady ? 'READY' : 'PARTIAL',
      systemsReady
        ? 'La routine demarre completement depuis un point d entree unique.'
        : 'Le systeme reste partiel car une coordination manuelle a laisse un sous-systeme a l ecart.',
    ),
  ]

  return {
    patternCode: 'facade',
    summary: useFacade
      ? 'Facade condense la routine dans une seule methode. Le client appuie sur Start et laisse la facade choregraphier audio, lumiere et securite.'
      : 'Sans Facade, le client diffuse lui-meme les appels vers chaque sous-systeme. Le flux reste plus verbeux et un module peut facilement etre oublie.',
    logs: [
      `Le client appuie sur ${triggerLabel} pour lancer ${routine.label}.`,
      useFacade
        ? 'SmartHomeFacade expose une seule methode et orchestre les trois sous-systemes.'
        : 'Sans facade, le client manipule chaque sous-systeme directement.',
      `AudioSystem -> ${audioReady ? routine.audioAction : routine.manualMissedDetail}`,
      `LightSystem -> ${lightReady ? routine.lightAction : routine.manualMissedDetail}`,
      `SecuritySystem -> ${securityReady ? routine.securityAction : routine.manualMissedDetail}`,
    ],
    output: {
      mode,
      modeLabel: useFacade ? 'Avec Facade' : 'Sans Facade',
      triggerLabel,
      routineCode: routine.code,
      routineLabel: routine.label,
      routineDescription: routine.description,
      ambianceLabel: routine.ambianceLabel,
      audioAction: routine.audioAction,
      lightAction: routine.lightAction,
      securityAction: routine.securityAction,
      audioReady,
      lightReady,
      securityReady,
      systemsReady,
      missedSubsystems,
      subsystemCount: 3,
      manualTouchCount,
      orchestrationLabel: useFacade ? 'One-click orchestration' : 'Manual fan-out',
      resultLabel: systemsReady ? 'Routine active' : 'Routine partielle',
      latencyMs,
      stepCount: steps.length,
      steps,
    },
    visualization: buildVisualization(useFacade, audioReady, lightReady, securityReady, systemsReady),
  }
}
