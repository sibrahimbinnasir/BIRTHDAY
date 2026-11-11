import React from 'react';
import { ChevronLeft, ChevronRight, Home, Lock } from 'lucide-react';
import { SiteContent } from '../types/content';

interface NavigationControlsProps {
  currentSlide: number; // 0 = Welcome, 1 = Slide 1, 2 = Slide 2, 3 = Slide 3
  totalSlides: number; // 4 total (0, 1, 2, 3)
  content: SiteContent;
  onNext: () => void;
  onPrev: () => void;
  onGoToWelcome: () => void;
  onOpenEdit: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentSlide,
  totalSlides,
  content,
  onNext,
  onPrev,
  onGoToWelcome,
  onOpenEdit,
}) => {
  const { global } = content;

  // On welcome screen, controls are integrated into the welcome view
  if (currentSlide === 0) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 pb-4 pt-2 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Left Side: Return to Welcome / Previous Slide */}
        <div className="flex items-center gap-2">
          <button
            onClick={onGoToWelcome}
            className="p-2.5 rounded-full glass-panel-subtle hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10 hover:border-[#d4af37]/40 shadow-md"
            title="Return to Welcome"
            aria-label="Return to Welcome Screen"
          >
            <Home className="w-4 h-4 text-[#e2be67]" />
          </button>

          <button
            onClick={onPrev}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-panel hover:bg-white/10 text-sm font-sans-modern text-[#e2ded5] hover:text-white transition-all border border-[#d4af37]/20 hover:border-[#d4af37]/50 shadow-md"
            aria-label={global.prevButtonText}
          >
            <ChevronLeft className="w-4 h-4 text-[#d4af37]" />
            <span>{global.prevButtonText}</span>
          </button>
        </div>

        {/* Center: Minimalist ambient dot indicators (NO numbers or chapter titles) */}
        <div className="flex items-center gap-2 py-1.5 px-3 rounded-full glass-panel-subtle">
          {[1, 2, 3].map((slideIndex) => (
            <div
              key={slideIndex}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === slideIndex
                  ? 'w-6 h-1.5 bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.8)]'
                  : 'w-1.5 h-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Right Side: Next Slide & Discreet Edit Button */}
        <div className="flex items-center gap-2">
          {currentSlide < totalSlides - 1 ? (
            <button
              onClick={onNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#e2be67] to-[#deb35e] hover:from-[#eed07d] hover:to-[#e2be67] text-[#12141d] font-semibold text-sm font-sans-modern shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all"
              aria-label={global.nextButtonText}
            >
              <span>{global.nextButtonText}</span>
              <ChevronRight className="w-4 h-4 text-[#12141d]" />
            </button>
          ) : (
            <button
              onClick={onGoToWelcome}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-panel hover:bg-white/10 text-sm font-sans-modern text-[#f7e7b4] hover:text-white border border-[#d4af37]/40 shadow-md transition-all"
            >
              <span>Beginning</span>
              <ChevronRight className="w-4 h-4 text-[#d4af37]" />
            </button>
          )}

          {/* Discreet Edit button in footer as well */}
          <button
            onClick={onOpenEdit}
            className="p-2.5 rounded-full glass-panel-subtle hover:bg-white/10 text-white/40 hover:text-[#e2be67] transition-all border border-white/10"
            title={global.editButtonText}
            aria-label={global.editButtonText}
          >
            <Lock className="w-3.5 h-3.5 text-[#d4af37]/70" />
          </button>
        </div>
      </div>
    </footer>
  );
};
