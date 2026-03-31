const defaultLearningContent = {
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

export const patternLearningContent = {
  factory: {
    strapline: 'Le client demande un produit, la fabrique choisit la bonne classe concrete.',
    intuition:
      "Factory Method sert a centraliser la creation. Le client ne sait pas quelle classe concrete est instanciee, il depend seulement du type retourne.",
    readingGuide:
      "Dans la scene, suis la requete du client vers la factory, puis la creation du produit. Dans l UML, regarde comment la fabrique depend du produit abstrait et non des usages du client.",
    studentAngle:
      "Ce pattern t apprend a separer le moment ou on choisit une implementation du moment ou on l utilise.",
    developerAngle:
      "C est utile des que des branches de creation commencent a se repeter dans plusieurs services ou composants.",
    playfulPrompt:
      "Bascule entre CAR et BIKE et observe ce qui change: le produit concret, pas la facon de demander sa creation.",
    steps: [
      'Le client exprime un besoin.',
      'La factory decide quelle implementation creer.',
      "Un produit concret est instancie.",
      "Le client recupere un contrat stable au lieu d un constructeur direct.",
    ],
    glossary: [
      {
        term: 'Creator',
        definition: "Objet responsable de la creation du produit.",
      },
      {
        term: 'Concrete Product',
        definition: "Implementation concrete creee par la factory.",
      },
    ],
  },
  strategy: {
    strapline: 'Le contexte garde le meme workflow, mais l algorithme peut changer a la demande.',
    intuition:
      "Strategy encapsule plusieurs comportements interchangeables. On choisit une strategie au runtime au lieu de multiplier les conditions dans le contexte.",
    readingGuide:
      "Dans la scene, le contexte reste identique pendant que la strategie active change. Dans l UML, repere l interface commune et les strategies concretes qui l implementent.",
    studentAngle:
      "Ce pattern est ideal pour comprendre qu un comportement peut devenir un objet a part entiere.",
    developerAngle:
      "Utilise-le quand les if / switch sur des comportements explosent ou quand tu veux rendre un workflow testable et extensible.",
    playfulPrompt:
      "Change la strategie de paiement et observe que seul l algorithme varie, pas le contexte qui l orchestre.",
    steps: [
      'Le contexte recoit une strategie compatible avec le meme contrat.',
      'Le contexte delegue le travail a cette strategie.',
      "La strategie concrete applique son algorithme.",
      "Le resultat revient sans que le contexte change de structure.",
    ],
    glossary: [
      {
        term: 'Context',
        definition: "Objet qui utilise une strategie sans connaitre son implementation detaillee.",
      },
      {
        term: 'Strategy',
        definition: "Contrat commun pour plusieurs algorithmes interchangeables.",
      },
    ],
  },
  observer: {
    strapline: 'Un evenement unique part du sujet et se propage automatiquement a tous les abonnes.',
    intuition:
      "Observer relie un sujet a plusieurs dependants. Quand le sujet change, tous les observers sont prevenus sans que le sujet connaisse leur logique interne.",
    readingGuide:
      "Dans la scene, regarde comment le sujet publie un evenement puis comment chaque observer recoit la notification. Dans l UML, observe la collection d observers et l interface commune de notification.",
    studentAngle:
      "C est un excellent pattern pour comprendre la diffusion d evenements, les abonnements et le decouplage entre emetteur et recepteurs.",
    developerAngle:
      "On le retrouve dans les event buses, les listeners UI, les hooks, les webhooks ou les mecanismes de synchronisation entre modules.",
    playfulPrompt:
      "Ajoute, retire ou renomme des observers puis relance la demo pour voir comment le sujet reste stable pendant que le reseau d abonnes evolue.",
    steps: [
      'Le sujet existe sans connaitre les details de ses abonnes.',
      'Des observers s abonnent au sujet via un contrat commun.',
      'Le sujet emet un evenement.',
      'Chaque observer recoit la notification et reagit a sa facon.',
    ],
    glossary: [
      {
        term: 'Subject',
        definition: "Source de l evenement qui maintient la liste des observers.",
      },
      {
        term: 'Observer',
        definition: "Abonne qui recoit une mise a jour quand le sujet notifie.",
      },
    ],
  },
}

export function getPatternLearningContent(code) {
  return patternLearningContent[code] ?? defaultLearningContent
}
