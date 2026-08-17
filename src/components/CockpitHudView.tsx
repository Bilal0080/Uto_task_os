import React from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import {
  CheckCircle2,
  Navigation,
  Mic,
  ShieldCheck,
  Zap,
  Gauge,
  Wind,
  Layers,
  ChevronRight,
  Fingerprint,
} from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';
import { WeatherWidget } from './WeatherWidget';

export const CockpitHudView: React.FC = () => {
  const {
    telemetry,
    tasks,
    updateTask,
    setCurrentView,
    setVoiceModalOpen,
    activeProfile,
    isOffline,
  } = useAutomotive();

  // Active mission task
  const activeTask = tasks.find((t) => t.status !== 'completed') || tasks[0];

  // Calculate task completion percentage
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const taskProgressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 74;

  return (
    <div id="cockpit-hud-clean-minimalism" className="flex flex-col lg:flex-row flex-1 gap-6 min-h-0 h-full overflow-y-auto select-none">
      {/* Left Main Section (2/3 width) */}
      <section className="w-full lg:w-2/3 flex flex-col gap-6">
        {/* Main Hero Card: Current Mission & Vehicle Task */}
        <div className="bg-zinc-900/50 rounded-3xl p-6 sm:p-8 border border-zinc-800 flex flex-col justify-between flex-1 relative overflow-hidden shadow-2xl">
          {/* Top Row: Label & Status Badges */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                Current Build & Mission Task
              </h2>
              <h1 className="text-3xl sm:text-5xl font-light leading-tight text-white">
                {activeTask ? (
                  <>
                    {activeTask.title.split(' ').slice(0, 3).join(' ')}<br />
                    {activeTask.title.split(' ').slice(3).join(' ') || 'Android Automotive Phase'}
                  </>
                ) : (
                  <>Android Automotive<br />Integration Phase 4</>
                )}
              </h1>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="bg-blue-600/10 text-blue-500 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-blue-500/20 text-xs sm:text-sm font-bold tracking-wider">
                {isOffline ? 'OFFLINE CACHE' : 'OFFLINE NAV ACTIVE'}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                {activeTask?.location?.name || 'Local Waypoint Zone'}
              </div>
            </div>
          </div>

          {/* Center / Progress Section */}
          <div className="mt-8">
            <div className="flex justify-between items-end mb-3">
              <span className="text-5xl sm:text-6xl font-black text-blue-500 tracking-tight">
                {taskProgressPercentage}
                <span className="text-2xl sm:text-3xl opacity-50 font-normal">%</span>
              </span>
              <span className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest font-semibold">
                3 Active Collaborators
              </span>
            </div>

            {/* Clean Rounded Progress Bar */}
            <div className="w-full h-3.5 sm:h-4 bg-zinc-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(8, taskProgressPercentage)}%` }}
              />
            </div>

            {/* Stepper Sub-labels */}
            <div className="flex justify-between mt-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>Sensor Initialization</span>
              <span>Module Calibration</span>
              <span>UI Deployment</span>
            </div>
          </div>

          {/* Quick Action Trigger Buttons */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {activeTask && (
                <button
                  id="hud-complete-task-btn"
                  onClick={() => {
                    updateTask(activeTask.id, {
                      status: activeTask.status === 'completed' ? 'pending' : 'completed',
                    });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTask.status === 'completed'
                      ? 'bg-zinc-800 text-green-400 border border-green-500/30'
                      : 'bg-green-500 hover:bg-green-400 text-zinc-950 shadow-md'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{activeTask.status === 'completed' ? 'Reopen' : 'Mark Completed'}</span>
                </button>
              )}

              <button
                id="hud-navigate-task-btn"
                onClick={() => {
                  automotiveAudio.playChime('nav_turn');
                  setCurrentView('nav');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Route GPS</span>
              </button>
            </div>

            <button
              onClick={() => setCurrentView('tasks')}
              className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1"
            >
              <span>View All Tasks ({tasks.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Decorative Minimalist Vertical Dot Accents on Right */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
          </div>
        </div>

        {/* Lower Grid (2 Cards: Voice Command & Biometric Security) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-auto sm:h-48">
          {/* Voice Command Card */}
          <div
            onClick={() => {
              automotiveAudio.playChime('voice_activate');
              setVoiceModalOpen(true);
            }}
            className="bg-zinc-900/50 hover:bg-zinc-900/80 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-between cursor-pointer transition-all shadow-lg group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 group-hover:text-blue-400 border border-zinc-700">
                MIC
              </div>
              <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                Voice Command
              </span>
            </div>
            <div className="text-base sm:text-lg font-medium text-zinc-200">
              "Navigate to nearest charging station"
            </div>
            <div className="text-[11px] text-blue-400 font-mono">
              Tap for Hands-Free Assistant →
            </div>
          </div>

          {/* Biometric Security Access Card */}
          <div
            onClick={() => setCurrentView('biometrics')}
            className="bg-zinc-900/50 hover:bg-zinc-900/80 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-between cursor-pointer transition-all shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border border-zinc-700">
                BIO
              </div>
              <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                Security Access
              </span>
            </div>
            <div className="text-base sm:text-lg font-medium text-green-500">
              Biometric Verified
            </div>
            <div className="text-[11px] text-zinc-500 font-mono">
              Profile: {activeProfile.name} ({activeProfile.role})
            </div>
          </div>
        </div>
      </section>

      {/* Right Sidebar (1/3 width): Real-Time Weather Overlay & Vehicle Sensors */}
      <aside className="w-full lg:w-1/3 flex flex-col gap-6">
        {/* Real-Time Weather Widget Component Overlay */}
        <WeatherWidget />

        {/* Vehicle Sensors & HAL Panel */}
        <div className="bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 flex flex-col flex-1 justify-between shadow-2xl">
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">
              Vehicle Sensors & HAL
            </h3>

            <div className="space-y-5">
              {/* Battery Reserve */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Battery Reserve</span>
                <span className="text-2xl font-light text-white font-mono">{telemetry.batterySoC}%</span>
              </div>

              {/* ADAS State */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">ADAS State</span>
                <span className="text-xs px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-md font-bold tracking-wider">
                  NOMINAL
                </span>
              </div>

              {/* Latency */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">VHAL Latency</span>
                <span className="text-2xl font-light text-white font-mono">8ms</span>
              </div>

              {/* Tire PSI */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Average Tire PSI</span>
                <span className="text-2xl font-light text-white font-mono">
                  {telemetry.tirePressurePsi.frontLeft}
                </span>
              </div>

              {/* Speed Output */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Road Speed</span>
                <span className="text-2xl font-light text-blue-500 font-mono">
                  {Math.round(telemetry.speedKmh)} <span className="text-xs text-zinc-400">KM/H</span>
                </span>
              </div>
            </div>
          </div>

          {/* System Health Segment Bar at Bottom */}
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase mb-2 font-bold tracking-widest flex justify-between">
              <span>System Health Status</span>
              <span className="text-green-500 font-mono">6/6 Modules OK</span>
            </div>
            <div className="flex gap-1.5">
              <div className="h-6 flex-1 bg-green-500/80 rounded-sm"></div>
              <div className="h-6 flex-1 bg-green-500/80 rounded-sm"></div>
              <div className="h-6 flex-1 bg-green-500/80 rounded-sm"></div>
              <div className="h-6 flex-1 bg-green-500/80 rounded-sm"></div>
              <div className="h-6 flex-1 bg-green-500/80 rounded-sm"></div>
              <div className="h-6 flex-1 bg-zinc-800 rounded-sm"></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

