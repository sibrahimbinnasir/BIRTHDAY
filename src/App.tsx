/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteContent } from './types/content';
import { defaultContent } from './data/defaultContent';
import {
  fetchSiteContent,
  saveSiteContent,
  checkIsAuthenticated,
  setAuthenticated,
  checkIsSiteUnlocked,
  setSiteUnlocked,
} from './services/storage';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HeartRain } from './components/HeartRain';
import { WelcomeScreen } from './components/slides/WelcomeScreen';
import { SlideOneSpecial } from './components/slides/SlideOneSpecial';
import { SlideTwoMemories } from './components/slides/SlideTwoMemories';
import { SlideThreeLetter } from './components/slides/SlideThreeLetter';
import { NavigationControls } from './components/NavigationControls';
import { PINAuthModal } from './components/dashboard/PINAuthModal';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { SitePasswordGate } from './components/SitePasswordGate';
import { BackgroundAudioPlayer } from './components/BackgroundAudioPlayer';
import { Sparkles, Heart, Lock } from 'lucide-react';

export default function App() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [currentSlide, setCurrentSlide] = useState<number>(0); // 0: Welcome, 1: Special, 2: Memories, 3: Letter
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSiteUnlocked, setIsSiteUnlocked] = useState<boolean>(() => checkIsSiteUnlocked());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isHeartRainActive, setIsHeartRainActive] = useState<boolean>(true);
  const [heartIntensity, setHeartIntensity] = useState<'gentle' | 'medium' | 'shower'>('gentle');
  const [triggerAudioPlay, setTriggerAudioPlay] = useState<boolean>(false);

  // Load persistent content on mount
  useEffect(() => {
    let mounted = true;
    fetchSiteContent()
      .then((loaded) => {
        if (mounted) {
          setContent(loaded);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading initial site content:', err);
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isLocked = content.global.sitePasswordEnabled !== false && !isSiteUnlocked;

  // Keyboard navigation support (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept keyboard when typing in inputs, dashboard is open, or site is locked
      if (isDashboardOpen || isAuthModalOpen || isLocked) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentSlide < 3) setCurrentSlide((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentSlide > 0) setCurrentSlide((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isDashboardOpen, isAuthModalOpen, isLocked]);

  // Slide navigation handlers
  const handleNext = () => {
    if (isLocked) return;
    if (currentSlide < 3) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (isLocked) return;
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleGoToWelcome = () => {
    setCurrentSlide(0);
  };

  const handleOpenEdit = () => {
    if (checkIsAuthenticated()) {
      setIsDashboardOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setAuthenticated(true);
    setIsSiteUnlocked(true);
    setSiteUnlocked(true);
    setIsDashboardOpen(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setIsDashboardOpen(false);
  };

  const handleSiteUnlocked = () => {
    setIsSiteUnlocked(true);
    setSiteUnlocked(true);
    setTriggerAudioPlay(true);
  };

  const handleLockSite = () => {
    setIsSiteUnlocked(false);
    setSiteUnlocked(false);
  };

  const handleSaveContent = async (updated: SiteContent): Promise<boolean> => {
    setContent(updated);
    return await saveSiteContent(updated);
  };

  const handlePreviewSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0b0c10] flex flex-col items-center justify-center text-[#f7f5f0]">
        <div className="w-10 h-10 rounded-full border border-[#d4af37]/40 flex items-center justify-center bg-[#d4af37]/10 animate-pulse mb-3">
          <Sparkles className="w-4 h-4 text-[#e2be67]" />
        </div>
        <p className="font-cormorant italic text-lg text-[#e2be67]">
          Preparing your experience...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0b0c10] text-[#f7f5f0] overflow-x-hidden flex flex-col">
      {/* 3D Three.js Ambient Environment */}
      <ThreeCanvas currentSlide={currentSlide} />

      {/* Romantic Falling Hearts Effect */}
      <HeartRain enabled={isHeartRainActive} intensity={heartIntensity} />

      {/* Floating Top Controls: Audio Player with Autoplay Toggle & Heart Rain */}
      <div className="fixed top-4 right-4 z-30 pointer-events-auto flex items-center gap-2">
        <BackgroundAudioPlayer
          trackUrl={content.global.bgAudioUrl || '/audio/romantic-piano.mp3'}
          trackTitle={content.global.bgAudioTrackTitle || 'Heartwarming · Romantic Piano'}
          defaultAutoplay={content.global.bgAudioAutoplay !== false}
          defaultVolume={content.global.bgAudioVolume || 0.45}
          triggerGesturePlay={triggerAudioPlay}
        />

        {/* Subtle Floating Heart Rain Toggle */}
        <button
          onClick={() => {
            if (!isHeartRainActive) {
              setIsHeartRainActive(true);
              setHeartIntensity('gentle');
            } else if (heartIntensity === 'gentle') {
              setHeartIntensity('shower');
            } else {
              setIsHeartRainActive(false);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-sans-modern shadow-lg ${
            isHeartRainActive
              ? heartIntensity === 'shower'
                ? 'bg-rose-500/25 border-rose-400/50 text-[#ffe4ea]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] border-[#d4af37]/35 text-[#fff7d6]'
              : 'bg-black/40 border-white/10 text-white/40 hover:text-white'
          }`}
          title={
            !isHeartRainActive
              ? 'Heart Rain: Off (Click to turn on)'
              : heartIntensity === 'gentle'
              ? 'Heart Rain: Gentle (Click for Shower)'
              : 'Heart Rain: Shower (Click to turn off)'
          }
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform ${
              isHeartRainActive
                ? 'text-rose-400 fill-rose-400/50 scale-110'
                : 'text-white/40'
            }`}
          />
          <span className="hidden sm:inline text-[11px]">
            {!isHeartRainActive
              ? 'Hearts Off'
              : heartIntensity === 'shower'
              ? 'Heart Shower'
              : 'Heart Rain'}
          </span>
        </button>

        {/* Lock Website Toggle (Returns to Password Lock Screen) */}
        {!isLocked && content.global.sitePasswordEnabled !== false && (
          <button
            onClick={handleLockSite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 hover:bg-white/10 text-white/50 hover:text-[#fff7d6] transition-all text-xs font-sans-modern shadow-lg"
            title="Lock Website Access"
            aria-label="Lock Website"
          >
            <Lock className="w-3.5 h-3.5 text-[#e2be67]" />
            <span className="hidden sm:inline text-[11px]">Lock Site</span>
          </button>
        )}
      </div>

      <main className="relative flex-1 w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {currentSlide === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full flex flex-col"
            >
              <WelcomeScreen
                content={content}
                onBegin={() => {
                  setTriggerAudioPlay(true);
                  setCurrentSlide(1);
                }}
                onOpenEdit={handleOpenEdit}
              />
            </motion.div>
          )}

          {currentSlide === 1 && (
            <motion.div
              key="slide-one"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full flex flex-col pt-6 md:pt-10"
            >
              <SlideOneSpecial content={content} />
            </motion.div>
          )}

          {currentSlide === 2 && (
            <motion.div
              key="slide-two"
              initial={{ opacity: 0, filter: 'blur(14px)', scale: 0.97, y: 16 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
              exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.02, y: -16 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full flex flex-col pt-6 md:pt-10"
            >
              <SlideTwoMemories content={content} />
            </motion.div>
          )}

          {currentSlide === 3 && (
            <motion.div
              key="slide-three"
              initial={{ opacity: 0, filter: 'blur(14px)', scale: 0.97, y: 16 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
              exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.02, y: -16 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full flex flex-col pt-6 md:pt-10"
            >
              <SlideThreeLetter content={content} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Navigation Controls for Content Slides (Previous, Next, Unnumbered Dots) */}
      {!isLocked && (
        <NavigationControls
          currentSlide={currentSlide}
          totalSlides={4}
          content={content}
          onNext={handleNext}
          onPrev={handlePrev}
          onGoToWelcome={handleGoToWelcome}
          onOpenEdit={handleOpenEdit}
        />
      )}

      {/* Website Entrance Password Gate (Must enter password to access website) */}
      <SitePasswordGate
        isOpen={isLocked}
        expectedPassword={content.global.sitePassword || content.global.adminPin || '1211'}
        adminPin={content.global.adminPin || '1211'}
        title={content.global.sitePasswordTitle}
        subtitle={content.global.sitePasswordSubtitle}
        hint={content.global.sitePasswordHint}
        onUnlocked={handleSiteUnlocked}
        onOpenAdminLogin={handleOpenEdit}
      />

      {/* Private Dashboard Security PIN Gate */}
      <PINAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        expectedPin={content.global.adminPin || '1211'}
      />

      {/* Full-Featured Private Editing Dashboard */}
      <AdminDashboard
        isOpen={isDashboardOpen}
        content={content}
        onSave={handleSaveContent}
        onClose={() => setIsDashboardOpen(false)}
        onPreviewSlide={handlePreviewSlide}
        onLogout={handleLogout}
      />
    </div>
  );
}
