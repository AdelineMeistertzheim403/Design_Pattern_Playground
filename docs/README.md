# Diagrammes Système

Ce dossier contient les diagrammes PlantUML transverses au projet complet.

Contrairement aux dossiers :

- [Backend/docs](../Backend/docs/README.md)
- [Frontend/docs](../Frontend/docs/README.md)

ici l'objectif n'est pas de détailler une couche technique précise, mais de représenter le produit dans son ensemble.

## Contenu

### Vue système globale

- [usecase-system-overview.puml](./usecase-system-overview.puml)

Ce diagramme représente les principaux cas d'usage du système complet :

- consultation des patterns
- exécution des démos
- visualisation UML et runtime
- inscription / connexion
- quiz
- progression
- persistance des données clés en PostgreSQL

À lire si tu veux présenter le projet comme une plateforme full-stack cohérente.

### Boucle pédagogique

- [usecase-learning-loop.puml](./usecase-learning-loop.puml)

Ce diagramme représente la logique pédagogique du produit :

1. découvrir
2. manipuler
3. comprendre
4. se tester
5. valider
6. mesurer sa progression

À lire si tu veux mettre en avant la valeur éducative du projet dans une soutenance, un portfolio ou une documentation produit.

### Déploiement production

- [deployment-production-diagram.puml](./deployment-production-diagram.puml)

Ce diagramme montre l'infrastructure de production :

- VPS
- Traefik
- frontend
- backend
- PostgreSQL
- registry privée
- routage par domaine / chemin

À lire si tu veux documenter l'architecture d'hébergement réelle.

### CI/CD et registry privée

- [cicd-registry-deploy-diagram.puml](./cicd-registry-deploy-diagram.puml)

Ce diagramme montre le flux de livraison :

- push GitHub
- jobs GitHub Actions
- build et push des images
- registry privée sur le VPS
- déploiement par SSH et `deploy_prod.sh`

À lire si tu veux expliquer la chaîne de déploiement complète.

### Séquence full-stack quiz

- [sequence-quiz-submission-end-to-end.puml](./sequence-quiz-submission-end-to-end.puml)

Ce diagramme montre un cas réel de bout en bout :

- ouverture d'un quiz
- chargement des questions et de la progression
- réponses dans le frontend
- soumission au backend
- calcul du score
- persistance de la progression
- retour du résultat à l'interface

À lire si tu veux montrer comment frontend, backend et base coopèrent sur une fonctionnalité pédagogique centrale.

### Séquence full-stack auth et refresh

- [sequence-auth-refresh-end-to-end.puml](./sequence-auth-refresh-end-to-end.puml)

Ce diagramme montre le cycle complet d'authentification système :

- login
- émission des cookies HttpOnly
- restauration de session
- refresh token
- rotation des cookies
- logout

À lire si tu veux documenter proprement la sécurité applicative de bout en bout.

## Ordre de lecture recommandé

1. [usecase-system-overview.puml](./usecase-system-overview.puml)
2. [usecase-learning-loop.puml](./usecase-learning-loop.puml)
3. [deployment-production-diagram.puml](./deployment-production-diagram.puml)
4. [cicd-registry-deploy-diagram.puml](./cicd-registry-deploy-diagram.puml)
5. [sequence-quiz-submission-end-to-end.puml](./sequence-quiz-submission-end-to-end.puml)
6. [sequence-auth-refresh-end-to-end.puml](./sequence-auth-refresh-end-to-end.puml)
7. [Backend/docs/README.md](../Backend/docs/README.md)
8. [Frontend/docs/README.md](../Frontend/docs/README.md)

## Quand utiliser ces diagrammes

- présentation produit globale
- introduction de documentation
- slide de soutenance
- vue d'ensemble avant de plonger dans les diagrammes techniques backend/frontend
- documentation d'infrastructure et de déploiement
- explication d'un flux complet métier ou sécurité

## Prévisualisation

Avec l'extension PlantUML dans VS Code :

1. ouvre le fichier `.puml`
2. lance `Alt + D`
