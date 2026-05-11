# Frontend

Frontend React 19 + Vite + Tailwind du `Design Pattern Playground`.

Ce README decrit la structure actuelle apres le gros refactor par pattern, l ajout des espaces utilisateur et des editeurs UML, puis explique comment ajouter un nouveau design pattern sans regrossir les fichiers centraux.

## Ce que gere le frontend

- navigation SPA et rendu des pages principales
- fallback local quand le backend n est pas disponible
- authentification, session persistante et changement de mot de passe force
- catalogue, pages pattern, quiz, progression, badges et missions
- visualisation UML et scenes SVG
- editeur UML admin
- studio UML utilisateur avec zoom, quadrillage, export SVG/PNG et sauvegarde

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
- `src/patterns/catalog.js`
- `src/patterns/loaders.js`
- `src/patterns/defaults.js`

Ces fichiers gerent :

- la navigation
- l authentification
- le chargement backend
- le fallback local
- le code splitting par route et par pattern
- la composition globale des pages

Le studio UML utilisateur s appuie sur :

- `src/pages/UmlStudioPage.jsx` pour l orchestration
- `src/components/umlStudio/umlStudioDocument.js` pour le format de document et les helpers
- `src/components/umlStudio/UmlStudioCanvas.jsx` pour le rendu SVG interactif
- `src/components/umlStudio/UmlStudioPalette.jsx` pour la creation
- `src/components/umlStudio/UmlStudioInspector.jsx` pour l edition des proprietes

### Pages et composants generiques

Pages :

- `src/pages/HomePage.jsx`
- `src/pages/PatternPage.jsx`
- `src/pages/pattern-page/`
- `src/pages/PatternQuizPage.jsx`
- `src/pages/QuizDashboardPage.jsx`
- `src/pages/AdminUmlPage.jsx`
- `src/pages/AdminSvgScenesPage.jsx`
- `src/pages/UmlStudioPage.jsx`
- `src/pages/NotFoundPage.jsx`

Composants transverses :

- `src/components/SiteHeader.jsx`
- `src/components/CollapsiblePanel.jsx`
- `src/components/UmlDiagram.jsx`
- `src/components/VisualizationModal.jsx`
- `src/components/AuthDialog.jsx`
- `src/components/ExecutionScene.jsx`

Composants lies aux editeurs UML :

- `src/components/uml/` : rendu UML generique et layouts de patterns
- `src/components/umlStudio/` : sous-composants du studio UML utilisateur

Important :

- `ExecutionScene.jsx` n est plus un monolithe
- il charge les scenes specialisees a la demande
- `UmlDiagram.jsx` reste le renderer UML generique
- `PatternPage.jsx` n est plus qu un assembleur
- les blocs de page vivent dans `src/pages/pattern-page/`
- `App.jsx` charge les pages en lazy loading

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
- `index.js`

Roles :

- `data.js` : metadata locales du pattern
- `executor.js` : execution fallback locale
- `scene.jsx` : rendu SVG specialise
- `index.js` : point d entree agrege charge dynamiquement par `src/patterns/loaders.js`

Fichiers partages :

- `src/patterns/catalog.js`
- `src/patterns/loaders.js`
- `src/patterns/defaults.js`
- `src/patterns/shared/sceneShared.jsx`
- `src/patterns/shared/executorCommon.js`
- `src/patterns/shared/adapterExecutorSupport.js`
- `src/patterns/shared/mediatorChainExecutorSupport.js`
- `src/patterns/shared/commandExecutorSupport.js`
- `src/patterns/shared/stateExecutorSupport.js`
- `src/patterns/shared/flyweightExecutorSupport.js`
- `src/patterns/shared/decoratorExecutorSupport.js`
- `src/patterns/shared/builderExecutorSupport.js`

Les anciennes facades `src/data/*` et les registres statiques `dataRegistry.js` / `executorRegistry.js` ont ete retires.
Il n y a plus qu une seule source de verite :

- `src/patterns/catalog.js` pour le catalogue leger
- `src/patterns/<code>/data.js` pour les donnees locales
- `src/patterns/<code>/executor.js` pour les fallbacks d execution
- `src/patterns/<code>/scene.jsx` pour les scenes specialisees
- `src/patterns/loaders.js` pour le chargement dynamique

## Code splitting

Le frontend ne charge plus tout le monde au demarrage.

Il est maintenant coupe sur deux axes :

- par route, avec `React.lazy` dans `src/App.jsx`
- par pattern, avec `import.meta.glob` dans `src/patterns/loaders.js`

Concretement :

- l accueil, la page pattern, le quiz, la progression et les modales partent en chunks separes
- `data.js`, `executor.js` et `scene.jsx` sont charges uniquement quand un pattern en a besoin
- le catalogue reste synchrone via `src/patterns/catalog.js`, donc la home reste rapide
- la sortie Vite est nommee par usage avec `manualChunks` dans `vite.config.js` : `page-quiz`, `page-pattern`, `modal-auth`, `pattern-state`, `pattern-builder`, etc.
- la page pattern elle-meme est decoupee en sous-chunks : `page-pattern-visualization`, `page-pattern-result` et `page-pattern-learning`
- la page quiz suit le meme principe avec `page-quiz-question` et `page-quiz-summary`

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
├── index.js
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

## 2. Declarer le pattern dans le catalogue leger

Mettre a jour `src/patterns/catalog.js`.

Tu dois y ajouter au minimum :

- une entree dans `fallbackPatterns`
- une entree dans `patternPreviewTaglinesByCode`

Le reste sera resolu automatiquement a partir du dossier `src/patterns/<code>/` par `src/patterns/loaders.js`.

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

Tu n as rien d autre a declarer : `src/patterns/loaders.js` detecte automatiquement les `executor.js` disponibles.

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

Tu n as pas besoin de brancher la scene manuellement dans `src/components/ExecutionScene.jsx`.
Si `src/patterns/<code>/scene.jsx` existe, elle sera chargee automatiquement a la demande.

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
2. Declarer le metadata leger dans `src/patterns/catalog.js`
3. Creer `src/patterns/<code>/executor.js`
4. Creer `src/patterns/<code>/index.js` pour reexporter `data`, `fallbackExecutor` et eventuellement `SceneComponent`
5. Ajouter `src/patterns/<code>/scene.jsx` si le pattern merite une scene dediee
6. Verifier la page pattern et le quiz
7. Lancer `npm run build`

## Verification

Commande minimale apres ajout ou refactor :

```bash
cd Frontend
npm run build
```

Si le build passe, la structure modulaire est coherente.
