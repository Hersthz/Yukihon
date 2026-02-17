# Yukihon - Japanese Learning Platform

## 📋 Project Overview

Yukihon là một nền tảng học tiếng Nhật toàn diện với giao diện được lấy cảm hứng từ Genshin Impact. Dự án bao gồm:

- **Backend**: Spring Boot 3.5.5 với JWT authentication + Google OAuth
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Database**: SQL Server
- **Theming**: Dark/Light mode support

---

## 🚀 Quick Start

### Backend Setup

#### Prerequisites
- Java 24+
- Maven 3.9+
- SQL Server

#### Installation

1. **Clone and navigate to backend folder**
```bash
cd backend
```

2. **Configure environment variables** (.env file):
```env
# Server
SERVER_PORT=8080
SERVER_ADDRESS=0.0.0.0

# Database
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=YukihonDB;encrypt=false
DB_USERNAME=sa
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_base64_secret_key
JWT_ACCESS_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# Application
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:8080
```

3. **Build and run**
```bash
mvn clean install
mvn spring-boot:run
```

Backend will be available at `http://localhost:8080`

### Frontend Setup

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Installation

1. **Navigate to frontend folder**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment** (create `.env.local`):
```env
VITE_API_URL=http://localhost:8080
```

4. **Start development server**
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 🔐 Authentication

### Login/Register Flow
1. User navigates to `/auth` page
2. Choose between "Sign in" or "Create account" modes
3. Traditional email-password or Google OAuth
4. JWT token stored in localStorage
5. Protected routes redirect to `/auth` if not authenticated

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials (Web application)
3. Add authorized redirect URIs:
   - `http://localhost:8080/api/auth/google/callback` (development)
   - Your production URL
4. Copy Client ID and Client Secret to `.env`

### API Endpoints

```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login with email/password
POST   /api/auth/google        - Login with Google OAuth code
GET    /api/auth/me            - Get current user (requires token)
```

---

## 🎨 Frontend Features

### Theme System

The application supports both light and dark themes with smooth transitions:

```typescript
import { useTheme } from "@/hooks/use-theme";

export const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {theme === "dark" ? "light" : "dark"} mode
    </button>
  );
};
```

**Theme Toggle Button** is available in the Navigation bar.

### Animation System

Enhanced animations using Framer Motion:

```typescript
import { FadeInUp, ScaleIn } from "@/components/animations/AnimatedElements";

export const MyComponent = () => (
  <>
    <FadeInUp>Content slides up on view</FadeInUp>
    <ScaleIn custom={1} delay={100}>Scales up with delay</ScaleIn>
  </>
);
```

Available animation components:
- `FadeInUp` - Fade in from bottom
- `FadeInDown` - Fade in from top
- `FadeInLeft` - Fade in from left
- `FadeInRight` - Fade in from right
- `ScaleIn` - Scale in from center

### Protected Routes

Routes requiring authentication:
```
/courses
/courses/:courseId
/kanji-library
/profile
```

Unauthenticated users are redirected to `/auth`

---

## 📁 Project Structure

### Backend
```
backend/
├── src/main/java/com/hoang/basis/yukihon/
│   ├── config/          # Spring configuration
│   ├── controller/      # REST endpoints
│   ├── dto/            # Data transfer objects
│   ├── model/          # JPA entities
│   ├── repository/     # Data access layer
│   ├── security/       # JWT & auth logic
│   ├── service/        # Business logic
│   └── exception/      # Custom exceptions
├── resources/
│   └── application.yml # Configuration
└── pom.xml            # Maven dependencies
```

### Frontend
```
frontend/src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   ├── genshin/      # Genshin-themed components
│   ├── animations/   # Animation components
│   └── ThemeToggle.tsx
├── contexts/         # React contexts (Auth)
├── hooks/           # Custom React hooks
├── lib/             # Utilities (API client, etc.)
├── pages/           # Page components
└── styles/          # Global styles
```

---

## 🔧 API Client Usage

```typescript
import apiClient from "@/lib/apiClient";

// Register
await apiClient.auth.register({
  email: "user@example.com",
  password: "password123",
  displayName: "User Name"
});

// Login
await apiClient.auth.login({
  email: "user@example.com",
  password: "password123"
});

// Get current user
const user = await apiClient.auth.getCurrentUser();

// Check authentication
if (apiClient.isAuthenticated()) {
  // User is logged in
}
```

---

## 🎯 Key Improvements Made

### Backend ✅
- [x] JWT Authentication with secure token generation
- [x] Google OAuth 2.0 integration
- [x] Email validation & password strength validation
- [x] User registration & login endpoints
- [x] Comprehensive error handling & logging
- [x] CORS configuration for frontend communication
- [x] .env file for sensitive configuration

### Frontend ✅
- [x] Modern dark/light theme system
- [x] Premium animations (smooth, elastic, liquid effects)
- [x] Enhanced button & form interactions
- [x] Google OAuth integration
- [x] Protected routes with authentication
- [x] Auth context for state management
- [x] API client utilities
- [x] Theme toggle in navigation

### UI/UX ✅
- [x] Glassmorphism design
- [x] Smooth page transitions
- [x] Responsive layout
- [x] Improved form validation
- [x] Loading states
- [x] Error messages
- [x] Success notifications

---

## 🛠️ Development

### Build Backend
```bash
cd backend
mvn clean package
```

### Build Frontend
```bash
cd frontend
npm run build
```

### Lint Frontend
```bash
npm run lint
```

---

## 📝 Notes

1. **JWT Secret**: Generate a strong base64-encoded secret key (min 32 bytes)
2. **Google OAuth**: Must configure with valid Client ID/Secret
3. **Database**: Create initial database schema via Hibernate DDL-auto
4. **CORS**: Frontend URL must match `FRONTEND_URL` in .env
5. **Tokens**: Access tokens expire after 15 minutes, refresh tokens after 7 days

---

## 🚨 Common Issues

### CORS Error
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that frontend is sending proper headers

### Token Expired
- Frontend automatically redirects to `/auth` on 401 response
- Users need to login again

### Google OAuth Not Working
- Verify Client ID is correct
- Check redirect URI exactly matches
- Ensure browser is not in private mode (3rd party cookies)

---

## 📞 Support

For issues or questions, check:
1. Backend logs: Check `application.yml` logging configuration
2. Frontend console: Open browser DevTools for error details
3. Network tab: Verify API calls in browser DevTools

---

**Last Updated**: February 17, 2026
**Version**: 0.0.1-SNAPSHOT
