# Yukihon — Conventions

Quy ước code + cấu trúc cho cả backend & frontend. Mục tiêu: clean, dễ đọc, dễ tìm, nhất quán.
Xem thêm `CLAUDE.md` (hướng dẫn framework auto-CRUD) và `ARCHITECTURE.md`.

## Formatting (tự động — đừng format tay)

| | Công cụ | Lệnh |
|---|---|---|
| Backend | **Spotless** (palantir-java-format, remove-unused-imports) | `mvn -f backend/pom.xml spotless:apply` · check: `spotless:check` |
| Frontend | **Prettier** (printWidth 100, 2-space, double-quote, semi) | `npm run format` · check: `npm run format:check` |
| Cả hai | **EditorConfig** (`.editorconfig`) | tự áp trong IDE |

ESLint đã tích hợp `eslint-config-prettier` (tắt rule format trùng Prettier). Trước khi commit: `spotless:apply` + `npm run format`.

## Backend (`com.hoang.basis.yukihon`)

- **Layout theo domain:** `system/<domain>/{controller,service,repository,entity,dto,mapper}`. Mỗi domain tự gói gọn.
- **Framework auto-CRUD (`base/`):** entity CRUD thuần → gắn `@AutoCrud` (+ `@ResourcePermission`, `@ResourceMenu`, `@Searchable`, `@FieldMeta`) là có REST `/api/auto/{path}` + metadata + quyền + menu. KHÔNG viết controller/service/repo rỗng cho CRUD thuần. Vì `ddl-auto: none` → **luôn kèm Flyway migration** tạo bảng.
- **User hiện tại trong controller:** dùng `@CurrentUserId Long userId` (hoặc `@CurrentUser User user`) — `CurrentUserArgumentResolver` (`base/security`) tự resolve từ SecurityContext. **Không** viết lại helper `getUserId(UserDetails)`.
- **Lỗi:** ném `ResourceNotFoundException`/`IllegalArgumentException`, hoặc `ResponseStatusException(status, reason)`; `GlobalExceptionHandler` trả `ApiError{status,error,message,path}` theo `ErrorCode`. **Đừng** ném `RuntimeException` trần (→ 500).
- **DTO:** static `Dto.fromEntity(entity)` (record hoặc Lombok `@Builder`). DTO có quan hệ → cân nhắc MapStruct.
- **Unicode:** cột chứa tiếng Nhật/Việt → `columnDefinition = "NVARCHAR(...)"`; migration dùng `NVARCHAR`. Maven compile UTF-8 (`project.build.sourceEncoding`).
- **Transaction:** `org.springframework...@Transactional` (đừng `jakarta`); `readOnly=true` cho query.
- **OpenAPI:** springdoc tự sinh `/v3/api-docs` + `/swagger-ui.html` từ controller (`base/config/OpenApiConfig`: scheme `bearer-jwt`, bỏ qua param `@CurrentUserId/@CurrentUser`). **Tắt ở prod** (`application-prod.yml` → `springdoc.*.enabled: false`). Endpoint mới chỉ cần là controller chuẩn → tự lên doc.

## Frontend (`frontend/src`)

- **API layer:** mọi gọi API qua `apiClient` (`@/lib/apiClient` — tự gắn Bearer + auto-refresh 401). Dùng sugar `apiClient.get<T>(url, params?)` / `post` / `put` / `patch` / `del` (tự `JSON.stringify`, tự build query). `request<T>` vẫn còn cho case đặc biệt. File api: `api/<feature>Api.ts`, export qua `api/index.ts`. REST thuần → `createResource<T>("/api/x")` (list/get/create/update/remove).
- **Type nguồn chân lý:** `src/api/schema.d.ts` sinh từ OpenAPI bằng `npm run gen:api` (backend phải đang chạy). Trích type: `import type { Schema } from "@/api/types"` → `Schema<"DeckDto">`. BE đổi field → `gen:api` lại → FE báo lỗi type.
- **Data fetching:** dùng **TanStack Query** (`useQuery`/`useMutation`), client dùng chung ở `@/lib/queryClient` (staleTime 30s, retry 1). Không tự `useState`+`useEffect`+fetch cho dữ liệu server.
- **Hook CRUD tự sinh:** REST thuần → `createResource<T>("/api/x")` rồi `createResourceHooks("x", api)` (`@/lib/createResourceHooks`) → có sẵn `useList/useGet/useCreate/useUpdate/useRemove`, mutation tự `invalidateQueries`. Thêm 1 resource = 2 dòng.
- **Quyền:** `useAuth().hasPermission(code)` / `isAdmin()`; menu admin lấy từ `/api/meta/menu` (`useAutoMenu`).
- **Component:** shadcn/ui ở `components/ui` (vendored — Prettier bỏ qua); layout ở `components/layout`; tiện ích ở `lib`.
- **Test:** Vitest (`npm test`), file `*.test.ts(x)` cạnh code, môi trường jsdom.
- **Đừng** hardcode `console.log` (dùng logger), hay key localStorage auth (dùng apiClient).

### Cấu trúc feature-first (mục tiêu, migrate dần)
`features/<feature>/{api,hooks,components,pages,types}` cho mảng lớn; giữ `components/ui`, `components/layout`, `lib`, `api/index.ts` dùng chung. **Không** dời hàng loạt file đang chạy tốt một lần — migrate khi đụng tới từng feature để tránh churn/regression.

## CI (`.github/workflows/ci.yml`)
Chạy trên push/PR vào `main`. **Backend:** JDK 21 → `spotless:check` + `mvn verify` (gồm test). **Frontend:** Node 20 → `npm ci` → `format:check` + `lint` + `npm test` + `build`. Trước khi push nên chạy local cho khớp.

## Build & run
```bash
mvn -f backend/pom.xml spring-boot:run     # backend :8080 (SQL Server + Flyway)
cd frontend && npm run dev                 # :5173
mvn -f backend/pom.xml test ; (cd frontend && npm run build && npx tsc --noEmit -p tsconfig.app.json)
```
Dev tự seed dữ liệu mẫu (`app.seed.enabled` mặc định true; tắt: `SEED_ENABLED=false`).

## Commit
Conventional Commits (`feat`/`fix`/`chore`/`refactor`/`docs`...). Format-toàn-bộ để **commit riêng** (`chore(format)`), tách khỏi thay đổi logic.
