// Palette de couleurs associee aux stereotypes UML.

export function getTone(box) {
  const stereotype = box.stereotype?.toLowerCase?.() ?? ''

  if (stereotype.includes('concrete')) {
    return {
      fill: 'rgba(231, 198, 167, 0.92)',
      stroke: '#c25737',
      text: '#5f2d20',
    }
  }

  if (stereotype === 'context') {
    return {
      fill: 'rgba(211, 236, 230, 0.94)',
      stroke: '#246b5e',
      text: '#153f38',
    }
  }

  if (stereotype === 'creator') {
    return {
      fill: 'rgba(214, 228, 241, 0.94)',
      stroke: '#426c8d',
      text: '#27465f',
    }
  }

  if (stereotype === 'subject') {
    return {
      fill: 'rgba(219, 239, 228, 0.94)',
      stroke: '#2e7a56',
      text: '#1e4f38',
    }
  }

  if (stereotype === 'observer') {
    return {
      fill: 'rgba(245, 231, 201, 0.94)',
      stroke: '#a16b22',
      text: '#624313',
    }
  }

  if (stereotype === 'factory') {
    return {
      fill: 'rgba(214, 228, 241, 0.94)',
      stroke: '#426c8d',
      text: '#27465f',
    }
  }

  if (stereotype === 'client') {
    return {
      fill: 'rgba(211, 236, 230, 0.94)',
      stroke: '#246b5e',
      text: '#153f38',
    }
  }

  if (stereotype === 'extrinsic state') {
    return {
      fill: 'rgba(245, 227, 210, 0.96)',
      stroke: '#c25737',
      text: '#5f2d20',
    }
  }

  if (stereotype === 'flyweight') {
    return {
      fill: 'rgba(255, 244, 220, 0.96)',
      stroke: '#9a7130',
      text: '#5c4218',
    }
  }

  if (stereotype === 'singleton') {
    return {
      fill: 'rgba(36, 31, 24, 0.96)',
      stroke: '#241f18',
      text: '#fff8ee',
    }
  }

  if (stereotype === 'state') {
    return {
      fill: 'rgba(255, 244, 220, 0.96)',
      stroke: '#9a7130',
      text: '#5c4218',
    }
  }

  if (stereotype === 'global state') {
    return {
      fill: 'rgba(245, 227, 210, 0.96)',
      stroke: '#c25737',
      text: '#5f2d20',
    }
  }

  if (stereotype === 'strategy' || stereotype === 'product') {
    return {
      fill: 'rgba(255, 244, 220, 0.96)',
      stroke: '#9a7130',
      text: '#5c4218',
    }
  }

  if (box.tone === 'teal') {
    return {
      fill: 'rgba(211, 236, 230, 0.94)',
      stroke: '#246b5e',
      text: '#153f38',
    }
  }

  if (box.tone === 'accent') {
    return {
      fill: 'rgba(231, 198, 167, 0.92)',
      stroke: '#c25737',
      text: '#5f2d20',
    }
  }

  return {
    fill: 'rgba(255, 249, 239, 0.98)',
    stroke: '#7a5a3f',
    text: '#3d2d20',
  }
}
