export const patternCode = "factory"

export const patternDefinition = {
  "code": "factory",
  "name": "Factory Method",
  "type": "CREATIONAL",
  "description": "Centralise la creation d objets derriere une fabrique specialisee.",
  "useCase": "Choisir dynamiquement le bon type de vehicule sans dupliquer des constructeurs.",
  "complexityLevel": "BEGINNER"
}

export const fallbackSchema = {
  "fields": [
    {
      "name": "mode",
      "label": "Mode",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "WITH_FACTORY",
        "WITHOUT_FACTORY"
      ],
      "defaultValue": "WITH_FACTORY"
    },
    {
      "name": "vehicleType",
      "label": "Type de vehicule",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "CAR",
        "BIKE"
      ],
      "defaultValue": "CAR"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "Le client demande un produit, la fabrique choisit la bonne classe concrete.",
  "intuition": "Factory Method sert a centraliser la creation. Le client ne sait pas quelle classe concrete est instanciee, il depend seulement du type retourne.",
  "readingGuide": "Dans la scene, suis la requete du client vers la factory, puis la creation du produit. Dans l UML, regarde comment la fabrique depend du produit abstrait et non des usages du client.",
  "studentAngle": "Ce pattern t apprend a separer le moment ou on choisit une implementation du moment ou on l utilise.",
  "developerAngle": "C est utile des que des branches de creation commencent a se repeter dans plusieurs services ou composants.",
  "playfulPrompt": "Bascule entre CAR et BIKE et observe ce qui change: le produit concret, pas la facon de demander sa creation.",
  "steps": [
    "Le client exprime un besoin.",
    "La factory decide quelle implementation creer.",
    "Un produit concret est instancie.",
    "Le client recupere un contrat stable au lieu d un constructeur direct."
  ],
  "glossary": [
    {
      "term": "Creator",
      "definition": "Objet responsable de la creation du produit."
    },
    {
      "term": "Concrete Product",
      "definition": "Implementation concrete creee par la factory."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 920 520",
  "classes": [
    {
      "id": "factory",
      "x": 60,
      "y": 86,
      "width": 240,
      "height": 132,
      "title": "VehicleFactory",
      "stereotype": "Creator",
      "methods": [
        "+ createVehicle(type: String): Vehicle"
      ],
      "tone": "teal"
    },
    {
      "id": "vehicle",
      "x": 602,
      "y": 80,
      "width": 236,
      "height": 142,
      "title": "Vehicle",
      "stereotype": "Product",
      "methods": [
        "+ type(): String",
        "+ label(): String",
        "+ description(): String"
      ],
      "tone": "sand"
    },
    {
      "id": "car",
      "x": 420,
      "y": 320,
      "width": 190,
      "height": 118,
      "title": "Car",
      "stereotype": "Concrete Product",
      "methods": [
        "+ type()",
        "+ label()",
        "+ description()"
      ],
      "tone": "accent"
    },
    {
      "id": "bike",
      "x": 646,
      "y": 320,
      "width": 190,
      "height": 118,
      "title": "Bike",
      "stereotype": "Concrete Product",
      "methods": [
        "+ type()",
        "+ label()",
        "+ description()"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "factory",
      "to": "vehicle",
      "fromSide": "right",
      "toSide": "left",
      "label": "creates",
      "labelX": 448,
      "labelY": 128,
      "marker": "arrow"
    },
    {
      "from": "car",
      "to": "vehicle",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 520,
      "labelY": 270,
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "bike",
      "to": "vehicle",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 740,
      "labelY": 270,
      "marker": "triangle",
      "dashed": true
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "factory",
  "title": "Quiz Factory Method",
  "description": "Valide ta comprehension de la creation centralisee et du decouplage entre le client et les produits concrets.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "factory-q1",
      "label": "La Factory sert a :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "La factory encapsule la creation des objets pour eviter de disperser les instanciations dans le code client.",
      "choices": [
        {
          "id": "modify",
          "label": "Modifier un objet"
        },
        {
          "id": "create",
          "label": "Creer des objets"
        },
        {
          "id": "delete",
          "label": "Supprimer des objets"
        }
      ],
      "correctChoiceIds": [
        "create"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "factory-q2",
      "label": "La Factory centralise la creation.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "C est l interet principal du pattern : un point d entree unique pour instancier les produits.",
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
      "id": "factory-q3",
      "label": "La Factory evite surtout :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Elle evite de multiplier les appels a new un peu partout dans le code applicatif.",
      "choices": [
        {
          "id": "interfaces",
          "label": "Les interfaces"
        },
        {
          "id": "news",
          "label": "Les new disperses"
        },
        {
          "id": "classes",
          "label": "Les classes"
        }
      ],
      "correctChoiceIds": [
        "news"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "factory-q4",
      "label": "Qui appelle la factory ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Le client demande une creation a la factory au lieu d instancier le produit concret lui-meme.",
      "choices": [
        {
          "id": "database",
          "label": "La base de donnees"
        },
        {
          "id": "client",
          "label": "Le client"
        },
        {
          "id": "server",
          "label": "Le serveur"
        }
      ],
      "correctChoiceIds": [
        "client"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "factory-q5",
      "label": "Associe chaque role a sa responsabilite.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "La factory cree, le produit est l objet final, et le client exprime le besoin de creation.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "factory",
          "label": "Factory"
        },
        {
          "id": "product",
          "label": "Produit"
        },
        {
          "id": "client",
          "label": "Client"
        }
      ],
      "rightItems": [
        {
          "id": "create",
          "label": "Cree"
        },
        {
          "id": "object",
          "label": "Objet"
        },
        {
          "id": "request",
          "label": "Demande"
        }
      ],
      "correctPairs": [
        {
          "leftId": "factory",
          "rightId": "create"
        },
        {
          "leftId": "product",
          "rightId": "object"
        },
        {
          "leftId": "client",
          "rightId": "request"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "factory-q6",
      "label": "Factory est un pattern :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Factory Method appartient a la famille des patterns de creation.",
      "choices": [
        {
          "id": "creational",
          "label": "Creation"
        },
        {
          "id": "behavioral",
          "label": "Comportemental"
        },
        {
          "id": "structural",
          "label": "Structurel"
        }
      ],
      "correctChoiceIds": [
        "creational"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "factory-q7",
      "label": "La Factory retourne typiquement :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Une factory renvoie une instance prete a l emploi, souvent typee via une abstraction commune.",
      "choices": [
        {
          "id": "null",
          "label": "null"
        },
        {
          "id": "object",
          "label": "Un objet"
        },
        {
          "id": "interface-only",
          "label": "Une interface uniquement"
        }
      ],
      "correctChoiceIds": [
        "object"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "factory-q8",
      "label": "La Factory ameliore la flexibilite.",
      "type": "TRUE_FALSE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Elle permet de remplacer plus facilement le type concret cree sans casser le code client.",
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
      "id": "factory-q9",
      "label": "Quel exemple illustre bien Factory ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Choisir dynamiquement quel vehicule concret instancier est un exemple classique de factory.",
      "choices": [
        {
          "id": "login",
          "label": "Login"
        },
        {
          "id": "vehicle",
          "label": "Creation de vehicules"
        },
        {
          "id": "logs",
          "label": "Logs"
        }
      ],
      "correctChoiceIds": [
        "vehicle"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "factory-q10",
      "label": "Factory permet principalement de :",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le gain majeur est de separer la logique de creation de la logique d utilisation.",
      "choices": [
        {
          "id": "decouple",
          "label": "Decoupler creation et usage"
        },
        {
          "id": "remove-classes",
          "label": "Supprimer les classes"
        },
        {
          "id": "ui",
          "label": "Ameliorer l UI"
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
    }
  ]
}

