import React, { useState, useEffect, useRef } from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Mic,
  ShieldCheck,
  Zap,
  BatteryCharging,
  BatteryMedium,
  Maximize2,
  AlertTriangle,
  Flame,
  ChevronDown,
  X,
  Gauge,
  Thermometer,
} from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const TopStatusBar: React.FC = () => {
  const {
    telemetry,
    activeProfile,
    isOffline,
    setIsOffline,
    isSyncing,
    syncWithCloud,
    pendingOfflineCount,
    setVoiceModalOpen,
    hudFullscreen,
    setHudFullscreen,
    charging,
    toggleCharging,
    setTargetSoc,
    setPreconditioning,
    emergency,
    setEmergencyModalOpen,
  } = useAutomotive();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [chargingDrawerOpen, setChargingDrawerOpen] = useState(false);
  const [useMiles, setUseMiles] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close charging popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setChargingDrawerOpen(false);
      }
    };
    if (chargingDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [chargingDrawerOpen]);

  const displayRange = useMiles
    ? `${Math.round(telemetry.rangeKm * 0.621371)} mi`
    : `${telemetry.rangeKm} km`;

  const isActivelyCharging = charging.isPluggedIn && charging.status.startsWith('charging');

  return (
    <header
      id="automotive-top-status-bar"
      className="flex justify-between items-center h-16 mb-4 px-3 sm:px-6 border-b border-zinc-800/50 bg-[#0A0A0A] select-none shrink-0 relative"
    >
      {/* Left: Branding & Cloud Sync Badge & Emergency Alert if active */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="text-xl sm:text-2xl font-bold tracking-tighter text-white">
          DRIVEOS <span className="text-blue-500">M-CORE</span>
        </div>

        {/* Cloud Sync Status Chip */}
        <button
          id="toggle-offline-mode-btn"
          onClick={() => {
            const next = !isOffline;
            setIsOffline(next);
            automotiveAudio.playChime('button_tap');
            if (!next && pendingOfflineCount > 0) {
              syncWithCloud();
            }
          }}
          className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700/80 rounded-full text-xs font-semibold text-zinc-300 transition-colors border border-zinc-700/50"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isOffline ? 'bg-amber-500' : 'bg-green-500'
            }`}
          />
          <span className="tracking-wider text-[11px] uppercase">
            {isOffline ? `OFFLINE (${pendingOfflineCount})` : 'CLOUD SYNCED'}
          </span>
        </button>

        {/* Sync Trigger */}
        <button
          id="manual-cloud-sync-btn"
          onClick={syncWithCloud}
          disabled={isSyncing}
          title="Force Cloud Re-sync"
          className="p-1.5 rounded-full bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
        </button>

        {/* High-Visibility Emergency SOS Active Pill in Header */}
        {emergency.isActive && (
          <button
            id="header-sos-active-alert-pill"
            onClick={() => setEmergencyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-black tracking-wider animate-pulse shadow-lg shadow-rose-900/50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SOS ACTIVE</span>
          </button>
        )}
      </div>

      {/* Center: PRND Gear & EV Battery Range & Charging Status Indicator */}
      <div className="flex items-center gap-3">
        {/* PRND */}
        <div className="hidden lg:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
          {(['P', 'R', 'N', 'D'] as const).map((gear) => {
            const isActive = telemetry.gear === gear;
            return (
              <span
                key={gear}
                className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-lg ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-500'
                }`}
              >
                {gear}
              </span>
            );
          })}
        </div>

        {/* ADAS Active Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-zinc-900/60 rounded-full border border-zinc-800 text-xs text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">ADAS Active</span>
        </div>

        {/* PRIMARY FEATURE: High-Visibility EV Battery Range & Charging Status Indicator */}
        <div className="relative" ref={popoverRef}>
          <button
            id="ev-battery-charging-indicator-btn"
            onClick={() => {
              setChargingDrawerOpen(!chargingDrawerOpen);
              automotiveAudio.playChime('button_tap');
            }}
            title="Click to view & manage EV charging telemetry"
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border transition-all duration-200 shadow-md ${
              isActivelyCharging
                ? 'bg-emerald-950/70 hover:bg-emerald-900/70 border-emerald-500/80 text-emerald-300 shadow-emerald-900/30'
                : telemetry.batterySoC <= 20
                ? 'bg-rose-950/60 hover:bg-rose-900/60 border-rose-500/60 text-rose-300'
                : 'bg-zinc-900/90 hover:bg-zinc-800/90 border-zinc-700 text-zinc-100'
            }`}
          >
            {/* Battery / Charging Icon & Glow */}
            <div className="relative flex items-center justify-center">
              {isActivelyCharging ? (
                <div className="relative flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400 animate-pulse fill-emerald-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                </div>
              ) : (
                <BatteryCharging
                  className={`w-4 h-4 ${
                    telemetry.batterySoC > 50
                      ? 'text-emerald-400'
                      : telemetry.batterySoC > 20
                      ? 'text-amber-400'
                      : 'text-rose-400 animate-pulse'
                  }`}
                />
              )}
            </div>

            {/* Battery SoC & Estimated Range */}
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-sm font-black tracking-tight text-white">
                {Math.round(telemetry.batterySoC)}%
              </span>
              <span className="text-xs text-zinc-400 font-semibold">
                • {displayRange}
              </span>
            </div>

            {/* Compact Charging Status Pill */}
            <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-zinc-700/60 text-[10px] font-bold uppercase tracking-wider">
              {isActivelyCharging ? (
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  +{charging.chargePowerKw}kW ({charging.timeToTargetMins}m)
                </span>
              ) : charging.isPluggedIn && charging.status === 'plugged_full' ? (
                <span className="text-blue-400">CHARGED</span>
              ) : (
                <span className="text-zinc-400">EV READY</span>
              )}
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </div>
          </button>

          {/* Interactive EV Energy & Charging Controls Popover */}
          {chargingDrawerOpen && (
            <div
              id="ev-charging-telemetry-popover"
              className="absolute top-12 left-1/2 -translate-x-1/2 w-84 sm:w-96 bg-zinc-950/95 border-2 border-zinc-800 rounded-3xl p-5 shadow-2xl shadow-black/80 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">EV Energy & Charging Hub</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">800V High-Voltage Battery Matrix</p>
                  </div>
                </div>
                <button
                  onClick={() => setChargingDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Real-Time Battery Overview Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Estimated Range</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-mono font-black text-white">{displayRange}</span>
                    <button
                      onClick={() => setUseMiles(!useMiles)}
                      className="text-[10px] font-bold text-blue-400 hover:underline font-mono"
                    >
                      {useMiles ? '→ KM' : '→ MI'}
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Charging Power</span>
                  <div className="flex items-baseline justify-between mt-1 font-mono">
                    <span className="text-xl font-black text-emerald-400">
                      {isActivelyCharging ? `${charging.chargePowerKw} kW` : '0 kW'}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {isActivelyCharging ? `+${charging.chargingSpeedKmPerHour} km/h` : 'Standby'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar towards Target Limit */}
              <div className="space-y-2 bg-zinc-900/50 p-3.5 rounded-2xl border border-zinc-800/80">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400">Current: <strong className="text-white">{Math.round(telemetry.batterySoC)}%</strong></span>
                  <span className="text-blue-400">Target Limit: <strong>{charging.targetSoc}%</strong></span>
                </div>

                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isActivelyCharging ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                    }`}
                    style={{ width: `${telemetry.batterySoC}%` }}
                  />
                  {/* Target line indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-md"
                    style={{ left: `${charging.targetSoc}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase pt-1">
                  <span>Daily (80%)</span>
                  <span>Trip (100%)</span>
                </div>

                {/* Target Limit Selector Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[70, 80, 90, 100].map((soc) => (
                    <button
                      key={soc}
                      onClick={() => setTargetSoc(soc)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        charging.targetSoc === soc
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {soc}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Charging Control Buttons */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Simulated EV Charging Port
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="plug-ccs2-fast-btn"
                    onClick={() => toggleCharging('350kW CCS2 Ultra-Fast')}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-start transition-all ${
                      charging.isPluggedIn && charging.chargerType.includes('350kW')
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">DC Ultra-Fast</span>
                    <span className="font-mono mt-0.5">350kW CCS2</span>
                  </button>

                  <button
                    id="plug-supercharger-btn"
                    onClick={() => toggleCharging('250kW Supercharger')}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-start transition-all ${
                      charging.isPluggedIn && charging.chargerType.includes('250kW')
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Supercharger</span>
                    <span className="font-mono mt-0.5">250kW NACS</span>
                  </button>
                </div>

                {/* Cable disconnect action if plugged */}
                {charging.isPluggedIn && (
                  <button
                    id="unplug-charger-btn"
                    onClick={() => toggleCharging()}
                    className="w-full py-2.5 bg-rose-950/80 hover:bg-rose-900/80 text-rose-200 border border-rose-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Unplug Charging Cable</span>
                  </button>
                )}
              </div>

              {/* Pack Telemetry Details */}
              <div className="pt-2 border-t border-zinc-900 grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-400">
                <div>Voltage: <strong className="text-white">{charging.packVoltageV}V</strong></div>
                <div>Temp: <strong className="text-white">{charging.packTempC}°C</strong></div>
                <div>Health: <strong className="text-green-400">{charging.batteryHealthPct}%</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Clock & Active Driver Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex flex-col items-end">
          <div className="text-lg sm:text-xl font-medium uppercase tracking-widest text-zinc-100">
            {currentTime || '10:45 AM'}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
            Clean Minimal Mode
          </div>
        </div>

        {/* Actions: Voice PTT, Fullscreen HUD */}
        <div className="flex items-center gap-2">
          <button
            id="voice-assistant-top-trigger"
            onClick={() => {
              automotiveAudio.playChime('voice_activate');
              setVoiceModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VOICE</span>
          </button>

          <button
            id="hud-fullscreen-btn"
            onClick={() => {
              setHudFullscreen(!hudFullscreen);
              automotiveAudio.playChime('button_tap');
            }}
            title="Toggle Distraction-Free HUD"
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Driver Profile */}
        <div
          id="active-driver-badge"
          className="flex items-center gap-3 pl-2"
        >
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
            <img
              src={activeProfile.avatar}
              alt={activeProfile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-sm font-semibold text-zinc-200 hidden sm:block">
            {activeProfile.name.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

