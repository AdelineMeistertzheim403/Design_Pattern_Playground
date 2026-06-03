export const AUTH_USER_STORAGE_KEY = 'dpp_auth_user'

export const typeLabels = {
  CREATIONAL: 'Création',
  STRUCTURAL: 'Structure',
  BEHAVIORAL: 'Comportement',
}

export const complexityLabels = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
}

export const useCaseCategoryLabels = {
  CREATION: 'Création & assemblage',
  COMMUNICATION: 'Communication & orchestration',
  FLOW: 'Flux, état & commandes',
  COMPOSITION: 'Adaptation & composition',
  OPTIMISATION: 'Analyse & optimisation',
  INFRA: 'Accès & services globaux',
}

export const statusMap = {
  loading: {
    label: 'Connexion en cours',
    tone: 'bg-amber-100 text-amber-900 ring-amber-300',
    message: "Le frontend tente d'utiliser l'API dynamique du backend.",
  },
  connected: {
    label: 'Moteur backend actif',
    tone: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
    message: "Schémas, metadata, démo runtime et authentification proviennent du backend Spring Boot.",
  },
  fallback: {
    label: 'Mode local',
    tone: 'bg-stone-200 text-stone-800 ring-stone-300',
    message: "Le front dégrade sur des démos locales tant que l'API n'est pas joignable. L'authentification est alors désactivée.",
  },
}

export const patternFieldUi = {
  composite: {
    extraLeafCount: {
      min: 0,
      max: 8,
      step: 1,
      unitLabel: 'feuilles',
      hint: "Ajoute des feuilles supplémentaires pour densifier l'arbre et vérifier si le parcours couvre encore tous les descendants.",
    },
  },
  flyweight: {
    objectCount: {
      min: 100,
      max: 10000,
      step: 100,
      unitLabel: 'objets',
      hint: "Monte jusqu'à 10 000 pour observer l'impact du pattern sur la taille de la foule.",
    },
    sharedVariantCount: {
      min: 1,
      max: 12,
      step: 1,
      unitLabel: 'variantes',
      hint: "Ces variantes représentent les états intrinsèques que le moteur peut partager.",
    },
  },
  prototype: {
    cloneCount: {
      min: 2,
      max: 6,
      step: 1,
      unitLabel: 'clones',
      hint: "Monte le nombre de clones pour rendre la différence entre copie profonde et copie superficielle encore plus visible.",
    },
  },
}
