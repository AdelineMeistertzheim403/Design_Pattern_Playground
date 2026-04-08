export const emptyPatternSchema = {
  fields: [],
}

export const defaultLearningContent = {
  strapline: 'Observe le contrat commun, le role de chaque objet et ce qui change a l execution.',
  intuition:
    "Le pattern deplace une responsabilite cle dans un point de variation stable. L enjeu n est pas de memoriser un nom, mais de comprendre ce qu on rend flexible.",
  readingGuide:
    "Lis la scene de gauche a droite, puis compare-la au diagramme UML. La scene raconte le comportement runtime, le diagramme UML montre la structure des classes.",
  studentAngle:
    "Concentre-toi sur les roles et sur le flux des messages entre objets avant de descendre dans le detail du code.",
  developerAngle:
    "Cherche surtout le point de couplage qui disparait et la dependance qui devient abstraite.",
  playfulPrompt:
    "Change les parametres, relance la demo et verifie quelle partie du systeme varie vraiment.",
  steps: [
    'Identifier les roles du pattern.',
    "Observer ce qui est configurable dans l interface.",
    "Comparer le comportement runtime avec l UML.",
    "Faire le lien avec un cas d usage reel.",
  ],
  glossary: [
    {
      term: 'Runtime',
      definition: "Ce qui se passe pendant l execution de l application.",
    },
    {
      term: 'Contrat',
      definition: "L interface ou l abstraction sur laquelle le reste du code s appuie.",
    },
  ],
}
