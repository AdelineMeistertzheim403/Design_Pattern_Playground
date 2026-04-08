import {
  adapterScenarios,
  buildAdapterVisualization,
  createAdapterStep,
  formatAdapterSignal,
} from '../shared/executorShared'

export default function executeAdapterPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_ADAPTER'}`.trim().toUpperCase()
  const useAdapter = mode !== 'WITHOUT_ADAPTER'
  const scenario = adapterScenarios[`${parameters.scenario ?? 'VGA_TO_HDMI'}`.trim().toUpperCase()] ?? adapterScenarios.VGA_TO_HDMI
  const payloadLabel = `${parameters.payloadLabel ?? ''}`.trim() || 'Telemetry burst 42'
  const sourceSignal = formatAdapterSignal(scenario.sourceSignalTemplate, payloadLabel)
  const adaptedSignal = formatAdapterSignal(scenario.adaptedSignalTemplate, payloadLabel)
  const steps = [
    createAdapterStep(
      1,
      'SOURCE_EMIT',
      'Emission source',
      scenario.sourceSystem,
      scenario.sourceProtocol,
      sourceSignal,
      `${scenario.sourceSystem} emet le signal via ${scenario.sourceInterface}.`,
      true,
    ),
    ...(useAdapter
      ? [
          createAdapterStep(
            2,
            'ADAPT',
            'Conversion',
            scenario.adapterClassName,
            'Target -> Adaptee bridge',
            adaptedSignal,
            scenario.adapterRole,
            true,
          ),
          createAdapterStep(
            3,
            'TARGET_CONSUME',
            'Reception cible',
            scenario.targetSystem,
            scenario.targetProtocol,
            adaptedSignal,
            scenario.successDetail,
            true,
          ),
        ]
      : [
          createAdapterStep(
            2,
            'TARGET_REJECT',
            'Echec de compatibilite',
            scenario.targetSystem,
            scenario.targetProtocol,
            sourceSignal,
            scenario.failureReason,
            false,
          ),
        ]),
  ]
  const logs = [
    `La source ${scenario.sourceSystem} emet ${sourceSignal} sur ${scenario.sourceInterface}.`,
    ...(useAdapter
      ? [
          `L adapter ${scenario.adapterClassName} convertit le signal vers ${scenario.targetProtocol}.`,
          `${scenario.targetSystem} consomme ensuite ${adaptedSignal} sur ${scenario.targetInterface}.`,
        ]
      : [
          `Sans adapter, la cible ${scenario.targetSystem} refuse le signal brut.`,
        ]),
  ]
  const compatible = useAdapter

  return {
    patternCode: 'adapter',
    summary: compatible
      ? 'Adapter traduit l interface legacy vers le contrat attendu par la cible sans toucher ni au client ni a l adaptee.'
      : 'Sans Adapter, la source et la cible restent incompatibles. Le client tente de brancher deux contrats qui ne se comprennent pas.',
    logs,
    output: {
      mode,
      modeLabel: compatible ? 'Avec Adapter' : 'Sans Adapter',
      scenario: scenario.code,
      scenarioLabel: scenario.label,
      payloadLabel,
      sourceSystem: scenario.sourceSystem,
      sourceInterface: scenario.sourceInterface,
      sourceProtocol: scenario.sourceProtocol,
      sourceSignal,
      adapterClassName: scenario.adapterClassName,
      adapterRole: scenario.adapterRole,
      targetSystem: scenario.targetSystem,
      targetInterface: scenario.targetInterface,
      targetProtocol: scenario.targetProtocol,
      adaptedSignal,
      compatible,
      compatibilityLabel: compatible ? 'Compatibilite obtenue' : 'Connexion refusee',
      failureReason: scenario.failureReason,
      stepCount: steps.length,
      steps,
    },
    visualization: buildAdapterVisualization(scenario, sourceSignal, adaptedSignal, compatible),
  }
}
