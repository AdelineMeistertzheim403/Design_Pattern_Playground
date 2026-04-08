export const patternCode = "decorator"

export const patternDefinition = {
  "code": "decorator",
  "name": "Decorator",
  "type": "STRUCTURAL",
  "description": "Ajoute des comportements a un objet en l enveloppant avec des couches successives, sans modifier sa classe d origine.",
  "useCase": "Empiler des power-ups sur un personnage, enrichir un cafe customisable ou combiner des effets sans explosion de classes.",
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
        "WITH_DECORATOR",
        "WITHOUT_DECORATOR"
      ],
      "defaultValue": "WITH_DECORATOR"
    },
    {
      "name": "characterName",
      "label": "Nom du personnage",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Ember Knight"
    },
    {
      "name": "baseType",
      "label": "Archetype de base",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "WARRIOR",
        "MAGE",
        "ROGUE"
      ],
      "defaultValue": "WARRIOR"
    },
    {
      "name": "decorators",
      "label": "Decorators",
      "type": "LIST",
      "required": true,
      "allowedValues": [
        "FIRE",
        "SHIELD",
        "SPEED",
        "ICE"
      ],
      "defaultValue": "FIRE, SHIELD"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "Chaque power-up enveloppe le composant precedent et enrichit le build sans toucher a la classe d origine.",
  "intuition": "Decorator evite de creer une classe par combinaison possible. A la place, on compose dynamiquement des wrappers qui ajoutent chacun une responsabilite claire.",
  "readingGuide": "Lis d abord la pile de wrappers du bas vers le haut, puis regarde le build final a droite. L UML montre la structure Component / Decorator, la scene montre l empilement runtime.",
  "studentAngle": "Le declic pedagogique est de voir qu on n a pas besoin d une classe PersonnageFeuBouclierVitesse pour obtenir ce resultat.",
  "developerAngle": "Ce pattern devient interessant quand tu veux enrichir un composant par options cumulables, sans exploser les branches d heritage ni dupliquer la logique.",
  "playfulPrompt": "Ajoute, retire ou reordonne mentalement les power-ups et observe comment les stats evoluent couche apres couche.",
  "steps": [
    "Identifier le composant de base et ses stats initiales.",
    "Ajouter un premier decorator qui wrap le composant.",
    "Empiler plusieurs decorators pour cumuler les effets.",
    "Comparer le build final avec ce qu il aurait fallu coder sans pattern."
  ],
  "glossary": [
    {
      "term": "Component",
      "definition": "Contrat commun partage par l objet de base et par tous les decorators."
    },
    {
      "term": "Wrapping",
      "definition": "Fait d envelopper un objet dans un autre pour enrichir son comportement a l execution."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 1320 780",
  "classes": [
    {
      "id": "component",
      "x": 478,
      "y": 54,
      "width": 286,
      "height": 128,
      "title": "CharacterComponent",
      "stereotype": "Component",
      "methods": [
        "+ stats(): CharacterStats",
        "+ activeEffects(): List<String>"
      ],
      "tone": "sand"
    },
    {
      "id": "base",
      "x": 84,
      "y": 280,
      "width": 250,
      "height": 138,
      "title": "BaseCharacter",
      "stereotype": "Concrete Component",
      "fields": [
        "- archetype: HeroArchetype"
      ],
      "methods": [
        "+ stats()",
        "+ activeEffects()"
      ],
      "tone": "accent"
    },
    {
      "id": "decorator",
      "x": 488,
      "y": 262,
      "width": 310,
      "height": 164,
      "title": "CharacterDecorator",
      "stereotype": "Decorator",
      "fields": [
        "- component: CharacterComponent"
      ],
      "methods": [
        "+ stats()",
        "+ activeEffects()",
        "# wrapped(): CharacterComponent"
      ],
      "tone": "teal"
    },
    {
      "id": "fire",
      "x": 266,
      "y": 548,
      "width": 214,
      "height": 124,
      "title": "FireDecorator",
      "stereotype": "Concrete Decorator",
      "methods": [
        "+ stats()",
        "+ effectLabel()"
      ],
      "tone": "accent"
    },
    {
      "id": "shield",
      "x": 554,
      "y": 548,
      "width": 214,
      "height": 124,
      "title": "ShieldDecorator",
      "stereotype": "Concrete Decorator",
      "methods": [
        "+ stats()",
        "+ effectLabel()"
      ],
      "tone": "accent"
    },
    {
      "id": "speed",
      "x": 842,
      "y": 548,
      "width": 214,
      "height": 124,
      "title": "SpeedDecorator",
      "stereotype": "Concrete Decorator",
      "methods": [
        "+ stats()",
        "+ effectLabel()"
      ],
      "tone": "accent"
    },
    {
      "id": "ice",
      "x": 1108,
      "y": 548,
      "width": 182,
      "height": 124,
      "title": "IceDecorator",
      "stereotype": "Concrete Decorator",
      "methods": [
        "+ stats()",
        "+ effectLabel()"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "base",
      "to": "component",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 236,
      "labelY": 226,
      "marker": "triangle",
      "dashed": true,
      "points": [
        {
          "x": 208,
          "y": 226
        },
        {
          "x": 620,
          "y": 226
        }
      ]
    },
    {
      "from": "decorator",
      "to": "component",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "implements",
      "labelX": 646,
      "labelY": 224,
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "decorator",
      "to": "component",
      "fromSide": "left",
      "toSide": "left",
      "label": "wraps 1",
      "labelX": 420,
      "labelY": 298,
      "marker": "arrow",
      "points": [
        {
          "x": 410,
          "y": 344
        },
        {
          "x": 410,
          "y": 118
        }
      ]
    },
    {
      "from": "fire",
      "to": "decorator",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "extends",
      "labelX": 372,
      "labelY": 490,
      "marker": "triangle"
    },
    {
      "from": "shield",
      "to": "decorator",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "extends",
      "labelX": 660,
      "labelY": 490,
      "marker": "triangle"
    },
    {
      "from": "speed",
      "to": "decorator",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "extends",
      "labelX": 948,
      "labelY": 490,
      "marker": "triangle",
      "points": [
        {
          "x": 948,
          "y": 490
        },
        {
          "x": 720,
          "y": 490
        }
      ]
    },
    {
      "from": "ice",
      "to": "decorator",
      "fromSide": "top",
      "toSide": "bottom",
      "label": "extends",
      "labelX": 1184,
      "labelY": 490,
      "marker": "triangle",
      "points": [
        {
          "x": 1198,
          "y": 490
        },
        {
          "x": 780,
          "y": 490
        }
      ]
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "decorator",
  "title": "Quiz Decorator",
  "description": "Teste ta comprehension du wrapping, de la composition et de l empilement dynamique de comportements.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "decorator-q1",
      "label": "Le pattern Decorator permet :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Decorator ajoute des comportements autour d un objet sans toucher a sa classe concrete.",
      "choices": [
        {
          "id": "create",
          "label": "Creer des objets"
        },
        {
          "id": "share",
          "label": "Partager la memoire"
        },
        {
          "id": "behavior",
          "label": "Ajouter des comportements dynamiquement"
        }
      ],
      "correctChoiceIds": [
        "behavior"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "decorator-q2",
      "label": "Decorator modifie la classe d origine.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Le pattern evite justement de modifier la classe d origine en enveloppant l objet.",
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
      "id": "decorator-q3",
      "label": "Decorator est un pattern :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Decorator fait partie des patterns structurels.",
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
        "structural"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "decorator-q4",
      "label": "Le Decorator :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Un decorator wrap le composant pour enrichir son comportement.",
      "choices": [
        {
          "id": "replace",
          "label": "Remplace l objet"
        },
        {
          "id": "wrap",
          "label": "Wrap l objet"
        },
        {
          "id": "delete",
          "label": "Le supprime"
        }
      ],
      "correctChoiceIds": [
        "wrap"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "decorator-q5",
      "label": "Associe chaque role Decorator a sa responsabilite.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le component fournit le contrat de base, le decorator ajoute un comportement et le concrete decorator en est l implementation.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "decorator",
          "label": "Decorator"
        },
        {
          "id": "component",
          "label": "Component"
        },
        {
          "id": "concrete",
          "label": "ConcreteDecorator"
        }
      ],
      "rightItems": [
        {
          "id": "behavior",
          "label": "Ajoute comportement"
        },
        {
          "id": "base",
          "label": "Objet de base"
        },
        {
          "id": "implementation",
          "label": "Implementation concrete"
        }
      ],
      "correctPairs": [
        {
          "leftId": "decorator",
          "rightId": "behavior"
        },
        {
          "leftId": "component",
          "rightId": "base"
        },
        {
          "leftId": "concrete",
          "rightId": "implementation"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "decorator-q6",
      "label": "Decorator evite surtout :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Il evite de creer une classe pour chaque combinaison possible d effets.",
      "choices": [
        {
          "id": "interfaces",
          "label": "Les interfaces"
        },
        {
          "id": "classes",
          "label": "Les classes"
        },
        {
          "id": "explosion",
          "label": "L explosion de classes"
        }
      ],
      "correctChoiceIds": [
        "explosion"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "decorator-q7",
      "label": "On peut empiler plusieurs decorators.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Oui, chaque decorator peut envelopper le composant deja decore.",
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
      "id": "decorator-q8",
      "label": "Quel exemple illustre bien Decorator ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Des effets de personnage empilables montrent tres bien le pattern.",
      "choices": [
        {
          "id": "database",
          "label": "Base de donnees"
        },
        {
          "id": "effects",
          "label": "Effets de personnage"
        },
        {
          "id": "login",
          "label": "Login"
        }
      ],
      "correctChoiceIds": [
        "effects"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "decorator-q9",
      "label": "Decorator utilise principalement :",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le pattern repose sur la composition : chaque wrapper garde une reference vers le composant enveloppe.",
      "choices": [
        {
          "id": "inheritance",
          "label": "L heritage uniquement"
        },
        {
          "id": "composition",
          "label": "La composition"
        },
        {
          "id": "static",
          "label": "Du static"
        }
      ],
      "correctChoiceIds": [
        "composition"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "decorator-q10",
      "label": "Decorator apporte surtout :",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le pattern apporte de la flexibilite en combinant des effets a la demande.",
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
          "id": "coupling",
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

