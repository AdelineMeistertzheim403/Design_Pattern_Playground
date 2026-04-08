export const patternCode = "state"

export const patternDefinition = {
  "code": "state",
  "name": "State",
  "type": "BEHAVIORAL",
  "description": "Fait varier le comportement d un contexte selon son etat interne sans multiplier les conditions dans le code client.",
  "useCase": "Piloter une machine a etats de personnage, un workflow ou un cycle de vie UI avec des transitions explicites.",
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
        "WITH_STATE",
        "WITHOUT_STATE"
      ],
      "defaultValue": "WITH_STATE"
    },
    {
      "name": "characterName",
      "label": "Nom du personnage",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Arena Bot"
    },
    {
      "name": "initialState",
      "label": "Etat initial",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "IDLE",
        "RUNNING",
        "JUMPING",
        "ATTACKING"
      ],
      "defaultValue": "IDLE"
    },
    {
      "name": "actions",
      "label": "Sequence d actions",
      "type": "LIST",
      "required": true,
      "allowedValues": null,
      "defaultValue": "START_RUN, JUMP, LAND, ATTACK, FINISH_ATTACK, STOP"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "Le contexte change de comportement en changeant simplement d etat courant.",
  "intuition": "State remplace un gros bloc de conditions par plusieurs objets d etat. Chaque etat connait les transitions qu il autorise et le contexte delegue la reaction courante.",
  "readingGuide": "Observe d abord l etat actif dans la scene, puis suis la timeline des actions. Les transitions acceptees deplacent le personnage, les actions ignorees montrent les limites de chaque etat.",
  "studentAngle": "Le point cle est de voir qu on ne raisonne plus en if imbriques, mais en comportements locaux a chaque etat.",
  "developerAngle": "Ce pattern devient tres utile quand un workflow, une UI ou un personnage possede beaucoup de transitions et commence a accumuler des conditions difficiles a maintenir.",
  "playfulPrompt": "Change l etat initial puis joue avec une sequence d actions atypique pour voir quelles transitions sont refusees.",
  "steps": [
    "Le contexte demarre avec un etat initial.",
    "Chaque action est deleguee a l etat courant.",
    "L etat decide soit une transition, soit un refus.",
    "Le contexte adopte ensuite le nouvel etat et expose ses prochaines actions possibles."
  ],
  "glossary": [
    {
      "term": "Etat concret",
      "definition": "Classe qui encapsule les transitions autorisees et le comportement associe a un etat precis."
    },
    {
      "term": "Transition",
      "definition": "Passage explicite d un etat vers un autre apres une action ou un evenement."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 1160 760",
  "classes": [
    {
      "id": "context",
      "x": 60,
      "y": 240,
      "width": 266,
      "height": 150,
      "title": "CharacterContext",
      "stereotype": "Context",
      "fields": [
        "- currentState: CharacterState"
      ],
      "methods": [
        "+ dispatch(action)",
        "+ currentState(): CharacterState"
      ],
      "tone": "teal"
    },
    {
      "id": "state",
      "x": 470,
      "y": 76,
      "width": 284,
      "height": 132,
      "title": "CharacterState",
      "stereotype": "State",
      "methods": [
        "+ code(): String",
        "+ availableActions(): List<Action>",
        "+ onAction(action, characterName): TransitionResult"
      ],
      "tone": "sand"
    },
    {
      "id": "idle",
      "x": 420,
      "y": 322,
      "width": 208,
      "height": 122,
      "title": "IdleState",
      "stereotype": "Concrete State",
      "methods": [
        "+ onAction(action, characterName)"
      ],
      "tone": "accent"
    },
    {
      "id": "running",
      "x": 704,
      "y": 322,
      "width": 220,
      "height": 122,
      "title": "RunningState",
      "stereotype": "Concrete State",
      "methods": [
        "+ onAction(action, characterName)"
      ],
      "tone": "accent"
    },
    {
      "id": "jumping",
      "x": 420,
      "y": 520,
      "width": 220,
      "height": 122,
      "title": "JumpingState",
      "stereotype": "Concrete State",
      "methods": [
        "+ onAction(action, characterName)"
      ],
      "tone": "accent"
    },
    {
      "id": "attacking",
      "x": 704,
      "y": 520,
      "width": 228,
      "height": 122,
      "title": "AttackingState",
      "stereotype": "Concrete State",
      "methods": [
        "+ onAction(action, characterName)"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "context",
      "to": "state",
      "label": "holds currentState",
      "marker": "arrow"
    },
    {
      "from": "idle",
      "to": "state",
      "label": "implements",
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "running",
      "to": "state",
      "label": "implements",
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "jumping",
      "to": "state",
      "label": "implements",
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "attacking",
      "to": "state",
      "label": "implements",
      "marker": "triangle",
      "dashed": true
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "state",
  "title": "Quiz State",
  "description": "Teste ta comprehension du contexte, des classes d etat et des transitions qui font varier le comportement.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "state-q1",
      "label": "Le pattern State permet de :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "State fait varier le comportement du contexte selon son etat courant.",
      "choices": [
        {
          "id": "behavior",
          "label": "Changer le comportement selon l etat"
        },
        {
          "id": "create",
          "label": "Creer des objets"
        },
        {
          "id": "memory",
          "label": "Optimiser la memoire"
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
      "id": "state-q2",
      "label": "Le comportement depend de l etat courant.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "C est le principe du pattern : la reaction depend de l objet Etat actuellement actif.",
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
      "id": "state-q3",
      "label": "State remplace souvent :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le pattern remplace des if/else ou switch complexes bases sur l etat.",
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
          "label": "Des conditions if/else"
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
      "id": "state-q4",
      "label": "Chaque etat est souvent :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "On modele chaque etat comme une classe concrete qui implemente le contrat de comportement.",
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
          "id": "method",
          "label": "Une methode"
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
      "id": "state-q5",
      "label": "Associe chaque etat a son comportement dominant.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Idle represente le repos, Running le mouvement, Jumping le saut.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "idle",
          "label": "Idle"
        },
        {
          "id": "running",
          "label": "Running"
        },
        {
          "id": "jumping",
          "label": "Jumping"
        }
      ],
      "rightItems": [
        {
          "id": "rest",
          "label": "Repos"
        },
        {
          "id": "move",
          "label": "Mouvement"
        },
        {
          "id": "jump",
          "label": "Saut"
        }
      ],
      "correctPairs": [
        {
          "leftId": "idle",
          "rightId": "rest"
        },
        {
          "leftId": "running",
          "rightId": "move"
        },
        {
          "leftId": "jumping",
          "rightId": "jump"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "state-q6",
      "label": "Le contexte contient :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le contexte garde une reference sur l etat courant et lui delegue le comportement.",
      "choices": [
        {
          "id": "hard-coded",
          "label": "Tous les etats codes en dur"
        },
        {
          "id": "current",
          "label": "Une reference vers l etat courant"
        },
        {
          "id": "none",
          "label": "Aucun etat"
        }
      ],
      "correctChoiceIds": [
        "current"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "state-q7",
      "label": "State permet d eviter des switch complexes.",
      "type": "TRUE_FALSE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le pattern distribue la logique dans des classes d etat au lieu de centraliser un gros bloc conditionnel.",
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
      "id": "state-q8",
      "label": "Qui change l etat ?",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Selon l implementation, c est souvent le contexte ou l etat courant qui decide de la transition suivante.",
      "choices": [
        {
          "id": "client-only",
          "label": "Le client uniquement"
        },
        {
          "id": "context-or-state",
          "label": "Le contexte ou l etat"
        },
        {
          "id": "database",
          "label": "La base de donnees"
        }
      ],
      "correctChoiceIds": [
        "context-or-state"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "state-q9",
      "label": "Le pattern State est :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "State appartient a la famille des patterns comportementaux.",
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
      "id": "state-q10",
      "label": "Quel est un bon exemple reel de State ?",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Une machine a etats de jeu ou d interface utilisateur illustre tres bien le pattern.",
      "choices": [
        {
          "id": "calc",
          "label": "Calcul"
        },
        {
          "id": "fsm",
          "label": "Machine a etats (jeu, UI)"
        },
        {
          "id": "database",
          "label": "Base de donnees"
        }
      ],
      "correctChoiceIds": [
        "fsm"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    }
  ]
}

