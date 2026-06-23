# Yukihon — Deploy & Run

Stack: Spring Boot 3.5 (Java 21) · MySQL 8 (utf8mb4) · React/Vite served by nginx.
DB schema is managed by **Flyway** (`ddl-auto: none`); the demo data is seeded by `DataInitializer`.

## Run with Docker (whole stack)

```bash
docker compose up --build
```

| Service  | URL                          | Notes |
|----------|------------------------------|-------|
| Frontend | http://localhost:8081        | nginx; proxies `/api`, `/uploads`, `/ws-community-chat` to the backend |
| Backend  | http://localhost:8080        | Spring Boot; Flyway runs on boot |
| MySQL    | localhost:3307 → 3306        | host 3307 to avoid clashing with a local mysqld on 3306 |
| Swagger  | http://localhost:8080/swagger-ui.html | dev only (disabled in prod) |
| Health   | http://localhost:8080/actuator/health | used by the compose healthcheck |

Default seeded logins: `admin@yukihon.local / Admin@123`, `learner@yukihon.local / User@123`.

Reset everything (wipes the DB volume): `docker compose down -v`.

### Secrets / config — `.env` next to `docker-compose.yml`
```dotenv
DB_PASSWORD=change-me
JWT_SECRET=<base64 256-bit secret>
OPENAI_API_KEY=sk-...
SPRING_PROFILES_ACTIVE=dev   # use 'prod' for production
```

## Run locally (without Docker)

Needs a MySQL 8 on `localhost:3306` with a `yukihon` database (utf8mb4). Override via env:
```bash
cd backend
DB_URL='jdbc:mysql://localhost:3306/yukihon?useUnicode=true&characterEncoding=utf8&serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false&createDatabaseIfNotExist=true' \
DB_USERNAME=root DB_PASSWORD=yourpass ./mvnw spring-boot:run
# frontend
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## Database notes
- Engine: **MySQL 8**, charset **utf8mb4** (stores Japanese/Vietnamese natively — no NVARCHAR needed).
- Migrations: `backend/src/main/resources/db/migration` — `V1__init.sql` (baseline schema) + `V2__hot_path_indexes.sql`.
- The old SQL Server migrations are kept for reference under `backend/sqlserver-migrations-archive/` (not on the Flyway path).
- Regenerate the baseline after entity changes: boot once with `JPA_DDL_AUTO=create FLYWAY_ENABLED=false`, then `mysqldump --no-data` → `V1__init.sql`.

## Production checklist
- `SPRING_PROFILES_ACTIVE=prod` → disables Swagger/api-docs, the dev seed, and reset-token exposure (`application-prod.yml`); JPA `ddl-auto: validate`.
- Set strong `JWT_SECRET` and `DB_PASSWORD`; never use the dev defaults.
- Serve over HTTPS (HSTS header is already configured; only takes effect over TLS).
- Actuator exposes only `health,info,metrics`; `metrics` requires auth. Lock down further via `ACTUATOR_ENDPOINTS`.
- Observability + hardening backlog: request rate-limiting on auth/AI endpoints, error tracking (e.g. Sentry), centralized logs.

## CI
`.github/workflows/ci.yml` runs on push/PR to `main`: backend `spotless:check` + `mvn verify`; frontend `format:check` + `lint` + `typecheck` + `test` + `build`.
