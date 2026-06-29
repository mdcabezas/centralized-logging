# Centralized Logging System

Microservicios con NestJS, Kafka y PostgreSQL para logging centralizado.

## Arquitectura

```mermaid
graph LR
  C[Client] -->|POST /log| G[api-gateway<br/>:3000]
  G -->|emit app-logs| K[Kafka KRaft<br/>:9092]
  K -->|consume| L[log-consumer]
  L -->|INSERT| P[(PostgreSQL)]
```

## Stack

| Capa | Tecnología |
|------|-----------|
| API Gateway | NestJS v11 HTTP + Kafka producer |
| Log Consumer | NestJS v11 Kafka microservice |
| Mensajería | Apache Kafka 4.3.0 (KRaft, sin Zookeeper) |
| Persistencia | PostgreSQL 17 (sin ORM, pg directo) |
| Contenedores | Docker Compose |

## Estructura

```
centralized-logging/
├── api-gateway/          # HTTP API + Kafka producer
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── dto/
│   └── Dockerfile
├── log-consumer/         # Kafka consumer + PostgreSQL
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── database/
│   └── Dockerfile
├── .env.example
├── docker-compose.yml
└── README.md
```

## Requisitos

- Docker y Docker Compose

## Cómo levantar

```bash
cp .env.example .env
docker compose up -d --build
```

Esperar unos segundos a que Kafka termine de iniciar, luego probar:

```bash
curl -X POST http://localhost:3000/log \
  -H "Content-Type: application/json" \
  -d '{"level": "info", "service": "test", "message": "hello world"}'
```

Respuesta esperada:

```json
{
  "status": "ok",
  "sent": {
    "level": "info",
    "service": "test",
    "message": "hello world",
    "timestamp": "2026-06-28T..."
  }
}
```

## Endpoints

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| POST | `/log` | `{ level, service, message }` | Enviar log a Kafka y persistir en DB |

### Validación

- `level`: `info`, `warn` o `error` (obligatorio)
- `service`: string no vacío (obligatorio)
- `message`: string no vacío (obligatorio)

## Desarrollo local

```bash
# Sin Docker, requiere Kafka y PostgreSQL en localhost
cd api-gateway && npm run start:dev
cd log-consumer && npm run start:dev
```

Las variables de entorno tienen defaults para localhost, no hace falta configurarlas.

## Configuración

Copiar `.env.example` a `.env` y ajustar según sea necesario:

| Variable | Default | Descripción |
|----------|---------|-------------|
| `POSTGRES_DB` | `logs` | Nombre de la base de datos |
| `POSTGRES_USER` | `postgres` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | `postgres` | Contraseña de PostgreSQL |
| `KAFKA_CLUSTER_ID` | (generado) | ID único del cluster Kafka |
