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
