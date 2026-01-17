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
> MongoDB debe correr como Replica Set para soportar transacciones (rs0).

5. Clonar el archivo __.env.template__ y renombrar la copia a __.env__

6. Llenar las variables de entorno definidas en el __.env__

7. Ejecutar la aplicacion en dev:
```
yarn start:dev
```

## Stack usado
* MongoDB
* Nest

## Variables de entorno (backend)

```bash
# Mongo (Replica Set obligatorio para transacciones)
# Alias soportados: MONGO_URI o DATABASE_URL
MONGODB_URI=mongodb://localhost:27017/dictionary?replicaSet=rs0

# JWT
JWT_SECRET=super-secret

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=neo4j-password

# AI
AI_PROVIDER=ollama # o gemini
AI_TEMPERATURE=0
AI_TEST_MODE=false # true para respuestas deterministas en tests

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1

# Gemini
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.0-flash
```

## IA: endpoints rápidos

> Todos los endpoints de IA requieren JWT (role researcher/admin).

### Healthcheck
```bash
curl -X GET http://localhost:8080/api/ai/health \
  -H "Authorization: Bearer <TOKEN>"
```

### Test rápido (prompt)
```bash
curl -X POST http://localhost:8080/api/ai/test \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "Resume este autor en 2 líneas" }'
```

### Test forzando provider (override)
```bash
curl -X POST http://localhost:8080/api/ai/test \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -H "x-ai-provider: gemini" \
  -d '{ "prompt": "Resume este autor en 2 líneas" }'
```

## Auth (JWT)

### Register
```bash
curl -X POST http://localhost:8080/api/users/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "password", "fullName": "Usuario Demo" }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "password" }'
```

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
  -H "x-ai-provider: ollama" \
  -d '{
    "options": { "autoReview": true, "autoUpload": true },
    "payload": {
      "fullName": "Gabriela Mistral"
    }
  }'
```

### Orquestador por ID (nuevo)
```bash
curl -X POST "http://localhost:8080/api/ingestion/AuthorCard/<cardId>/auto-orchestrate" \
  -H "Content-Type: application/json" \
  -H "x-ai-provider: gemini" \
  -d '{
    "options": { "autoReview": true },
    "payload": {
      "fullName": "Gabriela Mistral"
    }
  }'
```

### Orquestador creando worksheet si no existe
```bash
curl -X POST http://localhost:8080/api/ingestion/AuthorCard/auto \
  -H "Content-Type: application/json" \
  -H "x-ai-provider: ollama" \
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

## Cards (mínimo)
```bash
curl -X POST http://localhost:8080/api/cards \
  -H "Content-Type: application/json" \
  -d '{
    "type": "AuthorCard",
    "title": "Gabriela Mistral",
    "createdBy": "507f1f77bcf86cd799439011",
    "assignedEditors": ["507f1f77bcf86cd799439012"],
    "assignedReviewers": ["507f1f77bcf86cd799439013"]
  }'
```

## Tests
```bash
yarn test:e2e
```

## Dictionary (endpoint único del frontend de chat)
```bash
curl -X POST http://localhost:8080/api/dictionary/<dictionaryId>/ask \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -H "x-ai-provider: ollama" \
  -d '{ "question": "¿Quién es Gabriela Mistral?" }'
```
