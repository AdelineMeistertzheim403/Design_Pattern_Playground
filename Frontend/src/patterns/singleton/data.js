export const patternCode = "singleton"

export const patternDefinition = {
  "code": "singleton",
  "name": "Singleton",
  "type": "CREATIONAL",
  "description": "Garantit qu un service central ne possede qu une seule instance partagee dans toute l application.",
  "useCase": "Partager la meme configuration globale, le meme logger ou le meme gestionnaire audio entre plusieurs clients.",
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
        "WITH_SINGLETON",
        "WITHOUT_SINGLETON"
      ],
      "defaultValue": "WITH_SINGLETON"
    },
    {
      "name": "clients",
      "label": "Clients",
      "type": "LIST",
      "required": true,
      "allowedValues": null,
      "defaultValue": "UI Panel, Backend Job, Analytics Service"
    },
    {
      "name": "settingKey",
      "label": "Cle de configuration",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "theme"
    },
    {
      "name": "settingValue",
      "label": "Valeur appliquee",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "emerald"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "Plusieurs clients pointent vers une seule instance, donc la configuration reste coherente partout.",
  "intuition": "Singleton sert a centraliser un etat ou un service global quand plusieurs parties de l application doivent partager exactement la meme reference.",
  "readingGuide": "Regarde d abord combien d instances reelles sont presentes dans la scene. Puis observe si la modification de configuration se propage a tous les clients ou reste enfermee dans une copie locale.",
  "studentAngle": "Le point pedagogique n est pas seulement l unicite, mais la coherence des donnees quand plusieurs consommateurs consultent le meme service.",
  "developerAngle": "C est pratique pour une configuration globale ou un logger, mais il faut rester prudent car cela introduit aussi un etat global difficile a tester.",
  "playfulPrompt": "Bascule entre avec et sans Singleton et verifie ce qui arrive quand le premier client modifie une valeur centrale.",
  "steps": [
    "Plusieurs clients demandent un service de configuration.",
    "Le premier client applique une mise a jour.",
    "Les autres clients lisent ensuite la configuration visible.",
    "Comparer la coherence du systeme avec une instance unique puis avec des copies independantes."
  ],
  "glossary": [
    {
      "term": "Instance unique",
      "definition": "Objet unique partage par tout le systeme pour centraliser un etat ou une responsabilite."
    },
    {
      "term": "Etat global",
      "definition": "Donnee visible depuis plusieurs endroits de l application et dont la coherence doit etre maitrisee."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 1160 640",
  "classes": [
    {
      "id": "client",
      "x": 70,
      "y": 168,
      "width": 266,
      "height": 148,
      "title": "SettingsDashboard",
      "stereotype": "Client",
      "methods": [
        "+ requestInstance()",
        "+ renderConfig()"
      ],
      "tone": "teal"
    },
    {
      "id": "singleton",
      "x": 456,
      "y": 118,
      "width": 302,
      "height": 192,
      "title": "GlobalSettingsManager",
      "stereotype": "Singleton",
      "fields": [
        "- INSTANCE: GlobalSettingsManager",
        "- settings: Map<String, String>"
      ],
      "methods": [
        "+ getInstance(): GlobalSettingsManager",
        "+ update(key, value)",
        "+ read(key): String"
      ],
      "tone": "sand"
    },
    {
      "id": "clients",
      "x": 842,
      "y": 120,
      "width": 246,
      "height": 154,
      "title": "Other Clients",
      "stereotype": "Client",
      "methods": [
        "+ requestInstance()",
        "+ readConfig()"
      ],
      "tone": "teal"
    },
    {
      "id": "state",
      "x": 456,
      "y": 404,
      "width": 302,
      "height": 132,
      "title": "Shared Configuration",
      "stereotype": "Global State",
      "fields": [
        "+ theme: String",
        "+ volume: String"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "client",
      "to": "singleton",
      "label": "getInstance()",
      "marker": "arrow"
    },
    {
      "from": "clients",
      "to": "singleton",
      "label": "getInstance()",
      "marker": "arrow"
    },
    {
      "from": "singleton",
      "to": "state",
      "label": "owns",
      "marker": "arrow"
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "singleton",
  "title": "Quiz Singleton",
  "description": "Valide le principe d instance unique, ses cas d usage utiles et ses limites en conception.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "singleton-q1",
      "label": "Quel est le but du Singleton ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Singleton garantit qu un seul objet controle un service global donne.",
      "choices": [
        {
          "id": "many",
          "label": "Créer plusieurs objets"
        },
        {
          "id": "single",
          "label": "Garantir une seule instance"
        },
        {
          "id": "perf",
          "label": "Ameliorer les performances"
        }
      ],
      "correctChoiceIds": [
        "single"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "singleton-q2",
      "label": "Un Singleton peut avoir plusieurs instances.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Par definition, le pattern vise a limiter l existence a une seule instance accessible globalement.",
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
      "id": "singleton-q3",
      "label": "Un Singleton est souvent utilise pour :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Logger, configuration globale ou gestionnaire central sont des usages classiques.",
      "choices": [
        {
          "id": "logger",
          "label": "Logger"
        },
        {
          "id": "dto",
          "label": "DTO"
        },
        {
          "id": "entity",
          "label": "Entite metier"
        }
      ],
      "correctChoiceIds": [
        "logger"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "singleton-q4",
      "label": "Quel est un probleme classique du Singleton ?",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le pattern peut masquer des dependances globales et compliquer les tests unitaires.",
      "choices": [
        {
          "id": "simple",
          "label": "Trop simple"
        },
        {
          "id": "testing",
          "label": "Difficulte de test"
        },
        {
          "id": "fast",
          "label": "Trop rapide"
        }
      ],
      "correctChoiceIds": [
        "testing"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "singleton-q5",
      "label": "Le Singleton permet de partager un etat global.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Tous les clients recuperent la meme instance et voient le meme etat central.",
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
      "id": "singleton-q6",
      "label": "Le Singleton utilise souvent :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Une instance statique interne est le mecanisme le plus classique pour porter l unicite.",
      "choices": [
        {
          "id": "factory",
          "label": "Une factory obligatoire"
        },
        {
          "id": "static-instance",
          "label": "Une instance statique"
        },
        {
          "id": "interface",
          "label": "Une interface"
        }
      ],
      "correctChoiceIds": [
        "static-instance"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "singleton-q7",
      "label": "Sans Singleton, on a souvent :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Chaque client cree son propre objet et on perd la coherence globale.",
      "choices": [
        {
          "id": "many",
          "label": "Plusieurs instances"
        },
        {
          "id": "single",
          "label": "Une seule instance"
        },
        {
          "id": "none",
          "label": "Aucune instance"
        }
      ],
      "correctChoiceIds": [
        "many"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "singleton-q8",
      "label": "Singleton est un pattern :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Singleton fait partie des patterns de creation.",
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
      "id": "singleton-q9",
      "label": "Quel est un mauvais usage du Singleton ?",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le pattern ne doit pas servir a cacher une logique metier complexe derriere un etat global.",
      "choices": [
        {
          "id": "logger",
          "label": "Logger"
        },
        {
          "id": "config",
          "label": "Config globale"
        },
        {
          "id": "business",
          "label": "Logique metier complexe"
        }
      ],
      "correctChoiceIds": [
        "business"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "singleton-q10",
      "label": "Le Singleton peut cacher des dependances.",
      "type": "TRUE_FALSE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Un acces global facile peut masquer la dependance reelle d une classe et nuire a la testabilite.",
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
    }
  ]
}

