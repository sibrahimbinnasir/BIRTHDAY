import React, { useState, useEffect } from 'react';
import { SiteContent } from '../../types/content';
import { defaultContent } from '../../data/defaultContent';
import {
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  History,
  Clock,
  RefreshCw,
  Music,
  Volume2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { fetchBackups, restoreBackup, BackupItem } from '../../services/storage';

interface GlobalSettingsEditorProps {
  content: SiteContent;
  onChange: (updated: SiteContent) => void;
}

export const GlobalSettingsEditor: React.FC<GlobalSettingsEditorProps> = ({
  content,
  onChange,
}) => {
  const { global } = content;
  const [newPin, setNewPin] = useState(global.adminPin || '1234');
  const [pinSaved, setPinSaved] = useState(false);
  const [newSitePassword, setNewSitePassword] = useState(global.sitePassword || global.adminPin || '1234');
  const [sitePasswordSaved, setSitePasswordSaved] = useState(false);
  const [showSitePassword, setShowSitePassword] = useState(false);
  const [importError, setImportError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [restoringFilename, setRestoringFilename] = useState<string | null>(null);

  const loadBackups = async () => {
    setLoadingBackups(true);
    const list = await fetchBackups();
    setBackups(list);
    setLoadingBackups(false);
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => setNotificationMessage(''), 3000);
  };

  const handleGlobalChange = (field: keyof typeof global, value: any) => {
    onChange({
      ...content,
      global: {
        ...global,
        [field]: value,
      },
    });
  };

  const handleSavePin = () => {
    if (!newPin.trim()) return;
    handleGlobalChange('adminPin', newPin.trim());
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2500);
  };

  const handleSaveSitePassword = () => {
    if (!newSitePassword.trim()) return;
    handleGlobalChange('sitePassword', newSitePassword.trim());
    setSitePasswordSaved(true);
    setTimeout(() => setSitePasswordSaved(false), 2500);
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `elysian-gift-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.global && json.welcome) {
          onChange(json);
          setImportError('');
          showNotification('Backup restored successfully!');
        } else {
          setImportError('Invalid backup file format');
        }
      } catch {
        setImportError('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteReset = () => {
    onChange(defaultContent);
    setShowResetConfirm(false);
    showNotification('Content reset to default templates.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-cormorant text-2xl font-medium text-[#fff7d6] mb-1">
          Global Website Settings
        </h3>
        <p className="font-sans-modern text-xs text-white/60">
          Customize website access password, navigation buttons, reading controls, security PIN, and backups.
        </p>
      </div>

      {/* Website Access Password Gate Section */}
      <div className="p-5 rounded-xl bg-white/[0.04] border border-[#d4af37]/40 space-y-4 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#e2be67]" />
            </div>
            <div>
              <h4 className="text-sm font-sans-modern font-semibold text-[#fff7d6] flex items-center gap-2">
                <span>Website Access Password</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {global.sitePasswordEnabled !== false ? 'Gate Active' : 'Gate Disabled'}
                </span>
              </h4>
              <p className="text-xs text-white/60">
                Visitors must type this password upon opening the website to unlock and view the gift.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors">
            <span className="text-xs font-sans-modern text-white/80">Require Password to Open:</span>
            <input
              type="checkbox"
              checked={global.sitePasswordEnabled !== false}
              onChange={(e) => handleGlobalChange('sitePasswordEnabled', e.target.checked)}
              className="rounded accent-[#d4af37] w-4 h-4"
            />
          </label>
        </div>

        {/* Password input & update */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              Secret Access Password
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showSitePassword ? 'text' : 'password'}
                  value={newSitePassword}
                  onChange={(e) => setNewSitePassword(e.target.value)}
                  placeholder="e.g. 1234 or special date/word"
                  className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-black/40 border border-white/20 focus:border-[#d4af37] text-white font-mono text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSitePassword(!showSitePassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 p-1"
                >
                  {showSitePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSaveSitePassword}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#e2be67] to-[#deb35e] text-black font-semibold text-xs font-sans-modern hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
              >
                {sitePasswordSaved ? <Check className="w-3.5 h-3.5 text-black" /> : <KeyRound className="w-3.5 h-3.5 text-black" />}
                <span>{sitePasswordSaved ? 'Saved' : 'Save Password'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              Optional Password Hint (shown if requested)
            </label>
            <input
              type="text"
              value={global.sitePasswordHint || ''}
              onChange={(e) => handleGlobalChange('sitePasswordHint', e.target.value)}
              placeholder="e.g. Our special date or my nickname"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Lock Screen Heading & Subtitle Customization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              Lock Screen Heading
            </label>
            <input
              type="text"
              value={global.sitePasswordTitle || 'A Secret World For My Beloved'}
              onChange={(e) => handleGlobalChange('sitePasswordTitle', e.target.value)}
              placeholder="e.g. A Secret World For My Beloved"
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              Lock Screen Subtitle
            </label>
            <input
              type="text"
              value={global.sitePasswordSubtitle || 'Please enter the secret password to open your gift'}
              onChange={(e) => handleGlobalChange('sitePasswordSubtitle', e.target.value)}
              placeholder="e.g. Please enter the secret password to open your gift"
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Security PIN Section */}
      <div className="p-5 rounded-xl bg-white/[0.04] border border-[#d4af37]/30 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
          <div>
            <h4 className="text-sm font-sans-modern font-semibold text-[#fff7d6]">
              Admin Dashboard PIN
            </h4>
            <p className="text-xs text-white/60">
              PIN required to open this editing dashboard and manage photos & letters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 max-w-sm">
          <input
            type="text"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="New PIN (e.g. 1234)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 focus:border-[#d4af37] text-white font-mono text-center tracking-widest text-base focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSavePin}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e2be67] to-[#deb35e] text-black font-semibold text-xs font-sans-modern hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            {pinSaved ? <Check className="w-4 h-4 text-black" /> : null}
            <span>{pinSaved ? 'PIN Updated' : 'Update PIN'}</span>
          </button>
        </div>
      </div>

      {/* Background Audio & Autoplay Settings */}
      <div className="p-5 rounded-xl bg-white/[0.04] border border-[#d4af37]/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[#d4af37]" />
            <div>
              <h4 className="text-sm font-sans-modern font-semibold text-[#fff7d6]">
                Background Music & Autoplay
              </h4>
              <p className="text-xs text-white/60">
                Configure the romantic soundtrack and modern browser autoplay behavior.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors">
            <span className="text-xs font-sans-modern text-white/80">Autoplay on Start:</span>
            <input
              type="checkbox"
              checked={global.bgAudioAutoplay !== false}
              onChange={(e) => handleGlobalChange('bgAudioAutoplay', e.target.checked)}
              className="rounded accent-[#d4af37] w-4 h-4"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              Soundtrack Display Title
            </label>
            <input
              type="text"
              value={global.bgAudioTrackTitle || 'Heartwarming · Romantic Piano Serenade'}
              onChange={(e) => handleGlobalChange('bgAudioTrackTitle', e.target.value)}
              placeholder="e.g. Heartwarming · Romantic Piano"
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1 flex items-center justify-between">
              <span>Audio File URL (MP3)</span>
              <button
                type="button"
                onClick={() => handleGlobalChange('bgAudioUrl', '/audio/romantic-piano.mp3')}
                className="text-[10px] text-[#e2be67] hover:underline"
              >
                Reset to Default Piano
              </button>
            </label>
            <input
              type="text"
              value={global.bgAudioUrl || '/audio/romantic-piano.mp3'}
              onChange={(e) => handleGlobalChange('bgAudioUrl', e.target.value)}
              placeholder="e.g. /audio/romantic-piano.mp3 or custom URL"
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Button & Navigation Labels */}
      <div className="space-y-4">
        <h4 className="text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] font-medium">
          Every Navigation & Button Label (Fully Editable)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              Website Brand Title
            </label>
            <input
              type="text"
              value={global.siteTitle}
              onChange={(e) => handleGlobalChange('siteTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              "Next" Button Label
            </label>
            <input
              type="text"
              value={global.nextButtonText}
              onChange={(e) => handleGlobalChange('nextButtonText', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              "Previous" Button Label
            </label>
            <input
              type="text"
              value={global.prevButtonText}
              onChange={(e) => handleGlobalChange('prevButtonText', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              "Edit Website" Button Label
            </label>
            <input
              type="text"
              value={global.editButtonText}
              onChange={(e) => handleGlobalChange('editButtonText', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              Auto-Scroll "Pause" Label
            </label>
            <input
              type="text"
              value={global.pauseScrollText}
              onChange={(e) => handleGlobalChange('pauseScrollText', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              Auto-Scroll "Resume" Label
            </label>
            <input
              type="text"
              value={global.resumeScrollText}
              onChange={(e) => handleGlobalChange('resumeScrollText', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              Auto-Scroll "Restart" Label
            </label>
            <input
              type="text"
              value={global.restartScrollText}
              onChange={(e) => handleGlobalChange('restartScrollText', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern text-white/70 mb-1">
              Photo Lightbox "Close" Label
            </label>
            <input
              type="text"
              value={global.lightboxCloseText}
              onChange={(e) => handleGlobalChange('lightboxCloseText', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 focus:border-[#d4af37] text-white text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Backup & Reset Controls */}
      <div className="pt-4 border-t border-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] font-medium flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#d4af37]" />
              <span>Automated Backups & Version History</span>
            </h4>
            <p className="text-[11px] text-white/50 mt-0.5">
              Every save and photo upload creates a permanent snapshot on the server. You can roll back to any version anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={loadBackups}
            disabled={loadingBackups}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Refresh backup list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingBackups ? 'animate-spin text-[#d4af37]' : ''}`} />
          </button>
        </div>

        {/* List of recent backups */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          {backups.length === 0 ? (
            <div className="text-center py-4 text-xs text-white/40">
              No backups recorded yet. Saving changes will automatically generate backups here.
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {backups.slice(0, 10).map((b) => (
                <div
                  key={b.filename}
                  className="p-2.5 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-[#e2be67] shrink-0" />
                    <div>
                      <div className="text-white/90 font-medium font-sans-modern">
                        {new Date(b.timestamp).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-white/50 flex items-center gap-2">
                        <span>{b.photoCount} photo{b.photoCount === 1 ? '' : 's'}</span>
                        <span>·</span>
                        <span>{b.letterParagraphCount} letter paragraph{b.letterParagraphCount === 1 ? '' : 's'}</span>
                        {b.welcomeTitle ? (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[140px] italic">"{b.welcomeTitle}"</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={restoringFilename === b.filename}
                    onClick={async () => {
                      setRestoringFilename(b.filename);
                      const restored = await restoreBackup(b.filename);
                      if (restored) {
                        onChange(restored);
                        showNotification(`Restored version from ${new Date(b.timestamp).toLocaleTimeString()}!`);
                        loadBackups();
                      } else {
                        showNotification('Failed to restore backup.');
                      }
                      setRestoringFilename(null);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/40 text-[#fff7d6] text-xs font-sans-modern transition-all disabled:opacity-50 shrink-0"
                  >
                    {restoringFilename === b.filename ? 'Restoring...' : 'Restore'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Export & Import */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white font-sans-modern transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Download Backup (.json)</span>
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white font-sans-modern cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Restore From File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs text-rose-300 font-sans-modern ml-auto transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Placeholders</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-rose-300 font-sans-modern">Are you sure?</span>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {notificationMessage && (
          <div className="p-3 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-xs text-[#fff7d6] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#e2be67]" />
            <span>{notificationMessage}</span>
          </div>
        )}

        {importError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{importError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
