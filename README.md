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

Le frontend Vite demarre sur `http://localhost:5173` et vise par defaut `http://localhost:8080`.

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
