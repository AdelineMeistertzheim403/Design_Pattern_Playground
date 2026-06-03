import { toList, validateMode } from './helpers'

function validateBuilder(config = {}) {
  const requiredFields = ['productType', 'silhouette', 'coreModule', 'addonModule', 'finishStyle']

  if (!validateMode(config, 'WITH_BUILDER')) {
    return { ok: false, summary: 'La construction étape par étape n’est pas activée.' }
  }

  if (requiredFields.some((fieldName) => !`${config[fieldName] ?? ''}`.trim())) {
    return { ok: false, summary: 'Le plan de construction est incomplet.' }
  }

  return { ok: true, summary: 'La construction suit bien un processus stable et complet.' }
}

function validateFactory(config = {}) {
  if (!validateMode(config, 'WITH_FACTORY')) {
    return { ok: false, summary: 'La création n’est pas centralisée dans une factory.' }
  }

  if (!`${config.vehicleType ?? ''}`.trim()) {
    return { ok: false, summary: 'Aucun produit concret n’est sélectionné.' }
  }

  return { ok: true, summary: 'La création passe bien par une fabrique dédiée.' }
}

function validateSingleton(config = {}) {
  const clients = toList(config.clients)

  if (!validateMode(config, 'WITH_SINGLETON')) {
    return { ok: false, summary: 'La même instance partagée n’est pas activée.' }
  }

  if (clients.length < 2) {
    return { ok: false, summary: 'Plusieurs clients sont nécessaires pour vérifier le partage de référence.' }
  }

  return { ok: true, summary: 'Une instance centrale est visible par plusieurs clients.' }
}

export const creationalValidators = {
  builder: validateBuilder,
  factory: validateFactory,
  singleton: validateSingleton,
}
