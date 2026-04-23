# AegisAI: Smart Crowd Monitoring System 🛡️👨‍👩‍👧‍👦

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![YOLOv8](https://img.shields.io/badge/YOLOv8-FF6F00?style=for-the-badge&logo=pytorch&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama_Phi--3-black?style=for-the-badge&logo=ollama&logoColor=white)

**A production-grade, multi-agent crowd intelligence and monitoring system designed for large venues like stadiums.**
It combines real-time computer vision, predictive analytics, and a natural language interface
to provide actionable insights for security and operations.

[![LinkedIn](https://img.shields.io/badge/Pratheep_S-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pratheep-s537)
[![GitHub](https://img.shields.io/badge/pratheep537-181717?style=flat&logo=github&logoColor=white)](https://github.com/pratheep537)

</div>

---

## 🧠 System Architecture

```
Video Input
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                     AegisAI Core                        │
│                                                         │
│  ┌─────────────────┐   ┌──────────────────┐            │
│  │  Agent 1        │   │  Agent 2          │            │
│  │  Crowd          │◄──│  LLM Command      │            │
│  │  Intelligence   │   │  (Ollama / Phi-3) │            │
│  └────────┬────────┘   └──────────────────┘            │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────┐   ┌──────────────────┐            │
│  │  Agent 3        │   │  Decision Layer   │            │
│  │  Predictive     │──►│  Risk + Guard     │            │
│  │  Analytics      │   │  Allocation       │            │
│  └─────────────────┘   └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
    │
    ▼
React Dashboard  ──  REST API  ──  Live Video Feed
```

---

## 🚀 Features

- **Real-time Vision Pipeline** – YOLOv8 for precise person detection + CSRNet for high-density crowd estimation
- **Multi-Agent Architecture**:
  - **Agent 1 (Crowd Intelligence)** – Monitors real-time density, zones, and calculates risk levels
  - **Agent 2 (LLM Command)** – Interactive NLP interface to query system state (powered by Ollama/Phi-3)
  - **Agent 3 (Predictive Analytics)** – Forecasts future congestion trends based on historical data
- **Zone-Based Analysis** – Tracks crowd distribution across Left, Center, and Right zones
- **Dynamic Risk Management** – Classifies density as `LOW` / `MEDIUM` / `HIGH` and auto-calculates guard requirements (1 guard per 20 people)
- **Interactive Dashboard** – Modern React/Vite frontend with live camera feeds and real-time data visualization
- **NLP Query Interface** – Ask things like *"Which zone is crowded?"* or *"How many guards are needed?"*

---

## 🛠️ Tech Stack

| Layer | Tools |
|---|---|
| **Backend** | Python, FastAPI, Uvicorn, OpenCV, Pandas |
| **Computer Vision & ML** | YOLOv8 (Ultralytics), CSRNet, PyTorch, Scikit-learn |
| **Frontend** | React 19, Vite, TailwindCSS, Recharts, Lucide React |
| **LLM Engine** | Ollama (Phi-3) — local, private command processing |

---

## 📂 Project Structure

```text
.
├── backend/            # FastAPI server & multi-agent logic
├── frontend/           # React application
├── models/             # Detection & counting model scripts
├── assets/             # Images and demo files
├── requirements.txt    # Python dependencies
└── .gitignore
```

---

## ⚙️ Installation

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- [Ollama](https://ollama.ai/) (for LLM features)

### 2. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Place model weights in /backend/models/
# yolov8x.pt
# CSRNet_pretrained.pth
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. LLM Setup

```bash
ollama pull phi3
```

---

## 🏃 Running the Application

```bash
# Terminal 1 — Backend
cd backend
python main.py

# Terminal 2 — Frontend
cd frontend
npm run dev
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/state` | Current crowd intelligence state |
| `GET` | `/api/prediction` | Future congestion forecasts |
| `POST` | `/api/llm/ask` | Query the system via natural language |
| `GET` | `/api/video_feed` | Stream live detection frames |

---

## 🌍 Use Cases

> AegisAI is built for any environment where crowd safety is non-negotiable.

- Stadiums & sports arenas
- Public events & concerts
- Airports & railway stations
- Smart city surveillance infrastructure

---

## 🎯 Objective

> To transform crowd monitoring from a **reactive** system into a **proactive AI-driven safety solution** — improving decision-making speed and preventing dangerous situations before they escalate.

---

## 📌 Status

```
🚧 Prototype / Under Active Development
```

---

## 👤 Author

<div align="center">

**Pratheep S**
*AI & Data Science Engineer*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pratheep-s537)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/pratheep537)

</div>

---

## 📄 License

MIT License
