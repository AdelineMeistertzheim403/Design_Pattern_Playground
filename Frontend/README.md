# Frontend

Frontend React 19 + Vite + Tailwind du `Design Pattern Playground`.

Ce document explique comment brancher un nouveau design pattern dans l'interface.

## Vue d'ensemble

Le frontend est hybride :

- il consomme les `metadata`, `schema` et `resultats` du backend quand l'API est disponible
- il garde aussi un mode local de secours pour continuer a fonctionner sans backend

Cela veut dire qu'ajouter un pattern proprement implique en general :

1. brancher le pattern dynamique venant du backend
2. ajouter son fallback local
3. ajouter son contenu pedagogique
4. ajouter son UML
5. ajouter, si besoin, une scene SVG specialisee

## Fichiers a connaitre

### Catalogue et fallback

- [fallbackPatterns.js](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/data/fallbackPatterns.js)

Ce fichier contient :

- `fallbackPatterns` : metadata locales du catalogue
- `fallbackSchemas` : schema local du formulaire
- `fallbackExecutors` : simulation locale si le backend n'est pas joignable
- `getFallbackSchema()`
- `executeFallbackPattern()`

### Pedagogie

- [patternLearningContent.js](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/data/patternLearningContent.js)

Chaque pattern doit y exposer :

- `strapline`
- `intuition`
- `readingGuide`
- `studentAngle`
- `developerAngle`
- `playfulPrompt`
- `steps`
- `glossary`

### UML

- [patternUmlDiagrams.js](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/data/patternUmlDiagrams.js)
- [UmlDiagram.jsx](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/components/UmlDiagram.jsx)

Le premier fournit les donnees UML, le second les affiche.

### Scene SVG

- [ExecutionScene.jsx](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/components/ExecutionScene.jsx)

Ce composant a :

- une scene generique basee sur `visualization.nodes` et `visualization.edges`
- plusieurs scenes specialisees pour certains patterns

Aujourd'hui, les scenes specialisees existent deja pour :

- `state`
- `singleton`
- `flyweight`

Les autres patterns utilisent la scene generique.

### Page principale

- [App.jsx](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/App.jsx)

Ce fichier gere :

- la page d'accueil
- la page detaillee du pattern
- la generation du formulaire dynamique
- quelques raffinements UI specifiques a certains champs

## Ce qui apparait automatiquement

Si le backend expose bien le pattern via `/api/patterns` et `/api/patterns/<code>/schema`, alors :

- le pattern peut apparaitre automatiquement dans le catalogue
- le formulaire peut etre genere automatiquement
- la page detaillee peut l'ouvrir
- le retour d'execution generique fonctionne

En revanche, pour une experience complete, il faut aussi ajouter le support frontend local et pedagogique.

## Etapes pour ajouter un pattern

Prenons l'exemple d'un pattern `decorator`.

### 1. Ajouter le pattern au catalogue local

Dans [fallbackPatterns.js](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/data/fallbackPatterns.js), ajoute une entree dans `fallbackPatterns` :

```js
{
  code: 'decorator',
  name: 'Decorator',
  type: 'STRUCTURAL',
  description: "Ajoute des responsabilites a un objet sans modifier sa classe.",
  useCase: "Empiler des bonus sur un personnage ou enrichir un flux de rendu.",
  complexityLevel: 'INTERMEDIATE',
}
```

Cette partie sert :

- quand le backend est indisponible
- comme base locale stable pendant le developpement

### 2. Ajouter le schema fallback

Dans le meme fichier, ajoute une entree dans `fallbackSchemas` :

```js
decorator: {
  fields: [
    {
      name: 'baseCharacter',
      label: 'Personnage',
      type: 'TEXT',
      required: true,
      allowedValues: null,
      defaultValue: 'Runner',
    },
    {
      name: 'shield',
      label: 'Shield',
      type: 'BOOLEAN',
      required: true,
      allowedValues: null,
      defaultValue: 'true',
    },
  ],
}
```

Les types supportes par le formulaire actuel sont :

- `TEXT`
- `NUMBER`
- `BOOLEAN`
- `SELECT`
- `LIST`

## 3. Ajouter l'execution fallback

Toujours dans [fallbackPatterns.js](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/data/fallbackPatterns.js), ajoute une fonction dans `fallbackExecutors`.

Elle doit retourner un objet compatible avec ce que renvoie le backend :

```js
{
  patternCode: 'decorator',
  summary: '...',
  logs: ['...', '...'],
  output: { ... },
  visualization: {
    nodes: [...],
    edges: [...],
  },
}
```

Exemple minimal :

```js
decorator: (parameters) => {
  const baseCharacter = `${parameters.baseCharacter ?? 'Runner'}`
  const shield = Boolean(parameters.shield)

  return {
    patternCode: 'decorator',
    summary: "Decorator enrichit un objet en l enveloppant progressivement.",
    logs: [
      'Creation du composant de base.',
      shield ? 'Ajout du decorator Shield.' : 'Aucun decorator applique.',
    ],
    output: {
      baseCharacter,
      decorators: shield ? ['SHIELD'] : [],
    },
    visualization: {
      nodes: [
        { id: 'base', label: 'Character', type: 'component', data: {} },
        { id: 'decorator', label: 'ShieldDecorator', type: 'decorator', data: { detail: '+ defense' } },
      ],
      edges: [
        { from: 'decorator', to: 'base', label: 'wraps' },
      ],
    },
  }
}
```

## 4. Ajouter la pedagogie

Dans [patternLearningContent.js](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/data/patternLearningContent.js), ajoute une cle `decorator` :

