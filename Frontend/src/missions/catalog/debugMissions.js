import { defineMission, defineMissionGroup } from './builders'

export const debugMissions = defineMissionGroup([
  defineMission({
    id: 'memory-overload',
    mode: 'Déboguer le système',
    difficulty: 'Avancé',
    title: 'Memory Overload',
    description:
      'Un jeu affiche des milliers d’ennemis proches visuellement et consomme trop de mémoire. Il faut identifier une optimisation adaptée, puis vérifier son effet en simulation.',
    context:
      'Dans un moteur 2D, chaque ennemi possède des données propres comme sa position, mais partage aussi des données lourdes comme les textures, les animations ou le type visuel. Aujourd’hui, ces données lourdes sont recréées trop souvent.',
    problems: [
      '10 000 objets très similaires sont instanciés séparément.',
      'La mémoire augmente fortement à chaque nouvelle vague.',
      'Le rendu reste correct, mais le budget RAM devient irréaliste.',
    ],
    objective:
      'Concevoir une solution qui sépare les données propres à chaque objet des données lourdes partageables.',
    candidatePatterns: ['flyweight', 'singleton', 'decorator', 'strategy'],
    expectedPatterns: ['flyweight'],
    preferredSimulationPattern: 'flyweight',
    simulationOrder: ['flyweight'],
    successCriteria: [
      'Les données lourdes sont mutualisées au lieu d’être dupliquées.',
      'La simulation montre un écart net entre le nombre d’objets visibles et le nombre d’objets réellement coûteux.',
      'Le nombre de variantes reste assez faible pour conserver un vrai gain de partage.',
    ],
    patternPrompts: {
      flyweight: 'Travaille sur le partage d’état pour les objets répétitifs.',
      singleton: 'Centraliser un service ne réduit pas le coût de milliers d’objets.',
      decorator: 'Ajouter des couches ne traite pas le budget mémoire des assets.',
      strategy: 'Changer d’algorithme ne mutualise pas un rendu massif.',
    },
    configurationPrompts: {
      flyweight: [
        'Active explicitement le mode de partage.',
        'Monte la charge pour que le gain soit visible.',
        'Évite un nombre de variantes trop élevé, sinon le partage s’effondre.',
      ],
    },
  }),
  defineMission({
    id: 'global-logger',
    mode: 'Déboguer le système',
    difficulty: 'Débutant',
    title: 'Global Logger',
    description:
      'Plusieurs modules doivent écrire dans un même système de journalisation simplifié. Il faut éviter que chacun crée son propre service indépendant.',
    context:
      'Dans une vraie application, les logs sont souvent gérés par une bibliothèque spécialisée. Ici, la mission simule ce besoin avec un service plus simple : le panel admin, le job backend et le service analytics doivent tous écrire dans le même canal de journalisation.',
    problems: [
      'Chaque module peut actuellement créer son propre logger.',
      'La configuration risque de diverger selon le point d’entrée.',
      'Les traces globales deviennent difficiles à suivre pendant un incident.',
    ],
    objective:
      'Concevoir une solution où plusieurs modules utilisent le même service de journalisation, sans recréer un logger indépendant à chaque appel.',
    candidatePatterns: ['singleton', 'factory', 'observer'],
    expectedPatterns: ['singleton'],
    preferredSimulationPattern: 'singleton',
    simulationOrder: ['singleton'],
    successCriteria: [
      'Plusieurs clients utilisent le même service de journalisation.',
      'Une modification de configuration reste visible depuis les différents modules.',
      'Le programme évite de disperser les logs dans plusieurs services indépendants.',
    ],
    patternPrompts: {
      singleton: 'Travaille sur l’unicité et le partage d’une même instance.',
      factory: 'Créer proprement des objets ne garantit pas qu’ils soient uniques.',
      observer: 'Diffuser des événements ne centralise pas une référence globale.',
    },
    configurationPrompts: {
      singleton: [
        'Active le mode avec instance unique.',
        'Configure plusieurs clients pour vérifier le partage.',
      ],
    },
  }),
  defineMission({
    id: 'dynamic-payment-system',
    mode: 'Déboguer le système',
    difficulty: 'Intermédiaire',
    title: 'Dynamic Payment System',
    description:
      'Un checkout doit accepter plusieurs moyens de paiement sans transformer le workflow principal en gros bloc conditionnel.',
    context:
      'Le parcours de paiement reste le même, mais l’algorithme appliqué varie selon le choix de l’utilisateur : carte bancaire, PayPal ou crypto. L’équipe veut pouvoir ajouter un nouveau moyen de paiement sans réécrire tout le checkout.',
    problems: [
      'Le code de paiement accumule des branches conditionnelles.',
      'Ajouter un nouveau moyen de paiement devient coûteux.',
      'Le workflow principal doit rester stable.',
    ],
    objective:
      'Permettre au contexte de paiement de changer de comportement sans dupliquer le parcours principal.',
    candidatePatterns: ['strategy', 'singleton', 'state'],
    expectedPatterns: ['strategy'],
    preferredSimulationPattern: 'strategy',
    simulationOrder: ['strategy'],
    successCriteria: [
      'Le comportement change selon le moyen de paiement choisi.',
      'Le workflow principal reste identique.',
      'Le contexte ne dépend pas d’un gros switch central.',
    ],
    patternPrompts: {
      strategy: 'Traite les variations d’algorithme sous un contrat commun.',
      singleton: 'Une instance unique ne résout pas le changement d’algorithme.',
      state: 'Le problème vient du choix de comportement, pas d’un cycle de vie interne.',
    },
  }),
  defineMission({
    id: 'notification-system',
    mode: 'Déboguer le système',
    difficulty: 'Intermédiaire',
    title: 'Notification System',
    description:
      'Quand un événement produit se déclenche, plusieurs services doivent être informés sans coupler chaque récepteur au producteur.',
    context:
      'Une release produit doit prévenir plusieurs consommateurs en même temps : application mobile, support, back-office et audit. Le producteur de l’événement ne doit pas connaître le détail de chaque destination.',
    problems: [
      'Le producteur ne doit pas connaître la logique détaillée de chaque récepteur.',
      'Plusieurs consommateurs doivent être informés simultanément.',
      'Le nombre de récepteurs peut évoluer.',
    ],
    objective:
      'Diffuser un événement à plusieurs abonnés tout en gardant un émetteur stable et peu couplé.',
    candidatePatterns: ['observer', 'singleton', 'builder'],
    expectedPatterns: ['observer'],
    preferredSimulationPattern: 'observer',
    simulationOrder: ['observer'],
    successCriteria: [
      'Un événement unique est diffusé à plusieurs abonnés.',
      'Le producteur reste stable quand les récepteurs changent.',
      'La notification atteint bien tout le réseau configuré.',
    ],
    patternPrompts: {
      observer: 'Gère la diffusion d’un événement vers plusieurs abonnés.',
      singleton: 'Une référence globale ne crée pas un mécanisme d’abonnement.',
      builder: 'Construire un objet n’organise pas une diffusion d’événements.',
    },
  }),
  defineMission({
    id: 'character-state-machine',
    mode: 'Déboguer le système',
    difficulty: 'Intermédiaire',
    title: 'Character State Machine',
    description:
      'Un personnage alterne entre idle, run, jump et attack, mais les transitions deviennent incohérentes. Il faut structurer son cycle de vie.',
    context:
      'Le personnage peut courir, sauter et attaquer, mais les enchaînements acceptés ou refusés sont difficiles à maintenir dans un gros bloc conditionnel.',
    problems: [
      'Les transitions sont difficiles à suivre.',
      'Les actions invalides sont mal gérées.',
      'Le comportement dépend trop de conditions centralisées.',
    ],
    objective:
      'Structurer clairement les états et les transitions pour rendre le comportement cohérent.',
    candidatePatterns: ['state', 'strategy', 'factory'],
    expectedPatterns: ['state'],
    preferredSimulationPattern: 'state',
    simulationOrder: ['state'],
    successCriteria: [
      'Le comportement varie selon un état courant explicite.',
      'Les transitions deviennent lisibles et cohérentes.',
      'Les actions invalides sont clairement refusées.',
    ],
    patternPrompts: {
      state: 'Travaille les transitions et le comportement selon un état courant.',
      strategy: 'Change un algorithme, mais ne structure pas un cycle de vie complet.',
      factory: 'Crée des objets, mais ne gère pas les transitions runtime.',
    },
  }),
  defineMission({
    id: 'custom-object-builder',
    mode: 'Déboguer le système',
    difficulty: 'Intermédiaire',
    title: 'Custom Object Builder',
    description:
      'L’application doit créer des objets complexes sans passer par un constructeur géant rempli de paramètres.',
    context:
      'Le produit final suit plusieurs étapes de construction : structure, noyau, module et finition. L’ordre compte, les variations sont nombreuses, et un simple constructeur devient difficile à lire.',
    problems: [
      'Le constructeur accumule trop de paramètres.',
      'L’ordre des étapes doit rester lisible.',
      'Le produit final doit montrer sa progression.',
    ],
    objective:
      'Assembler un objet complexe étape par étape avec un processus stable et compréhensible.',
    candidatePatterns: ['builder', 'factory'],
    expectedPatterns: ['builder'],
    preferredSimulationPattern: 'builder',
    simulationOrder: ['builder'],
    successCriteria: [
      'La construction suit une progression claire.',
      'Chaque étape enrichit le produit final.',
      'Le résultat final reste cohérent et lisible.',
    ],
    patternPrompts: {
      builder: 'Met en avant une construction progressive et ordonnée.',
      factory: 'Peut choisir un type, mais ne déroule pas le processus détaillé.',
    },
  }),
  defineMission({
    id: 'power-up-system',
    mode: 'Déboguer le système',
    difficulty: 'Intermédiaire',
    title: 'Power-Up System',
    description:
      'Un personnage peut recevoir plusieurs bonus cumulables. Il faut empiler les effets proprement sans créer une classe par combinaison.',
    context:
      'Le héros peut gagner feu, bouclier, vitesse ou glace. Les combinaisons se multiplient et les stats doivent se mettre à jour dynamiquement pendant la partie.',
    problems: [
      'Les bonus doivent être cumulables.',
      'Les stats finales dépendent de plusieurs couches.',
      'Une classe par combinaison serait ingérable.',
    ],
    objective:
      'Empiler proprement des effets runtime autour d’un même composant de base.',
    candidatePatterns: ['decorator', 'strategy'],
    expectedPatterns: ['decorator'],
    preferredSimulationPattern: 'decorator',
    simulationOrder: ['decorator'],
    successCriteria: [
      'Plusieurs effets peuvent s’ajouter sur le même build.',
      'Les stats se recalculent avec l’empilement.',
      'Le composant de base reste stable.',
    ],
    patternPrompts: {
      decorator: 'Empile des couches de comportement autour d’un même objet.',
      strategy: 'Choisit un comportement actif, mais ne cumule pas naturellement des bonus.',
    },
  }),
  defineMission({
    id: 'undo-system',
    mode: 'Déboguer le système',
    difficulty: 'Intermédiaire',
    title: 'Undo System',
    description:
      'Un éditeur doit annuler et rejouer des actions de manière fiable. Il faut transformer les opérations en éléments historisables.',
    context:
      'Un robot de grille peut bouger, poser une balise, annuler puis rejouer. L’interface ne doit pas connaître le détail des mutations du plateau.',
    problems: [
      'Les actions doivent être historisées.',
      'Undo et redo doivent être fiables.',
      'L’interface ne doit pas piloter directement le récepteur.',
    ],
    objective:
      'Encapsuler les actions pour pouvoir les rejouer, les annuler et les historiser.',
    candidatePatterns: ['command', 'state'],
    expectedPatterns: ['command'],
    preferredSimulationPattern: 'command',
    simulationOrder: ['command'],
    successCriteria: [
      'Les actions deviennent rejouables.',
      'Les piles undo / redo restent cohérentes.',
      'Le récepteur reste découplé de l’interface.',
    ],
    patternPrompts: {
      command: 'Encapsule chaque action dans un objet historisable.',
      state: 'Organise un cycle de vie, mais ne gère pas à lui seul un historique d’opérations.',
    },
  }),
  defineMission({
    id: 'request-processing-pipeline',
    mode: 'Déboguer le système',
    difficulty: 'Intermédiaire',
    title: 'Request Processing Pipeline',
    description:
      'Une requête doit passer par plusieurs validations spécialisées avant d’être acceptée ou bloquée.',
    context:
      'Une requête d’export doit traverser des étapes d’authentification, de validation de payload et de traitement final sans tout concentrer dans un seul contrôleur.',
    problems: [
      'Chaque validation doit être spécialisée.',
      'Le pipeline doit s’arrêter proprement quand un maillon refuse.',
      'Le flux doit rester extensible.',
    ],
    objective:
      'Construire un pipeline où chaque maillon traite la requête ou la délègue au maillon suivant.',
    candidatePatterns: ['chain', 'observer'],
    expectedPatterns: ['chain'],
    preferredSimulationPattern: 'chain',
    simulationOrder: ['chain'],
    successCriteria: [
      'La requête traverse des maillons spécialisés.',
      'Le pipeline peut refuser ou déléguer proprement.',
      'Le traitement final reste lisible.',
    ],
    patternPrompts: {
      chain: 'Orchestre un flux de validation maillon par maillon.',
      observer: 'Diffuse un événement mais ne construit pas un pipeline de décision séquentiel.',
    },
  }),
])
