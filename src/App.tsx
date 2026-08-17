import React from 'react';
import { AutomotiveProvider, useAutomotive } from './context/AutomotiveContext';
import { TopStatusBar } from './components/TopStatusBar';
import { NavigationDock } from './components/NavigationDock';
import { CockpitHudView } from './components/CockpitHudView';
import { TaskManagementView } from './components/TaskManagementView';
import { OfflineNavView } from './components/OfflineNavView';
import { CarBuilderView } from './components/CarBuilderView';
import { SensorTelemetryView } from './components/SensorTelemetryView';
import { BiometricsBackupView } from './components/BiometricsBackupView';
import { VoiceAssistantOverlay } from './components/VoiceAssistantOverlay';
import { HudFullscreenModal } from './components/HudFullscreenModal';
import { EmergencySosModal } from './components/EmergencySosModal';

const AutomotiveCockpitMain: React.FC = () => {
  const { currentView, nightMode } = useAutomotive();

  return (
    <div
      id="automotive-os-cockpit-root"
      className="h-screen w-screen flex flex-col overflow-hidden font-sans select-none bg-[#0A0A0A] text-zinc-100 p-3 sm:p-5"
    >
      {/* Top Glanceable Automotive Status Bar */}
      <TopStatusBar />

      {/* Center Dynamic Dashboard Panel Area */}
      <main id="automotive-screen-viewport" className="flex-1 overflow-hidden relative">
        {currentView === 'hud' && <CockpitHudView />}
        {currentView === 'tasks' && <TaskManagementView />}
        {currentView === 'nav' && <OfflineNavView />}
        {currentView === 'builder' && <CarBuilderView />}
        {currentView === 'sensors' && <SensorTelemetryView />}
        {currentView === 'biometrics' && <BiometricsBackupView />}
      </main>

      {/* Bottom Automotive Tactile Navigation Dock */}
      <NavigationDock />

      {/* Global Modals: Hands-Free Voice Assistant, Emergency SOS & Fullscreen HUD */}
      <VoiceAssistantOverlay />
      <HudFullscreenModal />
      <EmergencySosModal />
    </div>
  );
};

export default function App() {
  return (
    <AutomotiveProvider>
      <AutomotiveCockpitMain />
    </AutomotiveProvider>
  );
}
