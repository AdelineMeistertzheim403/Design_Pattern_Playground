import {
  fallbackQuiz as adapterFallbackQuiz,
  fallbackSchema as adapterFallbackSchema,
  patternDefinition as adapterPatternDefinition,
  patternLearningContent as adapterPatternLearningContent,
  patternUmlDiagram as adapterPatternUmlDiagram,
} from './adapter/data'
import {
  fallbackQuiz as builderFallbackQuiz,
  fallbackSchema as builderFallbackSchema,
  patternDefinition as builderPatternDefinition,
  patternLearningContent as builderPatternLearningContent,
  patternUmlDiagram as builderPatternUmlDiagram,
} from './builder/data'
import {
  fallbackQuiz as chainFallbackQuiz,
  fallbackSchema as chainFallbackSchema,
  patternDefinition as chainPatternDefinition,
  patternLearningContent as chainPatternLearningContent,
  patternUmlDiagram as chainPatternUmlDiagram,
} from './chain/data'
import {
  fallbackQuiz as commandFallbackQuiz,
  fallbackSchema as commandFallbackSchema,
  patternDefinition as commandPatternDefinition,
  patternLearningContent as commandPatternLearningContent,
  patternUmlDiagram as commandPatternUmlDiagram,
} from './command/data'
import {
  fallbackQuiz as decoratorFallbackQuiz,
  fallbackSchema as decoratorFallbackSchema,
  patternDefinition as decoratorPatternDefinition,
  patternLearningContent as decoratorPatternLearningContent,
  patternUmlDiagram as decoratorPatternUmlDiagram,
} from './decorator/data'
import {
  fallbackQuiz as factoryFallbackQuiz,
  fallbackSchema as factoryFallbackSchema,
  patternDefinition as factoryPatternDefinition,
  patternLearningContent as factoryPatternLearningContent,
  patternUmlDiagram as factoryPatternUmlDiagram,
} from './factory/data'
import {
  fallbackQuiz as flyweightFallbackQuiz,
  fallbackSchema as flyweightFallbackSchema,
  patternDefinition as flyweightPatternDefinition,
  patternLearningContent as flyweightPatternLearningContent,
  patternUmlDiagram as flyweightPatternUmlDiagram,
} from './flyweight/data'
import {
  fallbackQuiz as mediatorFallbackQuiz,
  fallbackSchema as mediatorFallbackSchema,
  patternDefinition as mediatorPatternDefinition,
  patternLearningContent as mediatorPatternLearningContent,
  patternUmlDiagram as mediatorPatternUmlDiagram,
} from './mediator/data'
import {
  fallbackQuiz as observerFallbackQuiz,
  fallbackSchema as observerFallbackSchema,
  patternDefinition as observerPatternDefinition,
  patternLearningContent as observerPatternLearningContent,
  patternUmlDiagram as observerPatternUmlDiagram,
} from './observer/data'
import {
  fallbackQuiz as singletonFallbackQuiz,
  fallbackSchema as singletonFallbackSchema,
  patternDefinition as singletonPatternDefinition,
  patternLearningContent as singletonPatternLearningContent,
  patternUmlDiagram as singletonPatternUmlDiagram,
} from './singleton/data'
import {
  fallbackQuiz as stateFallbackQuiz,
  fallbackSchema as stateFallbackSchema,
  patternDefinition as statePatternDefinition,
  patternLearningContent as statePatternLearningContent,
  patternUmlDiagram as statePatternUmlDiagram,
} from './state/data'
import {
  fallbackQuiz as strategyFallbackQuiz,
  fallbackSchema as strategyFallbackSchema,
  patternDefinition as strategyPatternDefinition,
  patternLearningContent as strategyPatternLearningContent,
  patternUmlDiagram as strategyPatternUmlDiagram,
} from './strategy/data'

export const orderedPatternDefinitions = [
  mediatorPatternDefinition,
  chainPatternDefinition,
  commandPatternDefinition,
  adapterPatternDefinition,
  builderPatternDefinition,
  singletonPatternDefinition,
  statePatternDefinition,
  flyweightPatternDefinition,
  decoratorPatternDefinition,
  factoryPatternDefinition,
  observerPatternDefinition,
  strategyPatternDefinition,
]

export const patternSchemasByCode = {
  adapter: adapterFallbackSchema,
  builder: builderFallbackSchema,
  chain: chainFallbackSchema,
  command: commandFallbackSchema,
  decorator: decoratorFallbackSchema,
  factory: factoryFallbackSchema,
  flyweight: flyweightFallbackSchema,
  mediator: mediatorFallbackSchema,
  observer: observerFallbackSchema,
  singleton: singletonFallbackSchema,
  state: stateFallbackSchema,
  strategy: strategyFallbackSchema,
}

export const patternLearningContentByCode = {
  adapter: adapterPatternLearningContent,
  builder: builderPatternLearningContent,
  chain: chainPatternLearningContent,
  command: commandPatternLearningContent,
  decorator: decoratorPatternLearningContent,
  factory: factoryPatternLearningContent,
  flyweight: flyweightPatternLearningContent,
  mediator: mediatorPatternLearningContent,
  observer: observerPatternLearningContent,
  singleton: singletonPatternLearningContent,
  state: statePatternLearningContent,
  strategy: strategyPatternLearningContent,
}

export const patternUmlDiagramsByCode = {
  adapter: adapterPatternUmlDiagram,
  builder: builderPatternUmlDiagram,
  chain: chainPatternUmlDiagram,
  command: commandPatternUmlDiagram,
  decorator: decoratorPatternUmlDiagram,
  factory: factoryPatternUmlDiagram,
  flyweight: flyweightPatternUmlDiagram,
  mediator: mediatorPatternUmlDiagram,
  observer: observerPatternUmlDiagram,
  singleton: singletonPatternUmlDiagram,
  state: statePatternUmlDiagram,
  strategy: strategyPatternUmlDiagram,
}

export const fallbackQuizzesByCode = {
  adapter: adapterFallbackQuiz,
  builder: builderFallbackQuiz,
  chain: chainFallbackQuiz,
  command: commandFallbackQuiz,
  decorator: decoratorFallbackQuiz,
  factory: factoryFallbackQuiz,
  flyweight: flyweightFallbackQuiz,
  mediator: mediatorFallbackQuiz,
  observer: observerFallbackQuiz,
  singleton: singletonFallbackQuiz,
  state: stateFallbackQuiz,
  strategy: strategyFallbackQuiz,
}
