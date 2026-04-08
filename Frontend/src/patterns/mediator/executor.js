import {
  createMediatorVisualization,
  normalizeMediatorParticipants,
} from '../shared/executorShared'

export default function executeMediatorPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_MEDIATOR'}`.trim().toUpperCase()
  const useMediator = mode !== 'WITHOUT_MEDIATOR'
  const roomName = `${parameters.roomName ?? ''}`.trim() || 'Arena Chat'
  const senderName = `${parameters.senderName ?? ''}`.trim() || 'Luna'
  const participants = normalizeMediatorParticipants(parameters.participants, senderName)
  const message = `${parameters.message ?? ''}`.trim() || 'Focus target center lane'

  if (participants.length < 3) {
    throw new Error('Au moins trois participants sont requis pour la demo Mediator.')
  }

  const recipients = participants.filter((participant) => participant !== senderName)
  const deliveries = recipients.map((recipient, index) => ({
    index: index + 1,
    from: senderName,
    to: recipient,
    via: useMediator ? roomName : 'direct link',
    transport: useMediator ? 'MEDIATED' : 'DIRECT',
    detail: `${recipient} recoit "${message}" depuis ${senderName} via ${useMediator ? roomName : 'direct link'}.`,
  }))
  const logs = useMediator
    ? [
        `Creation du ChatRoomMediator ${roomName}.`,
        `Enregistrement des participants dans le mediator : ${participants.join(', ')}.`,
        `${senderName} envoie son message au hub central.`,
        ...deliveries.map((delivery) => `${roomName} transmet le message a ${delivery.to}.`),
      ]
    : [
        `Mode sans Mediator : ${senderName} connait directement tous les autres joueurs.`,
        ...deliveries.map((delivery) => `${senderName} envoie directement un message a ${delivery.to}.`),
      ]

  return {
    patternCode: 'mediator',
    summary: useMediator
      ? 'Mediator centralise les conversations dans un hub unique. Les participants ne dependent plus directement les uns des autres.'
      : 'Sans Mediator, l expediteur connait chaque destinataire et multiplie les liens directs entre objets du chat.',
    logs,
    output: {
      mode,
      modeLabel: useMediator ? 'Avec Mediator' : 'Sans Mediator',
      roomName,
      participants,
      participantCount: participants.length,
      senderName,
      recipients,
      recipientCount: recipients.length,
      message,
      deliveredCount: deliveries.length,
      senderCouplingCount: useMediator ? 1 : recipients.length,
      directLinkCount: useMediator ? 0 : recipients.length,
      deliveryModeLabel: useMediator ? 'Transit via mediator' : 'Messages directs',
      deliveries,
    },
    visualization: createMediatorVisualization(useMediator, roomName, senderName, recipients, message),
  }
}
