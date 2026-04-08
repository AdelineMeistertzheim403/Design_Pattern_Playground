const archetypes = {
  SCOUT_DRONE: {
    code: 'SCOUT_DRONE',
    label: 'Scout Drone',
    description: 'Un eclaireur leger clone rapidement pour couvrir le terrain avec un noyau de navigation partageable.',
    shellColorHex: '#d7b28d',
    shellLabel: 'coque sable',
    baseAttack: 8,
    baseDefense: 5,
    baseSpeed: 10,
    moduleCode: 'SCOUT_CORE',
    moduleLabel: 'Scout Core',
    moduleColorHex: '#45b6c9',
    moduleEffect: 'traces radar',
    moduleSyncKey: 'scout-link',
    moduleAttack: 2,
    moduleDefense: 1,
    moduleSpeed: 3,
  },
  SIEGE_MECH: {
    code: 'SIEGE_MECH',
    label: 'Siege Mech',
    description: 'Une plate-forme lourde dupliquee en plusieurs chassis pour preparer une vague de combat specialisee.',
    shellColorHex: '#8f6b54',
    shellLabel: 'armure bronze',
    baseAttack: 11,
    baseDefense: 10,
    baseSpeed: 4,
    moduleCode: 'SIEGE_CORE',
    moduleLabel: 'Siege Core',
    moduleColorHex: '#426c8d',
    moduleEffect: 'pulse gravite',
    moduleSyncKey: 'siege-link',
    moduleAttack: 3,
    moduleDefense: 4,
    moduleSpeed: 0,
  },
  ARCANE_SENTINEL: {
    code: 'ARCANE_SENTINEL',
    label: 'Arcane Sentinel',
    description: 'Un gardien mystique clone a la demande pour garder la meme silhouette tout en variant les charges internes.',
    shellColorHex: '#b996d0',
    shellLabel: 'plaque violette',
    baseAttack: 9,
    baseDefense: 8,
    baseSpeed: 6,
    moduleCode: 'ARCANE_CORE',
    moduleLabel: 'Arcane Core',
    moduleColorHex: '#7b57a2',
    moduleEffect: 'echo runique',
    moduleSyncKey: 'arcane-link',
    moduleAttack: 4,
    moduleDefense: 2,
    moduleSpeed: 2,
  },
}

const mutationPresets = {
  OVERCLOCK: {
    code: 'OVERCLOCK',
    label: 'Overclock Burst',
    detail: 'Pousse le coeur clone dans un mode agressif. Ideal pour voir si l etat imbrique se propage.',
    colorHex: '#cf5c3b',
    effectLabel: 'salve plasma',
    syncKey: 'burst-red',
    bonusAttack: 5,
    bonusDefense: 0,
    bonusSpeed: 3,
  },
  FORTIFY: {
    code: 'FORTIFY',
    label: 'Fortify Shield',
    detail: 'Renforce l enveloppe defensive du module pour observer un partage de configuration protectrice.',
    colorHex: '#426c8d',
    effectLabel: 'bouclier sync',
    syncKey: 'guard-blue',
    bonusAttack: 0,
    bonusDefense: 5,
    bonusSpeed: 1,
  },
  STEALTH: {
    code: 'STEALTH',
    label: 'Stealth Veil',
    detail: 'Injecte un profil de furtivite et de vitesse dans le coeur du clone cible.',
    colorHex: '#246b5e',
    effectLabel: 'brume furtive',
    syncKey: 'ghost-green',
    bonusAttack: 1,
    bonusDefense: 1,
    bonusSpeed: 5,
  },
}

const cloneShellPalette = ['#d7b28d', '#d8c29f', '#c9a87a', '#b7d1d8', '#d6b2c6', '#aac9b8']
const cloneShellLabels = ['coque sable', 'coque ivoire', 'coque cuivre', 'coque azur', 'coque rosee', 'coque jade']

function createCompanion(archetype, refId) {
  return {
    code: archetype.moduleCode,
    label: archetype.moduleLabel,
    colorHex: archetype.moduleColorHex,
    effectLabel: archetype.moduleEffect,
    syncKey: archetype.moduleSyncKey,
    bonusAttack: archetype.moduleAttack,
    bonusDefense: archetype.moduleDefense,
    bonusSpeed: archetype.moduleSpeed,
    refId,
  }
}

function deepCopyCompanion(companion, refId) {
  return {
    ...companion,
    refId,
  }
}

function createSeed(blueprintName, archetype, refId) {
  return {
    id: 'prototype-seed',
    label: blueprintName,
    serial: 'SEED-001',
    shellColorHex: archetype.shellColorHex,
    shellLabel: archetype.shellLabel,
    baseAttack: archetype.baseAttack,
    baseDefense: archetype.baseDefense,
    baseSpeed: archetype.baseSpeed,
    companionState: createCompanion(archetype, refId),
  }
}

