export const patternCode = "adapter"

export const patternDefinition = {
  "code": "adapter",
  "name": "Adapter",
  "type": "STRUCTURAL",
  "description": "Traduit une interface incompatible vers le contrat attendu par le client sans modifier le composant legacy.",
  "useCase": "Connecter une source historique a une cible moderne en convertissant connecteur, protocole ou format de message.",
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
        "WITH_ADAPTER",
        "WITHOUT_ADAPTER"
      ],
      "defaultValue": "WITH_ADAPTER"
    },
    {
      "name": "scenario",
      "label": "Scenario",
      "type": "SELECT",
      "required": true,
      "allowedValues": [
        "VGA_TO_HDMI",
        "SERIAL_TO_REST",
        "XML_TO_JSON"
      ],
      "defaultValue": "VGA_TO_HDMI"
    },
    {
      "name": "payloadLabel",
      "label": "Signal a transporter",
      "type": "TEXT",
      "required": true,
      "allowedValues": null,
      "defaultValue": "Telemetry burst 42"
    }
  ]
}

export const patternLearningContent = {
  "strapline": "La source legacy garde son interface, mais un pont la rend branchable sur une cible moderne.",
  "intuition": "Adapter traduit un contrat existant vers celui attendu par le client. On evite ainsi de reecrire le systeme legacy juste pour le rendre compatible avec un nouvel ecosysteme.",
  "readingGuide": "Observe d abord la difference entre le signal source et le signal adapte dans la scene. L UML montre la structure Target / Adapter / Adaptee, la scene runtime montre la transformation du flux en direct.",
  "studentAngle": "Le declic pedagogique est de voir qu on ne corrige pas la source ou la cible : on ajoute un traducteur entre les deux.",
  "developerAngle": "Le pattern devient pertinent quand tu relies une API legacy, un vieux format de fichier, un connecteur physique ou un SDK historique a un nouveau contrat applicatif.",
  "playfulPrompt": "Change le scenario et regarde comment le meme principe rend compatibles un connecteur, un protocole serie ou un format XML.",
  "steps": [
    "La source emet avec son interface historique.",
    "Le client attend un contrat cible incompatible.",
    "L Adapter traduit l appel ou le payload vers le bon format.",
    "La cible consomme ensuite le resultat comme si elle parlait nativement a la source."
  ],
  "glossary": [
    {
      "term": "Target",
      "definition": "Contrat attendu par le client ou le systeme moderne."
    },
    {
      "term": "Adaptee",
      "definition": "Composant existant dont l interface native ne colle pas au contrat cible."
    }
  ]
}

export const patternUmlDiagram = {
  "viewBox": "0 0 1160 700",
  "classes": [
    {
      "id": "client",
      "x": 72,
      "y": 240,
      "width": 254,
      "height": 132,
      "title": "CompatibilityClient",
      "stereotype": "Client",
      "methods": [
        "+ connect(target: TargetPort)",
        "+ play(signal)"
      ],
      "tone": "teal"
    },
    {
      "id": "target",
      "x": 430,
      "y": 80,
      "width": 282,
      "height": 136,
      "title": "TargetPort",
      "stereotype": "Target",
      "methods": [
        "+ receive(signal): CompatiblePayload"
      ],
      "tone": "sand"
    },
    {
      "id": "adapter",
      "x": 430,
      "y": 288,
      "width": 300,
      "height": 172,
      "title": "PlugCompatibilityAdapter",
      "stereotype": "Adapter",
      "fields": [
        "- adaptee: LegacySignalSource"
      ],
      "methods": [
        "+ receive(signal)",
        "+ translateLegacySignal()"
      ],
      "tone": "accent"
    },
    {
      "id": "adaptee",
      "x": 836,
      "y": 300,
      "width": 254,
      "height": 150,
      "title": "LegacySignalSource",
      "stereotype": "Adaptee",
      "methods": [
        "+ legacyOutput(): LegacySignal"
      ],
      "tone": "teal"
    },
    {
      "id": "payload",
      "x": 826,
      "y": 86,
      "width": 264,
      "height": 122,
      "title": "CompatiblePayload",
      "stereotype": "Modern Contract",
      "fields": [
        "+ protocol: String",
        "+ connector: String"
      ],
      "tone": "accent"
    }
  ],
  "relations": [
    {
      "from": "client",
      "to": "target",
      "label": "depends on",
      "marker": "arrow"
    },
    {
      "from": "adapter",
      "to": "target",
      "label": "implements",
      "marker": "triangle",
      "dashed": true
    },
    {
      "from": "adapter",
      "to": "adaptee",
      "label": "wraps",
      "marker": "diamond"
    },
    {
      "from": "target",
      "to": "payload",
      "label": "returns",
      "marker": "arrow"
    }
  ]
}

