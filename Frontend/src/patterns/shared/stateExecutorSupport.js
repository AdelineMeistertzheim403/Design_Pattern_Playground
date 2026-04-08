export const stateActionLabels = {
  START_RUN: 'Courir',
  STOP: 'Stop',
  JUMP: 'Sauter',
  LAND: 'Atterrir',
  ATTACK: 'Attaquer',
  FINISH_ATTACK: 'Fin attaque',
}

export const stateDefinitions = {
  IDLE: {
    label: 'Idle',
    availableActions: ['START_RUN', 'JUMP', 'ATTACK'],
  },
  RUNNING: {
    label: 'Running',
    availableActions: ['STOP', 'JUMP', 'ATTACK'],
  },
  JUMPING: {
    label: 'Jumping',
    availableActions: ['LAND'],
  },
  ATTACKING: {
    label: 'Attacking',
    availableActions: ['FINISH_ATTACK'],
  },
}

export function simulateStateTransition(currentState, actionCode, characterName) {
  switch (currentState) {
    case 'IDLE':
      if (actionCode === 'START_RUN') {
        return {
          nextState: 'RUNNING',
          accepted: true,
          detail: `${characterName} quitte Idle et passe en Running.`,
        }
      }

      if (actionCode === 'JUMP') {
        return {
          nextState: 'JUMPING',
          accepted: true,
          detail: `${characterName} saute depuis Idle et entre en Jumping.`,
        }
      }

      if (actionCode === 'ATTACK') {
        return {
          nextState: 'ATTACKING',
          accepted: true,
          detail: `${characterName} declenche une attaque depuis Idle.`,
        }
      }
      break
    case 'RUNNING':
      if (actionCode === 'STOP') {
        return {
          nextState: 'IDLE',
          accepted: true,
          detail: `${characterName} s arrete et revient en Idle.`,
        }
      }

      if (actionCode === 'JUMP') {
        return {
          nextState: 'JUMPING',
          accepted: true,
          detail: `${characterName} saute en gardant son elan et passe en Jumping.`,
        }
      }

      if (actionCode === 'ATTACK') {
        return {
          nextState: 'ATTACKING',
          accepted: true,
          detail: `${characterName} interrompt sa course pour attaquer.`,
        }
      }
      break
    case 'JUMPING':
      if (actionCode === 'LAND') {
        return {
          nextState: 'IDLE',
          accepted: true,
          detail: `${characterName} atterrit et repasse en Idle.`,
        }
      }
      break
    case 'ATTACKING':
      if (actionCode === 'FINISH_ATTACK') {
        return {
          nextState: 'IDLE',
          accepted: true,
          detail: `${characterName} termine son attaque et revient en Idle.`,
        }
      }
      break
    default:
      break
  }

  const actionLabel = stateActionLabels[actionCode] ?? actionCode
  return {
    nextState: currentState,
    accepted: false,
    detail: `${actionLabel} est ignoree tant que ${characterName} est en ${stateDefinitions[currentState]?.label ?? currentState}.`,
  }
}
