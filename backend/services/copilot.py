import json
import os
from typing import Any

import requests


class OpsCopilot:
    """OpenAI-compatible copilot (local Ollama default or cloud API) with deterministic fallback."""

    def __init__(self):
        self.base_url = os.getenv("LLM_BASE_URL", "http://127.0.0.1:11434/v1").rstrip("/")
        self.model = os.getenv("LLM_MODEL", "phi3")
        self.api_key = os.getenv("LLM_API_KEY", "ollama")

    def _fallback_briefing(self, telemetry: dict[str, Any]) -> str:
        zones = telemetry.get("zones", {})
        lines = [
            f"Venue: {telemetry.get('venue_name', 'Unknown')} | Risk: {telemetry.get('overall_risk', 'SAFE')}",
            f"Tracked People: {telemetry.get('total_people', 0)}",
        ]
        for z in zones.values():
            ttcd = f"{z['ttcd_minutes']} min" if z.get("ttcd_minutes") is not None else "Stable"
            lines.append(
                f"- {z['name']}: {z['count']} ppl ({z['density_pm2']} p/m^2) | "
                f"TTCD: {ttcd} | {z['playbook']['directive']}"
            )
        return "\n".join(lines)

    def ask(self, question: str, telemetry: dict[str, Any]) -> str:
        compact_state = {k: v for k, v in telemetry.items() if k != "bev_points"}
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are AegisAI, an on-premise crowd safety operations copilot. "
                        "Answer concisely using ONLY the live physics telemetry provided "
                        "(density in people/m^2, Helbing pressure, TTCD minutes, and gate playbooks)."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Telemetry:\n{json.dumps(compact_state, indent=2)}\n\nQuestion: {question}",
                },
            ],
            "temperature": 0.2,
        }

        try:
            resp = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=30,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as exc:
            print(f"[OpsCopilot] LLM offline ({exc}); serving deterministic physics briefing.")

        return self._fallback_briefing(telemetry)
