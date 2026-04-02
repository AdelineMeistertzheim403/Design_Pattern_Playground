# Diagrammes Backend

Ce dossier contient les diagrammes PlantUML du backend de `Design Pattern Playground`.

L'objectif est de fournir plusieurs niveaux de lecture :

- une vue d'ensemble de l'architecture backend
- une vue détaillée par module métier
- des diagrammes de séquence pour les flux les plus importants

## Contenu

### Vue d'ensemble

- [backend-class-diagram.puml](./backend-class-diagram.puml)

Ce diagramme donne la structure globale du backend :

- configuration Spring
- contrôleurs REST
- sécurité et authentification
- coeur `pattern`
- coeur `quiz`
- modules de démo (`strategy`, `factory`, `observer`, `singleton`, `flyweight`, `state`)

À lire en premier si tu veux comprendre rapidement l'organisation générale du projet.

### Module Pattern

- [pattern-module-class-diagram.puml](./pattern-module-class-diagram.puml)

Ce diagramme zoome sur le moteur principal des design patterns :

- `PatternController`
- `PatternService`
- `PatternRegistry`
- contrat `DesignPatternDemo`
- objets métier communs (`PatternMetadata`, `PatternSchema`, `PatternExecutionResult`, `VisualizationGraph`)
- implémentations concrètes de chaque pattern

À lire si tu veux comprendre comment ajouter une nouvelle démo de pattern.

### Module Quiz

- [quiz-module-class-diagram.puml](./quiz-module-class-diagram.puml)

Ce diagramme détaille le système de quiz et de progression :

- `PatternQuizProvider`
- `PatternQuizRegistry`
- `PatternQuizService`
- `PatternQuizProgressService`
- `QuizDashboardService`
- objets de quiz (`PatternQuiz`, `QuizQuestion`, `QuizSubmissionResult`, `QuizProgressResponse`)
- entité persistée `UserQuizProgress`

À lire si tu veux comprendre comment ajouter un quiz ou faire évoluer le scoring.

### Module Auth

- [auth-module-class-diagram.puml](./auth-module-class-diagram.puml)

Ce diagramme détaille le module d'authentification :

- `AuthController`
- `AuthService`
- `JwtService`
- `AuthCookieService`
- `JwtAuthenticationFilter`
- entités `UserAccount` et `RefreshTokenSession`

À lire si tu veux comprendre la sécurité du backend et le flux JWT + refresh token.

### Séquence d'exécution d'un pattern

- [pattern-execution-sequence.puml](./pattern-execution-sequence.puml)

Ce diagramme montre le flux d'une exécution métier :

1. appel REST `POST /api/patterns/execute`
2. délégation au `PatternService`
3. résolution du bon bean via `PatternRegistry`
4. exécution de la démo concrète
5. retour d'un `PatternExecutionResult`

À lire si tu veux comprendre le runtime d'un pattern côté backend.

### Séquence JWT + refresh token

- [auth-jwt-refresh-sequence.puml](./auth-jwt-refresh-sequence.puml)

Ce diagramme montre le cycle complet d'authentification :

1. `login`
2. création du JWT access token
3. persistance du refresh token
4. authentification d'une route protégée
5. `refresh` avec rotation du refresh token
6. `logout` avec suppression des cookies

À lire si tu veux comprendre le flux d'authentification complet.

## Ordre de lecture recommandé

1. [backend-class-diagram.puml](./backend-class-diagram.puml)
2. [pattern-module-class-diagram.puml](./pattern-module-class-diagram.puml)
3. [quiz-module-class-diagram.puml](./quiz-module-class-diagram.puml)
4. [auth-module-class-diagram.puml](./auth-module-class-diagram.puml)
5. [pattern-execution-sequence.puml](./pattern-execution-sequence.puml)
6. [auth-jwt-refresh-sequence.puml](./auth-jwt-refresh-sequence.puml)

## Prévisualisation dans VS Code

Avec l'extension `PlantUML` :

1. ouvre un fichier `.puml`
2. lance `Alt + D`

Pour le rendu local, il faut :

- Java installé
- Graphviz installé
- `dot` disponible dans le `PATH`

Dans ton environnement actuel `Code - OSS`, le réglage utile est dans :

- `/home/adeline/.config/Code - OSS/User/settings.json`

Exemple minimal :

```json
"plantuml.render": "Local",
"plantuml.jarArgs": [
  "-graphvizdot",
  "/usr/bin/dot"
]
```

## Intention de modélisation

Ces diagrammes ne cherchent pas à être exhaustifs à 100 %.

Ils privilégient :

- la lisibilité
- les classes structurantes
- les dépendances métier importantes
- les points d'extension du projet

Certains DTO mineurs, exceptions secondaires ou détails techniques très fins sont volontairement omis quand ils nuisent à la lecture.

## Quand les utiliser

- revue d'architecture
- onboarding sur le backend
- documentation de soutenance ou portfolio
- préparation d'une refonte ou de l'ajout d'un nouveau pattern
- explication du système de quiz et de progression
