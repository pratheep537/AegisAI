import threading
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Set up paths so we can import internal modules easily
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pipelines.vision_pipeline import run_vision_thread
from pipelines.prediction_pipeline import run_prediction_thread
from pipelines.command_pipeline import command_pipeline
from api.crowd_routes import router as crowd_router
from api.prediction_routes import router as prediction_router
from api.llm_routes import router as llm_router
from api.video_routes import router as video_router

app = FastAPI(title="AEGISAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crowd_router)
app.include_router(prediction_router)
app.include_router(llm_router)
app.include_router(video_router)

def run_server():
    from config import HOST, PORT
    uvicorn.run(app, host=HOST, port=PORT, log_level="error")

def main():
    print("====================================")
    print(" AEGISAI Smart Crowd Monitoring     ")
    print("====================================")

    # 1. Start Vision Pipeline (Agent 1)
    run_vision_thread()

    # 2. Start Prediction Pipeline (Agent 3)
    run_prediction_thread()

    # 3. Start FastAPI server
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    print("\nSystem running. API available at http://localhost:8000")
    print("You can query the LLM using: ask: <your question>")

    # 4. Interactive CLI for LLM Command Agent (Agent 2)
    while True:
        try:
            # Note: flush logic is handled by the command pipeline to place the next prompt
            user_input = input("\n> ")
            if user_input.lower().startswith("ask:"):
                query = user_input[4:].strip()
                if query:
                    command_pipeline.handle_command(query)
            elif user_input.lower() in ["exit", "quit"]:
                print("Shutting down...")
                break
        except KeyboardInterrupt:
            print("Shutting down...")
            break

if __name__ == "__main__":
    main()
