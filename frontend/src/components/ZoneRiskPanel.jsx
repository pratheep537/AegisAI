import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ActivitySquare, AlertOctagon } from "lucide-react";

export default function ZoneRiskPanel({ data, loading }) {
    if (loading && !data) {
        return (
            <div className="bg-slate-800 rounded-xl p-5 h-96 animate-pulse shadow-lg border border-slate-700"></div>
        );
    }

    const { total_people, zones, risk_level } = data || {};

    const chartData = [
        { name: "Left", count: zones?.left || 0 },
        { name: "Center", count: zones?.center || 0 },
        { name: "Right", count: zones?.right || 0 }
    ];

    const getRiskColor = (level) => {
        switch (level) {
            case "LOW": return "text-emerald-400";
            case "MEDIUM": return "text-yellow-400";
            case "HIGH": return "text-orange-400";
            case "CRITICAL": return "text-red-500 animate-pulse";
            default: return "text-slate-400";
        }
    };

    const getRiskBg = (level) => {
        switch (level) {
            case "LOW": return "bg-emerald-500/10 border-emerald-500/20";
            case "MEDIUM": return "bg-yellow-500/10 border-yellow-500/20";
            case "HIGH": return "bg-orange-500/10 border-orange-500/20";
            case "CRITICAL": return "bg-red-500/10 border-red-500/30";
            default: return "bg-slate-700";
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <ActivitySquare className="text-indigo-400" />
                <h2 className="text-xl font-semibold">Zone Risk Analysis</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Venue Count</p>
                    <p className="text-3xl font-bold text-slate-100">{total_people || 0}</p>
                </div>

                <div className={`p-4 rounded-lg border flex flex-col items-center justify-center ${getRiskBg(risk_level)}`}>
                    <div className="flex items-center gap-1">
                        {risk_level === 'CRITICAL' && <AlertOctagon className="w-4 h-4 text-red-500 animate-bounce" />}
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Risk Level</p>
                    </div>
                    <p className={`text-2xl font-bold ${getRiskColor(risk_level)}`}>
                        {risk_level || "UNKNOWN"}
                    </p>
                </div>
            </div>

            <div className="flex-1 mt-4 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: '#334155' }}
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f8fafc' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.count > 50 ? '#f97316' : '#6366f1'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
