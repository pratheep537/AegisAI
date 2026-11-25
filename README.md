# 🛡️ AegisAI — Smart Crowd Monitoring System

AegisAI is an AI-powered crowd monitoring and intelligence system designed for large venues such as stadiums, railway stations, festivals, concerts, and public events.

It combines real-time computer vision, crowd-density analysis, predictive analytics, multi-agent intelligence, and a dashboard to help operators monitor crowd conditions and make informed decisions.

**Project Status:** Prototype / Under Active Development

---

## 🧠 System Architecture

```text
Video Input
     |
     v
+----------------------------------+
|          AegisAI Core            |
|                                  |
|  +---------------------------+   |
|  | Crowd Intelligence Agent  |   |
|  +-------------+-------------+   |
|                |                 |
|  +-------------v-------------+   |
|  | Predictive Analytics Agent|   |
|  +-------------+-------------+   |
|                |                 |
|  +-------------v-------------+   |
|  | Risk & Decision Layer     |   |
|  | Resource Allocation       |   |
|  +-------------+-------------+   |
|                |                 |
|  +-------------v-------------+   |
|  | LLM Command Agent         |   |
|  | Ollama / Phi-3            |   |
|  +---------------------------+   |
+----------------------------------+
                 |
                 v
        React Dashboard
                 |
          FastAPI REST API
```

---

## 🚀 Features

- **Real-Time Crowd Monitoring** – Monitor crowd activity using computer vision.
- **YOLOv8 Detection** – Detect people in video frames.
- **Crowd Density Analysis** – Analyze crowd density and congestion levels.
- **CSRNet Integration** – Support for high-density crowd estimation.
- **Multi-Agent Architecture**
  - Crowd Intelligence Agent
  - Predictive Analytics Agent
  - LLM Command Agent
  - Risk and Decision Agent
  - Resource Allocation Agent
- **Zone-Based Analysis** – Monitor Left, Center, and Right crowd zones.
- **Risk Management** – Classify crowd risk levels as LOW, MEDIUM, and HIGH.
- **Resource Allocation** – Estimate guard requirements based on crowd count.
- **Predictive Analytics** – Analyze crowd trends and forecast congestion.
- **Interactive Dashboard** – View crowd information and visualizations.
- **Natural Language Interface** – Ask questions about crowd conditions.
- **Privacy-Aware Monitoring** – Face-blurring configuration with no facial recognition.

---

## 🏟️ Multi-Venue Presets

AegisAI supports venue-specific configuration presets for different crowd environments.

Preset configurations are located in:

```text
backend/config/presets/
```

### Available Presets

| Configuration | Venue | Purpose |
|---|---|---|
| `stadium.json` | Stadium | Concourse and gate monitoring |
| `railway_station.json` | Railway Station | Platform and passenger-flow monitoring |
| `festival_gate.json` | Festival | Entry queues and crowd-flow monitoring |

### Preset Directory

```text
backend/config/presets/
├── stadium.json
├── railway_station.json
└── festival_gate.json
```

### Configuration Parameters

Each venue configuration includes:

- `venue_id` – Unique venue identifier.
- `venue_name` – Venue name.
- `camera` – Video source, FPS, and privacy settings.
- `calibration` – Camera calibration and world dimensions.
- `thresholds` – Crowd-density and physics-related parameters.
- `zones` – Monitoring areas, gates, and exits.
- `tripwires` – Entry and exit flow monitoring lines.
- `alerts` – Alert webhook and cooldown settings.

### Loading a Preset

```python
from physics.crowd_physics import CrowdPhysicsEngine

engine = CrowdPhysicsEngine.from_file(
    "backend/config/presets/stadium.json"
)
```

Change the configuration path to load a different venue preset.

> Preset values are sample configurations intended for development and testing. Real-world deployment requires venue-specific calibration and review by qualified crowd-safety professionals.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| Computer Vision | OpenCV, YOLOv8 |
| Crowd Estimation | CSRNet, PyTorch |
| Data Processing | Pandas, NumPy |
| Machine Learning | Scikit-learn |
| Frontend | React, Vite |
| Visualization | Recharts |
| LLM | Ollama, Phi-3 |
| Configuration | JSON |
| Containerization | Docker, Docker Compose |

---

## 📂 Project Structure

```text
AegisAI/
├── backend/
│   ├── config/
│   │   ├── presets/
│   │   │   ├── stadium.json
│   │   │   ├── railway_station.json
│   │   │   └── festival_gate.json
│   │   └── venue_config.json
│   ├── physics/
│   ├── agents/
│   ├── models/
│   ├── data/
│   └── main.py
├── frontend/
├── tests/
├── requirements.txt
├── Dockerfile.backend
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm
- Git
- Docker (optional)
- Ollama (optional for LLM features)

### 1. Clone the Repository

```bash
git clone https://github.com/pratheep537/AegisAI.git
cd AegisAI
```

### 2. Backend Setup

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
cd backend
python main.py
```

### 3. Frontend Setup

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. LLM Setup (Optional)

Install Ollama and download the Phi-3 model:

```bash
ollama pull phi3
```

Start Ollama before using LLM-related features.

---

## 🐳 Docker Setup

Run the application using Docker Compose:

```bash
docker compose up --build
```

Stop the application:

```bash
docker compose down
```

Docker configuration:

- `Dockerfile.backend`
- `docker-compose.yml`

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/state` | Current crowd intelligence state |
| GET | `/api/prediction` | Crowd prediction information |
| POST | `/api/llm/ask` | Ask the system using natural language |
| GET | `/api/video_feed` | Video feed endpoint |

FastAPI Swagger documentation:

```text
http://localhost:8000/docs
```

The actual API port depends on the backend configuration.

---

## 📈 Crowd Monitoring

AegisAI supports configuration of:

- Crowd density thresholds
- Monitoring zones
- Entry and exit tripwires
- Crowd-flow analysis
- Turbulence-pressure parameters
- Time-to-critical-density warning parameters
- Alert cooldown periods

These parameters should be calibrated according to the monitored venue and camera setup.

---

## 🔐 Privacy

AegisAI follows privacy-aware crowd monitoring principles:

- Face-blurring configuration is supported.
- Facial recognition is not used.
- Privacy-related camera settings are configurable.
- Video sources can be configured according to deployment requirements.
- Deployment should comply with applicable privacy laws and venue policies.

---

## 🌍 Use Cases

- Stadiums and sports arenas
- Railway stations
- Festivals and concerts
- Public gatherings
- Event entrance gates
- Smart-city crowd monitoring

---

## 🎯 Objective

To transform crowd monitoring from a reactive process into a proactive AI-driven intelligence system that helps identify congestion trends, monitor crowd conditions, and support timely operational decision-making.

---

## 📌 Development Status

```text
Prototype / Under Active Development
```

AegisAI is an ongoing project. Features, models, configurations, and API endpoints may change during development.

---

## 👤 Author

**Pratheep S**  
AI & Data Science Engineer

- LinkedIn: [Pratheep S](https://www.linkedin.com/in/pratheep-s537)
- GitHub: [pratheep537](https://github.com/pratheep537)

---

## 📄 License

MIT License
