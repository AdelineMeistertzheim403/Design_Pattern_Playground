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
  singleton: {
    strapline: 'Plusieurs clients pointent vers une seule instance, donc la configuration reste coherente partout.',
    intuition:
      "Singleton sert a centraliser un etat ou un service global quand plusieurs parties de l application doivent partager exactement la meme reference.",
    readingGuide:
      "Regarde d abord combien d instances reelles sont presentes dans la scene. Puis observe si la modification de configuration se propage a tous les clients ou reste enfermee dans une copie locale.",
    studentAngle:
      "Le point pedagogique n est pas seulement l unicite, mais la coherence des donnees quand plusieurs consommateurs consultent le meme service.",
    developerAngle:
      "C est pratique pour une configuration globale ou un logger, mais il faut rester prudent car cela introduit aussi un etat global difficile a tester.",
    playfulPrompt:
      "Bascule entre avec et sans Singleton et verifie ce qui arrive quand le premier client modifie une valeur centrale.",
    steps: [
      'Plusieurs clients demandent un service de configuration.',
      'Le premier client applique une mise a jour.',
      'Les autres clients lisent ensuite la configuration visible.',
      'Comparer la coherence du systeme avec une instance unique puis avec des copies independantes.',
    ],
    glossary: [
      {
        term: 'Instance unique',
        definition: "Objet unique partage par tout le systeme pour centraliser un etat ou une responsabilite.",
      },
      {
        term: 'Etat global',
        definition: "Donnee visible depuis plusieurs endroits de l application et dont la coherence doit etre maitrisee.",
      },
    ],
  },
  state: {
    strapline: 'Le contexte change de comportement en changeant simplement d etat courant.',
    intuition:
      "State remplace un gros bloc de conditions par plusieurs objets d etat. Chaque etat connait les transitions qu il autorise et le contexte delegue la reaction courante.",
    readingGuide:
      "Observe d abord l etat actif dans la scene, puis suis la timeline des actions. Les transitions acceptees deplacent le personnage, les actions ignorees montrent les limites de chaque etat.",
    studentAngle:
      "Le point cle est de voir qu on ne raisonne plus en if imbriques, mais en comportements locaux a chaque etat.",
    developerAngle:
      "Ce pattern devient tres utile quand un workflow, une UI ou un personnage possede beaucoup de transitions et commence a accumuler des conditions difficiles a maintenir.",
    playfulPrompt:
      "Change l etat initial puis joue avec une sequence d actions atypique pour voir quelles transitions sont refusees.",
    steps: [
      'Le contexte demarre avec un etat initial.',
      'Chaque action est deleguee a l etat courant.',
      'L etat decide soit une transition, soit un refus.',
      'Le contexte adopte ensuite le nouvel etat et expose ses prochaines actions possibles.',
    ],
    glossary: [
      {
        term: 'Etat concret',
        definition: "Classe qui encapsule les transitions autorisees et le comportement associe a un etat precis.",
      },
      {
        term: 'Transition',
        definition: "Passage explicite d un etat vers un autre apres une action ou un evenement.",
      },
    ],
  },
  flyweight: {
    strapline: 'Des milliers d objets restent affichables parce qu ils partagent les memes donnees lourdes.',
    intuition:
      "Flyweight separe ce qui peut etre partage de ce qui doit rester specifique a chaque objet. L etat intrinsique est mutualise, l etat extrinseque reste porte par chaque element a l ecran.",
    readingGuide:
      "Observe d abord la foule d objets dans la scene, puis compare le nombre d objets affiches au nombre d instances reelles. Dans l UML, repere la factory de flyweights, l objet partage et l etat extrinseque qui reste cote client.",
    studentAngle:
      "Le declic pedagogique est simple : beaucoup d objets visibles ne veut pas dire beaucoup d objets lourds en memoire.",
    developerAngle:
      "Le pattern devient pertinent quand plusieurs milliers d elements repetent les memes textures, meshes, glyphes ou regles de rendu et que la duplication commence a couter cher.",
    playfulPrompt:
      "Monte brutalement le nombre d objets, coupe puis reactive Flyweight et regarde comment les instances reelles et la memoire simulee se compriment.",
    steps: [
      'Identifier les donnees communes qui peuvent etre partagees.',
      'Distinguer les variations portees par chaque objet a l execution.',
      'Comparer la memoire sans pattern et avec Flyweight.',
      'Relier cette optimisation a un cas reel de rendu massif ou de catalogue repetitif.',
    ],
    glossary: [
      {
        term: 'Etat intrinsique',
        definition: "Partie partageable de l objet, typiquement la texture, la forme ou une configuration stable.",
      },
      {
        term: 'Etat extrinseque',
        definition: "Partie variable fournie par le client, comme la position, la taille, la rotation ou le contexte courant.",
      },
    ],
  },
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
