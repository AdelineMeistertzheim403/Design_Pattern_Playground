export const patternCode = "chain"

export const patternDefinition = {
  "code": "chain",
  "name": "Chain of Responsibility",
  "type": "BEHAVIORAL",
  "description": "Fait circuler une requete dans une chaine de handlers capables de la laisser passer, de la bloquer ou de la traiter.",
  "useCase": "Visualiser un pipeline auth -> validation -> traitement ou chaque maillon prend une decision locale sans gros controller central.",
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
        "WITH_CHAIN",
        "WITHOUT_CHAIN"
      ],
      "defaultValue": "WITH_CHAIN"
    },
    {
      "name": "requestName",
      "label": "Nom de la requete",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Export mensuel"
    },
    {
      "name": "tokenState",
      "label": "Etat du token",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "VALID",
        "EXPIRED",
        "MISSING"
      ],
      "defaultValue": "VALID"
    },
    {
      "name": "payloadState",
      "label": "Etat du payload",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "VALID",
        "INVALID"
      ],
      "defaultValue": "VALID"
    },
    {
      "name": "processingTarget",
      "label": "Traitement cible",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "REPORT_EXPORT",
        "BULK_IMPORT",
        "PASSWORD_RESET"
      ],
      "defaultValue": "REPORT_EXPORT"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "La requete traverse une suite de maillons autonomes qui peuvent la laisser passer, la bloquer ou la traiter.",
  "intuition": "Chain of Responsibility decoupe un pipeline en handlers specialises. Chaque maillon connait son propre test et delegue au suivant au lieu d encombrer un controller unique de if / else.",
  "readingGuide": "Observe d abord le trajet de la requete dans la scene, puis regarde quel handler a stoppe ou traite le flux. L UML montre la liaison entre handlers, la scene raconte le passage runtime.",
  "studentAngle": "Le declic pedagogique est de voir qu une requete ne connait pas son destinataire final : elle avance maillon apres maillon jusqu a ce qu un handler prenne la main.",
  "developerAngle": "Le pattern devient pertinent dans des middlewares HTTP, des pipelines de validation, des workflows de moderation ou des circuits de support multi-niveaux.",
  "playfulPrompt": "Change l etat du token ou du payload, relance la demo et regarde a quel endroit la requete est stoppee ou laissee passer.",
  "steps": [
    "Le client envoie une requete au premier handler.",
    "Chaque handler decide localement si la requete peut continuer.",
    "La chaine s arrete des qu un maillon rejette ou traite le flux.",
    "Comparer ce comportement avec un controller monolithique plein de conditions."
  ],
  "glossary": [
    {
      "term": "Handler",
      "definition": "Maillon specialise qui peut verifier, traiter ou deleguer la requete au suivant."
    },
    {
      "term": "Propagation",
      "definition": "Passage de la requete d un maillon a l autre jusqu a une decision finale."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 1240 760",
  "classes": [
    {
      "id": "client",
      "x": 72,
      "y": 256,
      "width": 244,
      "height": 130,
      "title": "RequestClient",
      "stereotype": "Client",
      "methods": [
        "+ submit(request)"
      ],
      "tone": "teal"
    },
    {
      "id": "handler",
      "x": 454,
      "y": 64,
      "width": 316,
      "height": 150,
      "title": "RequestHandler",
      "stereotype": "Handler",
      "fields": [
        "- next: RequestHandler"
      ],
      "methods": [
        "+ linkWith(next)",
        "+ handle(request): Result",
        "# evaluate(request): Decision"
      ],
      "tone": "sand"
    },
    {
      "id": "auth",
      "x": 374,
      "y": 326,
      "width": 238,
      "height": 126,
      "title": "AuthenticationHandler",
      "stereotype": "Concrete Handler",
      "methods": [
        "+ evaluate(request)"
      ],
      "tone": "accent"
    },
    {
      "id": "validation",
      "x": 666,
      "y": 326,
      "width": 238,
      "height": 126,
      "title": "ValidationHandler",
      "stereotype": "Concrete Handler",
      "methods": [
        "+ evaluate(request)"
      ],
      "tone": "accent"
    },
    {
      "id": "processing",
      "x": 958,
      "y": 326,
      "width": 214,
      "height": 126,
      "title": "ProcessingHandler",
      "stereotype": "Concrete Handler",
      "methods": [
        "+ evaluate(request)"
      ],
      "tone": "accent"
    },
    {
      "id": "request",
      "x": 72,
      "y": 520,
      "width": 244,
      "height": 132,
      "title": "PipelineRequest",
      "stereotype": "Request",
      "fields": [
        "+ tokenState: RequestTokenState",
        "+ payloadState: RequestPayloadState",
        "+ target: ProcessingTarget"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "client",
      "to": "handler",
      "label": "submit(request)",
      "marker": "arrow"
    },
    {
      "from": "auth",
      "to": "handler",
      "label": "extends",
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "validation",
      "to": "handler",
      "label": "extends",
      "marker": "triangle",
      "dashed": true,
      "points": [
        {
          "x": 786,
          "y": 288
        },
        {
          "x": 786,
          "y": 240
        },
        {
          "x": 612,
          "y": 240
        }
      ]
    },
    {
      "from": "processing",
      "to": "handler",
      "label": "extends",
      "marker": "triangle",
      "dashed": true,
      "points": [
        {
          "x": 1064,
          "y": 288
        },
        {
          "x": 1064,
          "y": 228
        },
        {
          "x": 758,
          "y": 228
        }
      ]
    },
    {
      "from": "handler",
      "to": "request",
      "fromSide": "left",
      "toSide": "right",
      "label": "handle(request)",
      "labelX": 336,
      "labelY": 492,
      "marker": "arrow",
      "points": [
        {
          "x": 420,
          "y": 140
        },
        {
          "x": 420,
          "y": 586
        }
      ]
    },
    {
      "from": "auth",
      "to": "validation",
      "label": "next",
      "marker": "arrow"
    },
    {
      "from": "validation",
      "to": "processing",
      "label": "next",
      "marker": "arrow"
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "chain",
  "title": "Quiz Chain of Responsibility",
  "description": "Teste ta comprehension d une requete qui traverse une chaine de handlers capables de laisser passer, bloquer ou traiter le flux.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "chain-q1",
      "label": "Le pattern Chain of Responsibility permet surtout de :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Chaque handler decide localement s il traite la requete ou s il la transmet au maillon suivant.",
      "choices": [
        {
          "id": "create",
          "label": "Créer des objets"
        },
        {
          "id": "route",
          "label": "Faire circuler une requete entre plusieurs handlers"
        },
        {
          "id": "share",
          "label": "Partager la memoire"
        }
      ],
      "correctChoiceIds": [
        "route"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "chain-q2",
      "label": "Un handler peut stopper la chaine avant le dernier maillon.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Oui : si une condition echoue, le handler courant peut rejeter la requete et ne pas deleguer plus loin.",
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
      "id": "chain-q3",
      "label": "Chain of Responsibility est un pattern :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Il s agit d un pattern comportemental.",
      "choices": [
        {
          "id": "creational",
          "label": "De creation"
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
      "id": "chain-q4",
      "label": "Quel avantage apporte la chaine par rapport a un gros controller plein de if / else ?",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Chaque controle reste localise dans un handler specialise plutot que centralise dans une seule methode.",
      "choices": [
        {
          "id": "faster",
          "label": "Toujours plus rapide"
        },
        {
          "id": "local",
          "label": "Chaque regle reste dans un handler dedie"
        },
        {
          "id": "singleton",
          "label": "Une seule instance imposee"
        }
      ],
      "correctChoiceIds": [
        "local"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "chain-q5",
      "label": "Associe chaque role a sa responsabilite.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le client envoie la requete, le handler la traite ou la transmet, le next handler prend la suite si necessaire.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "client",
          "label": "Client"
        },
        {
          "id": "handler",
          "label": "Handler"
        },
        {
          "id": "next",
          "label": "Next handler"
        }
      ],
      "rightItems": [
        {
          "id": "send",
          "label": "Envoie la requete"
        },
        {
          "id": "decide",
          "label": "Traite ou transmet"
        },
        {
          "id": "continue",
          "label": "Poursuit la chaine"
        }
      ],
      "correctPairs": [
        {
          "leftId": "client",
          "rightId": "send"
        },
        {
          "leftId": "handler",
          "rightId": "decide"
        },
        {
          "leftId": "next",
          "rightId": "continue"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "chain-q6",
      "label": "Tous les handlers doivent obligatoirement traiter la requete.",
      "type": "TRUE_FALSE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Non : beaucoup de handlers ne font que verifier une condition puis laisser passer.",
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
        "false"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "chain-q7",
      "label": "Quel exemple illustre bien Chain of Responsibility ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Les pipelines d authentification, validation, moderation ou support multi-niveaux sont des exemples typiques.",
      "choices": [
        {
          "id": "pipeline",
          "label": "Pipeline auth / validation / traitement"
        },
        {
          "id": "dto",
          "label": "DTO"
        },
        {
          "id": "entity",
          "label": "Entite de base de donnees"
        }
      ],
      "correctChoiceIds": [
        "pipeline"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "chain-q8",
      "label": "Si un payload est invalide, que fait typiquement le ValidationHandler ?",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Il rejette la requete et la chaine s arrete avant le traitement métier.",
      "choices": [
        {
          "id": "ignore",
          "label": "Il ignore le probleme et continue"
        },
        {
          "id": "reject",
          "label": "Il bloque la requete"
        },
        {
          "id": "create",
          "label": "Il cree un nouveau handler"
        }
      ],
      "correctChoiceIds": [
        "reject"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "chain-q9",
      "label": "Chain of Responsibility aide surtout a :",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le pattern reduit le couplage entre l emetteur et le maillon final qui traitera vraiment la requete.",
      "choices": [
        {
          "id": "decouple",
          "label": "Decoupler emetteur et traitement final"
        },
        {
          "id": "memory",
          "label": "Compresser la memoire"
        },
        {
          "id": "inheritance",
          "label": "Imposer une hierarchie profonde"
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
      "id": "chain-q10",
      "label": "Remets le pipeline dans le bon ordre.",
      "type": "ORDERING",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "La requete entre, passe l auth, puis la validation, puis le traitement final si rien ne bloque avant.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [
        {
          "id": "request",
          "label": "La requete entre dans la chaine"
        },
        {
          "id": "auth",
          "label": "AuthenticationHandler controle l acces"
        },
        {
          "id": "validation",
          "label": "ValidationHandler controle le payload"
        },
        {
          "id": "processing",
          "label": "ProcessingHandler traite la requete"
        }
      ],
      "correctOrder": [
        "request",
        "auth",
        "validation",
        "processing"
      ]
    }
  ]
}

