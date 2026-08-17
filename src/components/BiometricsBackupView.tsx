import React, { useState } from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import { DriverProfile } from '../types';
import {
  Fingerprint,
  Camera,
  Cloud,
  Download,
  Upload,
} from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const BiometricsBackupView: React.FC = () => {
  const {
    profiles,
    activeProfile,
    authenticateProfile,
    updateActiveProfilePreferences,
    backups,
    createCloudBackup,
    restoreCloudBackup,
    isSyncing,
    syncWithCloud,
    pendingOfflineCount,
  } = useAutomotive();

  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'face' | 'fingerprint' | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleSimulateScan = (profile: DriverProfile, type: 'face' | 'fingerprint') => {
    setIsScanning(true);
    setScanType(type);
    automotiveAudio.playChime('voice_activate');

    setTimeout(() => {
      setIsScanning(false);
      authenticateProfile(profile.id);
    }, 1800);
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    await createCloudBackup();
    setIsBackingUp(false);
  };

  return (
    <div id="biometrics-backup-view" className="h-full p-2 sm:p-4 grid grid-cols-12 gap-6 overflow-y-auto select-none">
      {/* Left Column (6 Cols): Biometric Driver Authentication */}
      <div className="col-span-12 lg:col-span-6 bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-semibold text-white">Biometric Driver Profiles</h3>
            </div>
            <span className="text-xs font-mono text-green-500 font-bold bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
              AUTHENTICATED
            </span>
          </div>

          <p className="text-xs text-zinc-400 mb-4">
            Face ID infrared scanning & steering wheel touch authentication automatically loads driver seating and cloud backups.
          </p>

          {/* Profile Cards */}
          <div className="space-y-3 mb-4">
            {profiles.map((p) => {
              const isActive = activeProfile.id === p.id;
              return (
                <div
                  key={p.id}
                  id={`driver-profile-card-${p.id}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-blue-600/10 border-blue-500 shadow-lg'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-blue-500"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>{p.name}</span>
                          {isActive && (
                            <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-zinc-400">{p.role}</span>
                      </div>
                    </div>

                    {/* Scan Trigger Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-scan-face-${p.id}`}
                        onClick={() => handleSimulateScan(p, 'face')}
                        disabled={isScanning}
                        title="Authenticate via 3D Face ID"
                        className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-blue-400 border border-zinc-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="text-[11px] hidden sm:inline">Face ID</span>
                      </button>

                      <button
                        id={`btn-scan-touch-${p.id}`}
                        onClick={() => handleSimulateScan(p, 'fingerprint')}
                        disabled={isScanning}
                        title="Authenticate via TouchID"
                        className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-green-400 border border-zinc-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Fingerprint className="w-4 h-4" />
                        <span className="text-[11px] hidden sm:inline">TouchID</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Biometric Scanning Animation Box */}
          {isScanning && (
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {scanType === 'face' ? <Camera className="w-5 h-5" /> : <Fingerprint className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {scanType === 'face' ? 'Scanning 3D Driver Face Mesh...' : 'Verifying Capacitive Biometrics...'}
                </span>
                <span className="text-[11px] text-blue-400 font-mono">Infrared Auto-Camera active</span>
              </div>
            </div>
          )}
        </div>

        {/* Preferences Toggle */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-400">Vocal Driver Speech Feedback:</span>
          <button
            onClick={() => {
              updateActiveProfilePreferences({
                voiceFeedback: !activeProfile.preferences.voiceFeedback,
              });
            }}
            className={`px-3 py-1 rounded-full font-bold text-xs transition-colors ${
              activeProfile.preferences.voiceFeedback
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {activeProfile.preferences.voiceFeedback ? 'Enabled' : 'Muted'}
          </button>
        </div>
      </div>

      {/* Right Column (6 Cols): Cloud Synchronization & Encrypted Backups */}
      <div className="col-span-12 lg:col-span-6 bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-semibold text-white">Cloud Backup & Synchronization</h3>
            </div>
            <button
              id="cloud-backup-create-btn"
              onClick={handleCreateBackup}
              disabled={isBackingUp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Upload className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-bounce' : ''}`} />
              <span>{isBackingUp ? 'Backing Up...' : 'Create Snapshot'}</span>
            </button>
          </div>

          <p className="text-xs text-zinc-400 mb-4">
            Encrypted cloud synchronization stores mission tasks, vehicle HAL configuration, and personalization settings.
          </p>

          {/* Sync Stats Box */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                Cloud Sync Health
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-green-500">24 ms Ping</span>
                <span className="text-[10px] text-blue-400 font-mono">5G Connected</span>
              </div>
            </div>

            <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                Offline Mutation Queue
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-zinc-200">
                  {pendingOfflineCount} Items
                </span>
                <button
                  onClick={syncWithCloud}
                  disabled={isSyncing}
                  className="text-[10px] font-bold text-blue-400 hover:underline"
                >
                  Force Sync
                </button>
              </div>
            </div>
          </div>

          {/* Backups List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Available Cloud Snapshots ({backups.length}):
            </span>
            {backups.map((b) => (
              <div
                key={b.id}
                className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-semibold text-white">{b.profile}</h5>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {new Date(b.timestamp).toLocaleDateString()} • {b.tasksCount} Tasks
                  </span>
                </div>
                <button
                  onClick={() => restoreCloudBackup(b.id)}
                  className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-[11px] flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Encryption: AES-256 GCM</span>
          <span className="text-green-500 font-mono">Verified Zero-Loss</span>
        </div>
      </div>
    </div>
  );
};
