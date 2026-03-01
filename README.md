Here is a **more professional, investor-ready, product-grade version** of your README while maintaining clarity and technical depth:

---

# 🥗 CALARO

## AI-Powered Nutrition Intelligence Platform

**Calaro** is a high-performance, fully open-source AI nutrition intelligence system designed for modern health tracking.

Built with a privacy-first architecture, Calaro leverages **local AI processing (Ollama + Whisper)** to eliminate manual food logging while delivering a refined, premium user experience.

---

## 🌟 Overview

Traditional calorie tracking tools rely heavily on manual data entry, creating friction and reducing long-term engagement.

Calaro transforms the experience by enabling:

* Natural voice-based meal logging
* AI-driven nutritional parsing
* Real-time analytics
* A visually immersive, high-performance interface

All computations run locally — ensuring **data privacy, speed, and full control**.

---



### 🔥 Engagement & Behavioral Design

* **Daily Streak System** – Visual motivation indicators
* **Macro Progress Wheel** – Circular nutrient tracking visualization
* **Activity Timeline** – Chronological logging with contextual icons

---

### 🎙 AI Voice Logging

* Powered by **local Faster-Whisper**
* Record meal descriptions naturally
* Automatic calorie & macro extraction via Ollama LLM
* No cloud dependency

---

### 🔍 Precision AI Lookup (Experimental)

* Optional AI-assisted structured search
* Designed for higher nutritional accuracy
* Extensible for future API integrations

---

### 📊 Built-In Analytics

* Interactive data visualization powered by Recharts
* Personal consumption trends
* Macro distribution tracking
* Historical performance metrics

---

## 🚀 Getting Started

### Prerequisites

* Docker & Docker Compose
* Ollama (running locally)

  ```bash
  ollama run mistral
  ```

---

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/calaro/calaro.git
   cd calaro
   ```

2. Configure environment:

   * Update `backend/.env`
   * Default Ollama host: `host.docker.internal` (Windows)

3. Launch the application:

   ```bash
   docker-compose up --build
   ```

---

## 🏗 Architecture & Technology Stack

### Frontend

* React (Vite)
* Tailwind CSS v4
* Framer Motion
* Lucide Icons
* Recharts

### Backend

* FastAPI (Python 3.11+)
* SQLAlchemy ORM
* Pydantic Validation

### Database

* SQLite (default)
* PostgreSQL (production-ready)

### AI Layer

* Ollama (LLM inference)
* Faster-Whisper (Speech-to-Text)

---

## 🔐 Privacy & Security

Calaro operates on a **local-first AI architecture**, ensuring:

* No external API dependency for core features
* Full data ownership
* Secure admin monitoring dashboard
* Production-ready database migration path

---

## 🛡 Admin Dashboard

A dedicated admin control panel provides:

* Global usage metrics
* System health monitoring
* User activity insights

Accessible via the **Admin Control** section in the sidebar.

---

## 📜 License

Licensed under the **MIT License**.
Free to use, modify, and distribute.

---


Tell me the direction.
