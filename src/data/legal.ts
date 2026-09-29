/**
 * Terms, privacy and voice-data notices.
 *
 * DRAFTS. These describe how the app behaves today (everything stays on the
 * device; speech-to-text runs through the browser's own service) so the flow
 * can be built and reviewed. They are not legal advice and must be replaced by
 * reviewed text before launch — flip `draft` off when they are.
 */
export type LegalDocId = 'terms' | 'privacy' | 'voice';

export type LegalDoc = {
  id: LegalDocId;
  title: string;
  /** Consent-row label on ON-1b. */
  consentLabel: string;
  updatedOn: string;
  sections: { heading: string; body: string }[];
};

export const legalDraft = true;

export const legalDocs: Record<LegalDocId, LegalDoc> = {
  terms: {
    id: 'terms',
    title: 'Terms of service',
    consentLabel: 'Terms of service',
    updatedOn: 'Sep 29, 2026',
    sections: [
      {
        heading: 'Using Ddobak',
        body: "Ddobak helps you practice spoken Korean through roleplay, feedback and short missions. You can use it for your own learning. Don't use it to harm others or to break the law.",
      },
      {
        heading: 'Your account',
        body: "You sign in with Google, Apple or email. Keep your sign-in details to yourself. You can log out or delete your account at any time from Settings.",
      },
      {
        heading: 'AI feedback',
        body: "Feedback and scores are practice aids. They can be wrong, so don't rely on them for exams, medical, legal or official matters.",
      },
      {
        heading: 'Ddobak Plus',
        body: "Plus is a subscription that renews automatically at the price shown when you subscribe, until you cancel. A free trial, if offered, turns into a paid plan when it ends unless you cancel before then. Cancel at least 24 hours before renewal in your App Store or Google Play account; you keep Plus until the period you paid for ends. Refunds follow the store's policy.",
      },
      {
        heading: 'Changes',
        body: "We may update the app and these terms. When the terms change in a way that matters, we'll tell you in the app before it takes effect.",
      },
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy policy',
    consentLabel: 'Privacy policy',
    updatedOn: 'Sep 29, 2026',
    sections: [
      {
        heading: 'What we keep',
        body: 'Your profile (nickname, avatar, languages, level, interests), your learning answers, saved phrases, mistakes and practice history.',
      },
      {
        heading: 'Where it lives',
        body: "Today it's stored only on this device. Logging out or deleting your account erases it from the device.",
      },
      {
        heading: 'Why we use it',
        body: 'To pick situations and missions for you, show your progress, and remember your settings.',
      },
      {
        heading: 'Your choices',
        body: 'You can edit your profile, turn off reminders, and delete everything from Settings › Delete account.',
      },
    ],
  },
  voice: {
    id: 'voice',
    title: 'Voice recordings',
    consentLabel: 'Recording and processing my voice',
    updatedOn: 'Sep 29, 2026',
    sections: [
      {
        heading: 'What we record',
        body: 'When you tap the mic, Ddobak records what you say so you can hear it back and get feedback on it.',
      },
      {
        heading: 'Speech-to-text',
        body: "On the web, your browser's speech service (Google in Chrome and Edge, Apple in Safari) turns your voice into text. Your audio goes to that service to do this.",
      },
      {
        heading: 'How long we keep it',
        body: "Recordings stay on your device until you leave the screen. We don't upload or keep them.",
      },
      {
        heading: 'Saying no',
        body: "Speaking practice needs the mic. Without it you can still browse situations, read transcripts and do the writing and choice missions.",
      },
    ],
  },
};
