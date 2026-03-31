# Design Pattern Playground

Ce depot contient deux projets initialises pour presenter des design patterns cote backend et frontend.

## Structure

- `Backend/` : API Java Spring Boot 4, JPA, H2, seed de donnees et endpoints REST pour un catalogue de patterns.
- `Frontend/` : application React 19 + Vite + Tailwind qui lit ce catalogue et affiche des fiches de demonstration.

## Prerequis

- Java 17
- Node.js + npm
- Pas besoin de Maven installe globalement : le backend utilise `./mvnw`

## Demarrer le backend

```bash
cd Backend
./mvnw spring-boot:run
```

Points utiles :

- API : `http://localhost:8080/api/patterns`
- H2 console : `http://localhost:8080/h2-console`

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
- H2 console : `http://localhost:8080/h2-console`

## Docker Prod

Le compose de prod n expose pas de ports. Il publie les services via Traefik avec un routage sur le meme host :

- frontend sur `/`
- backend sur `/api`

Preparation :

```bash
cp .env.prod.example .env
```

Puis :

```bash
docker compose --env-file .env -f compose.prod.yml up -d --build
```

Prerequis prod :

- un reseau Traefik externe existant, par defaut `traefik-public`
- une valeur `APP_HOST` definie dans `.env`
- si vous voulez appeler une API sur une autre origine, renseigner `VITE_API_URL` avant le build du frontend

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

## Pistes d extension

- Ajouter un package backend par pattern avec une implementation executable.
- Ajouter une page ou un onglet frontend par pattern pour comparer plusieurs implementations.
- Brancher des snippets, diagrammes ou tests interactifs sur la fiche de detail.
