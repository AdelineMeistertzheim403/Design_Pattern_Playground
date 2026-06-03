const presets = {
  PIXEL_GARDEN: {
    code: 'PIXEL_GARDEN',
    label: 'Pixel Garden',
    description:
      'Une scene colorisee avec couches, annotations et niveau d energie a restaurer pendant un rewind.',
    rewindBenefit:
      'Le caretaker conserve des instantanes complets et l originator revient exactement a l etat capture.',
    manualDriftDetail:
      'Sans Memento, le client tente un retour arriere avec des notes partielles : quelques valeurs reviennent, mais l etat global derive.',
    initialState: {
      sceneLabel: 'Pixel Garden',
      theme: 'Mint Bloom',
      energy: 68,
      layerCount: 3,
      annotationCount: 2,
      alertLevel: 'Stable',
    },
  },
  ARCADE_HUB: {
    code: 'ARCADE_HUB',
    label: 'Arcade Hub',
    description: 'Un hub neon qui accumule overlays et alertes pendant la session de jeu.',
    rewindBenefit: 'Chaque savepoint capture le hub complet avant une mutation risquee.',
    manualDriftDetail:
      'Le retour manuel ne restaure qu une partie du hub et laisse des compteurs dans un etat hybride.',
    initialState: {
      sceneLabel: 'Arcade Hub',
      theme: 'Neon Pulse',
      energy: 72,
      layerCount: 4,
      annotationCount: 1,
      alertLevel: 'Online',
    },
  },
  CONTROL_ROOM: {
    code: 'CONTROL_ROOM',
    label: 'Control Room',
    description:
      'Une salle de controle dont les couches, l energie et les marqueurs changent vite en phase d incident.',
    rewindBenefit:
      'Le snapshot protege la salle de controle et permet un retour net vers un checkpoint sain.',
    manualDriftDetail:
      'Le replay manuel oublie des morceaux de contexte et la salle revient dans un etat incoherent.',
    initialState: {
      sceneLabel: 'Control Room',
      theme: 'Amber Grid',
      energy: 76,
      layerCount: 5,
      annotationCount: 3,
      alertLevel: 'Monitoring',
    },
  },
}

function createStep(index, actionCode, actionLabel, actorLabel, detail, snapshotCreated, checkpointCode, state) {
  return {
    index,
    actionCode,
    actionLabel,
    actorLabel,
    detail,
    snapshotCreated,
    checkpointCode,
    state,
  }
}

function buildVisualization(useMemento, restoreTarget, restoredState) {
  return {
    nodes: [
      { id: 'client', label: 'EditorClient', type: 'client', data: { detail: 'asks save / restore' } },
      { id: 'originator', label: 'SceneOriginator', type: 'context', data: { detail: 'owns scene state', active: true } },
      {
        id: 'caretaker',
        label: useMemento ? 'SnapshotCaretaker' : 'LooseNotes',
        type: 'cluster',
        data: { detail: useMemento ? 'stores mementos' : 'stores partial notes' },
      },
      { id: 'alpha', label: 'Checkpoint Alpha', type: 'component', data: { detail: 'first savepoint' } },
      { id: 'beta', label: 'Checkpoint Beta', type: 'component', data: { detail: 'second savepoint' } },
      {
        id: 'result',
        label: useMemento ? 'Exact restore' : 'Partial restore',
        type: 'output',
        data: { message: `${restoreTarget.label} -> ${restoredState.theme}` },
      },
    ],
    edges: [
      { from: 'client', to: 'originator', label: 'edit' },
      { from: 'originator', to: 'caretaker', label: useMemento ? 'create memento' : 'write notes' },
      { from: 'caretaker', to: 'alpha', label: 'save A' },
      { from: 'caretaker', to: 'beta', label: 'save B' },
      { from: 'caretaker', to: 'originator', label: `restore ${restoreTarget.code}` },
      { from: 'originator', to: 'result', label: useMemento ? 'exact' : 'drift' },
    ],
  }
}

