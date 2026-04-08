export const patternCode = "command"

export const patternDefinition = {
  "code": "command",
  "name": "Command",
  "type": "BEHAVIORAL",
  "description": "Encapsule une action dans un objet pour pouvoir la declencher, l historiser, l annuler et la rejouer sans coupler l interface au receiver.",
  "useCase": "Construire un simulateur undo / redo, un editeur ou un mini jeu d actions historisees avec piles de commandes.",
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
        "WITH_COMMAND",
        "WITHOUT_COMMAND"
      ],
      "defaultValue": "WITH_COMMAND"
    },
    {
      "name": "boardName",
      "label": "Nom de la grille",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Arena Grid"
    },
    {
      "name": "actorName",
      "label": "Nom de l agent",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Pixel Bot"
    },
    {
      "name": "actions",
      "label": "Sequence d actions",
      "type": "LIST",
      "required": true,
      "allowedValues": [
        "ADD_BEACON",
        "MOVE_RIGHT",
        "MOVE_UP",
        "MOVE_LEFT",
        "DELETE_BEACON",
        "UNDO",
        "REDO"
      ],
      "defaultValue": "ADD_BEACON, MOVE_RIGHT, MOVE_UP, UNDO, REDO, DELETE_BEACON"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "Chaque action devient un objet autonome, donc on peut la declencher, l historiser, l annuler et la rejouer.",
  "intuition": "Command separe le bouton ou l interface qui demande une action de l objet qui sait reellement l executer. Ce decouplage rend l historique et undo / redo naturels.",
  "readingGuide": "Observe d abord la grille centrale et l etat final du robot. Puis regarde les piles undo / redo et enfin la timeline pour voir a quel moment une action est executee, annulee ou rejouee.",
  "studentAngle": "Le vrai declic est de voir qu une action n est plus juste un clic, mais un objet qu on peut stocker, empiler et reexecuter.",
  "developerAngle": "Le pattern devient pertinent pour un editeur, un jeu tactique, des macros, une file d actions ou tout systeme qui doit historiser des operations reversibles.",
  "playfulPrompt": "Compare avec et sans Command, puis regarde ce qu il reste possible quand tu veux faire undo ou redo.",
  "steps": [
    "Le client construit une commande concrete.",
    "L invoker declenche cette commande sans connaitre le detail du receiver.",
    "Le receiver applique la vraie mutation sur son etat.",
    "L historique rend ensuite undo / redo possibles."
  ],
  "glossary": [
    {
      "term": "Invoker",
      "definition": "Objet qui declenche la commande et peut maintenir l historique sans connaitre le detail du travail metier."
    },
    {
      "term": "Receiver",
      "definition": "Objet qui sait vraiment effectuer l action demandee par la commande."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 1180 700",
  "classes": [
    {
      "id": "invoker",
      "x": 60,
      "y": 230,
      "width": 256,
      "height": 142,
      "title": "CommandInvoker",
      "stereotype": "Invoker",
      "fields": [
        "- undoStack: Deque<BoardCommand>",
        "- redoStack: Deque<BoardCommand>"
      ],
      "methods": [
        "+ execute(command)",
        "+ undo()",
        "+ redo()"
      ],
      "tone": "teal"
    },
    {
      "id": "command",
      "x": 432,
      "y": 60,
      "width": 280,
      "height": 124,
      "title": "BoardCommand",
      "stereotype": "Command",
      "methods": [
        "+ execute(board)",
        "+ undo(board)",
        "+ action(): CommandAction"
      ],
      "tone": "sand"
    },
    {
      "id": "receiver",
      "x": 846,
      "y": 230,
      "width": 272,
      "height": 154,
      "title": "CommandBoard",
      "stereotype": "Receiver",
      "fields": [
        "- x: int",
        "- y: int",
        "- beaconCount: int"
      ],
      "methods": [
        "+ moveRight()",
        "+ moveUp()",
        "+ addBeacon()",
        "+ restore(snapshot)"
      ],
      "tone": "accent"
    },
    {
      "id": "add",
      "x": 316,
      "y": 456,
      "width": 206,
      "height": 122,
      "title": "AddBeaconCommand",
      "stereotype": "Concrete Command",
      "methods": [
        "+ execute(board)",
        "+ undo(board)"
      ],
      "tone": "accent"
    },
    {
      "id": "move",
      "x": 566,
      "y": 456,
      "width": 206,
      "height": 122,
      "title": "MoveRightCommand",
      "stereotype": "Concrete Command",
      "methods": [
        "+ execute(board)",
        "+ undo(board)"
      ],
      "tone": "accent"
    },
    {
      "id": "delete",
      "x": 816,
      "y": 456,
      "width": 214,
      "height": 122,
      "title": "DeleteBeaconCommand",
      "stereotype": "Concrete Command",
      "methods": [
        "+ execute(board)",
        "+ undo(board)"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "invoker",
      "to": "command",
      "fromSide": "right",
      "toSide": "left",
      "label": "dispatches",
      "labelX": 364,
      "labelY": 148,
      "marker": "arrow",
      "points": [
        {
          "x": 358,
          "y": 300
        },
        {
          "x": 358,
          "y": 122
        }
      ]
    },
    {
      "from": "add",
      "to": "command",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 414,
      "labelY": 408,
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "move",
      "to": "command",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 668,
      "labelY": 408,
      "marker": "triangle",
      "dashed": true,
      "points": [
        {
          "x": 668,
          "y": 408
        },
        {
          "x": 596,
          "y": 408
        },
        {
          "x": 596,
          "y": 214
        }
      ]
    },
    {
      "from": "delete",
      "to": "command",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 918,
      "labelY": 408,
      "marker": "triangle",
      "dashed": true,
      "points": [
        {
          "x": 918,
          "y": 408
        },
        {
          "x": 760,
          "y": 408
        },
        {
          "x": 760,
          "y": 214
        }
      ]
    },
    {
      "from": "command",
      "to": "receiver",
      "fromSide": "right",
      "toSide": "left",
      "label": "targets",
      "labelX": 790,
      "labelY": 186,
      "marker": "arrow",
      "points": [
        {
          "x": 792,
          "y": 122
        },
        {
          "x": 792,
          "y": 306
        }
      ]
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "command",
  "title": "Quiz Command",
  "description": "Teste ta comprehension des requetes encapsulees, de l invoker, du receiver et de la reversibilite undo / redo.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "command-q1",
      "label": "Le pattern Command permet surtout de :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Command encapsule une requete dans un objet pour pouvoir la declencher, la stocker ou l annuler.",
      "choices": [
        {
          "id": "create",
          "label": "Creer des objets"
        },
        {
          "id": "memory",
          "label": "Partager la memoire"
        },
        {
          "id": "encapsulate",
          "label": "Encapsuler une action dans un objet"
        }
      ],
      "correctChoiceIds": [
        "encapsulate"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "command-q2",
      "label": "Une commande peut etre historisee puis rejouee plus tard.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "C est l un des grands interets du pattern pour l historique, les files ou les macros.",
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
      "id": "command-q3",
      "label": "Command appartient a la famille :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Command est un pattern comportemental.",
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
      "id": "command-q4",
      "label": "Quel role declenche les commandes sans connaitre leur implementation detaillee ?",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "L invoker lance une commande via son contrat sans connaitre les details du receiver.",
      "choices": [
        {
          "id": "receiver",
          "label": "Le receiver"
        },
        {
          "id": "invoker",
          "label": "L invoker"
        },
        {
          "id": "database",
          "label": "La base de donnees"
        }
      ],
      "correctChoiceIds": [
        "invoker"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "command-q5",
      "label": "Associe chaque role a sa responsabilite.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "La commande encapsule, l invoker declenche, le receiver effectue le vrai travail.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "command",
          "label": "Command"
        },
        {
          "id": "invoker",
          "label": "Invoker"
        },
        {
          "id": "receiver",
          "label": "Receiver"
        }
      ],
      "rightItems": [
        {
          "id": "encapsulate",
          "label": "Encapsule l action"
        },
        {
          "id": "trigger",
          "label": "Declenche"
        },
        {
          "id": "execute",
          "label": "Execute le vrai travail"
        }
      ],
      "correctPairs": [
        {
          "leftId": "command",
          "rightId": "encapsulate"
        },
        {
          "leftId": "invoker",
          "rightId": "trigger"
        },
        {
          "leftId": "receiver",
          "rightId": "execute"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "command-q6",
      "label": "Pourquoi Command facilite-t-il undo / redo ?",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Chaque action existe comme objet autonome, donc on peut la conserver dans un historique et la rejouer ou l annuler.",
      "choices": [
        {
          "id": "history",
          "label": "Parce que les actions sont historisees comme objets"
        },
        {
          "id": "inheritance",
          "label": "Parce qu il utilise surtout l heritage"
        },
        {
          "id": "singleton",
          "label": "Parce qu il impose une instance unique"
        }
      ],
      "correctChoiceIds": [
        "history"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "command-q7",
      "label": "Sans Command, un bouton Undo devient souvent plus difficile a implementer proprement.",
      "type": "TRUE_FALSE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Sans objet commande et sans historique explicite, il faut reconstruire l etat avec une logique plus fragile.",
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
      "id": "command-q8",
      "label": "Quel exemple illustre bien Command ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Un editeur avec undo / redo ou un simulateur d actions joueur sont des exemples tres classiques.",
      "choices": [
        {
          "id": "editor",
          "label": "Editeur avec undo / redo"
        },
        {
          "id": "entity",
          "label": "Entite JPA"
        },
        {
          "id": "dto",
          "label": "DTO"
        }
      ],
      "correctChoiceIds": [
        "editor"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "command-q9",
      "label": "Le receiver :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le receiver est l objet qui sait vraiment comment effectuer l action metier.",
      "choices": [
        {
          "id": "real-work",
          "label": "Porte le vrai comportement metier"
        },
        {
          "id": "history",
          "label": "Stocke uniquement l historique"
        },
        {
          "id": "choose",
          "label": "Choisit toujours la commande"
        }
      ],
      "correctChoiceIds": [
        "real-work"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "command-q10",
      "label": "Remets la boucle Command dans le bon ordre.",
      "type": "ORDERING",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le client cree la commande, l invoker la declenche, le receiver agit, puis l historique permet undo / redo.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [
        {
          "id": "create",
          "label": "Le client cree la commande"
        },
        {
          "id": "trigger",
          "label": "L invoker declenche la commande"
        },
        {
          "id": "execute",
          "label": "Le receiver applique l action"
        },
        {
          "id": "history",
          "label": "L historique permet undo / redo"
        }
      ],
      "correctOrder": [
        "create",
        "trigger",
        "execute",
        "history"
      ]
    }
  ]
}

