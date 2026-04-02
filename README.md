# Design Pattern Playground

Ce depot contient un backend Spring Boot et un frontend React pour simuler et visualiser des design patterns de maniere interactive.

## Structure

- `Backend/` : API Spring Boot 4 avec un registre de patterns, des schemas dynamiques, une authentification JWT via cookies `HttpOnly` et une persistance PostgreSQL.
- `Frontend/` : application React 19 + Vite + Tailwind qui consomme l API et degrade en mode local si le backend est indisponible.
- `docs/` : diagrammes PlantUML transverses au produit complet.

## Documentation Et Diagrammes

La documentation PlantUML est répartie en trois niveaux :

- [docs/README.md](./docs/README.md) : vision système globale et boucle pédagogique
- [docs/README.md](./docs/README.md) : vision système globale, boucle pédagogique et déploiement
- [Backend/docs/README.md](./Backend/docs/README.md) : architecture backend, modules et séquences
- [Frontend/docs/README.md](./Frontend/docs/README.md) : architecture frontend, navigation, quiz et visualisation

## Prerequis

- Java 17
- Node.js + npm
- Pas besoin de Maven installe globalement : le backend utilise `./mvnw`

## Demarrer le backend

Le backend attend maintenant PostgreSQL. Le plus simple est donc d utiliser Docker Compose.

Si vous voulez le lancer a la main hors Docker, il faut d abord disposer d une base PostgreSQL locale puis exporter :

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/design_pattern_playground
export SPRING_DATASOURCE_USERNAME=design_pattern_playground
export SPRING_DATASOURCE_PASSWORD=design_pattern_playground
```

Puis :

```bash
cd Backend
./mvnw spring-boot:run
```

Points utiles :

- API catalogue : `http://localhost:8080/api/patterns`
- Schema d un pattern : `http://localhost:8080/api/patterns/strategy/schema`
- Execution d une demo : `POST http://localhost:8080/api/patterns/execute`

## Demarrer le frontend

```bash
cd Frontend
npm install
npm run dev
```

Le frontend Vite demarre sur `http://localhost:5173` et proxifie `/api` vers `http://localhost:8080` par defaut.

## Docker Dev

Le compose de dev expose les ports et monte le code source pour travailler localement.

```bash
docker compose -f compose.dev.yml up --build
```

Acces utiles :

- Frontend : `http://localhost:5173`
- Backend : `http://localhost:8080`
- PostgreSQL : `localhost:5433` par defaut

Si `5433` ne vous convient pas, vous pouvez surcharger le port publie avant le lancement :

```bash
POSTGRES_HOST_PORT=5432 docker compose -f compose.dev.yml up --build
```

Le frontend Vite passe par le proxy `/api`, ce qui permet d utiliser les cookies `HttpOnly` sans stocker de jetons dans le navigateur.

## Docker Prod

Le compose de prod n expose pas de ports publiquement. Il publie les services applicatifs via Traefik avec un routage sur le meme host :

- frontend sur `/`
- backend sur `/api`
- `adminer` uniquement sur `127.0.0.1` du VPS pour un acces via tunnel SSH

Preparation :

```bash
cp .env.prod.example .env
```

Puis :

```bash
docker compose --env-file .env -f compose.prod.yml pull
docker compose --env-file .env -f compose.prod.yml up -d
```

Prerequis prod :

- un reseau Traefik externe existant, par defaut `traefik-public`
- une valeur `APP_HOST` definie dans `.env`
- une registry privee disponible via `REGISTRY_HOST`
- des variables PostgreSQL definies dans `.env`
- une valeur `ADMINER_HOST_PORT` si tu veux changer le port local VPS utilise par `adminer`
- un `APP_JWT_SECRET` fort dans `.env`
- si vous voulez appeler une API sur une autre origine, renseigner `VITE_API_URL` lors du build GitHub Actions
- si le frontend et l API ne sont plus servis sur la meme origine, adaptez `APP_COOKIE_SAME_SITE` et `APP_COOKIE_SECURE`

### Acces Adminer via tunnel SSH

Le service `adminer` de prod n est pas expose sur Internet. Il ecoute uniquement sur `127.0.0.1:${ADMINER_HOST_PORT:-18080}` du VPS.

Depuis ta machine locale :

