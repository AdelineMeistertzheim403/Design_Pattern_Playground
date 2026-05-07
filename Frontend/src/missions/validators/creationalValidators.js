import { toList, validateMode } from './helpers'

function validateBuilder(config = {}) {
  const requiredFields = ['productType', 'silhouette', 'coreModule', 'addonModule', 'finishStyle']

  if (!validateMode(config, 'WITH_BUILDER')) {
    return { ok: false, summary: 'La construction etape par etape n est pas activee.' }
  }

  if (requiredFields.some((fieldName) => !`${config[fieldName] ?? ''}`.trim())) {
    return { ok: false, summary: 'Le plan de construction est incomplet.' }
  }

  return { ok: true, summary: 'La construction suit bien un processus stable et complet.' }
}

function validateFactory(config = {}) {
  if (!validateMode(config, 'WITH_FACTORY')) {
    return { ok: false, summary: 'La creation n est pas centralisee dans une factory.' }
  }

  if (!`${config.vehicleType ?? ''}`.trim()) {
    return { ok: false, summary: 'Aucun produit concret n est selectionne.' }
  }

  return { ok: true, summary: 'La creation passe bien par une fabrique dediee.' }
}

function validateSingleton(config = {}) {
  const clients = toList(config.clients)

  if (!validateMode(config, 'WITH_SINGLETON')) {
    return { ok: false, summary: 'La meme instance partagee n est pas activee.' }
  }

  if (clients.length < 2) {
    return { ok: false, summary: 'Plusieurs clients sont necessaires pour verifier le partage de reference.' }
  }

  return { ok: true, summary: 'Une instance centrale est visible par plusieurs clients.' }
}

export const creationalValidators = {
  builder: validateBuilder,
  factory: validateFactory,
  singleton: validateSingleton,
}
