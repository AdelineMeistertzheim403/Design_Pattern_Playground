export const patternCode = "strategy"

export const patternDefinition = {
  "code": "strategy",
  "name": "Strategy",
  "type": "BEHAVIORAL",
  "description": "Permet de changer un algorithme a l execution sans modifier le contexte.",
  "useCase": "Basculer entre plusieurs modes de paiement dans un meme workflow.",
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
        "WITH_STRATEGY",
        "WITHOUT_STRATEGY"
      ],
      "defaultValue": "WITH_STRATEGY"
    },
    {
      "name": "amount",
      "label": "Montant",
      "type": "NUMBER",
      "required": true,
      "allowedValues": null,
      "defaultValue": "100"
    },
    {
      "name": "strategy",
      "label": "Strategie",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "CARD",
        "PAYPAL",
        "CRYPTO"
      ],
      "defaultValue": "CARD"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "Le contexte garde le meme workflow, mais l algorithme peut changer a la demande.",
  "intuition": "Strategy encapsule plusieurs comportements interchangeables. On choisit une strategie au runtime au lieu de multiplier les conditions dans le contexte.",
  "readingGuide": "Dans la scene, le contexte reste identique pendant que la strategie active change. Dans l UML, repere l interface commune et les strategies concretes qui l implementent.",
  "studentAngle": "Ce pattern est ideal pour comprendre qu un comportement peut devenir un objet a part entiere.",
  "developerAngle": "Utilise-le quand les if / switch sur des comportements explosent ou quand tu veux rendre un workflow testable et extensible.",
  "playfulPrompt": "Change la strategie de paiement et observe que seul l algorithme varie, pas le contexte qui l orchestre.",
  "steps": [
    "Le contexte recoit une strategie compatible avec le meme contrat.",
    "Le contexte delegue le travail a cette strategie.",
    "La strategie concrete applique son algorithme.",
    "Le resultat revient sans que le contexte change de structure."
  ],
  "glossary": [
    {
      "term": "Context",
      "definition": "Objet qui utilise une strategie sans connaitre son implementation detaillee."
    },
    {
      "term": "Strategy",
      "definition": "Contrat commun pour plusieurs algorithmes interchangeables."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 960 600",
  "classes": [
    {
      "id": "context",
      "x": 60,
      "y": 180,
      "width": 254,
      "height": 144,
      "title": "PaymentContext",
      "stereotype": "Context",
      "fields": [
        "- strategy: PaymentStrategy"
      ],
      "methods": [
        "+ setStrategy(strategy)",
        "+ execute(amount): String"
      ],
      "tone": "teal"
    },
    {
      "id": "strategy",
      "x": 590,
      "y": 60,
      "width": 260,
      "height": 128,
      "title": "PaymentStrategy",
      "stereotype": "Strategy",
      "methods": [
        "+ code(): String",
        "+ label(): String",
        "+ pay(amount): String"
      ],
      "tone": "sand"
    },
    {
      "id": "card",
      "x": 360,
      "y": 340,
      "width": 180,
      "height": 118,
      "title": "CardPaymentStrategy",
      "stereotype": "Concrete Strategy",
      "methods": [
        "+ pay(amount)"
      ],
      "tone": "accent"
    },
    {
      "id": "paypal",
      "x": 580,
      "y": 340,
      "width": 180,
      "height": 118,
      "title": "PaypalPaymentStrategy",
      "stereotype": "Concrete Strategy",
      "methods": [
        "+ pay(amount)"
      ],
      "tone": "accent"
    },
    {
      "id": "crypto",
      "x": 800,
      "y": 340,
      "width": 180,
      "height": 118,
      "title": "CryptoPaymentStrategy",
      "stereotype": "Concrete Strategy",
      "methods": [
        "+ pay(amount)"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "context",
      "to": "strategy",
      "fromSide": "right",
      "toSide": "left",
      "label": "uses",
      "labelX": 446,
      "labelY": 160,
      "marker": "arrow",
      "points": [
        {
          "x": 420,
          "y": 252
        },
        {
          "x": 420,
          "y": 124
        }
      ]
    },
    {
      "from": "card",
      "to": "strategy",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 438,
      "labelY": 252,
      "marker": "triangle",
      "dashed": true,
      "points": [
        {
          "x": 450,
          "y": 252
        },
        {
          "x": 650,
          "y": 252
        }
      ]
    },
    {
      "from": "paypal",
      "to": "strategy",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 668,
      "labelY": 252,
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "crypto",
      "to": "strategy",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 878,
      "labelY": 252,
      "marker": "triangle",
      "dashed": true,
      "points": [
        {
          "x": 890,
          "y": 252
        },
        {
          "x": 790,
          "y": 252
        }
      ]
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "strategy",
  "title": "Quiz Strategy",
  "description": "Teste ta comprehension des algorithmes interchangeables, du contexte et du choix dynamique de comportement.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "strategy-q1",
      "label": "Strategy permet :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Le pattern encapsule des algorithmes pour pouvoir en changer a l execution.",
      "choices": [
        {
          "id": "algorithm",
          "label": "Changer d algorithme"
        },
        {
          "id": "objects",
          "label": "Créer des objets"
        },
        {
          "id": "data",
          "label": "Stocker des donnees"
        }
      ],
      "correctChoiceIds": [
        "algorithm"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "strategy-q2",
      "label": "Strategy encapsule des comportements.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Chaque strategie concrete porte un comportement ou un algorithme bien defini.",
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
      "id": "strategy-q3",
      "label": "Strategy remplace souvent :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le pattern est souvent utilise pour remplacer des branches conditionnelles qui choisissent un algorithme.",
      "choices": [
        {
          "id": "factory",
          "label": "Factory"
        },
        {
          "id": "observer",
          "label": "Observer"
        },
        {
          "id": "ifelse",
          "label": "if/else"
        }
      ],
      "correctChoiceIds": [
        "ifelse"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "strategy-q4",
      "label": "Une strategy est generalement :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "On modelise souvent chaque strategie comme une classe concrete derriere une interface commune.",
      "choices": [
        {
          "id": "variable",
          "label": "Une variable"
        },
        {
          "id": "class",
          "label": "Une classe"
        },
        {
          "id": "interface-only",
          "label": "Une interface seule"
        }
      ],
      "correctChoiceIds": [
        "class"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "strategy-q5",
      "label": "Associe chaque role a sa responsabilite.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le client choisit, le contexte utilise, la strategie porte le comportement concret.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "strategy",
          "label": "Strategy"
        },
        {
          "id": "context",
          "label": "Context"
        },
        {
          "id": "client",
          "label": "Client"
        }
      ],
      "rightItems": [
        {
          "id": "behavior",
          "label": "Comportement"
        },
        {
          "id": "use",
          "label": "Utilise"
        },
        {
          "id": "choose",
          "label": "Choisit"
        }
      ],
      "correctPairs": [
        {
          "leftId": "strategy",
          "rightId": "behavior"
        },
        {
          "leftId": "context",
          "rightId": "use"
        },
        {
          "leftId": "client",
          "rightId": "choose"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "strategy-q6",
      "label": "Strategy est un pattern :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Strategy appartient a la famille des patterns comportementaux.",
      "choices": [
        {
          "id": "creational",
          "label": "Création"
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
      "id": "strategy-q7",
      "label": "On peut changer la strategy a runtime.",
      "type": "TRUE_FALSE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "C est meme la promesse du pattern : changer l algorithme sans modifier le contexte.",
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
      "id": "strategy-q8",
      "label": "Quel exemple illustre bien Strategy ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Un mode de paiement interchangeable est un exemple classique et tres pedagogique.",
      "choices": [
        {
          "id": "database",
          "label": "Base de donnees"
        },
        {
          "id": "payment",
          "label": "Paiement"
        },
        {
          "id": "ui",
          "label": "UI"
        }
      ],
      "correctChoiceIds": [
        "payment"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "strategy-q9",
      "label": "Le context :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le contexte delegue l execution a la strategie courante plutot que de coder l algorithme en dur.",
      "choices": [
        {
          "id": "create-all",
          "label": "Cree tout"
        },
        {
          "id": "use",
          "label": "Utilise la strategy"
        },
        {
          "id": "ignore",
          "label": "Ignore la strategy"
        }
      ],
      "correctChoiceIds": [
        "use"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "strategy-q10",
      "label": "Strategy apporte surtout :",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le pattern apporte de la flexibilite et reduit le couplage entre le contexte et les variantes d algorithme.",
      "choices": [
        {
          "id": "flexibility",
          "label": "Flexibilite"
        },
        {
          "id": "rigidity",
          "label": "Rigidite"
        },
        {
          "id": "strong-coupling",
          "label": "Dependance forte"
        }
      ],
      "correctChoiceIds": [
        "flexibility"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    }
  ]
}

