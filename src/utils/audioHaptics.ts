/**
 * Automotive Sound Synthesizer, Speech Engine & Haptic Feedback Manager
 * Designed for low-latency in-cabin driver assistance
 */

class AutomotiveAudioHapticsManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Trigger physical haptic feedback on supported touchscreens / mobile devices
   * with duration patterns.
   */
  triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        switch (type) {
          case 'light':
            navigator.vibrate(25);
            break;
          case 'medium':
            navigator.vibrate(50);
            break;
          case 'heavy':
            navigator.vibrate(100);
            break;
          case 'success':
            navigator.vibrate([30, 40, 60]);
            break;
          case 'warning':
            navigator.vibrate([60, 50, 60]);
            break;
          case 'error':
            navigator.vibrate([100, 50, 100, 50, 120]);
            break;
        }
      } catch (e) {
        // Ignore vibration errors if blocked by browser policy
      }
    }
  }

  /**
   * Play high-fidelity automotive tone synthesized via Web Audio API
   */
  playChime(
    type:
      | 'voice_activate'
      | 'voice_confirm'
      | 'task_complete'
      | 'nav_turn'
      | 'adas_alert'
      | 'button_tap'
      | 'sos_alarm'
      | 'charger_connected'
      | 'charger_disconnected'
  ) {
    if (this.isMuted) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      switch (type) {
        case 'sos_alarm': {
          // Urgent automotive two-tone European/US E-Call SOS warble
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.setValueAtTime(960, now + 0.12);
          osc.frequency.setValueAtTime(800, now + 0.24);
          osc.frequency.setValueAtTime(960, now + 0.36);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          this.triggerHaptic('error');
          break;
        }
        case 'charger_connected': {
          // High-voltage EV Contactor Clunk + Rising Harmonic Charging Whir
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          this.triggerHaptic('success');
          break;
        }
        case 'charger_disconnected': {
          // EV Charge Port Disconnect tone
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(260, now + 0.2);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          this.triggerHaptic('medium');
          break;
        }
        case 'voice_activate': {
          // Dual ascending chime (440Hz -> 880Hz)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          this.triggerHaptic('light');
          break;
        }
        case 'voice_confirm': {
          // Warm harmonic chime
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(659.25, now); // E5
          osc.frequency.setValueAtTime(880, now + 0.08); // A5
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          this.triggerHaptic('success');
          break;
        }
        case 'task_complete': {
          // Success triad chime (C5 -> E5 -> G5)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.07);
          osc.frequency.setValueAtTime(783.99, now + 0.15);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.45);
          this.triggerHaptic('success');
          break;
        }
        case 'nav_turn': {
          // Low-frequency automotive navigation prompt
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(587.33, now + 0.1);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          this.triggerHaptic('medium');
          break;
        }
        case 'adas_alert': {
          // Rapid warning pulse
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(950, now);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          this.triggerHaptic('warning');
          break;
        }
        case 'button_tap': {
          // Subtle cockpit click
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
          this.triggerHaptic('light');
          break;
        }
      }
    } catch (e) {
      // Audio context error fallback
    }
  }

  /**
   * Speak response using Web Speech Synthesis (In-Vehicle Vocal Driver Guidance)
   */
  speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any lingering utterances
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) => (v.lang.startsWith('en') && v.name.includes('Natural')) || v.name.includes('Google') || v.name.includes('Siri')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (onEnd) onEnd();
    }
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const automotiveAudio = new AutomotiveAudioHapticsManager();
