import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  TaskItem,
  TelemetryData,
  DriverProfile,
  VehicleConfig,
  PeerVehicle,
  CloudBackupItem,
  ChargingTelemetry,
  EmergencyState,
  WeatherState,
} from '../types';
import { automotiveAudio } from '../utils/audioHaptics';

const INITIAL_VEHICLE_CONFIG: VehicleConfig = {
  chassisName: 'Apex Cruiser Dual-Motor AWD',
  powertrain: 'Permanent Magnet Synchronous Dual-Motor',
  batteryKwh: 105,
  motorKw: 420,
  rangeKm: 520,
  aaosChipset: 'Qualcomm Snapdragon SA8295P (5nm Auto)',
  npuTops: 60,
  sensorSuite: {
    lidar: true,
    radar77Ghz: true,
    camerasCount: 8,
    ultrasonicSensors: 12,
  },
  biometrics: {
    faceScan: true,
    touchId: true,
  },
  firmwareVersion: 'AAOS-2026.4.12-PROD',
  vhalStatus: 'CONNECTED_CAN_BUS',
  lastUpdated: Date.now(),
};

const INITIAL_PROFILES: DriverProfile[] = [
  {
    id: 'dr-01',
    name: 'Alex Chen',
    role: 'Lead Transport Driver',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    biometricType: 'both',
    preferences: {
      tempTarget: 21.5,
      hudTheme: 'cyan',
      hapticIntensity: 'Medium',
      voiceFeedback: true,
      speedUnits: 'kmh',
      adasAlertSensitivity: 'High',
    },
    lastAuthenticated: Date.now(),
  },
  {
    id: 'dr-02',
    name: 'Maya Lin',
    role: 'Field Service Specialist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    biometricType: 'face_id',
    preferences: {
      tempTarget: 22.0,
      hudTheme: 'emerald',
      hapticIntensity: 'High',
      voiceFeedback: true,
      speedUnits: 'kmh',
      adasAlertSensitivity: 'Standard',
    },
  },
  {
    id: 'dr-03',
    name: 'Guest Driver',
    role: 'Valet / Temporary',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    biometricType: 'fingerprint',
    preferences: {
      tempTarget: 21.0,
      hudTheme: 'white',
      hapticIntensity: 'Medium',
      voiceFeedback: false,
      speedUnits: 'kmh',
      adasAlertSensitivity: 'Standard',
    },
  },
];

interface AutomotiveContextType {
  // Tasks & Fleet
  tasks: TaskItem[];
  peers: PeerVehicle[];
  activeTask: TaskItem | null;
  addTask: (task: Partial<TaskItem>) => Promise<TaskItem>;
  updateTask: (id: string, updates: Partial<TaskItem>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskChecklist: (taskId: string, checklistId: string) => void;
  setActiveTask: (task: TaskItem | null) => void;

  // Cloud Sync & Offline
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  isSyncing: boolean;
  syncWithCloud: () => Promise<void>;
  pendingOfflineCount: number;
  backups: CloudBackupItem[];
  createCloudBackup: () => Promise<void>;
  restoreCloudBackup: (backupId: string) => Promise<void>;

  // Telemetry & Vehicle Controls
  telemetry: TelemetryData;
  updateTelemetry: (updates: Partial<TelemetryData>) => void;
  setGear: (gear: 'P' | 'R' | 'N' | 'D') => void;
  setTargetTemp: (temp: number) => void;
  toggleCruiseControl: () => void;
  toggleHazards: () => void;
  toggleLights: () => void;
  vehicleConfig: VehicleConfig;
  updateVehicleConfig: (config: Partial<VehicleConfig>) => void;

  // EV Battery & Charging Telemetry
  charging: ChargingTelemetry;
  toggleCharging: (chargerType?: '350kW CCS2 Ultra-Fast' | '250kW Supercharger' | '11kW Level 2 AC') => void;
  setTargetSoc: (soc: number) => void;
  setPreconditioning: (active: boolean) => void;

  // SOS Emergency Management
  emergency: EmergencyState;
  triggerEmergency: (type?: 'manual_sos' | 'medical_sos' | 'breakdown' | 'security') => Promise<void>;
  cancelEmergency: () => void;
  emergencyModalOpen: boolean;
  setEmergencyModalOpen: (val: boolean) => void;
  toggleEmergencyAudio: () => void;

  // Real-Time Weather Overlay & Conditions
  weather: WeatherState;
  updateWeather: (updates: Partial<WeatherState>) => void;
  fetchRealWeather: () => Promise<void>;
  toggleWeatherCondition: () => void;

  // Profiles & Biometrics
  profiles: DriverProfile[];
  activeProfile: DriverProfile;
  authenticateProfile: (profileId: string) => void;
  updateActiveProfilePreferences: (prefs: Partial<DriverProfile['preferences']>) => void;

  // Navigation & Modes
  currentView: 'hud' | 'tasks' | 'nav' | 'builder' | 'sensors' | 'biometrics';
  setCurrentView: (view: 'hud' | 'tasks' | 'nav' | 'builder' | 'sensors' | 'biometrics') => void;
  hudFullscreen: boolean;
  setHudFullscreen: (val: boolean) => void;
  nightMode: boolean;
  setNightMode: (val: boolean) => void;

  // Voice Assistant
  voiceModalOpen: boolean;
  setVoiceModalOpen: (val: boolean) => void;
  processVoiceCommand: (transcript: string) => Promise<any>;
  lastVoiceFeedback: string | null;
}

const AutomotiveContext = createContext<AutomotiveContextType | null>(null);

const TASKS_STORAGE_KEY = 'autotask_os_tasks_v2';
const CONFIG_STORAGE_KEY = 'autotask_os_config_v2';
const PENDING_SYNC_KEY = 'autotask_os_pending_sync_v2';

export const AutomotiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tasks State with localStorage fallback
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [peers, setPeers] = useState<PeerVehicle[]>([]);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(() => {
    try {
      const pending = localStorage.getItem(PENDING_SYNC_KEY);
      return pending ? JSON.parse(pending).length : 0;
    } catch (e) {
      return 0;
    }
  });

