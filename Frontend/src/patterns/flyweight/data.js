export const patternCode = "flyweight"

export const patternDefinition = {
  "code": "flyweight",
  "name": "Flyweight",
  "type": "STRUCTURAL",
  "description": "Partage l etat intrinseque entre de nombreux objets pour eviter de multiplier les instances lourdes en memoire.",
  "useCase": "Afficher des milliers d arbres, particules ou projectiles en mutualisant textures, meshes et autres donnees communes.",
  "complexityLevel": "ADVANCED"
}

export const fallbackSchema = {
  "fields": [
    {
      "name": "assetType",
      "label": "Type d objet",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "TREE",
        "PARTICLE",
        "BULLET"
      ],
      "defaultValue": "TREE"
    },
    {
      "name": "objectCount",
      "label": "Nombre d objets",
      "type": "NUMBER",
      "required": true,
      "allowedValues": null,
      "defaultValue": "2400"
    },
    {
      "name": "sharedVariantCount",
      "label": "Variantes partagees",
      "type": "NUMBER",
      "required": true,
      "allowedValues": null,
      "defaultValue": "6"
    },
    {
      "name": "useFlyweight",
      "label": "Mode Flyweight",
      "type": "BOOLEAN",
      "required": true,
      "allowedValues": null,
      "defaultValue": "true"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "Des milliers d objets restent affichables parce qu ils partagent les memes donnees lourdes.",
  "intuition": "Flyweight separe ce qui peut etre partage de ce qui doit rester specifique a chaque objet. L etat intrinsique est mutualise, l etat extrinseque reste porte par chaque element a l ecran.",
  "readingGuide": "Observe d abord la foule d objets dans la scene, puis compare le nombre d objets affiches au nombre d instances reelles. Dans l UML, repere la factory de flyweights, l objet partage et l etat extrinseque qui reste cote client.",
  "studentAngle": "Le declic pedagogique est simple : beaucoup d objets visibles ne veut pas dire beaucoup d objets lourds en memoire.",
  "developerAngle": "Le pattern devient pertinent quand plusieurs milliers d elements repetent les memes textures, meshes, glyphes ou regles de rendu et que la duplication commence a couter cher.",
  "playfulPrompt": "Monte brutalement le nombre d objets, coupe puis reactive Flyweight et regarde comment les instances reelles et la memoire simulee se compriment.",
  "steps": [
    "Identifier les donnees communes qui peuvent etre partagees.",
    "Distinguer les variations portees par chaque objet a l execution.",
    "Comparer la memoire sans pattern et avec Flyweight.",
    "Relier cette optimisation a un cas reel de rendu massif ou de catalogue repetitif."
  ],
  "glossary": [
    {
      "term": "Etat intrinsique",
      "definition": "Partie partageable de l objet, typiquement la texture, la forme ou une configuration stable."
    },
    {
      "term": "Etat extrinseque",
      "definition": "Partie variable fournie par le client, comme la position, la taille, la rotation ou le contexte courant."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 1180 720",
  "classes": [
    {
      "id": "client",
      "x": 70,
      "y": 140,
      "width": 274,
      "height": 156,
      "title": "ParticleField",
      "stereotype": "Client",
      "fields": [
        "- flyweightFactory: SceneObjectFlyweightFactory"
      ],
      "methods": [
        "+ spawn(count, assetType)",
        "+ render(extrinsicState)"
      ],
      "tone": "teal"
    },
    {
      "id": "extrinsic",
      "x": 70,
      "y": 390,
      "width": 274,
      "height": 142,
      "title": "ParticleExtrinsicState",
      "stereotype": "Extrinsic State",
      "fields": [
        "+ x: int",
        "+ y: int",
        "+ scale: double"
      ],
      "methods": [
        "+ variantIndex(): int"
      ],
      "tone": "accent"
    },
    {
      "id": "factory",
      "x": 444,
      "y": 100,
      "width": 294,
      "height": 168,
      "title": "SceneObjectFlyweightFactory",
      "stereotype": "Factory",
      "fields": [
        "- cache: Map<String, SharedSceneAsset>"
      ],
      "methods": [
        "+ getFlyweight(profile, variantIndex): SharedSceneAsset"
      ],
      "tone": "teal"
    },
    {
      "id": "flyweight",
      "x": 844,
      "y": 100,
      "width": 254,
      "height": 142,
      "title": "SharedSceneAsset",
      "stereotype": "Flyweight",
      "fields": [
        "- intrinsicStateKb: int"
      ],
      "methods": [
        "+ label(): String",
        "+ render(extrinsicState)"
      ],
      "tone": "sand"
    },
    {
      "id": "concrete",
      "x": 844,
      "y": 380,
      "width": 254,
      "height": 136,
      "title": "TreeSceneAsset",
      "stereotype": "Concrete Flyweight",
      "methods": [
        "+ render(extrinsicState)"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "client",
      "to": "factory",
      "label": "requests",
      "marker": "arrow"
    },
    {
      "from": "client",
      "to": "flyweight",
      "label": "render()",
      "marker": "arrow"
    },
    {
      "from": "client",
      "to": "extrinsic",
      "label": "supplies",
      "marker": "arrow"
    },
    {
      "from": "factory",
      "to": "flyweight",
      "label": "caches / reuses",
      "marker": "arrow"
    },
    {
      "from": "concrete",
      "to": "flyweight",
      "label": "implements",
      "marker": "triangle",
      "dashed": true
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "flyweight",
  "title": "Quiz Flyweight",
  "description": "Teste ta comprehension du partage d etat, de la reduction des duplications lourdes et des cas d usage a grande echelle.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "flyweight-q1",
      "label": "Quel est le but principal du pattern Flyweight ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Flyweight partage l etat intrinseque entre de nombreux objets pour reduire la memoire.",
      "choices": [
        {
          "id": "simplify",
          "label": "Simplifier le code"
        },
        {
          "id": "memory",
          "label": "Reduire la memoire en partageant des donnees"
        },
        {
          "id": "cpu",
          "label": "Ameliorer les performances CPU"
        }
      ],
      "correctChoiceIds": [
        "memory"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "flyweight-q2",
      "label": "Avec Flyweight, chaque objet garde sa propre copie des donnees lourdes.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Faux : il peut y avoir beaucoup d objets legers, mais ils partagent une donnee lourde commune au lieu de la dupliquer.",
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
      "id": "flyweight-q3",
      "label": "Le Flyweight repose principalement sur :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le coeur du pattern est le partage d etat intrinseque entre objets similaires.",
      "choices": [
        {
          "id": "inheritance",
          "label": "L heritage"
        },
        {
          "id": "interfaces",
          "label": "Les interfaces uniquement"
        },
        {
          "id": "shared-state",
          "label": "Le partage d etat"
        }
      ],
      "correctChoiceIds": [
        "shared-state"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "flyweight-q4",
      "label": "Associe chaque type d etat a sa definition.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "L etat intrinseque est partage, l etat extrinseque reste specifique a chaque objet utilise.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "intrinsic",
          "label": "Intrinsic state"
        },
        {
          "id": "extrinsic",
          "label": "Extrinsic state"
        }
      ],
      "rightItems": [
        {
          "id": "shared",
          "label": "Partage"
        },
        {
          "id": "specific",
          "label": "Specifique a l objet"
        }
      ],
      "correctPairs": [
        {
          "leftId": "intrinsic",
          "rightId": "shared"
        },
        {
          "leftId": "extrinsic",
          "rightId": "specific"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "flyweight-q5",
      "label": "Quel cas est ideal pour Flyweight ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Les systemes de particules ou de tuiles repetitives sont des cas typiques avec beaucoup d objets similaires.",
      "choices": [
        {
          "id": "users",
          "label": "Gestion d utilisateurs"
        },
        {
          "id": "particles",
          "label": "Systeme de particules"
        },
        {
          "id": "auth",
          "label": "Authentification"
        }
      ],
      "correctChoiceIds": [
        "particles"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "flyweight-q6",
      "label": "Le Flyweight permet de :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Il mutualise les objets partages pour eviter de re-instancier les memes donnees lourdes.",
      "choices": [
        {
          "id": "reduce",
          "label": "Reduire la duplication des donnees lourdes"
        },
        {
          "id": "complexify",
          "label": "Augmenter la complexite volontairement"
        },
        {
          "id": "remove-classes",
          "label": "Supprimer les classes"
        }
      ],
      "correctChoiceIds": [
        "reduce"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "flyweight-q7",
      "label": "Le Flyweight est utile quand on a beaucoup d objets similaires.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Plus les objets sont nombreux et similaires, plus le gain memoire peut etre fort.",
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
      "id": "flyweight-q8",
      "label": "Qui gere souvent les instances Flyweight ?",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Une factory ou un cache dedie gere en general la reutilisation des flyweights.",
      "choices": [
        {
          "id": "client",
          "label": "Le client directement"
        },
        {
          "id": "factory",
          "label": "Une factory"
        },
        {
          "id": "controller",
          "label": "Le controleur"
        }
      ],
      "correctChoiceIds": [
        "factory"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "flyweight-q9",
      "label": "Sans Flyweight, on obtient souvent :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Sans mutualisation, chaque objet garde sa propre copie des donnees lourdes et la memoire explose.",
      "choices": [
        {
          "id": "few",
          "label": "Trop peu d objets"
        },
        {
          "id": "memory",
          "label": "Trop de copies lourdes en memoire"
        },
        {
          "id": "logic",
          "label": "Pas assez de logique"
        }
      ],
      "correctChoiceIds": [
        "memory"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "flyweight-q10",
      "label": "Le Flyweight separe surtout :",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "La separation cle du pattern est entre etat intrinseque partage et etat extrinseque fourni a l usage.",
      "choices": [
        {
          "id": "state",
          "label": "Etat interne / externe"
        },
        {
          "id": "logic",
          "label": "Logique / donnees"
        },
        {
          "id": "contract",
          "label": "Interface / implementation"
        }
      ],
      "correctChoiceIds": [
        "state"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    }
  ]
}
