export const patternCode = "observer"

export const patternDefinition = {
  "code": "observer",
  "name": "Observer",
  "type": "BEHAVIORAL",
  "description": "Relie un sujet a plusieurs abonnes qui recoivent automatiquement chaque notification.",
  "useCase": "Propager un evenement de publication a plusieurs consommateurs sans les coupler entre eux.",
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
        "WITH_OBSERVER",
        "WITHOUT_OBSERVER"
      ],
      "defaultValue": "WITH_OBSERVER"
    },
    {
      "name": "subjectName",
      "label": "Nom du sujet",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "ReleasePublisher"
    },
    {
      "name": "observers",
      "label": "Observers",
      "type": "LIST",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Mobile App, Back Office, Audit Log"
    },
    {
      "name": "message",
      "label": "Notification",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Nouvelle version 1.0 publiee"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "Un evenement unique part du sujet et se propage automatiquement a tous les abonnes.",
  "intuition": "Observer relie un sujet a plusieurs dependants. Quand le sujet change, tous les observers sont prevenus sans que le sujet connaisse leur logique interne.",
  "readingGuide": "Dans la scene, regarde comment le sujet publie un evenement puis comment chaque observer recoit la notification. Dans l UML, observe la collection d observers et l interface commune de notification.",
  "studentAngle": "C est un excellent pattern pour comprendre la diffusion d evenements, les abonnements et le decouplage entre emetteur et recepteurs.",
  "developerAngle": "On le retrouve dans les event buses, les listeners UI, les hooks, les webhooks ou les mecanismes de synchronisation entre modules.",
  "playfulPrompt": "Ajoute, retire ou renomme des observers puis relance la demo pour voir comment le sujet reste stable pendant que le reseau d abonnes evolue.",
  "steps": [
    "Le sujet existe sans connaitre les details de ses abonnes.",
    "Des observers s abonnent au sujet via un contrat commun.",
    "Le sujet emet un evenement.",
    "Chaque observer recoit la notification et reagit a sa facon."
  ],
  "glossary": [
    {
      "term": "Subject",
      "definition": "Source de l evenement qui maintient la liste des observers."
    },
    {
      "term": "Observer",
      "definition": "Abonne qui recoit une mise a jour quand le sujet notifie."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 980 560",
  "classes": [
    {
      "id": "subject",
      "x": 60,
      "y": 150,
      "width": 280,
      "height": 162,
      "title": "NotificationPublisher",
      "stereotype": "Subject",
      "fields": [
        "- observers: List<NotificationObserver>"
      ],
      "methods": [
        "+ subscribe(observer)",
        "+ notifyObservers(message)"
      ],
      "tone": "teal"
    },
    {
      "id": "observer",
      "x": 620,
      "y": 80,
      "width": 270,
      "height": 126,
      "title": "NotificationObserver",
      "stereotype": "Observer",
      "methods": [
        "+ name(): String",
        "+ update(subject, message): NotificationReceipt"
      ],
      "tone": "sand"
    },
    {
      "id": "subscriber",
      "x": 620,
      "y": 320,
      "width": 270,
      "height": 128,
      "title": "SubscriberObserver",
      "stereotype": "Concrete Observer",
      "methods": [
        "+ name()",
        "+ update(subject, message)"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "subject",
      "to": "observer",
      "fromSide": "right",
      "toSide": "left",
      "label": "observers[*]",
      "labelX": 468,
      "labelY": 116,
      "marker": "arrow",
      "points": [
        {
          "x": 470,
          "y": 196
        },
        {
          "x": 470,
          "y": 144
        }
      ]
    },
    {
      "from": "subject",
      "to": "observer",
      "fromSide": "right",
      "toSide": "left",
      "label": "notify()",
      "labelX": 468,
      "labelY": 248,
      "marker": "arrow",
      "points": [
        {
          "x": 470,
          "y": 266
        },
        {
          "x": 470,
          "y": 266
        }
      ]
    },
    {
      "from": "subscriber",
      "to": "observer",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 756,
      "labelY": 264,
      "marker": "triangle",
      "dashed": true
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "observer",
  "title": "Quiz Observer",
  "description": "Valide le mecanisme d abonnement, de notification et de decouplage entre le sujet et ses observers.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "observer-q1",
      "label": "Observer permet surtout de :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Observer permet a un sujet de notifier plusieurs abonnes lorsqu un evenement survient.",
      "choices": [
        {
          "id": "create",
          "label": "Creer des objets"
        },
        {
          "id": "notify",
          "label": "Notifier des abonnes"
        },
        {
          "id": "store",
          "label": "Stocker des donnees"
        }
      ],
      "correctChoiceIds": [
        "notify"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "observer-q2",
      "label": "Observer est base sur une logique pub/sub.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Le sujet publie un changement, les observers inscrits recoivent la mise a jour.",
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
      "id": "observer-q3",
      "label": "Le sujet :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Le sujet maintient la liste des abonnes et declenche les notifications.",
      "choices": [
        {
          "id": "listen",
          "label": "Ecoute"
        },
        {
          "id": "notify",
          "label": "Notifie"
        },
        {
          "id": "ignore",
          "label": "Ignore"
        }
      ],
      "correctChoiceIds": [
        "notify"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "observer-q4",
      "label": "Les observers :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Les observers recoivent les updates du sujet et reagissent chacun a leur maniere.",
      "choices": [
        {
          "id": "receive",
          "label": "Recoivent les updates"
        },
        {
          "id": "create",
          "label": "Creent les sujets"
        },
        {
          "id": "store",
          "label": "Stockent les donnees"
        }
      ],
      "correctChoiceIds": [
        "receive"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "observer-q5",
      "label": "Associe chaque terme a son role.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le subject est la source, l observer ecoute, notify represente l evenement diffuse.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "subject",
          "label": "Subject"
        },
        {
          "id": "observer",
          "label": "Observer"
        },
        {
          "id": "notify",
          "label": "Notify"
        }
      ],
      "rightItems": [
        {
          "id": "source",
          "label": "Source"
        },
        {
          "id": "listen",
          "label": "Ecoute"
        },
        {
          "id": "event",
          "label": "Evenement"
        }
      ],
      "correctPairs": [
        {
          "leftId": "subject",
          "rightId": "source"
        },
        {
          "leftId": "observer",
          "rightId": "listen"
        },
        {
          "leftId": "notify",
          "rightId": "event"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "observer-q6",
      "label": "Observer est un pattern :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Observer appartient a la famille des patterns comportementaux.",
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
      "id": "observer-q7",
      "label": "On peut avoir plusieurs observers sur un meme sujet.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "C est meme la raison d etre du pattern : diffuser a plusieurs abonnes sans coupler le sujet a chacun d eux.",
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
      "id": "observer-q8",
      "label": "Quel exemple illustre bien Observer ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Un systeme de notifications ou d evenements UI est un bon cas d usage.",
      "choices": [
        {
          "id": "calc",
          "label": "Calcul"
        },
        {
          "id": "notifications",
          "label": "Notifications"
        },
        {
          "id": "database",
          "label": "Base de donnees"
        }
      ],
      "correctChoiceIds": [
        "notifications"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "observer-q9",
      "label": "Observer permet surtout :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le sujet depend d un contrat observer, pas des implementations concretes des abonnes.",
      "choices": [
        {
          "id": "decoupling",
          "label": "Decouplage"
        },
        {
          "id": "strong",
          "label": "Dependance forte"
        },
        {
          "id": "less-code",
          "label": "Moins de code"
        }
      ],
      "correctChoiceIds": [
        "decoupling"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "observer-q10",
      "label": "Quand utiliser Observer ?",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Quand un changement d etat doit etre diffuse vers plusieurs recepteurs potentiels.",
      "choices": [
        {
          "id": "single-class",
          "label": "Une seule classe"
        },
        {
          "id": "events",
          "label": "Evenements"
        },
        {
          "id": "simple-logic",
          "label": "Logique simple"
        }
      ],
      "correctChoiceIds": [
        "events"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    }
  ]
}

