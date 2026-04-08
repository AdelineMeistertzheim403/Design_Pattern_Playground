import { numericStat } from './executorCommon'

export const builderProductTypes = {
  CAR: {
    code: 'CAR',
    label: 'Voiture',
    description: 'Assemble un vehicule personnalisable couche par couche dans un atelier visuel.',
    monolithicClassName: 'CarPreset',
    stageLabels: {
      SILHOUETTE: 'Chassis',
      CORE: 'Motorisation',
      ADDON: 'Module',
      FINISH: 'Finition',
    },
  },
  CHARACTER: {
    code: 'CHARACTER',
    label: 'Personnage',
    description: 'Assemble un hero modulaire avec equipement, support et finition.',
    monolithicClassName: 'HeroPreset',
    stageLabels: {
      SILHOUETTE: 'Silhouette',
      CORE: 'Noyau de role',
      ADDON: 'Accessoire',
      FINISH: 'Aura finale',
    },
  },
  HOUSE: {
    code: 'HOUSE',
    label: 'Maison',
    description: 'Assemble une maison progressive en posant structure, energie, extension et facade.',
    monolithicClassName: 'HousePreset',
    stageLabels: {
      SILHOUETTE: 'Structure',
      CORE: 'Noyau technique',
      ADDON: 'Extension',
      FINISH: 'Facade finale',
    },
  },
}

export const builderSilhouettes = {
  COMPACT: {
    code: 'COMPACT',
    stats: { agility: 5, resilience: 1, utility: 2, style: 2 },
    labels: {
      CAR: 'Sprint Chassis',
      CHARACTER: 'Agile Silhouette',
      HOUSE: 'Plan Compact',
    },
    details: {
      CAR: '{name} recoit un chassis court et nerveux, ideal pour l agilite.',
      CHARACTER: '{name} commence comme un profil rapide axe esquive et initiative.',
      HOUSE: '{name} pose une emprise reduite et un plan court a optimiser.',
    },
  },
  BALANCED: {
    code: 'BALANCED',
    stats: { agility: 3, resilience: 3, utility: 3, style: 2 },
    labels: {
      CAR: 'Touring Frame',
      CHARACTER: 'Balanced Stance',
      HOUSE: 'Pavillon Familial',
    },
    details: {
      CAR: '{name} prend un gabarit polyvalent facile a faire evoluer.',
      CHARACTER: '{name} demarre sur un profil souple qui ne sacrifie aucun axe.',
      HOUSE: '{name} se construit sur une base habitable bien repartie.',
    },
  },
  GRAND: {
    code: 'GRAND',
    stats: { agility: 1, resilience: 5, utility: 4, style: 3 },
    labels: {
      CAR: 'Titan Chassis',
      CHARACTER: 'Guardian Bulk',
      HOUSE: 'Manoir Panorama',
    },
    details: {
      CAR: '{name} adopte une base large, stable et orientee capacite.',
      CHARACTER: '{name} nait avec une stature massive tailee pour tenir la ligne.',
      HOUSE: '{name} lance une fondation ample destinee a porter plus d usages.',
    },
  },
}

export const builderCoreModules = {
  ELECTRIC: {
    code: 'ELECTRIC',
    stats: { agility: 4, resilience: 1, utility: 4, style: 2 },
    labels: {
      CAR: 'Electric Engine',
      CHARACTER: 'Volt Arsenal',
      HOUSE: 'Battery Core',
    },
    details: {
      CAR: 'Le moteur electrique donne a {name} des reprises propres et une bonne utilite.',
      CHARACTER: 'Le noyau electrique arme {name} pour des engagements rapides.',
      HOUSE: 'Le coeur batterie apporte a {name} un socle technique compact et pratique.',
    },
  },
  ARCANE: {
    code: 'ARCANE',
    stats: { agility: 2, resilience: 2, utility: 5, style: 4 },
    labels: {
      CAR: 'Arcane Turbine',
      CHARACTER: 'Arcane Focus',
      HOUSE: 'Arcane Hearth',
    },
    details: {
      CAR: 'La turbine arcane pousse {name} vers un profil plus spectaculaire et technique.',
      CHARACTER: 'Le focus arcane ouvre des capacites de controle et de polyvalence.',
      HOUSE: 'L atre arcane transforme {name} en maison experientielle et expressive.',
    },
  },
  SOLAR: {
    code: 'SOLAR',
    stats: { agility: 1, resilience: 3, utility: 4, style: 5 },
    labels: {
      CAR: 'Solar Roof Core',
      CHARACTER: 'Solar Totem',
      HOUSE: 'Solar Atrium',
    },
    details: {
      CAR: 'Le coeur solaire augmente l autonomie et l identite visuelle du vehicule.',
      CHARACTER: 'Le totem solaire stabilise {name} et renforce son aura.',
      HOUSE: 'L atrium solaire augmente l autonomie et la signature architecturale.',
    },
  },
}

