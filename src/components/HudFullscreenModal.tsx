import React from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import { Minimize2, Navigation, ShieldCheck, BatteryCharging, Mic } from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const HudFullscreenModal: React.FC = () => {
  const { hudFullscreen, setHudFullscreen, telemetry, tasks, setVoiceModalOpen } =
    useAutomotive();

  if (!hudFullscreen) return null;

  const activeTask = tasks.find((t) => t.status !== 'completed') || tasks[0];

  return (
    <div
      id="fullscreen-hud-distraction-free-modal"
      className="fixed inset-0 z-50 bg-[#0A0A0A] text-zinc-100 p-8 flex flex-col justify-between select-none"
    >
      {/* Top HUD Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            NIGHT HUD DISTRACTION-FREE MODE
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-mono text-sm">
            <BatteryCharging className="w-4 h-4 text-green-500" />
            <span className="text-green-500 font-bold">{telemetry.batterySoC}%</span>
            <span className="text-zinc-500">({telemetry.rangeKm} km)</span>
          </div>

          <button
            onClick={() => {
              automotiveAudio.playChime('button_tap');
              setHudFullscreen(false);
            }}
            className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main HUD Center */}
      <div className="grid grid-cols-12 gap-8 my-auto items-center">
        {/* Speedometer & Gear */}
        <div className="col-span-12 md:col-span-6 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-[130px] font-black tracking-tighter text-white leading-none">
              {Math.round(telemetry.speedKmh)}
            </span>
            <span className="font-mono text-2xl font-light text-blue-500">KM/H</span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-mono font-bold text-lg">
              GEAR {telemetry.gear}
            </span>
            <span className="px-4 py-1.5 rounded-xl border border-zinc-800 font-mono text-sm text-zinc-400">
              RADAR {telemetry.adas.radarDistanceM}m
            </span>
          </div>
        </div>

        {/* Next Maneuver & Active Task */}
        <div className="col-span-12 md:col-span-6 space-y-6">
          <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-blue-600/30">
              <Navigation className="w-8 h-8 rotate-45" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-blue-400 uppercase">IN 350 METERS</span>
              <h2 className="text-xl sm:text-2xl font-light text-white leading-tight">
                Turn Right onto Grand Avenue
              </h2>
            </div>
          </div>

          {activeTask && (
            <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800">
              <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                Active Mission Stop
              </span>
              <h3 className="text-lg font-semibold text-white mb-1">{activeTask.title}</h3>
              <p className="text-xs text-zinc-400 font-mono">
                {activeTask.location?.name || 'Local Destination'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-4 font-mono text-xs text-zinc-500">
        <span>VHAL: LOW-LATENCY 8MS LOOP</span>

        <button
          onClick={() => {
            automotiveAudio.playChime('voice_activate');
            setVoiceModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
        >
          <Mic className="w-4 h-4" />
          <span>"Hey Auto" Voice</span>
        </button>

        <span>GPS: OFFLINE CACHED</span>
      </div>
    </div>
  );
};
