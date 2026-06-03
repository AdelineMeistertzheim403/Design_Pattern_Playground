import { defineMission, defineMissionGroup } from './builders'

export const completeMissions = defineMissionGroup([
  defineMission({
    id: 'complex-combat-system',
    mode: 'Mission complète',
    difficulty: 'Avancé',
    title: 'Complex Combat System',
    description:
      'Le moteur de combat doit gérer plusieurs styles d’attaque et des bonus cumulables. Une seule décision de conception ne suffit pas.',
    context:
      'Un personnage doit pouvoir changer de style d’attaque selon la situation, tout en accumulant des buffs visibles sur ses stats. Le système doit rester modifiable sans créer une classe pour chaque combinaison.',
    problems: [
      'Le comportement d’attaque varie selon la situation.',
      'Les bonus doivent se cumuler dynamiquement.',
      'Le système doit rester évolutif.',
    ],
    objective:
      'Combiner un choix de comportement interchangeable avec un mécanisme d’enrichissement cumulatif.',
    candidatePatterns: ['strategy', 'decorator', 'singleton', 'factory'],
    expectedPatterns: ['strategy', 'decorator'],
    preferredSimulationPattern: 'decorator',
    simulationOrder: ['strategy', 'decorator'],
    successCriteria: [
      'Le style d’attaque peut changer sans casser le contexte.',
      'Les buffs s’empilent proprement sur le même build.',
      'Le système reste flexible sans explosion de classes.',
    ],
    patternPrompts: {
      strategy: 'Fait varier l’algorithme d’attaque.',
      decorator: 'Ajoute des bonus cumulables sur le build.',
      singleton: 'Une instance globale n’apporte pas de flexibilité de combat.',
      factory: 'La création seule ne gère ni les buffs ni le changement d’algorithme.',
    },
  }),
  defineMission({
    id: 'massive-multiplayer-world',
    mode: 'Mission complète',
    difficulty: 'Avancé',
    title: 'Massive Multiplayer World',
    description:
      'Un monde en ligne doit créer beaucoup d’entités tout en évitant de dupliquer inutilement des données lourdes.',
    context:
      'Le serveur instancie arbres, ennemis et objets à grande échelle. Beaucoup d’éléments partagent les mêmes textures, statistiques de base ou modèles visuels, mais chaque entité garde aussi des données propres.',
    problems: [
      'Le volume d’entités est massif.',
      'La duplication d’état lourd explose la mémoire.',
      'La création des entités doit rester contrôlée.',
    ],
    objective:
      'Optimiser à la fois la création des instances et le partage des données communes.',
    candidatePatterns: ['flyweight', 'factory', 'singleton', 'builder'],
    expectedPatterns: ['flyweight', 'factory'],
    preferredSimulationPattern: 'flyweight',
    simulationOrder: ['factory', 'flyweight'],
    successCriteria: [
      'Les données lourdes sont mutualisées.',
      'La création des entités reste centralisée et maîtrisable.',
      'La simulation montre un système plus stable à grande charge.',
    ],
    patternPrompts: {
      flyweight: 'Mutualise les données lourdes des objets répétitifs.',
      factory: 'Centralise la création des instances du monde.',
      singleton: 'Une instance globale n’optimise pas la masse d’entités.',
      builder: 'Un processus de construction détaillé n’est pas le problème principal ici.',
    },
  }),
  defineMission({
    id: 'smart-notification-platform',
    mode: 'Mission complète',
    difficulty: 'Avancé',
    title: 'Smart Notification Platform',
    description:
      'Une plateforme doit informer plusieurs destinataires tout en adaptant le canal de livraison au contexte.',
    context:
      'Le produit envoie des alertes par email, SMS ou push. Plusieurs destinataires doivent être prévenus, mais le canal choisi doit pouvoir changer sans modifier le producteur de l’événement.',
    problems: [
      'Plusieurs récepteurs doivent être informés.',
      'Le canal de notification doit varier dynamiquement.',
      'La plateforme doit rester extensible.',
    ],
    objective:
      'Combiner une diffusion multi-abonnés avec une variation de canal de livraison.',
    candidatePatterns: ['observer', 'strategy', 'singleton', 'factory'],
    expectedPatterns: ['observer', 'strategy'],
    preferredSimulationPattern: 'observer',
    simulationOrder: ['strategy', 'observer'],
    successCriteria: [
      'Le message se propage à plusieurs destinataires.',
      'Le canal utilisé peut changer selon la configuration.',
      'Le système reste lisible et évolutif.',
    ],
    patternPrompts: {
      observer: 'Diffuse un événement à plusieurs abonnés.',
      strategy: 'Fait varier le canal de livraison.',
      singleton: 'Ne gère ni la diffusion ni la variation de canal.',
      factory: 'Ne couvre pas à lui seul la diffusion et la sélection de comportement.',
    },
  }),
  defineMission({
    id: 'game-save-system',
    mode: 'Mission complète',
    difficulty: 'Avancé',
    title: 'Game Save System',
    description:
      'Le jeu doit conserver des checkpoints et restaurer un état cohérent après une suite d’actions.',
    context:
      'Un joueur enchaîne plusieurs actions puis veut revenir à un savepoint fiable. Le système doit garder trace des actions appliquées et conserver des snapshots restaurables sans exposer tout l’état interne.',
    problems: [
      'Les checkpoints doivent être restaurés proprement.',
      'Les actions runtime doivent rester lisibles.',
      'Le retour arrière ne doit pas casser l’encapsulation.',
    ],
    objective:
      'Combiner un historique d’actions avec des snapshots d’état pour obtenir un retour arrière fiable.',
    candidatePatterns: ['memento', 'command', 'singleton'],
    expectedPatterns: ['memento', 'command'],
    preferredSimulationPattern: 'memento',
    simulationOrder: ['command', 'memento'],
    successCriteria: [
      'Les actions restent historisées.',
      'Un checkpoint peut être restauré proprement.',
      'Le retour arrière ne dépend pas d’une copie manuelle de tout l’état.',
    ],
    patternPrompts: {
      memento: 'Capture et restaure un état interne proprement.',
      command: 'Historise et rejoue les actions runtime.',
      singleton: 'Une référence globale ne gère ni snapshots ni historique d’actions.',
    },
  }),
  defineMission({
    id: 'modular-ui-system',
    mode: 'Mission complète',
    difficulty: 'Avancé',
    title: 'Modular UI System',
    description:
      'Une interface doit rester personnalisable et extensible, avec une structure imbriquée et des enrichissements visuels cumulables.',
    context:
      'Le produit assemble des sections, panneaux et widgets dans une arborescence UI. Des badges, thèmes et effets doivent aussi pouvoir se superposer sans casser la structure principale.',
    problems: [
      'La structure est hiérarchique.',
      'Des enrichissements visuels doivent se cumuler.',
      'Le client doit pouvoir traiter toute la structure uniformément.',
    ],
    objective:
      'Combiner une structure arborescente avec des enrichissements runtime autour des composants.',
    candidatePatterns: ['composite', 'decorator', 'factory'],
    expectedPatterns: ['composite', 'decorator'],
    preferredSimulationPattern: 'composite',
    simulationOrder: ['composite', 'decorator'],
    successCriteria: [
      'La structure imbriquée reste manipulable uniformément.',
      'Les enrichissements se superposent sans dupliquer les classes.',
      'L’interface reste modulaire et évolutive.',
    ],
    patternPrompts: {
      composite: 'Organise la structure en arbre et unifie les opérations.',
      decorator: 'Ajoute des enrichissements runtime par couches.',
      factory: 'Peut aider à créer des composants, mais ne suffit pas pour la structure et les couches.',
    },
  }),
  defineMission({
    id: 'secure-api-gateway',
    mode: 'Mission complète',
    difficulty: 'Avancé',
    title: 'Secure API Gateway',
    description:
      'Un accès API doit être protégé, validé et contrôlé sans empiler toute la logique dans un seul bloc de code.',
    context:
      'Une gateway reçoit des appels sensibles. Chaque requête doit passer par plusieurs contrôles avant d’atteindre la ressource réelle, et la ressource ne doit pas être exposée directement.',
    problems: [
      'La requête doit passer par plusieurs vérifications.',
      'La ressource finale ne doit pas être exposée directement.',
      'Le pipeline doit rester extensible.',
    ],
    objective:
      'Combiner un pipeline de validation avec un gardien devant la ressource sensible.',
    candidatePatterns: ['chain', 'proxy', 'observer'],
    expectedPatterns: ['chain', 'proxy'],
    preferredSimulationPattern: 'proxy',
    simulationOrder: ['chain', 'proxy'],
    successCriteria: [
      'La requête traverse plusieurs contrôles spécialisés.',
      'La ressource finale reste protégée derrière un intermédiaire.',
      'Le système peut refuser proprement un appel non conforme.',
    ],
    patternPrompts: {
      chain: 'Structure le pipeline de validation en maillons.',
      proxy: 'Protège la ressource sensible derrière un gardien.',
      observer: 'Diffuse des événements mais ne sécurise pas la requête.',
    },
  }),
  defineMission({
    id: 'multi-device-control-system',
    mode: 'Mission complète',
    difficulty: 'Avancé',
    title: 'Multi-device Control System',
    description:
      'Une application contrôle une TV, une lampe et un système audio. Les actions doivent être coordonnées sans coupler tous les appareils entre eux.',
    context:
      'Une seule interface déclenche plusieurs commandes et un hub de coordination doit synchroniser la réaction des appareils. Les actions doivent aussi rester rejouables ou annulables.',
    problems: [
      'Plusieurs appareils doivent réagir ensemble.',
      'Les commandes doivent rester historisables.',
      'Les appareils ne doivent pas tous se connaître mutuellement.',
    ],
    objective:
      'Combiner une coordination centrale avec des commandes rejouables pour piloter plusieurs appareils.',
    candidatePatterns: ['mediator', 'command', 'singleton'],
    expectedPatterns: ['mediator', 'command'],
    preferredSimulationPattern: 'mediator',
    simulationOrder: ['command', 'mediator'],
    successCriteria: [
      'Les actions sont encapsulées proprement.',
      'La coordination entre appareils passe par un centre unique.',
      'Le système reste extensible quand on ajoute un nouvel appareil.',
    ],
    patternPrompts: {
      mediator: 'Centralise les interactions entre appareils.',
      command: 'Encapsule chaque action de contrôle.',
      singleton: 'Ne coordonne pas plusieurs appareils ni leurs commandes.',
    },
  }),
  defineMission({
    id: 'dynamic-rendering-engine',
    mode: 'Mission complète',
    difficulty: 'Avancé',
    title: 'Dynamic Rendering Engine',
    description:
      'Un moteur graphique doit supporter plusieurs formes et plusieurs moteurs de rendu sans exploser en sous-classes.',
    context:
      'Les objets visuels changent de forme et de moteur de rendu. Le produit veut tester de nouvelles combinaisons sans reconstruire toute la hiérarchie à chaque variation.',
    problems: [
      'Deux axes de variation évoluent en même temps.',
      'Le rendu doit pouvoir changer dynamiquement.',
      'Le moteur doit rester extensible.',
    ],
    objective:
      'Combiner un axe abstraction / implémentation avec un axe de variation de comportement.',
    candidatePatterns: ['bridge', 'strategy', 'decorator'],
    expectedPatterns: ['bridge', 'strategy'],
    preferredSimulationPattern: 'bridge',
    simulationOrder: ['strategy', 'bridge'],
    successCriteria: [
      'Les deux axes de variation restent découplés.',
      'Le rendu peut changer sans casser l’abstraction.',
      'Le moteur reste flexible pour de nouvelles combinaisons.',
    ],
    patternPrompts: {
      bridge: 'Sépare l’abstraction visuelle de son moteur concret.',
      strategy: 'Fait varier un choix d’algorithme ou de style à l’exécution.',
      decorator: 'Ajoute des couches mais ne découpe pas proprement deux axes de variation.',
    },
  }),
  defineMission({
    id: 'intelligent-file-scanner',
    mode: 'Mission complète',
    difficulty: 'Avancé',
    title: 'Intelligent File Scanner',
    description:
      'Une arborescence de fichiers doit être parcourue et analysée selon plusieurs traitements sans modifier les nœuds de base.',
    context:
      'Le produit doit calculer des tailles, détecter des fichiers suspects et rechercher des éléments dans une même structure de dossiers et fichiers. Les traitements doivent évoluer sans réécrire les nœuds.',
    problems: [
      'La structure est récursive.',
      'Plusieurs analyses doivent être ajoutées sur la même structure.',
      'Le parcours doit rester lisible.',
    ],
    objective:
      'Combiner une structure arborescente avec des traitements spécialisés applicables à cette structure.',
    candidatePatterns: ['composite', 'visitor', 'strategy'],
    expectedPatterns: ['composite', 'visitor'],
    preferredSimulationPattern: 'visitor',
    simulationOrder: ['composite', 'visitor'],
    successCriteria: [
      'La structure de base reste stable.',
      'Plusieurs analyses sont appliquées sans modifier les nœuds.',
      'Le parcours couvre toute l’arborescence.',
    ],
    patternPrompts: {
      composite: 'Fournit la structure récursive uniforme.',
      visitor: 'Ajoute des analyses multiples sur cette structure.',
      strategy: 'Change un comportement, mais ne modélise pas l’arbre ni le double dispatch.',
    },
  }),
  defineMission({
    id: 'smart-code-interpreter',
    mode: 'Mission complète',
    difficulty: 'Avancé',
    title: 'Smart Code Interpreter',
    description:
      'Une application doit exécuter un mini-langage avec instructions et blocs tout en représentant proprement la structure du script.',
    context:
      'Le produit veut permettre d’écrire de petites routines avec MOVE, TURN, ATTACK et REPEAT. Le code doit être représenté comme une structure exploitable, puis exécuté ligne par ligne dans un contexte de mission.',
    problems: [
      'Le script a sa propre structure.',
      'Les expressions doivent être exécutées dans un contexte partagé.',
      'Le moteur doit rester lisible quand les blocs se complexifient.',
    ],
    objective:
      'Construire un petit moteur de langage avec une structure interprétable et un parcours cohérent.',
    candidatePatterns: ['interpreter', 'composite', 'factory'],
    expectedPatterns: ['interpreter', 'composite'],
    preferredSimulationPattern: 'interpreter',
    simulationOrder: ['composite', 'interpreter'],
    successCriteria: [
      'Le script est représenté comme une structure exploitable.',
      'Les instructions s’exécutent dans un contexte partagé.',
      'Les blocs restent interprétables ligne par ligne.',
    ],
    patternPrompts: {
      interpreter: 'Donne un vrai sens exécutable au mini-langage.',
      composite: 'Aide à représenter les blocs imbriqués et la structure du script.',
      factory: 'Peut aider à créer des objets, mais ne construit pas à lui seul un langage interprété.',
    },
  }),
])