export const builderAddonModules = {
  DEFENSE: {
    code: 'DEFENSE',
    stats: { agility: 0, resilience: 5, utility: 1, style: 1 },
    labels: {
      CAR: 'Shield Plating',
      CHARACTER: 'Bastion Guard',
      HOUSE: 'Defensive Tower',
    },
    details: {
      CAR: '{name} gagne des renforts protecteurs sans refaire toute la structure.',
      CHARACTER: '{name} recoit une couche defensive orientee tenue de ligne.',
      HOUSE: '{name} ajoute une protection peripherique et un signal de solidite.',
    },
  },
  MOBILITY: {
    code: 'MOBILITY',
    stats: { agility: 4, resilience: 0, utility: 2, style: 2 },
    labels: {
      CAR: 'Booster Pack',
      CHARACTER: 'Dash Harness',
      HOUSE: 'Garage Bridge',
    },
    details: {
      CAR: '{name} recoit un module de poussee pour mieux se projeter.',
      CHARACTER: '{name} obtient de nouveaux outils de deplacement et de rythme.',
      HOUSE: '{name} facilite les circulations avec un acces ou une annexe mobile.',
    },
  },
  SUPPORT: {
    code: 'SUPPORT',
    stats: { agility: 1, resilience: 1, utility: 4, style: 1 },
    labels: {
      CAR: 'Utility Rack',
      CHARACTER: 'Support Drone',
      HOUSE: 'Workshop Garden',
    },
    details: {
      CAR: '{name} embarque de l outillage et du support sans casser la base.',
      CHARACTER: '{name} est accompagne d un support qui elargit ses usages.',
      HOUSE: '{name} etend ses usages avec un atelier ou une zone complementaire.',
    },
  },
}

export const builderFinishStyles = {
  CLASSIC: {
    code: 'CLASSIC',
    stats: { agility: 0, resilience: 1, utility: 1, style: 2 },
    labels: {
      CAR: 'Classic Paint',
      CHARACTER: 'Heritage Cape',
      HOUSE: 'Traditional Facade',
    },
    details: {
      CAR: 'La finition classique donne a {name} une lecture immediate et rassurante.',
      CHARACTER: '{name} termine son build sur un rendu heroique et lisible.',
      HOUSE: '{name} affiche une facade lisible et intemporelle.',
    },
  },
  NEON: {
    code: 'NEON',
    stats: { agility: 1, resilience: 0, utility: 1, style: 4 },
    labels: {
      CAR: 'Neon Livery',
      CHARACTER: 'Neon Aura',
      HOUSE: 'Neon Facade',
    },
    details: {
      CAR: 'La finition neon rend {name} spectaculaire et tres lisible en demo.',
      CHARACTER: '{name} se ferme sur une aura vive qui dramatise le profil.',
      HOUSE: '{name} assume une facade expressive et plus audacieuse.',
    },
  },
  ECO: {
    code: 'ECO',
    stats: { agility: 0, resilience: 1, utility: 2, style: 3 },
    labels: {
      CAR: 'Eco Trim',
      CHARACTER: 'Verdant Aura',
      HOUSE: 'Eco Facade',
    },
    details: {
      CAR: 'La finition eco met en avant la sobriete et les usages durables.',
      CHARACTER: '{name} obtient une identite plus organique et durable.',
      HOUSE: '{name} conclut son chantier avec une facade orientee durabilite.',
    },
  },
}

