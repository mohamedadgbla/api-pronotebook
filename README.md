# ProNotebook API (Backend)

A professional Notebook REST API built with **Node.js, Express, MongoDB & Mongoose** (CommonJS).
This is the core foundation of the ProNotebook project: authentication, notebooks, notes,
folders, tags, search, trash/recovery, a user dashboard, and admin user management — all with
a clean **routes → controllers → services → models** architecture.

## Tech stack
Express 4, Mongoose 8, JWT (access + rotating refresh tokens), bcryptjs, Joi validation,
Helmet, CORS, express-rate-limit, Morgan.

## Project structure
```
src/
├── config/        # env + database connection
├── controllers/   # thin HTTP handlers (parse req, call service, send response)
├── middleware/    # auth, role, validate, error, notFound
├── models/        # Mongoose schemas (User, Notebook, Note, Folder, Tag)
├── routes/        # route definitions, mounted under /api/v1
├── services/      # business logic (all DB access lives here)
├── validators/    # Joi request schemas
├── utils/         # ApiError, ApiResponse, catchAsync, token, pagination
├── scripts/       # seed.js
├── app.js         # express app (middleware + routes) — no DB, easy to test
└── server.js      # connects DB, then starts the server
```
**Why this split?** Controllers stay tiny, business logic is reusable and testable in
`services/`, and every response has the same shape.

## Getting started
```bash
cd backend
npm install
cp .env.example .env        # then fill in MONGO_URI and JWT secrets
npm run dev                 # starts on http://localhost:5000
npm run seed                # (optional) create demo + admin users and sample data
```
Add this to `package.json` scripts if you want the seed shortcut:
`"seed": "node src/scripts/seed.js"`

Demo logins after seeding:
- `demo@pronotebook.dev` / `password123`
- `admin@pronotebook.dev` / `password123` (admin)

## Response format
Success:
```json
{ "success": true, "message": "Note created", "data": { }, "pagination": null }
```
Error:
```json
{ "success": false, "message": "Validation failed", "errors": [ { "field": "email", "message": "email is required" } ] }
```

## Authentication
1. `POST /api/v1/auth/register` or `/login` → returns `{ user, accessToken, refreshToken }`.
2. Send `Authorization: Bearer <accessToken>` on protected routes.
3. When the access token expires, `POST /api/v1/auth/refresh` with `{ refreshToken }` to get a new pair (refresh tokens are **rotated** — the old one is invalidated).

## Endpoints (all under `/api/v1`)

### Auth
| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | `/auth/register` | – | name, username, email, password |
| POST | `/auth/login` | – | identifier (email or username), password |
| POST | `/auth/refresh` | – | refreshToken |
| POST | `/auth/logout` | ✔ | refreshToken, allDevices? |
| GET  | `/auth/me` | ✔ | – |
| PATCH| `/auth/profile` | ✔ | name?, bio?, profileImage? |
| PATCH| `/auth/change-password` | ✔ | currentPassword, newPassword |

### Notebooks
`POST /notebooks` · `GET /notebooks` (`?includeArchived=true`, `?trashed=true`) ·
`GET /notebooks/:id` · `GET /notebooks/:id/stats` · `PATCH /notebooks/:id` ·
`POST /notebooks/:id/duplicate` · `DELETE /notebooks/:id` (→ trash) ·
`POST /notebooks/:id/restore` · `DELETE /notebooks/:id/permanent`

### Notes
`POST /notes` · `GET /notes` · `GET /notes/:id` · `PATCH /notes/:id` ·
`PATCH /notes/:id/move` · `POST /notes/:id/duplicate` · `DELETE /notes/:id` (→ trash) ·
`GET /notes/trash` · `POST /notes/:id/restore` · `DELETE /notes/:id/permanent` ·
`DELETE /notes/trash/empty`

**List query params:** `page`, `limit`, `search` (full-text on title/content),
`notebook`, `folder`, `tag`, `filter` (favorite|pinned|archived),
`sort` (newest|oldest|updated|title).

### Folders / Tags
`POST|GET /folders`, `PATCH|DELETE /folders/:id` (nested, circular-safe, note counts).
`POST|GET /tags`, `PATCH|DELETE /tags/:id` (usage counts).

### Dashboard / Admin
`GET /dashboard` (per-user stats) · `GET /dashboard/admin` (admin only).
`GET /users`, `GET /users/:id`, `PATCH /users/:id/status`, `DELETE /users/:id` (admin only).

`GET /api/health` — health check for Railway/Render.

## Example (Postman / curl)
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","username":"ada","email":"ada@x.com","password":"password123"}'

# Create a note (use the accessToken from the response above)
curl -X POST http://localhost:5000/api/v1/notes \
  -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"My note","content":"# Hello","notebook":"<NOTEBOOK_ID>"}'
```

## Security implemented
Password hashing (bcrypt), short-lived access tokens + rotating refresh tokens,
per-owner data scoping (no cross-user access via guessed IDs), Joi input validation,
Helmet headers, CORS locked to `CLIENT_URL`, rate limiting, and a central error handler
that never leaks stack traces in production.

## Roadmap features not yet built (architecture is ready for them)
File attachments (Cloudinary), sharing/collaboration & permissions, note version history,
reminders/notifications with background jobs, audit logs, email verification/reset,
Swagger docs, and automated test suites. Each maps to a new `model + service + controller +
routes` following the same pattern used here.
