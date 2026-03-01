# 🥗 CALARO: Premium AI Health Companion

Calaro is a high-performance, **full open-source** AI nutrition tracker. Ditch the boring spreadsheets—Calaro uses local AI (Ollama + Whisper) and a stunning **"Cosmic Glass"** interface to make tracking your health an addictive, visual experience.

![Premium UI Hero](images/hero.png)

## ✨ New Premium Features (v2.0)

- **Cosmic Glass Theme**: A high-end, dark-mode experience with vivid mesh gradients and backdrop-blur effects.
- **Engagement Widgets**:
    - **Daily Streats**: Visual fire indicators to keep you motivated.
    - **Macros Wheel**: Circular progress tracking for calories and nutrients.
    - **History Timeline**: An activity feed that records your culinary journey with icons.
- **AI Voice Sync**: Record your meal description with local **Whisper** and let the AI extract data instantly.
- **Precision AI lookup**: Experimental support for "Firecrawl-style" web-search for high-precision calorie data.
- **Built-in Analytics**: Interactive **Recharts** for your personal data (replaces Grafana for individual users).

## 🚀 Getting Started

### Prerequisites
- **Docker & Docker Compose**
- **Ollama** (running locally on your host machine)
    - `ollama run mistral`

### Quick Start
1. **Clone & Setup**:
   ```bash
   git clone https://github.com/calaro/calaro.git
   cd calaro
   ```
2. **Environment**:
   Update `backend/.env` with your settings (Ollama URL defaults to `host.docker.internal` for Windows hosts).
3. **Launch**:
   ```bash
   docker-compose up --build
   ```

## 🛠️ Tech Stack
- **Frontend**: React (Vite) + Tailwind 4 + Framer Motion + Lucide + Recharts
- **Backend**: FastAPI (Python 3.11+) + SQLAlchemy + Pydantic
- **Database**: SQLite (default) / PostgreSQL (production)
- **AI Engine**: Ollama (LLM) + Faster-Whisper (STT)

## 🛡️ Admin Access
The system includes a secure Admin Dashboard for monitoring global stats and user activity.
- Access it via the "Admin Control" menu in the sidebar.

## 📄 License
This project is licensed under the **MIT License**—free for everyone.
