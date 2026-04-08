import {
  buildFlyweightVisualization,
  distributeObjects,
  flyweightProfiles,
  normalizeInteger,
  roundToSingleDecimal,
} from '../shared/executorShared'

export default function executeFlyweightPattern(parameters) {
  const assetType = `${parameters.assetType ?? 'TREE'}`.toUpperCase()
  const profile = flyweightProfiles[assetType] ?? flyweightProfiles.TREE
  const objectCount = normalizeInteger(parameters.objectCount, 2400, 100, 10000)
  const sharedVariantCount = normalizeInteger(parameters.sharedVariantCount, 6, 1, 12)
  const variantCount = Math.min(sharedVariantCount, objectCount)
  const useFlyweight = parameters.useFlyweight === undefined
    ? true
    : Boolean(parameters.useFlyweight)
  const realInstances = useFlyweight ? variantCount : objectCount
  const baselineMemoryKb = objectCount * (profile.intrinsicStateKb + profile.extrinsicStateKb)
  const currentMemoryKb = useFlyweight
    ? variantCount * profile.intrinsicStateKb + objectCount * profile.extrinsicStateKb
    : baselineMemoryKb
  const savedMemoryKb = Math.max(0, baselineMemoryKb - currentMemoryKb)
  const savingsPercent = baselineMemoryKb === 0
    ? 0
    : roundToSingleDecimal((savedMemoryKb * 100) / baselineMemoryKb)
  const simulatedFrameCostMs = roundToSingleDecimal(
    (useFlyweight ? 8.5 : 11)
    + objectCount * (useFlyweight ? 0.0019 : 0.0046)
    + realInstances * (useFlyweight ? 0.11 : 0.002),
  )
  const performanceLabel = simulatedFrameCostMs >= 38
    ? (useFlyweight ? 'Charge tres haute mais encore contenue' : 'Lag probable')
    : simulatedFrameCostMs >= 24
      ? (useFlyweight ? 'Charge visible mais stable' : 'Charge sensible')
      : (useFlyweight ? 'Stable malgre la foule' : 'Acceptable a petite echelle')
  const variants = Array.from({ length: variantCount }, (_, index) => ({
    code: `${profile.code}-${index + 1}`,
    label: `${profile.label} ${index + 1}`,
    objects: distributeObjects(objectCount, variantCount, index),
    shared: useFlyweight,
  }))

  return {
    patternCode: 'flyweight',
    summary: useFlyweight
      ? "Flyweight mutualise les donnees lourdes pour alimenter une foule d objets legerement differencies."
      : "Sans Flyweight, chaque objet garde son etat complet et la pression memoire grimpe lineairement.",
    logs: [
      `Chargement du profil ${profile.label}.`,
      `Simulation de ${objectCount} objet(s) avec ${variantCount} variante(s) visuelles.`,
      useFlyweight
        ? `Activation du cache Flyweight : ${variantCount} instance(s) partagee(s) seulement.`
        : 'Mode sans Flyweight : chaque objet embarque son etat complet.',
      useFlyweight
        ? 'Chaque objet garde uniquement son etat extrinseque : position, echelle et variation.'
        : `Le moteur recree donc ${realInstances} instance(s) concretes en memoire.`,
      `Memoire theorique sans partage : ${baselineMemoryKb} KB.`,
      `Memoire theorique dans le mode courant : ${currentMemoryKb} KB.`,
      useFlyweight
        ? `Gain estime : ${savedMemoryKb} KB economises (${savingsPercent}%).`
        : 'Aucun gain : le pattern n est pas active.',
    ],
    output: {
      mode: useFlyweight ? 'WITH_FLYWEIGHT' : 'WITHOUT_FLYWEIGHT',
      modeLabel: useFlyweight ? 'Avec Flyweight' : 'Sans Flyweight',
      assetType: profile.code,
      assetLabel: profile.label,
      objectCount,
      sharedVariantCount: variantCount,
      realInstances,
      intrinsicStateKb: profile.intrinsicStateKb,
      extrinsicStateKb: profile.extrinsicStateKb,
      memoryCurrentKb: currentMemoryKb,
      memoryWithoutFlyweightKb: baselineMemoryKb,
      savedMemoryKb,
      savingsPercent,
      simulatedFrameCostMs,
      performanceLabel,
      variants,
    },
    visualization: buildFlyweightVisualization({
      assetLabel: profile.label,
      baselineMemoryKb,
      currentMemoryKb,
      objectCount,
      performanceLabel,
      realInstances,
      useFlyweight,
      variantCount,
    }),
  }
}
