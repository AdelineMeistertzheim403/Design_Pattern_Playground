const WITH_INTERPRETER = 'WITH_INTERPRETER'
const WITHOUT_INTERPRETER = 'WITHOUT_INTERPRETER'
const BOARD_WIDTH = 6
const BOARD_HEIGHT = 6
const START_X = 1
const START_Y = 2
const START_FACING = 'EAST'
const patternCode = 'interpreter'

const objectives = {
  TARGET_DUMMY: {
    code: 'TARGET_DUMMY',
    label: 'Target Dummy',
    description: 'Atteindre le mannequin d entrainement puis declencher une attaque au bon endroit.',
    targetLabel: 'Dummy',
    targetX: 4,
    targetY: 3,
    requiresAttack: true,
  },
  RELAY_BEACON: {
    code: 'RELAY_BEACON',
    label: 'Relay Beacon',
    description: 'Rejoindre la balise de relais pour synchroniser le parcours sans attaque finale.',
    targetLabel: 'Beacon',
    targetX: 5,
    targetY: 2,
    requiresAttack: false,
  },
  GATE_SWITCH: {
    code: 'GATE_SWITCH',
    label: 'Gate Switch',
    description: 'Declencher le levier final dans la partie basse de l arene.',
    targetLabel: 'Switch',
    targetX: 3,
    targetY: 5,
    requiresAttack: false,
  },
}

const facingOrder = ['NORTH', 'EAST', 'SOUTH', 'WEST']
const facingVectors = {
  NORTH: { dx: 0, dy: -1, label: 'North' },
  EAST: { dx: 1, dy: 0, label: 'East' },
  SOUTH: { dx: 0, dy: 1, label: 'South' },
  WEST: { dx: -1, dy: 0, label: 'West' },
}

function buildVisualization(useInterpreter, context, objective) {
  const nodes = [
    { id: 'client', label: 'Code your logic', type: 'client', data: { detail: 'script author' } },
    {
      id: useInterpreter ? 'parser' : 'manual',
      label: useInterpreter ? 'Interpreter' : 'Manual Runner',
      type: useInterpreter ? 'context' : 'component',
      data: { detail: useInterpreter ? 'parse + ast' : 'if / else lineaire' },
    },
    {
      id: 'arena',
      label: 'Mission Context',
      type: 'state',
      data: {
        detail: `${facingVectors[context.facing].label} @ (${context.x},${context.y})`,
      },
    },
    {
      id: 'objective',
      label: objective.targetLabel,
      type: 'output',
      data: {
        detail: objective.label,
        active: context.objectiveCompleted,
      },
    },
    {
      id: 'result',
      label: context.objectiveCompleted ? 'Success' : 'Blocked',
      type: 'output',
      data: {
        message: context.objectiveCompleted ? 'goal reached' : 'script incomplete',
      },
    },
  ]
  const edges = []

  if (useInterpreter) {
    nodes.splice(2, 0, {
      id: 'ast',
      label: 'AST',
      type: 'cluster',
      data: { detail: 'repeat + commands' },
    })
    edges.push({ from: 'client', to: 'parser', label: 'parse' })
    edges.push({ from: 'parser', to: 'ast', label: 'build' })
    edges.push({ from: 'ast', to: 'arena', label: 'execute' })
  } else {
    edges.push({ from: 'client', to: 'manual', label: 'scan' })
    edges.push({ from: 'manual', to: 'arena', label: 'execute' })
    edges.push({ from: 'manual', to: 'result', label: 'skips repeat' })
  }

  edges.push({ from: 'arena', to: 'objective', label: 'reach' })
  edges.push({ from: 'objective', to: 'result', label: context.objectiveCompleted ? 'validated' : 'pending' })

  return { nodes, edges }
}

function createContext(objective) {
  return {
    x: START_X,
    y: START_Y,
    facing: START_FACING,
    targetHit: false,
    targetReached: false,
    objectiveCompleted: false,
    objective,
  }
}

function updateContextState(context) {
  context.targetReached = context.x === context.objective.targetX && context.y === context.objective.targetY
  context.objectiveCompleted = context.targetReached && (!context.objective.requiresAttack || context.targetHit)
}