export const fallbackQuiz = {
  "patternCode": "adapter",
  "title": "Quiz Adapter",
  "description": "Teste ta comprehension des interfaces incompatibles, du role Target / Adapter / Adaptee et de la traduction d un protocole vers un autre.",
  "passingPercent": 75,
  "badgeLabel": "Badge valide",
  "maxPoints": 0,
  "questions": [
    {
      "id": "adapter-q1",
      "label": "Le pattern Adapter permet surtout de :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Adapter traduit une interface existante vers le contrat attendu par le client.",
      "choices": [
        {
          "id": "create",
          "label": "Créer plus d objets"
        },
        {
          "id": "translate",
          "label": "Faire collaborer des interfaces incompatibles"
        },
        {
          "id": "share",
          "label": "Partager la memoire"
        }
      ],
      "correctChoiceIds": [
        "translate"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "adapter-q2",
      "label": "Adapter oblige a modifier la classe legacy d origine.",
      "type": "TRUE_FALSE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Non : le but est justement de garder l adaptee intacte et de placer la traduction dans un objet intermediaire.",
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
      "id": "adapter-q3",
      "label": "Adapter appartient a la famille :",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Adapter est un pattern structurel.",
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
        "structural"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "adapter-q4",
      "label": "L adaptee represente en general :",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "L adaptee est le composant legacy ou externe qui expose une interface que le client ne peut pas consommer directement.",
      "choices": [
        {
          "id": "legacy",
          "label": "Le composant existant incompatible"
        },
        {
          "id": "client",
          "label": "Le client final"
        },
        {
          "id": "database",
          "label": "La base de donnees"
        }
      ],
      "correctChoiceIds": [
        "legacy"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "adapter-q5",
      "label": "Associe chaque role a sa responsabilite.",
      "type": "MATCHING",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Le Target est le contrat attendu, l Adapter traduit et l Adaptee reste le composant existant.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [
        {
          "id": "target",
          "label": "Target"
        },
        {
          "id": "adapter",
          "label": "Adapter"
        },
        {
          "id": "adaptee",
          "label": "Adaptee"
        }
      ],
      "rightItems": [
        {
          "id": "contract",
          "label": "Contrat attendu par le client"
        },
        {
          "id": "translate",
          "label": "Traduit l appel vers le bon format"
        },
        {
          "id": "legacy",
          "label": "Composant existant incompatible"
        }
      ],
      "correctPairs": [
        {
          "leftId": "target",
          "rightId": "contract"
        },
        {
          "leftId": "adapter",
          "rightId": "translate"
        },
        {
          "leftId": "adaptee",
          "rightId": "legacy"
        }
      ],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "adapter-q6",
      "label": "Quel exemple illustre bien Adapter ?",
      "type": "QCM_SINGLE",
      "difficulty": "EASY",
      "points": 0,
      "explanation": "Connecter une source VGA a un ecran HDMI ou convertir une trame serie vers une API REST est un cas classique.",
      "choices": [
        {
          "id": "plug",
          "label": "Relier un systeme VGA a une cible HDMI"
        },
        {
          "id": "entity",
          "label": "Mapper une entite JPA"
        },
        {
          "id": "quiz",
          "label": "Afficher un quiz"
        }
      ],
      "correctChoiceIds": [
        "plug"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "adapter-q7",
      "label": "Adapter utilise souvent la composition pour deleguer vers l adaptee.",
      "type": "TRUE_FALSE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Oui : l Adapter wrappe souvent l adaptee et traduit les appels vers son interface specifique.",
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
      "id": "adapter-q8",
      "label": "Quel probleme Adapter aide-t-il a eviter ?",
      "type": "QCM_SINGLE",
      "difficulty": "MEDIUM",
      "points": 0,
      "explanation": "Il permet d integrer un composant legacy sans devoir le reecrire totalement pour coller a un nouveau contrat.",
      "choices": [
        {
          "id": "rewrite",
          "label": "La reecriture complete d un composant legacy"
        },
        {
          "id": "memory",
          "label": "La duplication memoire"
        },
        {
          "id": "observer",
          "label": "La diffusion d evenements"
        }
      ],
      "correctChoiceIds": [
        "rewrite"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "adapter-q9",
      "label": "Le client depend idealement de :",
      "type": "QCM_SINGLE",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le client parle au contrat Target et ignore les details de l adaptee concrete.",
      "choices": [
        {
          "id": "target",
          "label": "L interface Target"
        },
        {
          "id": "adaptee",
          "label": "La classe legacy concrete"
        },
        {
          "id": "database",
          "label": "La base de donnees"
        }
      ],
      "correctChoiceIds": [
        "target"
      ],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [],
      "correctOrder": []
    },
    {
      "id": "adapter-q10",
      "label": "Remets la boucle Adapter dans le bon ordre.",
      "type": "ORDERING",
      "difficulty": "HARD",
      "points": 0,
      "explanation": "Le client appelle le contrat Target, l Adapter traduit, l Adaptee fait le travail, puis le resultat revient dans le format attendu.",
      "choices": [],
      "correctChoiceIds": [],
      "leftItems": [],
      "rightItems": [],
      "correctPairs": [],
      "orderingItems": [
        {
          "id": "call",
          "label": "Le client appelle le contrat Target"
        },
        {
          "id": "translate",
          "label": "L Adapter convertit la requete"
        },
        {
          "id": "execute",
          "label": "L Adaptee traite avec son interface native"
        },
        {
          "id": "return",
          "label": "Le resultat revient dans le format attendu"
        }
      ],
      "correctOrder": [
        "call",
        "translate",
        "execute",
        "return"
      ]
    }
  ]
}

