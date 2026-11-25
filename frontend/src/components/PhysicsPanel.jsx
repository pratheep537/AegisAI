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
    <div className="bg-slate-800 rounded-xl p-3.5 shadow-lg border border-slate-700 h-full flex flex-col justify-between gap-2.5 min-h-0">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <ActivitySquare className="text-indigo-400 w-4 h-4" />
          <h2 className="text-sm font-semibold">Crowd Physics Telemetry</h2>
        </div>
        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${RISK_STYLES[risk] || RISK_STYLES.SAFE}`}>
          {risk}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
          <p className="text-[10px] text-slate-400 uppercase">Local Density</p>
          <p className="text-lg font-black text-slate-100 mt-0.5">
            {primary ? primary.density_pm2.toFixed(2) : "0.00"}
            <span className="text-[10px] font-normal text-slate-400 ml-1">p/m²</span>
          </p>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
          <p className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-400" /> TTCD
          </p>
          <p className="text-lg font-black text-purple-300 mt-0.5">
            {primary?.ttcd_minutes !== null && primary?.ttcd_minutes !== undefined
              ? `${primary.ttcd_minutes}m`
              : "Stable"}
          </p>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
          <p className="text-[10px] text-slate-400 uppercase">Pressure</p>
          <p className={`text-lg font-bold mt-0.5 ${primary?.turbulence_detected ? "text-red-400" : "text-cyan-300"}`}>
            {primary ? primary.helbing_pressure.toFixed(3) : "0.000"}
          </p>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
          <p className="text-[10px] text-slate-400 uppercase">Flux (/min)</p>
          <p className="text-base font-bold text-slate-100 mt-0.5">
            <span className="text-amber-400">+{primary?.inflow_per_min ?? 0}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-emerald-400">-{primary?.outflow_per_min ?? 0}</span>
          </p>
        </div>
      </div>

      {primary?.playbook && (
        <div className={`px-3 py-2 rounded-lg border text-xs shrink-0 ${RISK_STYLES[primary.risk_level] || RISK_STYLES.SAFE}`}>
          <div className="flex items-center gap-1.5 font-bold">
            {primary.risk_level === "CRITICAL" ? (
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{primary.playbook.action}</span>
          </div>
          <p className="text-[11px] text-slate-200 mt-0.5 line-clamp-2">{primary.playbook.directive}</p>
        </div>
      )}
    </div>
  );
}
