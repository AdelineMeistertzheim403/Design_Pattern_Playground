export const emptyPatternSchema = {
  fields: [],
}

export const defaultLearningContent = {
  strapline: "Observe le contrat commun, le rôle de chaque objet et ce qui change à l'exécution.",
  intuition:
    "Le pattern déplace une responsabilité clé dans un point de variation stable. L'enjeu n'est pas de mémoriser un nom, mais de comprendre ce qu'on rend flexible.",
  readingGuide:
    "Lis la scène de gauche à droite, puis compare-la au diagramme UML. La scène raconte le comportement runtime, le diagramme UML montre la structure des classes.",
  studentAngle:
    "Concentre-toi sur les rôles et sur le flux des messages entre objets avant de descendre dans le détail du code.",
  developerAngle:
    "Cherche surtout le point de couplage qui disparaît et la dépendance qui devient abstraite.",
  playfulPrompt:
    "Change les paramètres, relance la démo et vérifie quelle partie du système varie vraiment.",
  steps: [
    'Identifier les rôles du pattern.',
    "Observer ce qui est configurable dans l'interface.",
    "Comparer le comportement runtime avec l'UML.",
    "Faire le lien avec un cas d'usage réel.",
  ],
  glossary: [
    {
      term: 'Runtime',
      definition: "Ce qui se passe pendant l'exécution de l'application.",
    },
    {
      term: 'Contrat',
      definition: "L'interface ou l'abstraction sur laquelle le reste du code s'appuie.",
    },
  ],
}
