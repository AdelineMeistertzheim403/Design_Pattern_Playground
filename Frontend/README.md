# Frontend

Frontend React 19 + Vite + Tailwind du `Design Pattern Playground`.

Ce README decrit la structure actuelle apres le gros refactor par pattern et explique comment ajouter un nouveau design pattern sans regrossir les fichiers centraux.

## Architecture actuelle

Le frontend est maintenant organise autour de 3 niveaux :

1. shell applicatif
2. pages et composants generiques
3. modules par pattern

### Shell applicatif

Points d entree principaux :

- `src/App.jsx`
- `src/hooks/usePlaygroundApp.js`
- `src/app/playgroundUtils.js`
- `src/lib/api.js`

Ces fichiers gerent :

- la navigation
- l authentification
- le chargement backend
- le fallback local
- la composition globale des pages

### Pages et composants generiques

Pages :

- `src/pages/HomePage.jsx`
- `src/pages/PatternPage.jsx`
- `src/pages/PatternQuizPage.jsx`
- `src/pages/QuizDashboardPage.jsx`
- `src/pages/NotFoundPage.jsx`

Composants transverses :

- `src/components/SiteHeader.jsx`
- `src/components/CollapsiblePanel.jsx`
- `src/components/UmlDiagram.jsx`
- `src/components/VisualizationModal.jsx`
- `src/components/AuthDialog.jsx`
- `src/components/ExecutionScene.jsx`

Important :

- `ExecutionScene.jsx` n est plus un monolithe
- il route vers des scenes par pattern
- `UmlDiagram.jsx` reste le renderer UML generique

### Modules par pattern

Chaque pattern vit maintenant dans `src/patterns/<code>/`.

Exemples :

- `src/patterns/flyweight/`
- `src/patterns/state/`
- `src/patterns/command/`
- `src/patterns/adapter/`

Selon le niveau de finition du pattern, on y trouve :

- `data.js`
- `executor.js`
- `scene.jsx`

Roles :

- `data.js` : metadata locales du pattern
- `executor.js` : execution fallback locale
- `scene.jsx` : rendu SVG specialise

Fichiers partages :

- `src/patterns/dataRegistry.js`
- `src/patterns/executorRegistry.js`
- `src/patterns/shared/sceneShared.jsx`
- `src/patterns/shared/executorShared.js`

Les fichiers de `src/data/` existent encore, mais ce sont maintenant de fines facades :

- `src/data/fallbackPatterns.js`
- `src/data/fallbackQuizzes.js`
- `src/data/patternLearningContent.js`
- `src/data/patternUmlDiagrams.js`

## Principe general pour un nouveau pattern

Le frontend fonctionne en double mode :

- mode backend : l API fournit catalogue, schema, execution et quiz
- mode fallback : le frontend reste utilisable localement sans backend

Pour ajouter un pattern proprement, pense en 6 blocs :

1. definition locale
2. schema fallback
3. execution fallback
4. contenu pedagogique
5. UML
6. scene SVG dediee si necessaire

## Structure recommandee pour un nouveau pattern

Exemple avec un pattern `builder` :

```text
src/patterns/builder/
├── data.js
├── executor.js
└── scene.jsx
```

Tu n es pas oblige de creer `scene.jsx` si la scene generique suffit.

## 1. Ajouter les donnees du pattern

Creer `src/patterns/<code>/data.js`.

Ce fichier doit exporter au minimum :

```js
export const patternCode = 'builder'

export const patternDefinition = {
  code: 'builder',
  name: 'Builder',
  type: 'CREATIONAL',
  description: '...',
  useCase: '...',
  complexityLevel: 'INTERMEDIATE',
}

export const fallbackSchema = {
  fields: [
    {
      name: 'mode',
      label: 'Mode',
      type: 'SELECT',
      required: true,
      allowedValues: ['WITH_BUILDER', 'WITHOUT_BUILDER'],
      defaultValue: 'WITH_BUILDER',
    },
  ],
}

export const patternLearningContent = {
  strapline: '...',
  intuition: '...',
  readingGuide: '...',
  studentAngle: '...',
  developerAngle: '...',
  playfulPrompt: '...',
  steps: ['...', '...'],
  glossary: [{ term: '...', definition: '...' }],
}

export const patternUmlDiagram = {
  viewBox: '0 0 960 640',
  classes: [],
  relations: [],
}

export const fallbackQuiz = {
  patternCode: 'builder',
  title: 'Quiz Builder',
  description: '...',
  passingPercent: 75,
  badgeLabel: 'Badge valide',
  maxPoints: 0,
  questions: [],
}
```

