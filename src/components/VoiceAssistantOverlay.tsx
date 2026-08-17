import React, { useState, useEffect, useRef } from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import { Mic, MicOff, X, Send } from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const VoiceAssistantOverlay: React.FC = () => {
  const { voiceModalOpen, setVoiceModalOpen, processVoiceCommand } = useAutomotive();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [spokenResult, setSpokenResult] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const quickCommands = [
    'Add task Deliver medical kit to BioDepot',
    'Navigate to Megawatt Supercharger Hub',
    'Complete active task',
    'Set climate to 21 degrees',
    'Check battery status and sensor telemetry',
  ];

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && voiceModalOpen) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = false;
          rec.interimResults = true;
          rec.lang = 'en-US';

          rec.onstart = () => {
            setIsListening(true);
          };

          rec.onresult = (event: any) => {
            let current = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              current += event.results[i][0].transcript;
            }
            setTranscript(current);
          };

          rec.onerror = () => {
            setIsListening(false);
          };

          rec.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = rec;
          rec.start();
        } catch (e) {}
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [voiceModalOpen]);

  if (!voiceModalOpen) return null;

  const handleToggleListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      try {
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
        automotiveAudio.playChime('voice_activate');
      } catch (e) {}
    }
  };

  const handleExecuteVoice = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    setIsProcessing(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const res = await processVoiceCommand(textToProcess);
    setIsProcessing(false);
    setSpokenResult(res.spokenResponse || 'Command processed.');

    setTimeout(() => {
      setVoiceModalOpen(false);
      setSpokenResult(null);
      setTranscript('');
      setManualText('');
    }, 2500);
  };

  return (
    <div
      id="voice-assistant-overlay-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 select-none"
    >
      <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 max-w-xl w-full shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        {/* Close button */}
        <button
          onClick={() => {
            automotiveAudio.stopSpeaking();
            setVoiceModalOpen(false);
          }}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-800 border border-zinc-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Mic Circle */}
        <div className="relative my-4">
          <button
            onClick={handleToggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
              isListening
                ? 'bg-blue-600 text-white shadow-blue-600/50 scale-105 animate-pulse'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {isListening ? (
              <Mic className="w-8 h-8" />
            ) : (
              <MicOff className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Status Text & Spoken Transcription */}
        <span className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase mb-2">
          {isProcessing
            ? 'Analyzing In-Cabin Intent...'
            : isListening
            ? 'Listening (Beamforming Mics Active)...'
            : 'Tap Microphone to Speak'}
        </span>

        {/* Current Spoken Transcript / Response */}
        <div className="w-full min-h-[70px] bg-zinc-950 rounded-2xl p-4 border border-zinc-800 my-3 flex items-center justify-center">
          {spokenResult ? (
            <p className="text-sm font-semibold text-green-500">
              {spokenResult}
            </p>
          ) : transcript ? (
            <p className="text-base font-medium text-white">"{transcript}"</p>
          ) : (
            <p className="text-xs text-zinc-500 italic">
              "Hey Auto, add task check tire pressure at station 4"
            </p>
          )}
        </div>

        {transcript && !spokenResult && (
          <button
            onClick={() => handleExecuteVoice(transcript)}
            className="mb-4 px-6 py-2 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md"
          >
            Execute Action
          </button>
        )}

        {/* Text Input Fallback */}
        <div className="w-full flex items-center gap-2 my-2">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecuteVoice(manualText);
            }}
            placeholder="Or type hands-free voice command..."
            className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleExecuteVoice(manualText)}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Voice Command Chips */}
        <div className="w-full pt-3 border-t border-zinc-800 mt-2">
          <span className="text-[11px] font-semibold text-zinc-500 block mb-2">
            Example Commands:
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleExecuteVoice(cmd)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-800 transition-colors"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
