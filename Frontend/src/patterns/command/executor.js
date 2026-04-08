import {
  applyCommandBoardAction,
  buildCommandVisualization,
  commandActionLabels,
  commandDirectDetail,
  commandExecutionDetail,
  createCommandBoard,
  createCommandEntry,
  createCommandStep,
  restoreCommandBoard,
  snapshotCommandBoard,
} from '../shared/commandExecutorSupport'
import { normalizeOrderedList } from '../shared/executorCommon'

export default function executeCommandPattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_COMMAND'}`.toUpperCase()
  const useCommand = mode !== 'WITHOUT_COMMAND'
  const boardName = `${parameters.boardName ?? ''}`.trim() || 'Arena Grid'
  const actorName = `${parameters.actorName ?? ''}`.trim() || 'Pixel Bot'
  const actions = normalizeOrderedList(parameters.actions).map((value) => `${value}`.trim().toUpperCase()).filter(Boolean)
  const board = createCommandBoard(boardName, actorName)
  const logs = []
  const history = []
  const undoStack = []
  const redoStack = []

  if (actions.length === 0) {
    throw new Error('Au moins une action est obligatoire.')
  }

  if (useCommand) {
    logs.push(`Creation du receiver ${boardName} pour ${actorName}.`)
    logs.push('Initialisation du CommandInvoker avec deux piles : undo et redo.')

    actions.forEach((actionCode, index) => {
      if (actionCode === 'UNDO') {
        if (undoStack.length === 0) {
          const step = createCommandStep(
            index + 1,
            actionCode,
            'UNDO',
            false,
            'Aucune commande a annuler : la pile undo est vide.',
            board,
            undoStack,
            redoStack,
          )
          logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
          history.push(step)
          return
        }

        const lastCommand = undoStack.shift()
        restoreCommandBoard(board, lastCommand.beforeState)
        redoStack.unshift(lastCommand)
        const step = createCommandStep(
          index + 1,
          actionCode,
          'UNDO',
          true,
          `Undo retire ${lastCommand.actionLabel.toLowerCase()} de la pile active et restaure l etat precedent.`,
          board,
          undoStack.map(({ actionCode: code }) => code),
          redoStack.map(({ actionCode: code }) => code),
        )
        logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
        history.push(step)
        return
      }

      if (actionCode === 'REDO') {
        if (redoStack.length === 0) {
          const step = createCommandStep(
            index + 1,
            actionCode,
            'REDO',
            false,
            'Aucune commande a rejouer : la pile redo est vide.',
            board,
            undoStack.map(({ actionCode: code }) => code),
            redoStack.map(({ actionCode: code }) => code),
          )
          logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
          history.push(step)
          return
        }

        const replayedCommand = redoStack.shift()
        replayedCommand.beforeState = snapshotCommandBoard(board)
        applyCommandBoardAction(board, replayedCommand.actionCode)
        undoStack.unshift(replayedCommand)
        const step = createCommandStep(
          index + 1,
          actionCode,
          'REDO',
          true,
          `Redo rejoue ${replayedCommand.actionLabel.toLowerCase()} depuis la pile redo.`,
          board,
          undoStack.map(({ actionCode: code }) => code),
          redoStack.map(({ actionCode: code }) => code),
        )
        logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
        history.push(step)
        return
      }

      const commandRecord = {
        actionCode,
        actionLabel: commandActionLabels[actionCode] ?? actionCode,
        beforeState: snapshotCommandBoard(board),
      }
      applyCommandBoardAction(board, actionCode)
      undoStack.unshift(commandRecord)
      redoStack.length = 0
      const step = createCommandStep(
        index + 1,
        actionCode,
        'EXECUTE',
        true,
        commandExecutionDetail(actorName, actionCode),
        board,
        undoStack.map(({ actionCode: code }) => code),
        redoStack.map(({ actionCode: code }) => code),
      )
      logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
      history.push(step)
    })
  } else {
    logs.push(`Mode sans Command : ${actorName} modifie directement ${boardName}.`)
    logs.push('Aucune pile de commandes n est maintenue, donc undo et redo ne peuvent pas fonctionner.')

    actions.forEach((actionCode, index) => {
      if (actionCode === 'UNDO' || actionCode === 'REDO') {
        const step = createCommandStep(
          index + 1,
          actionCode,
          'BLOCKED',
          false,
          `Le controleur direct ne stocke aucune commande : ${(commandActionLabels[actionCode] ?? actionCode).toLowerCase()} est impossible.`,
          board,
          [],
          [],
        )
        logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
        history.push(step)
        return
      }

      applyCommandBoardAction(board, actionCode)
      const step = createCommandStep(
        index + 1,
        actionCode,
        'DIRECT',
        true,
        commandDirectDetail(actorName, actionCode),
        board,
        [],
        [],
      )
      logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
      history.push(step)
    })
  }

  const blockedCommands = history.filter((step) => !step.accepted).length
  const successfulControlCommands = history.filter((step) => (
    step.accepted && (step.actionCode === 'UNDO' || step.actionCode === 'REDO')
  )).length
  const visitedCells = [...new Set(history.map((step) => `${step.positionX},${step.positionY}`))]
  const finalUndoStack = useCommand
    ? undoStack.map((entry) => createCommandEntry(entry.actionCode))
    : []
  const finalRedoStack = useCommand
    ? redoStack.map((entry) => createCommandEntry(entry.actionCode))
    : []

  return {
    patternCode: 'command',
    summary: useCommand
      ? "Command encapsule chaque action dans un objet autonome. L invoker peut donc conserver un historique, annuler et rejouer des operations."
      : "Sans Command, l interface appelle directement le receiver. Les actions partent, mais aucune pile n existe pour les annuler proprement.",
    logs,
    output: {
      mode: useCommand ? 'WITH_COMMAND' : 'WITHOUT_COMMAND',
      modeLabel: useCommand ? 'Avec Command' : 'Sans Command',
      boardName,
      actorName,
      boardSize: board.gridSize,
      positionX: board.x,
      positionY: board.y,
      beaconCount: board.beaconCount,
      actionCount: actions.length,
      executedCommands: history.filter((step) => step.accepted).length,
      blockedCommands,
      successfulControlCommands,
      undoStack: finalUndoStack,
      redoStack: finalRedoStack,
      visitedCells,
      history,
    },
    visualization: buildCommandVisualization(useCommand, board, finalUndoStack, finalRedoStack),
  }
}
