import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface AutoScrollReaderProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  speedFactor?: number; // 1 = very slow (~20px/s), 2 = gentle (~35px/s), 3 = standard (~50px/s)
  pauseText?: string;
  resumeText?: string;
  restartText?: string;
  speedText?: string;
  baseSpeed?: number; // Base speed in px/s (default 20 for reading, 48+ for photos)
  onProgressChange?: (progress: number) => void;
  children: React.ReactNode;
}

export const AutoScrollReader: React.FC<AutoScrollReaderProps> = ({
  containerRef,
  speedFactor = 2,
  pauseText = 'Pause Reading',
  resumeText = 'Resume Reading',
  restartText = 'Restart Scroll',
  speedText = 'Speed',
  baseSpeed = 20,
  onProgressChange,
  children,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(speedFactor);
  const lastScrollTopRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Speed mappings
  const speeds = [
    { label: 'Very Slow', value: 0.8 },
    { label: 'Gentle', value: 1.4 },
    { label: 'Normal', value: 2.2 },
  ];

  // Pause on user interaction (touch, wheel, manual drag)
  const handleUserTouchOrWheel = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      setUserInteracted(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = () => handleUserTouchOrWheel();
    const onTouchStart = () => handleUserTouchOrWheel();

    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
    };
  }, [containerRef, handleUserTouchOrWheel]);

  // Track scroll progress
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        const progress = Math.min(100, Math.max(0, (el.scrollTop / maxScroll) * 100));
        setScrollProgress(progress);
        if (onProgressChange) onProgressChange(progress);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [containerRef, onProgressChange]);

  // Auto-scroll loop
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 5) {
        // Pixels per second based on multiplier and base speed
        const pxPerSec = speedMultiplier * baseSpeed;
        const nextScroll = el.scrollTop + pxPerSec * delta;

        if (nextScroll >= maxScroll - 1) {
          el.scrollTop = maxScroll;
          setIsPlaying(false);
          return;
        }

        el.scrollTop = nextScroll;
        lastScrollTopRef.current = el.scrollTop;
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speedMultiplier, containerRef]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
    setUserInteracted(false);
  };

  const restartScroll = () => {
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
      setIsPlaying(true);
      setUserInteracted(false);
    }
  };

  const cycleSpeed = () => {
    if (speedMultiplier <= 1.0) {
      setSpeedMultiplier(1.6);
    } else if (speedMultiplier <= 1.8) {
      setSpeedMultiplier(2.4);
    } else {
      setSpeedMultiplier(0.8);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Subtle Progress Bar */}
      <div className="sticky top-0 left-0 right-0 h-[2px] bg-white/5 z-20">
        <div
          className="h-full bg-gradient-to-r from-[#d4af37]/60 to-[#f5dfa0] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Reader Controls */}
      <div className="sticky top-2 z-20 mx-auto px-3 py-1.5 rounded-full glass-panel-subtle flex items-center gap-3 text-xs text-[#e6ded0] shadow-lg mb-2">
        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d4af37]/15 hover:bg-[#d4af37]/30 text-[#fff7d6] transition-colors"
          title={isPlaying ? pauseText : resumeText}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#e2be67]" /> : <Play className="w-3.5 h-3.5 text-[#e2be67]" />}
          <span className="font-medium">{isPlaying ? pauseText : resumeText}</span>
        </button>

        <button
          onClick={restartScroll}
          className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          title={restartText}
        >
          <RotateCcw className="w-3 h-3 text-[#d4af37]" />
          <span className="hidden sm:inline">{restartText}</span>
        </button>

        <button
          onClick={cycleSpeed}
          className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          title={speedText}
        >
          <Sparkles className="w-3 h-3 text-[#d4af37]" />
          <span>
            {speedMultiplier <= 1.0 ? '0.8x' : speedMultiplier <= 1.8 ? '1.5x' : '2.2x'}
          </span>
        </button>

        {userInteracted && !isPlaying && (
          <span className="hidden md:inline text-[11px] text-white/50 italic border-l border-white/10 pl-2">
            Paused for touch · Tap resume anytime
          </span>
        )}
      </div>

      {/* Main Reading Flow Container */}
      <div className="relative flex-1 w-full">{children}</div>
    </div>
  );
};