function cloneUnit(seed, blueprintName, cloneNumber, usePrototype, nextRefId) {
  const companionState = usePrototype
    ? deepCopyCompanion(seed.companionState, nextRefId)
    : seed.companionState

  return {
    id: `clone-${cloneNumber}`,
    label: `${blueprintName} #${cloneNumber}`,
    serial: `CLN-${String(cloneNumber).padStart(3, '0')}`,
    shellColorHex: cloneShellPalette[(cloneNumber - 1) % cloneShellPalette.length],
    shellLabel: cloneShellLabels[(cloneNumber - 1) % cloneShellLabels.length],
    baseAttack: seed.baseAttack,
    baseDefense: seed.baseDefense,
    baseSpeed: seed.baseSpeed,
    companionState,
  }
}

function toCloneMap(clone, mutatedDirectly, affectedByMutation) {
  return {
    id: clone.id,
    label: clone.label,
    serial: clone.serial,
    shellColorHex: clone.shellColorHex,
    shellLabel: clone.shellLabel,
    attack: clone.baseAttack + clone.companionState.bonusAttack,
    defense: clone.baseDefense + clone.companionState.bonusDefense,
    speed: clone.baseSpeed + clone.companionState.bonusSpeed,
    moduleCode: clone.companionState.code,
    moduleLabel: clone.companionState.label,
    moduleColorHex: clone.companionState.colorHex,
    moduleEffect: clone.companionState.effectLabel,
    moduleSyncKey: clone.companionState.syncKey,
    moduleReferenceId: clone.companionState.refId,
    mutatedDirectly,
    affectedByMutation,
  }
}

function buildVisualization(usePrototype, prototypeSeed, finalClones, mutationTarget, affectedCloneIds) {
  const nodes = [
    {
      id: 'prototype-seed',
      label: prototypeSeed.label,
      type: 'factory',
      data: {
        detail: usePrototype ? 'deep clone source' : 'manual shallow source',
      },
    },
  ]
  const edges = []

  if (usePrototype) {
    finalClones.forEach((clone) => {
      nodes.push({
        id: clone.id,
        label: clone.label,
        type: 'product',
        data: {
          detail: clone.companionState.label,
          active: clone.id === mutationTarget.id,
        },
      })
      nodes.push({
        id: `${clone.id}-module`,
        label: clone.companionState.label,
        type: 'component',
        data: {
          detail: clone.companionState.refId,
        },
      })
      edges.push({ from: 'prototype-seed', to: clone.id, label: 'clone' })
      edges.push({ from: clone.id, to: `${clone.id}-module`, label: 'owns' })
    })
  } else {
    nodes.push({
      id: 'shared-module',
      label: mutationTarget.companionState.label,
      type: 'decorator',
      data: {
        detail: 'shared nested state',
      },
    })
    finalClones.forEach((clone) => {
      nodes.push({
        id: clone.id,
        label: clone.label,
        type: 'product',
        data: {
          detail: clone.companionState.label,
          active: clone.id === mutationTarget.id,
        },
      })
      edges.push({ from: 'prototype-seed', to: clone.id, label: 'copy' })
      edges.push({ from: 'shared-module', to: clone.id, label: 'shared' })
    })
  }

  nodes.push({
    id: 'result',
    label: affectedCloneIds.length > 1 ? 'Propagation' : 'Isolation',
    type: 'output',
    data: {
      message: affectedCloneIds.length > 1 ? 'shared nested mutation' : 'isolated deep mutation',
    },
  })
  edges.push({ from: mutationTarget.id, to: 'result', label: 'mutate' })

  return { nodes, edges }
}

