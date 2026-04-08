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

export function distributeObjects(objectCount, variantCount, variantIndex) {
  const base = Math.floor(objectCount / variantCount)
  const remainder = objectCount % variantCount
  return base + (variantIndex < remainder ? 1 : 0)
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
