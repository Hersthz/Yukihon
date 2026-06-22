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
- **User hiện tại trong controller:** dùng helper `getUserId(UserDetails)` → `userRepository.findByEmail(...)`. (Phase B sẽ thay bằng `@CurrentUserId` argument resolver để bỏ lặp.)
- **Lỗi:** ném `ResourceNotFoundException`/`IllegalArgumentException`, hoặc `ResponseStatusException(status, reason)`; `GlobalExceptionHandler` trả `ApiError{status,error,message,path}` theo `ErrorCode`. **Đừng** ném `RuntimeException` trần (→ 500).
- **DTO:** static `Dto.fromEntity(entity)` (record hoặc Lombok `@Builder`). DTO có quan hệ → cân nhắc MapStruct.
- **Unicode:** cột chứa tiếng Nhật/Việt → `columnDefinition = "NVARCHAR(...)"`; migration dùng `NVARCHAR`. Maven compile UTF-8 (`project.build.sourceEncoding`).
- **Transaction:** `org.springframework...@Transactional` (đừng `jakarta`); `readOnly=true` cho query.

## Frontend (`frontend/src`)

- **API layer:** mọi gọi API qua `apiClient.request<T>(endpoint, options)` (`@/lib/apiClient` — tự gắn Bearer + auto-refresh 401). File api: `api/<feature>Api.ts`, export qua `api/index.ts`. **Không** dùng kiểu Axios (`apiClient.get/post`) trừ khi đã thêm helper tương ứng.
- **Data fetching:** dùng **TanStack Query** (`useQuery`/`useMutation`) — không tự `useState`+`useEffect`+fetch cho dữ liệu server (đang dần thống nhất ở Phase D).
- **Quyền:** `useAuth().hasPermission(code)` / `isAdmin()`; menu admin lấy từ `/api/meta/menu` (`useAutoMenu`).
- **Component:** shadcn/ui ở `components/ui` (vendored — Prettier bỏ qua); layout ở `components/layout`; tiện ích ở `lib`.
- **Đừng** hardcode `console.log` (dùng logger), hay key localStorage auth (dùng apiClient).

### Hướng tối ưu đã chốt (làm dần)
- **Hybrid OpenAPI (Phase C+D):** backend expose OpenAPI (springdoc) → FE sinh **type** bằng `openapi-typescript` (`src/api/schema.d.ts`) làm nguồn chân lý; runtime vẫn dùng `apiClient` + `createResource()` (giữ logic refresh-token). BE đổi field → FE báo lỗi type.
- **`createResource<T>(key, basePath)`** (Phase D): sinh sẵn api + hook react-query (list/get/create/update/remove, tự invalidate) → thêm resource = 1 dòng.
- **Cấu trúc feature-first** (Phase E): `features/<feature>/{api,hooks,components,pages,types}` cho mảng lớn; giữ `components/ui`, `components/layout`, `lib` dùng chung.

## Build & run
```bash
mvn -f backend/pom.xml spring-boot:run     # backend :8080 (SQL Server + Flyway)
cd frontend && npm run dev                 # :5173
mvn -f backend/pom.xml test ; (cd frontend && npm run build && npx tsc --noEmit -p tsconfig.app.json)
```
Dev tự seed dữ liệu mẫu (`app.seed.enabled` mặc định true; tắt: `SEED_ENABLED=false`).

## Commit
Conventional Commits (`feat`/`fix`/`chore`/`refactor`/`docs`...). Format-toàn-bộ để **commit riêng** (`chore(format)`), tách khỏi thay đổi logic.