export default function executePrototypePattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_PROTOTYPE'}`.trim().toUpperCase()
  const usePrototype = mode !== 'WITHOUT_PROTOTYPE'
  const blueprintName = `${parameters.blueprintName ?? ''}`.trim() || 'Echo Forge'
  const archetype = archetypes[`${parameters.archetype ?? 'SCOUT_DRONE'}`.trim().toUpperCase()] ?? archetypes.SCOUT_DRONE
  const cloneCount = Math.max(2, Math.min(6, Number(parameters.cloneCount ?? 4) || 4))
  const mutationTargetRaw = `${parameters.mutationTarget ?? 'CLONE_2'}`.trim().toUpperCase()
  const mutationPreset = mutationPresets[`${parameters.mutationPreset ?? 'OVERCLOCK'}`.trim().toUpperCase()] ?? mutationPresets.OVERCLOCK
  const targetIndex = Math.max(0, Math.min(cloneCount - 1, Number(mutationTargetRaw.replace('CLONE_', '')) - 1 || 1))

  let companionRefCounter = 1
  const nextCompanionRef = () => `REF-${String(companionRefCounter++).padStart(3, '0')}`

  const prototypeSeed = createSeed(blueprintName, archetype, nextCompanionRef())

  const initialClonesRaw = Array.from({ length: cloneCount }, (_, index) => (
    cloneUnit(prototypeSeed, blueprintName, index + 1, usePrototype, nextCompanionRef())
  ))
  const initialClones = initialClonesRaw.map((clone) => toCloneMap(clone, false, false))

  const finalClonesRaw = Array.from({ length: cloneCount }, (_, index) => (
    cloneUnit(prototypeSeed, blueprintName, index + 1, usePrototype, nextCompanionRef())
  ))

  const mutationTarget = finalClonesRaw[targetIndex]
  Object.assign(mutationTarget.companionState, {
    code: mutationPreset.code,
    label: mutationPreset.label,
    colorHex: mutationPreset.colorHex,
    effectLabel: mutationPreset.effectLabel,
    syncKey: mutationPreset.syncKey,
    bonusAttack: mutationPreset.bonusAttack,
    bonusDefense: mutationPreset.bonusDefense,
    bonusSpeed: mutationPreset.bonusSpeed,
  })

  const affectedCloneIds = finalClonesRaw
    .filter((clone) => clone.companionState === mutationTarget.companionState)
    .map((clone) => clone.id)

  const logs = [
    `Le prototype source ${blueprintName} sort deja configure pour l archetype ${archetype.label}.`,
    usePrototype
      ? "Chaque clone appelle clone() et duplique aussi le coeur imbrique. La reference profonde change a chaque copie."
      : "Sans Prototype, le client recopie le chassis mais garde la meme reference de coeur imbrique entre tous les clones.",
    `${mutationTarget.label} recoit le preset ${mutationPreset.label} sur son coeur ${mutationTarget.companionState.label}.`,
    affectedCloneIds.length > 1
      ? `La mutation se propage a ${affectedCloneIds.length} clones car l etat imbrique est partage.`
      : `La mutation reste isolee sur ${mutationTarget.label} grace a une copie profonde du coeur.`,
  ]

  return {
    patternCode: 'prototype',
    summary: usePrototype
      ? 'Prototype accelere la duplication d un objet deja configure. Avec une copie profonde, chaque clone garde ensuite son etat imbrique isole.'
      : "Sans Prototype, la duplication semble rapide mais laisse souvent un etat imbrique partage. Une mutation locale fuit alors vers les autres clones.",
    logs,
    output: {
      mode,
      modeLabel: usePrototype ? 'Avec Prototype' : 'Sans Prototype',
      copyDepthLabel: usePrototype ? 'Copie profonde' : 'Copie superficielle',
      blueprintName,
      archetype: archetype.code,
      archetypeLabel: archetype.label,
      archetypeDescription: archetype.description,
      cloneCount,
      sharedNestedState: !usePrototype,
      mutationTargetId: mutationTarget.id,
      mutationTargetLabel: mutationTarget.label,
      mutationPreset: mutationPreset.code,
      mutationPresetLabel: mutationPreset.label,
      mutationDetail: mutationPreset.detail,
      propagationCount: affectedCloneIds.length,
      propagationLabel: affectedCloneIds.length > 1
        ? `${affectedCloneIds.length} clones impactes par la meme reference de coeur`
        : '1 clone impacte : l etat profond reste isole',
      prototypeSeed: toCloneMap(prototypeSeed, false, false),
      initialClones,
      clones: finalClonesRaw.map((clone) => (
        toCloneMap(clone, clone.id === mutationTarget.id, affectedCloneIds.includes(clone.id))
      )),
      steps: [
        {
          index: 1,
          stepCode: 'SEED',
          title: 'Prototype source',
          detail: 'Le blueprint de base est pret avec sa coque et son coeur initial.',
          affectedCloneIds: [],
          visibleCloneCount: 0,
        },
        {
          index: 2,
          stepCode: 'CLONE',
          title: 'Duplication',
          detail: "Les clones sortent du meme gabarit. Le vrai piege se joue dans l etat imbrique.",
          affectedCloneIds: [],
          visibleCloneCount: cloneCount,
        },
        {
          index: 3,
          stepCode: 'MUTATE',
          title: 'Mutation ciblee',
          detail: `${mutationTarget.label} recoit ${mutationPreset.label}.`,
          affectedCloneIds: [mutationTarget.id],
          visibleCloneCount: cloneCount,
        },
        {
          index: 4,
          stepCode: 'OBSERVE',
          title: 'Propagation',
          detail: affectedCloneIds.length > 1
            ? 'La mutation se diffuse a tous les clones relies au meme coeur.'
            : 'La mutation reste limitee au clone cible.',
          affectedCloneIds,
          visibleCloneCount: cloneCount,
        },
      ],
    },
    visualization: buildVisualization(usePrototype, prototypeSeed, finalClonesRaw, mutationTarget, affectedCloneIds),
  }
}
