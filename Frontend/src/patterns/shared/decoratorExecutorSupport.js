import { numericStat } from './executorCommon'

export const decoratorBaseProfiles = {
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

export const decoratorDefinitions = {
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

export function addDecoratorStats(baseStats, bonusStats) {
  return {
    attack: numericStat(baseStats.attack) + numericStat(bonusStats.attack),
    defense: numericStat(baseStats.defense) + numericStat(bonusStats.defense),
    speed: numericStat(baseStats.speed) + numericStat(bonusStats.speed),
    control: numericStat(baseStats.control) + numericStat(bonusStats.control),
  }
}

export function buildDecoratorVisualization(baseProfile, stack, finalStats, challengeMet) {
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
