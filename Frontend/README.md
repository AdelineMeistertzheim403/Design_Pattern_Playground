# Frontend

Frontend React 19 + Vite + Tailwind du `Design Pattern Playground`.

Ce document explique :

- la structure actuelle du frontend apres le refactor
- comment ajouter un nouveau design pattern
- quels fichiers toucher selon le niveau de finition voulu

## Architecture actuelle

Le frontend est maintenant decoupe en 4 zones principales :

### 1. Orchestration applicative

- `src/App.jsx`
- `src/hooks/usePlaygroundApp.js`

`App.jsx` ne porte plus la logique metier principale. Il assemble :

- le header
- les pages
- les modales
- la boite d authentification

La logique d etat, de navigation, de chargement backend, de fallback local et d authentification est centralisee dans `usePlaygroundApp.js`.

### 2. Pages

- `src/pages/HomePage.jsx`
- `src/pages/PatternPage.jsx`
- `src/pages/NotFoundPage.jsx`

La page d accueil et la page detail d un pattern sont maintenant isolees.  
Quand tu modifies l experience d une page, commence par regarder ici.

### 3. Composants reutilisables

- `src/components/SiteHeader.jsx`
- `src/components/CollapsiblePanel.jsx`
- `src/components/ExecutionScene.jsx`
- `src/components/UmlDiagram.jsx`
- `src/components/VisualizationModal.jsx`
- `src/components/ZoomableViewport.jsx`
- `src/components/AuthDialog.jsx`

### 4. Donnees et utilitaires

- `src/data/fallbackPatterns.js`
- `src/data/patternLearningContent.js`
- `src/data/patternUmlDiagrams.js`
- `src/app/playgroundConstants.js`
- `src/app/playgroundUtils.js`
- `src/lib/api.js`

## Principe general pour un nouveau pattern

Le frontend fonctionne en double mode :

- mode backend : metadata, schema et execution viennent de l API
- mode fallback : le frontend reste utilisable meme si le backend est indisponible

Pour ajouter un pattern proprement, il faut donc penser :

1. catalogue
2. schema
3. execution locale fallback
4. contenu pedagogique
5. diagramme UML
6. scene SVG specifique si necessaire

## Fichiers a connaitre avant d ajouter un pattern

### Catalogue + fallback local

Fichier :

- `src/data/fallbackPatterns.js`

Il contient :

- `fallbackPatterns`
- `fallbackSchemas`
- `fallbackExecutors`
- `getFallbackSchema()`
- `executeFallbackPattern()`

C est le premier fichier a mettre a jour.

### Pedagogie

Fichier :

- `src/data/patternLearningContent.js`

Chaque pattern doit y definir :

- `strapline`
- `intuition`
- `readingGuide`
- `studentAngle`
- `developerAngle`
- `playfulPrompt`
- `steps`
- `glossary`

### UML

Fichiers :

- `src/data/patternUmlDiagrams.js`
- `src/components/UmlDiagram.jsx`

Le premier decrit les classes et relations.  
Le second les rend visuellement.

### Scene SVG

Fichier :

- `src/components/ExecutionScene.jsx`

Ce composant supporte :

- une scene generique basee sur `visualization.nodes` et `visualization.edges`
- des scenes specialisees pour certains patterns

Aujourd hui, les scenes specialisees existent deja pour :

- `flyweight`
- `singleton`
- `state`

Les autres patterns utilisent la scene generique.

### Page detaillee du pattern

Fichier :

- `src/pages/PatternPage.jsx`

Cette page gere :

- le hero du pattern
- le formulaire dynamique
- la scene SVG
- le diagramme UML
- le retour d execution
- la pedagogie
- le pas a pas

Si tu veux changer la disposition ou les blocs d une page pattern, c est ici.

### Constantes et utilitaires de support

Fichiers :

- `src/app/playgroundConstants.js`
- `src/app/playgroundUtils.js`

Tu y trouveras :

- les labels de types
- les configurations UI speciales comme les sliders flyweight
- le parsing de route
- la normalisation des parametres
- le formatage d output
- la persistance de session

## Ce qui apparait automatiquement

Si le backend expose correctement :

- `GET /api/patterns`
- `GET /api/patterns/:code/schema`
- `POST /api/patterns/execute`

alors le frontend peut deja :

- afficher le pattern dans le catalogue
- generer le formulaire dynamiquement
- afficher le retour d execution
- ouvrir la page detaillee

En revanche, pour une experience complete et coherente avec le reste du projet, il faut aussi ajouter le fallback local, la pedagogie et l UML.

## Etapes recommandees pour ajouter un pattern

Prenons un exemple avec `decorator`.

### 1. Ajouter le pattern au catalogue fallback