export default function executeMementoPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_MEMENTO'}`.trim().toUpperCase()
  const useMemento = mode !== 'WITHOUT_MEMENTO'
  const preset = presets[`${parameters.presetCode ?? 'PIXEL_GARDEN'}`.trim().toUpperCase()] ?? presets.PIXEL_GARDEN
  const workspaceName = `${parameters.workspaceName ?? ''}`.trim() || 'Save & Restore'
  const restoreTargetCode = `${parameters.restoreTarget ?? 'SNAPSHOT_ALPHA'}`.trim().toUpperCase()
  const initialState = preset.initialState
  const styledState = {
    ...initialState,
    theme: useMemento ? 'Aurora Bloom' : 'Solar Bloom',
    annotationCount: initialState.annotationCount + 2,
    alertLevel: 'Focused',
  }
  const checkpointAlpha = {
    code: 'SNAPSHOT_ALPHA',
    label: 'Checkpoint Alpha',
    stepIndex: 3,
    note: 'Capture juste apres la personnalisation de la scene.',
    snapshotState: styledState,
  }
  const boostedState = {
    ...styledState,
    energy: styledState.energy + 18,
    layerCount: styledState.layerCount + 2,
    annotationCount: styledState.annotationCount + 1,
    alertLevel: 'Boosted',
  }
  const checkpointBeta = {
    code: 'SNAPSHOT_BETA',
    label: 'Checkpoint Beta',
    stepIndex: 5,
    note: 'Snapshot juste avant une mutation critique.',
    snapshotState: boostedState,
  }
  const emergencyState = {
    ...boostedState,
    theme: 'Crimson Rewind',
    energy: 24,
    layerCount: boostedState.layerCount + 1,
    annotationCount: boostedState.annotationCount + 3,
    alertLevel: 'Critical',
  }
  const restoreTarget = restoreTargetCode === 'SNAPSHOT_BETA' ? checkpointBeta : checkpointAlpha
  const restoredState = useMemento
    ? restoreTarget.snapshotState
    : {
        ...restoreTarget.snapshotState,
        energy: emergencyState.energy,
        annotationCount: emergencyState.annotationCount,
        alertLevel: 'Manual rewind',
      }

  const steps = [
    createStep(
      1,
      'INIT',
      'État initial',
      'SceneEditor',
      'Le workspace charge la scene de base et expose l etat courant a l originator.',
      false,
      null,
      initialState,
    ),
    createStep(
      2,
      'STYLE',
      'Personnalisation',
      'SceneEditor',
      'Le theme et les annotations changent avant le premier savepoint.',
      false,
      null,
      styledState,
    ),
    createStep(
      3,
      'SAVE_ALPHA',
      'Sauvegarde Alpha',
      useMemento ? 'Caretaker' : 'Client notes',
      useMemento
        ? 'Le caretaker stocke un memento complet sans exposer l interieur de la scene.'
        : 'Le client note quelques valeurs visibles, mais pas un snapshot fiable.',
      true,
      checkpointAlpha.code,
      styledState,
    ),
    createStep(
      4,
      'BOOST',
      'Mutation avancee',
      'SceneEditor',
      'La scene gagne des couches et de l energie avant un second snapshot.',
      false,
      null,
      boostedState,
    ),
    createStep(
      5,
      'SAVE_BETA',
      'Sauvegarde Beta',
      useMemento ? 'Caretaker' : 'Client notes',
      useMemento
        ? 'Un second memento capture exactement l etat juste avant la mutation critique.'
        : 'Le client enregistre un deuxieme checkpoint partiel base sur des notes visibles.',
      true,
      checkpointBeta.code,
      boostedState,
    ),
    createStep(
      6,
      'CRASH',
      'Mutation critique',
      'SceneEditor',
      'Une mutation risquee pousse la scene dans un etat critique avec energie basse et annotations surchargees.',
      false,
      null,
      emergencyState,
    ),
    createStep(
      7,
      'RESTORE',
      'Restauration',
      useMemento ? 'Originator' : 'Client rewind',
      useMemento
        ? 'L originator recharge le snapshot choisi et revient exactement a l etat capture.'
        : preset.manualDriftDetail,
      false,
      restoreTarget.code,
      restoredState,
    ),
  ]

  return {
    patternCode: 'memento',
    summary: useMemento
      ? 'Memento isole la capture d etat dans un objet snapshot. Le caretaker empile les savepoints et l originator peut restaurer exactement un ancien etat.'
      : 'Sans Memento, le client tente de rejouer un ancien etat avec des notes partielles. La restauration semble marcher, mais plusieurs champs restent derives.',
    logs: [
      `${workspaceName} ouvre ${preset.label}.`,
      useMemento
        ? 'Les savepoints passent par caretaker + memento, sans exposer la structure interne de la scene.'
        : 'Sans Memento, le client essaie de memoriser l etat via des notes partielles.',
      `Checkpoint Alpha capture ${checkpointAlpha.snapshotState.theme} avec ${checkpointAlpha.snapshotState.annotationCount} annotation(s).`,
      `Checkpoint Beta capture ${checkpointBeta.snapshotState.layerCount} couches avant la mutation critique.`,
      useMemento
        ? `La restauration sur ${restoreTarget.label} revient exactement a l etat capture.`
        : preset.manualDriftDetail,
    ],
    output: {
      mode,
      modeLabel: useMemento ? 'Avec Memento' : 'Sans Memento',
      workspaceName,
      presetCode: preset.code,
      presetLabel: preset.label,
      presetDescription: preset.description,
      restoreTarget: restoreTarget.code,
      restoreTargetLabel: restoreTarget.label,
      rewindBenefit: preset.rewindBenefit,
      manualDriftDetail: preset.manualDriftDetail,
      exactRestore: useMemento,
      snapshotCount: 2,
      stepCount: steps.length,
      initialState,
      restoredState,
      resultLabel: useMemento ? 'Restore exact' : 'Restore partiel',
      checkpoints: [checkpointAlpha, checkpointBeta],
      steps,
    },
    visualization: buildVisualization(useMemento, restoreTarget, restoredState),
  }
}
