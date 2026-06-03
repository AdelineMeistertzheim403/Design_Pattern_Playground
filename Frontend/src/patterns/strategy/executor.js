export default function executeStrategyPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_STRATEGY'}`.toUpperCase()
  const useStrategy = mode !== 'WITHOUT_STRATEGY'
  const selectedStrategy = `${parameters.strategy ?? 'CARD'}`.toUpperCase()
  const amount = Number(parameters.amount ?? 100)

  const strategyLabels = {
    CARD: 'Carte',
    PAYPAL: 'Paypal',
    CRYPTO: 'Crypto',
  }

  const label = strategyLabels[selectedStrategy] ?? strategyLabels.CARD
  const message = `Paiement de ${amount} EUR traite avec ${label}.`

  return {
    patternCode: 'strategy',
    summary: useStrategy
      ? "Strategy laisse le contexte deleguer l execution a l algorithme choisi."
      : "Sans Strategy, le service garde un bloc if/else pour chaque variante d algorithme.",
    logs: useStrategy
      ? [
          'Création du contexte de paiement.',
          `Selection de la strategie : ${label}.`,
          'Execution du workflow de paiement avec un algorithme interchangeable.',
          `Resultat : ${message}`,
        ]
      : [
          'Mode sans Strategy : PaymentService garde un bloc if/else.',
          `Evaluation de la branche ${label}.`,
          'Le service choisit l algorithme en fonction de la valeur recue.',
          `Resultat : ${message}`,
        ],
    output: {
      mode: useStrategy ? 'WITH_STRATEGY' : 'WITHOUT_STRATEGY',
      modeLabel: useStrategy ? 'Avec Strategy' : 'Sans Strategy',
      amount,
      selectedStrategy,
      selectedLabel: label,
      message,
    },
    visualization: {
      nodes: [
        {
          id: 'context',
          label: useStrategy ? 'PaymentContext' : 'PaymentService',
          type: 'context',
          data: { active: true },
        },
        {
          id: 'card',
          label: useStrategy ? 'Carte' : 'if CARD',
          type: 'strategy',
          data: { selected: selectedStrategy === 'CARD', detail: useStrategy ? '' : 'branche conditionnelle' },
        },
        {
          id: 'paypal',
          label: useStrategy ? 'Paypal' : 'if PAYPAL',
          type: 'strategy',
          data: { selected: selectedStrategy === 'PAYPAL', detail: useStrategy ? '' : 'branche conditionnelle' },
        },
        {
          id: 'crypto',
          label: useStrategy ? 'Crypto' : 'if CRYPTO',
          type: 'strategy',
          data: { selected: selectedStrategy === 'CRYPTO', detail: useStrategy ? '' : 'branche conditionnelle' },
        },
        { id: 'result', label: 'Resultat', type: 'output', data: { message } },
      ],
      edges: [
        { from: 'context', to: 'card', label: useStrategy ? 'disponible' : 'if/else' },
        { from: 'context', to: 'paypal', label: useStrategy ? 'disponible' : 'if/else' },
        { from: 'context', to: 'crypto', label: useStrategy ? 'disponible' : 'if/else' },
        { from: selectedStrategy.toLowerCase(), to: 'result', label: useStrategy ? 'execute' : 'branch' },
      ],
    },
  }
}
