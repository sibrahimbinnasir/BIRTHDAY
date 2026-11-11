import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { SiteContent } from '../../types/content';
import { WelcomeEditor } from './WelcomeEditor';
import { SpecialEditor } from './SpecialEditor';
import { MemoriesEditor } from './MemoriesEditor';
import { LetterEditor } from './LetterEditor';
import { GlobalSettingsEditor } from './GlobalSettingsEditor';
import {
  X,
  Save,
  Check,
  Eye,
  Send,
  Home,
  Heart,
  Image as ImageIcon,
  BookOpen,
  Settings,
  Lock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export type SaveStatus = 'Saving...' | 'All changes saved' | 'Unsaved changes' | 'Unable to save';

interface AdminDashboardProps {
  isOpen: boolean;
  content: SiteContent;
  onSave: (updated: SiteContent) => Promise<boolean>;
  onClose: () => void;
  onPreviewSlide: (slideIndex: number) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  content,
  onSave,
  onClose,
  onPreviewSlide,
  onLogout,
}) => {
  const [formData, setFormData] = useState<SiteContent>(content);
  const [activeTab, setActiveTab] = useState<'welcome' | 'special' | 'memories' | 'letter' | 'global'>('welcome');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('All changes saved');

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep formData in sync if incoming content changes
  useEffect(() => {
    setFormData(content);
  }, [content]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced auto-save function using useCallback
  const debouncedSave = useCallback(
    async (dataToSave: SiteContent) => {
      setSaveStatus('Saving...');
      try {
        const success = await onSave(dataToSave);
        if (success) {
          setSaveStatus('All changes saved');
        } else {
          setSaveStatus('Unable to save');
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaveStatus('Unable to save');
      }
    },
    [onSave]
  );

  // Handle form data change with auto-save debounce
  const handleFormDataChange = useCallback(
    (updated: SiteContent) => {
      setFormData(updated);
      setSaveStatus('Unsaved changes');

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        debouncedSave(updated);
      }, 1500);
    },
    [debouncedSave]
  );

  if (!isOpen) return null;

  const handleSaveDraft = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSaveStatus('Saving...');
    try {
      const success = await onSave(formData);
      if (success) {
        setSaveStatus('All changes saved');
      } else {
        setSaveStatus('Unable to save');
      }
    } catch (err) {
      console.error('Manual save failed:', err);
      setSaveStatus('Unable to save');
    }
  };

  const handlePublishAll = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSaveStatus('Saving...');
    const publishedData: SiteContent = {
      ...formData,
      slideThree: {
        ...formData.slideThree,
        isPublished: true,
      },
    };
    setFormData(publishedData);
    try {
      const success = await onSave(publishedData);
      if (success) {
        setSaveStatus('All changes saved');
      } else {
        setSaveStatus('Unable to save');
      }
    } catch (err) {
      console.error('Publish failed:', err);
      setSaveStatus('Unable to save');
    }
  };

  const handlePreviewCurrent = () => {
    let targetSlide = 0;
    if (activeTab === 'welcome') targetSlide = 0;
    else if (activeTab === 'special') targetSlide = 1;
    else if (activeTab === 'memories') targetSlide = 2;
    else if (activeTab === 'letter') targetSlide = 3;

    onSave(formData); // auto-save before preview
    onPreviewSlide(targetSlide);
    onClose();
  };

  const handleClose = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    // Auto-save changes on closing so nothing is ever lost
    if (saveStatus === 'Unsaved changes') {
      onSave(formData);
    }
    onClose();
  };

  const tabs = [
    { id: 'welcome', label: 'Welcome Screen', icon: Home },
    { id: 'special', label: "Why You're Special", icon: Heart },
    { id: 'memories', label: 'Memories Gallery', icon: ImageIcon },
    { id: 'letter', label: 'Personal Letter', icon: BookOpen },
    { id: 'global', label: 'Global & Backups', icon: Settings },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0c10]/95 backdrop-blur-2xl flex flex-col select-none overflow-hidden text-[#f7f5f0]">
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-8 border-b border-white/10 flex items-center justify-between gap-4 bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center">
            <Lock className="w-4 h-4 text-[#e2be67]" />
          </div>
          <div>
            <h1 className="font-cormorant text-xl font-medium text-[#fff7d6] leading-none">
              Private Gift Editor
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {saveStatus === 'Saving...' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[11px] font-sans-modern text-amber-300">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                  Saving...
                </span>
              )}
              {saveStatus === 'All changes saved' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-sans-modern text-emerald-300">
                  <Check className="w-3 h-3 text-emerald-400" />
                  All changes saved
                </span>
              )}
              {saveStatus === 'Unsaved changes' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-sans-modern text-white/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Unsaved changes
                </span>
              )}
              {saveStatus === 'Unable to save' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/40 text-[11px] font-sans-modern text-rose-300">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  Unable to save
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global Save / Preview / Publish / Exit Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePreviewCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-sans-modern text-white/80 hover:text-white border border-white/10 transition-all"
            title="Preview this section on the live website"
          >
            <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">Preview On Site</span>
          </button>

          <button
            type="button"
            disabled={saveStatus === 'Saving...'}
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-sans-modern text-white border border-white/15 transition-all shadow-sm disabled:opacity-50"
          >
            {saveStatus === 'All changes saved' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : saveStatus === 'Saving...' ? (
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#d4af37]" />
            )}
            <span>
              {saveStatus === 'Saving...'
                ? 'Saving...'
                : saveStatus === 'All changes saved'
                ? 'All changes saved'
                : 'Save Changes'}
            </span>
          </button>

          <button
            type="button"
            disabled={saveStatus === 'Saving...'}
            onClick={handlePublishAll}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#e2be67] to-[#deb35e] text-[#12141d] font-semibold text-xs font-sans-modern hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-[#12141d]" />
            <span>Publish Website</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors ml-1"
            title="Return to Website (Changes auto-saved)"
            aria-label="Close Dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container: Sidebar Tabs + Content Area */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 p-3 sm:p-4 flex md:flex-col gap-1.5 overflow-x-auto shrink-0">
          <div className="hidden md:block text-[11px] font-sans-modern uppercase tracking-wider text-white/40 px-3 py-2 font-medium">
            Editor Sections
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-sans-modern transition-all whitespace-nowrap text-left ${
                  isActive
                    ? 'bg-[#d4af37]/20 text-[#fff7d6] border border-[#d4af37]/40 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#e2be67]' : 'text-white/40'
                  }`}
                />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}

          <div className="hidden md:flex flex-col gap-2 mt-auto pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 px-3 rounded-lg text-xs font-sans-modern text-white/40 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
            >
              Lock / Log Out
            </button>
          </div>
        </aside>

        {/* Active Section Form Area */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'welcome' && (
              <WelcomeEditor content={formData} onChange={handleFormDataChange} />
            )}
            {activeTab === 'special' && (
              <SpecialEditor content={formData} onChange={handleFormDataChange} />
            )}
            {activeTab === 'memories' && (
              <MemoriesEditor content={formData} onChange={handleFormDataChange} />
            )}
            {activeTab === 'letter' && (
              <LetterEditor
                content={formData}
                onChange={handleFormDataChange}
                onSaveDraft={handleSaveDraft}
                onPublish={handlePublishAll}
              />
            )}
            {activeTab === 'global' && (
              <GlobalSettingsEditor content={formData} onChange={handleFormDataChange} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
