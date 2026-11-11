import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface ReadingProgressBarProps {
  progress: number; // 0 to 100
  title?: string;
  className?: string;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  progress,
  title = 'Reading Progress',
  className = '',
}) => {
  const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={`w-full max-w-2xl mx-auto flex flex-col gap-1.5 select-none ${className}`}>
      {/* Top micro-labels */}
      <div className="flex items-center justify-between text-[11px] font-sans-modern tracking-wider text-white/50">
        <span className="flex items-center gap-1 text-[#e2be67]/90 font-medium uppercase text-[10px] tracking-[0.2em]">
          <Sparkles className="w-3 h-3 text-[#d4af37]" />
          <span>{title}</span>
        </span>
        <span className="font-mono text-[#f7e7b4] text-[11px] tabular-nums font-medium">
          {roundedProgress}%
        </span>
      </div>

      {/* Thin, Elegant Progress Track */}
      <div className="relative w-full h-[3px] bg-white/[0.08] rounded-full overflow-visible shadow-inner">
        {/* Glow & Gradient Fill */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#deb35e] via-[#f7e7b4] to-[#e2be67] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(212,175,55,0.65)] relative"
          style={{ width: `${progress}%` }}
        >
          {/* Subtle glowing tip sparkle */}
          {progress > 1 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-[#fff7d6] shadow-[0_0_8px_#ffffff] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#d4af37]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
