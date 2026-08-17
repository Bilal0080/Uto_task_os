import React, { useState, useEffect } from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import {
  Navigation,
  Compass,
  HardDrive,
  Download,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const OfflineNavView: React.FC = () => {
  const { tasks, telemetry, updateTelemetry, activeProfile } = useAutomotive();

  const [isDrivingSim, setIsDrivingSim] = useState(false);
  const [carProgress, setCarProgress] = useState(0.2);
  const [activeManeuverIndex, setActiveManeuverIndex] = useState(0);
  const [isDownloadingRegion, setIsDownloadingRegion] = useState(false);

  const maneuvers = [
    {
      instruction: 'In 350m, Turn Right onto Grand Avenue',
      street: 'Grand Ave',
      distance: 350,
      icon: 'turn-right',
      laneIndex: 2,
    },
    {
      instruction: 'Continue Straight for 2.4 km on I-80 East',
      street: 'I-80 East Highway',
      distance: 2400,
      icon: 'straight',
      laneIndex: 1,
    },
    {
      instruction: 'Take Exit 14B toward BioMedical Logistics Center',
      street: 'Exit 14B - Logistics Hub',
      distance: 800,
      icon: 'turn-right',
      laneIndex: 2,
    },
    {
      instruction: 'Arrive at Destination - North Port Bay 4',
      street: 'Port Terminal Bay 4',
      distance: 50,
      icon: 'arrive',
      laneIndex: 1,
    },
  ];

  // Drive simulation loop
  useEffect(() => {
    let interval: any;
    if (isDrivingSim) {
      interval = setInterval(() => {
        setCarProgress((prev) => {
          const next = prev + 0.015;
          if (next >= 1) {
            setIsDrivingSim(false);
            automotiveAudio.playChime('task_complete');
            if (activeProfile.preferences.voiceFeedback) {
              automotiveAudio.speak('You have arrived at your route mission destination.');
            }
            return 1;
          }

          if (next > 0.4 && next < 0.43 && activeManeuverIndex === 0) {
            setActiveManeuverIndex(1);
            automotiveAudio.playChime('nav_turn');
          } else if (next > 0.75 && next < 0.78 && activeManeuverIndex === 1) {
            setActiveManeuverIndex(2);
            automotiveAudio.playChime('nav_turn');
          }

          return next;
        });

        updateTelemetry({
          speedKmh: Math.min(68, telemetry.speedKmh + (Math.random() - 0.3) * 4),
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isDrivingSim, activeManeuverIndex, telemetry.speedKmh, updateTelemetry, activeProfile]);

  const handleDownloadRegion = () => {
    setIsDownloadingRegion(true);
    setTimeout(() => {
      setIsDownloadingRegion(false);
      automotiveAudio.playChime('voice_confirm');
      if (activeProfile.preferences.voiceFeedback) {
        automotiveAudio.speak('High-resolution offline vector map region downloaded.');
      }
    }, 1500);
  };

  const currentManeuver = maneuvers[activeManeuverIndex] || maneuvers[0];

  const carX = 150 + Math.sin(carProgress * Math.PI * 1.5) * 120 + carProgress * 300;
  const carY = 320 - carProgress * 220;
  const carAngle = -45 + Math.sin(carProgress * Math.PI) * 35;

  return (
    <div id="offline-navigation-view" className="h-full p-2 sm:p-4 grid grid-cols-12 gap-6 overflow-hidden select-none">
      {/* Left Column (8 cols): Interactive Offline High-Contrast Vector Map Canvas */}
      <div className="col-span-12 lg:col-span-8 bg-[#0A0A0A] rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col justify-between">
        {/* Top Floating Turn-By-Turn HUD Card */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-zinc-900/90 backdrop-blur-md rounded-2xl p-4 border border-zinc-800 shadow-2xl flex items-center gap-4 max-w-lg">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-600/30">
              <Navigation className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">
                  In {Math.round(currentManeuver.distance * (1 - carProgress % 0.3))}m
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-[11px] text-zinc-400 font-mono">Lane 2 Recommended</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">
                {currentManeuver.instruction}
              </h3>
            </div>
          </div>

          {/* Speed Limit Sign floating */}
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-white border-2 border-rose-600 flex flex-col items-center justify-center shadow-xl">
              <span className="text-[8px] font-black text-zinc-950 uppercase leading-none">LIMIT</span>
              <span className="text-base font-black text-zinc-950 leading-none">
                {telemetry.adas.speedLimitKmh}
              </span>
            </div>
          </div>
        </div>

        {/* Vector SVG Map Container */}
        <div className="w-full h-full relative flex items-center justify-center">
          <svg className="w-full h-full absolute inset-0 select-none" viewBox="0 0 600 400">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(39, 39, 42, 0.4)" strokeWidth="1" />
              </pattern>
              <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="#0A0A0A" />
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* City Road Network */}
            <path
              d="M0,80 L600,80 M0,200 L600,200 M0,320 L600,320 M120,0 L120,400 M300,0 L300,400 M480,0 L480,400"
              stroke="#18181b"
              strokeWidth="12"
              fill="none"
            />
            <path
              d="M0,80 L600,80 M0,200 L600,200 M0,320 L600,320 M120,0 L120,400 M300,0 L300,400 M480,0 L480,400"
              stroke="#27272a"
              strokeWidth="1.5"
              strokeDasharray="6,6"
              fill="none"
            />

            {/* Active Navigation Primary Route Highway */}
            <path
              d="M 120,350 Q 220,330 280,240 T 480,100"
              stroke="#1e3a8a"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />
            <path
              d="M 120,350 Q 220,330 280,240 T 480,100"
              stroke="url(#routeGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Task Waypoints on Map */}
            {tasks.slice(0, 3).map((task, i) => {
              const wx = 200 + i * 120;
              const wy = 260 - i * 75;
              return (
                <g key={task.id} transform={`translate(${wx}, ${wy})`}>
                  <circle r="12" fill="#3b82f6" fillOpacity="0.25" className="animate-ping" />
                  <circle r="7" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x="12"
                    y="4"
                    fill="#a1a1aa"
                    fontSize="9"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    {task.title.slice(0, 16)}...
                  </text>
                </g>
              );
            })}

            {/* Live Vehicle Marker */}
            <g
              transform={`translate(${carX}, ${carY}) rotate(${carAngle})`}
              className="transition-transform duration-500 ease-linear"
            >
              <polygon points="0,0 -16,-50 16,-50" fill="rgba(59, 130, 246, 0.2)" />
              <rect
                x="-8"
                y="-15"
                width="16"
                height="30"
                rx="4"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          </svg>
        </div>

        {/* Bottom Floating Map Toolbar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md p-2 rounded-2xl border border-zinc-800 shadow-xl">
            <button
              id="toggle-drive-simulation-btn"
              onClick={() => {
                const next = !isDrivingSim;
                setIsDrivingSim(next);
                automotiveAudio.playChime('button_tap');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isDrivingSim
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
              }`}
            >
              {isDrivingSim ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Drive Sim</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Simulate Road Drive</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setCarProgress(0);
                setActiveManeuverIndex(0);
                automotiveAudio.playChime('button_tap');
              }}
              title="Reset Route Position"
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-zinc-800 text-xs font-mono text-zinc-300">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>N 37°46'29" W 122°25'09"</span>
          </div>
        </div>
      </div>

      {/* Right Column (4 cols): Offline Maps Storage Manager & Route Waypoints */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        {/* Offline Vector Cache Manager */}
        <div className="bg-zinc-900/50 rounded-3xl p-5 border border-zinc-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>Offline GPS Cache</span>
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">
              Active
            </span>
          </div>

          <p className="text-xs text-zinc-400 mb-3">
            Full vector roads and dispatch waypoints cached for zero-connectivity driving.
          </p>

          <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 mb-3 space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-zinc-300">Bay Area Metropolitan Zone</span>
              <span className="text-blue-400 font-mono">148 MB</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Status: Low Latency Offline</span>
              <span className="text-green-500">Verified</span>
            </div>
          </div>

          <button
            id="download-offline-region-btn"
            onClick={handleDownloadRegion}
            disabled={isDownloadingRegion}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${isDownloadingRegion ? 'animate-bounce' : ''}`} />
            <span>
              {isDownloadingRegion ? 'Caching Offline Region...' : 'Update Region (148 MB)'}
            </span>
          </button>
        </div>

        {/* Route Waypoint Stops Queue */}
        <div className="bg-zinc-900/50 rounded-3xl p-5 border border-zinc-800 shadow-xl flex-1 flex flex-col overflow-hidden">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span>Route Mission Stops</span>
            <span className="text-xs font-mono text-blue-400">{tasks.length} Waypoints</span>
          </h3>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {tasks.slice(0, 4).map((task, idx) => (
              <div
                key={task.id}
                className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-blue-400 border border-zinc-700 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5 shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {task.location?.name || 'Local Destination'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-zinc-300 font-bold shrink-0">
                  {task.location?.distanceKm || (idx + 1) * 3.4} km
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
