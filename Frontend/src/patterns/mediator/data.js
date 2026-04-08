export const patternCode = "mediator"

export const patternDefinition = {
  "code": "mediator",
  "name": "Mediator",
  "type": "BEHAVIORAL",
  "description": "Centralise les echanges entre plusieurs objets pour qu ils passent par un hub commun au lieu de se connaitre tous directement.",
  "useCase": "Construire un chat multijoueur ou les messages transitent par un salon central pour reduire le couplage entre participants.",
  "complexityLevel": "INTERMEDIATE"
}

export const fallbackSchema = {
  "fields": [
    {
      "name": "mode",
      "label": "Mode",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "WITH_MEDIATOR",
        "WITHOUT_MEDIATOR"
      ],
      "defaultValue": "WITH_MEDIATOR"
    },
    {
      "name": "roomName",
      "label": "Nom du salon",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Arena Chat"
    },
    {
      "name": "participants",
      "label": "Participants",
      "type": "LIST",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Luna, Kiro, Nova"
    },
    {
      "name": "senderName",
      "label": "Expediteur",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Luna"
    },
    {
      "name": "message",
      "label": "Message",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Focus target center lane"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "Les participants ne se parlent plus tous directement : un hub central orchestre les messages.",
  "intuition": "Mediator remplace un reseau de dependances croisées par un point de coordination unique. Chaque colleague depend du mediator, pas de tous les autres objets du systeme.",
  "readingGuide": "Observe d abord le trajet du message dans la scene, puis compare avec et sans mediator. L UML montre le hub central, la scene runtime montre la reduction du couplage.",
  "studentAngle": "Le declic pedagogique est simple : les joueurs discutent toujours entre eux, mais plus aucun ne porte la logique complete du reseau.",
  "developerAngle": "Le pattern devient utile pour des chats, des interfaces riches, des salles de jeu, des dashboards ou des workflows ou beaucoup d objets doivent se coordonner.",
  "playfulPrompt": "Ajoute des participants, change l expediteur et compare la difference entre des messages directs et un hub de diffusion central.",
  "steps": [
    "Le colleague expediteur envoie un message.",
    "Le mediator central recoit cet evenement.",
    "Le mediator choisit les destinataires a notifier.",
    "Les autres colleagues recoivent le message sans connaitre toute la topologie du chat."
  ],
  "glossary": [
    {
      "term": "Mediator",
      "definition": "Objet central qui coordonne les interactions entre plusieurs colleagues."
    },
    {
      "term": "Colleague",
      "definition": "Participant du systeme qui communique via le mediator plutot que directement avec tous les autres."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 1240 760",
  "classes": [
    {
      "id": "participant",
      "x": 72,
      "y": 268,
      "width": 260,
      "height": 138,
      "title": "ChatParticipant",
      "stereotype": "Colleague",
      "fields": [
        "- mediator: ChatMediator",
        "- name: String"
      ],
      "methods": [
        "+ send(message)",
        "+ receive(from, message)"
      ],
      "tone": "accent"
    },
    {
      "id": "mediator",
      "x": 456,
      "y": 68,
      "width": 300,
      "height": 128,
      "title": "ChatMediator",
      "stereotype": "Mediator",
      "methods": [
        "+ broadcast(sender, message)"
      ],
      "tone": "sand"
    },
    {
      "id": "room",
      "x": 450,
      "y": 308,
      "width": 312,
      "height": 160,
      "title": "ChatRoomMediator",
      "stereotype": "Concrete Mediator",
      "fields": [
        "- participants: List<ChatParticipant>"
      ],
      "methods": [
        "+ register(participant)",
        "+ broadcast(sender, message)"
      ],
      "tone": "teal"
    },
    {
      "id": "sender",
      "x": 72,
      "y": 560,
      "width": 260,
      "height": 126,
      "title": "SenderParticipant",
      "stereotype": "Concrete Colleague",
      "methods": [
        "+ send(message)"
      ],
      "tone": "accent"
    },
    {
      "id": "recipient",
      "x": 908,
      "y": 560,
      "width": 260,
      "height": 126,
      "title": "RecipientParticipant",
      "stereotype": "Concrete Colleague",
      "methods": [
        "+ receive(from, message)"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "participant",
      "to": "mediator",
      "label": "uses",
      "marker": "arrow"
    },
    {
      "from": "room",
      "to": "mediator",
      "label": "implements",
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "sender",
      "to": "participant",
      "label": "extends",
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "recipient",
      "to": "participant",
      "label": "extends",
      "marker": "triangle",
      "dashed": true,
      "points": [
        {
          "x": 1038,
          "y": 520
        },
        {
          "x": 1038,
          "y": 438
        },
        {
          "x": 250,
          "y": 438
        }
      ]
    },
    {
      "from": "room",
      "to": "participant",
      "label": "participants[*]",
      "marker": "arrow",
      "points": [
        {
          "x": 606,
          "y": 500
        },
        {
          "x": 606,
          "y": 620
        },
        {
          "x": 332,
          "y": 620
        }
      ]
    },
    {
      "from": "room",
      "to": "recipient",
      "label": "relay(message)",
      "marker": "arrow",
      "points": [
        {
          "x": 764,
          "y": 388
        },
        {
          "x": 892,
          "y": 388
        },
        {
          "x": 892,
          "y": 622
        }
      ]
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "mediator",
  "title": "Quiz Mediator",
  "description": "Teste ta comprehension d un hub central qui coordonne les echanges entre plusieurs colleagues sans les coupler directement.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "mediator-q1",
      "label": "Le pattern Mediator sert surtout a :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Il centralise les interactions entre objets pour reduire les dependances directes entre eux.",
      "choices": [
        {
          "id": "create",
          "label": "Creer des objets"
        },
        {
          "id": "centralize",
          "label": "Centraliser les interactions"
        },
        {
          "id": "share",
          "label": "Partager la memoire"
        }
      ],
      "correctChoiceIds": [
        "centralize"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "mediator-q2",
      "label": "Dans une implementation classique, les colleagues passent idealement par le mediator plutot que de se parler tous directement.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "C est le coeur du pattern : les objets collaborent via le mediator central.",
      "choices": [
        {
          "id": "true",
          "label": "Vrai"
        },
        {
          "id": "false",
          "label": "Faux"
        }
      ],
      "correctChoiceIds": [
        "true"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "mediator-q3",
      "label": "Mediator appartient a la famille :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Mediator est un pattern comportemental.",
      "choices": [
        {
          "id": "creational",
          "label": "Creation"
        },
        {
          "id": "structural",
          "label": "Structurel"
        },
        {
          "id": "behavioral",
          "label": "Comportemental"
        }
      ],
      "correctChoiceIds": [
        "behavioral"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "mediator-q4",
      "label": "Quel avantage principal apporte Mediator dans un chat ?",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Chaque joueur depend du hub central plutot que de tous les autres joueurs.",
      "choices": [
        {
          "id": "faster",
          "label": "Toujours plus rapide"
        },
        {
          "id": "decouple",
          "label": "Reduction du couplage entre participants"
        },
        {
          "id": "inheritance",
          "label": "Plus d heritage"
        }
      ],
      "correctChoiceIds": [
        "decouple"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "mediator-q5",
      "label": "Associe chaque role a sa responsabilite.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le mediator coordonne, le colleague envoie ou recoit, le concrete mediator implemente la coordination.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "mediator",
          "label": "Mediator"
        },
        {
          "id": "colleague",
          "label": "Colleague"
        },
        {
          "id": "concrete",
          "label": "ConcreteMediator"
        }
      ],
      "rightItems": [
        {
          "id": "coordinate",
          "label": "Coordonne les echanges"
        },
        {
          "id": "participate",
          "label": "Envoie / recoit des messages"
        },
        {
          "id": "implement",
          "label": "Porte la logique centrale"
        }
      ],
      "correctPairs": [
        {
          "leftId": "mediator",
          "rightId": "coordinate"
        },
        {
          "leftId": "colleague",
          "rightId": "participate"
        },
        {
          "leftId": "concrete",
          "rightId": "implement"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "mediator-q6",
      "label": "Sans Mediator, un systeme de chat peut vite accumuler des liens directs entre participants.",
      "type": "TRUE_FALSE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Oui : chaque participant doit connaitre plusieurs autres objets au lieu de dependance unique vers le hub.",
      "choices": [
        {
          "id": "true",
          "label": "Vrai"
        },
        {
          "id": "false",
          "label": "Faux"
        }
      ],
      "correctChoiceIds": [
        "true"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "mediator-q7",
      "label": "Quel exemple illustre bien Mediator ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Un salon de chat, une tour de controle ou une salle de jeu avec hub central sont des exemples classiques.",
      "choices": [
        {
          "id": "chat",
          "label": "Salon de chat"
        },
        {
          "id": "dto",
          "label": "DTO"
        },
        {
          "id": "table",
          "label": "Table SQL"
        }
      ],
      "correctChoiceIds": [
        "chat"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "mediator-q8",
      "label": "Quand un nouveau participant rejoint, quel objet central evolue le plus naturellement ?",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "On met a jour le mediator central plutot que tous les participants existants.",
      "choices": [
        {
          "id": "mediator",
          "label": "Le mediator"
        },
        {
          "id": "all",
          "label": "Tous les colleagues entre eux"
        },
        {
          "id": "database",
          "label": "La base de donnees uniquement"
        }
      ],
      "correctChoiceIds": [
        "mediator"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "mediator-q9",
      "label": "Le risque classique de Mediator est :",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le hub central peut devenir trop gros s il absorbe trop de logique applicative.",
      "choices": [
        {
          "id": "god",
          "label": "Un mediator qui devient un god object"
        },
        {
          "id": "memory",
          "label": "Une memoire partagee par tous"
        },
        {
          "id": "factory",
          "label": "Une fabrique obligatoire"
        }
      ],
      "correctChoiceIds": [
        "god"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "mediator-q10",
      "label": "Remets la boucle Mediator dans le bon ordre.",
      "type": "ORDERING",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le participant envoie au mediator, le mediator decide les destinataires, puis il relaie les messages.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [
        {
          "id": "send",
          "label": "Le participant envoie un message"
        },
        {
          "id": "hub",
          "label": "Le mediator recoit et coordonne"
        },
        {
          "id": "relay",
          "label": "Le mediator relaie aux destinataires"
        },
        {
          "id": "receive",
          "label": "Les autres participants recoivent le message"
        }
      ],
      "correctOrder": [
        "send",
        "hub",
        "relay",
        "receive"
      ]
    }
  ]
}

