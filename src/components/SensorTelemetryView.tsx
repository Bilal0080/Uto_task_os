import React from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import {
  ShieldCheck,
  Disc,
  AlertTriangle,
} from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const SensorTelemetryView: React.FC = () => {
  const { telemetry, toggleHazards } = useAutomotive();

  return (
    <div id="sensor-telemetry-view" className="h-full p-2 sm:p-4 grid grid-cols-12 gap-6 overflow-y-auto select-none">
      {/* 4-Wheel TPMS Tire Pressure Monitoring Matrix (6 Cols) */}
      <div className="col-span-12 lg:col-span-6 bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-semibold text-white">4-Wheel TPMS Sensor Matrix</h3>
          </div>
          <span className="text-xs font-mono text-green-500 font-bold bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
            NOMINAL
          </span>
        </div>

        {/* Chassis Tire Display Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          {/* Front Left */}
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-medium">
                Front Left
              </span>
              <span className="text-2xl font-light text-white font-mono">
                {telemetry.tirePressurePsi.frontLeft} <span className="text-xs text-zinc-400">PSI</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-blue-400 font-bold">
                {telemetry.tireTempC.frontLeft}°C
              </span>
              <span className="text-[10px] text-green-500 block">Optimal</span>
            </div>
          </div>

          {/* Front Right */}
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-medium">
                Front Right
              </span>
              <span className="text-2xl font-light text-white font-mono">
                {telemetry.tirePressurePsi.frontRight} <span className="text-xs text-zinc-400">PSI</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-blue-400 font-bold">
                {telemetry.tireTempC.frontRight}°C
              </span>
              <span className="text-[10px] text-green-500 block">Optimal</span>
            </div>
          </div>

          {/* Rear Left */}
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-medium">
                Rear Left
              </span>
              <span className="text-2xl font-light text-white font-mono">
                {telemetry.tirePressurePsi.rearLeft} <span className="text-xs text-zinc-400">PSI</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-blue-400 font-bold">
                {telemetry.tireTempC.rearLeft}°C
              </span>
              <span className="text-[10px] text-green-500 block">Optimal</span>
            </div>
          </div>

          {/* Rear Right */}
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-medium">
                Rear Right
              </span>
              <span className="text-2xl font-light text-white font-mono">
                {telemetry.tirePressurePsi.rearRight} <span className="text-xs text-zinc-400">PSI</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-blue-400 font-bold">
                {telemetry.tireTempC.rearRight}°C
              </span>
              <span className="text-[10px] text-green-500 block">Optimal</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Target Spec: 35.0 - 36.5 PSI</span>
          <span className="text-blue-400 font-mono">Sensors: 433 MHz Low-Latency</span>
        </div>
      </div>

      {/* ADAS Safety Sensors & Radar Health (6 Cols) */}
      <div className="col-span-12 lg:col-span-6 bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <h3 className="text-base font-semibold text-white">ADAS Perception Diagnostics</h3>
          </div>
          <span className="text-xs font-mono text-blue-400 font-bold">14 Nodes Active</span>
        </div>

        <div className="space-y-3 my-2">
          {[
            {
              name: 'Forward 77GHz mmWave Radar',
              status: 'Calibrated (0.02° tolerance)',
              latency: '4.2 ms response',
              state: 'Online',
            },
            {
              name: 'Roof Solid-State LiDAR 360°',
              status: '300,000 pts/sec streaming',
              latency: '8.0 ms loop',
              state: 'Online',
            },
            {
              name: '8x Optical HDR Camera Vision Ring',
              status: 'Clear lens & zero obstruction',
              latency: '60 FPS 8K',
              state: 'Online',
            },
            {
              name: 'Ultrasonic Proximity Ring (12x)',
              status: 'Active curb & blindspot guard',
              latency: '1.2 ms bus',
              state: 'Online',
            },
          ].map((s) => (
            <div
              key={s.name}
              className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-white block">{s.name}</span>
                <span className="text-zinc-400 font-mono text-[11px]">{s.status}</span>
              </div>
              <div className="text-right">
                <span className="text-green-500 font-bold block">{s.state}</span>
                <span className="text-[10px] text-blue-400 font-mono">{s.latency}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Hazard Flasher Safety Test Button */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
          <button
            id="test-hazard-lights-btn"
            onClick={toggleHazards}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              telemetry.lights.hazards
                ? 'bg-rose-600 text-white animate-pulse shadow-md'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{telemetry.lights.hazards ? 'Hazards Active' : 'Test Hazards'}</span>
          </button>

          <button
            onClick={() => {
              automotiveAudio.playChime('adas_alert');
              automotiveAudio.triggerHaptic('warning');
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-800 text-xs font-bold"
          >
            Test Haptic Pulse
          </button>
        </div>
      </div>

      {/* Powertrain Thermals & Air Quality (12 Cols) */}
      <div className="col-span-12 bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium block mb-1">
            Motor Thermal Core
          </span>
          <span className="text-2xl font-light text-white font-mono">{telemetry.motorTempC}°C</span>
          <span className="text-[11px] text-green-500 block mt-1">Coolant Loop Normal</span>
        </div>

        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium block mb-1">
            Inverter Efficiency
          </span>
          <span className="text-2xl font-light text-blue-400 font-mono">
            {telemetry.inverterTempC}°C (98.4%)
          </span>
          <span className="text-[11px] text-zinc-400 block mt-1">Silicon Carbide (SiC)</span>
        </div>

        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium block mb-1">
            Cabin Air Quality
          </span>
          <span className="text-2xl font-light text-green-500 font-mono">4 µg/m³ (PM2.5)</span>
          <span className="text-[11px] text-zinc-400 block mt-1">HEPA Filtration Active</span>
        </div>

        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium block mb-1">
            CAN Bus Packet Health
          </span>
          <span className="text-2xl font-light text-white font-mono">99.998%</span>
          <span className="text-[11px] text-green-500 block mt-1">0 Errors / 10k pkts</span>
        </div>
      </div>
    </div>
  );
};
