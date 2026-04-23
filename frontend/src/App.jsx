import { useState, useEffect } from "react";
import axios from "axios";
import { Activity } from "lucide-react";
import LLMPanel from "./components/LLMPanel";
import PredictionPanel from "./components/PredictionPanel";
import ZoneRiskPanel from "./components/ZoneRiskPanel";
import StaffPanel from "./components/StaffPanel";
import LiveCamera from "./components/LiveCamera";
import GuardTracker from "./components/GuardTracker";

const API_BASE = "http://localhost:8000";

function App() {
  const [crowdData, setCrowdData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch Live System Status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [crowdRes, predRes] = await Promise.all([
          axios.get(`${API_BASE}/crowd-data`),
          axios.get(`${API_BASE}/prediction`)
        ]);
        setCrowdData(crowdRes.data);
        setPredictionData(predRes.data);
        setError(false);
      } catch (err) {
        console.error("API Error", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // 2-second automated interval
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 font-sans">

      {/* Header */}
      <header className="mb-6 flex items-center gap-3 pb-4 border-b border-slate-700">
        <Activity className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold tracking-tight">AI Crowd Intelligence Control Room</h1>
        {error && <span className="ml-auto text-red-500 text-sm animate-pulse">Connection Lost</span>}
      </header>

      {/* Grid Layout - 3 Columns */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <div className="flex-1">
            <LLMPanel />
          </div>
          <div>
            <PredictionPanel data={predictionData} loading={loading} />
          </div>
        </div>

        {/* Center Column */}
        <div className="flex flex-col gap-6">
          <div className="flex-1">
            <ZoneRiskPanel data={crowdData} loading={loading} />
          </div>
          <div>
            <StaffPanel data={crowdData} loading={loading} />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full">
          <LiveCamera totalPeople={crowdData?.total_people} />
          <GuardTracker data={crowdData} loading={loading} />
        </div>

      </main>
    </div>
  );
}

export default App;
