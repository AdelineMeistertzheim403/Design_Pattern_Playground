import { normalizeUniqueList } from '../shared/executorShared'

export default function executeSingletonPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_SINGLETON'}`.toUpperCase()
  const useSingleton = mode !== 'WITHOUT_SINGLETON'
  const settingKey = `${parameters.settingKey ?? ''}`.trim() || 'theme'
  const settingValue = `${parameters.settingValue ?? ''}`.trim() || 'emerald'
  const clients = normalizeUniqueList(parameters.clients)

  if (clients.length === 0) {
    throw new Error('Au moins un client est obligatoire.')
  }

  const writerClient = clients[0]
  const clientViews = useSingleton
    ? clients.map((client) => ({
        client,
        instanceId: 'instance-1',
        visibleValue: settingValue,
        shared: true,
      }))
    : clients.map((client, index) => ({
        client,
        instanceId: `instance-${index + 1}`,
        visibleValue: client === writerClient ? settingValue : 'non defini',
        shared: false,
      }))
  const uniqueInstanceIds = [...new Set(clientViews.map((view) => view.instanceId))]
  const coherenceLabel = useSingleton
    ? 'Tous les clients observent la meme configuration.'
    : 'Chaque client voit un etat local different.'

  return {
    patternCode: 'singleton',
    summary: useSingleton
      ? "Singleton distribue une seule instance partagee, ce qui aligne tous les clients sur le meme etat global."
      : "Sans Singleton, chaque client cree sa propre instance et les modifications se propagent mal.",
    logs: useSingleton
      ? [
          'Activation du mode Singleton.',
          ...clients.flatMap((client) => (
            client === writerClient
              ? [
                  `${client} demande l instance globale.`,
                  `${client} modifie ${settingKey} = ${settingValue}.`,
                  `${client} recupere l instance instance-1 et lit ${settingKey} = ${settingValue}.`,
                ]
              : [
                  `${client} demande l instance globale.`,
                  `${client} recupere l instance instance-1 et lit ${settingKey} = ${settingValue}.`,
                ]
          )),
        ]
      : [
          'Mode sans Singleton : chaque client cree sa propre instance.',
          ...clients.flatMap((client, index) => (
            client === writerClient
              ? [
                  `${client} cree instance-${index + 1}.`,
                  `${client} modifie ${settingKey} = ${settingValue} sur sa copie locale.`,
                  `${client} lit ${settingKey} = ${settingValue} sur instance-${index + 1}.`,
                ]
              : [
                  `${client} cree instance-${index + 1}.`,
                  `${client} lit ${settingKey} = non defini sur instance-${index + 1}.`,
                ]
          )),
        ],
    output: {
      mode: useSingleton ? 'WITH_SINGLETON' : 'WITHOUT_SINGLETON',
      modeLabel: useSingleton ? 'Avec Singleton' : 'Sans Singleton',
      writerClient,
      settingKey,
      settingValue,
      clientCount: clients.length,
      instanceCount: uniqueInstanceIds.length,
      coherent: useSingleton,
      coherenceLabel,
      uniqueInstanceIds,
      clientViews,
    },
    visualization: {
      nodes: [
        { id: 'summary', label: 'Etat global', type: 'output', data: { message: coherenceLabel } },
        ...clientViews.map((view, index) => ({
          id: `client-${index}`,
          label: view.client,
          type: 'client',
          data: { selected: index === 0 },
        })),
        ...uniqueInstanceIds.map((instanceId) => {
          const view = clientViews.find((item) => item.instanceId === instanceId)
          return {
            id: `instance-${instanceId}`,
            label: useSingleton ? 'GlobalSettingsManager' : instanceId,
            type: useSingleton ? 'singleton' : 'instance',
            data: { detail: `${settingKey} = ${view?.visibleValue ?? 'non defini'}` },
          }
        }),
      ],
      edges: [
        ...clientViews.map((view, index) => ({
          from: `client-${index}`,
          to: `instance-${view.instanceId}`,
          label: 'getInstance',
        })),
        ...uniqueInstanceIds.map((instanceId) => ({
          from: `instance-${instanceId}`,
          to: 'summary',
          label: 'state',
        })),
      ],
    },
  }
}
