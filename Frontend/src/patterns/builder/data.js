export const patternCode = "builder"

export const patternDefinition = {
  "code": "builder",
  "name": "Builder",
  "type": "CREATIONAL",
  "description": "Construit un objet complexe etape par etape au lieu de pousser une longue liste de parametres dans un constructeur geant.",
  "useCase": "Assembler visuellement une voiture, un personnage ou une maison en posant structure, noyau, module et finition dans un ordre lisible.",
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
        "WITH_BUILDER",
        "WITHOUT_BUILDER"
      ],
      "defaultValue": "WITH_BUILDER"
    },
    {
      "name": "buildName",
      "label": "Nom du build",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Aurora Mk II"
    },
    {
      "name": "productType",
      "label": "Type d objet",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "CAR",
        "CHARACTER",
        "HOUSE"
      ],
      "defaultValue": "CAR"
    },
    {
      "name": "silhouette",
      "label": "Étape 1 · Structure",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "COMPACT",
        "BALANCED",
        "GRAND"
      ],
      "defaultValue": "BALANCED"
    },
    {
      "name": "coreModule",
      "label": "Étape 2 · Noyau",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "ELECTRIC",
        "ARCANE",
        "SOLAR"
      ],
      "defaultValue": "ELECTRIC"
    },
    {
      "name": "addonModule",
      "label": "Étape 3 · Module",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "DEFENSE",
        "MOBILITY",
        "SUPPORT"
      ],
      "defaultValue": "SUPPORT"
    },
    {
      "name": "finishStyle",
      "label": "Étape 4 · Finition",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "CLASSIC",
        "NEON",
        "ECO"
      ],
      "defaultValue": "CLASSIC"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "Le produit se construit morceau par morceau au lieu de sortir d un constructeur geant opaque.",
  "intuition": "Builder separe le processus de construction du produit final. Le client exprime un besoin, le director orchestre l ordre, et le builder concret pose chaque brique clairement.",
  "readingGuide": "Observe d abord la progression des étapes dans la scene, puis regarde l objet se completer. L UML montre le trio Client / Director / Builder, la scene runtime montre la construction progressive.",
  "studentAngle": "Le declic pedagogique est de voir qu on ne cree pas un objet complexe en une seule ligne obscure : on le fabrique par étapes lisibles.",
  "developerAngle": "Builder devient utile des qu un constructeur accumule trop de parametres, que l ordre de creation compte, ou qu on veut produire plusieurs variantes d un meme objet.",
  "playfulPrompt": "Change le type d objet, rejoue l assemblage puis compare avec et sans Builder pour voir quand le produit apparait et comment les étapes restent lisibles.",
  "steps": [
    "Le client demande un type de build et des options.",
    "Le Director impose un ordre de construction stable.",
    "Le Builder concret pose chaque etape une a une.",
    "Le produit final est recupere avec une structure complete et un processus lisible."
  ],
  "glossary": [
    {
      "term": "Director",
      "definition": "Objet qui orchestre l ordre des étapes de construction sans contenir le produit final."
    },
    {
      "term": "Builder concret",
      "definition": "Implementation qui assemble reellement le produit a chaque etape."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 1280 720",
  "classes": [
    {
      "id": "client",
      "x": 72,
      "y": 246,
      "width": 250,
      "height": 136,
      "title": "BuildWorkshopClient",
      "stereotype": "Client",
      "methods": [
        "+ requestBuild()",
        "+ chooseOptions()"
      ],
      "tone": "teal"
    },
    {
      "id": "director",
      "x": 392,
      "y": 230,
      "width": 272,
      "height": 154,
      "title": "ArtifactDirector",
      "stereotype": "Director",
      "methods": [
        "+ construct(buildName, options, builder)"
      ],
      "tone": "sand"
    },
    {
      "id": "builder",
      "x": 754,
      "y": 58,
      "width": 286,
      "height": 136,
      "title": "ArtifactBuilder",
      "stereotype": "Builder",
      "methods": [
        "+ reset(buildName, productType)",
        "+ applySilhouette()",
        "+ applyCoreModule()",
        "+ build(): BuiltArtifact"
      ],
      "tone": "sand"
    },
    {
      "id": "concrete",
      "x": 754,
      "y": 286,
      "width": 294,
      "height": 178,
      "title": "WorkshopArtifactBuilder",
      "stereotype": "Concrete Builder",
      "fields": [
        "- stages: List<BuildStage>",
        "- runningStats: BuildStats"
      ],
      "methods": [
        "+ applySilhouette()",
        "+ applyCoreModule()",
        "+ applyAddonModule()",
        "+ applyFinishStyle()",
        "+ build()"
      ],
      "tone": "accent"
    },
    {
      "id": "product",
      "x": 754,
      "y": 548,
      "width": 286,
      "height": 136,
      "title": "BuiltArtifact",
      "stereotype": "Product",
      "fields": [
        "+ buildName: String",
        "+ productType: BuilderProductType",
        "+ stats: BuildStats"
      ],
      "methods": [
        "+ stages(): List<BuildStage>"
      ],
      "tone": "teal"
    }
  ],
  "relations": [
    {
      "from": "client",
      "to": "director",
      "label": "request build",
      "marker": "arrow"
    },
    {
      "from": "director",
      "to": "builder",
      "label": "orchestrates",
      "marker": "arrow",
      "points": [
        {
          "x": 652,
          "y": 178
        },
        {
          "x": 760,
          "y": 178
        }
      ]
    },
    {
      "from": "concrete",
      "to": "builder",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 898,
      "labelY": 244,
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "concrete",
      "to": "product",
      "fromSide": "bottom",
      "toSide": "top",
      "label": "build()",
      "labelX": 900,
      "labelY": 508,
      "marker": "arrow"
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "builder",
  "title": "Quiz Builder",
  "description": "Teste ta comprehension de la construction progressive, du director et du builder concret.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "builder-q1",
      "label": "Le pattern Builder permet surtout de :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Builder construit un objet complexe etape par etape au lieu de pousser une longue liste de parametres dans un constructeur geant.",
      "choices": [
        {
          "id": "share",
          "label": "Partager la memoire"
        },
        {
          "id": "progressive",
          "label": "Construire un objet progressivement"
        },
        {
          "id": "notify",
          "label": "Notifier des abonnes"
        }
      ],
      "correctChoiceIds": [
        "progressive"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "builder-q2",
      "label": "Builder est utile quand la construction devient trop lourde pour un seul constructeur.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "C est le cas classique vise par le pattern : rendre la creation lisible et progressive.",
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
      "id": "builder-q3",
      "label": "Builder appartient a la famille :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Builder est un pattern de creation.",
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
        "creational"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "builder-q4",
      "label": "Le Director sert principalement a :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Il orchestre l ordre des étapes sans contenir lui-meme le produit final.",
      "choices": [
        {
          "id": "store",
          "label": "Stocker le produit final"
        },
        {
          "id": "orchestrate",
          "label": "Orchestrer les etapes"
        },
        {
          "id": "render",
          "label": "Afficher l interface"
        }
      ],
      "correctChoiceIds": [
        "orchestrate"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "builder-q5",
      "label": "Associe chaque role Builder a sa responsabilite.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le builder assemble, le director orchestre et le product represente l objet final.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "builder",
          "label": "Builder"
        },
        {
          "id": "director",
          "label": "Director"
        },
        {
          "id": "product",
          "label": "Product"
        }
      ],
      "rightItems": [
        {
          "id": "assemble",
          "label": "Assemble les pieces"
        },
        {
          "id": "order",
          "label": "Orchestre l ordre"
        },
        {
          "id": "result",
          "label": "Objet final construit"
        }
      ],
      "correctPairs": [
        {
          "leftId": "builder",
          "rightId": "assemble"
        },
        {
          "leftId": "director",
          "rightId": "order"
        },
        {
          "leftId": "product",
          "rightId": "result"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "builder-q6",
      "label": "Builder evite surtout :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le pattern evite de laisser au client un constructeur geant rempli de parametres peu lisibles.",
      "choices": [
        {
          "id": "interfaces",
          "label": "Les interfaces"
        },
        {
          "id": "telescoping",
          "label": "Les constructeurs geants"
        },
        {
          "id": "testing",
          "label": "Les tests unitaires"
        }
      ],
      "correctChoiceIds": [
        "telescoping"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "builder-q7",
      "label": "Le meme processus Builder peut produire plusieurs variantes d un objet.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Oui : on garde un flux de construction lisible et on change les options ou le builder concret.",
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
      "id": "builder-q8",
      "label": "Quel cas illustre bien Builder ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Assembler une voiture, une maison ou un personnage par étapes est un bon terrain pour Builder.",
      "choices": [
        {
          "id": "car",
          "label": "Assembler une voiture couche par couche"
        },
        {
          "id": "observer",
          "label": "Notifier des observers"
        },
        {
          "id": "memory",
          "label": "Compresser la memoire"
        }
      ],
      "correctChoiceIds": [
        "car"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "builder-q9",
      "label": "Builder separe principalement :",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le pattern separe la logique de construction de la representation finale du produit.",
      "choices": [
        {
          "id": "construction",
          "label": "Construction et representation"
        },
        {
          "id": "state",
          "label": "Etat et transition"
        },
        {
          "id": "pubsub",
          "label": "Publication et abonnement"
        }
      ],
      "correctChoiceIds": [
        "construction"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "builder-q10",
      "label": "Remets le flux Builder dans le bon ordre.",
      "type": "ORDERING",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le client demande, le director orchestre, le builder pose les etapes, puis le produit final est recupere.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [
        {
          "id": "request",
          "label": "Le client demande un build"
        },
        {
          "id": "director",
          "label": "Le Director orchestre les etapes"
        },
        {
          "id": "steps",
          "label": "Le Builder pose les pieces une a une"
        },
        {
          "id": "result",
          "label": "Le produit final est recupere"
        }
      ],
      "correctOrder": [
        "request",
        "director",
        "steps",
        "result"
      ]
    }
  ]
}

