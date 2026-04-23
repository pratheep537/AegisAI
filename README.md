# AegisAI: Smart Crowd Monitoring System 🛡️👨‍👩‍👧‍👦

AegisAI is a production-grade, multi-agent crowd intelligence and monitoring system designed for large venues like stadiums. It combines real-time computer vision, predictive analytics, and a natural language interface to provide actionable insights for security and operations.

## 🚀 Features

- **Real-time Vision Pipeline**: Uses YOLOv8 for precise person detection and CSRNet for high-density crowd estimation.
- **Multi-Agent Architecture**: 
  - **Agent 1 (Crowd Intelligence)**: Monitors real-time density, zones, and calculates risk levels.
  - **Agent 2 (LLM Command)**: Provides an interactive NLP interface to query system state (powered by Ollama/Phi-3).
  - **Agent 3 (Predictive Analytics)**: Forecasts future congestion trends based on historical data.
- **Dynamic Risk Management**: Automatically calculates security guard requirements based on crowd density.
- **Interactive Dashboard**: Modern React/Vite frontend with live camera feeds and data visualization.

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, Uvicorn, PyTorch, Ultralytics (YOLOv8), Pandas, OpenCV.
- **Frontend**: React 19, Vite, TailwindCSS, Recharts, Lucide React.
- **LLM Engine**: Ollama (Phi-3) for local, private command processing.

## 📂 Project Structure

```text
.
├── backend/            # FastAPI server & multi-agent logic
├── frontend/           # React application
├── models/             # Detection & counting model scripts
├── requirements.txt    # Python dependencies
└── .gitignore          # Git exclusion rules
```

## ⚙️ Installation

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- [Ollama](https://ollama.ai/) (for LLM features)

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Download model weights (if not present)
# Place yolov8x.pt and CSRNet_pretrained.pth in the /backend/models/ directory
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. LLM Setup
Make sure Ollama is running and download the Phi-3 model:
```bash
ollama pull phi3
```

## 🏃 Running the Application

### Start Backend
```bash
cd backend
python main.py
```

### Start Frontend
```bash
cd frontend
npm run dev
```

## 📊 API Endpoints
- `GET /api/state`: Get current crowd intelligence state.
- `GET /api/prediction`: Get future congestion forecasts.
- `POST /api/llm/ask`: Query the system using natural language.
- `GET /api/video_feed`: Stream live detection frames.

## 📄 License
MIT License
