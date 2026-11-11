import React from 'react';
import { SiteContent } from '../../types/content';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface SpecialEditorProps {
  content: SiteContent;
  onChange: (updated: SiteContent) => void;
}

export const SpecialEditor: React.FC<SpecialEditorProps> = ({ content, onChange }) => {
  const { slideOne } = content;

  const handleChange = (field: keyof typeof slideOne, value: any) => {
    onChange({
      ...content,
      slideOne: {
        ...slideOne,
        [field]: value,
      },
    });
  };

  const handleParagraphChange = (index: number, text: string) => {
    const updated = [...(slideOne.paragraphs || [])];
    updated[index] = text;
    handleChange('paragraphs', updated);
  };

  const handleAddParagraph = () => {
    const updated = [...(slideOne.paragraphs || []), ''];
    handleChange('paragraphs', updated);
  };

  const handleDeleteParagraph = (index: number) => {
    const updated = slideOne.paragraphs.filter((_, i) => i !== index);
    handleChange('paragraphs', updated);
  };

  const handleMoveParagraph = (index: number, direction: 'up' | 'down') => {
    const list = [...slideOne.paragraphs];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    handleChange('paragraphs', list);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-cormorant text-2xl font-medium text-[#fff7d6] mb-1">
          Slide 1 · Why You're Special
        </h3>
        <p className="font-sans-modern text-xs text-white/60">
          Express in your own words why she means so much. Text will automatically and slowly scroll during reading.
        </p>
      </div>

      <div className="space-y-4">
        {/* Heading & Subtitle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
              Slide Heading
            </label>
            <input
              type="text"
              value={slideOne.heading}
              onChange={(e) => handleChange('heading', e.target.value)}
              placeholder="e.g. Why You're Special"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-base font-cormorant focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
              Subheading / Kicker
            </label>
            <input
              type="text"
              value={slideOne.subheading}
              onChange={(e) => handleChange('subheading', e.target.value)}
              placeholder="e.g. A reflection on everything that makes you rare"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-sm font-sans-modern focus:outline-none"
            />
          </div>
        </div>

        {/* Featured Quote Highlight */}
        <div>
          <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
            Featured Highlight Quote (Optional)
          </label>
          <input
            type="text"
            value={slideOne.quoteHighlight}
            onChange={(e) => handleChange('quoteHighlight', e.target.value)}
            placeholder="e.g. In a world of fleeting moments, having you is my greatest gift."
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-sm font-cormorant italic focus:outline-none"
          />
        </div>

        {/* Auto Scroll Speed Setting */}
        <div>
          <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
            Auto-Scroll Speed
          </label>
          <div className="grid grid-cols-3 gap-2 max-w-sm">
            {[
              { label: 'Very Slow', val: 1 },
              { label: 'Gentle (Default)', val: 2 },
              { label: 'Standard', val: 3 },
            ].map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => handleChange('autoScrollSpeed', s.val)}
                className={`py-2 px-3 rounded-lg text-xs font-sans-modern transition-all ${
                  (slideOne.autoScrollSpeed || 2) === s.val
                    ? 'bg-[#d4af37] text-black font-semibold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Paragraphs List */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] font-medium">
              Written Paragraphs ({slideOne.paragraphs?.length || 0})
            </label>
            <button
              type="button"
              onClick={handleAddParagraph}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/35 text-[#fff7d6] text-xs font-sans-modern transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Paragraph</span>
            </button>
          </div>

          <div className="space-y-4">
            {slideOne.paragraphs?.map((para, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 relative"
              >
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span className="font-sans-modern font-medium text-[#d4af37]">
                    Paragraph {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
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
                      disabled={index === slideOne.paragraphs.length - 1}
                      onClick={() => handleMoveParagraph(index, 'down')}
                      className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/70 hover:text-white"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteParagraph(index)}
                      className="p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 ml-1"
                      title="Delete paragraph"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={para}
                  onChange={(e) => handleParagraphChange(index, e.target.value)}
                  placeholder={`Write paragraph ${index + 1} here...`}
                  className="w-full px-3 py-2.5 rounded-lg bg-black/30 border border-white/10 focus:border-[#d4af37] text-white text-sm font-sans-modern leading-relaxed focus:outline-none resize-y"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Closing Note */}
        <div>
          <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
            Closing Sign-off Note
          </label>
          <input
            type="text"
            value={slideOne.closingNote}
            onChange={(e) => handleChange('closingNote', e.target.value)}
            placeholder="e.g. Always and entirely yours."
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-sm font-cormorant italic focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
