import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Activity, AlertTriangle, Eye, EyeOff, PlayCircle, Radio } from "lucide-react";
import { API_BASE } from "./config";
import { DEMO_CONFIG, DEMO_FRAMES } from "./demoData";
import BEVHeatmap from "./components/BEVHeatmap";
import CalibrationModal from "./components/CalibrationModal";
import LiveCamera from "./components/LiveCamera";
import LLMPanel from "./components/LLMPanel";
import PhysicsPanel from "./components/PhysicsPanel";

function App() {
  const [demoMode, setDemoMode] = useState(false);
  const [demoIdx, setDemoIdx] = useState(0);
  const [liveTelemetry, setLiveTelemetry] = useState(null);
  const [config, setConfig] = useState(DEMO_CONFIG);
  const [offline, setOffline] = useState(false);
  const [showCalibrate, setShowCalibrate] = useState(false);
  const [acknowledgedCritical, setAcknowledgedCritical] = useState(false);
  const [savingBlur, setSavingBlur] = useState(false);
  const pollingRef = useRef(false);

  useEffect(() => {
    if (demoMode) return undefined;
    let active = true;

    const loadConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/config`);
        if (active) setConfig(res.data);
      } catch {
        // Keep fallback config until backend is online
      }
    };

    const pollTelemetry = async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      try {
        const res = await axios.get(`${API_BASE}/api/telemetry`);
        if (active) {
          setLiveTelemetry(res.data);
          if (res.data?.overall_risk !== "CRITICAL") setAcknowledgedCritical(false);
          setOffline(false);
        }
      } catch {
        if (active) setOffline(true);
      } finally {
        pollingRef.current = false;
      }
    };

    loadConfig();
    pollTelemetry();
    const timer = setInterval(pollTelemetry, 400);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [demoMode]);

  useEffect(() => {
    if (!demoMode) return undefined;
    const timer = setInterval(() => {
      setDemoIdx((prev) => {
        const nextIdx = (prev + 1) % DEMO_FRAMES.length;
        if (DEMO_FRAMES[nextIdx].overall_risk !== "CRITICAL") {
          setAcknowledgedCritical(false);
        }
        return nextIdx;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [demoMode]);

  const telemetry = demoMode ? DEMO_FRAMES[demoIdx] : liveTelemetry || DEMO_FRAMES[0];
  const isCritical = telemetry.overall_risk === "CRITICAL";
  const showCriticalBanner = isCritical && !acknowledgedCritical;
  const criticalDirective =
    telemetry.active_playbooks?.find((p) => p.risk === "CRITICAL")?.directive ||
    `Critical crowd risk threshold exceeded at ${telemetry.venue_name}. Immediate intervention required.`;
  const privacyBlur = Boolean(config?.camera?.privacy_blur_faces);

  const handleTogglePrivacyBlur = async () => {
    if (savingBlur) return;
    const updated = {
      ...config,
      camera: {
        ...config?.camera,
        privacy_blur_faces: !privacyBlur,
      },
    };

    if (demoMode) {
      setConfig(updated);
      return;
    }

    setSavingBlur(true);
    try {
      await axios.put(`${API_BASE}/api/config`, updated);
      setConfig(updated);
    } catch {
      // Keep previous config state if backend request fails
    } finally {
      setSavingBlur(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 p-3 flex flex-col font-sans">
      {showCriticalBanner && (
        <div
          role="alert"
          className="shrink-0 mb-2.5 px-3.5 py-2 rounded-lg bg-red-600/95 border border-red-400 text-white flex items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="h-5 w-5 text-red-100 shrink-0" />
            <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/60 border border-red-300/40 shrink-0">
              CRITICAL
            </span>
            <p className="text-xs font-medium truncate">{criticalDirective}</p>
          </div>
          <button
            type="button"
            onClick={() => setAcknowledgedCritical(true)}
            className="shrink-0 px-3 py-1 text-xs font-semibold rounded-md bg-white text-red-700 hover:bg-red-50 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      )}

      <header className="shrink-0 mb-3 flex items-center gap-3 pb-2.5 border-b border-slate-700/80">
        <Activity className="h-6 w-6 text-emerald-400 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight leading-tight truncate">
            AegisAI v2 Crowd Safety Control Room
          </h1>
          <p className="text-[11px] text-slate-400 truncate">
            {telemetry.venue_name} • Self-Hosted Edge Physics Engine
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2.5 shrink-0">
          {offline && !demoMode && (
            <span className="text-xs text-amber-400 hidden md:inline">
              Local backend offline — switch to Demo Playback
            </span>
          )}
          <button
            type="button"
            onClick={handleTogglePrivacyBlur}
            disabled={savingBlur}
            aria-pressed={privacyBlur}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${
              privacyBlur
                ? "bg-violet-500/20 text-violet-300 border-violet-500/40 hover:bg-violet-500/30"
                : "bg-slate-800 text-slate-300 border-slate-600/80 hover:bg-slate-700/70"
            }`}
          >
            {privacyBlur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {privacyBlur ? "Privacy Blur: ON" : "Privacy Blur: OFF"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAcknowledgedCritical(false);
              setDemoMode((m) => !m);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              demoMode
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            }`}
          >
            {demoMode ? <PlayCircle className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
            {demoMode ? "Mode: Demo Playback" : "Mode: Live Self-Hosted"}
          </button>
        </div>
      </header>

      {/* Fixed 1-page grid: Left = Bird's-Eye Map | Center = Ops Copilot | Right = Camera + Physics Telemetry */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        <div className="lg:col-span-4 min-h-0 h-full">
          <BEVHeatmap telemetry={telemetry} config={config} />
        </div>

        <div className="lg:col-span-3 min-h-0 h-full">
          <LLMPanel telemetry={telemetry} demoMode={demoMode} />
        </div>

        <div className="lg:col-span-5 min-h-0 h-full flex flex-col gap-3">
          <div className="flex-[1.35] min-h-0">
            <LiveCamera
              totalPeople={telemetry.total_people}
              demoMode={demoMode}
              onOpenCalibrate={() => setShowCalibrate(true)}
            />
          </div>
          <div className="flex-[0.65] min-h-0">
            <PhysicsPanel telemetry={telemetry} />
          </div>
        </div>
      </main>

      {showCalibrate && (
        <CalibrationModal
          key="calibration-modal"
          config={config}
          demoMode={demoMode}
          onClose={() => setShowCalibrate(false)}
          onSaved={(updated) => setConfig(updated)}
        />
      )}
    </div>
  );
}

export default App;
