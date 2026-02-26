# Calaro – Secure AI Calorie Management

Calaro is a voice-first, AI-powered calorie logging app built with **FastAPI**, **PostgreSQL/SQLite**, and a **modern React + Vite** frontend.

The system supports:

- JWT-based authentication with Argon2 password hashing
- **Local, rule-based meal parsing** (no external APIs)
- Optional **local Whisper STT** for voice logging (no API keys)
- Persistent food logs with basic calorie estimates
- Personalized TDEE estimation and a responsive dashboard UI

---

## 1. Backend – FastAPI

### 1.1. Local setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # on Windows
pip install -r requirements.txt

copy .env.example .env    # then edit SECRET_KEY

uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`, with docs at `http://localhost:8000/docs`.

By default, the backend uses a local SQLite database (`./calaro.db`). To switch to Postgres, set `SQLALCHEMY_DATABASE_URI` in `.env` (or via Docker Compose).

### 1.2. Key environment variables

- `SECRET_KEY`: long, random string for signing JWTs (required for production)
- `SQLALCHEMY_DATABASE_URI`: database URL (SQLite for dev, Postgres in Docker)
- `BACKEND_CORS_ORIGINS`: comma-separated allowed frontend origins

---

## 2. Frontend – React + Vite

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

You can optionally set `VITE_API_BASE_URL` to point to a different backend URL (defaults to `http://localhost:8000/api/v1`).

Features:

- Auth (sign up/login) with JWT
- Voice recorder that sends short clips to the backend for transcription
- AI-powered text parsing for meal descriptions
- Daily intake summary vs. personalized TDEE target
- History of recent logs with basic calorie estimates

---

## 3. Docker / Production-style Run

Build and run the full stack (Postgres + backend + frontend):

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

Edit `backend/.env.example` (or provide a separate `.env`) to set a strong `SECRET_KEY` and your `OPENAI_API_KEY` before deploying.

---

## 4. Security Notes & Hardening Checklist

- **Secrets**: never commit real `SECRET_KEY` or `OPENAI_API_KEY`. Use `.env` files or your orchestrator’s secret manager.
- **Transport security**: terminate TLS with a reverse proxy (e.g., Nginx + Certbot) in front of the backend.
- **Database**: use strong Postgres credentials and restrict network access to the DB from the app only.
- **CORS**: restrict `BACKEND_CORS_ORIGINS` to your real frontend domains in production.
- **Rate limiting / WAF**: place an API gateway or reverse proxy with basic rate limiting in front of the FastAPI service.

# Calaro – Secure AI Calorie Management

Calaro is a voice-first, AI-powered calorie logging app built with **FastAPI**, **PostgreSQL/SQLite**, and a **modern React + Vite** frontend.

The system supports:

- JWT-based authentication with Argon2 password hashing
- AI-powered meal parsing using GPT-4o
- Optional voice logging with Whisper STT
- Persistent food logs with basic calorie estimates
- Personalized TDEE estimation and a responsive dashboard UI

---

## 1. Backend – FastAPI

### 1.1. Local setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # on Windows
pip install -r requirements.txt

copy .env.example .env    # then edit SECRET_KEY and OPENAI_API_KEY

uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`, with docs at `http://localhost:8000/docs`.

By default, the backend uses a local SQLite database (`./calaro.db`). To switch to Postgres, set `SQLALCHEMY_DATABASE_URI` in `.env` (or via Docker Compose).

### 1.2. Key environment variables

- `SECRET_KEY`: long, random string for signing JWTs (required for production)
- `SQLALCHEMY_DATABASE_URI`: database URL (SQLite for dev, Postgres in Docker)
- `OPENAI_API_KEY`: used for GPT-4o (meal parsing) and Whisper STT
- `BACKEND_CORS_ORIGINS`: comma-separated allowed frontend origins

---

## 2. Frontend – React + Vite

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

You can optionally set `VITE_API_BASE_URL` to point to a different backend URL (defaults to `http://localhost:8000/api/v1`).

Features:

- Auth (sign up/login) with JWT
- Voice recorder that sends short clips to the backend for transcription
- AI-powered text parsing for meal descriptions
- Daily intake summary vs. personalized TDEE target
- History of recent logs with basic calorie estimates

---

## 3. Docker / Production-style Run

Build and run the full stack (Postgres + backend + frontend):

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

Edit `backend/.env.example` (or provide a separate `.env`) to set a strong `SECRET_KEY` and your `OPENAI_API_KEY` before deploying.

---

## 4. Security Notes & Hardening Checklist

- **Secrets**: never commit real `SECRET_KEY` or `OPENAI_API_KEY`. Use `.env` files or your orchestrator’s secret manager.
- **Transport security**: terminate TLS with a reverse proxy (e.g., Nginx + Certbot) in front of the backend.
- **Database**: use strong Postgres credentials and restrict network access to the DB from the app only.
- **CORS**: restrict `BACKEND_CORS_ORIGINS` to your real frontend domains in production.
- **Rate limiting / WAF**: place an API gateway or reverse proxy with basic rate limiting in front of the FastAPI service.

