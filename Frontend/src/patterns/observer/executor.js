import { normalizeUniqueList } from '../shared/executorCommon'

export default function executeObserverPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_OBSERVER'}`.toUpperCase()
  const useObserver = mode !== 'WITHOUT_OBSERVER'
  const subjectName = `${parameters.subjectName ?? ''}`.trim()
  const message = `${parameters.message ?? ''}`.trim()
  const observers = normalizeUniqueList(parameters.observers)

  if (!subjectName) {
    throw new Error('subjectName est obligatoire.')
  }

  if (!message) {
    throw new Error('message est obligatoire.')
  }

  if (observers.length === 0) {
    throw new Error('Au moins un observer est obligatoire.')
  }

  const deliveries = observers.map((observer) => ({
    observer,
    detail: `${observer} recoit la notification de ${subjectName} : ${message}`,
  }))

  return {
    patternCode: 'observer',
    summary: useObserver
      ? "Observer relie un sujet a plusieurs abonnes afin qu ils soient tous prevenus lorsqu un evenement survient."
      : "Sans Observer, l emetteur appelle directement chaque cible concrete et augmente son couplage.",
    logs: useObserver
      ? [
          `Creation du sujet : ${subjectName}.`,
          ...observers.map((observer) => `Abonnement de ${observer}.`),
          `Emission de l evenement : ${message}.`,
          `Le sujet notifie ${deliveries.length} observer(s).`,
          ...deliveries.map((delivery) => delivery.detail),
        ]
      : [
          `Mode sans Observer : ${subjectName} connait explicitement toutes les cibles.`,
          `Emission de l evenement : ${message}.`,
          `Boucle manuelle sur ${deliveries.length} dependance(s) concretes.`,
          ...deliveries.map((delivery) => delivery.detail),
        ],
    output: {
      mode: useObserver ? 'WITH_OBSERVER' : 'WITHOUT_OBSERVER',
      modeLabel: useObserver ? 'Avec Observer' : 'Sans Observer',
      subjectName,
      observerCount: deliveries.length,
      message,
      observers,
      deliveries,
    },
    visualization: {
      nodes: [
        { id: 'subject', label: subjectName, type: 'subject', data: { active: true } },
        {
          id: 'event',
          label: useObserver ? 'Evenement' : 'Manual loop',
          type: 'event',
          data: { message: useObserver ? message : 'couplage direct' },
        },
        ...deliveries.map((delivery, index) => ({
          id: `observer-${index}`,
          label: delivery.observer,
          type: 'observer',
          data: { selected: true, detail: delivery.detail },
        })),
      ],
      edges: [
        { from: 'subject', to: 'event', label: useObserver ? 'publish' : 'iterate' },
        ...deliveries.map((_, index) => ({
          from: 'event',
          to: `observer-${index}`,
          label: useObserver ? 'notify' : 'call',
        })),
      ],
    },
  }
}
