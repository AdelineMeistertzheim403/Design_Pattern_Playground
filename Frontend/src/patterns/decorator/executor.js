import {
  addDecoratorStats,
  buildDecoratorVisualization,
  decoratorBaseProfiles,
  decoratorDefinitions,
} from '../shared/decoratorExecutorSupport'
import { normalizeOrderedUniqueList } from '../shared/executorCommon'

export default function executeDecoratorPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_DECORATOR'}`.toUpperCase()
  const useDecorator = mode !== 'WITHOUT_DECORATOR'
  const characterName = `${parameters.characterName ?? ''}`.trim() || 'Ember Knight'
  const baseType = `${parameters.baseType ?? 'WARRIOR'}`.toUpperCase()
  const baseProfile = decoratorBaseProfiles[baseType] ?? decoratorBaseProfiles.WARRIOR
  const decorators = normalizeOrderedUniqueList(parameters.decorators)

  decorators.forEach((code) => {
    if (!decoratorDefinitions[code]) {
      throw new Error(`Decorator inconnu : ${code}`)
    }
  })

  const logs = [
    `Creation du composant de base ${characterName} sur le profil ${baseProfile.label}.`,
    `Stats de depart : ATK ${baseProfile.stats.attack} / DEF ${baseProfile.stats.defense} / SPD ${baseProfile.stats.speed} / CTRL ${baseProfile.stats.control}.`,
  ]
  const activeEffects = [`Socle de base ${baseProfile.label}`]

  const stack = [
    {
      code: 'BASE',
      layerClass: 'BaseCharacter',
      layerLabel: baseProfile.label,
      effect: baseProfile.description,
      ...baseProfile.stats,
    },
  ]

  let runningStats = { ...baseProfile.stats }

  if (useDecorator) {
    decorators.forEach((code) => {
      const definition = decoratorDefinitions[code]
      runningStats = addDecoratorStats(runningStats, definition.stats)
      logs.push(`Ajout de ${definition.layerLabel} autour du composant courant.`)
      logs.push(`Effet applique : ${definition.effect}`)
      activeEffects.push(definition.effect)
      stack.push({
        code: definition.code,
        layerClass: definition.layerLabel,
        layerLabel: definition.layerLabel,
        effect: definition.effect,
        ...runningStats,
      })
    })
  } else {
    logs.push('Mode sans Decorator : les effets sont regroupes dans une classe concrete specialisee.')
    decorators.forEach((code) => {
      const definition = decoratorDefinitions[code]
      runningStats = addDecoratorStats(runningStats, definition.stats)
      logs.push(`Effet ${definition.layerLabel} integre directement dans une classe monolithique.`)
      logs.push(`Variation appliquee : ${definition.effect}`)
      activeEffects.push(definition.effect)
    })

    if (decorators.length > 0) {
      stack.push({
        code: 'MONOLITH',
        layerClass: `${baseProfile.label.replaceAll(' ', '')}Combo`,
        layerLabel: 'Monolithic build',
        effect: 'Toutes les variations sont codees dans une seule classe concrete.',
        ...runningStats,
      })
    }
  }

  const challengeGoal = 'attaque >= 20 et defense >= 10'
  const challengeMet = runningStats.attack >= 20 && runningStats.defense >= 10

  logs.push(
    `Stats finales : ATK ${runningStats.attack} / DEF ${runningStats.defense} / SPD ${runningStats.speed} / CTRL ${runningStats.control}.`,
  )
  logs.push(
    challengeMet
      ? 'Objectif atteint : le build depasse le seuil cible.'
      : 'Objectif non atteint : il reste de la marge pour optimiser la pile de decorators.',
  )

  return {
    patternCode: 'decorator',
    summary: useDecorator
      ? (decorators.length === 0
        ? "Sans Decorator, le personnage reste un composant de base. Chaque nouvel effet demanderait sinon une nouvelle classe specialisee."
        : "Decorator empile des effets autour du meme composant pour faire evoluer le build sans toucher a la classe d origine.")
      : "Sans Decorator, les memes effets sont fusionnes dans une classe concrete specialisee plus rigide et moins composable.",
    logs,
    output: {
      mode: useDecorator ? 'WITH_DECORATOR' : 'WITHOUT_DECORATOR',
      modeLabel: useDecorator ? 'Avec Decorator' : 'Sans Decorator',
      characterName,
      baseType: baseProfile.code,
      baseLabel: baseProfile.label,
      decoratorCount: decorators.length,
      decorators,
      attack: runningStats.attack,
      defense: runningStats.defense,
      speed: runningStats.speed,
      control: runningStats.control,
      activeEffects,
      challengeGoal,
      challengeMet,
      classExplosionExamples: [
        `${baseProfile.label.replaceAll(' ', '')}FireShield`,
        `${baseProfile.label.replaceAll(' ', '')}FireSpeed`,
        `${baseProfile.label.replaceAll(' ', '')}ShieldIce`,
      ],
      stack,
    },
    visualization: buildDecoratorVisualization(baseProfile, stack, runningStats, challengeMet),
  }
}
