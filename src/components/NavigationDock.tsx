import React from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import {
  Gauge,
  CheckSquare,
  Navigation,
  Wrench,
  Activity,
  Fingerprint,
  Mic,
  Volume2,
  VolumeX,
  AlertTriangle,
  RadioTower,
} from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const NavigationDock: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    tasks,
    setVoiceModalOpen,
    emergency,
    triggerEmergency,
    setEmergencyModalOpen,
  } = useAutomotive();
  const [isMuted, setIsMuted] = React.useState(false);

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const criticalTasksCount = tasks.filter(
    (t) => t.status !== 'completed' && (t.priority === 'critical' || t.priority === 'high')
  ).length;

  const navItems = [
    {
      id: 'hud' as const,
      label: 'Cockpit',
      icon: Gauge,
      badge: null,
    },
    {
      id: 'tasks' as const,
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      criticalBadge: criticalTasksCount > 0,
    },
    {
      id: 'nav' as const,
      label: 'Offline GPS',
      icon: Navigation,
      badge: null,
    },
    {
      id: 'builder' as const,
      label: 'Car Builder',
      icon: Wrench,
      badge: 'AAOS',
    },
    {
      id: 'sensors' as const,
      label: 'Sensors',
      icon: Activity,
      badge: null,
    },
    {
      id: 'biometrics' as const,
      label: 'Driver/Cloud',
      icon: Fingerprint,
      badge: null,
    },
  ];

  const handleSosClick = () => {
    if (emergency.isActive) {
      setEmergencyModalOpen(true);
      automotiveAudio.playChime('button_tap');
    } else {
      triggerEmergency('manual_sos');
    }
  };

  return (
    <nav
      id="automotive-bottom-navigation-dock"
      className="flex justify-between items-center h-20 sm:h-24 mt-2 px-2 sm:px-4 select-none shrink-0 gap-2 sm:gap-3"
    >
      {/* Navigation Buttons Grid/Flex */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 overflow-x-auto pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => {
                automotiveAudio.playChime('button_tap');
                automotiveAudio.triggerHaptic('light');
                setCurrentView(item.id);
              }}
              className={`h-14 sm:h-16 px-3.5 sm:px-5 rounded-2xl flex items-center justify-center gap-2 border transition-all duration-200 active:scale-95 shadow-xl shrink-0 ${
                isActive
                  ? 'bg-zinc-800 text-white border-blue-500/80 shadow-blue-500/10 font-bold'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-blue-500' : 'text-zinc-400'
                }`}
              />
              <span className="text-xs sm:text-sm font-semibold tracking-tight">{item.label}</span>

              {/* Badges */}
              {item.badge && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : item.criticalBadge
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls: High-Visibility SOS Button, Audio Mute, and Voice Assistant */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* HIGH-VISIBILITY SOS EMERGENCY BUTTON */}
        <button
          id="dock-sos-emergency-btn"
          onClick={handleSosClick}
          title="Emergency E-Call SOS Dispatch"
          className={`h-14 sm:h-16 px-4 sm:px-5 rounded-2xl flex items-center justify-center gap-2 font-black text-xs sm:text-sm tracking-wider border-2 transition-all duration-150 active:scale-95 shadow-2xl ${
            emergency.isActive
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-white animate-pulse shadow-rose-900/80'
              : 'bg-rose-600/90 hover:bg-rose-500 text-white border-rose-400/80 shadow-rose-950/60 hover:shadow-rose-600/30'
          }`}
        >
          <AlertTriangle className={`w-5 h-5 ${emergency.isActive ? 'animate-bounce' : ''}`} />
          <div className="flex flex-col items-start text-left leading-none">
            <span className="text-[9px] uppercase font-mono tracking-widest text-rose-200">
              {emergency.isActive ? 'ACTIVE' : 'E-CALL'}
            </span>
            <span className="font-extrabold text-sm sm:text-base">SOS</span>
          </div>
        </button>

        {/* Audio Mute toggle */}
        <button
          id="audio-mute-toggle-btn"
          onClick={() => {
            const muted = automotiveAudio.toggleMute();
            setIsMuted(muted);
          }}
          title={isMuted ? 'Unmute Audio Chimes' : 'Mute Audio Chimes'}
          className="h-14 sm:h-16 w-12 sm:w-14 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center justify-center shadow-xl transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-zinc-300" />}
        </button>

        {/* Centerpiece Voice AI Assistant Trigger */}
        <button
          id="handsfree-voice-mic-main-btn"
          onClick={() => {
            automotiveAudio.playChime('voice_activate');
            setVoiceModalOpen(true);
          }}
          className="h-14 sm:h-16 px-4 sm:px-6 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center justify-center gap-2.5 border-2 border-zinc-900 shadow-2xl active:scale-95 transition-all text-white font-bold"
        >
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="hidden md:flex flex-col items-start leading-tight">
            <span className="text-[9px] uppercase tracking-wider text-blue-200 font-bold">Hands-Free</span>
            <span className="text-xs sm:text-sm font-extrabold tracking-tight">"Hey Auto"</span>
          </div>
        </button>
      </div>
    </nav>
  );
};

