import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function normalizeModuleId(id) {
  return id.replace(/\\/g, '/')
}

function getPatternCodeFromModuleId(id) {
  const match = normalizeModuleId(id).match(/\/src\/patterns\/([^/]+)\//)
  return match?.[1] ?? null
}

function getNamedFacadeChunk(id) {
  const normalizedId = normalizeModuleId(id)

  if (normalizedId.includes('/src/pages/HomePage.jsx')) {
    return 'page-home'
  }

  if (normalizedId.includes('/src/pages/pattern-quiz/QuizQuestionCard.jsx')) {
    return 'page-quiz-question'
  }

  if (normalizedId.includes('/src/pages/pattern-quiz/QuizSummary.jsx')) {
    return 'page-quiz-summary'
  }

  if (normalizedId.includes('/src/pages/pattern-page/PatternVisualizationSection.jsx')) {
    return 'page-pattern-visualization'
  }

  if (normalizedId.includes('/src/pages/pattern-page/PatternExecutionResultSection.jsx')) {
    return 'page-pattern-result'
  }

  if (normalizedId.includes('/src/pages/pattern-page/PatternLearningSection.jsx')) {
    return 'page-pattern-learning'
  }

  if (normalizedId.includes('/src/pages/PatternPage.jsx')) {
    return 'page-pattern'
  }

  if (normalizedId.includes('/src/pages/PatternQuizPage.jsx')) {
    return 'page-quiz'
  }

  if (normalizedId.includes('/src/pages/QuizDashboardPage.jsx')) {
    return 'page-progress'
  }

  if (normalizedId.includes('/src/pages/NotFoundPage.jsx')) {
    return 'page-not-found'
  }

  if (normalizedId.includes('/src/components/AuthDialog.jsx')) {
    return 'modal-auth'
  }

  if (normalizedId.includes('/src/components/VisualizationModal.jsx')) {
    return 'modal-visualization'
  }

  if (normalizedId.includes('/src/components/UmlDiagram.jsx')) {
    return 'ui-uml'
  }

  if (normalizedId.includes('/src/components/ExecutionScene.jsx')) {
    return 'ui-execution-scene'
  }

  const patternCode = getPatternCodeFromModuleId(normalizedId)
  if (normalizedId.endsWith('/index.js') && patternCode && patternCode !== 'shared') {
    return `pattern-${patternCode}`
  }

  return null
}

function resolveManualChunk(id) {
  const normalizedId = normalizeModuleId(id)

  if (normalizedId.includes('/node_modules/react/') || normalizedId.includes('/node_modules/react-dom/')) {
    return 'vendor-react'
  }

  if (normalizedId.includes('/node_modules/')) {
    return 'vendor'
  }

  if (
    normalizedId.includes('/src/patterns/shared/executorCommon.js')
    || normalizedId.includes('/src/patterns/shared/adapterExecutorSupport.js')
    || normalizedId.includes('/src/patterns/shared/builderExecutorSupport.js')
    || normalizedId.includes('/src/patterns/shared/commandExecutorSupport.js')
    || normalizedId.includes('/src/patterns/shared/decoratorExecutorSupport.js')
    || normalizedId.includes('/src/patterns/shared/flyweightExecutorSupport.js')
    || normalizedId.includes('/src/patterns/shared/mediatorChainExecutorSupport.js')
    || normalizedId.includes('/src/patterns/shared/stateExecutorSupport.js')
  ) {
    return 'pattern-executor-shared'
  }

  return null
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          chunkFileNames(chunkInfo) {
            const facadeChunkName = chunkInfo.facadeModuleId
              ? getNamedFacadeChunk(chunkInfo.facadeModuleId)
              : null

            if (facadeChunkName) {
              return `assets/${facadeChunkName}-[hash].js`
            }

            return 'assets/[name]-[hash].js'
          },
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          manualChunks(id) {
            return resolveManualChunk(id)
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
