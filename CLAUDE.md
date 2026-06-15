# CLAUDE.md — Yukihon

Hướng dẫn cho mỗi phiên làm việc với codebase Yukihon (nền tảng học tiếng Nhật–Việt).

## Stack

- **Backend:** Spring Boot 3.5.5, Java 21, **SQL Server** + **Flyway** (`ddl-auto: none`), JWT HS512 (jjwt), Google OAuth, OpenAI (AI chat), WebSocket/STOMP. Package gốc: `com.hoang.basis.yukihon`.
- **Frontend:** React 18, TypeScript, Vite 5, Tailwind 3 + shadcn/ui (Radix), TanStack Query v5, React Router v6, framer-motion. Auth qua React Context (không Redux). Alias `@/` → `src/`.

## Kiến trúc

Hai phong cách song song:

1. **Layered theo domain** (đa số module): `system/<domain>/{controller,service,repository,entity,dto,mapper}`. Đây là cách viết các tính năng nghiệp vụ hiện có (auth, vocabulary, quiz, lesson, story-mode, mistake-dna, ai-chat, ...).
2. **Auto-CRUD framework** (`base/`): khai báo entity bằng annotation là tự sinh REST + metadata + quyền, không cần controller/service/repo. Dùng cho module CRUD/admin mới.

### Auto-CRUD framework (`backend/.../base/`)

- Gắn `@AutoCrud(path="x")` lên entity (kế thừa `BaseEntity`) → tự có `/api/auto/x` (list/get/create/update/delete/bulk-delete). Phục vụ bởi 1 controller dispatch `GenericCrudController` (không sinh bean động, dùng `SimpleJpaRepository`).
- Annotation kèm theo: `@ResourcePermission("X")` (sinh `X_CREATE/READ/UPDATE/DELETE`, seed tự động vào DB + cấp cho ADMIN bởi `AutoCrudPermissionInitializer`), `@ResourceMenu(...)` (xuất hiện ở `/api/meta/menu` → sidebar FE động), `@Searchable` (`?search=`), `@Filterable` (lọc `=` theo field), `@Sortable`, `@SoftDelete`, `@AuditEnabled` (ghi `audit_logs` qua event bus), `@FieldMeta` (metadata form), `@EntityLabel`.
- `BaseEntity`: `id, isActive, isDeleted, @Version, createdAt/By, updatedAt/By` (audit tự điền bằng Spring Data JPA auditing, auditor = email principal).
- Metadata API: `GET /api/meta/entities`, `/api/meta/entities/{name}`, `/api/meta/menu`. Frontend `MetadataDrivenCrudPage` + `metaApi`/`autoCrudApi` tự dựng bảng + form từ đó.
- Event bus: `GenericCrudService` phát `EntityChangedEvent` sau mỗi CRUD (audit hiện đang lắng nghe; gamification/notification sẽ dùng sau).

### Thêm 1 entity CRUD mới (đường ngắn nhất)

1. Tạo entity kế thừa `BaseEntity` với `@AutoCrud` (+ `@ResourcePermission`, `@ResourceMenu`, `@Searchable`, `@FieldMeta`).
2. **Viết Flyway migration tạo bảng** (BẮT BUỘC — xem kỷ luật Flyway bên dưới).
3. Xong: có API + quyền + menu + UI metadata-driven. Route FE: thêm `<MetadataDrivenCrudPage entityName="..."/>` nếu muốn trang riêng (tham khảo `/admin/app-settings`).

## Kỷ luật Flyway (QUAN TRỌNG)

- `ddl-auto: none` → **mọi bảng phải có migration tạo bảng**. Khai báo `@Entity` KHÔNG tự tạo bảng.
- Migration ở `backend/src/main/resources/db/migration/`, đặt tên `V<n>__mô_tả.sql`, cú pháp SQL Server, idempotent (`IF OBJECT_ID(...) IS NULL`), kết thúc mỗi statement bằng `GO`.
- Map kiểu: chuỗi tiếng Nhật → `NVARCHAR`; `TEXT`/`LONGTEXT` (kiểu MySQL trong entity cũ) → `NVARCHAR(MAX)`.
- `out-of-order: true` đang bật để migration version thấp (vd `V19_1`) áp được trên môi trường đã ở version cao hơn (idempotent nên là no-op).

## Quy ước

- Entity: Lombok `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`, PK `@GeneratedValue(IDENTITY)`.
- Controller lấy user hiện tại: `@AuthenticationPrincipal UserDetails` → `userRepository.findByEmail(...)` (username = email). Quyền = authorities `ROLE_<name>` + permission codes; `@EnableMethodSecurity` đang bật (dùng `@PreAuthorize` được).
- Lỗi: ném `ResourceNotFoundException`/`IllegalArgumentException`; `GlobalExceptionHandler` trả `ApiError{status,error,message,path}` theo `ErrorCode`.
- Field mới trên bảng đã có dữ liệu: để **nullable**.
- FE: gọi API qua `apiClient.request<T>(path, options)` (`@/lib/apiClient`, tự gắn Bearer + auto refresh 401). Quyền: `useAuth().hasPermission(code)` / `isAdmin()`. Đừng hardcode key localStorage auth.

## Build & run

```bash
# Backend (SQL Server phải chạy ở localhost:1433, DB YukihonDB)
mvn -f backend/pom.xml spring-boot:run     # dev, http://localhost:8080
mvn -f backend/pom.xml -DskipTests compile # chỉ compile
mvn -f backend/pom.xml test                # test

# Frontend
cd frontend && npm install
npm run dev          # http://localhost:5173
npm run build        # vite build (KHÔNG type-check)
npx tsc --noEmit -p tsconfig.app.json   # type-check riêng (lưu ý: có sẵn vài lỗi type cũ chưa dọn)
```

- Seed dev: bật `SEED_ENABLED=true` để `DataInitializer` tạo admin/learner mẫu (mặc định tắt). `AutoCrudPermissionInitializer` luôn chạy (seed quyền cho entity `@AutoCrud`).
- `npm run build` (esbuild) không type-check nên app vẫn build dù `tsc --noEmit` còn báo lỗi ở một số file cũ.

## Gotchas

- Builder set `version=0` rồi tham chiếu instance transient vào FK non-null có thể gây lỗi Hibernate — luôn dùng instance trả về từ `save()`.
- Khi test bằng curl trên Windows shell, body JSON tiếng Việt dễ bị hỏng UTF-8 → dùng nội dung ASCII hoặc gửi từ file.
- Permission hạt mịn: chỉ `ROLE_ADMIN` mới bypass mọi `@ResourcePermission`; role khác cần được cấp permission tương ứng.