function moveOne(context) {
  const vector = facingVectors[context.facing]
  const nextX = Math.max(1, Math.min(BOARD_WIDTH, context.x + vector.dx))
  const nextY = Math.max(1, Math.min(BOARD_HEIGHT, context.y + vector.dy))
  const moved = nextX !== context.x || nextY !== context.y
  context.x = nextX
  context.y = nextY
  updateContextState(context)
  return moved
}

function turnLeft(context) {
  const index = facingOrder.indexOf(context.facing)
  context.facing = facingOrder[(index + facingOrder.length - 1) % facingOrder.length]
  updateContextState(context)
}

function turnRight(context) {
  const index = facingOrder.indexOf(context.facing)
  context.facing = facingOrder[(index + 1) % facingOrder.length]
  updateContextState(context)
}

function attack(context) {
  if (context.x === context.objective.targetX && context.y === context.objective.targetY) {
    context.targetHit = true
  }
  updateContextState(context)
}

function createStep(lineNumber, sourceLine, actionCode, detail, context) {
  return {
    lineNumber,
    sourceLine,
    actionCode,
    detail,
    x: context.x,
    y: context.y,
    facing: context.facing,
    targetReached: context.targetReached,
    targetHit: context.targetHit,
    objectiveCompleted: context.objectiveCompleted,
  }
}

function parsePrimitive(sourceLine, lineNumber) {
  const normalized = sourceLine.toUpperCase()

  if (/^MOVE\s+\d+$/.test(normalized)) {
    return {
      kind: 'COMMAND',
      type: 'MOVE',
      amount: Number.parseInt(normalized.replace('MOVE', '').trim(), 10),
      lineNumber,
      sourceLine,
    }
  }

  if (normalized === 'TURN LEFT') {
    return { kind: 'COMMAND', type: 'TURN_LEFT', amount: 1, lineNumber, sourceLine }
  }

  if (normalized === 'TURN RIGHT') {
    return { kind: 'COMMAND', type: 'TURN_RIGHT', amount: 1, lineNumber, sourceLine }
  }

  if (normalized === 'ATTACK') {
    return { kind: 'COMMAND', type: 'ATTACK', amount: 1, lineNumber, sourceLine }
  }

  if (normalized === 'WAIT') {
    return { kind: 'COMMAND', type: 'WAIT', amount: 1, lineNumber, sourceLine }
  }

  throw new Error(`Instruction Interpreter inconnue a la ligne ${lineNumber} : ${sourceLine}`)
}

