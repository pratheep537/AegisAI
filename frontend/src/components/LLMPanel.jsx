import { useState } from "react";
import axios from "axios";
import { Bot, Send } from "lucide-react";
import { API_BASE } from "../config";

export default function LLMPanel({ telemetry, demoMode }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "AegisAI Ops Copilot ready. Ask about floor density, TTCD, or gate playbooks." },
  ]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setQuery("");

    if (demoMode) {
      const z = Object.values(telemetry?.zones || {})[0];
      const reply = z
        ? `[Demo Briefing] ${z.name} is at ${z.density_pm2} p/m² (${z.risk_level}). ${z.playbook.directive}`
        : "Demo telemetry ready.";
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ask-ai`, { question: userMessage });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.response || "No response generated." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Could not reach backend copilot at " + API_BASE }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-3.5 shadow-lg border border-slate-700 h-full flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-2.5 border-b border-slate-700 pb-2 shrink-0">
        <Bot className="text-teal-400 w-4 h-4" />
        <h2 className="text-sm font-semibold">Ops Copilot (Local Ollama)</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 mb-3 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2.5 rounded-lg text-xs leading-relaxed whitespace-pre-line ${
              m.role === "ai"
                ? "bg-slate-700/80 text-slate-100"
                : "bg-teal-600/30 text-teal-100 ml-auto w-11/12 border border-teal-500/30"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-slate-400 text-xs animate-pulse">Analyzing physics telemetry...</div>}
      </div>

      <form onSubmit={handleAsk} className="shrink-0 relative">
        <input
          type="text"
          className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-3 pr-10 text-xs focus:outline-none focus:border-teal-500"
          placeholder="Ask about density, TTCD, or gates..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 p-1 bg-teal-600 hover:bg-teal-500 rounded-md disabled:opacity-50"
          disabled={loading}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
