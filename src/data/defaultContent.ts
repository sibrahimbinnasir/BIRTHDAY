import { SiteContent } from '../types/content';

export const defaultContent: SiteContent = {
  global: {
    siteTitle: 'Elysian · For My Beloved',
    nextButtonText: 'Next',
    prevButtonText: 'Previous',
    beginButtonText: 'Enter Experience',
    editButtonText: 'Edit Website',
    pauseScrollText: 'Pause Reading',
    resumeScrollText: 'Resume Reading',
    restartScrollText: 'Restart Scroll',
    speedScrollText: 'Scroll Speed',
    lightboxCloseText: 'Close',
    adminPin: '1211', // Easy default PIN for first setup; can be changed in settings
    sitePassword: '1211', // Default password to unlock website access
    sitePasswordEnabled: true, // Requires visitors to enter password before opening site
    sitePasswordTitle: 'A Secret World For My Beloved',
    sitePasswordSubtitle: 'Please enter the secret password to open your gift',
    sitePasswordHint: '',
    bgAudioUrl: '/audio/romantic-piano.mp3',
    bgAudioAutoplay: true,
    bgAudioVolume: 0.45,
    bgAudioTrackTitle: 'Heartwarming · Romantic Piano Serenade',
  },

  welcome: {
    heading: 'A Celebration of You',
    subtitle: 'An intimate journey created for someone extraordinary',
    introParagraph: 'Every story has moments that linger like soft light. This is a private sanctuary created just for you—to celebrate your presence, our sweetest chapters, and words that belong only to you.',
    enterButtonText: 'Begin Our Journey',
    ambientNote: 'Take your time · Crafted with all my love',
  },

  slideOne: {
    heading: "Why You're Special",
    subheading: 'A reflection on everything that makes you rare and irreplaceable',
    paragraphs: [
      '[Write your personal message here. Open the private editing dashboard anytime to express in your own words why she holds your heart.]',
      '[Share your favorite qualities about her, the warmth in her laughter, the way she makes ordinary moments feel extraordinary, or what you admire most about who she is.]',
      '[You can add or remove as many paragraphs as you like through the Edit Website dashboard, and each word will smoothly scroll for comfortable reading.]',
    ],
    quoteHighlight: 'In a world of fleeting moments, having you is my greatest gift.',
    closingNote: 'Always and entirely yours.',
    autoScrollSpeed: 2, // comfortable reading speed
  },

  slideTwo: {
    heading: 'Our Cherished Moments',
    subtitle: 'A Few Adorable Pictures Of My Prettyyy Babbyyy😛💋😋',
    subheading: 'A Few Adorable Pictures Of My Prettyyy Babbyyy😛💋😋',
    emptyStateMessage: 'No memories added yet. Click Edit Website in the corner to upload your favorite photos, add captions, and arrange them in any order.',
    photos: [
      {
        id: 'photo-placeholder-1',
        url: '/src/assets/images/gallery_first_trip_1794133057763.jpg',
        caption: 'Adventures Along the Coast',
        description: 'Replace this photo in the dashboard with your own picture from your favorite memory together.',
        date: 'A Golden Afternoon',
        location: 'Our Favorite Spot',
      },
      {
        id: 'photo-placeholder-2',
        url: '/src/assets/images/gallery_twilight_stars_1794133058297.jpg',
        caption: 'Toasting Under City Lights',
        description: 'Upload your real photograph here with a personal note or caption.',
        date: 'Unforgettable Evening',
        location: 'Together Under Twilight',
      },
      {
        id: 'photo-placeholder-3',
        url: '/src/assets/images/gallery_coffee_morning_1794133058510.jpg',
        caption: 'Quiet Morning Light',
        description: 'Edit this caption and description in the dashboard to tell your personal story.',
        date: 'Quiet Morning',
        location: 'Our Sacred Space',
      },
      {
        id: 'photo-placeholder-4',
        url: '/src/assets/images/gallery_golden_meadow_1794133058974.jpg',
        caption: 'Warm Golden Days',
        description: 'Add more photos or delete placeholders anytime via the Edit Website button.',
        date: 'Memorable Getaway',
        location: 'Golden Meadow',
      },
    ],
    autoScrollSpeed: 2,
  },

  slideThree: {
    heading: 'My Personal Letter',
    subtitle: 'Written directly from my heart, especially for your birthday & anniversary',
    salutation: 'To My Beloved,',
    paragraphs: [
      {
        id: 'p-1',
        text: '[This is your personal letter. Use the built-in Letter Editor in the "Edit Website" dashboard to write your complete personal letter directly here. There is no character limit, and you can format each paragraph with elegant typography.]',
      },
      {
        id: 'p-2',
        text: '[You can choose between classical romantic serif, literary serif, minimal modern, or handwritten script fonts. You can also customize font sizes, line spacing, drop-caps, and alignments.]',
      },
      {
        id: 'p-3',
        text: '[Save your letter as a draft while writing, preview exactly how it will appear, and publish it when you are ready. It will remain securely saved across all devices and page refreshes.]',
      },
    ],
    signature: 'Forever with you,',
    signee: '[Your Name Here]',
    dateString: 'With all my devotion',
    formatting: {
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
    },
    isPublished: true,
    autoScrollSpeed: 2,
  },
};
