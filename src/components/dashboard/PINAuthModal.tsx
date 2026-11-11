import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, KeyRound, X, AlertCircle } from 'lucide-react';
import { verifyAdminPin } from '../../services/storage';

interface PINAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expectedPin: string;
}

export const PINAuthModal: React.FC<PINAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expectedPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter your security PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isValid = await verifyAdminPin(pin, expectedPin);
      if (isValid) {
        onSuccess();
        onClose();
        setPin('');
      } else {
        setError('Incorrect PIN. Please try again.');
      }
    } catch {
      setError('Error verifying PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl glass-panel p-6 sm:p-8 border border-[#d4af37]/30 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close PIN modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-[#e2be67]" />
          </div>
          <h2 className="font-cormorant text-2xl sm:text-3xl font-medium text-[#f7f5f0]">
            Private Editing Access
          </h2>
          <p className="font-sans-modern text-xs text-white/60 mt-1 max-w-xs">
            Enter your secret PIN to access the website controls, photo manager, and letter editor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="password"
                maxLength={20}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter PIN"
                autoFocus
                className="w-full px-4 py-3 pl-11 rounded-xl bg-white/[0.06] border border-white/20 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white placeholder-white/30 text-center tracking-[0.25em] text-lg font-mono focus:outline-none transition-all"
              />
              <KeyRound className="w-4 h-4 text-[#d4af37]/60 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400 justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-center text-[#e2be67]/70 italic">
            Default PIN is <span className="font-mono font-semibold">1234</span>. You can change this anytime inside the dashboard.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#e2be67] to-[#deb35e] text-[#12141d] font-sans-modern font-semibold text-sm hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            {loading ? 'Unlocking...' : 'Unlock Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
