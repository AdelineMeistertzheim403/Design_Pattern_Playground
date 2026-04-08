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
  mediator: {
    strapline: 'Les participants ne se parlent plus tous directement : un hub central orchestre les messages.',
    intuition:
      "Mediator remplace un reseau de dependances croisées par un point de coordination unique. Chaque colleague depend du mediator, pas de tous les autres objets du systeme.",
    readingGuide:
      "Observe d abord le trajet du message dans la scene, puis compare avec et sans mediator. L UML montre le hub central, la scene runtime montre la reduction du couplage.",
    studentAngle:
      "Le declic pedagogique est simple : les joueurs discutent toujours entre eux, mais plus aucun ne porte la logique complete du reseau.",
    developerAngle:
      "Le pattern devient utile pour des chats, des interfaces riches, des salles de jeu, des dashboards ou des workflows ou beaucoup d objets doivent se coordonner.",
    playfulPrompt:
      "Ajoute des participants, change l expediteur et compare la difference entre des messages directs et un hub de diffusion central.",
    steps: [
      'Le colleague expediteur envoie un message.',
      'Le mediator central recoit cet evenement.',
      'Le mediator choisit les destinataires a notifier.',
      'Les autres colleagues recoivent le message sans connaitre toute la topologie du chat.',
    ],
    glossary: [
      {
        term: 'Mediator',
        definition: 'Objet central qui coordonne les interactions entre plusieurs colleagues.',
      },
      {
        term: 'Colleague',
        definition: 'Participant du systeme qui communique via le mediator plutot que directement avec tous les autres.',
      },
    ],
  },
  chain: {
    strapline: 'La requete traverse une suite de maillons autonomes qui peuvent la laisser passer, la bloquer ou la traiter.',
    intuition:
      "Chain of Responsibility decoupe un pipeline en handlers specialises. Chaque maillon connait son propre test et delegue au suivant au lieu d encombrer un controller unique de if / else.",
    readingGuide:
      "Observe d abord le trajet de la requete dans la scene, puis regarde quel handler a stoppe ou traite le flux. L UML montre la liaison entre handlers, la scene raconte le passage runtime.",
    studentAngle:
      "Le declic pedagogique est de voir qu une requete ne connait pas son destinataire final : elle avance maillon apres maillon jusqu a ce qu un handler prenne la main.",
    developerAngle:
      "Le pattern devient pertinent dans des middlewares HTTP, des pipelines de validation, des workflows de moderation ou des circuits de support multi-niveaux.",
    playfulPrompt:
      "Change l etat du token ou du payload, relance la demo et regarde a quel endroit la requete est stoppee ou laissee passer.",
    steps: [
      'Le client envoie une requete au premier handler.',
      'Chaque handler decide localement si la requete peut continuer.',
      'La chaine s arrete des qu un maillon rejette ou traite le flux.',
      'Comparer ce comportement avec un controller monolithique plein de conditions.',
    ],
    glossary: [
      {
        term: 'Handler',
        definition: 'Maillon specialise qui peut verifier, traiter ou deleguer la requete au suivant.',
      },
      {
        term: 'Propagation',
        definition: 'Passage de la requete d un maillon a l autre jusqu a une decision finale.',
      },
    ],
  },
  command: {
    strapline: 'Chaque action devient un objet autonome, donc on peut la declencher, l historiser, l annuler et la rejouer.',
    intuition:
      "Command separe le bouton ou l interface qui demande une action de l objet qui sait reellement l executer. Ce decouplage rend l historique et undo / redo naturels.",
    readingGuide:
      "Observe d abord la grille centrale et l etat final du robot. Puis regarde les piles undo / redo et enfin la timeline pour voir a quel moment une action est executee, annulee ou rejouee.",
    studentAngle:
      "Le vrai declic est de voir qu une action n est plus juste un clic, mais un objet qu on peut stocker, empiler et reexecuter.",
    developerAngle:
      "Le pattern devient pertinent pour un editeur, un jeu tactique, des macros, une file d actions ou tout systeme qui doit historiser des operations reversibles.",
    playfulPrompt:
      "Compare avec et sans Command, puis regarde ce qu il reste possible quand tu veux faire undo ou redo.",
    steps: [
      'Le client construit une commande concrete.',
      'L invoker declenche cette commande sans connaitre le detail du receiver.',
      'Le receiver applique la vraie mutation sur son etat.',
      'L historique rend ensuite undo / redo possibles.',
    ],
    glossary: [
      {
        term: 'Invoker',
        definition: "Objet qui declenche la commande et peut maintenir l historique sans connaitre le detail du travail metier.",
      },
      {
        term: 'Receiver',
        definition: "Objet qui sait vraiment effectuer l action demandee par la commande.",
      },
    ],
  },
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
  decorator: {
    strapline: 'Chaque power-up enveloppe le composant precedent et enrichit le build sans toucher a la classe d origine.',
    intuition:
      "Decorator evite de creer une classe par combinaison possible. A la place, on compose dynamiquement des wrappers qui ajoutent chacun une responsabilite claire.",
    readingGuide:
      "Lis d abord la pile de wrappers du bas vers le haut, puis regarde le build final a droite. L UML montre la structure Component / Decorator, la scene montre l empilement runtime.",
    studentAngle:
      "Le declic pedagogique est de voir qu on n a pas besoin d une classe PersonnageFeuBouclierVitesse pour obtenir ce resultat.",
    developerAngle:
      "Ce pattern devient interessant quand tu veux enrichir un composant par options cumulables, sans exploser les branches d heritage ni dupliquer la logique.",
    playfulPrompt:
      "Ajoute, retire ou reordonne mentalement les power-ups et observe comment les stats evoluent couche apres couche.",
    steps: [
      'Identifier le composant de base et ses stats initiales.',
      'Ajouter un premier decorator qui wrap le composant.',
      'Empiler plusieurs decorators pour cumuler les effets.',
      'Comparer le build final avec ce qu il aurait fallu coder sans pattern.',
    ],
    glossary: [
      {
        term: 'Component',
        definition: "Contrat commun partage par l objet de base et par tous les decorators.",
      },
      {
        term: 'Wrapping',
        definition: "Fait d envelopper un objet dans un autre pour enrichir son comportement a l execution.",
      },
    ],
  },
  builder: {
    strapline: 'Le produit se construit morceau par morceau au lieu de sortir d un constructeur geant opaque.',
    intuition:
      "Builder separe le processus de construction du produit final. Le client exprime un besoin, le director orchestre l ordre, et le builder concret pose chaque brique clairement.",
    readingGuide:
      "Observe d abord la progression des etapes dans la scene, puis regarde l objet se completer. L UML montre le trio Client / Director / Builder, la scene runtime montre la construction progressive.",
    studentAngle:
      "Le declic pedagogique est de voir qu on ne cree pas un objet complexe en une seule ligne obscure : on le fabrique par etapes lisibles.",
    developerAngle:
      "Builder devient utile des qu un constructeur accumule trop de parametres, que l ordre de creation compte, ou qu on veut produire plusieurs variantes d un meme objet.",
    playfulPrompt:
      "Change le type d objet, rejoue l assemblage puis compare avec et sans Builder pour voir quand le produit apparait et comment les etapes restent lisibles.",
    steps: [
      'Le client demande un type de build et des options.',
      'Le Director impose un ordre de construction stable.',
      'Le Builder concret pose chaque etape une a une.',
      'Le produit final est recupere avec une structure complete et un processus lisible.',
    ],
    glossary: [
      {
        term: 'Director',
        definition: "Objet qui orchestre l ordre des etapes de construction sans contenir le produit final.",
      },
      {
        term: 'Builder concret',
        definition: "Implementation qui assemble reellement le produit a chaque etape.",
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
