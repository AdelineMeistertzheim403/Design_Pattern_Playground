import { toList, validateMode } from './helpers'

function validateChain(config = {}) {
  if (!validateMode(config, 'WITH_CHAIN')) {
    return { ok: false, summary: 'Le pipeline structure par handlers n est pas active.' }
  }

  if (`${config.tokenState ?? ''}` !== 'VALID' || `${config.payloadState ?? ''}` !== 'VALID') {
    return { ok: false, summary: 'La requete ne traverse pas correctement tout le pipeline de validation.' }
  }

  return { ok: true, summary: 'La requete parcourt bien les maillons specialises jusqu au traitement final.' }
}

function validateCommand(config = {}) {
  const actions = toList(config.actions)

  if (!validateMode(config, 'WITH_COMMAND')) {
    return { ok: false, summary: 'Les actions ne sont pas encapsulees comme commandes.' }
  }

  if (actions.length < 4) {
    return { ok: false, summary: 'La sequence est trop courte pour montrer un historique utile.' }
  }

  if (!actions.includes('UNDO') && !actions.includes('REDO')) {
    return { ok: false, summary: 'La sequence doit montrer un undo ou redo pour valider le systeme.' }
  }

  return { ok: true, summary: 'Les actions sont historisables et le retour arriere est exploitable.' }
}

function validateInterpreter(config = {}) {
  const scriptLines = toList(config.scriptLines)

  if (!validateMode(config, 'WITH_INTERPRETER')) {
    return { ok: false, summary: 'Le mini langage n est pas interprete comme une vraie structure.' }
  }

  if (scriptLines.length < 3) {
    return { ok: false, summary: 'Le script est trop court pour montrer un vrai moteur d interpretation.' }
  }

  return { ok: true, summary: 'Le script fournit une base credible pour une execution interpretee.' }
}

function validateMediator(config = {}) {
  const participants = toList(config.participants)
  const senderName = `${config.senderName ?? ''}`.trim()

  if (!validateMode(config, 'WITH_MEDIATOR')) {
    return { ok: false, summary: 'La coordination centrale n est pas activee.' }
  }

  if (participants.length < 3) {
    return { ok: false, summary: 'Le reseau est trop petit pour justifier la mediation.' }
  }

  if (!participants.includes(senderName)) {
    return { ok: false, summary: "L expediteur n appartient pas au groupe coordonne." }
  }

  return { ok: true, summary: 'Les interactions passent bien par un hub central.' }
}

function validateMemento(config = {}) {
  if (!validateMode(config, 'WITH_MEMENTO')) {
    return { ok: false, summary: 'La restauration par snapshot n est pas activee.' }
  }

  if (!`${config.restoreTarget ?? ''}`.trim()) {
    return { ok: false, summary: 'Aucun checkpoint n est selectionne pour la restauration.' }
  }

  return { ok: true, summary: 'Un checkpoint stable peut etre restaure proprement.' }
}

function validateObserver(config = {}) {
  const observers = toList(config.observers)

  if (!validateMode(config, 'WITH_OBSERVER')) {
    return { ok: false, summary: 'La diffusion vers des abonnes n est pas activee.' }
  }

  if (observers.length < 3) {
    return { ok: false, summary: 'Le reseau d abonnes est trop faible pour valider la diffusion.' }
  }

  return { ok: true, summary: 'L evenement se diffuse correctement vers plusieurs abonnes.' }
}

function validateState(config = {}) {
  const actions = toList(config.actions)

  if (!validateMode(config, 'WITH_STATE')) {
    return { ok: false, summary: 'Le contexte ne s appuie pas sur une machine a etats explicite.' }
  }

  if (actions.length < 3) {
    return { ok: false, summary: 'La sequence d actions est trop courte pour montrer de vraies transitions.' }
  }

  return { ok: true, summary: 'Les transitions sont suffisamment explicites pour structurer le cycle de vie.' }
}

function validateStrategy(config = {}) {
  if (!validateMode(config, 'WITH_STRATEGY')) {
    return { ok: false, summary: 'Le comportement variable n est pas active.' }
  }

  if (!`${config.strategy ?? ''}`.trim()) {
    return { ok: false, summary: 'Aucune strategie concrete n est choisie.' }
  }

  return { ok: true, summary: 'L algorithme choisi peut varier sans casser le contexte.' }
}

function validateVisitor(config = {}) {
  if (!validateMode(config, 'WITH_VISITOR')) {
    return { ok: false, summary: 'Le traitement specialise n est pas active sur la structure.' }
  }

  if (!`${config.visitorType ?? ''}`.trim()) {
    return { ok: false, summary: 'Aucun visitor concret n est selectionne.' }
  }

  return { ok: true, summary: 'La structure accueille correctement un traitement specialise externe.' }
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
