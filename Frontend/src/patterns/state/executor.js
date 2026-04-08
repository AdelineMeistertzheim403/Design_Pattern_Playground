import {
  simulateStateTransition,
  stateActionLabels,
  stateDefinitions,
} from '../shared/stateExecutorSupport'
import { normalizeOrderedList } from '../shared/executorCommon'

export default function executeStatePattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_STATE'}`.toUpperCase()
  const useState = mode !== 'WITHOUT_STATE'
  const characterName = `${parameters.characterName ?? ''}`.trim() || 'Arena Bot'
  const initialState = `${parameters.initialState ?? 'IDLE'}`.trim().toUpperCase()
  const actions = normalizeOrderedList(parameters.actions).map((action) => action.toUpperCase())

  if (!stateDefinitions[initialState]) {
    throw new Error(`Etat initial inconnu : ${initialState}`)
  }

  if (actions.length === 0) {
    throw new Error('Au moins une action est obligatoire.')
  }

  let currentState = initialState
  const logs = [
    useState
      ? `Creation du contexte pour ${characterName} avec l etat initial ${initialState}.`
      : `Mode sans State : creation d un controleur conditionnel pour ${characterName} avec l etat initial ${initialState}.`,
  ]

  const timeline = actions.map((actionCode, index) => {
    const fromState = currentState
    const result = simulateStateTransition(currentState, actionCode, characterName)
    currentState = result.nextState

    const step = {
      index: index + 1,
      actionCode,
      actionLabel: stateActionLabels[actionCode] ?? actionCode,
      fromState,
      toState: currentState,
      accepted: result.accepted,
      detail: result.detail,
    }

    logs.push(`Action ${step.index} - ${step.actionCode} : ${step.detail}`)
    return step
  })

  const acceptedTransitions = timeline.filter((step) => step.accepted).length
  const ignoredActions = timeline.length - acceptedTransitions
  const visitedStates = []

  timeline.forEach((step) => {
    if (!visitedStates.includes(step.fromState)) {
      visitedStates.push(step.fromState)
    }
    if (!visitedStates.includes(step.toState)) {
      visitedStates.push(step.toState)
    }
  })

  if (visitedStates.length === 0) {
    visitedStates.push(initialState)
  }

  return {
    patternCode: 'state',
    summary: useState
      ? "State encapsule les transitions dans chaque etat concret, ce qui rend le contexte plus lisible et plus simple a faire evoluer."
      : "Sans State, la logique de transition reste centralisee dans des conditions, ce qui complique l evolution du contexte.",
    logs,
    output: {
      mode: useState ? 'WITH_STATE' : 'WITHOUT_STATE',
      modeLabel: useState ? 'Avec State' : 'Sans State',
      characterName,
      initialState,
      finalState: currentState,
      currentStateLabel: stateDefinitions[currentState]?.label ?? currentState,
      actionCount: timeline.length,
      acceptedTransitions,
      ignoredActions,
      availableActions: stateDefinitions[currentState]?.availableActions ?? [],
      visitedStates,
      timeline,
    },
    visualization: {
      nodes: [
        {
          id: 'context',
          label: useState ? 'CharacterContext' : 'SwitchController',
          type: 'context',
          data: { detail: useState ? 'etat courant' : 'if / else centralise' },
        },
        { id: 'idle', label: 'IdleState', type: 'state', data: { active: currentState === 'IDLE', visited: visitedStates.includes('IDLE') } },
        { id: 'running', label: 'RunningState', type: 'state', data: { active: currentState === 'RUNNING', visited: visitedStates.includes('RUNNING') } },
        { id: 'jumping', label: 'JumpingState', type: 'state', data: { active: currentState === 'JUMPING', visited: visitedStates.includes('JUMPING') } },
        { id: 'attacking', label: 'AttackingState', type: 'state', data: { active: currentState === 'ATTACKING', visited: visitedStates.includes('ATTACKING') } },
        { id: 'result', label: 'Etat final', type: 'output', data: { message: `${currentState} apres ${timeline.length} action(s)` } },
      ],
      edges: [
        { from: 'context', to: currentState.toLowerCase(), label: useState ? 'holds' : 'switch' },
        { from: 'idle', to: 'running', label: 'START_RUN' },
        { from: 'running', to: 'idle', label: 'STOP' },
        { from: 'idle', to: 'jumping', label: 'JUMP' },
        { from: 'running', to: 'jumping', label: 'JUMP' },
        { from: 'jumping', to: 'idle', label: 'LAND' },
        { from: 'idle', to: 'attacking', label: 'ATTACK' },
        { from: 'running', to: 'attacking', label: 'ATTACK' },
        { from: 'attacking', to: 'idle', label: 'FINISH_ATTACK' },
        { from: currentState.toLowerCase(), to: 'result', label: 'current' },
      ],
    },
  }
}
