import executeAdapterPattern from './adapter/executor'
import executeBuilderPattern from './builder/executor'
import executeChainPattern from './chain/executor'
import executeCommandPattern from './command/executor'
import executeDecoratorPattern from './decorator/executor'
import executeFactoryPattern from './factory/executor'
import executeFlyweightPattern from './flyweight/executor'
import executeMediatorPattern from './mediator/executor'
import executeObserverPattern from './observer/executor'
import executeSingletonPattern from './singleton/executor'
import executeStatePattern from './state/executor'
import executeStrategyPattern from './strategy/executor'

export const fallbackExecutorsByCode = {
  adapter: executeAdapterPattern,
  builder: executeBuilderPattern,
  chain: executeChainPattern,
  command: executeCommandPattern,
  decorator: executeDecoratorPattern,
  factory: executeFactoryPattern,
  flyweight: executeFlyweightPattern,
  mediator: executeMediatorPattern,
  observer: executeObserverPattern,
  singleton: executeSingletonPattern,
  state: executeStatePattern,
  strategy: executeStrategyPattern,
}
