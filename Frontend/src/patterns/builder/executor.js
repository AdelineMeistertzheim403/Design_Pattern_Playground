import {
  buildBuilderVisualization,
  builderAddonModules,
  builderCoreModules,
  builderFinishStyles,
  builderProductTypes,
  builderSilhouettes,
  createBuilderStage,
} from '../shared/builderExecutorSupport'

export default function executeBuilderPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_BUILDER'}`.trim().toUpperCase()
  const useBuilder = mode !== 'WITHOUT_BUILDER'
  const buildName = `${parameters.buildName ?? ''}`.trim() || 'Aurora Mk II'
  const product = builderProductTypes[`${parameters.productType ?? 'CAR'}`.trim().toUpperCase()] ?? builderProductTypes.CAR
  const silhouette = builderSilhouettes[`${parameters.silhouette ?? 'BALANCED'}`.trim().toUpperCase()] ?? builderSilhouettes.BALANCED
  const coreModule = builderCoreModules[`${parameters.coreModule ?? 'ELECTRIC'}`.trim().toUpperCase()] ?? builderCoreModules.ELECTRIC
  const addonModule = builderAddonModules[`${parameters.addonModule ?? 'SUPPORT'}`.trim().toUpperCase()] ?? builderAddonModules.SUPPORT
  const finishStyle = builderFinishStyles[`${parameters.finishStyle ?? 'CLASSIC'}`.trim().toUpperCase()] ?? builderFinishStyles.CLASSIC
  const logs = []
  const stageOrder = [
    ['SILHOUETTE', silhouette],
    ['CORE', coreModule],
    ['ADDON', addonModule],
    ['FINISH', finishStyle],
  ]

  let runningStats = { agility: 0, resilience: 0, utility: 0, style: 0 }
  const stages = stageOrder.map(([stageCode, option]) => {
    const built = createBuilderStage(product, stageCode, option, buildName, runningStats)
    runningStats = built.nextStats
    return built.stage
  })

  if (useBuilder) {
    logs.push(`Le client demande un ${product.label.toLowerCase()} nomme ${buildName}.`)
    logs.push('Le director orchestre la construction et garde l ordre des etapes stable.')
    stages.forEach((stage) => {
      logs.push(`Etape ${stage.index} - ${stage.stageLabel} : ${stage.optionLabel}. ${stage.detail}`)
    })
    logs.push('Le builder retourne un produit complet sans exposer le constructeur detaille au client.')
  } else {
    logs.push(`Mode sans Builder : le client instancie directement ${product.monolithicClassName} avec tous les parametres.`)
    logs.push(`Parametres passes d un bloc : ${silhouette.code}, ${coreModule.code}, ${addonModule.code}, ${finishStyle.code}.`)
    logs.push('Le produit final apparait sans director ni etapes explicites dans le code appelant.')
  }

  const challengeMet = runningStats.utility >= 9 && runningStats.style >= 7
  const readyLabel = challengeMet ? 'Blueprint valide' : 'Blueprint a optimiser'
  const totalScore = runningStats.agility + runningStats.resilience + runningStats.utility + runningStats.style

  logs.push(`Produit final : ${buildName} / ${product.label} -> AGI ${runningStats.agility} / RES ${runningStats.resilience} / UTI ${runningStats.utility} / STYLE ${runningStats.style}.`)
  logs.push(
    challengeMet
      ? 'Le build atteint le seuil attendu. La construction est exploitable telle quelle.'
      : 'Le build reste coherent, mais sa combinaison peut encore etre renforcee.',
  )

  return {
    patternCode: 'builder',
    summary: useBuilder
      ? 'Builder rend la construction progressive et lisible. Le director orchestre les appels, le builder assemble le produit sans exposer un constructeur geant.'
      : "Sans Builder, le client pousse tous les parametres d un bloc. Le produit final apparait, mais le processus de construction est cache et plus rigide.",
    logs,
    output: {
      mode: useBuilder ? 'WITH_BUILDER' : 'WITHOUT_BUILDER',
      modeLabel: useBuilder ? 'Avec Builder' : 'Sans Builder',
      buildName,
      productType: product.code,
      productLabel: product.label,
      productDescription: product.description,
      silhouetteCode: silhouette.code,
      silhouetteLabel: silhouette.labels[product.code],
      coreModuleCode: coreModule.code,
      coreModuleLabel: coreModule.labels[product.code],
      addonModuleCode: addonModule.code,
      addonModuleLabel: addonModule.labels[product.code],
      finishStyleCode: finishStyle.code,
      finishStyleLabel: finishStyle.labels[product.code],
      agility: runningStats.agility,
      resilience: runningStats.resilience,
      utility: runningStats.utility,
      style: runningStats.style,
      totalScore,
      stageCount: stages.length,
      challengeGoal: 'utility >= 9 et style >= 7',
      challengeMet,
      readyLabel,
      monolithicPainPoints: [
        'Constructeur geant peu lisible',
        'Ordre implicite des parametres',
        'Validation plus difficile a faire evoluer',
      ],
      stages,
    },
    visualization: buildBuilderVisualization(product, stages, readyLabel, useBuilder, buildName, runningStats),
  }
}
