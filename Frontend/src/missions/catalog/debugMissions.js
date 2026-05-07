import { defineMission, defineMissionGroup } from './builders'

export const debugMissions = defineMissionGroup([
  defineMission({
    id: 'memory-overload',
    mode: 'Debug the system',
    difficulty: 'Avance',
    title: 'Memory Overload',
    description:
      'Un jeu affiche des milliers d ennemis identiques et consomme trop de memoire. Il faut choisir la bonne optimisation structurelle et verifier la simulation.',
    context:
      'Ton moteur 2D charge des milliers d objets quasi identiques. Les assets lourds sont dupliques pour chaque ennemi et la scene devient instable des que la vague augmente.',
    problems: [
      '10 000 objets quasi identiques sont instancies separement.',
      'La memoire grimpe a chaque vague.',
      'Le rendu reste correct, mais le budget RAM explose.',
    ],
    objective:
      'Mutualiser les donnees partageables pour tenir une grosse charge sans recreer les memes assets pour chaque objet.',
    candidatePatterns: ['flyweight', 'singleton', 'decorator', 'strategy'],
    expectedPatterns: ['flyweight'],
    preferredSimulationPattern: 'flyweight',
    simulationOrder: ['flyweight'],
    successCriteria: [
      'Mutualiser les donnees lourdes au lieu de les dupliquer.',
      'Montrer un ecart net entre objets visibles et objets reels couteux.',
      'Garder un nombre de variantes assez faible pour conserver le partage.',
    ],
    patternPrompts: {
      flyweight: 'Travaille sur le partage d etat pour les objets repetitifs.',
      singleton: 'Centraliser un service ne reduit pas le cout de milliers d objets.',
      decorator: 'Ajouter des couches ne traite pas le budget memoire des assets.',
      strategy: 'Changer d algorithme ne mutualise pas un rendu massif.',
    },
    configurationPrompts: {
      flyweight: [
        'Active explicitement le mode de partage.',
        'Monte la charge pour que le gain soit visible.',
        'Evite un nombre de variantes trop eleve, sinon le partage s effondre.',
      ],
    },
  }),
  defineMission({
    id: 'global-logger',
    mode: 'Debug the system',
    difficulty: 'Debutant',
    title: 'Global Logger',
    description:
      'Plusieurs modules ecrivent dans des logs differents. Il faut centraliser l acces a la meme instance de service pour garder une trace coherente.',
    context:
      'Le panel admin, le job backend et le service analytics ecrivent chacun dans leur propre logger. Les historiques divergent et les incidents deviennent difficiles a reconstituer.',
    problems: [
      'Chaque module cree sa propre instance de logger.',
      'La configuration change selon le point d entree.',
      'Les traces globales ne sont pas coherentes.',
    ],
    objective:
      'Partager la meme instance de service de log pour que tous les modules ecrivent dans le meme canal.',
    candidatePatterns: ['singleton', 'factory', 'observer'],
    expectedPatterns: ['singleton'],
    preferredSimulationPattern: 'singleton',
    simulationOrder: ['singleton'],
    successCriteria: [
      'Tous les clients pointent vers la meme instance.',
      'Une mise a jour de configuration est visible partout.',
      'Le service reste centralise et coherent.',
    ],
    patternPrompts: {
      singleton: 'Travaille sur l unicite et le partage d une meme instance.',
      factory: 'Creer proprement des objets ne garantit pas qu ils soient uniques.',
      observer: 'Diffuser des evenements ne centralise pas une reference globale.',
    },
    configurationPrompts: {
      singleton: [
        'Active le mode avec instance unique.',
        'Configure plusieurs clients pour verifier le partage.',
      ],
    },
  }),
  defineMission({
    id: 'dynamic-payment-system',
    mode: 'Debug the system',
    difficulty: 'Intermediaire',
    title: 'Dynamic Payment System',
    description:
      'Une app doit basculer entre plusieurs moyens de paiement sans casser le workflow principal.',
    context:
      'Le checkout doit supporter carte, PayPal et crypto. Le contexte de paiement reste stable, mais l algorithme applique doit changer selon le choix de l utilisateur.',
    problems: [
      'Le code de paiement accumule des branches conditionnelles.',
      'Ajouter un nouveau moyen de paiement devient couteux.',
      'Le workflow principal doit rester stable.',
    ],
    objective:
      'Changer dynamiquement l algorithme de paiement sans dupliquer le contexte principal.',
    candidatePatterns: ['strategy', 'singleton', 'state'],
    expectedPatterns: ['strategy'],
    preferredSimulationPattern: 'strategy',
    simulationOrder: ['strategy'],
    successCriteria: [
      'Le comportement change selon le moyen de paiement choisi.',
      'Le workflow principal reste identique.',
      'Le contexte ne depend pas d un gros switch central.',
    ],
    patternPrompts: {
      strategy: 'Traite les variations d algorithme sous un contrat commun.',
      singleton: 'Une instance unique ne resout pas le changement d algorithme.',
      state: 'Le probleme vient du choix de comportement, pas d un cycle de vie interne.',
    },
  }),
  defineMission({
    id: 'notification-system',
    mode: 'Debug the system',
    difficulty: 'Intermediaire',
    title: 'Notification System',
    description:
      'Quand un evenement se produit, plusieurs utilisateurs doivent etre informes sans coupler chaque recepteur au producteur.',
    context:
      'Une release produit doit prevenir plusieurs consommateurs en meme temps: mobile, support, back office et audit.',
    problems: [
      'Le producteur ne doit pas connaitre la logique detaillee de chaque recepteur.',
      'Plusieurs utilisateurs doivent etre informes simultanement.',
      'Le nombre de recepteurs peut evoluer.',
    ],
    objective:
      'Diffuser un evenement a plusieurs abonnes tout en gardant un emetteur stable.',
    candidatePatterns: ['observer', 'singleton', 'builder'],
    expectedPatterns: ['observer'],
    preferredSimulationPattern: 'observer',
    simulationOrder: ['observer'],
    successCriteria: [
      'Un evenement unique est diffuse a plusieurs abonnes.',
      'Le producteur reste stable quand les recepteurs changent.',
      'La notification atteint bien tout le reseau configure.',
    ],
    patternPrompts: {
      observer: 'Gere la diffusion d un evenement vers plusieurs abonnes.',
      singleton: 'Une reference globale ne cree pas un mecanisme d abonnement.',
      builder: 'Construire un objet n organise pas une diffusion d evenements.',
    },
  }),
  defineMission({
    id: 'character-state-machine',
    mode: 'Debug the system',
    difficulty: 'Intermediaire',
    title: 'Character State Machine',
    description:
      'Un personnage alterne idle, run, jump et attack mais les transitions deviennent incoherentes. Il faut structurer le cycle de vie.',
    context:
      'Ton personnage peut courir, sauter et attaquer, mais les enchainements acceptes ou refuses sont difficiles a maintenir dans un gros bloc conditionnel.',
    problems: [
      'Les transitions sont difficiles a suivre.',
      'Les actions invalides sont mal gerees.',
      'Le comportement depend trop de conditions centralisees.',
    ],
    objective:
      'Structurer clairement les etats et les transitions pour rendre le comportement coherent.',
    candidatePatterns: ['state', 'strategy', 'factory'],
    expectedPatterns: ['state'],
    preferredSimulationPattern: 'state',
    simulationOrder: ['state'],
    successCriteria: [
      'Le comportement varie selon un etat courant explicite.',
      'Les transitions deviennent lisibles et coherentes.',
      'Les actions invalides sont clairement refusees.',
    ],
    patternPrompts: {
      state: 'Travaille les transitions et le comportement selon un etat courant.',
      strategy: 'Change un algorithme, mais ne structure pas un cycle de vie complet.',
      factory: 'Cree des objets, mais ne gere pas les transitions runtime.',
    },
  }),
  defineMission({
    id: 'custom-object-builder',
    mode: 'Debug the system',
    difficulty: 'Intermediaire',
    title: 'Custom Object Builder',
    description:
      'Tu dois creer des objets complexes comme une voiture ou un personnage sans passer par un constructeur geant peu lisible.',
    context:
      'Le produit final a plusieurs etapes de construction: silhouette, noyau, module et finition. L ordre compte et les variations sont nombreuses.',
    problems: [
      'Le constructeur accumule trop de parametres.',
      'L ordre des etapes doit rester lisible.',
      'Le produit final doit montrer sa progression.',
    ],
    objective:
      'Assembler un objet complexe etape par etape avec un processus stable.',
    candidatePatterns: ['builder', 'factory'],
    expectedPatterns: ['builder'],
    preferredSimulationPattern: 'builder',
    simulationOrder: ['builder'],
    successCriteria: [
      'La construction suit une progression claire.',
      'Chaque etape enrichit le produit final.',
      'Le resultat final reste coherent et lisible.',
    ],
    patternPrompts: {
      builder: 'Met en avant une construction progressive et ordonnee.',
      factory: 'Peut choisir un type, mais ne deroule pas le processus detaille.',
    },
  }),
  defineMission({
    id: 'power-up-system',
    mode: 'Debug the system',
    difficulty: 'Intermediaire',
    title: 'Power-Up System',
    description:
      'Un personnage peut recevoir plusieurs bonus cumulables. Il faut empiler proprement les effets sans explosion de classes.',
    context:
      'Le hero peut gagner feu, bouclier, vitesse ou glace. Les combinaisons se multiplient et les stats doivent se mettre a jour dynamiquement.',
    problems: [
      'Les bonus doivent etre cumulables.',
      'Les stats finales dependent de plusieurs couches.',
      'Une classe par combinaison serait ingerable.',
    ],
    objective:
      'Empiler proprement des effets runtime autour d un meme composant.',
    candidatePatterns: ['decorator', 'strategy'],
    expectedPatterns: ['decorator'],
    preferredSimulationPattern: 'decorator',
    simulationOrder: ['decorator'],
    successCriteria: [
      'Plusieurs effets peuvent s ajouter sur le meme build.',
      'Les stats se recalculent avec le stacking.',
      'Le composant de base reste stable.',
    ],
    patternPrompts: {
      decorator: 'Empile des couches de comportement autour d un meme objet.',
      strategy: 'Choisit un comportement actif, mais ne stacke pas naturellement des bonus cumulables.',
    },
  }),
  defineMission({
    id: 'undo-system',
    mode: 'Debug the system',
    difficulty: 'Intermediaire',
    title: 'Undo System',
    description:
      'Un editeur doit annuler et rejouer des actions de maniere fiable. Il faut transformer les operations en objets historisables.',
    context:
      'Ton robot de grille peut bouger, poser une balise, annuler puis rejouer. L interface ne doit pas connaitre le detail des mutations du board.',
    problems: [
      'Les actions doivent etre historisees.',
      'Undo et redo doivent etre fiables.',
      'L interface ne doit pas piloter directement le receiver.',
    ],
    objective:
      'Encapsuler les actions pour pouvoir les rejouer, les annuler et les historiser.',
    candidatePatterns: ['command', 'state'],
    expectedPatterns: ['command'],
    preferredSimulationPattern: 'command',
    simulationOrder: ['command'],
    successCriteria: [
      'Les actions deviennent rejouables.',
      'Les piles undo / redo restent coherentes.',
      'Le receiver reste decouple de l interface.',
    ],
    patternPrompts: {
      command: 'Encapsule chaque action dans un objet historisable.',
      state: 'Organise un cycle de vie, mais ne gere pas a lui seul un historique d operations.',
    },
  }),
  defineMission({
    id: 'request-processing-pipeline',
    mode: 'Debug the system',
    difficulty: 'Intermediaire',
    title: 'Request Processing Pipeline',
    description:
      'Une requete doit passer par plusieurs validations specialisees avant d etre acceptee ou bloquee.',
    context:
      'Une requete d export doit traverser des etapes d authentification, de validation de payload et de traitement final sans tout concentrer dans un seul bloc de controle.',
    problems: [
      'Chaque validation doit etre specialisee.',
      'Le pipeline doit s arreter proprement quand un maillon refuse.',
      'Le flux doit rester extensible.',
    ],
    objective:
      'Construire un pipeline ou chaque maillon traite ou delegue la requete.',
    candidatePatterns: ['chain', 'observer'],
    expectedPatterns: ['chain'],
    preferredSimulationPattern: 'chain',
    simulationOrder: ['chain'],
    successCriteria: [
      'La requete traverse des maillons specialises.',
      'Le pipeline peut refuser ou deleguer proprement.',
      'Le traitement final reste lisible.',
    ],
    patternPrompts: {
      chain: 'Orchestre un flux de validation maillon par maillon.',
      observer: 'Diffuse un evenement mais ne construit pas un pipeline de decision sequentiel.',
    },
  }),
])
