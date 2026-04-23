import { Camera, Users } from "lucide-react";

export default function LiveCamera({ totalPeople }) {
    // We use the direct URI because the browser natively handles MJPEG streams via <img> targets
    const videoStreamUrl = "http://localhost:8000/video-feed";

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 h-full flex flex-col overflow-hidden relative group">
            <div className="p-4 flex items-center justify-between border-b border-slate-700 bg-slate-800/90 z-10 backdrop-blur-sm relative">
                <div className="flex items-center gap-2">
                    <Camera className="text-rose-400 w-5 h-5" />
                    <h2 className="text-xl font-semibold">Live Camera Detection</h2>
                </div>

                {/* Live indicator dot */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Live</span>
                </div>
            </div>

            <div className="flex-1 bg-black relative flex items-center justify-center p-1">
                {/* Using standard img element for MJPEG streams */}
                <img
                    src={videoStreamUrl}
                    alt="Live stadium analysis feed"
                    className="w-full h-full object-contain rounded-lg shadow-inner"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />

                <div className="absolute inset-0 flex-col items-center justify-center hidden text-slate-500">
                    <Camera className="w-12 h-12 mb-3 opacity-20" />
                    <p>Connecting to vision pipeline...</p>
                </div>

                {/* Overlay total HUD */}
                <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-md border border-slate-600/50 rounded-xl p-4 shadow-xl transform transition-transform group-hover:scale-105">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Users className="text-blue-400 w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-300 font-medium uppercase tracking-wider mb-0.5">YOLO Detections</p>
                            <p className="text-3xl font-black text-white leading-none tracking-tight">{totalPeople || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
