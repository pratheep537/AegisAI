import { TrendingUp, AlertTriangle } from "lucide-react";

export default function PredictionPanel({ data, loading }) {
    if (loading && !data) {
        return (
            <div className="bg-slate-800 rounded-xl p-5 h-48 animate-pulse shadow-lg border border-slate-700"></div>
        );
    }

    const { zone, predicted_count, congestion_warning } = data || {};

    return (
        <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <TrendingUp className="text-purple-400" />
                <h2 className="text-xl font-semibold">Future Prediction</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Target Zone</p>
                    <p className="text-2xl font-bold capitalize text-purple-200">
                        {zone || "N/A"}
                    </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">+5 Min Forecast</p>
                    <p className="text-2xl font-bold text-slate-100">
                        {predicted_count ?? "--"}
                        <span className="text-sm font-normal text-slate-400 ml-1">people</span>
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-colors ${congestion_warning
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                >
                    {congestion_warning ? (
                        <>
                            <AlertTriangle className="w-5 h-5 animate-pulse" />
                            <span>CONGESTION WARNING ACTIVE</span>
                        </>
                    ) : (
                        <span>FLOW NOMINAL - NO BOTTLENECKS</span>
                    )}
                </div>
            </div>
        </div>
    );
}
