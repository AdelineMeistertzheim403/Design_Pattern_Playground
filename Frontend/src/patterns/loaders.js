import { defaultPatternCode } from './catalog'
import { defaultLearningContent, emptyPatternSchema } from './defaults'

const patternModuleLoaders = import.meta.glob('./*/index.js')
const patternModuleCache = new Map()

function buildModuleKey(code, fileName) {
  return `./${code}/${fileName}`
}

async function loadCachedModule(code, fileName, loaders, cache) {
  const moduleCode = code || defaultPatternCode

  if (cache.has(moduleCode)) {
    return cache.get(moduleCode)
  }

  const loader = loaders[buildModuleKey(moduleCode, fileName)]
  if (!loader) {
    return null
  }

  const pendingModule = loader().catch((error) => {
    cache.delete(moduleCode)
    throw error
  })

  cache.set(moduleCode, pendingModule)
  return pendingModule
}

export async function loadPatternModule(code) {
  return loadCachedModule(code, 'index.js', patternModuleLoaders, patternModuleCache)
}

export async function loadFallbackSchema(code) {
  const module = await loadPatternModule(code)
  return module?.fallbackSchema ?? emptyPatternSchema
}

export async function loadPatternLearningContent(code) {
  const module = await loadPatternModule(code)
  return module?.patternLearningContent ?? defaultLearningContent
}

export async function loadPatternUmlDiagram(code) {
  const module = await loadPatternModule(code)
  return module?.patternUmlDiagram ?? null
}

export async function loadFallbackQuiz(code) {
  const module = await loadPatternModule(code)
  return module?.fallbackQuiz ?? null
}

export async function executeFallbackPattern(code, parameters) {
  const module = await loadPatternModule(code)
  if (!module?.fallbackExecutor) {
    throw new Error(`No local executor available for ${code}`)
  }

  return module.fallbackExecutor(parameters)
}

export async function loadPatternSceneComponent(code) {
  const module = await loadPatternModule(code)
  return module?.SceneComponent ?? null
}
