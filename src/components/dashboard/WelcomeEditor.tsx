import React from 'react';
import { SiteContent } from '../../types/content';

interface WelcomeEditorProps {
  content: SiteContent;
  onChange: (updated: SiteContent) => void;
}

export const WelcomeEditor: React.FC<WelcomeEditorProps> = ({ content, onChange }) => {
  const { welcome } = content;

  const handleChange = (field: keyof typeof welcome, value: string) => {
    onChange({
      ...content,
      welcome: {
        ...welcome,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-cormorant text-2xl font-medium text-[#fff7d6] mb-1">
          Welcome Screen Settings
        </h3>
        <p className="font-sans-modern text-xs text-white/60">
          Personalize the first screen your girlfriend will see when opening the gift.
        </p>
      </div>

      <div className="space-y-4">
        {/* Main Heading */}
        <div>
          <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
            Main Heading
          </label>
          <input
            type="text"
            value={welcome.heading}
            onChange={(e) => handleChange('heading', e.target.value)}
            placeholder="e.g. A Celebration of You"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-base font-cormorant focus:outline-none"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
            Subtitle / Kicker
          </label>
          <input
            type="text"
            value={welcome.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="e.g. An intimate journey created for someone extraordinary"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-sm font-sans-modern focus:outline-none"
          />
        </div>

        {/* Intro Paragraph */}
        <div>
          <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
            Introductory Paragraph
          </label>
          <textarea
            rows={4}
            value={welcome.introParagraph}
            onChange={(e) => handleChange('introParagraph', e.target.value)}
            placeholder="Write a sweet introductory message welcoming her to her special gift..."
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-sm font-sans-modern leading-relaxed focus:outline-none resize-y"
          />
        </div>

        {/* Enter Button Text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
              Start Button Label
            </label>
            <input
              type="text"
              value={welcome.enterButtonText}
              onChange={(e) => handleChange('enterButtonText', e.target.value)}
              placeholder="e.g. Begin Our Journey"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-sm font-sans-modern focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-modern uppercase tracking-wider text-[#e2be67] mb-1.5 font-medium">
              Bottom Ambient Note
            </label>
            <input
              type="text"
              value={welcome.ambientNote}
              onChange={(e) => handleChange('ambientNote', e.target.value)}
              placeholder="e.g. Take your time · Crafted with all my love"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#d4af37] text-white text-sm font-cormorant italic focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
