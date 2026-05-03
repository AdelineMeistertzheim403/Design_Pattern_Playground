import { defineMission, defineMissionGroup } from './builders'

export const completeMissions = defineMissionGroup([
  defineMission({
    id: 'complex-combat-system',
    mode: 'Mission complete',
    difficulty: 'Avance',
    title: 'Complex Combat System',
    description:
      'Le moteur de combat doit gerer des comportements differents et des bonus cumulables. Une seule solution ne suffit pas.',
    context:
      'Un personnage doit pouvoir changer de style d attaque a la demande tout en accumulant des buffs visibles sur ses stats.',
    problems: [
      'Le comportement d attaque varie selon la situation.',
      'Les bonus doivent se cumuler dynamiquement.',
      'Le systeme doit rester evolutif.',
    ],
    objective:
      'Combiner un axe de variation d algorithme avec un axe d enrichissement cumulatif.',
    candidatePatterns: ['strategy', 'decorator', 'singleton', 'factory'],
    expectedPatterns: ['strategy', 'decorator'],
    preferredSimulationPattern: 'decorator',
    simulationOrder: ['strategy', 'decorator'],
    successCriteria: [
      'Le style d attaque peut changer sans casser le contexte.',
      'Les buffs s empilent proprement sur le meme build.',
      'Le systeme reste flexible sans explosion de classes.',
    ],
    patternPrompts: {
      strategy: 'Fait varier l algorithme d attaque.',
      decorator: 'Ajoute des bonus cumulables sur le build.',
      singleton: 'Une instance globale n apporte pas de flexibilite de combat.',
      factory: 'La creation seule ne gere ni les buffs ni le changement d algorithme.',
    },
  }),
  defineMission({
    id: 'massive-multiplayer-world',
    mode: 'Mission complete',
    difficulty: 'Avance',
    title: 'Massive Multiplayer World',
    description:
      'Un monde en ligne affiche des dizaines de milliers d entites et le serveur sature. Il faut optimiser la creation et le partage.',
    context:
      'Le serveur doit instancier arbres, ennemis et objets a grande echelle. Les assets se repetent, et la creation brute devient trop couteuse.',
    problems: [
      'Le volume d entites est massif.',
      'La duplication d etat lourd explose la memoire.',
      'La creation doit rester controlee.',
    ],
    objective:
      'Optimiser a la fois le partage d etat et la creation de nombreuses instances.',
    candidatePatterns: ['flyweight', 'factory', 'singleton', 'builder'],
    expectedPatterns: ['flyweight', 'factory'],
    preferredSimulationPattern: 'flyweight',
    simulationOrder: ['factory', 'flyweight'],
    successCriteria: [
      'Les donnees lourdes sont mutualisees.',
      'La creation des entites reste centralisee et maitrisable.',
      'La simulation montre un systeme plus stable a grande charge.',
    ],
    patternPrompts: {
      flyweight: 'Mutualise les donnees lourdes des objets repetitifs.',
      factory: 'Centralise la creation des instances du monde.',
      singleton: 'Une instance globale n optimise pas la masse d entites.',
      builder: 'Un processus de construction detaille n est pas le probleme principal ici.',
    },
  }),
  defineMission({
    id: 'smart-notification-platform',
    mode: 'Mission complete',
    difficulty: 'Avance',
    title: 'Smart Notification Platform',
    description:
      'Une plateforme doit notifier plusieurs utilisateurs tout en adaptant le canal du message selon le contexte.',
    context:
      'Le produit envoie des alertes par email, SMS ou push. Plusieurs utilisateurs doivent etre prevenus, mais le canal choisi doit pouvoir changer sans toucher au producteur.',
    problems: [
      'Plusieurs recepteurs doivent etre informes.',
      'Le canal de notification doit varier dynamiquement.',
      'La plateforme doit rester extensible.',
    ],
    objective:
      'Combiner diffusion multi-abonnes et variation de canal de livraison.',
    candidatePatterns: ['observer', 'strategy', 'singleton', 'factory'],
    expectedPatterns: ['observer', 'strategy'],
    preferredSimulationPattern: 'observer',
    simulationOrder: ['strategy', 'observer'],
    successCriteria: [
      'Le message se propage a plusieurs destinataires.',
      'Le canal utilise peut changer selon la configuration.',
      'Le systeme reste lisible et evolutif.',
    ],
    patternPrompts: {
      observer: 'Diffuse un evenement a plusieurs abonnes.',
      strategy: 'Fait varier le canal de livraison.',
      singleton: 'Ne gere ni la diffusion ni la variation de canal.',
      factory: 'Ne couvre pas a lui seul la diffusion et la selection de comportement.',
    },
  }),
  defineMission({
    id: 'game-save-system',
    mode: 'Mission complete',
    difficulty: 'Avance',
    title: 'Game Save System',
    description:
      'Le jeu doit sauvegarder des checkpoints et restaurer un etat coherent apres une suite d actions.',
    context:
      'Un joueur enchaine plusieurs actions puis veut revenir a un savepoint fiable. Il faut conserver des snapshots tout en gardant trace des actions appliquees.',
    problems: [
      'Les checkpoints doivent etre restaures proprement.',
      'Les actions runtime doivent rester lisibles.',
      'Le retour arriere ne doit pas casser l encapsulation.',
    ],
    objective:
      'Combiner historique d actions et snapshots d etat pour un rewind fiable.',
    candidatePatterns: ['memento', 'command', 'singleton'],
    expectedPatterns: ['memento', 'command'],
    preferredSimulationPattern: 'memento',
    simulationOrder: ['command', 'memento'],
    successCriteria: [
      'Les actions restent historisees.',
      'Un checkpoint peut etre restaure proprement.',
      'Le retour en arriere ne depend pas d une copie manuelle de tout l etat.',
    ],
    patternPrompts: {
      memento: 'Capture et restaure un etat interne proprement.',
      command: 'Historise et rejoue les actions runtime.',
      singleton: 'Une reference globale ne gere ni snapshots ni historique d actions.',
    },
  }),
  defineMission({
    id: 'modular-ui-system',
    mode: 'Mission complete',
    difficulty: 'Avance',
    title: 'Modular UI System',
    description:
      'Une interface doit rester personnalisable et extensible, avec une structure emboitee et des enrichissements visuels cumulables.',
    context:
      'Le produit assemble des sections, des panneaux et des widgets dans une arborescence UI. Des badges, skins et effets doivent aussi pouvoir se superposer sans casser la structure.',
    problems: [
      'La structure est hierarchique.',
      'Des enrichissements visuels doivent se cumuler.',
      'Le client doit pouvoir traiter toute la structure uniformement.',
    ],
    objective:
      'Combiner structure arborescente et enrichissements runtime autour des composants.',
    candidatePatterns: ['composite', 'decorator', 'factory'],
    expectedPatterns: ['composite', 'decorator'],
    preferredSimulationPattern: 'composite',
    simulationOrder: ['composite', 'decorator'],
    successCriteria: [
      'La structure emboitee reste manipulable uniformement.',
      'Les enrichissements se superposent sans dupliquer les classes.',
      'L interface reste modulaire et evolutive.',
    ],
    patternPrompts: {
      composite: 'Organise la structure en arbre et unifie les operations.',
      decorator: 'Ajoute des enrichissements runtime par couches.',
      factory: 'Peut aider a creer des composants, mais ne suffit pas pour la structure et les layers.',
    },
  }),
  defineMission({
    id: 'secure-api-gateway',
    mode: 'Mission complete',
    difficulty: 'Avance',
    title: 'Secure API Gateway',
    description:
      'Un acces API doit etre protege, valide et journalise sans empiler toute la logique dans un seul bloc de code.',
    context:
      'Une gateway recoit des appels sensibles. Chaque requete doit etre controlee avant de toucher la ressource reelle.',
    problems: [
      'La requete doit passer par plusieurs verifications.',
      'La ressource finale ne doit pas etre exposee directement.',
      'Le pipeline doit rester extensible.',
    ],
    objective:
      'Combiner un pipeline de validation avec un gardien devant la ressource sensible.',
    candidatePatterns: ['chain', 'proxy', 'observer'],
    expectedPatterns: ['chain', 'proxy'],
    preferredSimulationPattern: 'proxy',
    simulationOrder: ['chain', 'proxy'],
    successCriteria: [
      'La requete traverse plusieurs controles specialises.',
      'La ressource finale reste protegee derriere un intermediaire.',
      'Le systeme peut refuser proprement un appel non conforme.',
    ],
    patternPrompts: {
      chain: 'Structure le pipeline de validation en maillons.',
      proxy: 'Protege la ressource sensible derriere un gardien.',
      observer: 'Diffuse des evenements mais ne securise pas la requete.',
    },
  }),
  defineMission({
    id: 'multi-device-control-system',
    mode: 'Mission complete',
    difficulty: 'Avance',
    title: 'Multi-device Control System',
    description:
      'Une app controle TV, lampe et musique. Les actions doivent etre coordonnees sans coupler tous les appareils entre eux.',
    context:
      'Une seule interface declenche plusieurs commandes et un hub de coordination doit synchroniser la reaction des appareils.',
    problems: [
      'Plusieurs appareils doivent reagir ensemble.',
      'Les commandes doivent rester historisables.',
      'Les appareils ne doivent pas tous se connaitre mutuellement.',
    ],
    objective:
      'Combiner coordination centrale et commandes rejouables pour piloter plusieurs appareils.',
    candidatePatterns: ['mediator', 'command', 'singleton'],
    expectedPatterns: ['mediator', 'command'],
    preferredSimulationPattern: 'mediator',
    simulationOrder: ['command', 'mediator'],
    successCriteria: [
      'Les actions sont encapsulees proprement.',
      'La coordination entre appareils passe par un centre unique.',
      'Le systeme reste extensible quand on ajoute un nouveau device.',
    ],
    patternPrompts: {
      mediator: 'Centralise les interactions entre appareils.',
      command: 'Encapsule chaque action de controle.',
      singleton: 'Ne coordonne pas plusieurs appareils ni leurs commandes.',
    },
  }),
  defineMission({
    id: 'dynamic-rendering-engine',
    mode: 'Mission complete',
    difficulty: 'Avance',
    title: 'Dynamic Rendering Engine',
    description:
      'Un moteur graphique doit supporter plusieurs formes et plusieurs moteurs de rendu sans exploser en sous-classes.',
    context:
      'Les objets visuels changent de forme et de moteur de rendu. Le produit veut pouvoir tester de nouvelles combinaisons sans refondre toute la hierarchie.',
    problems: [
      'Deux axes de variation evoluent en meme temps.',
      'Le rendu doit pouvoir changer dynamiquement.',
      'Le moteur doit rester extensible.',
    ],
    objective:
      'Combiner un axe abstraction / implementation avec un axe de variation de comportement.',
    candidatePatterns: ['bridge', 'strategy', 'decorator'],
    expectedPatterns: ['bridge', 'strategy'],
    preferredSimulationPattern: 'bridge',
    simulationOrder: ['strategy', 'bridge'],
    successCriteria: [
      'Les deux axes de variation restent decouples.',
      'Le rendu peut changer sans casser l abstraction.',
      'Le moteur reste flexible pour de nouvelles combinaisons.',
    ],
    patternPrompts: {
      bridge: 'Separe l abstraction visuelle de son moteur concret.',
      strategy: 'Fait varier un choix d algorithme ou de style a l execution.',
      decorator: 'Ajoute des couches mais ne decoupe pas proprement deux axes de variation.',
    },
  }),
  defineMission({
    id: 'intelligent-file-scanner',
    mode: 'Mission complete',
    difficulty: 'Avance',
    title: 'Intelligent File Scanner',
    description:
      'Une arborescence de fichiers doit etre parcourue et analysee selon plusieurs traitements sans toucher aux noeuds de base.',
    context:
      'Le produit doit calculer taille, detecter virus et rechercher des elements dans une meme structure de fichiers.',
    problems: [
      'La structure est recursive.',
      'Plusieurs analyses doivent etre ajoutees sur la meme structure.',
      'Le parcours doit rester lisible.',
    ],
    objective:
      'Combiner structure arborescente et traitements specialises sur cette structure.',
    candidatePatterns: ['composite', 'visitor', 'strategy'],
    expectedPatterns: ['composite', 'visitor'],
    preferredSimulationPattern: 'visitor',
    simulationOrder: ['composite', 'visitor'],
    successCriteria: [
      'La structure de base reste stable.',
      'Plusieurs analyses sont appliquees sans modifier les noeuds.',
      'Le parcours couvre toute l arborescence.',
    ],
    patternPrompts: {
      composite: 'Fournit la structure recursive uniforme.',
      visitor: 'Ajoute des analyses multiples sur cette structure.',
      strategy: 'Change un comportement, mais ne modele pas l arbre ni le double dispatch.',
    },
  }),
  defineMission({
    id: 'smart-code-interpreter',
    mode: 'Mission complete',
    difficulty: 'Avance',
    title: 'Smart Code Interpreter',
    description:
      'Une app doit executer un mini langage avec instructions, conditions et blocs tout en representant proprement la structure du script.',
    context:
      'Le produit veut faire ecrire de petites routines avec MOVE, TURN, ATTACK et REPEAT. Le code doit etre interprete ligne par ligne sur un contexte de mission.',
    problems: [
      'Le script a sa propre structure.',
      'Les expressions doivent etre executees dans un contexte partage.',
      'Le moteur doit rester lisible quand les blocs se complexifient.',
    ],
    objective:
      'Construire un petit moteur de langage avec une structure interpretable et un parcours coherent.',
    candidatePatterns: ['interpreter', 'composite', 'factory'],
    expectedPatterns: ['interpreter', 'composite'],
    preferredSimulationPattern: 'interpreter',
    simulationOrder: ['composite', 'interpreter'],
    successCriteria: [
      'Le script est represente comme une structure exploitable.',
      'Les instructions s executent dans un contexte partage.',
      'Les blocs restent interpretables ligne par ligne.',
    ],
    patternPrompts: {
      interpreter: 'Donne un vrai sens executable au mini langage.',
      composite: 'Aide a representer les blocs imbriques et la structure du script.',
      factory: 'Peut aider a creer des objets, mais ne construit pas a lui seul un langage interprete.',
    },
  }),
])
