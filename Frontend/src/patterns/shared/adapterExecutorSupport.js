export const adapterScenarios = {
  VGA_TO_HDMI: {
    code: 'VGA_TO_HDMI',
    label: 'Legacy console -> Smart screen',
    sourceSystem: 'LegacyConsole',
    sourceInterface: 'VGA output',
    sourceProtocol: 'Analog video',
    sourceSignalTemplate: '%s :: 640x480 analog frame',
    adapterClassName: 'VgaToHdmiAdapter',
    adapterRole: 'Convertit un flux VGA analogique vers une sortie HDMI comprise par l ecran moderne.',
    targetSystem: 'SmartScreen',
    targetInterface: 'HDMI input',
    targetProtocol: 'HDMI digital',
    adaptedSignalTemplate: '%s :: HDMI 1080p bridge',
    failureReason: 'Le SmartScreen attend une entree HDMI numerique. Un branchement direct VGA echoue.',
    successDetail: 'L adaptateur encapsule le signal analogique et expose une sortie HDMI exploitable.',
  },
  SERIAL_TO_REST: {
    code: 'SERIAL_TO_REST',
    label: 'Factory sensor -> Cloud dashboard',
    sourceSystem: 'FactorySensor',
    sourceInterface: 'RS-232 port',
    sourceProtocol: 'Serial frames',
    sourceSignalTemplate: 'FRAME[%s]|crc=42',
    adapterClassName: 'SerialToRestAdapter',
    adapterRole: 'Traduit des trames serie vers un appel REST JSON attendu par le dashboard cloud.',
    targetSystem: 'CloudDashboard',
    targetInterface: 'HTTPS endpoint',
    targetProtocol: 'REST JSON',
    adaptedSignalTemplate: '{"event":"%s","transport":"https"}',
    failureReason: 'Le dashboard cloud attend une requete REST JSON. Une trame serie brute ne peut pas etre consommee telle quelle.',
    successDetail: 'L adaptateur mappe la trame serie et publie un payload JSON sur l endpoint HTTP cible.',
  },
  XML_TO_JSON: {
    code: 'XML_TO_JSON',
    label: 'Legacy CRM -> Mobile API',
    sourceSystem: 'LegacyCRM',
    sourceInterface: 'SOAP XML feed',
    sourceProtocol: 'XML envelope',
    sourceSignalTemplate: '<event><label>%s</label></event>',
    adapterClassName: 'XmlToJsonAdapter',
    adapterRole: 'Traduit un message XML historique vers un DTO JSON accepte par une API mobile moderne.',
    targetSystem: 'MobileApi',
    targetInterface: 'JSON endpoint',
    targetProtocol: 'REST JSON',
    adaptedSignalTemplate: '{"label":"%s","source":"legacy-crm"}',
    failureReason: 'L API mobile ne parle pas SOAP XML. Le contrat cible impose un payload JSON simple.',
    successDetail: 'L adaptateur consomme le XML historique et renvoie un DTO JSON compatible avec l API.',
  },
}

export function formatAdapterSignal(template, payloadLabel) {
  return template.replace('%s', payloadLabel)
}

export function createAdapterStep(index, stageCode, title, systemLabel, protocolLabel, signalLabel, detail, success) {
  return {
    index,
    stageCode,
    title,
    systemLabel,
    protocolLabel,
    signalLabel,
    detail,
    success,
  }
}

export function buildAdapterVisualization(scenario, sourceSignal, adaptedSignal, compatible) {
  return {
    nodes: [
      {
        id: 'source',
        label: scenario.sourceSystem,
        type: 'client',
        data: { detail: scenario.sourceProtocol },
      },
      {
        id: 'source-port',
        label: scenario.sourceInterface,
        type: 'component',
        data: { detail: sourceSignal },
      },
      {
        id: 'adapter',
        label: compatible ? scenario.adapterClassName : 'NoAdapter',
        type: 'decorator',
        data: { detail: compatible ? 'conversion bridge' : 'missing translation' },
      },
      {
        id: 'target-port',
        label: scenario.targetInterface,
        type: 'strategy',
        data: { detail: scenario.targetProtocol },
      },
      {
        id: 'target',
        label: scenario.targetSystem,
        type: 'observer',
        data: { detail: compatible ? adaptedSignal : 'incompatible input' },
      },
      {
        id: 'result',
        label: compatible ? 'Compatible' : 'Rejected',
        type: 'output',
        data: { message: compatible ? scenario.successDetail : scenario.failureReason },
      },
    ],
    edges: compatible
      ? [
          { from: 'source', to: 'source-port', label: 'emit' },
          { from: 'source-port', to: 'adapter', label: 'adapt' },
          { from: 'adapter', to: 'target-port', label: 'convert' },
          { from: 'target-port', to: 'target', label: 'deliver' },
          { from: 'target', to: 'result', label: 'ready' },
        ]
      : [
          { from: 'source', to: 'source-port', label: 'emit' },
          { from: 'source-port', to: 'target-port', label: 'mismatch' },
          { from: 'target-port', to: 'target', label: 'reject' },
          { from: 'target', to: 'result', label: 'stop' },
        ],
  }
}
