import { toList, validateMode } from './helpers'

function validateChain(config = {}) {
  if (!validateMode(config, 'WITH_CHAIN')) {
    return { ok: false, summary: 'Le pipeline structuré par handlers n’est pas actif.' }
  }

  if (`${config.tokenState ?? ''}` !== 'VALID' || `${config.payloadState ?? ''}` !== 'VALID') {
    return { ok: false, summary: 'La requête ne traverse pas correctement tout le pipeline de validation.' }
  }

  return { ok: true, summary: 'La requête parcourt bien les maillons spécialisés jusqu’au traitement final.' }
}

function validateCommand(config = {}) {
  const actions = toList(config.actions)

  if (!validateMode(config, 'WITH_COMMAND')) {
    return { ok: false, summary: 'Les actions ne sont pas encapsulées comme commandes.' }
  }

  if (actions.length < 4) {
    return { ok: false, summary: 'La séquence est trop courte pour montrer un historique utile.' }
  }

  if (!actions.includes('UNDO') && !actions.includes('REDO')) {
    return { ok: false, summary: 'La séquence doit montrer un undo ou redo pour valider le système.' }
  }

  return { ok: true, summary: 'Les actions sont historisables et le retour arrière est exploitable.' }
}

function validateInterpreter(config = {}) {
  const scriptLines = toList(config.scriptLines)

  if (!validateMode(config, 'WITH_INTERPRETER')) {
    return { ok: false, summary: 'Le mini-langage n’est pas interprété comme une vraie structure.' }
  }

  if (scriptLines.length < 3) {
    return { ok: false, summary: 'Le script est trop court pour montrer un vrai moteur d’interprétation.' }
  }

  return { ok: true, summary: 'Le script fournit une base crédible pour une exécution interprétée.' }
}

function validateMediator(config = {}) {
  const participants = toList(config.participants)
  const senderName = `${config.senderName ?? ''}`.trim()

  if (!validateMode(config, 'WITH_MEDIATOR')) {
    return { ok: false, summary: 'La coordination centrale n’est pas activée.' }
  }

  if (participants.length < 3) {
    return { ok: false, summary: 'Le réseau est trop petit pour justifier la médiation.' }
  }

  if (!participants.includes(senderName)) {
    return { ok: false, summary: "L’expéditeur n’appartient pas au groupe coordonné." }
  }

  return { ok: true, summary: 'Les interactions passent bien par un hub central.' }
}

function validateMemento(config = {}) {
  if (!validateMode(config, 'WITH_MEMENTO')) {
    return { ok: false, summary: 'La restauration par snapshot n’est pas activée.' }
  }

  if (!`${config.restoreTarget ?? ''}`.trim()) {
    return { ok: false, summary: 'Aucun checkpoint n’est sélectionné pour la restauration.' }
  }

  return { ok: true, summary: 'Un checkpoint stable peut être restauré proprement.' }
}

function validateObserver(config = {}) {
  const observers = toList(config.observers)

  if (!validateMode(config, 'WITH_OBSERVER')) {
    return { ok: false, summary: 'La diffusion vers des abonnés n’est pas activée.' }
  }

  if (observers.length < 3) {
    return { ok: false, summary: 'Le réseau d’abonnés est trop faible pour valider la diffusion.' }
  }

  return { ok: true, summary: 'L’événement se diffuse correctement vers plusieurs abonnés.' }
}

function validateState(config = {}) {
  const actions = toList(config.actions)

  if (!validateMode(config, 'WITH_STATE')) {
    return { ok: false, summary: 'Le contexte ne s’appuie pas sur une machine à états explicite.' }
  }

  if (actions.length < 3) {
    return { ok: false, summary: 'La séquence d’actions est trop courte pour montrer de vraies transitions.' }
  }

  return { ok: true, summary: 'Les transitions sont suffisamment explicites pour structurer le cycle de vie.' }
}

function validateStrategy(config = {}) {
  if (!validateMode(config, 'WITH_STRATEGY')) {
    return { ok: false, summary: 'Le comportement variable n’est pas actif.' }
  }

  if (!`${config.strategy ?? ''}`.trim()) {
    return { ok: false, summary: 'Aucune stratégie concrète n’est choisie.' }
  }

  return { ok: true, summary: 'L’algorithme choisi peut varier sans casser le contexte.' }
}

function validateVisitor(config = {}) {
  if (!validateMode(config, 'WITH_VISITOR')) {
    return { ok: false, summary: 'Le traitement spécialisé n’est pas actif sur la structure.' }
  }

  if (!`${config.visitorType ?? ''}`.trim()) {
    return { ok: false, summary: 'Aucun visitor concret n’est sélectionné.' }
  }

  return { ok: true, summary: 'La structure accueille correctement un traitement spécialisé externe.' }
}

export const behavioralValidators = {
  chain: validateChain,
  command: validateCommand,
  interpreter: validateInterpreter,
  mediator: validateMediator,
  memento: validateMemento,
  observer: validateObserver,
  state: validateState,
  strategy: validateStrategy,
  visitor: validateVisitor,
}
