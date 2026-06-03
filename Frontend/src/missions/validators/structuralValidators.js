import { validateMode } from './helpers'

function validateBridge(config = {}) {
  if (!validateMode(config, 'WITH_BRIDGE')) {
    return { ok: false, summary: 'La séparation abstraction / implémentation n’est pas activée.' }
  }

  if (!`${config.shapeCode ?? ''}`.trim() || !`${config.renderCode ?? ''}`.trim()) {
    return { ok: false, summary: 'Les deux axes de variation ne sont pas suffisamment configurés.' }
  }

  return { ok: true, summary: 'Les deux axes de variation restent bien découplés.' }
}

function validateComposite(config = {}) {
  if (!validateMode(config, 'WITH_COMPOSITE')) {
    return { ok: false, summary: 'La structure uniforme en arbre n’est pas activée.' }
  }

  if (Number(config.extraLeafCount ?? 0) < 1) {
    return { ok: false, summary: 'La structure est trop pauvre pour valider un vrai parcours arborescent.' }
  }

  return { ok: true, summary: 'La structure récursive peut être traitée uniformément.' }
}

function validateDecorator(config = {}) {
  const decorators = Array.isArray(config.decorators)
    ? config.decorators
    : `${config.decorators ?? ''}`.split(/\n|,/).map((entry) => entry.trim()).filter(Boolean)

  if (!validateMode(config, 'WITH_DECORATOR')) {
    return { ok: false, summary: 'L’empilement d’effets n’est pas actif.' }
  }

  if (decorators.length < 2) {
    return { ok: false, summary: 'Il faut plusieurs couches pour valider un vrai cumul d’effets.' }
  }

  return { ok: true, summary: 'Les bonus se cumulent proprement autour du composant de base.' }
}

function validateFacade(config = {}) {
  if (!validateMode(config, 'WITH_FACADE')) {
    return { ok: false, summary: 'La routine globale ne passe pas par une entrée simplifiée.' }
  }

  if (!`${config.routineCode ?? ''}`.trim()) {
    return { ok: false, summary: 'Aucune routine complète n’est configurée.' }
  }

  return { ok: true, summary: 'La chorégraphie multi-systèmes est bien simplifiée par une façade.' }
}

function validateFlyweight(config = {}) {
  const objectCount = Number(config.objectCount ?? 0)
  const sharedVariantCount = Number(config.sharedVariantCount ?? 0)

  if (!config.useFlyweight) {
    return { ok: false, summary: 'Le partage d’état n’est pas actif.' }
  }

  if (objectCount < 2000) {
    return { ok: false, summary: 'La charge est trop faible pour rendre l’optimisation convaincante.' }
  }

  if (sharedVariantCount > 12) {
    return { ok: false, summary: 'Trop de variantes limitent le partage réel.' }
  }

  return { ok: true, summary: 'La configuration partage bien les assets communs sous forte charge.' }
}

function validateProxy(config = {}) {
  if (!validateMode(config, 'WITH_PROXY')) {
    return { ok: false, summary: 'Le gardien devant la ressource n’est pas actif.' }
  }

  if (!['ADMIN', 'MEMBER'].includes(`${config.requesterRole ?? ''}`)) {
    return { ok: false, summary: 'Le rôle choisi ne permet pas de valider un accès protégé réussi.' }
  }

  return { ok: true, summary: 'L’accès est protégé et le chemin autorisé reste cohérent.' }
}

export const structuralValidators = {
  bridge: validateBridge,
  composite: validateComposite,
  decorator: validateDecorator,
  facade: validateFacade,
  flyweight: validateFlyweight,
  proxy: validateProxy,
}
