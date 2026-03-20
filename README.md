# Yukihon

Where code meets Kanji.

## Stack

- Backend: Spring Boot 3.5.5, Spring Security, JWT, Google OAuth, JPA (SQL Server)
- Frontend: React 18, TypeScript, Vite, Tailwind, Framer Motion, TanStack Query

## Architecture Snapshot

- Backend modules are organized by domain under `backend/src/main/java/com/hoang/basis/yukihon/system/*`
- Each domain follows `controller -> service -> repository -> dto`
- Frontend API layer lives in `frontend/src/api`
- Frontend page composition follows an atomic approach (`components`, page-specific `types/constants/form`)

## Authentication Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

## Local Development

### Backend

```bash
cd backend
./mvnw test
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev
```

## Quality Checklist

- Security: Access vs refresh token validation, centralized error codes
- Performance: lazy relations with targeted entity graph fetch, reduced N+1 in community feed
- Type Safety: removed explicit `any` in admin content flow and snow effect style binding
- UX Stability: admin content page decomposed into typed sub-modules for maintainability
