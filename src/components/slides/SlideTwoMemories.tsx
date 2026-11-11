import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteContent, GalleryPhoto } from '../../types/content';
import { AutoScrollReader } from '../AutoScrollReader';
import { ReadingProgressBar } from '../ReadingProgressBar';
import { TiltCard } from '../TiltCard';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, Maximize2, Image as ImageIcon } from 'lucide-react';

interface SlideTwoMemoriesProps {
  content: SiteContent;
}

export const SlideTwoMemories: React.FC<SlideTwoMemoriesProps> = ({ content }) => {
  const { slideTwo, global } = content;
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const photos = slideTwo.photos || [];
  const currentPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null && photos.length > 0) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null && photos.length > 0) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] flex flex-col items-center justify-start max-w-6xl mx-auto px-4 sm:px-6 z-10">
      {/* Slide Heading */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full text-center mb-3 shrink-0"
      >
        <span className="font-sans-modern text-xs tracking-[0.25em] uppercase text-[#e2be67] font-medium">
          {slideTwo.subheading || slideTwo.subtitle}
        </span>
        <h2 className="font-cormorant text-4xl sm:text-5xl md:text-6xl font-light text-[#f7f5f0] mt-1 mb-2 leading-tight">
          {slideTwo.heading}
        </h2>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent mx-auto mb-3" />

        {/* Thin, elegant progress bar visualizing memory photos scroll */}
        <ReadingProgressBar
          progress={scrollProgress}
          title="Memories Progress"
          className="max-w-xl"
        />
      </motion.div>

      {/* Auto-Scrolling Gallery Container with Blur-Fade Reveal */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex-1 min-h-0 relative flex flex-col"
      >
        <AutoScrollReader
          containerRef={scrollContainerRef}
          speedFactor={slideTwo.autoScrollSpeed || 2}
          baseSpeed={48}
          pauseText={global.pauseScrollText}
          resumeText={global.resumeScrollText}
          restartText={global.restartScrollText}
          speedText={global.speedScrollText}
          onProgressChange={setScrollProgress}
        >
          <div
            ref={scrollContainerRef}
            tabIndex={0}
            aria-label="Scrollable photos gallery"
            className="w-full h-[calc(100vh-300px)] md:h-[calc(100vh-320px)] overflow-y-auto pr-2 sm:pr-4 pb-16 focus:outline-none"
          >
            {photos.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center rounded-2xl glass-panel text-center p-8">
                <ImageIcon className="w-12 h-12 text-[#d4af37]/40 mb-3" />
                <p className="font-sans-modern text-white/70 max-w-md">
                  {slideTwo.emptyStateMessage}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto pb-12">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id || index}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <TiltCard
                  maxTilt={4}
                  scale={1.015}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className="group cursor-pointer rounded-2xl overflow-hidden glass-panel border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all duration-300 shadow-xl flex flex-col h-full"
                >
                  {/* Photo Frame */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Cherished memory'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10]/90 via-transparent to-transparent opacity-50 group-hover:opacity-75 transition-opacity" />

                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white/70 group-hover:text-white group-hover:bg-[#d4af37]/30 transition-all">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Caption & Full Story Message (No Truncation) */}
                  <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-3">
                    <div>
                      <h3 className="font-cormorant text-2xl sm:text-3xl font-medium text-[#fff7d6] group-hover:text-[#e2be67] transition-colors leading-snug break-words">
                        {photo.caption}
                      </h3>
                      {photo.description && (
                        <p className="font-sans-modern text-sm sm:text-base text-[#e8e2d5] font-light mt-2.5 leading-relaxed break-words whitespace-pre-wrap">
                          {photo.description}
                        </p>
                      )}
                    </div>

                    {(photo.date || photo.location) && (
                      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/10 text-xs text-white/50 font-sans-modern">
                        {photo.date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#d4af37]/80" />
                            <span>{photo.date}</span>
                          </div>
                        )}
                        {photo.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#d4af37]/80" />
                            <span>{photo.location}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}
          </div>
        </AutoScrollReader>
      </motion.div>

      {/* Full-Screen Lightbox Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhotoIndex(null)}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 md:p-10 select-none"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-xs font-sans-modern"
            >
              <X className="w-4 h-4" />
              <span>{global.lightboxCloseText}</span>
            </button>

            {/* Prev Photo Arrow */}
            {photos.length > 1 && (
              <button
                onClick={handlePrevPhoto}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-[#d4af37]/30 text-white transition-all border border-white/10 hover:border-[#d4af37]/50"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Photo Arrow */}
            {photos.length > 1 && (
              <button
                onClick={handleNextPhoto}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-[#d4af37]/30 text-white transition-all border border-white/10 hover:border-[#d4af37]/50"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Lightbox Content Container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col rounded-2xl glass-panel overflow-hidden border border-[#d4af37]/30 shadow-2xl"
            >
              {/* Image Preview */}
              <div className="relative flex-1 min-h-[300px] max-h-[62vh] bg-black/60 flex items-center justify-center overflow-hidden">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.caption}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Caption & Story Area */}
              <div className="p-6 bg-[#12141d]/90 border-t border-[#d4af37]/20 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-cormorant text-2xl sm:text-3xl font-medium text-[#fff7d6]">
                    {currentPhoto.caption}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-white/50 font-sans-modern">
                    {currentPhoto.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                        {currentPhoto.date}
                      </span>
                    )}
                    {currentPhoto.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                        {currentPhoto.location}
                      </span>
                    )}
                    <span className="text-white/30">
                      {selectedPhotoIndex + 1} / {photos.length}
                    </span>
                  </div>
                </div>

                {currentPhoto.description && (
                  <p className="font-sans-modern text-sm sm:text-base text-[#e2ded5] font-light leading-relaxed">
                    {currentPhoto.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
