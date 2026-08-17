export type TaskCategory = 'cargo' | 'fleet' | 'maintenance' | 'route' | 'personal' | 'safety';
export type TaskPriority = 'critical' | 'high' | 'standard' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskLocation {
  name: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  address?: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  location?: TaskLocation;
  assignedTo: string;
  createdBy: string;
  notes?: string;
  voiceNoteUrl?: string;
  checklist?: TaskChecklistItem[];
  updatedAt: number;
  createdAt: number;
  syncedWithCloud: boolean;
}

export interface DriverProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  biometricType: 'face_id' | 'fingerprint' | 'both';
  preferences: {
    tempTarget: number;
    hudTheme: 'cyan' | 'amber' | 'emerald' | 'white';
    hapticIntensity: 'High' | 'Medium' | 'Low' | 'Off';
    voiceFeedback: boolean;
    speedUnits: 'kmh' | 'mph';
    adasAlertSensitivity: 'High' | 'Standard' | 'Relaxed';
  };
  lastAuthenticated?: number;
}

export interface PeerVehicle {
  id: string;
  name: string;
  role: string;
  status: 'active_en_route' | 'standby_depot' | 'online' | 'charging';
  coords?: { lat: number; lng: number };
  battery?: number;
  currentTaskId?: string;
  lastPing: number;
}

export interface VehicleConfig {
  chassisName: string;
  powertrain: string;
  batteryKwh: number;
  motorKw: number;
  rangeKm: number;
  aaosChipset: string;
  npuTops: number;
  sensorSuite: {
    lidar: boolean;
    radar77Ghz: boolean;
    camerasCount: number;
    ultrasonicSensors: number;
  };
  biometrics: {
    faceScan: boolean;
    touchId: boolean;
  };
  firmwareVersion: string;
  vhalStatus: 'CONNECTED_CAN_BUS' | 'DIAGNOSTIC_MODE';
  lastUpdated: number;
}

export interface TelemetryData {
  speedKmh: number;
  powerKw: number;
  gear: 'P' | 'R' | 'N' | 'D';
  batterySoC: number;
  rangeKm: number;
  cabinTempC: number;
  targetTempC: number;
  externalTempC: number;
  tirePressurePsi: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  tireTempC: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  motorTempC: number;
  inverterTempC: number;
  adas: {
    laneKeepActive: boolean;
    blindSpotLeft: boolean;
    blindSpotRight: boolean;
    radarDistanceM: number;
    speedLimitKmh: number;
    emergencyBrakeReady: boolean;
  };
  lights: {
    headlights: boolean;
    highBeams: boolean;
    hazards: boolean;
  };
  isCruising: boolean;
  cruiseTargetKmh: number;
}

export interface ChargingTelemetry {
  isPluggedIn: boolean;
  status: 'discharging' | 'charging_dc_fast' | 'charging_ac_level2' | 'plugged_full' | 'preconditioning';
  chargePowerKw: number;
  chargingSpeedKmPerHour: number;
  timeToTargetMins: number;
  targetSoc: number;
  chargerType: '350kW CCS2 Ultra-Fast' | '250kW Supercharger' | '11kW Level 2 AC' | 'Disconnected';
  batteryHealthPct: number;
  packVoltageV: number;
  packTempC: number;
}

export interface EmergencyState {
  isActive: boolean;
  status: 'idle' | 'countdown' | 'dispatching' | 'connected' | 'cancelled';
  triggeredAt?: number;
  countdownSeconds: number;
  incidentType: 'manual_sos' | 'medical_sos' | 'breakdown' | 'security' | 'crash_detected';
  coords: {
    lat: number;
    lng: number;
    accuracyM: number;
    altitudeM: number;
    heading: number;
    address: string;
  };
  nearestDispatchCenter: {
    name: string;
    phone: string;
    distanceKm: number;
    etaMins: number;
    sectorId: string;
  };
  telemetryTransmitted: boolean;
  audioChannelOpen: boolean;
  eCallSessionId?: string;
}

export interface WeatherState {
  tempC: number;
  condition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'thunderstorm' | 'snow' | 'foggy';
  conditionText: string;
  humidityPct: number;
  windSpeedKmh: number;
  windDirection: string;
  precipitationChancePct: number;
  uvIndex: number;
  airQualityAqi: number;
  roadFriction: {
    status: 'Dry - Optimal' | 'Wet - Caution' | 'Icy - Low Grip';
    coefficient: number;
  };
  forecastHourly: {
    time: string;
    tempC: number;
    condition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'snow';
    precipPct: number;
  }[];
  locationName: string;
}

export interface CloudBackupItem {
  id: string;
  timestamp: number;
  profile: string;
  tasksCount: number;
  snapshot: {
    vehicleConfig?: VehicleConfig;
    driverPreferences?: any;
    tasks?: TaskItem[];
  };
}

export interface NavigationManeuver {
  id: string;
  instruction: string;
  distanceMeters: number;
  icon: 'turn-right' | 'turn-left' | 'straight' | 'merge' | 'roundabout' | 'arrive' | 'u-turn';
  streetName: string;
  laneInfo?: { lanes: ('straight' | 'left' | 'right')[]; activeIndex: number };
}

