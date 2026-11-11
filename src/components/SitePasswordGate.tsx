import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, KeyRound, Sparkles, Heart, Eye, EyeOff, AlertCircle, HelpCircle } from 'lucide-react';
import { verifySitePassword } from '../services/storage';

interface SitePasswordGateProps {
  isOpen: boolean;
  expectedPassword: string;
  adminPin?: string;
  title?: string;
  subtitle?: string;
  hint?: string;
  onUnlocked: () => void;
  onOpenAdminLogin?: () => void;
}

export const SitePasswordGate: React.FC<SitePasswordGateProps> = ({
  isOpen,
  expectedPassword,
  adminPin,
  title = 'A Secret World For My Beloved',
  subtitle = 'Please enter the secret password to open your gift',
  hint,
  onUnlocked,
  onOpenAdminLogin,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please type the secret password');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await verifySitePassword(
        password,
        expectedPassword || '1211',
        adminPin || '1211'
      );

      if (isValid) {
        setIsSuccess(true);
        setTimeout(() => {
          onUnlocked();
        }, 650);
      } else {
        setError('Incorrect password. Please try again with love ❤️');
        setIsVerifying(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="site-lock-gate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04, filter: 'blur(16px)' }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 bg-[#0b0c10] flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 32%, rgba(212, 175, 55, 0.14) 0%, rgba(11, 12, 16, 0.85) 65%, #0b0c10 100%)',
        }}
      >
        {/* Ambient Subtle Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#d4af37]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Central Romantic Portal Card */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          className="relative w-full max-w-md mx-auto rounded-3xl p-7 sm:p-9 bg-black/60 backdrop-blur-2xl border border-[#d4af37]/30 shadow-[0_0_60px_rgba(212,175,55,0.12)] text-[#f7f5f0] text-center"
        >
          {/* Decorative Corner Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#e2be67] to-transparent opacity-75" />

          {/* Golden Romantic Lock Icon Badge */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: isSuccess ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.5 }}
            className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              isSuccess
                ? 'bg-emerald-500/20 border border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.35)]'
                : 'bg-gradient-to-b from-[#d4af37]/25 to-[#d4af37]/10 border border-[#d4af37]/45 shadow-[0_0_25px_rgba(212,175,55,0.25)]'
            }`}
          >
            {isSuccess ? (
              <Unlock className="w-7 h-7 text-emerald-400" />
            ) : (
              <Lock className="w-7 h-7 text-[#e2be67]" />
            )}
          </motion.div>

          {/* Intimate Subtitle Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-[#d4af37]/20 text-[11px] font-sans-modern uppercase tracking-widest text-[#e2be67]/90 mb-3">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400/60" />
            <span>Private & Confidential</span>
          </div>

          {/* Main Title & Romantic Description */}
          <h1 className="font-cormorant text-3xl sm:text-4xl font-medium text-[#fff7d6] tracking-wide leading-tight mb-2">
            {title}
          </h1>
          <p className="font-sans-modern text-xs sm:text-sm text-white/65 font-light leading-relaxed max-w-sm mx-auto mb-6">
            {subtitle}
          </p>

          {/* Password Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]/70">
                <KeyRound className="w-4 h-4" />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                disabled={isVerifying || isSuccess}
                autoFocus
                placeholder="Enter password..."
                className={`w-full py-3.5 pl-11 pr-11 rounded-2xl bg-white/[0.05] border transition-all text-center font-sans-modern text-base text-white placeholder-white/30 focus:outline-none ${
                  error
                    ? 'border-rose-400/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                    : isSuccess
                    ? 'border-emerald-400/80 bg-emerald-500/10 text-emerald-200'
                    : 'border-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/60 shadow-inner'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Error Message with Shake Feedback */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5 text-xs text-rose-300 font-sans-modern py-0.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Optional Hint Dropdown */}
            {hint && hint.trim().length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex items-center gap-1 text-[11px] font-sans-modern text-[#d4af37]/80 hover:text-[#e2be67] transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{showHint ? 'Hide hint' : 'Need a password hint?'}</span>
                </button>
                {showHint && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs font-sans-modern text-[#e2be67]/90 mt-1 italic bg-white/[0.03] py-1.5 px-3 rounded-lg border border-[#d4af37]/20 inline-block"
                  >
                    Hint: {hint}
                  </motion.p>
                )}
              </div>
            )}

            {/* Primary Unlock Action Button */}
            <button
              type="submit"
              disabled={isVerifying || isSuccess}
              className={`w-full py-3.5 px-6 rounded-2xl font-sans-modern font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
                isSuccess
                  ? 'bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                  : 'bg-gradient-to-r from-[#e2be67] via-[#deb35e] to-[#d4af37] text-[#12141d] hover:brightness-110 shadow-[0_0_25px_rgba(212,175,55,0.25)]'
              } disabled:opacity-80`}
            >
              {isSuccess ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Access Granted · Opening Surprise...</span>
                </>
              ) : isVerifying ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black/60 border-t-transparent animate-spin" />
                  <span>Verifying Password...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#12141d]" />
                  <span>Unlock & Open Website</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Discrete Admin / Owner Help */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] font-sans-modern text-white/40">
            <span>Created with all my heart</span>
            {onOpenAdminLogin && (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="hover:text-[#e2be67] transition-colors underline-offset-2 hover:underline"
              >
                Owner / Edit Login
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
