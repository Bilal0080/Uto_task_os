import React, { useState } from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import { VehicleConfig } from '../types';
import {
  Wrench,
  Cpu,
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Eye,
  Mic,
  Layers,
} from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const CarBuilderView: React.FC = () => {
  const { vehicleConfig, updateVehicleConfig, activeProfile } = useAutomotive();

  const [currentStep, setCurrentStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  const [config, setConfig] = useState<VehicleConfig>(vehicleConfig);

  const steps = [
    { num: 1, title: 'Chassis & Powertrain', icon: Zap },
    { num: 2, title: 'AAOS Compute SoC', icon: Cpu },
    { num: 3, title: 'Sensor Suite & ADAS', icon: Eye },
    { num: 4, title: 'Voice & Biometrics', icon: Mic },
    { num: 5, title: 'Vehicle HAL & OS', icon: Layers },
    { num: 6, title: 'Deploy & Provision', icon: CheckCircle2 },
  ];

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      automotiveAudio.playChime('button_tap');
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      automotiveAudio.playChime('button_tap');
    }
  };

  const handleDeployToVehicle = () => {
    setIsDeploying(true);
    automotiveAudio.playChime('voice_activate');

    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      updateVehicleConfig(config);
      automotiveAudio.playChime('task_complete');
      if (activeProfile.preferences.voiceFeedback) {
        automotiveAudio.speak(
          `Android Automotive OS firmware flashed successfully. ${config.chassisName} is ready for mission.`
        );
      }
    }, 2000);
  };

  return (
    <div id="car-builder-step-view" className="h-full p-2 sm:p-4 flex flex-col space-y-4 overflow-hidden select-none">
      {/* Top Header & Step Progress Bar */}
      <div className="bg-zinc-900/50 p-5 rounded-3xl border border-zinc-800 shrink-0 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
              Vehicle Assembly & Provisioning
            </div>
            <h2 className="text-xl sm:text-2xl font-light text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              <span>Android Automotive OS Vehicle Workshop</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-blue-400 font-bold px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full">
              STEP {currentStep} OF 6
            </span>
          </div>
        </div>

        {/* Step Navigation Pill Stepper */}
        <div className="grid grid-cols-6 gap-2">
          {steps.map((step) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;

            return (
              <button
                key={step.num}
                onClick={() => {
                  setCurrentStep(step.num);
                  automotiveAudio.playChime('button_tap');
                }}
                className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md'
                    : isCompleted
                    ? 'bg-zinc-900 text-blue-400 border-zinc-800'
                    : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-zinc-950 text-blue-300'
                      : isCompleted
                      ? 'bg-zinc-800 text-blue-400'
                      : 'bg-zinc-800 text-zinc-600'
                  }`}
                >
                  {isCompleted ? '✓' : step.num}
                </div>
                <span className="text-xs truncate hidden md:inline">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-y-auto">
        {/* Left Side: Step Options Form */}
        <div className="col-span-12 lg:col-span-7 bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 shadow-xl flex flex-col justify-between">
          <div>
            {/* Step 1: Chassis & Powertrain */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Step 1: Chassis Platform & Powertrain</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Select the structural EV skateboard platform, battery pack chemistry, and electric drive units.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    {
                      name: 'Apex Dual-Motor AWD',
                      powertrain: 'Dual Permanent Magnet Synchronous',
                      battery: 105,
                      power: 420,
                      range: 520,
                    },
                    {
                      name: 'Apex Tri-Motor Performance',
                      powertrain: 'Triple Motor Vectoring Drive',
                      battery: 120,
                      power: 680,
                      range: 480,
                    },
                    {
                      name: 'Fleet Logistics Hauler',
                      powertrain: 'Heavy Duty Rear Axle Dual Drive',
                      battery: 140,
                      power: 360,
                      range: 610,
                    },
                    {
                      name: 'Urban Patrol Hybrid',
                      powertrain: 'Dual Motor + Range Extender Turbine',
                      battery: 75,
                      power: 280,
                      range: 750,
                    },
                  ].map((item) => {
                    const isSelected = config.chassisName === item.name;
                    return (
                      <div
                        key={item.name}
                        onClick={() => {
                          setConfig({
                            ...config,
                            chassisName: item.name,
                            powertrain: item.powertrain,
                            batteryKwh: item.battery,
                            motorKw: item.power,
                            rangeKm: item.range,
                          });
                          automotiveAudio.playChime('button_tap');
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500 shadow-md'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                          {isSelected && <span className="text-xs text-blue-400 font-bold">✓</span>}
                        </div>
                        <span className="text-[11px] text-zinc-400 block mb-2">{item.powertrain}</span>
                        <div className="flex justify-between text-[11px] font-mono text-zinc-300">
                          <span>{item.battery} kWh</span>
                          <span>{item.power} kW</span>
                          <span className="text-blue-400">{item.range} km Range</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: AAOS Compute SoC */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>Step 2: Automotive Compute Hardware & NPU</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Provision the digital cockpit System-on-Chip (SoC) for low-latency voice and ADAS telemetry.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    {
                      chipset: 'Qualcomm Snapdragon SA8295P (5nm Auto)',
                      npuTops: 60,
                      ram: '32GB LPDDR5X (Automotive Grade)',
                      latency: '8ms VHAL latency',
                    },
                    {
                      chipset: 'NVIDIA DRIVE Orin Auto-Cockpit SoC',
                      npuTops: 254,
                      ram: '64GB Unified Low-Latency ECC',
                      latency: '4ms Ultra-Fast ADAS loop',
                    },
                    {
                      chipset: 'Apex Quantum Automotive Core v4',
                      npuTops: 120,
                      ram: '32GB LPDDR5X + Dual DSP',
                      latency: '6ms Real-Time CAN interface',
                    },
                  ].map((c) => {
                    const isSelected = config.aaosChipset === c.chipset;
                    return (
                      <div
                        key={c.chipset}
                        onClick={() => {
                          setConfig({
                            ...config,
                            aaosChipset: c.chipset,
                            npuTops: c.npuTops,
                          });
                          automotiveAudio.playChime('button_tap');
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500 shadow-md'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-semibold text-white">{c.chipset}</h4>
                          <span className="font-mono text-xs text-green-500 font-bold">
                            {c.npuTops} TOPS NPU
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400 mt-2 font-mono">
                          <span>{c.ram}</span>
                          <span className="text-blue-400">{c.latency}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Sensor Array & ADAS */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Step 3: Sensor Array & ADAS Hardware</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure optical cameras, LiDAR, and mmWave radar sensors for full 360-degree driver safety.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div
                    onClick={() => {
                      setConfig({
                        ...config,
                        sensorSuite: {
                          ...config.sensorSuite,
                          lidar: !config.sensorSuite.lidar,
                        },
                      });
                      automotiveAudio.playChime('button_tap');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer ${
                      config.sensorSuite.lidar
                        ? 'bg-blue-600/10 border-blue-500'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm text-white">360° Solid-State LiDAR</span>
                      <span className="text-xs text-blue-400">
                        {config.sensorSuite.lidar ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 block mt-1">250m long-range 3D point cloud</span>
                  </div>

                  <div
                    onClick={() => {
                      setConfig({
                        ...config,
                        sensorSuite: {
                          ...config.sensorSuite,
                          radar77Ghz: !config.sensorSuite.radar77Ghz,
                        },
                      });
                      automotiveAudio.playChime('button_tap');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer ${
                      config.sensorSuite.radar77Ghz
                        ? 'bg-blue-600/10 border-blue-500'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm text-white">77GHz mmWave Radar</span>
                      <span className="text-xs text-blue-400">
                        {config.sensorSuite.radar77Ghz ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 block mt-1">All-weather penetration</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Voice & Biometrics */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-blue-400" />
                  <span>Step 4: In-Cabin Hands-Free Voice & Biometrics</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Calibrate beamforming microphone arrays, driver Face ID infrared scanners, and fingerprint start.
                </p>

                <div className="space-y-3 pt-2">
                  <div
                    onClick={() => {
                      setConfig({
                        ...config,
                        biometrics: { ...config.biometrics, faceScan: !config.biometrics.faceScan },
                      });
                      automotiveAudio.playChime('button_tap');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer ${
                      config.biometrics.faceScan
                        ? 'bg-blue-600/10 border-blue-500'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-white">Driver 3D IR Face ID Scanner</span>
                      <span className="text-xs text-blue-400 font-bold">
                        {config.biometrics.faceScan ? 'Active' : 'Off'}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 block mt-1">
                      Instant driver profile switching & seat/mirror personalization
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Android Automotive OS Stack */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Step 5: Android Automotive OS HAL & Middleware</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Verify vehicle bus protocols, real-time CAN communication, and cloud synchronization daemon.
                </p>

                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-zinc-300">
                    <span>VHAL Interface:</span>
                    <span className="text-green-500 font-bold">CONNECTED_CAN_BUS (1000 kbps)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Kernel Latency Target:</span>
                    <span className="text-blue-400 font-bold">&lt; 8ms deterministic loop</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Firmware Target:</span>
                    <span className="text-white">{config.firmwareVersion}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Deploy & Provision */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Step 6: Final Verification & Live Flash Deployment</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Review complete configuration and flash to the live cockpit instrument cluster.
                </p>

                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Platform:</span>
                    <span className="font-bold text-white">{config.chassisName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Compute:</span>
                    <span className="font-bold text-blue-400">{config.aaosChipset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">NPU TOPS:</span>
                    <span className="font-bold text-green-500">{config.npuTops} TOPS</span>
                  </div>
                </div>

                {deploySuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl text-green-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Vehicle successfully deployed! Changes active in cockpit.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stepper Bottom Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800 mt-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 6 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="flash-deploy-vehicle-btn"
                onClick={handleDeployToVehicle}
                disabled={isDeploying}
                className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isDeploying ? 'animate-spin' : ''}`} />
                <span>{isDeploying ? 'Flashing VHAL Firmware...' : 'Deploy to Live Cockpit'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Vehicle Wireframe Graphic */}
        <div className="col-span-12 lg:col-span-5 bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
              Vehicle Architecture Preview
            </span>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-600/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              AAOS 14.2 Core
            </span>
          </div>

          <div className="relative my-auto flex items-center justify-center p-4">
            <svg className="w-48 h-72" viewBox="0 0 160 260">
              <path
                d="M 30,50 C 30,20 130,20 130,50 L 140,190 C 140,240 20,240 20,190 Z"
                fill="#0A0A0A"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <polygon points="40,65 120,65 110,105 50,105" fill="#18181b" stroke="#27272a" />
              <polygon points="50,155 110,155 118,185 42,185" fill="#18181b" stroke="#27272a" />

              <rect x="12" y="55" width="14" height="34" rx="4" fill="#27272a" />
              <rect x="134" y="55" width="14" height="34" rx="4" fill="#27272a" />
              <rect x="12" y="165" width="14" height="34" rx="4" fill="#27272a" />
              <rect x="134" y="165" width="14" height="34" rx="4" fill="#27272a" />

              <rect
                x="38"
                y="110"
                width="84"
                height="42"
                rx="6"
                fill="#18181b"
                stroke="#22c55e"
                strokeWidth="1.5"
              />
              <text x="80" y="134" fill="#22c55e" fontSize="9" textAnchor="middle" fontFamily="monospace">
                {config.batteryKwh} kWh
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800 text-center font-mono">
            <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">EST RANGE</span>
              <span className="text-xs font-bold text-blue-400">{config.rangeKm} km</span>
            </div>
            <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">POWER</span>
              <span className="text-xs font-bold text-green-500">{config.motorKw} kW</span>
            </div>
            <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">AI TOPS</span>
              <span className="text-xs font-bold text-zinc-200">{config.npuTops}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