Dans `src/data/fallbackPatterns.js`, ajoute une entree dans `fallbackPatterns` :

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
- comme base locale de developpement

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

Les types actuellement supportes par le formulaire sont :

- `TEXT`
- `NUMBER`
- `BOOLEAN`
- `SELECT`
- `LIST`

### 3. Ajouter l execution fallback

Toujours dans `src/data/fallbackPatterns.js`, ajoute une fonction dans `fallbackExecutors`.

Elle doit retourner un objet compatible avec le backend :

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

### 4. Ajouter le contenu pedagogique

Dans `src/data/patternLearningContent.js`, ajoute une cle `decorator` :

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

### 5. Ajouter le diagramme UML

Dans `src/data/patternUmlDiagrams.js`, ajoute un diagramme `decoratorDiagram`, puis branche-le dans l export final.

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

### 6. Decider s il faut une scene SVG specialisee

Tu as 2 options.

#### Option A : scene generique

Si la `visualization` du backend ou du fallback suffit, tu n as rien a faire.

Le composant `src/components/ExecutionScene.jsx` affichera automatiquement la scene generique.

Cette option suffit pour :

- un premier MVP
- un pattern simple
- un pattern dont le graphe n a pas besoin d animation specifique

#### Option B : scene specialisee

Si tu veux une vraie experience visuelle, ajoute un renderer dedie dans `src/components/ExecutionScene.jsx`.

Le branchement se fait dans le composant principal, sur le modele de :

- `patternCode === 'state'`
- `patternCode === 'singleton'`
- `patternCode === 'flyweight'`

Flux recommande :

1. creer `renderDecoratorScene(...)`
2. lire `execution.output`
3. produire une scene plus riche que la version generique
4. ajouter le branchement `if (patternCode === 'decorator' && execution?.output)`

### 7. Ajouter des raffinements de formulaire si necessaire

Le formulaire est generique, mais certains patterns ont des enrichissements UI partages.

Exemples existants :

- sliders numeriques flyweight
- labels specifiques pour certains booleens

Si ton pattern a besoin :

- d un slider
- d un libelle plus pedagogique
- d un hint UI

regarde d abord :

- `src/app/playgroundConstants.js`
- `src/app/playgroundUtils.js`
- `src/pages/PatternPage.jsx`

## Comment le refactor impacte l ajout d un pattern

Avant, presque tout passait par `App.jsx`.  
Maintenant, il faut penser en couches :

### Tu modifies la logique globale

Va dans :

- `src/hooks/usePlaygroundApp.js`

Exemples :

- navigation
- synchronisation backend
- auth
- ouverture des modales

### Tu modifies la page d accueil

Va dans :

- `src/pages/HomePage.jsx`

### Tu modifies la page d un pattern

Va dans :

- `src/pages/PatternPage.jsx`

### Tu modifies une brique de layout

Va dans :

- `src/components/CollapsiblePanel.jsx`
- `src/components/SiteHeader.jsx`

### Tu modifies une scene ou un diagramme

Va dans :

- `src/components/ExecutionScene.jsx`
- `src/components/UmlDiagram.jsx`

## Checklist frontend

- entree ajoutee dans `fallbackPatterns`
- schema ajoute dans `fallbackSchemas`
- executor ajoute dans `fallbackExecutors`
- contenu pedagogique ajoute dans `patternLearningContent`
- UML ajoute dans `patternUmlDiagrams`
- scene specialisee ajoutee si necessaire dans `ExecutionScene.jsx`
- raffinements de formulaire ajoutes si necessaire
- build valide

## Build et dev

Depuis le dossier `Frontend` :

```bash
npm install
npm run dev
npm run build
```

## Variable d environnement

Copier `.env.example` si vous voulez changer l URL du backend :

```bash
VITE_API_URL=http://localhost:8080
```

Par defaut, le frontend tente de joindre `http://localhost:8080/api/patterns`.

## Strategie recommandee

Ordre conseille pour un nouveau pattern :

1. ajouter le pattern au backend
2. verifier `/api/patterns`, `/schema` et `/execute`
3. ajouter le fallback frontend
4. ajouter la pedagogie
5. ajouter l UML
6. seulement ensuite, investir dans une scene SVG specialisee si le pattern le merite

## Bonnes pratiques

- Ne commence pas par la scene SVG.
- Stabilise d abord `schema`, `output` et `visualization`.
- Garde des cles `output` simples et stables.
- Pense toujours a la double cible du projet : etudiant + developpeur.
- Si le pattern est tres visuel, investis dans `ExecutionScene.jsx`.
- Si le pattern est plus structurel, une bonne scene generique + un UML propre suffisent souvent.
