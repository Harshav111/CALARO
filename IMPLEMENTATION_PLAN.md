# Calaro: Secure AI Calorie Management System Implementation Plan

## 🛡️ Security Fundamentals (Built-in from Day 1)
- **Authentication**: JWT-based Auth with Argon2 password hashing.
- **API Security**: CORS policies, Rate limiting, and Input validation using Pydantic.
- **Data Privacy**: Encrypted food logs and secure environment variable management.
- **STT Privacy**: Ephemeral audio processing (no storage of raw audio files unless opted-in).

## Phase 1: Foundation & Backend Extraction Engine (Current)
- [x] **Infrastructure**: Initialize FastAPI backend and React frontend.
- [x] **Auth System**: Setup User registration/login with JWT (including Admin roles).
- [x] **AI Pipeline**:
    - [x] Whisper Integration for STT.
    - [x] LLM Prompt Engineering for Food Parsing & Calorie Estimation.
    - [x] Food Mapping Service (AI-driven estimation).
- [x] **Database**: PostgreSQL with SQLAlchemy ORM (Adminer GUI added).

## Phase 2: Dynamic Voice UI & Dashboard
- [x] **Voice Interface**: Web Audio API integration with visual wave feedback.
- [x] **Real-time Processing**: Seamless voice-to-structured-data pipeline.
- [x] **Dashboard**: Modern, responsive React UI with caloric/macro summary.
- [x] **Admin Dashboard**: Traffic analysis and system monitoring.

## Phase 3: Calorie Intelligence & Personalization
- [x] **Nutrient Calculation**: AI-estimated caloric breakdown.
- [x] **Personalized TDEE**: Profile setup for age, weight, activity.
- [x] **History & Analytics**: Daily intake tracking and admin analytics.

## Phase 4: Production Polish & Security Audit
- [x] **Dockerization**: Multi-stage builds with Prometheus/Grafana stack.
- [x] **HTTPS/SSL**: Ready for Nginx/Certbot mounting.
- [x] **Traffic Analysis**: Integrated Prometheus scoring.

---

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: FastAPI (Python 3.10+), Pydantic v2, Jose (JWT).
- **Database**: PostgreSQL (Development: SQLite for portability).
- **AI**: Whisper (STT), OpenAI/Anthropic (Extraction LLM).
