import { ActivitySquare, AlertTriangle, Clock, ShieldAlert } from "lucide-react";

const RISK_STYLES = {
  SAFE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  ELEVATED: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  HIGH: "text-orange-400 bg-orange-500/15 border-orange-500/40",
  CRITICAL: "text-red-400 bg-red-500/20 border-red-500/50 animate-pulse",
};

export default function PhysicsPanel({ telemetry }) {
  const zones = Object.entries(telemetry?.zones || {});
  const primary = zones[0]?.[1];
  const risk = telemetry?.overall_risk || "SAFE";

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <div className="flex items-center gap-2">
          <ActivitySquare className="text-indigo-400 w-5 h-5" />
          <h2 className="text-lg font-semibold">Crowd Physics Telemetry</h2>
        </div>
        <span className={`px-3 py-0.5 text-xs font-bold rounded-full border ${RISK_STYLES[risk] || RISK_STYLES.SAFE}`}>
          {risk}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60">
          <p className="text-xs text-slate-400 uppercase">Local Density</p>
          <p className="text-2xl font-black text-slate-100 mt-1">
            {primary ? primary.density_pm2.toFixed(2) : "0.00"}
            <span className="text-xs font-normal text-slate-400 ml-1">p/m²</span>
          </p>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60">
          <p className="text-xs text-slate-400 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" /> Time to Critical
          </p>
          <p className="text-2xl font-black text-purple-300 mt-1">
            {primary?.ttcd_minutes !== null && primary?.ttcd_minutes !== undefined
              ? `${primary.ttcd_minutes} min`
              : "Stable"}
          </p>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60">
          <p className="text-xs text-slate-400 uppercase">Helbing Pressure</p>
          <p className={`text-xl font-bold mt-1 ${primary?.turbulence_detected ? "text-red-400" : "text-cyan-300"}`}>
            {primary ? primary.helbing_pressure.toFixed(4) : "0.0000"}
          </p>
          <p className="text-[11px] text-slate-400">
            {primary?.turbulence_detected ? "Turbulence wave detected" : "Laminar flow"}
          </p>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/60">
          <p className="text-xs text-slate-400 uppercase">Tripwire Flux (/min)</p>
          <p className="text-lg font-bold text-slate-100 mt-1">
            <span className="text-amber-400">+{primary?.inflow_per_min ?? 0}</span>
            <span className="text-slate-500 mx-1.5">/</span>
            <span className="text-emerald-400">-{primary?.outflow_per_min ?? 0}</span>
          </p>
          <p className="text-[11px] text-slate-400">Inflow vs Outflow</p>
        </div>
      </div>

      {primary?.playbook && (
        <div className={`p-3.5 rounded-lg border text-sm ${RISK_STYLES[primary.risk_level] || RISK_STYLES.SAFE}`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            {primary.risk_level === "CRITICAL" ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0" />
            )}
            <span>{primary.playbook.action}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{primary.playbook.directive}</p>
        </div>
      )}
    </div>
  );
}
