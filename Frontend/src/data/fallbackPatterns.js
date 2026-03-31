export const fallbackPatterns = [
  {
    slug: 'factory-method',
    name: 'Factory Method',
    category: 'Creation',
    intent: "Delegue la creation d objets a une fabrique pour limiter le couplage dans l application.",
  },
  {
    slug: 'adapter',
    name: 'Adapter',
    category: 'Structure',
    intent: "Transforme une interface existante pour qu elle puisse etre consommee sans fuite du legacy.",
  },
  {
    slug: 'decorator',
    name: 'Decorator',
    category: 'Structure',
    intent: "Ajoute des responsabilites de facon dynamique sans exploser la hierarchie des classes.",
  },
  {
    slug: 'observer',
    name: 'Observer',
    category: 'Comportement',
    intent: "Diffuse les changements d etat vers plusieurs abonnes tout en gardant les participants decouples.",
  },
  {
    slug: 'strategy',
    name: 'Strategy',
    category: 'Comportement',
    intent: "Selectionne dynamiquement un comportement parmi plusieurs algorithmes equivalents.",
  },
]

const fallbackPatternDetails = {
  'factory-method': {
    slug: 'factory-method',
    name: 'Factory Method',
    category: 'Creation',
    intent: "Delegue la creation d un objet a une fabrique specialisee pour eviter les constructions dispersees.",
    backendFocus:
      "Une factory peut choisir la bonne implementation de service ou de demo a exposer dans l API Spring.",
    frontendFocus:
      "React peut mapper un type de pattern vers le composant adequat pour afficher un atelier ou une fiche detaillee.",
    notes:
      "Montre bien ou placer les points d extension quand le catalogue grossit et qu un simple if else devient fragile.",
  },
  adapter: {
    slug: 'adapter',
    name: 'Adapter',
    category: 'Structure',
    intent: "Transforme une interface existante en interface attendue par le client.",
    backendFocus:
      "Tres utile pour encapsuler une source externe ou du legacy derriere un contrat stable expose par l application.",
    frontendFocus:
      "Permet de normaliser des payloads heterogenes avant d alimenter un composant React unique.",
    notes:
      "Le bon reflexe est de laisser l adaptation a la frontiere du systeme pour garder le coeur lisible.",
  },
  decorator: {
    slug: 'decorator',
    name: 'Decorator',
    category: 'Structure',
    intent: "Compose des responsabilites additionnelles autour d un objet sans creer de sous classes specialisees.",
    backendFocus:
      "Peut servir a rajouter cache, tracing, metrics ou logs autour d un service existant sans toucher au coeur metier.",
    frontendFocus:
      "Un composant de base peut etre enrichi avec badges, overlays ou instrumentation de tracking de facon composee.",
    notes:
      "A montrer quand plusieurs comportements optionnels doivent s empiler avec un cout faible en maintenance.",
  },
  observer: {
    slug: 'observer',
    name: 'Observer',
    category: 'Comportement',
    intent: "Diffuse un changement d etat a plusieurs abonnes sans lien direct entre l emetteur et les recepteurs.",
    backendFocus:
      "Se traduit bien avec des evenements de domaine, des listeners Spring ou une propagation vers une file de messages.",
    frontendFocus:
      "Correspond naturellement aux stores, subscriptions, websockets ou hooks qui notifient plusieurs zones de l interface.",
    notes:
      "L enjeu n est pas juste la notification mais aussi la maitrise de la propagation et des effets secondaires.",
  },
  strategy: {
    slug: 'strategy',
    name: 'Strategy',
    category: 'Comportement',
    intent: "Choisit l algorithme le plus adapte selon le contexte sans faire fuiter la logique de selection au client.",
    backendFocus:
      "Le backend fournit deja deux strategies de preview pour une meme fiche: text et checklist.",
    frontendFocus:
      "Le front peut basculer de mode de lecture sans casser la navigation ni recrire tout le composant de detail.",
    notes:
      "C est le meilleur point de depart pour une demo car l impact du pattern est visible des la premiere interaction.",
  },
}

const fallbackPreviews = {
  'factory-method': {
    text: [
      "Intent: centraliser la creation pour eviter des constructions directes partout dans le code.",
      "Backend: choisir la bonne implementation a exposer selon le type de demo demande.",
      "Frontend: router un pattern vers le bon composant React sans conditionnels disperses.",
    ],
    checklist: [
      'Identifier les objets qui changent plus vite que leur usage.',
      'Creer une fabrique unique pour produire la bonne implementation.',
      'Injecter cette fabrique la ou le client a besoin d un contrat stable.',
      'Comparer ensuite le code avant et apres centralisation.',
    ],
  },
  adapter: {
    text: [
      "Intent: convertir une interface source en contrat exploitable par le client final.",
      "Backend: encapsuler une API externe ou un legacy service dans un composant stable.",
      "Frontend: homogeniser les donnees avant rendu pour garder les composants simples.",
    ],
    checklist: [
      'Fixer l interface cible attendue par le client.',
      'Lire le contrat reel de la source existante.',
      'Faire la traduction dans une couche dediee.',
      'Tester explicitement les transformations et les cas limites.',
    ],
  },
  decorator: {
    text: [
      "Intent: enrichir un objet par composition plutot que par heritages specialises.",
      "Backend: empiler cache, metrics ou logs autour d un service central.",
      "Frontend: entourer un composant principal de badges, wrappers et telemetry.",
    ],
    checklist: [
      'Identifier le composant de base a conserver simple.',
      'Extraire chaque responsabilite optionnelle dans un decorator.',
      'Composer seulement ce qui est necessaire pour la demo courante.',
      'Montrer le cout de maintenance evite face a une arborescence de classes.',
    ],
  },
  observer: {
    text: [
      "Intent: publier des changements a plusieurs abonnes sans couplage fort.",
      "Backend: propager un evenement metier vers des listeners ou integrations secondaires.",
      "Frontend: notifier plusieurs panneaux React d un changement commun d etat.",
    ],
    checklist: [
      'Definir qui emet et qui observe.',
      'Stabiliser le contrat d evenement ou de notification.',
      'Tracer les effets secondaires pour eviter les cascades difficiles a lire.',
      'Comparer avec un appel direct pour montrer le gain de decouplage.',
    ],
  },
  strategy: {
    text: [
      "Intent: fournir plusieurs variantes d un meme comportement et laisser le contexte choisir.",
      "Backend: changer de formatter sans toucher au service de catalogue.",
      "Frontend: basculer entre vue narrative et checklist tout en gardant la meme fiche detail.",
    ],
    checklist: [
      'Lister les variantes de comportement a presenter.',
      'Donner un contrat commun a toutes les strategies.',
      'Resoudre la bonne implementation via un point unique de selection.',
      'Rendre l impact visible en changeant seulement le mode de preview.',
    ],
  },
}

export function getFallbackPatternDetail(slug) {
  return fallbackPatternDetails[slug] ?? fallbackPatternDetails.strategy
}

export function getFallbackPreview(slug, format) {
  const patternPreviews = fallbackPreviews[slug] ?? fallbackPreviews.strategy
  return patternPreviews[format] ?? patternPreviews.text
}
