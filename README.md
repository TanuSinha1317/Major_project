# Internship Management System

The system currently includes the Phase 1 authentication foundation, Phase 2.1 student institutional profiles, Phase 2.2 internship onboarding, Phase 2.3 complete internship information, and Phase 3.1 mentor account foundation. The active roles are III Cell Incharge (`ADMIN`), Student (`STUDENT`), and Mentor (`MENTOR`). Student–mentor assignment, mentor monitoring workflows, and attendance remain outside the current scope.

## Structure

- `backend/` — Java 17, Spring Boot, Spring Security, JPA, Flyway, PostgreSQL, JWT
- `frontend/` — Next.js App Router, TypeScript, Tailwind CSS, Axios

## Local configuration

For one-time local setup, copy [`backend/application-local-secrets.example.properties`](backend/application-local-secrets.example.properties) to `backend/application-local-secrets.properties`, then replace its placeholders. The real file is ignored by Git and is required by the default `local` Spring profile, so `mvn spring-boot:run` works in a fresh terminal after that one-time setup. If it is missing, Spring Boot stops immediately and identifies the missing configuration file instead of failing later while creating JWT security beans.

Generate a strong JWT secret (at least 32 bytes) and set institution-controlled bootstrap credentials only when an initial account is needed. Bootstrap accounts are created only when their email does not already exist, and passwords must contain at least 12 characters. Do not commit real credentials.

`PROFILE_ENCRYPTION_KEY` must be a stable Base64-encoded 32-byte AES key. If PostgreSQL already contains encrypted Aadhaar values, use the same existing key; changing it makes those values unreadable.

Production must set `SPRING_PROFILES_ACTIVE=prod` and supply all secrets through its deployment environment or secret store. It never reads the local secrets file.

Create an empty PostgreSQL database named `internship_management` owned by the configured application user. Flyway applies the schema automatically.

Set `DOCUMENT_STORAGE_ROOT` to a private, writable backend directory. Required internship documents are stored there under server-generated UUID names, never in frontend public content. PDF, JPEG, and PNG files are accepted up to 10 MB each.

## Run

From `backend/`, after the one-time local secrets setup:

```bash
mvn spring-boot:run
```

From `frontend/`:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. There is one login form and no public registration. Authenticated users are redirected by the role returned by the backend:

- `ADMIN` → `/admin/dashboard`
- `MENTOR` → `/mentor/dashboard` after the required first-login password change
- `STUDENT` → `/student/dashboard`

## Authentication API

- `POST /api/v1/auth/login` — validates credentials and returns safe user data while setting the JWT in an HttpOnly cookie
- `GET /api/v1/auth/me` — returns the authenticated user
- `POST /api/v1/auth/logout` — expires the authentication cookie
- `POST /api/v1/auth/change-password` — replaces the temporary password for a Student or Mentor account on first login
- `GET /api/v1/admin/verification` — minimal ADMIN-only endpoint used to verify 403 behavior

### Mentor account API

- `POST /api/v1/admin/mentor-accounts` — creates a Mentor account using its employee ID as the one-time initial credential
- `GET /api/v1/admin/mentor-accounts` — lists Mentor accounts for the III Cell
- `GET /api/v1/mentor/profile` — retrieves only the authenticated Mentor's profile after the required password change

The temporary employee-ID credential is BCrypt-hashed before persistence and is never returned as a password or hash. A new Mentor must replace it through the existing password-change flow before accessing the placeholder Mentor dashboard. Student–mentor assignment and attendance data are intentionally absent.

### Student profile API

- `GET /api/v1/student/profile` — retrieves only the authenticated student's profile
- `POST /api/v1/student/profile` — creates the authenticated student's first profile
- `PUT /api/v1/student/profile` — updates the authenticated student's profile
- `GET /api/v1/student/profile/options` — returns centrally defined branches and controlled field options
- `GET /api/v1/admin/students` — paginated ADMIN-only directory with server-side search and filters
- `GET /api/v1/admin/students/{userId}` — ADMIN-only institutional student detail

Student-self endpoints never accept a user ID. Aadhaar is encrypted at rest and returned only as `XXXX XXXX 1234`; it is absent from directory summaries.

### Internship onboarding API

- `GET /api/v1/student/internship-onboarding` — authenticated student's onboarding status and four-document checklist
- `POST /api/v1/student/internship-onboarding/secure` — starts onboarding after profile completion
- `PUT /api/v1/student/internship-onboarding/source` — selects `DEPARTMENT`, `CDC`, or `SELF`
- `POST /api/v1/student/internship-onboarding/documents/{documentType}` — uploads or replaces one required document
- `GET /api/v1/student/internship-onboarding/documents/{documentId}/download` — owner-checked document download
- `POST /api/v1/student/internship-onboarding/diary/confirm` — confirms diary receipt after all four documents exist
- `GET /api/v1/admin/students/{studentId}/internship-onboarding/documents/{documentId}/download` — ADMIN-only, student-scoped download

The backend owns all onboarding workflow transitions; uploaded document metadata and internship details remain in separate normalized domains.

### Internship details API

- `GET /api/v1/student/internship` — retrieves the authenticated student's internship information
- `POST /api/v1/student/internship` — creates details only after the diary is issued
- `PUT /api/v1/student/internship` — updates the authenticated student's existing details
- `GET /api/v1/admin/students/{studentId}/internship` — read-only ADMIN view

Valid detail creation advances onboarding from `DIARY_ISSUED` to `INTERNSHIP_DETAILS_COMPLETE`. Company type and internship mode are controlled values; stipend uses an exact decimal representation and may be zero for an unpaid internship. Attendance, weekly reporting, evaluation, and internship activation remain outside the current scope.

The JWT contains only the user ID, role, issue time, and expiry. CORS origins, cookie security, JWT expiry, secret, database access, and bootstrap accounts are environment-configurable.

## Verification

Backend integration tests use an isolated H2 database in PostgreSQL compatibility mode while exercising the complete Spring Security filter chain:

```bash
mvn test
```

Frontend validation:

```bash
npm run typecheck
npm run build
```

The production build uses Webpack because it is reliable in restricted build environments where Turbopack cannot create its internal worker connection.
