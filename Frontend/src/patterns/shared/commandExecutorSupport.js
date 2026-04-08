export const commandActionLabels = {
  ADD_BEACON: 'Ajouter balise',
  MOVE_RIGHT: 'Deplacer a droite',
  MOVE_UP: 'Monter',
  MOVE_LEFT: 'Deplacer a gauche',
  DELETE_BEACON: 'Supprimer balise',
  UNDO: 'Undo',
  REDO: 'Redo',
}

export function createCommandBoard(boardName, actorName, gridSize = 5) {
  return {
    boardName,
    actorName,
    gridSize,
    x: 0,
    y: 0,
    beaconCount: 0,
  }
}

export function snapshotCommandBoard(board) {
  return {
    x: board.x,
    y: board.y,
    beaconCount: board.beaconCount,
  }
}

export function restoreCommandBoard(board, snapshot) {
  board.x = snapshot.x
  board.y = snapshot.y
  board.beaconCount = snapshot.beaconCount
}

export function applyCommandBoardAction(board, actionCode) {
  switch (actionCode) {
    case 'ADD_BEACON':
      board.beaconCount += 1
      break
    case 'MOVE_RIGHT':
      board.x = Math.min(board.gridSize - 1, board.x + 1)
      break
    case 'MOVE_UP':
      board.y = Math.min(board.gridSize - 1, board.y + 1)
      break
    case 'MOVE_LEFT':
      board.x = Math.max(0, board.x - 1)
      break
    case 'DELETE_BEACON':
      board.beaconCount = Math.max(0, board.beaconCount - 1)
      break
    default:
      break
  }
}

export function createCommandEntry(rawEntry) {
  const actionCode = typeof rawEntry === 'string'
    ? rawEntry
    : `${rawEntry?.actionCode ?? rawEntry?.code ?? 'COMMAND'}`

  return {
    actionCode,
    actionLabel: commandActionLabels[actionCode] ?? actionCode,
    commandClass: `${actionCode
      .toLowerCase()
      .split('_')
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join('')}Command`,
  }
}

export function createCommandStep(index, actionCode, operationType, accepted, detail, board, undoStack, redoStack) {
  return {
    index,
    actionCode,
    actionLabel: commandActionLabels[actionCode] ?? actionCode,
    operationType,
    accepted,
    detail,
    positionX: board.x,
    positionY: board.y,
    beaconCount: board.beaconCount,
    undoDepth: undoStack.length,
    redoDepth: redoStack.length,
    undoStack: undoStack.map(createCommandEntry),
    redoStack: redoStack.map(createCommandEntry),
  }
}

export function commandExecutionDetail(actorName, actionCode) {
  switch (actionCode) {
    case 'ADD_BEACON':
      return `${actorName} depose une balise sur la grille.`
    case 'MOVE_RIGHT':
      return `${actorName} avance d une case vers la droite.`
    case 'MOVE_UP':
      return `${actorName} monte d une case.`
    case 'MOVE_LEFT':
      return `${actorName} recule d une case vers la gauche.`
    case 'DELETE_BEACON':
      return `${actorName} retire une balise active.`
    default:
      return 'Action executee.'
  }
}

export function commandDirectDetail(actorName, actionCode) {
  switch (actionCode) {
    case 'ADD_BEACON':
      return `${actorName} ajoute directement une balise sans objet commande.`
    case 'MOVE_RIGHT':
      return `${actorName} est deplace a droite par le controleur direct.`
    case 'MOVE_UP':
      return `${actorName} est deplace vers le haut par le controleur direct.`
    case 'MOVE_LEFT':
      return `${actorName} est deplace a gauche par le controleur direct.`
    case 'DELETE_BEACON':
      return `${actorName} supprime une balise par appel direct.`
    default:
      return 'Mutation directe.'
  }
}

export function buildCommandVisualization(useCommand, board, undoStack, redoStack) {
  return {
    nodes: [
      {
        id: 'controller',
        label: useCommand ? 'CommandInvoker' : 'DirectController',
        type: 'context',
        data: { detail: useCommand ? 'dispatch + history' : 'mutations directes' },
      },
      {
        id: 'command',
        label: useCommand ? 'BoardCommand' : 'Inline actions',
        type: 'cluster',
        data: { detail: useCommand ? 'actions encapsulees' : 'aucun objet commande' },
      },
      {
        id: 'receiver',
        label: 'ArenaBoard',
        type: 'component',
        data: { detail: `${board.actorName} sur ${board.boardName}` },
      },
      {
        id: 'undo',
        label: 'Undo stack',
        type: 'decorator',
        data: { detail: `${undoStack.length} commande(s)` },
      },
      {
        id: 'redo',
        label: 'Redo stack',
        type: 'decorator',
        data: { detail: `${redoStack.length} commande(s)` },
      },
      {
        id: 'result',
        label: 'Etat final',
        type: 'output',
        data: { message: `x=${board.x} y=${board.y} balises=${board.beaconCount}` },
      },
    ],
    edges: [
      { from: 'controller', to: 'command', label: useCommand ? 'dispatch' : 'inline' },
      { from: 'command', to: 'receiver', label: useCommand ? 'execute' : 'mutate' },
      { from: 'receiver', to: 'result', label: 'state' },
      { from: 'controller', to: 'undo', label: useCommand ? 'push/pop' : 'empty' },
      { from: 'controller', to: 'redo', label: useCommand ? 'redo' : 'empty' },
    ],
  }
}
