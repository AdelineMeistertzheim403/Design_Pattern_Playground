export default function executeFactoryPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_FACTORY'}`.toUpperCase()
  const useFactory = mode !== 'WITHOUT_FACTORY'
  const vehicleType = `${parameters.vehicleType ?? 'CAR'}`.toUpperCase()
  const vehicle = vehicleType === 'BIKE'
    ? {
        type: 'BIKE',
        label: 'Moto',
        description: "Vehicule agile cree pour des scenarios de livraison ou de mobilite rapide.",
      }
    : {
        type: 'CAR',
        label: 'Voiture',
        description: "Vehicule routier cree pour des scenarios urbains ou longue distance.",
      }

  return {
    patternCode: 'factory',
    summary: useFactory
      ? "Factory Method centralise la creation du produit derriere une interface stable."
      : "Sans Factory, le client instancie directement le produit concret et reste couple a son constructeur.",
    logs: useFactory
      ? [
          'Creation du point d entree factory.',
          `Demande de creation pour le type ${vehicle.type}.`,
          `Instantiation du produit concret ${vehicle.label}.`,
          'Retour du produit sans exposer le constructeur au client.',
        ]
      : [
          'Mode sans Factory : le client connait le type concret.',
          `Le client choisit le constructeur pour ${vehicle.type}.`,
          `Le code appelant execute directement new ${vehicle.label}().`,
          'Le changement de type oblige a modifier le code client.',
        ],
    output: {
      mode: useFactory ? 'WITH_FACTORY' : 'WITHOUT_FACTORY',
      modeLabel: useFactory ? 'Avec Factory' : 'Sans Factory',
      vehicleType: vehicle.type,
      vehicleLabel: vehicle.label,
      description: vehicle.description,
      creationStyle: useFactory ? 'Factory centralisee' : 'Instantiation directe',
    },
    visualization: {
      nodes: [
        { id: 'client', label: 'Client', type: 'client', data: {} },
        {
          id: 'factory',
          label: useFactory ? 'VehicleFactory' : `new ${vehicle.label}()`,
          type: useFactory ? 'factory' : 'cluster',
          data: { detail: useFactory ? 'creation centralisee' : 'constructeur concret expose' },
        },
        { id: 'product', label: vehicle.label, type: 'product', data: { type: vehicle.type } },
      ],
      edges: [
        { from: 'client', to: 'factory', label: useFactory ? 'request' : 'new' },
        { from: 'factory', to: 'product', label: useFactory ? 'create' : 'return' },
      ],
    },
  }
}
