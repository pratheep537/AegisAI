import threading
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.agent2_llm_command.command_agent import CommandAgent
from database.db import db

class CommandPipeline:
    def __init__(self):
        self.agent = CommandAgent()

    def handle_command(self, query, callback=None):
        def worker():
            state = db.get_state()
            response = self.agent.process_query(query, state)
            
            if callback:
                callback(response)
            else:
                print(f"\n[AI Response] {response}")
                print("\n> ask: ", end="", flush=True)

        t = threading.Thread(target=worker, daemon=True)
        t.start()

command_pipeline = CommandPipeline()
