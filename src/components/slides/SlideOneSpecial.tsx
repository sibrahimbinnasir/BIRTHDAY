import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SiteContent } from '../../types/content';
import { AutoScrollReader } from '../AutoScrollReader';
import { ReadingProgressBar } from '../ReadingProgressBar';
import { TiltCard } from '../TiltCard';
import { Heart, Quote } from 'lucide-react';

interface SlideOneSpecialProps {
  content: SiteContent;
}

export const SlideOneSpecial: React.FC<SlideOneSpecialProps> = ({ content }) => {
  const { slideOne, global } = content;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] flex flex-col items-center justify-start max-w-4xl mx-auto px-4 sm:px-6 z-10">
      {/* Slide Heading & Subheading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full text-center mb-3 shrink-0"
      >
        <span className="font-sans-modern text-xs tracking-[0.25em] uppercase text-[#e2be67] font-medium">
          {slideOne.subheading}
        </span>
        <h2 className="font-cormorant text-4xl sm:text-5xl md:text-6xl font-light text-[#f7f5f0] mt-1.5 mb-2 leading-tight">
          {slideOne.heading}
        </h2>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent mx-auto mb-3" />

        {/* Thin, elegant progress bar visualizing reading scroll */}
        <ReadingProgressBar
          progress={scrollProgress}
          title="Message Progress"
          className="max-w-xl"
        />
      </motion.div>

      {/* Auto-Scroll Reading Card with 3D Tilt Frame */}
      <div className="w-full flex-1 min-h-0 relative flex flex-col">
        <TiltCard
          maxTilt={3}
          scale={1.005}
          className="w-full h-full rounded-2xl glass-panel p-4 sm:p-8 md:p-10 flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
        >
          <AutoScrollReader
            containerRef={scrollContainerRef}
            speedFactor={slideOne.autoScrollSpeed || 2}
            pauseText={global.pauseScrollText}
            resumeText={global.resumeScrollText}
            restartText={global.restartScrollText}
            speedText={global.speedScrollText}
            onProgressChange={setScrollProgress}
          >
            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              tabIndex={0}
              aria-label="Scrollable message content"
              className="w-full h-[calc(100vh-320px)] md:h-[calc(100vh-340px)] overflow-y-auto pr-3 md:pr-6 space-y-8 focus:outline-none"
            >
              {/* Optional Highlight Quote */}
              {slideOne.quoteHighlight && (
                <div className="relative my-4 p-6 rounded-xl bg-[#d4af37]/[0.06] border border-[#d4af37]/20 text-center">
                  <Quote className="w-6 h-6 text-[#d4af37]/60 mx-auto mb-2 rotate-180" />
                  <p className="font-cormorant italic text-xl md:text-2xl text-[#f7e7b4] leading-relaxed">
                    "{slideOne.quoteHighlight}"
                  </p>
                </div>
              )}

              {/* Multi-Paragraph Reading Experience */}
              <div className="space-y-6 text-base sm:text-lg md:text-xl font-sans-modern font-light text-[#e2ded5] leading-relaxed">
                {slideOne.paragraphs && slideOne.paragraphs.length > 0 ? (
                  slideOne.paragraphs.map((p, idx) => (
                    <p
                      key={idx}
                      className={idx === 0 ? 'drop-cap first-letter:font-cormorant' : ''}
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="italic text-white/50">
                    [Personal message will appear here. Open Edit Website to write why she is so special.]
                  </p>
                )}
              </div>

              {/* Closing Gentle Sign-off */}
              {slideOne.closingNote && (
                <div className="pt-8 pb-12 text-center border-t border-white/10 flex flex-col items-center gap-2">
                  <Heart className="w-4 h-4 text-[#d4af37]/70" />
                  <p className="font-cormorant italic text-xl text-[#f7e7b4]">
                    {slideOne.closingNote}
                  </p>
                </div>
              )}
            </div>
          </AutoScrollReader>
        </TiltCard>
      </div>
    </div>
  );
};
