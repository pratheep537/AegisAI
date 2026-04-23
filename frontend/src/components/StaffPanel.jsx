import { Shield, ShieldAlert } from "lucide-react";

export default function StaffPanel({ data, loading }) {
    if (loading && !data) {
        return <div className="bg-slate-800 rounded-xl p-5 h-48 animate-pulse shadow-lg border border-slate-700"></div>;
    }

    const { guards_needed, risk_level, zones } = data || {};

    // Quick logic to determine the most active zone visually
    let topZone = "None";
    let maxCount = 0;
    if (zones) {
        Object.entries(zones).forEach(([k, v]) => {
            if (v > maxCount) {
                maxCount = v;
                topZone = k;
            }
        });
    }

    const isHighRisk = risk_level === "HIGH" || risk_level === "CRITICAL";

    return (
        <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <Shield className="text-amber-400" />
                <h2 className="text-xl font-semibold">Security Staff Deployment</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col justify-center items-center border border-slate-700/50 relative overflow-hidden">
                    {/* Subtle background glow if highly active */}
                    {isHighRisk && <div className="absolute inset-0 bg-amber-500/5 animate-pulse"></div>}

                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 relative z-10">Active Guards Required</p>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-4xl font-black text-amber-300">{guards_needed || 0}</span>
                        <span className="text-slate-500 text-sm font-medium">units</span>
                    </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col justify-center items-center border border-slate-700/50">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Primary Focus Zone</p>
                    <div className="flex items-center gap-2">
                        {isHighRisk && <ShieldAlert className="w-5 h-5 text-amber-500" />}
                        <span className="text-2xl font-bold capitalize text-slate-200">{topZone}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