export function addBuilderStats(baseStats, bonusStats) {
  return {
    agility: numericStat(baseStats.agility) + numericStat(bonusStats.agility),
    resilience: numericStat(baseStats.resilience) + numericStat(bonusStats.resilience),
    utility: numericStat(baseStats.utility) + numericStat(bonusStats.utility),
    style: numericStat(baseStats.style) + numericStat(bonusStats.style),
  }
}

export function fillBuilderTemplate(template, buildName) {
  return `${template ?? ''}`.replaceAll('{name}', buildName)
}

export function createBuilderStage(product, stageCode, option, buildName, runningStats) {
  const nextStats = addBuilderStats(runningStats, option.stats)

  return {
    stage: {
      index: ['SILHOUETTE', 'CORE', 'ADDON', 'FINISH'].indexOf(stageCode) + 1,
      stageCode,
      stageLabel: product.stageLabels[stageCode],
      optionCode: option.code,
      optionLabel: option.labels[product.code],
      detail: fillBuilderTemplate(option.details[product.code], buildName),
      deltaAgility: option.stats.agility,
      deltaResilience: option.stats.resilience,
      deltaUtility: option.stats.utility,
      deltaStyle: option.stats.style,
      agility: nextStats.agility,
      resilience: nextStats.resilience,
      utility: nextStats.utility,
      style: nextStats.style,
      totalScore: nextStats.agility + nextStats.resilience + nextStats.utility + nextStats.style,
    },
    nextStats,
  }
}

export function buildBuilderVisualization(product, stages, readyLabel, useBuilder, buildName, finalStats) {
  const nodes = [
    {
      id: 'client',
      label: 'Client',
      type: 'client',
      data: { detail: buildName },
    },
  ]

  if (useBuilder) {
    nodes.push(
      {
        id: 'director',
        label: 'ArtifactDirector',
        type: 'context',
        data: { detail: 'orchestration stable' },
      },
      {
        id: 'builder',
        label: 'WorkshopArtifactBuilder',
        type: 'factory',
        data: { detail: product.label },
      },
      ...stages.map((stage) => ({
        id: `stage-${stage.stageCode.toLowerCase()}`,
        label: stage.optionLabel,
        type: 'component',
        data: { detail: stage.stageLabel },
      })),
      {
        id: 'product',
        label: product.label,
        type: 'product',
        data: { detail: buildName },
      },
      {
        id: 'result',
        label: readyLabel,
        type: 'output',
        data: {
          message: `AGI ${finalStats.agility} / RES ${finalStats.resilience} / UTI ${finalStats.utility} / STYLE ${finalStats.style}`,
        },
      },
    )

    return {
      nodes,
      edges: [
        { from: 'client', to: 'director', label: 'request' },
        { from: 'director', to: 'builder', label: 'orchestrates' },
        ...stages.map((stage) => ({
          from: `stage-${stage.stageCode.toLowerCase()}`,
          to: 'builder',
          label: 'step',
        })),
        { from: 'builder', to: 'product', label: 'build' },
        { from: 'product', to: 'result', label: 'ready' },
      ],
    }
  }

  nodes.push(
    {
      id: 'constructor',
      label: product.monolithicClassName,
      type: 'context',
      data: { detail: 'constructeur geant' },
    },
    ...stages.map((stage) => ({
      id: `param-${stage.stageCode.toLowerCase()}`,
      label: stage.optionLabel,
      type: 'component',
      data: { detail: 'parametre' },
    })),
    {
      id: 'product',
      label: product.label,
      type: 'product',
      data: { detail: buildName },
    },
    {
      id: 'result',
      label: readyLabel,
      type: 'output',
      data: {
        message: `AGI ${finalStats.agility} / RES ${finalStats.resilience} / UTI ${finalStats.utility} / STYLE ${finalStats.style}`,
      },
    },
  )

  return {
    nodes,
    edges: [
      { from: 'client', to: 'constructor', label: 'new(...)' },
      ...stages.map((stage) => ({
        from: `param-${stage.stageCode.toLowerCase()}`,
        to: 'constructor',
        label: 'param',
      })),
      { from: 'constructor', to: 'product', label: 'instantiate' },
      { from: 'product', to: 'result', label: 'ready' },
    ],
  }
}
