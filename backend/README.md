# Yukihon Backend

## Runtime

- Java 21
- Spring Boot 3.5.5
- SQL Server

## Module Convention

All business modules are placed under `com.hoang.basis.yukihon.system` and should follow:

1. `controller` for HTTP contract
2. `service` for business orchestration
3. `repository` for data access
4. `dto` for API payload mapping

## Auth and Security

- JWT now includes token type claim (`ACCESS` or `REFRESH`)
- Security filter only authenticates access tokens
- Refresh endpoint: `POST /api/auth/refresh`
- Global exception responses return consistent error codes from `ErrorCode`

## Performance Notes

- Community entities use lazy relations by default
- Repository-level `@EntityGraph` is used for required eager graphs
- Community feed like state is resolved in batch to avoid N+1 queries

## Commands

```bash
./mvnw test
./mvnw spring-boot:run
```

## Seed Data On Startup

Backend now initializes base data at startup (idempotent, no duplicate insert if table already has data):

- Permission model:
	- `permissions` table
	- `role_permissions` mapping table (RoleName enum -> Permission)
- Demo accounts and roles:
	- `admin@yukihon.local` / `Admin@123` with `ADMIN`, `USER`
	- `learner@yukihon.local` / `User@123` with `USER`
- User artifacts:
	- `user_settings`
	- `user_learning_stats`
- Learning content:
	- Lessons
	- Vocabulary
	- Grammar
	- Quizzes

Implementation file:
- `src/main/java/com/hoang/basis/yukihon/config/DataInitializer.java`

Default seeded permissions include profile access, content read/manage, community interaction,
translation usage, and admin dashboard/user/role management.