  const [backups, setBackups] = useState<CloudBackupItem[]>([]);
  const [profiles] = useState<DriverProfile[]>(INITIAL_PROFILES);
  const [activeProfile, setActiveProfile] = useState<DriverProfile>(INITIAL_PROFILES[0]);

  // Vehicle Configuration (modifiable via Step-by-Step Builder)
  const [vehicleConfig, setVehicleConfig] = useState<VehicleConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_VEHICLE_CONFIG;
  });

  // UI Modes
  const [currentView, setCurrentView] = useState<'hud' | 'tasks' | 'nav' | 'builder' | 'sensors' | 'biometrics'>('hud');
  const [hudFullscreen, setHudFullscreen] = useState(false);
  const [nightMode, setNightMode] = useState(true); // Default to automotive dark cockpit for safety & contrast
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [lastVoiceFeedback, setLastVoiceFeedback] = useState<string | null>(null);

  // Live Vehicle Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speedKmh: 48,
    powerKw: 24.2,
    gear: 'D',
    batterySoC: 78,
    rangeKm: 342,
    cabinTempC: 21.5,
    targetTempC: 21.5,
    externalTempC: 18.0,
    tirePressurePsi: {
      frontLeft: 35.8,
      frontRight: 35.5,
      rearLeft: 36.2,
      rearRight: 36.0,
    },
    tireTempC: {
      frontLeft: 28.5,
      frontRight: 29.0,
      rearLeft: 28.0,
      rearRight: 28.2,
    },
    motorTempC: 54.2,
    inverterTempC: 48.0,
    adas: {
      laneKeepActive: true,
      blindSpotLeft: false,
      blindSpotRight: false,
      radarDistanceM: 42.5,
      speedLimitKmh: 65,
      emergencyBrakeReady: true,
    },
    lights: {
      headlights: true,
      highBeams: false,
      hazards: false,
    },
    isCruising: true,
    cruiseTargetKmh: 50,
  });

  // EV Battery & Charging Telemetry State
  const [charging, setCharging] = useState<ChargingTelemetry>({
    isPluggedIn: false,
    status: 'discharging',
    chargePowerKw: 0,
    chargingSpeedKmPerHour: 0,
    timeToTargetMins: 0,
    targetSoc: 85,
    chargerType: 'Disconnected',
    batteryHealthPct: 99.4,
    packVoltageV: 792,
    packTempC: 29.4,
  });

  // SOS Emergency State
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergency, setEmergency] = useState<EmergencyState>({
    isActive: false,
    status: 'idle',
    countdownSeconds: 5,
    incidentType: 'manual_sos',
    coords: {
      lat: 37.7749,
      lng: -122.4194,
      accuracyM: 4.8,
      altitudeM: 16.2,
      heading: 48,
      address: 'Market St & 8th St, San Francisco, CA (Emergency Sector 04)',
    },
    nearestDispatchCenter: {
      name: 'Regional Emergency Response & Highway Patrol Sector 4',
      phone: '+1 (800) 555-0911',
      distanceKm: 1.4,
      etaMins: 4,
      sectorId: 'SF-METRO-EMS-04',
    },
    telemetryTransmitted: false,
    audioChannelOpen: false,
  });

  // Real-Time Weather State
  const [weather, setWeather] = useState<WeatherState>({
    tempC: 18.5,
    condition: 'partly_cloudy',
    conditionText: 'Partly Cloudy',
    humidityPct: 58,
    windSpeedKmh: 14,
    windDirection: 'NW',
    precipitationChancePct: 12,
    uvIndex: 3,
    airQualityAqi: 24,
    roadFriction: {
      status: 'Dry - Optimal',
      coefficient: 0.88,
    },
    forecastHourly: [
      { time: '11:00', tempC: 19, condition: 'partly_cloudy', precipPct: 10 },
      { time: '12:00', tempC: 21, condition: 'sunny', precipPct: 5 },
      { time: '13:00', tempC: 22, condition: 'sunny', precipPct: 5 },
      { time: '14:00', tempC: 20, condition: 'cloudy', precipPct: 20 },
      { time: '15:00', tempC: 18, condition: 'rainy', precipPct: 65 },
    ],
    locationName: 'San Francisco Metro, CA',
  });

  // Real browser geolocation retrieval for weather and SOS
  const fetchRealWeather = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto`;
              const res = await fetch(url);
              if (res.ok) {
                const wData = await res.json();
                const cur = wData.current;
                const temp = Math.round(cur.temperature_2m * 10) / 10;
                const code = cur.weather_code;

                let condition: WeatherState['condition'] = 'sunny';
                let conditionText = 'Clear Skies';
                let frictionStatus: 'Dry - Optimal' | 'Wet - Caution' | 'Icy - Low Grip' = 'Dry - Optimal';
                let frictionCoeff = 0.88;

                if (code >= 51 && code <= 67) {
                  condition = 'rainy';
                  conditionText = 'Light Rain';
                  frictionStatus = 'Wet - Caution';
                  frictionCoeff = 0.62;
                } else if (code >= 71 && code <= 77) {
                  condition = 'snow';
                  conditionText = 'Snow & Frost';
                  frictionStatus = 'Icy - Low Grip';
                  frictionCoeff = 0.35;
                } else if (code >= 95) {
                  condition = 'thunderstorm';
                  conditionText = 'Thunderstorm';
                  frictionStatus = 'Wet - Caution';
                  frictionCoeff = 0.55;
                } else if (code >= 1 && code <= 3) {
                  condition = code === 3 ? 'cloudy' : 'partly_cloudy';
                  conditionText = code === 3 ? 'Overcast' : 'Partly Cloudy';
                } else if (code === 45 || code === 48) {
                  condition = 'foggy';
                  conditionText = 'Dense Fog';
                  frictionStatus = 'Wet - Caution';
                  frictionCoeff = 0.7;
                }

                setWeather({
                  tempC: temp,
                  condition,
                  conditionText,
                  humidityPct: Math.round(cur.relative_humidity_2m),
                  windSpeedKmh: Math.round(cur.wind_speed_10m),
                  windDirection: 'NW',
                  precipitationChancePct: condition === 'rainy' ? 75 : 12,
                  uvIndex: 4,
                  airQualityAqi: 22,
                  roadFriction: {
                    status: frictionStatus,
                    coefficient: frictionCoeff,
                  },
                  forecastHourly: [
                    { time: '+1h', tempC: temp + 1, condition: 'sunny', precipPct: 5 },
                    { time: '+2h', tempC: temp + 2, condition: 'partly_cloudy', precipPct: 15 },
                    { time: '+3h', tempC: temp + 1, condition: 'partly_cloudy', precipPct: 20 },
                  ],
                  locationName: `GPS Lat ${latitude.toFixed(2)}°, Lon ${longitude.toFixed(2)}°`,
                });

                setTelemetry((prev) => ({ ...prev, externalTempC: temp }));
              }
            } catch (err) {
              console.warn('Weather API fallback to onboard sensors');
            }
          },
          () => {},
          { timeout: 5000 }
        );
      }
    } catch (e) {}
  }, []);

  // Fetch initial tasks from backend
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        if (data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks);
          localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(data.tasks));
          if (!activeTask && data.tasks.length > 0) {
            setActiveTask(data.tasks[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, using local tasks cache');
    }
  }, [activeTask]);

  // Fetch fleet peers
  const fetchPeers = useCallback(async () => {
    try {
      const res = await fetch('/api/fleet/peers');
      if (res.ok) {
        const data = await res.json();
        setPeers(data.peers || []);
      }
    } catch (e) {}
  }, []);

  // Fetch backups
  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch('/api/backup/list');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchPeers();
    fetchBackups();
    fetchRealWeather();
  }, [fetchTasks, fetchPeers, fetchBackups, fetchRealWeather]);

  // Simulated live telemetry & EV Charging dynamics
  useEffect(() => {
    const timer = setInterval(() => {
      // If vehicle is actively charging
      if (charging.isPluggedIn && charging.status.startsWith('charging')) {
        setTelemetry((prev) => {
          const newBattery = Math.min(charging.targetSoc, Math.round((prev.batterySoC + 0.15) * 10) / 10);
          const maxRange = vehicleConfig.rangeKm || 520;
          const newRange = Math.round((newBattery / 100) * maxRange);
          return {
            ...prev,
            gear: 'P',
            speedKmh: 0,
            powerKw: -Math.abs(charging.chargePowerKw),
            batterySoC: newBattery,
            rangeKm: newRange,
          };
        });

        setCharging((prev) => {
          if (telemetry.batterySoC >= prev.targetSoc) {
            return {
              ...prev,
              status: 'plugged_full',
              chargePowerKw: 0,
              chargingSpeedKmPerHour: 0,
              timeToTargetMins: 0,
            };
          }
          const remainingPct = prev.targetSoc - telemetry.batterySoC;
          const minsRemaining = Math.max(1, Math.round(remainingPct / (prev.chargePowerKw > 100 ? 3.5 : 0.8)));
          return {
            ...prev,
            timeToTargetMins: minsRemaining,
            packTempC: Math.min(38, Math.round((prev.packTempC + 0.05) * 10) / 10),
          };
        });
        return;
      }

      setTelemetry((prev) => {
        if (prev.gear === 'P') {
          return {
            ...prev,
            speedKmh: 0,
            powerKw: 0.8,
            isCruising: false,
          };
        }

        // Slight realistic road speed variation around cruise target
        const speedDelta = prev.isCruising
          ? (Math.random() - 0.48) * 1.5
          : (Math.random() - 0.5) * 3;
        const newSpeed = Math.max(0, Math.min(130, Math.round((prev.speedKmh + speedDelta) * 10) / 10));

        // Radar distance fluctuates based on mock traffic ahead
        const radarDelta = (Math.random() - 0.5) * 2;
        const newRadar = Math.max(12, Math.min(85, Math.round((prev.adas.radarDistanceM + radarDelta) * 10) / 10));

        return {
          ...prev,
          speedKmh: newSpeed,
          powerKw: Math.round((newSpeed * 0.45 + 2.5 + (Math.random() - 0.5)) * 10) / 10,
          adas: {
            ...prev.adas,
            radarDistanceM: newRadar,
            blindSpotRight: newSpeed > 30 && Math.random() < 0.08,
            blindSpotLeft: newSpeed > 30 && Math.random() < 0.05,
          },
        };
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [charging.isPluggedIn, charging.status, charging.targetSoc, charging.chargePowerKw, telemetry.batterySoC, vehicleConfig.rangeKm]);

  // Periodic fleet sync simulation
  useEffect(() => {
    const peerTimer = setInterval(() => {
      if (!isOffline) {
        setPeers((prev) =>
          prev.map((p) => ({
            ...p,
            lastPing: Date.now(),
            battery: p.battery ? Math.max(10, p.battery - (Math.random() < 0.2 ? 1 : 0)) : 80,
          }))
        );
      }
    }, 8000);
    return () => clearInterval(peerTimer);
  }, [isOffline]);

  // EV Charging Control Methods
  const toggleCharging = (chargerType: '350kW CCS2 Ultra-Fast' | '250kW Supercharger' | '11kW Level 2 AC' = '350kW CCS2 Ultra-Fast') => {
    if (charging.isPluggedIn) {
      automotiveAudio.playChime('charger_disconnected');
      setCharging((prev) => ({
        ...prev,
        isPluggedIn: false,
        status: 'discharging',
        chargePowerKw: 0,
        chargingSpeedKmPerHour: 0,
        timeToTargetMins: 0,
        chargerType: 'Disconnected',
      }));
      if (activeProfile.preferences.voiceFeedback) {
        automotiveAudio.speak('Charge cable disconnected. Vehicle ready to drive.');
      }
    } else {
      automotiveAudio.playChime('charger_connected');
      const powerKw = chargerType.includes('350kW') ? 185 : chargerType.includes('250kW') ? 165 : 11;
      const speedKmH = chargerType.includes('350kW') ? 850 : chargerType.includes('250kW') ? 720 : 65;
      const remainingPct = Math.max(1, charging.targetSoc - telemetry.batterySoC);
      const mins = Math.max(2, Math.round(remainingPct / (powerKw > 100 ? 3.2 : 0.6)));

      setTelemetry((prev) => ({ ...prev, gear: 'P', speedKmh: 0 }));

      setCharging({
        isPluggedIn: true,
        status: powerKw > 50 ? 'charging_dc_fast' : 'charging_ac_level2',
        chargePowerKw: powerKw,
        chargingSpeedKmPerHour: speedKmH,
        timeToTargetMins: mins,
        targetSoc: charging.targetSoc,
        chargerType,
        batteryHealthPct: 99.4,
        packVoltageV: 792,
        packTempC: 31.2,
      });

      if (activeProfile.preferences.voiceFeedback) {
        automotiveAudio.speak(`Charging initiated on ${chargerType}. Estimated time to ${charging.targetSoc} percent is ${mins} minutes.`);
      }
    }
  };

  const setTargetSoc = (soc: number) => {
    const clamped = Math.max(50, Math.min(100, soc));
    setCharging((prev) => ({ ...prev, targetSoc: clamped }));
    automotiveAudio.playChime('button_tap');
  };

  const setPreconditioning = (active: boolean) => {
    automotiveAudio.playChime('voice_confirm');
    setCharging((prev) => ({
      ...prev,
      status: active ? 'preconditioning' : prev.isPluggedIn ? 'charging_dc_fast' : 'discharging',
    }));
    if (activeProfile.preferences.voiceFeedback) {
      automotiveAudio.speak(active ? 'High-voltage battery preconditioning active for rapid charging.' : 'Battery preconditioning off.');
    }
  };

  // SOS Emergency Trigger & Dispatch System
  const triggerEmergency = async (incidentType: EmergencyState['incidentType'] = 'manual_sos') => {
    automotiveAudio.playChime('sos_alarm');
    automotiveAudio.triggerHaptic('error');

    setTelemetry((prev) => ({
      ...prev,
      lights: { ...prev.lights, hazards: true },
    }));

    setEmergencyModalOpen(true);

    const sessionId = `ECALL-2026-${Date.now().toString(36).toUpperCase()}`;
    setEmergency((prev) => ({
      ...prev,
      isActive: true,
      status: 'dispatching',
      incidentType,
      triggeredAt: Date.now(),
      eCallSessionId: sessionId,
      audioChannelOpen: true,
    }));

    if (activeProfile.preferences.voiceFeedback) {
      automotiveAudio.speak('Emergency SOS initiated. Transmitting vehicle telemetry and high-precision GPS coordinates to Regional Emergency Dispatch.');
    }

    let liveLat = 37.7749;
    let liveLng = -122.4194;
    let liveAccuracy = 4.5;
    let liveAltitude = 16.0;
    let liveHeading = 48.0;
    let liveAddress = 'Market St & 8th St, San Francisco, CA (Emergency Sector 04)';

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              liveLat = pos.coords.latitude;
              liveLng = pos.coords.longitude;
              liveAccuracy = pos.coords.accuracy || 4.2;
              liveAltitude = pos.coords.altitude || 18.0;
              liveHeading = pos.coords.heading || 42.0;
              liveAddress = `GPS Lat: ${liveLat.toFixed(5)}°, Lon: ${liveLng.toFixed(5)}° (Live Satellite Lock)`;
              resolve();
            },
            () => resolve(),
            { timeout: 3000, enableHighAccuracy: true }
          );
        });
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/emergency/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentType,
          sessionId,
          coords: {
            lat: liveLat,
            lng: liveLng,
            accuracy: liveAccuracy,
            altitude: liveAltitude,
            address: liveAddress,
          },
          driver: {
            name: activeProfile.name,
            role: activeProfile.role,
          },
          vehicleConfig: {
            chassis: vehicleConfig.chassisName,
            firmware: vehicleConfig.firmwareVersion,
          },
          telemetry: {
            speed: telemetry.speedKmh,
            battery: telemetry.batterySoC,
            gear: telemetry.gear,
            tirePressure: telemetry.tirePressurePsi,
          },
          timestamp: Date.now(),
        }),
      });

      if (res.ok) {
        const dispatchData = await res.json();
        setEmergency({
          isActive: true,
          status: 'connected',
          countdownSeconds: 0,
          incidentType,
          triggeredAt: Date.now(),
          eCallSessionId: dispatchData.dispatchId || sessionId,
          coords: {
            lat: liveLat,
            lng: liveLng,
            accuracyM: liveAccuracy,
            altitudeM: liveAltitude,
            heading: liveHeading,
            address: liveAddress,
          },
          nearestDispatchCenter: {
            name: dispatchData.agency || 'Regional 911 / EMS Sector 04',
            phone: dispatchData.stationContact || '+1 (800) 555-0911',
            distanceKm: 1.2,
            etaMins: dispatchData.responderEtaMinutes || 4,
            sectorId: 'SF-METRO-EMS-04',
          },
          telemetryTransmitted: true,
          audioChannelOpen: true,
        });
      }
    } catch (e) {
      setEmergency((prev) => ({
        ...prev,
        status: 'connected',
        telemetryTransmitted: true,
        coords: {
          lat: liveLat,
          lng: liveLng,
          accuracyM: liveAccuracy,
          altitudeM: liveAltitude,
          heading: liveHeading,
          address: liveAddress,
        },
      }));
    }
  };

  const cancelEmergency = () => {
    automotiveAudio.playChime('voice_confirm');
    setEmergency((prev) => ({
      ...prev,
      isActive: false,
      status: 'cancelled',
      audioChannelOpen: false,
    }));
    setEmergencyModalOpen(false);

    setTelemetry((prev) => ({
      ...prev,
      lights: { ...prev.lights, hazards: false },
    }));

    if (activeProfile.preferences.voiceFeedback) {
      automotiveAudio.speak('Emergency SOS deactivated. Resuming nominal vehicle operation.');
    }
  };

  const toggleEmergencyAudio = () => {
    setEmergency((prev) => {
      const nextState = !prev.audioChannelOpen;
      automotiveAudio.playChime('button_tap');
      return { ...prev, audioChannelOpen: nextState };
    });
  };

  const toggleWeatherCondition = () => {
    const conditions: WeatherState['condition'][] = ['sunny', 'partly_cloudy', 'rainy', 'thunderstorm', 'snow', 'foggy'];
    const curIdx = conditions.indexOf(weather.condition);
    const nextCond = conditions[(curIdx + 1) % conditions.length];

    let text = 'Clear Skies';
    let temp = 22.0;
    let frictionStatus: WeatherState['roadFriction']['status'] = 'Dry - Optimal';
    let frictionCoeff = 0.88;
    let precip = 5;

    if (nextCond === 'partly_cloudy') {
      text = 'Partly Cloudy';
      temp = 19.5;
      precip = 15;
    } else if (nextCond === 'rainy') {
      text = 'Light Rain';
      temp = 16.0;
      frictionStatus = 'Wet - Caution';
      frictionCoeff = 0.62;
      precip = 80;
    } else if (nextCond === 'thunderstorm') {
      text = 'Severe Storm';
      temp = 14.5;
      frictionStatus = 'Wet - Caution';
      frictionCoeff = 0.55;
      precip = 95;
    } else if (nextCond === 'snow') {
      text = 'Snow & Sub-Zero Frost';
      temp = -1.5;
      frictionStatus = 'Icy - Low Grip';
      frictionCoeff = 0.32;
      precip = 70;
    } else if (nextCond === 'foggy') {
      text = 'Dense Mountain Fog';
      temp = 12.0;
      frictionStatus = 'Wet - Caution';
      frictionCoeff = 0.72;
      precip = 25;
    }

    automotiveAudio.playChime('button_tap');
    setWeather((prev) => ({
      ...prev,
      tempC: temp,
      condition: nextCond,
      conditionText: text,
      precipitationChancePct: precip,
      roadFriction: {
        status: frictionStatus,
        coefficient: frictionCoeff,
      },
    }));

    setTelemetry((prev) => ({ ...prev, externalTempC: temp }));
  };

  const updateWeather = (updates: Partial<WeatherState>) => {
    setWeather((prev) => ({ ...prev, ...updates }));
  };

  // Task Operations
  const addTask = async (taskData: Partial<TaskItem>): Promise<TaskItem> => {
    const newTask: TaskItem = {
      id: `tsk-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      title: taskData.title || 'New Road Task',
      category: taskData.category || 'fleet',
      priority: taskData.priority || 'standard',
      status: taskData.status || 'pending',
      location: taskData.location,
      assignedTo: taskData.assignedTo || `${activeProfile.name} (${activeProfile.role})`,
      createdBy: taskData.createdBy || 'In-Cabin Voice OS',
      notes: taskData.notes || '',
      checklist: taskData.checklist || [],
      updatedAt: Date.now(),
      createdAt: Date.now(),
      syncedWithCloud: !isOffline,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));

    if (!activeTask) {
      setActiveTask(newTask);
    }

    if (!isOffline) {
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
        });
      } catch (e) {
        queueOfflineTask(newTask);
      }
    } else {
      queueOfflineTask(newTask);
    }

    automotiveAudio.playChime('button_tap');
    return newTask;
  };

  const queueOfflineTask = (task: TaskItem) => {
    try {
      const saved = localStorage.getItem(PENDING_SYNC_KEY);
      const queue = saved ? JSON.parse(saved) : [];
      queue.push(task);
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
      setPendingOfflineCount(queue.length);
    } catch (e) {}
  };

  const updateTask = async (id: string, updates: Partial<TaskItem>) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const item = { ...t, ...updates, updatedAt: Date.now() };
        if (updates.status === 'completed' && t.status !== 'completed') {
          automotiveAudio.playChime('task_complete');
          if (activeProfile.preferences.voiceFeedback) {
            automotiveAudio.speak(`Task completed: ${t.title}`);
          }
        }
        return item;
      }
      return t;
    });

    setTasks(updated);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));

    if (activeTask && activeTask.id === id) {
      setActiveTask({ ...activeTask, ...updates, updatedAt: Date.now() });
    }

    if (!isOffline) {
      try {
        const target = updated.find((t) => t.id === id);
        await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target),
        });
      } catch (e) {
        const target = updated.find((t) => t.id === id);
        if (target) queueOfflineTask(target);
      }
    } else {
      const target = updated.find((t) => t.id === id);
      if (target) queueOfflineTask(target);
    }
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));

    if (activeTask && activeTask.id === id) {
      setActiveTask(updated[0] || null);
    }

    if (!isOffline) {
      try {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      } catch (e) {}
    }
    automotiveAudio.playChime('button_tap');
  };

  const toggleTaskChecklist = (taskId: string, checklistId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || !targetTask.checklist) return;

    const newChecklist = targetTask.checklist.map((c) =>
      c.id === checklistId ? { ...c, done: !c.done } : c
    );

    const allDone = newChecklist.every((c) => c.done);
    updateTask(taskId, {
      checklist: newChecklist,
      status: allDone ? 'completed' : 'in_progress',
    });
  };

  // Synchronize local changes with Cloud
  const syncWithCloud = async () => {
    setIsSyncing(true);
    try {
      const pendingStr = localStorage.getItem(PENDING_SYNC_KEY);
      const pendingList = pendingStr ? JSON.parse(pendingStr) : [];

      const res = await fetch('/api/tasks/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientTasks: tasks }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(data.tasks));
        localStorage.removeItem(PENDING_SYNC_KEY);
        setPendingOfflineCount(0);
        automotiveAudio.playChime('voice_confirm');
        if (activeProfile.preferences.voiceFeedback) {
          automotiveAudio.speak('Vehicle cloud synchronization complete.');
        }
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Cloud Backups
  const createCloudBackup = async () => {
    try {
      const snapshot = {
        vehicleConfig,
        driverPreferences: activeProfile.preferences,
        tasks,
      };
      const res = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: `${activeProfile.name} (${activeProfile.role})`,
          snapshot,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBackups((prev) => [data.backup, ...prev]);
        automotiveAudio.playChime('voice_confirm');
        if (activeProfile.preferences.voiceFeedback) {
          automotiveAudio.speak('Encrypted cloud backup snapshot stored securely.');
        }
      }
    } catch (e) {}
  };

  const restoreCloudBackup = async (backupId: string) => {
    const target = backups.find((b) => b.id === backupId);
    if (!target || !target.snapshot) return;

    if (target.snapshot.vehicleConfig) {
      setVehicleConfig(target.snapshot.vehicleConfig);
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(target.snapshot.vehicleConfig));
    }
    if (target.snapshot.tasks) {
      setTasks(target.snapshot.tasks);
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(target.snapshot.tasks));
    }
    automotiveAudio.playChime('voice_confirm');
    if (activeProfile.preferences.voiceFeedback) {
      automotiveAudio.speak('Backup settings and tasks restored to vehicle cockpit.');
    }
  };

  // Telemetry updates
  const updateTelemetry = (updates: Partial<TelemetryData>) => {
    setTelemetry((prev) => ({ ...prev, ...updates }));
  };

  const setGear = (gear: 'P' | 'R' | 'N' | 'D') => {
    automotiveAudio.playChime('button_tap');
    automotiveAudio.triggerHaptic('medium');
    setTelemetry((prev) => ({
      ...prev,
      gear,
      speedKmh: gear === 'P' ? 0 : prev.speedKmh,
    }));
  };

  const setTargetTemp = (temp: number) => {
    setTelemetry((prev) => ({
      ...prev,
      targetTempC: temp,
      cabinTempC: Math.round(((prev.cabinTempC + temp) / 2) * 10) / 10,
    }));
    automotiveAudio.playChime('button_tap');
  };

  const toggleCruiseControl = () => {
    automotiveAudio.playChime('button_tap');
    setTelemetry((prev) => ({
      ...prev,
      isCruising: !prev.isCruising,
      cruiseTargetKmh: !prev.isCruising ? Math.max(30, prev.speedKmh) : prev.cruiseTargetKmh,
    }));
  };

  const toggleHazards = () => {
    automotiveAudio.playChime('adas_alert');
    setTelemetry((prev) => ({
      ...prev,
      lights: {
        ...prev.lights,
        hazards: !prev.lights.hazards,
      },
    }));
  };

  const toggleLights = () => {
    automotiveAudio.playChime('button_tap');
    setTelemetry((prev) => ({
      ...prev,
      lights: {
        ...prev.lights,
        headlights: !prev.lights.headlights,
      },
    }));
  };

  const updateVehicleConfig = (updates: Partial<VehicleConfig>) => {
    const updated = {
      ...vehicleConfig,
      ...updates,
      lastUpdated: Date.now(),
    };
    setVehicleConfig(updated);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
    automotiveAudio.playChime('voice_confirm');
  };

  // Profile Biometric Authentication
  const authenticateProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;

    automotiveAudio.playChime('voice_confirm');
    automotiveAudio.triggerHaptic('success');
    const updatedProfile = { ...profile, lastAuthenticated: Date.now() };
    setActiveProfile(updatedProfile);

    // Apply driver preferences to vehicle
    setTelemetry((prev) => ({
      ...prev,
      targetTempC: profile.preferences.tempTarget,
    }));

    if (profile.preferences.voiceFeedback) {
      automotiveAudio.speak(`Driver profile verified. Welcome back, ${profile.name}.`);
    }
  };

  const updateActiveProfilePreferences = (prefs: Partial<DriverProfile['preferences']>) => {
    const updated = {
      ...activeProfile,
      preferences: {
        ...activeProfile.preferences,
        ...prefs,
      },
    };
    setActiveProfile(updated);
    automotiveAudio.playChime('button_tap');
  };

  // Voice AI Command Processing
  const processVoiceCommand = async (transcript: string) => {
    try {
      automotiveAudio.playChime('voice_confirm');
      const res = await fetch('/api/ai/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: transcript,
          currentContext: {
            speed: telemetry.speedKmh,
            gear: telemetry.gear,
            activeProfile: activeProfile.name,
            tasksCount: tasks.length,
            battery: telemetry.batterySoC,
          },
        }),
      });

      if (!res.ok) throw new Error('Voice command processing failed');
      const data = await res.json();
      const result = data.result;

      setLastVoiceFeedback(result.spokenResponse);

      // Execute structured automotive actions
      if (result.action === 'ADD_TASK' && result.taskData) {
        await addTask(result.taskData);
      } else if (result.action === 'COMPLETE_TASK') {
        const firstActive = tasks.find((t) => t.status !== 'completed');
        if (firstActive) {
          await updateTask(firstActive.id, { status: 'completed' });
        }
      } else if (result.action === 'NAVIGATE_TO') {
        setCurrentView('nav');
      } else if (result.action === 'SET_CLIMATE' && result.climateTemp) {
        setTargetTemp(result.climateTemp);
      } else if (result.action === 'SET_VEHICLE_MODE') {
        if (result.vehicleMode === 'HUD') setHudFullscreen(true);
        if (result.vehicleMode === 'Night') setNightMode(true);
      } else if (result.action === 'DIAGNOSTICS') {
        setCurrentView('sensors');
      }

      if (result.spokenResponse && activeProfile.preferences.voiceFeedback) {
        automotiveAudio.speak(result.spokenResponse);
      }

      return result;
    } catch (err) {
      const fallbackMsg = `Understood: "${transcript}". Executing in cockpit.`;
      setLastVoiceFeedback(fallbackMsg);
      if (activeProfile.preferences.voiceFeedback) {
        automotiveAudio.speak(fallbackMsg);
      }
      return { spokenResponse: fallbackMsg };
    }
  };

  return (
    <AutomotiveContext.Provider
      value={{
        tasks,
        peers,
        activeTask,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskChecklist,
        setActiveTask,
        isOffline,
        setIsOffline,
        isSyncing,
        syncWithCloud,
        pendingOfflineCount,
        backups,
        createCloudBackup,
        restoreCloudBackup,
        telemetry,
        updateTelemetry,
        setGear,
        setTargetTemp,
        toggleCruiseControl,
        toggleHazards,
        toggleLights,
        vehicleConfig,
        updateVehicleConfig,
        charging,
        toggleCharging,
        setTargetSoc,
        setPreconditioning,
        emergency,
        triggerEmergency,
        cancelEmergency,
        emergencyModalOpen,
        setEmergencyModalOpen,
        toggleEmergencyAudio,
        weather,
        updateWeather,
        fetchRealWeather,
        toggleWeatherCondition,
        profiles,
        activeProfile,
        authenticateProfile,
        updateActiveProfilePreferences,
        currentView,
        setCurrentView,
        hudFullscreen,
        setHudFullscreen,
        nightMode,
        setNightMode,
        voiceModalOpen,
        setVoiceModalOpen,
        processVoiceCommand,
        lastVoiceFeedback,
      }}
    >
      {children}
    </AutomotiveContext.Provider>
  );
};

export const useAutomotive = () => {
  const ctx = useContext(AutomotiveContext);
  if (!ctx) throw new Error('useAutomotive must be used within AutomotiveProvider');
  return ctx;
};