```bash
ssh -L 18080:127.0.0.1:18080 debian@ton-vps
```

Puis ouvre :

```text
http://localhost:18080
```

Champs a utiliser dans Adminer :

- `System` : `PostgreSQL`
- `Server` : `postgres`
- `Username` : valeur de `POSTGRES_USER`
- `Password` : valeur de `POSTGRES_PASSWORD`
- `Database` : valeur de `POSTGRES_DB`

## Registry Privee Sur Le VPS

Le projet peut maintenant utiliser une registry Docker privee hebergee directement sur le VPS, sans Docker Hub.

Fichiers utiles :

- `compose.registry.yml` : deploie la registry privee derriere Traefik
- `scripts/setup_registry_auth.sh` : genere le fichier `htpasswd`
- `scripts/deploy_registry.sh` : lance la registry sur le VPS
- `scripts/deploy_prod.sh` : connecte le VPS a la registry, tire les images et redeploie l app

### Variables a prevoir dans `.env`

Exemple minimal :

```env
APP_HOST=design-pattern-playground.example.com
REGISTRY_HOST=registry.design-pattern-playground.example.com
REGISTRY_NAMESPACE=design-pattern-playground
REGISTRY_USERNAME=design-pattern-playground
REGISTRY_PASSWORD=change-me
TRAEFIK_PUBLIC_NETWORK=traefik-public
TRAEFIK_ENTRYPOINT=websecure
TRAEFIK_CERTRESOLVER=letsencrypt
POSTGRES_DB=design_pattern_playground
POSTGRES_USER=design_pattern_playground
POSTGRES_PASSWORD=change-me
ADMINER_HOST_PORT=18080
APP_JWT_SECRET=change-me-with-a-long-random-secret
APP_COOKIE_SECURE=true
APP_COOKIE_SAME_SITE=Lax
APP_COOKIE_DOMAIN=
```

### Premiere installation de la registry

Sur le VPS :

```bash
cd /srv/design-pattern-playground
cp .env.prod.example .env
chmod +x scripts/setup_registry_auth.sh scripts/deploy_registry.sh
REGISTRY_USERNAME=design-pattern-playground REGISTRY_PASSWORD='change-me' ./scripts/setup_registry_auth.sh
./scripts/deploy_registry.sh
```

La registry sera ensuite exposee via `https://REGISTRY_HOST`.

## CI/CD GitHub Actions

Le depot contient maintenant un workflow GitHub Actions dans `.github/workflows/ci-cd.yml`.

Pipeline :

- sur `pull_request` vers `main` : tests backend + build frontend + validation des compose
- sur `push` vers `main` : meme verification, build des images, push vers la registry privee du VPS, puis deploiement automatique
- sur `workflow_dispatch` : relance manuelle de la pipeline et du deploiement

Le deploiement est fait par :

- build des images backend/frontend dans GitHub Actions
- push des images taggees `${GITHUB_SHA}` dans la registry privee du VPS
- synchronisation du repo sur le VPS
- execution de `scripts/deploy_prod.sh` avec `APP_IMAGE_TAG=${GITHUB_SHA}`

### Secrets GitHub a configurer

Dans `Settings > Secrets and variables > Actions`, ajoute :

- `VPS_SSH_HOST` : IP ou nom DNS du VPS
- `VPS_SSH_PORT` : port SSH, `22` par defaut
- `VPS_SSH_USER` : utilisateur utilise pour le deploiement
- `VPS_SSH_PRIVATE_KEY` : cle privee SSH utilisee par GitHub Actions
- `VPS_SSH_KNOWN_HOSTS` : sortie de `ssh-keyscan -H ton-vps`
- `VPS_APP_DIR` : dossier de deploiement sur le VPS, par exemple `/srv/design-pattern-playground`
- `PROD_ENV_FILE` : contenu complet du fichier `.env` de production
- `REGISTRY_HOST` : domaine de la registry privee, par exemple `registry.design-pattern-playground.example.com`
- `REGISTRY_NAMESPACE` : namespace utilise dans la registry, par exemple `design-pattern-playground`
- `REGISTRY_USERNAME` : identifiant de la registry privee
- `REGISTRY_PASSWORD` : mot de passe de la registry privee

Exemple de `PROD_ENV_FILE` a partir de `.env.prod.example` :

