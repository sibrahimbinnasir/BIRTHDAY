import React, { useState, useEffect } from 'react';
import { SiteContent, LetterParagraph, LetterFormatting, LetterFontStyle } from '../../types/content';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Palette,
  Sliders,
  History,
  Download,
  Upload,
  AlertCircle,
  RefreshCw,
  FileText,
  X,
} from 'lucide-react';
import {
  LETTER_DRAFT_KEY,
  LETTER_REVISIONS_KEY,
  scanBrowserForRecoverableLetter,
  LetterRevision,
  hasCustomLetter,
} from '../../services/storage';

interface LetterEditorProps {
  content: SiteContent;
  onChange: (updated: SiteContent) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export const LetterEditor: React.FC<LetterEditorProps> = ({
  content,
  onChange,
  onSaveDraft,
  onPublish,
}) => {
  const { slideThree } = content;
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [pasteRawText, setPasteRawText] = useState<string>('');
  const [revisions, setRevisions] = useState<LetterRevision[]>([]);
  const [recoverableLetter, setRecoverableLetter] = useState<{
    source: string;
    timestamp?: number;
    paragraphs: { id: string; text: string }[];
    salutation?: string;
    signature?: string;
    signee?: string;
  } | null>(null);

  // Scan browser storage on mount to find any recoverable letter
  useEffect(() => {
    scanBrowserForRecoverableLetter().then((found) => {
      if (found && found.paragraphs && found.paragraphs.length > 0) {
        // If current paragraphs in editor are placeholders or empty, flag as recoverable!
        if (!hasCustomLetter(content)) {
          setRecoverableLetter(found);
        }
      }
    });

    // Load revision history from localStorage
    try {
      const revsRaw = localStorage.getItem(LETTER_REVISIONS_KEY);
      if (revsRaw) {
        setRevisions(JSON.parse(revsRaw));
      }
    } catch (_) {}
  }, [content]);

  const formatting: LetterFormatting = slideThree.formatting || {
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

  const handleUpdateLetterField = (field: keyof typeof slideThree, value: any) => {
    onChange({
      ...content,
      slideThree: {
        ...slideThree,
        [field]: value,
      },
    });
  };

  const handleUpdateFormatting = (field: keyof LetterFormatting, value: any) => {
    handleUpdateLetterField('formatting', {
      ...formatting,
      [field]: value,
    });
  };

  // Typography Presets
  const applyPreset = (preset: 'cormorant' | 'playfair' | 'caveat' | 'cinzel' | 'modern') => {
    let newFormatting: LetterFormatting;
    switch (preset) {
      case 'cormorant':
        newFormatting = {
          ...formatting,
          fontStyle: 'cormorant',
          fontSize: 'lg',
          lineSpacing: 'relaxed',
          paragraphSpacing: 'normal',
          dropCap: true,
          themePreset: 'romantic-gold',
          textColor: '#f7f5f0',
        };
        break;
      case 'playfair':
        newFormatting = {
          ...formatting,
          fontStyle: 'playfair',
          fontSize: 'base',
          lineSpacing: 'relaxed',
          paragraphSpacing: 'normal',
          dropCap: true,
          themePreset: 'vintage-parchment',
          textColor: '#f5f0e6',
        };
        break;
      case 'caveat':
        newFormatting = {
          ...formatting,
          fontStyle: 'caveat',
          fontSize: 'xl',
          lineSpacing: 'loose',
          paragraphSpacing: 'spacious',
          dropCap: false,
          themePreset: 'champagne-rose',
          textColor: '#fff7e6',
        };
        break;
      case 'cinzel':
        newFormatting = {
          ...formatting,
          fontStyle: 'cinzel',
          fontSize: 'base',
          lineSpacing: 'loose',
          paragraphSpacing: 'normal',
          dropCap: false,
          themePreset: 'midnight-minimal',
          textColor: '#f0ede6',
        };
        break;
      case 'modern':
      default:
        newFormatting = {
          ...formatting,
          fontStyle: 'modern',
          fontSize: 'base',
          lineSpacing: 'relaxed',
          paragraphSpacing: 'spacious',
          dropCap: false,
          themePreset: 'midnight-minimal',
          textColor: '#e8e6e1',
        };
        break;
    }
    handleUpdateLetterField('formatting', newFormatting);
    setStatusMessage('Preset applied!');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  // Paragraph Management
  const handleParagraphTextChange = (id: string, text: string) => {
    const updated = (slideThree.paragraphs || []).map((p) =>
      p.id === id ? { ...p, text } : p
    );
    handleUpdateLetterField('paragraphs', updated);
  };

  const handleAddParagraphAt = (index: number) => {
    const newPara: LetterParagraph = {
      id: `letter-p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: '',
    };
    const list = [...(slideThree.paragraphs || [])];
    list.splice(index + 1, 0, newPara);
    handleUpdateLetterField('paragraphs', list);
  };

  const handleDeleteParagraph = (id: string) => {
    if ((slideThree.paragraphs || []).length <= 1) {
      setStatusMessage('Letter must have at least one paragraph.');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    const updated = (slideThree.paragraphs || []).filter((p) => p.id !== id);
    handleUpdateLetterField('paragraphs', updated);
  };

  const handleMoveParagraph = (index: number, direction: 'up' | 'down') => {
    const list = [...(slideThree.paragraphs || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    handleUpdateLetterField('paragraphs', list);
  };

  const handleSaveDraftClick = () => {
    onSaveDraft();
    setStatusMessage('Draft saved securely to database!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handlePublishClick = () => {
    onPublish();
    setStatusMessage('Letter published live to website!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Restore letter found from browser storage scan
  const handleRestoreRecovered = () => {
    if (!recoverableLetter) return;
    const updatedSlideThree = {
      ...slideThree,
      paragraphs: recoverableLetter.paragraphs,
      ...(recoverableLetter.salutation ? { salutation: recoverableLetter.salutation } : {}),
      ...(recoverableLetter.signature ? { signature: recoverableLetter.signature } : {}),
      ...(recoverableLetter.signee ? { signee: recoverableLetter.signee } : {}),
    };
    onChange({
      ...content,
      slideThree: updatedSlideThree,
    });
    setRecoverableLetter(null);
    setStatusMessage(`Letter recovered from ${recoverableLetter.source} and restored to editor!`);
    setTimeout(() => setStatusMessage(''), 5000);
  };

  // Restore from a specific revision history entry
  const handleRestoreRevision = (rev: LetterRevision) => {
    if (!rev || !rev.paragraphs) return;
    const updatedSlideThree = {
      ...slideThree,
      paragraphs: rev.paragraphs,
      ...(rev.salutation ? { salutation: rev.salutation } : {}),
      ...(rev.signature ? { signature: rev.signature } : {}),
      ...(rev.signee ? { signee: rev.signee } : {}),
    };
    onChange({
      ...content,
      slideThree: updatedSlideThree,
    });
    setShowHistoryModal(false);
    setStatusMessage(`Restored letter revision from ${rev.dateStr}!`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Export current letter to a downloadable .txt file
  const handleExportTxt = () => {
    const parts: string[] = [];
    if (slideThree.salutation) parts.push(slideThree.salutation);
    (slideThree.paragraphs || []).forEach((p) => {
      if (p.text && p.text.trim()) parts.push(p.text.trim());
    });
    if (slideThree.signature) parts.push(slideThree.signature);
    if (slideThree.signee) parts.push(slideThree.signee);
    if (slideThree.dateString) parts.push(slideThree.dateString);

    const fullText = parts.join('\n\n');
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-personal-letter-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Letter exported to text file!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Import / paste raw text into paragraphs
  const handleBulkPaste = (mode: 'replace' | 'append') => {
    if (!pasteRawText.trim()) return;
    const blocks = pasteRawText
      .split(/\n\s*\n+/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (blocks.length === 0) return;

    const newParagraphs: LetterParagraph[] = blocks.map((text, idx) => ({
      id: `letter-p-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      text,
    }));

    let updatedList: LetterParagraph[];
    if (mode === 'replace') {
      updatedList = newParagraphs;
    } else {
      updatedList = [...(slideThree.paragraphs || []), ...newParagraphs];
    }

    handleUpdateLetterField('paragraphs', updatedList);
    setPasteRawText('');
    setShowPasteModal(false);
    setStatusMessage(`Imported ${blocks.length} paragraph(s) into your letter!`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Helper font class
  const getPreviewFontFamily = (style: LetterFontStyle) => {
    switch (style) {
      case 'cormorant':
        return 'font-cormorant';
      case 'playfair':
        return 'font-playfair';
      case 'cinzel':
        return 'font-cinzel';
      case 'caveat':
        return 'font-caveat text-2xl md:text-3xl';
      case 'modern':
      default:
        return 'font-sans-modern';
    }
  };

  return (
    <div className="space-y-6">
      {/* Recovery Banner if recoverable letter found */}
      {recoverableLetter && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#d4af37]/25 via-[#e2be67]/20 to-[#d4af37]/15 border-2 border-[#d4af37] shadow-xl text-white space-y-2 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#d4af37] text-black">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-cormorant text-lg font-bold text-[#fff7d6] flex items-center gap-2">
                  <span>💌 Recovered Personal Letter Found in Your Browser!</span>
                  <span className="text-[11px] font-sans-modern px-2 py-0.5 rounded-full bg-[#d4af37]/30 text-[#fff7d6] border border-[#d4af37]/40">
                    {recoverableLetter.source}
                  </span>
                </h4>
                <p className="font-sans-modern text-xs text-white/80 mt-1">
                  We scanned your browser storage and discovered your previously saved personal letter ({recoverableLetter.paragraphs.length} paragraph{recoverableLetter.paragraphs.length !== 1 ? 's' : ''}). Click below to immediately restore it into the editor!
                </p>
                <div className="mt-2 text-xs italic text-white/60 bg-black/30 p-2 rounded-lg max-h-20 overflow-y-auto">
                  "{recoverableLetter.paragraphs[0]?.text?.slice(0, 150)}..."
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRecoverableLetter(null)}
              className="text-white/40 hover:text-white p-1"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 pt-1 pl-11">
            <button
              type="button"
              onClick={handleRestoreRecovered}
              className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e2be67] text-black text-xs font-semibold font-sans-modern shadow-lg flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore My Letter Now</span>
            </button>
            <button
              type="button"
              onClick={() => setRecoverableLetter(null)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans-modern transition-all"
            >
              Keep Current Version
            </button>
          </div>
        </div>
      )}

      {/* Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-cormorant text-2xl font-medium text-[#fff7d6] mb-1">
            Personal Letter Editor
          </h3>
          <p className="font-sans-modern text-xs text-white/60">
            Write your entire heartfelt letter directly inside the website. Add paragraphs, customize fonts, save drafts, and publish.
          </p>
        </div>

        {/* Tab switch & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-white/[0.06] border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans-modern transition-all ${
                activeTab === 'write'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Write Letter
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans-modern transition-all ${
                activeTab === 'preview'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          {/* History / Revisions button */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans-modern border border-white/15 transition-all"
            title="View saved letter revisions & automatic backups"
          >
            <History className="w-3.5 h-3.5 text-[#e2be67]" />
            <span>Revisions ({revisions.length})</span>
          </button>

          {/* Export button */}
          <button
            type="button"
            onClick={handleExportTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans-modern border border-white/15 transition-all"
            title="Export letter to text file backup"
          >
            <Download className="w-3.5 h-3.5 text-white/70" />
            <span>Export .txt</span>
          </button>

          {/* Bulk Paste button */}
          <button
            type="button"
            onClick={() => setShowPasteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans-modern border border-white/15 transition-all"
            title="Paste entire letter at once"
          >
            <Upload className="w-3.5 h-3.5 text-white/70" />
            <span>Paste / Import</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraftClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans-modern border border-white/15 transition-all"
            title="Save as private draft"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handlePublishClick}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#e2be67] to-[#deb35e] text-black text-xs font-semibold font-sans-modern hover:brightness-110 active:scale-95 shadow-md transition-all"
            title="Publish final letter to public website"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            <span>Publish Letter</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-xs text-[#fff7d6] flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#e2be67]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Typography Presets Bar */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] font-medium">
              Curated Romantic Writing Styles
            </span>
          </div>
          <span className="text-[11px] text-white/40">Instant typography preset</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'cormorant', label: 'Romantic Serif', font: 'font-cormorant' },
            { id: 'playfair', label: 'Classic Literary', font: 'font-playfair' },
            { id: 'caveat', label: 'Handwritten Script', font: 'font-caveat' },
            { id: 'cinzel', label: 'Imperial Roman', font: 'font-cinzel' },
            { id: 'modern', label: 'Minimal Modern', font: 'font-sans-modern' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id as any)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                formatting.fontStyle === preset.id
                  ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#fff7d6]'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-white/70'
              }`}
            >
              <div className={`text-base truncate ${preset.font}`}>{preset.label}</div>
              <div className="text-[10px] text-white/40 capitalize">
                {preset.id === formatting.fontStyle ? 'Active Style' : 'Click to apply'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fine-Tuning Formatting Controls Bar */}
      <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center gap-4 text-xs font-sans-modern">
        {/* Font Family */}
        <div className="flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-[#d4af37]" />
          <select
            value={formatting.fontStyle}
            onChange={(e) => handleUpdateFormatting('fontStyle', e.target.value)}
            className="bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
          >
            <option value="cormorant">Cormorant Garamond (Serif)</option>
            <option value="playfair">Playfair Display (Literary)</option>
            <option value="cinzel">Cinzel (Roman)</option>
            <option value="caveat">Caveat (Handwritten Script)</option>
            <option value="modern">Plus Jakarta Sans (Modern)</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-1">
          <span className="text-white/60">Size:</span>
          {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handleUpdateFormatting('fontSize', size)}
              className={`px-2 py-1 rounded text-[11px] uppercase transition-all ${
                formatting.fontSize === size
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-3">
          <button
            type="button"
            onClick={() => handleUpdateFormatting('textAlign', 'left')}
            className={`p-1.5 rounded ${
              formatting.textAlign === 'left' ? 'bg-[#d4af37] text-black' : 'text-white/60 hover:text-white'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleUpdateFormatting('textAlign', 'center')}
            className={`p-1.5 rounded ${
              formatting.textAlign === 'center' ? 'bg-[#d4af37] text-black' : 'text-white/60 hover:text-white'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleUpdateFormatting('textAlign', 'justify')}
            className={`p-1.5 rounded ${
              formatting.textAlign === 'justify' ? 'bg-[#d4af37] text-black' : 'text-white/60 hover:text-white'
            }`}
            title="Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Style Toggles: Bold, Italic, Underline */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-3">
          <button
            type="button"
            onClick={() => handleUpdateFormatting('bold', !formatting.bold)}
            className={`p-1.5 rounded ${
              formatting.bold ? 'bg-[#d4af37] text-black' : 'text-white/60 hover:text-white'
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleUpdateFormatting('italic', !formatting.italic)}
            className={`p-1.5 rounded ${
              formatting.italic ? 'bg-[#d4af37] text-black' : 'text-white/60 hover:text-white'
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleUpdateFormatting('underline', !formatting.underline)}
            className={`p-1.5 rounded ${
              formatting.underline ? 'bg-[#d4af37] text-black' : 'text-white/60 hover:text-white'
            }`}
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drop Cap Toggle */}
        <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-white/80">
            <input
              type="checkbox"
              checked={formatting.dropCap}
              onChange={(e) => handleUpdateFormatting('dropCap', e.target.checked)}
              className="rounded accent-[#d4af37]"
            />
            <span>Drop Cap</span>
          </label>
        </div>

        {/* Line Spacing */}
        <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
          <span className="text-white/60">Spacing:</span>
          {(['normal', 'relaxed', 'loose'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleUpdateFormatting('lineSpacing', s)}
              className={`px-2 py-0.5 rounded text-[11px] capitalize ${
                formatting.lineSpacing === s
                  ? 'bg-white/20 text-[#fff7d6]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Text Color Swatches */}
        <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
          <span className="text-white/60">Color:</span>
          {[
            { label: 'Ivory', hex: '#f7f5f0' },
            { label: 'Gold', hex: '#f7e7b4' },
            { label: 'Warm Cream', hex: '#ede4d4' },
            { label: 'Soft Rose', hex: '#fce7ea' },
          ].map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => handleUpdateFormatting('textColor', c.hex)}
              className={`w-4 h-4 rounded-full border transition-transform ${
                formatting.textColor === c.hex ? 'scale-125 border-white ring-1 ring-[#d4af37]' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Main Content Area: Write View vs Live Preview View */}
      {activeTab === 'write' ? (
        <div className="space-y-5">
          {/* Letter Heading & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
                Letter Heading
              </label>
              <input
                type="text"
                value={slideThree.heading}
                onChange={(e) => handleUpdateLetterField('heading', e.target.value)}
                placeholder="e.g. My Personal Letter"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-base font-cormorant focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
                Letter Subtitle
              </label>
              <input
                type="text"
                value={slideThree.subtitle}
                onChange={(e) => handleUpdateLetterField('subtitle', e.target.value)}
                placeholder="e.g. Written directly from my heart"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-sm font-sans-modern focus:outline-none"
              />
            </div>
          </div>

          {/* Salutation */}
          <div>
            <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
              Opening Salutation
            </label>
            <input
              type="text"
              value={slideThree.salutation}
              onChange={(e) => handleUpdateLetterField('salutation', e.target.value)}
              placeholder="e.g. To My Beloved,"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-[#f7e7b4] text-lg font-cormorant italic focus:outline-none"
            />
          </div>

          {/* Paragraphs List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] font-medium">
                Letter Paragraphs ({slideThree.paragraphs?.length || 0})
              </label>
              <button
                type="button"
                onClick={() =>
                  handleAddParagraphAt((slideThree.paragraphs?.length || 1) - 1)
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/35 text-[#fff7d6] text-xs font-sans-modern transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Paragraph to End</span>
              </button>
            </div>

            {slideThree.paragraphs?.map((para, index) => (
              <div
                key={para.id || index}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 relative"
              >
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span className="font-sans-modern font-medium text-[#d4af37]">
                    Paragraph {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddParagraphAt(index)}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] flex items-center gap-1"
                      title="Insert paragraph below"
                    >
                      <Plus className="w-3 h-3 text-[#d4af37]" />
                      <span>Insert Below</span>
                    </button>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveParagraph(index, 'up')}
                      className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/70 hover:text-white"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === slideThree.paragraphs.length - 1}
                      onClick={() => handleMoveParagraph(index, 'down')}
                      className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/70 hover:text-white"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteParagraph(para.id)}
                      className="p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 ml-1"
                      title="Delete paragraph"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={para.text}
                  onChange={(e) => handleParagraphTextChange(para.id, e.target.value)}
                  placeholder={`Write your heartfelt thoughts for paragraph ${index + 1}...`}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 focus:border-[#d4af37] text-white text-base font-sans-modern leading-relaxed focus:outline-none resize-y"
                />
              </div>
            ))}
          </div>

          {/* Signature & Signee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
                Closing Valediction
              </label>
              <input
                type="text"
                value={slideThree.signature}
                onChange={(e) => handleUpdateLetterField('signature', e.target.value)}
                placeholder="e.g. Forever and always,"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-sm font-cormorant italic focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
                Your Name / Signature
              </label>
              <input
                type="text"
                value={slideThree.signee}
                onChange={(e) => handleUpdateLetterField('signee', e.target.value)}
                placeholder="e.g. With all my devotion, [Your Name]"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-base font-cormorant focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
                Date / Dedication Line
              </label>
              <input
                type="text"
                value={slideThree.dateString}
                onChange={(e) => handleUpdateLetterField('dateString', e.target.value)}
                placeholder="e.g. On your special anniversary"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-xs font-sans-modern focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        /* LIVE PREVIEW TAB */
        <div className="p-6 sm:p-10 rounded-2xl glass-panel border border-[#d4af37]/30 shadow-2xl relative">
          <div className="text-center mb-6 border-b border-white/10 pb-4">
            <span className="text-xs uppercase tracking-widest text-[#e2be67]">
              Live Rendered Letter Preview
            </span>
          </div>

          <div
            style={{ color: formatting.textColor || '#f7f5f0' }}
            className={`
              ${getPreviewFontFamily(formatting.fontStyle)}
              ${formatting.textAlign === 'center' ? 'text-center' : formatting.textAlign === 'justify' ? 'text-justify' : 'text-left'}
              ${formatting.bold ? 'font-bold' : 'font-normal'}
              ${formatting.italic ? 'italic' : 'not-italic'}
              ${formatting.underline ? 'underline' : 'no-underline'}
              space-y-6 leading-relaxed
            `}
          >
            {slideThree.salutation && (
              <p className="font-cormorant italic text-2xl text-[#f7e7b4]">
                {slideThree.salutation}
              </p>
            )}

            {slideThree.paragraphs?.map((p, i) => (
              <p
                key={p.id || i}
                className={formatting.dropCap && i === 0 ? 'drop-cap first-letter:font-cormorant' : ''}
              >
                {p.text}
              </p>
            ))}

            <div className="pt-8 border-t border-white/10 flex flex-col items-end gap-1">
              {slideThree.signature && (
                <p className="font-cormorant italic text-xl text-[#f7e7b4]">
                  {slideThree.signature}
                </p>
              )}
              {slideThree.signee && (
                <p className="font-cormorant text-2xl font-medium text-[#fff7d6]">
                  {slideThree.signee}
                </p>
              )}
              {slideThree.dateString && (
                <p className="text-xs text-white/40 tracking-wider font-sans-modern">
                  {slideThree.dateString}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REVISION HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#141414] border border-[#d4af37]/40 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#e2be67]" />
                <h3 className="font-cormorant text-xl font-bold text-[#fff7d6]">
                  Letter Version History & Automatic Backups
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-white/40 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-sans-modern text-xs text-white/70">
              Every time your letter is saved, a timestamped snapshot is securely preserved in your browser's private vault. You can review or restore any previous version below.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {revisions.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-xs font-sans-modern">
                  No previous saved revisions recorded in this browser session yet. Every time you save your letter, a snapshot will appear here automatically!
                </div>
              ) : (
                revisions.map((rev, index) => (
                  <div
                    key={rev.timestamp || index}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#d4af37]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#e2be67]">
                          {rev.dateStr || new Date(rev.timestamp).toLocaleString()}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                          {rev.paragraphs?.length || 0} paragraphs • ~{rev.wordCount || 0} words
                        </span>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2 italic">
                        "{rev.paragraphs?.[0]?.text?.slice(0, 120)}..."
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreRevision(rev)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#e2be67] text-black text-xs font-semibold font-sans-modern shrink-0 flex items-center gap-1 shadow-md"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Restore This Version</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans-modern"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK PASTE / IMPORT MODAL */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#141414] border border-[#d4af37]/40 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#e2be67]" />
                <h3 className="font-cormorant text-xl font-bold text-[#fff7d6]">
                  Paste / Bulk Import Your Personal Letter
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="text-white/40 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-sans-modern text-xs text-white/70">
              Have your letter written in Notes, Word, or Google Docs? Paste it below! Paragraphs separated by blank lines will automatically be parsed into neat, individually editable sections.
            </p>

            <textarea
              rows={10}
              value={pasteRawText}
              onChange={(e) => setPasteRawText(e.target.value)}
              placeholder="Paste your heartfelt letter text here...&#10;&#10;Separate each paragraph with an empty blank line..."
              className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-xs font-sans-modern focus:outline-none resize-y"
            />

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans-modern"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBulkPaste('append')}
                disabled={!pasteRawText.trim()}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-sans-modern disabled:opacity-40"
              >
                Append to Current Letter
              </button>
              <button
                type="button"
                onClick={() => handleBulkPaste('replace')}
                disabled={!pasteRawText.trim()}
                className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e2be67] text-black text-xs font-semibold font-sans-modern shadow-md disabled:opacity-40"
              >
                Replace Entire Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
