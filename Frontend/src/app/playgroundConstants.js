export const AUTH_USER_STORAGE_KEY = 'dpp_auth_user'

export const typeLabels = {
  CREATIONAL: 'Creation',
  STRUCTURAL: 'Structure',
  BEHAVIORAL: 'Comportement',
}

export const complexityLabels = {
  BEGINNER: 'Debutant',
  INTERMEDIATE: 'Intermediaire',
  ADVANCED: 'Avance',
}

export const useCaseCategoryLabels = {
  CREATION: 'Creation & assemblage',
  COMMUNICATION: 'Communication & orchestration',
  FLOW: 'Flux, etat & commandes',
  COMPOSITION: 'Adaptation & composition',
  OPTIMISATION: 'Analyse & optimisation',
  INFRA: 'Acces & services globaux',
}

export const statusMap = {
  loading: {
    label: 'Connexion en cours',
    tone: 'bg-amber-100 text-amber-900 ring-amber-300',
    message: "Le frontend tente d utiliser l API dynamique du backend.",
  },
  connected: {
    label: 'Moteur backend actif',
    tone: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
    message: "Schemas, metadata, demo runtime et authentification proviennent du backend Spring Boot.",
  },
  fallback: {
    label: 'Mode local',
    tone: 'bg-stone-200 text-stone-800 ring-stone-300',
    message: "Le front degrade sur des demos locales tant que l API n est pas joignable. L authentification est alors desactivee.",
  },
}

export const patternFieldUi = {
  flyweight: {
    objectCount: {
      min: 100,
      max: 10000,
      step: 100,
      unitLabel: 'objets',
      hint: "Monte jusqu a 10 000 pour observer l impact du pattern sur la taille de la foule.",
    },
    sharedVariantCount: {
      min: 1,
      max: 12,
      step: 1,
      unitLabel: 'variantes',
      hint: "Ces variantes representent les etats intrinsiques que le moteur peut partager.",
    },
  },
  prototype: {
    cloneCount: {
      min: 2,
      max: 6,
      step: 1,
      unitLabel: 'clones',
      hint: "Monte le nombre de clones pour rendre la difference entre copie profonde et copie superficielle encore plus visible.",
    },
  },
}
