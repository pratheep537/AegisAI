import json
import requests


class LLMResponse:

    def __init__(self, model="phi3"):
        self.model = model
        self.url = "http://127.0.0.1:11434/api/generate"

    def generate(self, user_query, system_context):

        prompt = f"""
You are an AI stadium control room assistant.

Current System State:
{json.dumps(system_context, indent=2)}

User Question:
{user_query}

Answer clearly using the provided data. Be professional and concise.
"""

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }

        try:
            print("Sending request to Ollama...")

            response = requests.post(
                self.url,
                json=payload,
                timeout=120   # Increased timeout
            )

            if response.status_code == 200:
                result = response.json()
                return result.get("response", "AI assistant could not generate a response.")

            else:
                return f"LLM Error: HTTP {response.status_code}"

        except Exception as e:

            print("Ollama error:", str(e))

            # DEMO FALLBACK (never crash)
            fallback = f"""
AI assistant temporarily unavailable.

Current system data:
Total Crowd: {system_context.get('total_people', 'N/A')}

Zones:
{system_context.get('zones', {})}

Risk Level: {system_context.get('risk_level', 'Unknown')}

Guards Needed: {system_context.get('guards_needed', 'N/A')}
"""

            return fallback