## 2. Declarer le pattern dans le registre de donnees

Mettre a jour `src/patterns/dataRegistry.js`.

Tu dois y brancher :

- `patternDefinition`
- `fallbackSchema`
- `patternLearningContent`
- `patternUmlDiagram`
- `fallbackQuiz`

Ce registre alimente automatiquement :

- `src/data/fallbackPatterns.js`
- `src/data/patternLearningContent.js`
- `src/data/patternUmlDiagrams.js`
- `src/data/fallbackQuizzes.js`

## 3. Ajouter l execution fallback

Creer `src/patterns/<code>/executor.js`.

Ce fichier doit exporter une fonction par defaut qui retourne un objet compatible avec le backend :

```js
export default function executeBuilderPattern(parameters) {
  return {
    patternCode: 'builder',
    summary: '...',
    logs: ['...', '...'],
    output: { ... },
    visualization: {
      nodes: [],
      edges: [],
    },
  }
}
```

Puis brancher ce fichier dans `src/patterns/executorRegistry.js`.

Ce registre alimente automatiquement `src/data/fallbackPatterns.js`.

## 4. Ajouter une scene SVG specialisee si necessaire

Si le pattern est tres visuel, creer `src/patterns/<code>/scene.jsx`.

Le composant recoit :

- `execution`
- `isExpanded`
- `panelClassName`
- `svgClassName`
- `TitleTag`
- `sourceLabel`
- `onOpenModal`

Ensuite, brancher la scene dans `src/components/ExecutionScene.jsx`.

Si tu n ajoutes pas de scene dediee :

- le pattern fonctionnera quand meme
- `ExecutionScene.jsx` utilisera la scene generique basee sur `visualization.nodes` et `visualization.edges`

## 5. Quand toucher `PatternPage.jsx`

`src/pages/PatternPage.jsx` sert pour :

- le hero
- le formulaire dynamique
- les sections repliables
- la scene SVG
- l UML
- la pedagogie
- le quiz

Tu n as besoin d y toucher que si :

- un type de champ fallback n est pas encore supporte
- un pattern demande une UX de configuration speciale
- tu veux un comportement specifique de page

## 6. Types de champs deja supportes

Le formulaire gere deja :

- `TEXT`
- `NUMBER`
- `BOOLEAN`
- `SELECT`
- `LIST`

Avant d inventer un nouveau type, verifie si un de ceux-ci suffit.

## Ce qui apparait automatiquement si le backend est pret

Si le backend expose correctement :

- `GET /api/patterns`
- `GET /api/patterns/:code/schema`
- `POST /api/patterns/execute`
- `GET /api/patterns/:code/quiz`

alors le frontend peut deja :

- afficher le pattern dans le catalogue
- ouvrir sa page
- generer le formulaire
- afficher le resultat
- afficher le quiz

Le fallback local sert surtout :

- au developpement frontend
- a l experience offline / degradee
- a garder une UX coherente meme sans backend

## Checklist courte pour ajouter un pattern

1. Creer `src/patterns/<code>/data.js`
2. Brancher `src/patterns/dataRegistry.js`
3. Creer `src/patterns/<code>/executor.js`
4. Brancher `src/patterns/executorRegistry.js`
5. Ajouter `src/patterns/<code>/scene.jsx` si le pattern merite une scene dediee
6. Brancher `src/components/ExecutionScene.jsx` si scene specialisee
7. Verifier la page pattern et le quiz
8. Lancer `npm run build`

## Verification

Commande minimale apres ajout ou refactor :

```bash
cd Frontend
npm run build
```

Si le build passe, la structure modulaire est coherente.
