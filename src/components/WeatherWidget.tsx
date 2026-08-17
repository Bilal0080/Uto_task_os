import React, { useState } from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Droplets,
  Gauge,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
} from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const WeatherWidget: React.FC = () => {
  const {
    weather,
    fetchRealWeather,
    toggleWeatherCondition,
  } = useAutomotive();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isCelsius, setIsCelsius] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Weather Icon Selection
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'partly_cloudy':
        return <CloudSun className="w-5 h-5 text-blue-400" />;
      case 'rainy':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'thunderstorm':
        return <CloudLightning className="w-5 h-5 text-indigo-400" />;
      case 'snow':
        return <CloudSnow className="w-5 h-5 text-cyan-300" />;
      case 'foggy':
        return <CloudFog className="w-5 h-5 text-zinc-400" />;
      default:
        return <CloudSun className="w-5 h-5 text-blue-400" />;
    }
  };

  const displayTemp = isCelsius
    ? `${Math.round(weather.tempC)}°C`
    : `${Math.round((weather.tempC * 9) / 5 + 32)}°F`;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    automotiveAudio.playChime('button_tap');
    await fetchRealWeather();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div
      id="cockpit-hud-weather-widget"
      className="bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl transition-all select-none overflow-hidden"
    >
      {/* Compact Glanceable Header Bar */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
        {/* Left: Weather Icon & Temperature */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => {
            setIsCelsius(!isCelsius);
            automotiveAudio.playChime('button_tap');
          }}
          title="Click to toggle °C / °F"
        >
          <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
                {displayTemp}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase">
                {weather.conditionText}
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 font-medium truncate max-w-[130px] flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 shrink-0 text-blue-500" />
              <span className="truncate">{weather.locationName || 'Live GPS Sector'}</span>
            </div>
          </div>
        </div>

        {/* Right: Grip Safety Badge & Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Road Grip Badge */}
          <div
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 ${
              weather.roadFriction.status.includes('Dry')
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : weather.roadFriction.status.includes('Wet')
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
            }`}
            title={`Surface Friction Coefficient μ=${weather.roadFriction.coefficient}`}
          >
            <Gauge className="w-3 h-3" />
            <span className="hidden sm:inline">GRIP</span>
            <span>μ={weather.roadFriction.coefficient}</span>
          </div>

          {/* Condition Cycler Simulator */}
          <button
            id="weather-cycle-simulator-btn"
            onClick={toggleWeatherCondition}
            title="Simulate Weather Condition (Cycle Sunny/Rain/Snow/Fog)"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </button>

          {/* Refresh via real Geolocation */}
          <button
            id="weather-gps-refresh-btn"
            onClick={handleRefresh}
            title="Fetch Real-Time Local Weather"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Expand / Collapse Button */}
          <button
            id="weather-toggle-expand-btn"
            onClick={() => {
              setIsExpanded(!isExpanded);
              automotiveAudio.playChime('button_tap');
            }}
            title="Toggle Extended Weather Metrics"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Forecast & Atmosphere Telemetry Drawer */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-800/80 bg-zinc-950/50 space-y-3 animate-in slide-in-from-top-2 duration-150">
          {/* Surface & Atmospheric Details */}
          <div className="grid grid-cols-3 gap-2 text-[11px] pt-2">
            <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 flex flex-col">
              <span className="text-zinc-500 uppercase text-[9px] font-bold flex items-center gap-1">
                <Wind className="w-3 h-3 text-blue-400" /> Wind
              </span>
              <span className="font-mono font-semibold text-zinc-200 mt-0.5">
                {weather.windSpeedKmh} km/h {weather.windDirection}
              </span>
            </div>

            <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 flex flex-col">
              <span className="text-zinc-500 uppercase text-[9px] font-bold flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" /> Humidity
              </span>
              <span className="font-mono font-semibold text-zinc-200 mt-0.5">
                {weather.humidityPct}%
              </span>
            </div>

            <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 flex flex-col">
              <span className="text-zinc-500 uppercase text-[9px] font-bold flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-indigo-400" /> Precip
              </span>
              <span className="font-mono font-semibold text-zinc-200 mt-0.5">
                {weather.precipitationChancePct}%
              </span>
            </div>
          </div>

          {/* Road Surface Friction Warning Bar */}
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  weather.roadFriction.status.includes('Dry')
                    ? 'bg-green-500'
                    : weather.roadFriction.status.includes('Wet')
                    ? 'bg-amber-500'
                    : 'bg-rose-500 animate-pulse'
                }`}
              />
              <span className="text-zinc-300 font-medium">Road Condition:</span>
            </div>
            <span
              className={`font-bold font-mono text-[11px] ${
                weather.roadFriction.status.includes('Dry')
                  ? 'text-green-400'
                  : weather.roadFriction.status.includes('Wet')
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {weather.roadFriction.status}
            </span>
          </div>

          {/* Next 3 Hours Forecast Pills */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Next Waypoint Forecast
            </div>
            <div className="grid grid-cols-3 gap-2">
              {weather.forecastHourly.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <span className="text-zinc-400 font-mono text-[10px]">{item.time}</span>
                  <div className="flex items-center gap-1">
                    {getWeatherIcon(item.condition)}
                    <span className="font-mono font-bold text-white text-[11px]">
                      {isCelsius ? `${item.tempC}°` : `${Math.round((item.tempC * 9) / 5 + 32)}°`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