function parseBlock(lines, startIndex = 0, insideRepeat = false) {
  const expressions = []
  let index = startIndex

  while (index < lines.length) {
    const sourceLine = `${lines[index] ?? ''}`.trim()
    const lineNumber = index + 1

    if (!sourceLine) {
      index += 1
      continue
    }

    if (sourceLine === '}') {
      if (!insideRepeat) {
        throw new Error(`Accolade fermante inattendue a la ligne ${lineNumber}`)
      }

      return { expressions, nextIndex: index + 1 }
    }

    const repeatMatch = sourceLine.toUpperCase().match(/^REPEAT\s+(\d+)\s*\{$/)
    if (repeatMatch) {
      const childResult = parseBlock(lines, index + 1, true)
      expressions.push({
        kind: 'BLOCK',
        type: 'REPEAT',
        repeatCount: Number.parseInt(repeatMatch[1], 10),
        lineNumber,
        sourceLine,
        children: childResult.expressions,
      })
      index = childResult.nextIndex
      continue
    }

    expressions.push(parsePrimitive(sourceLine, lineNumber))
    index += 1
  }

  if (insideRepeat) {
    throw new Error('Bloc REPEAT non ferme avant la fin du script.')
  }

  return { expressions, nextIndex: lines.length }
}

function buildTreeNodes(expressions) {
  const nodes = [{ id: 'program', parentId: null, label: 'PROGRAM', kind: 'PROGRAM', depth: 0, lineNumber: 0, executable: false }]
  let sequence = 1

  function append(node, parentId, depth) {
    const currentId = `node-${sequence}`
    sequence += 1

    nodes.push({
      id: currentId,
      parentId,
      label: node.sourceLine,
      kind: node.kind === 'BLOCK' ? 'BLOCK' : 'COMMAND',
      depth,
      lineNumber: node.lineNumber,
      executable: node.kind !== 'BLOCK',
    })

    if (node.kind === 'BLOCK') {
      node.children.forEach((child) => append(child, currentId, depth + 1))
    }
  }

  expressions.forEach((expression) => append(expression, 'program', 1))
  return nodes
}

function interpretExpression(expression, context, steps) {
  if (expression.kind === 'BLOCK') {
    for (let iteration = 0; iteration < expression.repeatCount; iteration += 1) {
      expression.children.forEach((child) => interpretExpression(child, context, steps))
    }
    return
  }

  switch (expression.type) {
    case 'MOVE':
      for (let index = 1; index <= expression.amount; index += 1) {
        const moved = moveOne(context)
        steps.push(
          createStep(
            expression.lineNumber,
            expression.sourceLine,
            'MOVE',
            moved ? `Avance ${index} / ${expression.amount}.` : `Bloque par le bord sur ${index} / ${expression.amount}.`,
            context,
          ),
        )
      }
      break
    case 'TURN_LEFT':
      turnLeft(context)
      steps.push(createStep(expression.lineNumber, expression.sourceLine, 'TURN_LEFT', 'Rotation vers la gauche.', context))
      break
    case 'TURN_RIGHT':
      turnRight(context)
      steps.push(createStep(expression.lineNumber, expression.sourceLine, 'TURN_RIGHT', 'Rotation vers la droite.', context))
      break
    case 'ATTACK':
      attack(context)
      steps.push(
        createStep(
          expression.lineNumber,
          expression.sourceLine,
          'ATTACK',
          context.targetHit ? 'Attaque validee sur la cible.' : 'Attaque lancee hors de la cible.',
          context,
        ),
      )
      break
    case 'WAIT':
      updateContextState(context)
      steps.push(createStep(expression.lineNumber, expression.sourceLine, 'WAIT', 'Pause tactique sans mouvement.', context))
      break
    default:
      break
  }
}

function countRepeatExecutions(expressions) {
  return expressions.reduce((total, expression) => {
    if (expression.kind === 'BLOCK') {
      return total + expression.repeatCount
    }
    return total
  }, 0)
}

function executeWithoutInterpreter(scriptLines, context) {
  const steps = []
  const treeNodes = [{ id: 'program', parentId: null, label: 'PROGRAM', kind: 'PROGRAM', depth: 0, lineNumber: 0, executable: false }]
  const skippedLines = []

  scriptLines.forEach((sourceLine, index) => {
    const lineNumber = index + 1
    const normalized = sourceLine.toUpperCase()
    const nodeId = `node-${index + 1}`

    if (/^MOVE\s+\d+$/.test(normalized)) {
      treeNodes.push({ id: nodeId, parentId: 'program', label: sourceLine, kind: 'RAW_COMMAND', depth: 1, lineNumber, executable: true })
      interpretExpression(parsePrimitive(sourceLine, lineNumber), context, steps)
      return
    }

    if (['TURN LEFT', 'TURN RIGHT', 'ATTACK', 'WAIT'].includes(normalized)) {
      treeNodes.push({ id: nodeId, parentId: 'program', label: sourceLine, kind: 'RAW_COMMAND', depth: 1, lineNumber, executable: true })
      interpretExpression(parsePrimitive(sourceLine, lineNumber), context, steps)
      return
    }

    treeNodes.push({ id: nodeId, parentId: 'program', label: sourceLine, kind: 'UNSUPPORTED', depth: 1, lineNumber, executable: false })
    skippedLines.push({
      lineNumber,
      sourceLine,
      reason: normalized.startsWith('REPEAT') || normalized === '}'
        ? 'Structure de langage non comprise sans Interpreter'
        : 'Instruction ignoree par le lecteur manuel',
    })
  })

  return { steps, treeNodes, skippedLines }
}

function toStepMaps(steps) {
  return steps.map((step, index) => ({
    index: index + 1,
    ...step,
  }))
}

export default function interpreterExecutor(parameters) {
  const mode = `${parameters.mode ?? WITH_INTERPRETER}`.trim().toUpperCase()
  const useInterpreter = mode === WITH_INTERPRETER
  const objective = objectives[`${parameters.objective ?? 'TARGET_DUMMY'}`.trim().toUpperCase()] ?? objectives.TARGET_DUMMY
  const missionName = `${parameters.missionName ?? 'Target Dummy Drill'}`.trim() || 'Target Dummy Drill'
  const scriptLines = (Array.isArray(parameters.scriptLines) ? parameters.scriptLines : [`${parameters.scriptLines ?? ''}`])
    .map((line) => `${line}`.trim())
    .filter(Boolean)

  if (scriptLines.length === 0) {
    throw new Error('Le script Interpreter ne peut pas etre vide.')
  }

  const context = createContext(objective)
  let steps = []
  let treeNodes = []
  let skippedLines = []
  const logs = []

  if (useInterpreter) {
    const { expressions } = parseBlock(scriptLines)
    expressions.forEach((expression) => interpretExpression(expression, context, steps))
    treeNodes = buildTreeNodes(expressions)
    logs.push('Le client confie le script a un parseur qui construit un arbre d expressions executable.')
    logs.push(`Les blocs REPEAT sont composes, puis rejoues ${countRepeatExecutions(expressions)} fois sans dupliquer le code client.`)
    logs.push('Chaque expression interprete le meme contexte de mission avec position, orientation et cible.')
  } else {
    const manual = executeWithoutInterpreter(scriptLines, context)
    steps = manual.steps
    treeNodes = manual.treeNodes
    skippedLines = manual.skippedLines
    logs.push('Sans Interpreter, le client parcourt les lignes a la main avec une suite de conditions.')
    logs.push('Les lignes REPEAT et les accolades sont ignorees car aucune structure de langage n est comprise.')
    logs.push('Le mini langage devient vite fragile : une simple extension casse la lecture imperative.')
  }

  logs.push(
    context.objectiveCompleted
      ? `Objectif accompli : la cible ${objective.targetLabel} est atteinte${objective.requiresAttack ? ' et attaquee.' : '.'}`
      : 'Objectif incomplet : la cible n a pas ete atteinte ou l attaque finale manque.',
  )

  return {
    patternCode,
    summary: useInterpreter
      ? "Interpreter transforme un mini langage en arbre d expressions executables. Le client manipule alors le langage, pas la logique de chaque commande."
      : "Sans Interpreter, le script est lu ligne par ligne par du code manuel. Les structures du langage comme REPEAT restent alors incomprises et la mission se degrade.",
    logs,
    output: {
      mode,
      modeLabel: useInterpreter ? 'Avec Interpreter' : 'Sans Interpreter',
      missionName,
      objectiveCode: objective.code,
      objectiveLabel: objective.label,
      objectiveDescription: objective.description,
      targetLabel: objective.targetLabel,
      boardWidth: BOARD_WIDTH,
      boardHeight: BOARD_HEIGHT,
      startX: START_X,
      startY: START_Y,
      startFacing: START_FACING,
      targetX: objective.targetX,
      targetY: objective.targetY,
      requiresAttack: objective.requiresAttack,
      parserUsed: useInterpreter,
      targetReached: context.targetReached,
      targetHit: context.targetHit,
      objectiveCompleted: context.objectiveCompleted,
      resultLabel: context.objectiveCompleted ? 'Mission accomplie' : 'Mission incomplete',
      finalX: context.x,
      finalY: context.y,
      finalFacing: context.facing,
      lineCount: scriptLines.length,
      stepCount: steps.length,
      skippedLineCount: skippedLines.length,
      scriptLines,
      steps: toStepMaps(steps),
      treeNodes,
      skippedLines,
    },
    visualization: buildVisualization(useInterpreter, context, objective),
  }
}
