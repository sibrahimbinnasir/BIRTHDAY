export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  description: string;
  date?: string;
  location?: string;
}

export interface LetterParagraph {
  id: string;
  text: string;
}

export type LetterFontStyle = 'cormorant' | 'playfair' | 'cinzel' | 'caveat' | 'modern';

export interface LetterFormatting {
  fontStyle: LetterFontStyle;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  textAlign: 'left' | 'center' | 'justify';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  paragraphSpacing: 'normal' | 'spacious';
  textColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  dropCap: boolean;
  themePreset: 'romantic-gold' | 'champagne-rose' | 'vintage-parchment' | 'midnight-minimal';
}

export interface SiteContent {
  global: {
    siteTitle: string;
    nextButtonText: string;
    prevButtonText: string;
    beginButtonText: string;
    editButtonText: string;
    pauseScrollText: string;
    resumeScrollText: string;
    restartScrollText: string;
    speedScrollText: string;
    lightboxCloseText: string;
    adminPin: string;
    sitePassword?: string;
    sitePasswordEnabled?: boolean;
    sitePasswordTitle?: string;
    sitePasswordSubtitle?: string;
    sitePasswordHint?: string;
    bgAudioUrl?: string;
    bgAudioAutoplay?: boolean;
    bgAudioVolume?: number;
    bgAudioTrackTitle?: string;
  };

  welcome: {
    heading: string;
    subtitle: string;
    introParagraph: string;
    enterButtonText: string;
    ambientNote: string;
  };

  slideOne: {
    heading: string;
    subheading: string;
    paragraphs: string[];
    quoteHighlight: string;
    closingNote: string;
    autoScrollSpeed: number; // 1 to 5
  };

  slideTwo: {
    heading: string;
    subtitle: string;
    subheading?: string;
    emptyStateMessage: string;
    photos: GalleryPhoto[];
    autoScrollSpeed?: number;
  };

  slideThree: {
    heading: string;
    subtitle: string;
    salutation: string;
    paragraphs: LetterParagraph[];
    signature: string;
    signee: string;
    dateString: string;
    formatting: LetterFormatting;
    draftSalutation?: string;
    draftParagraphs?: LetterParagraph[];
    draftSignature?: string;
    draftSignee?: string;
    draftFormatting?: LetterFormatting;
    isPublished: boolean;
    autoScrollSpeed: number; // 1 to 5
  };
}
