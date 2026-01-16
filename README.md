<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Ejecutar en desarrollo

1. Clonar el repositorio
2. Ejecutar

```
yarn install
```
3. Tener Nest CLI instalado
```
npm i -g @nestjs/cli
```

4. Levantar la base de datos
```
docker-compose up -d
```

5. Clonar el archivo __.env.template__ y renombrar la copia a __.env__

6. Llenar las variables de entorno definidas en el __.env__

7. Ejecutar la aplicacion en dev:
```
yarn start:dev
```

## Tests

Para ejecutar los tests:

```
npm test
```

> Nota: los specs legacy de cards y users se ignoran temporalmente en Jest mientras se estabilizan.

## Frontend integration

**Base URL:** `http://localhost:8080/api`

Variables de entorno relevantes (.env):

```env
MONGODB_URI=mongodb://localhost:27017/thesis
JWT_SECRET=changeme
PORT=8080
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=false
OPENAI_API_KEY=
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=
```

Rutas relevantes:

* `/cards` (endpoints existentes de cards)
* `/ingestion` (auto-registro y auto-flujo)
* `/health` (estado de dependencias)

> Nota CORS local: el backend permite por defecto `http://localhost:3000`. Ajustar `CORS_ORIGIN` si cambia el origen del frontend.

## Stack usado
* MongoDB
* Nest

## Ingestion API (auto-registro y auto-flujo)

### Crear worksheet
```bash
curl -X POST http://localhost:8080/api/ingestion/worksheet \
  -H "Content-Type: application/json" \
  -d '{
    "type": "AuthorCard",
    "title": "Gabriela Mistral",
    "createdBy": "507f1f77bcf86cd799439011",
    "assignedEditors": ["507f1f77bcf86cd799439012"],
    "assignedReviewers": ["507f1f77bcf86cd799439013"]
  }'
```

### Guardar payload (form values) por tipo
```bash
curl -X POST http://localhost:8080/api/ingestion/AuthorCard/<cardId>/save \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Gabriela Mistral",
    "works": [
      {
        "title": "Desolación",
        "publicationPlace": { "city": "Santiago", "printing": "Imprenta X" }
      }
    ]
  }'
```

### Auto-review
```bash
curl -X POST http://localhost:8080/api/ingestion/AuthorCard/<cardId>/auto-review
```

### Auto-upload
```bash
curl -X POST http://localhost:8080/api/ingestion/AuthorCard/<cardId>/auto-upload
```

### Orquestador (save -> autoReview -> autoUpload)
```bash
curl -X POST "http://localhost:8080/api/ingestion/AuthorCard/auto?id=<cardId>" \
  -H "Content-Type: application/json" \
  -d '{
    "options": { "autoReview": true, "autoUpload": true },
    "payload": {
      "fullName": "Gabriela Mistral"
    }
  }'
```

### Orquestador creando worksheet si no existe
```bash
curl -X POST http://localhost:8080/api/ingestion/AuthorCard/auto \
  -H "Content-Type: application/json" \
  -d '{
    "options": { "autoReview": true },
    "worksheet": {
      "type": "AuthorCard",
      "title": "Gabriela Mistral",
      "createdBy": "507f1f77bcf86cd799439011"
    },
    "payload": {
      "fullName": "Gabriela Mistral"
    }
  }'
```
