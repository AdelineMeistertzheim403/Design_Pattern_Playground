# Design Pattern Playground

Ce depot contient un backend Spring Boot et un frontend React pour simuler et visualiser des design patterns de maniere interactive.

## Structure

- `Backend/` : API Spring Boot 4 avec un registre de patterns, des schemas dynamiques et un moteur d execution.
- `Frontend/` : application React 19 + Vite + Tailwind qui consomme l API et degrade en mode local si le backend est indisponible.

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

## MVP implemente

- `strategy` : choix dynamique d une strategie de paiement avec logs et visualisation simple.
- `factory` : creation dynamique d un vehicule via une fabrique avec schema genere par le backend.
- `observer` : propagation d un evenement a plusieurs abonnes avec logs de souscription et notifications.
- UI frontend composee de :
  - catalogue de patterns
  - formulaire dynamique base sur `/schema`
  - resultat, logs et graphe simple
  - scene SVG pedagogique par pattern
  - diagramme UML associe a chaque pattern
  - mode fallback local si l API est coupee

## Endpoints principaux

- `GET /api/patterns`
- `GET /api/patterns/{code}`
- `GET /api/patterns/{code}/schema`
- `POST /api/patterns/execute`

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

- Ajouter `observer`, `singleton` puis `builder`.
- Remplacer la visualisation cartes/liens par un rendu SVG ou canvas.
- Ajouter un mode apprentissage et un mode developpeur avec code Java genere.
