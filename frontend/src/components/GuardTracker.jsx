import { UsersRound } from "lucide-react";

export default function GuardTracker({ data, loading }) {
    if (loading && !data) {
        return <div className="bg-slate-800 rounded-xl p-5 h-48 animate-pulse shadow-lg border border-slate-700 mt-6"></div>;
    }

    const { guards_allocated } = data || {};

    if (!guards_allocated || Object.keys(guards_allocated).length === 0) {
        return null; // Render nothing if data shape is wrong or initially missing
    }

    return (
        <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700 mt-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <UsersRound className="text-cyan-400" />
                <h2 className="text-lg font-semibold">Active Unit Deployments</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {Object.entries(guards_allocated).map(([zone, count]) => (
                    <div key={zone} className="bg-slate-900/50 p-3 rounded-lg flex flex-col items-center border border-slate-700/50">
                        <span className="text-xs text-slate-400 uppercase tracking-wider mb-1 block text-center w-full truncate">{zone}</span>
                        <span className="text-xl font-bold text-cyan-300">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
