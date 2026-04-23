import { useState } from "react";
import axios from "axios";
import { Send, Bot } from "lucide-react";

export default function LLMPanel() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { role: "ai", text: "Control room AI ready. Ask me anything about the stadium." }
    ]);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMessage = query.trim();
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setQuery("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:8000/ask-ai", {
                question: userMessage
            });
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: res.data.response || "No response generated." }
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: "Error: Could not reach LLM inference engine." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <Bot className="text-teal-400" />
                <h2 className="text-xl font-semibold">LLM Message Panel</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[400px]">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`p-3 rounded-lg text-sm ${m.role === "ai"
                                ? "bg-slate-700 text-slate-200"
                                : "bg-teal-600/30 text-teal-100 ml-auto w-11/12 border border-teal-500/30"
                            }`}
                    >
                        {m.text}
                    </div>
                ))}
                {loading && <div className="text-slate-400 text-sm animate-pulse">Thinking...</div>}
            </div>

            <form onSubmit={handleAsk} className="mt-auto relative shadow-sm">
                <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="Ask system state..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 p-1.5 bg-teal-600 hover:bg-teal-500 rounded-md transition-colors disabled:opacity-50"
                    disabled={loading}
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
