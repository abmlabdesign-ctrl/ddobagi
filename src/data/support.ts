/**
 * Help center, notices and the support contact.
 *
 * `supportEmail` is left empty on purpose: set it to the real inbox before
 * launch and the Help center's `Contact us` row appears.
 */
export const supportEmail: string | null = null;

export const faq: { question: string; answer: string }[] = [
  {
    question: "I can't hear anything",
    answer:
      "Ddobak reads Korean with your device's own voice. Add a Korean voice in your system's speech or accessibility settings, and check your volume and silent switch.",
  },
  {
    question: "The mic doesn't work",
    answer:
      'Allow microphone access for Ddobak in your settings. On the web, the mic only opens on a secure (https) page.',
  },
  {
    question: "My words don't show up when I speak",
    answer:
      'Speech-to-text runs in Chrome, Edge and Safari and needs an internet connection. Firefox doesn’t support it yet.',
  },
  {
    question: 'Why can I only play some situations?',
    answer:
      'Pharmacy and Café are ready now. The other conversations are on their way and will open as they land.',
  },
  {
    question: 'Where is my progress saved?',
    answer:
      'On this device. Logging out or deleting your account clears it, so stay signed in to keep your streak.',
  },
];

export type Notice = {
  id: string;
  title: string;
  date: string;
  body: string;
};

/** Newest first. */
export const notices: Notice[] = [
  {
    id: 'n-2',
    title: 'Pharmacy and Café are ready to play',
    date: 'Sep 29',
    body: 'Start with these two roleplays. Your mistakes now land in the Mistake log, and saying the fix marks them fixed.',
  },
  {
    id: 'n-1',
    title: 'Welcome to Ddobak',
    date: 'Sep 12',
    body: "Practice real Korean conversations with AI. Try a roleplay, then review what you missed with 3-minute missions.",
  },
];
