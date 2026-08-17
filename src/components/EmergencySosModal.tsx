import React, { useState, useEffect } from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import {
  AlertTriangle,
  Radio,
  MapPin,
  PhoneCall,
  ShieldAlert,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  Navigation,
  Activity,
  Gauge,
  Flame,
  User,
  Zap,
} from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const EmergencySosModal: React.FC = () => {
  const {
    emergency,
    cancelEmergency,
    emergencyModalOpen,
    setEmergencyModalOpen,
    toggleEmergencyAudio,
    telemetry,
    toggleHazards,
    activeProfile,
    vehicleConfig,
  } = useAutomotive();

  const [etaCounter, setEtaCounter] = useState(4);
  const [pulseHazard, setPulseHazard] = useState(true);

  // Periodic ETA tick and siren pulse
  useEffect(() => {
    if (!emergencyModalOpen || !emergency.isActive) return;

    const timer = setInterval(() => {
      setPulseHazard((prev) => !prev);
    }, 800);

    return () => clearInterval(timer);
  }, [emergencyModalOpen, emergency.isActive]);

  if (!emergencyModalOpen && !emergency.isActive) return null;

  return (
    <div
      id="emergency-sos-dispatch-modal"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
    >
      <div className="w-full max-w-4xl bg-zinc-950 border-2 border-rose-600/80 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-rose-950/50 flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Header Alert Banner */}
        <div className="flex items-start justify-between gap-4 border-b border-rose-900/50 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-500 animate-pulse shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] uppercase font-black tracking-widest animate-pulse">
                  CRITICAL E-CALL ACTIVE
                </span>
                <span className="text-xs text-rose-400 font-mono">
                  {emergency.eCallSessionId || 'SESSION-DISPATCH-911'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Emergency SOS Vehicle State Engaged
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Automotive VHAL telemetry and high-precision satellite coordinates dispatched to local emergency services.
              </p>
            </div>
          </div>

          <button
            id="close-sos-dialog-btn"
            onClick={() => setEmergencyModalOpen(false)}
            title="Minimize SOS view (Emergency remains active)"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Dispatch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Geolocation Coordinates & Sector */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Live Geolocation
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded font-mono font-bold">
                GPS LOCK (±{emergency.coords.accuracyM || 4.2}m)
              </span>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-sm sm:text-base text-white font-bold">
                {emergency.coords.lat.toFixed(5)}° N, {Math.abs(emergency.coords.lng).toFixed(5)}° W
              </div>
              <div className="text-xs text-zinc-300">
                {emergency.coords.address}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono flex justify-between pt-2 border-t border-zinc-800">
                <span>Alt: {emergency.coords.altitudeM}m</span>
                <span>Heading: {emergency.coords.heading}°</span>
              </div>
            </div>
          </div>

          {/* Card 2: Dispatch Center & Units */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                Emergency Responders
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded font-mono font-bold">
                EN ROUTE
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-bold text-zinc-100">
                {emergency.nearestDispatchCenter.name}
              </div>
              <div className="text-xs text-zinc-400 flex items-center justify-between">
                <span>Station Contact:</span>
                <span className="font-mono text-blue-400 font-semibold">{emergency.nearestDispatchCenter.phone}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <span className="text-xs text-zinc-400">Estimated Response Time:</span>
                <span className="text-lg font-black font-mono text-rose-400">
                  ~{emergency.nearestDispatchCenter.etaMins} MINS
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: In-Cabin Audio Voice Channel */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                Cabin Audio Channel
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  emergency.audioChannelOpen
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40 animate-pulse'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {emergency.audioChannelOpen ? 'LIVE MIC OPEN' : 'MUTED'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-zinc-300">
                Hands-free direct audio connection to regional emergency dispatcher is currently active.
              </div>
              <button
                id="toggle-sos-mic-btn"
                onClick={toggleEmergencyAudio}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  emergency.audioChannelOpen
                    ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border-rose-700'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                }`}
              >
                {emergency.audioChannelOpen ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{emergency.audioChannelOpen ? 'Mute Cabin Mic' : 'Unmute Cabin Mic'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transmitted Vehicle Telemetry Data */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center justify-between">
            <span>Transmitted Incident Telemetry Snapshot</span>
            <span className="text-green-400 text-[10px] font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              TELEMETRY SYNCED (CAN BUS 8ms)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Driver Identity</span>
              <span className="font-medium text-white font-mono">{activeProfile.name}</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Vehicle Model</span>
              <span className="font-medium text-white font-mono truncate block">{vehicleConfig.chassisName}</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Battery & Power</span>
              <span className="font-medium text-blue-400 font-mono">{telemetry.batterySoC}% ({telemetry.rangeKm} km)</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Hazards / Flashers</span>
              <span className="font-medium text-amber-400 font-mono font-bold">
                {telemetry.lights.hazards ? 'FLASHING' : 'OFF'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="sos-toggle-hazards-btn"
              onClick={toggleHazards}
              className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                telemetry.lights.hazards
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-950/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{telemetry.lights.hazards ? 'Hazards Active (Flashing)' : 'Turn On Hazards'}</span>
            </button>

            <button
              id="sos-call-direct-btn"
              onClick={() => {
                automotiveAudio.playChime('voice_confirm');
                automotiveAudio.speak('Connecting driver directly to Emergency 911 dispatch hotline.');
              }}
              className="px-4 py-3 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 911 Direct</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              id="sos-cancel-emergency-btn"
              onClick={cancelEmergency}
              className="w-full sm:w-auto px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-rose-300 hover:text-rose-200 border border-rose-900/60 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel SOS (False Alarm)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
