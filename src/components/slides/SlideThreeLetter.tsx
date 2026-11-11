import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SiteContent } from '../../types/content';
import { AutoScrollReader } from '../AutoScrollReader';
import { ReadingProgressBar } from '../ReadingProgressBar';
import { TiltCard } from '../TiltCard';
import { Sparkles } from 'lucide-react';

interface SlideThreeLetterProps {
  content: SiteContent;
}

export const SlideThreeLetter: React.FC<SlideThreeLetterProps> = ({ content }) => {
  const { slideThree, global } = content;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const formatting = slideThree.formatting || {
    fontStyle: 'cormorant',
    fontSize: 'lg',
    textAlign: 'left',
    lineSpacing: 'relaxed',
    paragraphSpacing: 'normal',
    textColor: '#f7f5f0',
    bold: false,
    italic: false,
    underline: false,
    dropCap: true,
    themePreset: 'romantic-gold',
  };

  // Font family mapping
  const getFontFamilyClass = (style: string) => {
    switch (style) {
      case 'cormorant':
        return 'font-cormorant';
      case 'playfair':
        return 'font-playfair';
      case 'cinzel':
        return 'font-cinzel';
      case 'caveat':
        return 'font-caveat text-2xl md:text-3xl tracking-wide';
      case 'modern':
      default:
        return 'font-sans-modern';
    }
  };

  // Font size mapping
  const getFontSizeClass = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-sm sm:text-base leading-relaxed';
      case 'base':
        return 'text-base sm:text-lg leading-relaxed';
      case 'lg':
        return 'text-lg sm:text-xl md:text-2xl leading-relaxed';
      case 'xl':
        return 'text-xl sm:text-2xl md:text-3xl leading-relaxed';
      default:
        return 'text-lg sm:text-xl leading-relaxed';
    }
  };

  // Text alignment mapping
  const getTextAlignClass = (align: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'justify':
        return 'text-justify';
      case 'left':
      default:
        return 'text-left';
    }
  };

  // Line spacing
  const getLineSpacingClass = (spacing: string) => {
    switch (spacing) {
      case 'loose':
        return 'leading-[2.2]';
      case 'relaxed':
        return 'leading-[1.85]';
      case 'normal':
      default:
        return 'leading-[1.65]';
    }
  };

  // Paragraph spacing
  const getParagraphSpacingClass = (pSpacing: string) => {
    return pSpacing === 'spacious' ? 'space-y-8' : 'space-y-6';
  };

  const paragraphs = slideThree.paragraphs || [];

  return (
    <div className="relative w-full h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] flex flex-col items-center justify-start max-w-4xl mx-auto px-4 sm:px-6 z-10">
      {/* Slide Heading with Blur-Fade Reveal */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full text-center mb-3 shrink-0"
      >
        <span className="font-sans-modern text-xs tracking-[0.25em] uppercase text-[#e2be67] font-medium">
          {slideThree.subtitle}
        </span>
        <h2 className="font-cormorant text-4xl sm:text-5xl md:text-6xl font-light text-[#f7f5f0] mt-1 mb-2 leading-tight">
          {slideThree.heading}
        </h2>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent mx-auto mb-3" />

        {/* Thin, elegant progress bar visualizing reading scroll */}
        <ReadingProgressBar
          progress={scrollProgress}
          title="Letter Progress"
          className="max-w-xl"
        />
      </motion.div>

      {/* Parchment/Glass Letter Card with Blur-Fade Reveal */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex-1 min-h-0 relative flex flex-col"
      >
        <TiltCard
          maxTilt={2.5}
          scale={1.004}
          className="w-full h-full rounded-2xl glass-panel p-5 sm:p-8 md:p-12 flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-[#d4af37]/25"
        >
          <AutoScrollReader
            containerRef={scrollContainerRef}
            speedFactor={slideThree.autoScrollSpeed || 2}
            pauseText={global.pauseScrollText}
            resumeText={global.resumeScrollText}
            restartText={global.restartScrollText}
            speedText={global.speedScrollText}
            onProgressChange={setScrollProgress}
          >
            {/* Scrollable Letter Area */}
            <div
              ref={scrollContainerRef}
              tabIndex={0}
              aria-label="Personal letter scroll area"
              className="w-full h-[calc(100vh-320px)] md:h-[calc(100vh-340px)] overflow-y-auto pr-3 md:pr-8 focus:outline-none"
            >
              <div
                style={{ color: formatting.textColor || '#f7f5f0' }}
                className={`
                  ${getFontFamilyClass(formatting.fontStyle)}
                  ${getFontSizeClass(formatting.fontSize)}
                  ${getTextAlignClass(formatting.textAlign)}
                  ${getLineSpacingClass(formatting.lineSpacing)}
                  ${formatting.bold ? 'font-bold' : 'font-normal'}
                  ${formatting.italic ? 'italic' : 'not-italic'}
                  ${formatting.underline ? 'underline' : 'no-underline'}
                `}
              >
                {/* Salutation */}
                {slideThree.salutation && (
                  <div className="mb-6 font-cormorant italic text-2xl sm:text-3xl text-[#f7e7b4]">
                    {slideThree.salutation}
                  </div>
                )}

                {/* Letter Body Paragraphs */}
                <div className={getParagraphSpacingClass(formatting.paragraphSpacing)}>
                  {paragraphs.length > 0 ? (
                    paragraphs.map((para, index) => (
                      <p
                        key={para.id || index}
                        className={
                          formatting.dropCap && index === 0
                            ? 'drop-cap first-letter:font-cormorant'
                            : ''
                        }
                      >
                        {para.text}
                      </p>
                    ))
                  ) : (
                    <p className="italic text-white/50">
                      [Your personal letter will be rendered here. Write directly inside the website using the private editing dashboard.]
                    </p>
                  )}
                </div>

                {/* Signature & Signee */}
                <div className="mt-12 pt-8 border-t border-[#d4af37]/20 flex flex-col items-end gap-1">
                  {slideThree.signature && (
                    <p className="font-cormorant italic text-xl sm:text-2xl text-[#f7e7b4]">
                      {slideThree.signature}
                    </p>
                  )}
                  {slideThree.signee && (
                    <p className="font-cormorant text-2xl sm:text-3xl font-medium text-[#fff7d6]">
                      {slideThree.signee}
                    </p>
                  )}
                  {slideThree.dateString && (
                    <p className="font-sans-modern text-xs text-white/40 tracking-widest uppercase mt-1">
                      {slideThree.dateString}
                    </p>
                  )}
                </div>

                {/* Romantic Ending Seal */}
                <div className="pt-16 pb-12 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full border border-[#d4af37]/40 flex items-center justify-center bg-[#d4af37]/10 mb-3 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    <Sparkles className="w-4 h-4 text-[#e2be67]" />
                  </div>
                  <p className="font-cormorant italic text-lg text-[#e2be67]/80">
                    Forever & Always
                  </p>
                </div>
              </div>
            </div>
          </AutoScrollReader>
        </TiltCard>
      </motion.div>
    </div>
  );
};
