import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Play,
  Pause,
  Sliders,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface BackgroundAudioPlayerProps {
  trackUrl?: string;
  trackTitle?: string;
  defaultAutoplay?: boolean;
  defaultVolume?: number;
  triggerGesturePlay?: boolean;
  onAutoplayChange?: (enabled: boolean) => void;
}

export const BackgroundAudioPlayer: React.FC<BackgroundAudioPlayerProps> = ({
  trackUrl = '/audio/romantic-piano.mp3',
  trackTitle = 'Heartwarming · Romantic Piano',
  defaultAutoplay = true,
  defaultVolume = 0.45,
  triggerGesturePlay = false,
  onAutoplayChange,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  // Load autoplay preference from localStorage or default
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('elysian_bg_autoplay');
      if (stored !== null) return stored === 'true';
    } catch (_) {}
    return defaultAutoplay;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBlockedByPolicy, setIsBlockedByPolicy] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(defaultVolume);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isUsingSynthFallback, setIsUsingSynthFallback] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<'piano' | 'ambient'>('piano');

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowControls(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Audio Romantic Ambient Synthesizer Fallback
  const stopSynth = useCallback(() => {
    if (synthIntervalRef.current) {
      window.clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthCtxRef.current && synthCtxRef.current.state !== 'closed') {
      try {
        synthCtxRef.current.close();
      } catch (_) {}
      synthCtxRef.current = null;
    }
  }, []);

  const startSynth = useCallback(() => {
    stopSynth();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      synthCtxRef.current = ctx;

      // Romantic chord progressions (frequencies for gentle romantic chords: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4)
      const chordProgressions = [
        [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
        [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
        [174.61, 220.0, 261.63, 329.63, 349.23], // Fmaj7
        [196.0, 246.94, 293.66, 392.0, 440.0],   // Gsus4
      ];

      let chordIndex = 0;
      const playNextChord = () => {
        if (!synthCtxRef.current || synthCtxRef.current.state === 'closed') return;
        const now = ctx.currentTime;
        const notes = chordProgressions[chordIndex % chordProgressions.length];
        chordIndex++;

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          // Warm lowpass filter for gentle romantic tone
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800 + idx * 100, now);

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          // Slow romantic envelope: soft attack, long gentle release
          const noteVolume = (volume * 0.08) / notes.length;
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, noteVolume), now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + 5.0);
        });
      };

      playNextChord();
      synthIntervalRef.current = window.setInterval(playNextChord, 4600);
      setIsPlaying(true);
      setIsUsingSynthFallback(true);
      setIsBlockedByPolicy(false);
    } catch (err) {
      console.warn('Synth error:', err);
    }
  }, [stopSynth, volume]);

  // Smooth Volume Fade In / Out
  const fadeInAudio = useCallback((audio: HTMLAudioElement, targetVol: number) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    audio.volume = 0;
    const step = targetVol / 15;
    fadeIntervalRef.current = window.setInterval(() => {
      if (audio.volume + step >= targetVol) {
        audio.volume = targetVol;
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume += step;
      }
    }, 80);
  }, []);

  const fadeOutAndPause = useCallback((audio: HTMLAudioElement) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    const step = audio.volume / 10;
    fadeIntervalRef.current = window.setInterval(() => {
      if (audio.volume - step <= 0.02) {
        audio.volume = 0;
        audio.pause();
        setIsPlaying(false);
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume -= step;
      }
    }, 60);
  }, []);

  // Main Play function with browser autoplay policy handling
  const playAudio = useCallback(() => {
    if (activePreset === 'ambient') {
      startSynth();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsBlockedByPolicy(false);
          fadeInAudio(audio, isMuted ? 0 : volume);
        })
        .catch((err) => {
          // Modern browser autoplay policy caught
          console.info('Autoplay prevented by modern browser policy (waiting for user gesture)', err.name);
          setIsPlaying(false);
          setIsBlockedByPolicy(true);
        });
    }
  }, [activePreset, startSynth, fadeInAudio, isMuted, volume]);

  const pauseAudio = useCallback(() => {
    stopSynth();
    const audio = audioRef.current;
    if (audio) {
      fadeOutAndPause(audio);
    } else {
      setIsPlaying(false);
    }
  }, [stopSynth, fadeOutAndPause]);

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  // Toggle Autoplay Preference
  const handleToggleAutoplay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = !autoplayEnabled;
    setAutoplayEnabled(next);
    try {
      localStorage.setItem('elysian_bg_autoplay', String(next));
    } catch (_) {}
    if (onAutoplayChange) onAutoplayChange(next);

    // If turned on and currently paused, initiate playback
    if (next && !isPlaying) {
      playAudio();
    }
  };

  // Modern browser autoplay policy: Listen for first user gesture if blocked
  useEffect(() => {
    if (!autoplayEnabled) return;

    // Attempt initial autoplay
    playAudio();

    const handleFirstGesture = () => {
      if (autoplayEnabled && audioRef.current && audioRef.current.paused) {
        playAudio();
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    return cleanupListeners;
  }, [autoplayEnabled, playAudio]);

  // Handle external trigger (e.g. clicking "Begin Our Journey" button on WelcomeScreen)
  useEffect(() => {
    if (triggerGesturePlay && !isPlaying) {
      playAudio();
    }
  }, [triggerGesturePlay, isPlaying, playAudio]);

  // Volume slider update
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted) setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      audioRef.current.volume = volume;
    } else {
      setIsMuted(true);
      audioRef.current.volume = 0;
    }
  };

  // Handle audio error (fallback to Web Audio procedural synth)
  const handleAudioError = () => {
    console.warn('Audio element error, seamlessly falling back to romantic ambient synth');
    setIsUsingSynthFallback(true);
    if (autoplayEnabled || isPlaying) {
      startSynth();
    }
  };

  return (
    <div ref={containerRef} className="relative z-30 inline-block pointer-events-auto">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={trackUrl}
        preload="auto"
        loop
        onError={handleAudioError}
        className="hidden"
        aria-hidden="true"
      />

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={togglePlay}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-sans-modern shadow-lg ${
            isPlaying
              ? 'bg-[#d4af37]/15 border-[#d4af37]/60 text-[#fff7d6] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
              : isBlockedByPolicy
              ? 'bg-amber-500/20 border-amber-400/50 text-[#fff7d6] animate-pulse'
              : 'bg-black/50 border-white/10 text-white/50 hover:text-white hover:bg-black/70'
          }`}
          title={
            isBlockedByPolicy
              ? 'Click to start romantic background music'
              : isPlaying
              ? 'Click to pause music'
              : 'Click to play romantic music'
          }
        >
          {/* Animated Equalizer Waves or Muted Icon */}
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 px-0.5">
              <span className="w-0.5 bg-[#e2be67] rounded-full animate-[musicWave_1s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-[#e2be67] rounded-full animate-[musicWave_1.3s_ease-in-out_infinite_0.2s]" />
              <span className="w-0.5 bg-[#e2be67] rounded-full animate-[musicWave_0.8s_ease-in-out_infinite_0.4s]" />
            </div>
          ) : isBlockedByPolicy ? (
            <Sparkles className="w-3.5 h-3.5 text-[#e2be67]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-white/40" />
          )}

          <span className="hidden sm:inline text-[11px] font-medium tracking-wide">
            {isBlockedByPolicy
              ? 'Play Music ♫'
              : isPlaying
              ? 'Music On'
              : 'Music Off'}
          </span>
        </button>

        {/* Dedicated Quick Autoplay Toggle Button */}
        <button
          type="button"
          onClick={handleToggleAutoplay}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all text-[10px] font-sans-modern ${
            autoplayEnabled
              ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25'
              : 'bg-black/40 border-white/10 text-white/40 hover:text-white/70'
          }`}
          title={`Autoplay is ${autoplayEnabled ? 'ENABLED' : 'DISABLED'} (Click to toggle)`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              autoplayEnabled ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-white/30'
            }`}
          />
          <span className="font-mono uppercase tracking-wider text-[9px]">
            Autoplay: {autoplayEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Expand Options Arrow */}
        <button
          type="button"
          onClick={() => setShowControls((prev) => !prev)}
          className="p-1.5 rounded-full bg-black/40 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-colors"
          title="Audio settings and volume"
          aria-label="Audio controls"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${
              showControls ? 'rotate-180 text-[#e2be67]' : ''
            }`}
          />
        </button>
      </div>

      {/* Expanded Audio Settings Flyout */}
      {showControls && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl bg-[#12141d]/95 backdrop-blur-xl border border-[#d4af37]/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Track Info */}
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/35 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-[#e2be67]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-[#fff7d6] truncate font-sans-modern">
                  {trackTitle}
                </h4>
                <p className="text-[10px] text-white/50 flex items-center gap-1">
                  <span>Instrumental Soundtrack</span>
                  {isUsingSynthFallback && (
                    <span className="text-[#e2be67]">· Ambient Mode</span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/35 text-[#fff7d6] transition-all shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
          </div>

          {/* Autoplay Toggle Row */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
            <div>
              <div className="text-xs font-medium text-white/90 font-sans-modern">
                Autoplay on Open
              </div>
              <div className="text-[10px] text-white/50">
                Play softly when entering the site
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAutoplay}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${
                autoplayEnabled ? 'bg-[#d4af37]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform duration-200 ${
                  autoplayEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Volume Control */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-sans-modern text-white/70">
              <span className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="hover:text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-[#e2be67]" />
                  )}
                </button>
                <span>Volume</span>
              </span>
              <span className="font-mono text-[11px] text-[#e2be67]">
                {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
            />

            {/* Quick volume presets */}
            <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-sans-modern">
              {[
                { label: 'Whisper', val: 0.2 },
                { label: 'Gentle', val: 0.45 },
                { label: 'Normal', val: 0.75 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => handleVolumeChange(p.val)}
                  className={`py-1 rounded-lg border text-center transition-all ${
                    Math.abs(volume - p.val) < 0.05 && !isMuted
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#fff7d6]'
                      : 'bg-white/[0.02] border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Track Style Selection (Piano Serenade vs Ethereal Ambient) */}
          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
              Soundtrack Mode
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActivePreset('piano');
                  stopSynth();
                  setIsUsingSynthFallback(false);
                  if (audioRef.current) {
                    audioRef.current.play().catch(() => {});
                    setIsPlaying(true);
                  }
                }}
                className={`p-2 rounded-xl border text-left text-xs transition-all ${
                  activePreset === 'piano'
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#fff7d6]'
                    : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <div className="font-medium text-[11px]">Piano Serenade</div>
                <div className="text-[9px] text-white/40">Soft studio keys</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePreset('ambient');
                  if (audioRef.current) audioRef.current.pause();
                  startSynth();
                }}
                className={`p-2 rounded-xl border text-left text-xs transition-all ${
                  activePreset === 'ambient'
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#fff7d6]'
                    : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <div className="font-medium text-[11px]">Ethereal Chimes</div>
                <div className="text-[9px] text-white/40">Warm ambient synth</div>
              </button>
            </div>
          </div>

          {/* Policy Compliance Note */}
          <div className="text-[10px] text-white/40 italic leading-tight text-center pt-1 border-t border-white/5">
            Modern browser compliant · Audio smoothly fades in upon touch or click
          </div>
        </div>
      )}
    </div>
  );
};