```env
APP_HOST=design-pattern-playground.example.com
REGISTRY_HOST=registry.design-pattern-playground.example.com
REGISTRY_NAMESPACE=design-pattern-playground
REGISTRY_USERNAME=design-pattern-playground
REGISTRY_PASSWORD=change-me
TRAEFIK_PUBLIC_NETWORK=traefik-public
TRAEFIK_ENTRYPOINT=websecure
TRAEFIK_CERTRESOLVER=letsencrypt
VITE_API_URL=
POSTGRES_DB=design_pattern_playground
POSTGRES_USER=design_pattern_playground
POSTGRES_PASSWORD=change-me
APP_JWT_SECRET=change-me-with-a-long-random-secret
APP_COOKIE_SECURE=true
APP_COOKIE_SAME_SITE=Lax
APP_COOKIE_DOMAIN=
```

### Prerequis sur le VPS

Le VPS doit disposer de :

- Docker
- Docker Compose
- un reverse proxy Traefik deja installe si tu veux reutiliser `compose.prod.yml`
- la registry privee deja deployee ou prete a etre deployee via `compose.registry.yml`
- le reseau Docker externe `traefik-public` ou le nom defini dans `TRAEFIK_PUBLIC_NETWORK`

Le script de deploiement cree le reseau Traefik s il est absent, mais Traefik doit bien etre configure pour l utiliser.

### Premiere mise en service

1. pousser le depot sur GitHub
2. ajouter les secrets GitHub ci-dessus
3. preparer le VPS avec Docker, Traefik et la registry privee
4. verifier que `APP_HOST` et `REGISTRY_HOST` pointent vers le VPS
5. lancer le workflow manuellement via `Actions > CI/CD > Run workflow`

Le workflow :

- pousse les images backend et frontend vers la registry privee du VPS
- copie le projet sur le VPS
- ecrit le fichier `.env` de production
- lance `APP_IMAGE_TAG=${GITHUB_SHA} ./scripts/deploy_prod.sh`

En cas de besoin, le meme script peut aussi etre lance a la main sur le VPS :

```bash
cd /srv/design-pattern-playground
chmod +x scripts/deploy_prod.sh
APP_IMAGE_TAG=main ./scripts/deploy_prod.sh
```

## Verifications utiles

Backend :

```bash
cd Backend
./mvnw test
```

Frontend :

```bash
cd Frontend
npm run build
```

## MVP implemente

- `strategy` : choix dynamique d une strategie de paiement avec logs et visualisation simple.
- `factory` : creation dynamique d un vehicule via une fabrique avec schema genere par le backend.
- `observer` : propagation d un evenement a plusieurs abonnes avec logs de souscription et notifications.
- `singleton` : comparaison avec / sans instance unique partagee entre plusieurs clients.
- `state` : machine a etats interactive avec timeline, transitions et scene SVG dediee.
- `flyweight` : simulation memoire avec mutualisation d instances et comparaison live.
- `decorator` : empilement de power-ups sur un composant de base avec stats cumulees et pile de wrappers.
- UI frontend composee de :
  - page d accueil qui presente le projet et permet de choisir un pattern
  - page dediee par pattern avec formulaire, resultat, scene SVG et UML
- quiz proteges par authentification avec progression persistee, score pondere et badges
- page dediee de progression utilisateur accessible depuis la navbar
- authentification utilisateur avec inscription et connexion
- session geree par cookies `HttpOnly` avec access token court et refresh token rotatif
- persistance des comptes et sessions de refresh dans PostgreSQL
- mode fallback local pour les demos quand l API pattern est coupee

## Endpoints principaux

- `GET /api/patterns`
- `GET /api/patterns/{code}`
- `GET /api/patterns/{code}/schema`
- `POST /api/patterns/execute`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Exemple `strategy` :

```json
{
  "patternCode": "strategy",
  "parameters": {
    "amount": 150,
    "strategy": "PAYPAL"
  }
}
```

Exemple `factory` :

```json
{
  "patternCode": "factory",
  "parameters": {
    "vehicleType": "CAR"
  }
}
```

## Suite logique

- Ajouter `builder`, `command` et d autres patterns tres visuels comme `adapter` ou `command`.
- Continuer a enrichir les scenes SVG et les quiz par pattern.
- Ajouter un mode apprentissage et un mode developpeur avec code Java genere.
