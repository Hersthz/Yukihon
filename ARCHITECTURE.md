# Architecture & Technical Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Browser                           │
│                   (React 18 + TypeScript)                    │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST (JSON)
                             │ JWT Token Auth
┌────────────────────────────▼────────────────────────────────┐
│                    Backend API Server                        │
│              (Spring Boot 3.5.5 + Spring Security)           │
│                         :8080                                │
├─────────────────────────────────────────────────────────────┤
│ Auth Layer     │  Security Config  │  JWT Validation         │
│ (Login/Reg)    │  CORS Handling    │  Exception Handlers     │
├─────────────────────────────────────────────────────────────┤
│ Controllers    │  Services         │  Repositories           │
│ (REST Endpoints)│  (Business Logic) │  (JPA/Hibernate)       │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer                         │
└────────────────────────────┬────────────────────────────────┘
                             │ SQL
┌────────────────────────────▼────────────────────────────────┐
│                    SQL Server Database                       │
│                   (Entity: Users, Roles)                     │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Traditional Login/Register

```
1. User → Frontend (email, password)
                    ↓
2. Frontend → Backend POST /api/auth/login
                    ↓
3. Backend validates credentials & generates JWT
                    ↓
4. Backend ← Frontend (accessToken, refreshToken, user)
                    ↓
5. Frontend stores token in localStorage
                    ↓
6. Future requests include: Header: Authorization: Bearer <token>
```

### Google OAuth Flow

```
1. User → Frontend (click "Continue with Google")
                    ↓
2. Frontend redirects to Google OAuth consent screen
                    ↓
3. User grants permission
                    ↓
4. Google redirects to: /auth?code=...
                    ↓
5. Frontend extracts code
                    ↓
6. Frontend → Backend POST /api/auth/google {code}
                    ↓
7. Backend exchanges code for Google tokens
                    ↓
8. Backend fetches user info from Google
                    ↓
9. Backend creates or updates user in DB
                    ↓
10. Backend ← Frontend (JWT tokens)
                    ↓
11. Frontend stores tokens & navigates to /dashboard
```

## Frontend State Management

### Auth Context
- Manages authentication state globally
- Provides: `user`, `isAuthenticated`, `isLoading`, `error`
- Methods: `login()`, `register()`, `logout()`, `refreshUser()`

### Theme Hook
- Manages dark/light theme preference
- Persists to localStorage
- Applies `light` class to `html` element

### Protected Routes
- Wraps routes requiring authentication
- Redirects to `/auth` if not authenticated
- Shows loading state while checking auth

## Key Patterns & Best Practices

### Frontend
- **Separation of Concerns**: Components, hooks, contexts
- **Error Handling**: Try-catch blocks with user-friendly messages
- **Loading States**: Prevents multiple submissions
- **Responsive Design**: Mobile-first approach
- **Animation Library**: Framer Motion for performance

### Backend
- **Service Layer**: Encapsulates business logic
- **Repository Pattern**: Abstracts database access
- **Dependency Injection**: Spring's constructor-based injection
- **Exception Handling**: Custom exception classes with proper HTTP status
- **Logging**: SLF4J for tracing requests
- **Transaction Management**: @Transactional for data consistency

## Security Considerations

### JWT Implementation
- **Secret Key**: Min 256-bit random key (Base64 encoded)
- **Access Token TTL**: 15 minutes (short-lived)
- **Refresh Token TTL**: 7 days (long-lived)
- **Signature Algorithm**: HS512 (HMAC SHA-512)

### CORS Policy
- Only allows requests from configured `FRONTEND_URL`
- Includes credentials in cross-origin requests
- Allows all necessary headers

### Password Security
- **Encoding**: BCrypt with 10 rounds
- **Min Length**: 6 characters
- **Max Length**: 100 characters
- **Validation**: Via @Size annotation on DTO

### Email Validation
- **Format Check**: RFC-compliant regex
- **Uniqueness**: Database constraint
- **Case-Insensitive**: Normalized to lowercase

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY IDENTITY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    enabled BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL,
    updated_at DATETIME2 NOT NULL
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    PRIMARY KEY (user_id, role)
);
```

## API Response Format

### Success Response
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "User Name",
    "roles": ["USER"]
  }
}
```

### Error Response
```json
{
  "timestamp": "2024-02-17T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```

## Performance Considerations

### Frontend
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Responsive images
- **Animation Performance**: GPU-accelerated transforms
- **Bundle Size**: Tree-shaking unused code

### Backend
- **Connection Pooling**: HikariCP default
- **Query Optimization**: JPA/Hibernate lazy loading
- **Caching**: Spring cache abstraction ready
- **Rate Limiting**: Can be added via Spring Cloud

## Deployment Checklist

- [ ] Use strong JWT secret (update in production)
- [ ] Configure production database URL
- [ ] Set correct FRONTEND_URL for CORS
- [ ] Enable HTTPS/TLS
- [ ] Set secure cookie flags
- [ ] Configure Google OAuth production credentials
- [ ] Set up logging aggregation
- [ ] Configure database backups
- [ ] Set up monitoring/alerting
- [ ] Run security scanning tools

## Future Enhancements

1. **Email Verification**: Send confirmation links
2. **Password Reset**: Forgot password flow
3. **Two-Factor Auth**: TOTP or SMS
4. **Social Logins**: GitHub, Discord, etc.
5. **User Profiles**: Avatar, bio, preferences
6. **Rate Limiting**: Prevent abuse
7. **Audit Logging**: Track user actions
8. **Admin Dashboard**: User management
9. **Notifications**: Email, push, in-app
10. **Content Management**: Courses, lessons, etc.
