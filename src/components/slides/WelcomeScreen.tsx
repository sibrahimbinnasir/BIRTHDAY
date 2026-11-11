import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Lock } from 'lucide-react';
import { SiteContent } from '../../types/content';

interface WelcomeScreenProps {
  content: SiteContent;
  onBegin: () => void;
  onOpenEdit: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  content,
  onBegin,
  onOpenEdit,
}) => {
  const { welcome, global } = content;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center px-6 py-8 md:py-12 z-10 select-none overflow-hidden">
      {/* Top Bar with subtle, discreet Edit Website button */}
      <div className="w-full max-w-5xl flex justify-between items-center text-xs text-white/40 pr-24 sm:pr-28">
        <div className="flex items-center gap-2 tracking-widest uppercase font-sans-modern text-[11px] text-[#e2be67]/80">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>{global.siteTitle}</span>
        </div>

        {/* Discreet Edit Website button - placed unobtrusively */}
        <button
          onClick={onOpenEdit}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-[#d4af37]/40 text-white/50 hover:text-[#fff7d6] transition-all text-[11px]"
          title="Access Private Dashboard"
        >
          <Lock className="w-3 h-3 text-[#d4af37]/70 group-hover:text-[#d4af37] transition-colors" />
          <span>{global.editButtonText}</span>
        </button>
      </div>

      {/* Center Hero Block */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl text-center flex flex-col items-center my-auto px-4"
      >
        {/* Subtle decorative gold line & kicker */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]/70" />
          <span className="font-sans-modern text-xs md:text-sm tracking-[0.25em] uppercase text-[#e2be67] font-medium">
            {welcome.subtitle}
          </span>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]/70" />
        </div>

        {/* Main Heading */}
        <h1 className="font-cormorant text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-[#f7f5f0] mb-8 leading-[1.08] text-balance">
          {welcome.heading}
        </h1>

        {/* Intro Paragraph */}
        <p className="font-sans-modern text-base sm:text-lg md:text-xl text-[#d4cdbf] font-light max-w-2xl leading-relaxed mb-10 text-balance">
          {welcome.introParagraph}
        </p>

        {/* Begin Experience CTA Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBegin}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#e2be67] via-[#f7e7b4] to-[#deb35e] text-[#12141d] font-sans-modern font-semibold text-sm sm:text-base tracking-wide shadow-[0_0_40px_rgba(212,175,55,0.25)] hover:shadow-[0_0_55px_rgba(212,175,55,0.45)] transition-all duration-300"
        >
          <span>{welcome.enterButtonText || global.beginButtonText}</span>
          <ArrowRight className="w-4 h-4 text-[#12141d] group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>

      {/* Bottom Ambient Note */}
      <div className="w-full text-center">
        <p className="font-cormorant italic text-sm md:text-base text-white/40 tracking-wider">
          {welcome.ambientNote}
        </p>
      </div>
    </div>
  );
};
