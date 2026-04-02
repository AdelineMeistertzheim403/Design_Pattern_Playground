# Diagrammes Frontend

Ce dossier contient les diagrammes PlantUML du frontend de `Design Pattern Playground`.

Ils complètent la documentation backend avec une vue claire de :

- l'architecture React actuelle
- la navigation locale sans routeur externe
- les flux de chargement des patterns et des quiz
- la gestion d'authentification côté navigateur
- le rôle des composants de visualisation

## Contenu

### Vue d'ensemble

- [frontend-component-diagram.puml](./frontend-component-diagram.puml)

Vue globale du frontend :

- point d'entrée `main.jsx`
- `App` comme shell d'affichage
- `usePlaygroundApp` comme hook d'orchestration
- pages principales
- composants transverses
- client API
- jeux de données fallback

À lire en premier pour comprendre l'organisation générale du frontend.

### Shell et routing

- [app-shell-module-diagram.puml](./app-shell-module-diagram.puml)

Ce diagramme détaille :

- la composition de `App`
- le rôle de `usePlaygroundApp`
- la navigation locale via `history.pushState`
- les utilitaires de route dans `playgroundUtils`

À lire si tu veux comprendre comment la navigation fonctionne sans `react-router`.

### Navigation UX

- [navigation-user-journey-diagram.puml](./navigation-user-journey-diagram.puml)

Ce diagramme montre le parcours utilisateur global :

- accueil
- page d'un pattern
- modales de visualisation
- quiz
- tableau de progression
- points d'entrée de connexion / inscription

À lire si tu veux présenter le frontend sous un angle UX, portfolio ou parcours pédagogique.

### Cas d'usage plateforme

- [usecase-platform-overview.puml](./usecase-platform-overview.puml)

Ce diagramme présente les principaux cas d'usage fonctionnels de la plateforme :

- parcours visiteur
- parcours utilisateur connecté
- consultation des patterns
- exécution des démos
- accès au quiz
- accès à la progression

À lire si tu veux documenter le produit sous un angle fonctionnel ou soutenance.

### Cas d'usage quiz et progression

- [usecase-quiz-progression.puml](./usecase-quiz-progression.puml)

Ce diagramme zoome sur la boucle pédagogique de validation :

- ouverture d'un quiz
- réponses question par question
- soumission et scoring
- déblocage du badge
- consultation du tableau de progression

À lire si tu veux expliquer précisément la valeur pédagogique du module quiz.

### Module visualisation

- [visualization-module-diagram.puml](./visualization-module-diagram.puml)

Ce diagramme zoome sur :

- `PatternPage`
- `ExecutionScene`
- `UmlDiagram`
- `VisualizationModal`
- `ZoomableViewport`
- `CollapsiblePanel`

À lire si tu veux comprendre comment la démo visuelle, l'UML et les modales grand format s'articulent.

### Module quiz

- [quiz-module-diagram.puml](./quiz-module-diagram.puml)

Ce diagramme détaille :

- `PatternQuizPage`
- `QuizDashboardPage`
- `usePatternQuiz`
- `usePatternQuizProgress`
- `useQuizDashboard`
- `quizUtils`
- `fallbackQuizzes`

À lire si tu veux comprendre le chargement des quiz, l'évaluation locale et la progression utilisateur.

### Séquence page pattern

- [pattern-page-sequence.puml](./pattern-page-sequence.puml)

Ce diagramme montre le flux principal côté frontend :

1. navigation vers `/patterns/:code`
2. chargement du schéma
3. mise à jour du formulaire
4. génération de l'aperçu live
5. exécution complète via le backend ou le fallback local

À lire si tu veux comprendre le runtime de la page d'un pattern.

### Séquence auth et session

- [auth-session-sequence.puml](./auth-session-sequence.puml)

Ce diagramme montre :

1. ouverture de la modale d'auth
2. login / inscription
3. persistance de la session UI
4. restauration de session au chargement
5. refresh côté backend
6. déconnexion

À lire si tu veux comprendre le comportement du frontend face aux cookies HttpOnly et au refresh token.

## Ordre de lecture recommandé

1. [frontend-component-diagram.puml](./frontend-component-diagram.puml)
2. [app-shell-module-diagram.puml](./app-shell-module-diagram.puml)
3. [navigation-user-journey-diagram.puml](./navigation-user-journey-diagram.puml)
4. [usecase-platform-overview.puml](./usecase-platform-overview.puml)
5. [usecase-quiz-progression.puml](./usecase-quiz-progression.puml)
6. [visualization-module-diagram.puml](./visualization-module-diagram.puml)
7. [quiz-module-diagram.puml](./quiz-module-diagram.puml)
8. [pattern-page-sequence.puml](./pattern-page-sequence.puml)
9. [auth-session-sequence.puml](./auth-session-sequence.puml)

## Prévisualisation dans VS Code

Avec l'extension `PlantUML` :

1. ouvre un fichier `.puml`
2. lance `Alt + D`

Pour le rendu local, il faut :

- Java installé
- Graphviz installé
- `dot` disponible dans le `PATH`

Dans ton environnement `Code - OSS`, tu peux utiliser :

```json
"plantuml.render": "Local",
"plantuml.jarArgs": [
  "-graphvizdot",
  "/usr/bin/dot"
]
```

## Intention de modélisation

Ces diagrammes privilégient :

- la lisibilité
- les responsabilités frontend importantes
- les dépendances entre pages, hooks, composants et données
- les flux utilisateur qui structurent l'application

Ils ne cherchent pas à lister chaque détail JSX ou chaque sous-fonction utilitaire.

## Quand les utiliser

- onboarding frontend
- préparation d'une refonte UI
- documentation de soutenance
- explication de la navigation ou de l'auth côté client
- préparation de l'ajout d'un nouveau pattern avec page, scène, quiz et progression
