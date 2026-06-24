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
# Per-IP rate limits (requests/minute); RATE_LIMIT_ENABLED=false to disable
RATE_LIMIT_AUTH=10
RATE_LIMIT_AI=30
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

## Dictionary data (self-hosted)
- **Example sentences (Tatoeba)** are cached on demand — no setup; the first lookup of a word fetches + caches them.
- **Full word lookup (JMdict)** is self-hosted. After deploy, import once (ADMIN):
  ```
  curl -X POST "http://localhost:8080/api/admin/dictionary/import/jmdict?url=<jmdict-simplified release .json.zip>" \
       -H "Authorization: Bearer <admin-token>"
  ```
  Get a release URL from github.com/scriptin/jmdict-simplified/releases (the `jmdict-eng-*.json.zip`). Set `JMDICT_URL` to skip the `url` param. Idempotent; runs in the background (watch logs). `&force=true` re-imports.
- Attribution required (add to a credits page): JMdict — EDRDG; Tatoeba — CC-BY.

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
- Rate limiting is on by default (per-IP token bucket: auth 10/min, AI/translation 30/min); tune via `RATE_LIMIT_*`. In-memory — back with Redis for multi-instance.
- Hardening backlog: error tracking (e.g. Sentry), centralized logs, CD pipeline.

## CI
`.github/workflows/ci.yml` runs on push/PR to `main`: backend `spotless:check` + `mvn verify`; frontend `format:check` + `lint` + `typecheck` + `test` + `build`.