```js
decorator: {
  strapline: 'Un objet de base est enrichi couche par couche.',
  intuition: "Decorator ajoute des responsabilites sans modifier la classe initiale.",
  readingGuide: "Observe d abord l objet de base, puis les couches qui s empilent autour de lui.",
  studentAngle: "Le point cle est la composition plutot que l heritage.",
  developerAngle: "C est utile pour empiler des comportements optionnels sans explosion de classes.",
  playfulPrompt: "Ajoute et retire des decorators pour voir ce qui change vraiment.",
  steps: [
    'Identifier le composant de base.',
    'Identifier le contrat commun.',
    'Observer comment chaque decorator enveloppe le precedent.',
    'Comparer la flexibilite avec une solution basee sur l heritage.',
  ],
  glossary: [
    { term: 'Composant', definition: "Contrat commun partage par l objet de base et les decorators." },
    { term: 'Wrapper', definition: "Objet qui contient un autre objet et ajoute un comportement autour." },
  ],
}
```

Sans cette etape, la page du pattern reste fonctionnelle, mais elle perd la couche pedagogique du projet.

## 5. Ajouter le diagramme UML

Dans [patternUmlDiagrams.js](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/data/patternUmlDiagrams.js), ajoute un diagramme `decoratorDiagram`, puis branche-le dans l'export final.

Format attendu :

```js
const decoratorDiagram = {
  viewBox: '0 0 980 600',
  classes: [
    {
      id: 'component',
      x: 520,
      y: 80,
      width: 260,
      height: 120,
      title: 'Component',
      stereotype: 'Component',
      methods: ['+ render(): String'],
      tone: 'sand',
    },
  ],
  relations: [
    {
      from: 'decorator',
      to: 'component',
      label: 'implements',
      marker: 'triangle',
      dashed: true,
    },
  ],
}
```

Champs utiles par classe :

- `id`
- `x`, `y`
- `width`, `height`
- `title`
- `stereotype`
- `fields`
- `methods`
- `tone`

Champs utiles par relation :

- `from`
- `to`
- `label`
- `marker`
- `dashed`
- `fromSide`
- `toSide`
- `points`
- `labelX`
- `labelY`

## 6. Decider s'il faut une scene SVG specialisee

Tu as 2 options.

### Option A : scene generique

Si la `visualization` du backend ou du fallback suffit, tu n'as rien a faire.

Le composant [ExecutionScene.jsx](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/components/ExecutionScene.jsx) affichera automatiquement la scene generique.

Cette option est suffisante pour :

- un premier MVP
- un pattern simple
- un pattern dont le graphe n'a pas besoin d'animation specifique

### Option B : scene specialisee

Si tu veux une vraie experience visuelle, ajoute un renderer dedie dans [ExecutionScene.jsx](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/components/ExecutionScene.jsx).

Le branchement se fait a la fin du composant principal, sur le modele de :

- `patternCode === 'state'`
- `patternCode === 'singleton'`
- `patternCode === 'flyweight'`

Flux recommande :

1. creer `renderDecoratorScene(...)`
2. lire `execution.output`
3. produire une scene plus riche que le graphe generique
4. ajouter le `if (patternCode === 'decorator' && execution?.output) { ... }`

## 7. Ajouter des raffinements de formulaire si necessaire

Le formulaire est generique, mais certains patterns ont des enrichissements UI dans [App.jsx](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/App.jsx).

Exemples existants :

- `patternFieldUi` pour les sliders de `flyweight`
- `getBooleanStateLabel()` pour renommer certains toggles

Si ton pattern a besoin :

- d'un slider
- d'un label specifique pour un boolean
- d'un hint UI

alors ajoute-le dans :

- [App.jsx](/home/adeline/Documents/Design_Patern_Playground/Frontend/src/App.jsx)

## 8. Verifier la coherence avec le backend

Le frontend s'appuie sur des cles stables.

Quand tu ajoutes un pattern, verifie que :

- `code` dans le backend == `code` dans le frontend
- les noms de champs du schema sont identiques
- les cles importantes dans `output` sont coherentes
- la `visualization` contient bien `nodes` et `edges`

Si tu fais une scene specifique, definis d'abord quelles cles `output` elle attend.

## Checklist frontend

- entree ajoutee dans `fallbackPatterns`
- schema ajoute dans `fallbackSchemas`
- executor ajoute dans `fallbackExecutors`
- contenu pedagogique ajoute dans `patternLearningContent`
- UML ajoute dans `patternUmlDiagrams`
- scene specialisee ajoutee si necessaire dans `ExecutionScene.jsx`
- raffinements de formulaire ajoutes si necessaire dans `App.jsx`
- build passe

## Build et dev

Depuis le dossier `Frontend` :

```bash
npm install
npm run dev
npm run build
```

## Variable d'environnement

Copier `.env.example` si vous voulez changer l'URL du backend :

```bash
VITE_API_URL=http://localhost:8080
```

Par defaut, le frontend tente de joindre `http://localhost:8080/api/patterns`.

## Strategie recommandee pour un nouveau pattern

Ordre conseille :

1. ajouter le pattern au backend
2. verifier `/api/patterns`, `/schema` et `/execute`
3. ajouter le fallback frontend
4. ajouter la pedagogie
5. ajouter l'UML
6. seulement ensuite, ajouter une scene SVG specialisee si le pattern en vaut la peine

## Bonnes pratiques

- Ne commence pas par la scene SVG. Stabilise d'abord `schema`, `output` et `visualization`.
- Garde des cles `output` simples, explicites et stables.
- Pense toujours a la double cible du projet : etudiant + developpeur.
- Si le pattern est tres visuel, investis dans `ExecutionScene.jsx`.
- Si le pattern est plus structurel, une bonne scene generique + un UML propre peuvent suffire.
