const shapePresets = {
  CIRCLE: {
    code: 'CIRCLE',
    label: 'Circle',
    className: 'CircleShape',
    detail:
      'Une forme ronde utile pour montrer que le rendu change sans toucher aux operations de la forme.',
    complexity: 2,
  },
  TRIANGLE: {
    code: 'TRIANGLE',
    label: 'Triangle',
    className: 'TriangleShape',
    detail:
      'Une forme plus anguleuse qui garde les memes commandes mais change d implementation visuelle.',
    complexity: 3,
  },
  BANNER: {
    code: 'BANNER',
    label: 'Banner',
    className: 'BannerShape',
    detail:
      'Une abstraction plus large, proche d un widget ou d une couche UI, ideale pour voir la variation de moteur.',
    complexity: 4,
  },
}

const renderPresets = {
  VECTOR_ENGINE: {
    code: 'VECTOR_ENGINE',
    label: 'Vector Engine',
    className: 'VectorRenderEngine',
    renderStyle: 'Contours nets, lignes propres et rendu lisible sur toutes les tailles.',
    bridgeBenefit:
      'L abstraction garde la meme forme pendant que l implementation change proprement de moteur.',
  },
  PIXEL_ENGINE: {
    code: 'PIXEL_ENGINE',
    label: 'Pixel Engine',
    className: 'PixelRenderEngine',
    renderStyle: 'Blocs retro, grille marquee et rendu arcade a faible resolution.',
    bridgeBenefit:
      'Bridge injecte un moteur retro sans reecrire la logique metier de la forme.',
  },
  GLOW_ENGINE: {
    code: 'GLOW_ENGINE',
    label: 'Glow Engine',
    className: 'GlowRenderEngine',
    renderStyle: 'Aura lumineuse, halo dynamique et accent fort sur la presence visuelle.',
    bridgeBenefit:
      'Une nouvelle implementation se branche sans exploser le nombre de sous-classes.',
  },
}

function createStep(index, stageCode, title, actorLabel, detail, abstractionStable, implementationReusable) {
  return {
    index,
    stageCode,
    title,
    actorLabel,
    detail,
    abstractionStable,
    implementationReusable,
  }
}

function buildVisualization(useBridge, shape, render, objectName) {
  return {
    nodes: [
      { id: 'client', label: objectName, type: 'client', data: { detail: 'asks render()' } },
      { id: 'abstraction', label: shape.className, type: 'context', data: { detail: shape.label, active: true } },
      {
        id: 'bridge',
        label: useBridge ? 'RenderEngine bridge' : 'ConcreteComboSubclass',
        type: 'cluster',
        data: { detail: useBridge ? 'runtime binding' : 'hard-coded pair' },
      },
      { id: 'implementation', label: render.className, type: 'component', data: { detail: render.label } },
      {
        id: 'result',
        label: useBridge ? 'Flexible rendering' : 'Rigid hierarchy',
        type: 'output',
        data: { message: useBridge ? render.renderStyle : 'shape + engine fused together' },
      },
    ],
    edges: [
      { from: 'client', to: 'abstraction', label: 'render' },
      { from: 'abstraction', to: 'bridge', label: useBridge ? 'delegates' : 'extends combo' },
      { from: 'bridge', to: 'implementation', label: useBridge ? 'calls engine' : 'hard-coded render' },
      { from: 'implementation', to: 'result', label: useBridge ? 'draw' : 'single path' },
    ],
  }
}

export default function executeBridgePattern(parameters) {
  const mode = `${parameters.mode ?? 'WITH_BRIDGE'}`.trim().toUpperCase()
  const useBridge = mode !== 'WITHOUT_BRIDGE'
  const shape = shapePresets[`${parameters.shapeCode ?? 'CIRCLE'}`.trim().toUpperCase()] ?? shapePresets.CIRCLE
  const render = renderPresets[`${parameters.renderCode ?? 'VECTOR_ENGINE'}`.trim().toUpperCase()] ?? renderPresets.VECTOR_ENGINE
  const objectName = `${parameters.objectName ?? ''}`.trim() || 'Switch Engine'
  const combinationCount = 9
  const subclassCount = useBridge ? 7 : combinationCount

  const steps = [
    createStep(
      1,
      'ABSTRACTION',
      'Selection de la forme',
      shape.className,
      `${shape.label} porte la logique haut niveau : resize, describe, render().`,
      true,
      useBridge,
    ),
    createStep(
      2,
      'IMPLEMENTATION',
      'Selection du moteur',
      render.className,
      `${render.label} fournit le style concret : ${render.renderStyle}`,
      useBridge,
      true,
    ),
    createStep(
      3,
      'BIND',
      'Assemblage runtime',
      useBridge ? 'Shape(renderEngine)' : 'ConcreteComboSubclass',
      useBridge
        ? 'L abstraction recoit son moteur au runtime et reste ouverte a d autres implementations.'
        : `Sans Bridge, la combinaison ${shape.label} + ${render.label} force une sous-classe concrete dediee.`,
      useBridge,
      useBridge,
    ),
    createStep(
      4,
      'RENDER',
      'Rendu final',
      objectName,
      useBridge
        ? render.bridgeBenefit
        : 'Chaque nouveau moteur multiplie les variantes de formes et grossit la hierarchie concrete.',
      useBridge,
      useBridge,
    ),
  ]

  return {
    patternCode: 'bridge',
    summary: useBridge
      ? 'Bridge separe Shape de RenderEngine. La forme garde son API et change simplement d implementation concrete au runtime.'
      : 'Sans Bridge, chaque combinaison forme + moteur pousse vers une sous-classe concrete differente. La hierarchie grossit vite et le couplage devient rigide.',
    logs: [
      `${objectName} choisit ${shape.label} comme abstraction.`,
      `Le rendu cible utilise ${render.label}.`,
      useBridge
        ? `Bridge injecte ${render.className} dans ${shape.className} sans changer l abstraction.`
        : 'La combinaison doit etre codee dans une classe concrete dediee pour relier forme et rendu.',
      useBridge
        ? render.bridgeBenefit
        : 'Le nombre de variantes explose quand on multiplie les formes et les moteurs.',
    ],
    output: {
      mode,
      modeLabel: useBridge ? 'Avec Bridge' : 'Sans Bridge',
      objectName,
      shapeCode: shape.code,
      shapeLabel: shape.label,
      shapeClassName: shape.className,
      shapeDetail: shape.detail,
      renderCode: render.code,
      renderLabel: render.label,
      renderClassName: render.className,
      renderStyle: render.renderStyle,
      bridgeBenefit: render.bridgeBenefit,
      abstractionStable: useBridge,
      implementationReusable: useBridge,
      subclassCount,
      combinationCount,
      stepCount: steps.length,
      resultLabel: useBridge ? 'Bridge linked' : 'Subclass explosion',
      steps,
    },
    visualization: buildVisualization(useBridge, shape, render, objectName),
  }
}
