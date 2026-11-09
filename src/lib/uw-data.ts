// Static content catalog for the Partner Coach frontend: module copy,
// badge definitions, and scenario labels.
// Per-user state (module progress, sessions, earned badges) is loaded live
// from Supabase via `usePartnerData()` — see src/lib/use-partner-data.ts.
// Cross-partner admin data is loaded live via `useAdminData()` — see
// src/lib/use-admin-data.ts.

export type ModuleStatus = "completed" | "unlocked" | "locked";

export type TrainingModule = {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  status: ModuleStatus;
  meta: string;
  completedOn?: string;
  learn: string[];
  prerequisite?: { id: string; title: string };
  /** Path to the module's short intro video, served from /public. */
  video: string;
  /** Trainer scenario this module's practice step opens. */
  practiceScenario: string;
  /** What to say out loud in the practice step. */
  practiceTask: string;
  /** The module's reading, in short sections. */
  sections: { heading: string; points: string[] }[];
};

// `status`/`completedOn` below are placeholder defaults only — real values
// come from the `module_progress` table and overwrite these in
// `usePartnerData()`. They're only used as a fallback before that data loads.
// Lesson copy drafted for John and Sheila to check before it goes live.
export const trainingModules: TrainingModule[] = [
  {
    id: "1",
    number: 1,
    title: "Module 1: Your UW Story",
    shortTitle: "Your UW Story",
    description: "Craft the personal story that opens every customer conversation.",
    status: "unlocked",
    meta: "About 15 minutes",
    video: "/your_uw_story.mp4",
    practiceScenario: "first-call",
    practiceTask: "Tell the coach who you are and why you joined UW, in under 30 seconds, then ask if they'd be open to a quick look at their bills.",
    learn: [
      "Introduce yourself without sounding scripted",
      "Explain why you joined UW in under 30 seconds",
      "Turn everyday conversations into opportunities",
      "Ask for permission before pitching",
      "Handle the “is this one of those schemes?” question",
    ],
    sections: [
      {
        heading: "Why your story matters",
        points: [
          "People say yes to people they trust, not to a sales pitch.",
          "A short, honest story about why you joined does more than any list of products.",
          "Keep it real: it's fine if your reason is simply wanting to help friends cut their bills.",
        ],
      },
      {
        heading: "Your 30-second story",
        points: [
          "Who you are: one line about you and your life.",
          "Why UW: what made you look into it (bills, flexibility, family, working around other things).",
          "What you do now: you help people bring their energy, broadband, mobile and insurance together.",
          "Write it down, say it out loud a few times, then make it sound like you.",
        ],
      },
      {
        heading: "Ask before you share",
        points: [
          "Never launch into it. Ask first: “Would you be open to me having a quick look at your bills sometime?”",
          "If they say no, that's fine. Stay friendly; most people come back later.",
          "Everyday moments (school gate, work, family chats) are natural openings. Listen for people mentioning bills.",
        ],
      },
      {
        heading: "“Is this one of those schemes?”",
        points: [
          "Stay calm and friendly. It's a fair question.",
          "UW is a long-established, regulated supplier. Partners are paid when real customers choose to switch their services.",
          "Never claim anyone will get rich, and never quote earnings.",
        ],
      },
    ],
  },
  {
    id: "2",
    number: 2,
    title: "Module 2: Commission & Earnings",
    shortTitle: "Commission & Earnings",
    description: "Understand how you get paid, and how to talk about it the right way.",
    status: "locked",
    meta: "About 15 minutes",
    video: "/bill_savings_and_social_proof.mp4",
    practiceScenario: "objections",
    practiceTask: "When the coach asks “how much do you make?”, answer honestly without quoting any figures.",
    learn: [
      "Understand the basics of how Partners are paid",
      "Explain the earnings model without income promises",
      "Set realistic personal goals",
      "Know which numbers you may never quote",
      "Answer “how much do you make?” the right way",
    ],
    prerequisite: { id: "1", title: "Module 1: Your UW Story" },
    sections: [
      {
        heading: "How Partners are paid",
        points: [
          "Partners are paid when customers they introduce switch to UW, plus an ongoing share while those customers stay.",
          "What anyone earns varies a lot and depends on their effort and the customers they introduce.",
          "John and Sheila will take you through your own commission statement and how it works.",
        ],
      },
      {
        heading: "Numbers you never quote",
        points: [
          "Never quote earnings, incomes, per-customer amounts or timelines, even your own.",
          "Never call it passive income or say money comes in without effort.",
          "Never quote joining fees or monthly costs to a prospect. Sheila covers costs properly on a chat.",
        ],
      },
      {
        heading: "When someone asks “how much do you make?”",
        points: [
          "Be honest and relaxed: “It really varies. It depends on the time you put in and the people you help.”",
          "Then hand over: “Sheila explains exactly how it works on a quick chat, no pressure.”",
          "Keep the focus on helping people with their bills.",
        ],
      },
      {
        heading: "Setting your own goals",
        points: [
          "Set goals about actions you control: conversations had, bill checks done, follow-ups made.",
          "Small, steady activity beats big bursts.",
          "Check in with John and Sheila regularly. That's what they're there for.",
        ],
      },
    ],
  },
  {
    id: "3",
    number: 3,
    title: "Module 3: Bill Savings & Social Proof",
    shortTitle: "Bill Savings & Social Proof",
    description: "Show customers where their money goes today and build trust, without promising a number you can't prove.",
    status: "locked",
    meta: "About 15 minutes",
    video: "/commission_and_earnings.mp4",
    practiceScenario: "savings",
    practiceTask: "Walk the coach through their current bills and offer an official UW quote, without promising any saving.",
    learn: [
      "Walk through a customer's current bills and get them an official UW quote",
      "Handle “too expensive” objections with confidence",
      "Use real stories to build trust",
      "Explain the UW Price Pledge accurately, including who qualifies",
      "Keep every claim honest and evidence-backed",
    ],
    prerequisite: { id: "2", title: "Module 2: Commission & Earnings" },
    sections: [
      {
        heading: "Start with their bills",
        points: [
          "Most people have never compared their services side by side. Your job is to show them, clearly and honestly.",
          "Ask to see recent bills, not guesses, for energy, broadband, mobile and insurance.",
          "Compare like for like: same speeds, same data, same cover.",
        ],
      },
      {
        heading: "Never promise a saving",
        points: [
          "Never quote a savings figure. Savings always come from an official, personalised UW quote.",
          "Say: “Let's get you a proper quote and see. If it's not better, I'll tell you.”",
          "Only describe the UW Price Pledge using UW's current official wording, including who it applies to.",
        ],
      },
      {
        heading: "“It sounds too expensive”",
        points: [
          "Acknowledge it, then go back to the facts: “Totally fair. Shall we look at what you pay today next to an actual quote?”",
          "Let the quote do the talking. Never pressure.",
        ],
      },
      {
        heading: "Real stories build trust",
        points: [
          "Share your own experience, or a customer's with their permission.",
          "Keep stories true and general. Never invent results or attach figures.",
          "Never put down other suppliers.",
        ],
      },
    ],
  },
  {
    id: "4",
    number: 4,
    title: "Module 4: Closing & Onboarding",
    shortTitle: "Closing & Onboarding",
    description: "Ask for the switch naturally, help them sign up and look after them afterwards.",
    status: "locked",
    meta: "About 15 minutes",
    video: "/closing_and_onboarding.mp4",
    practiceScenario: "closing",
    practiceTask: "After a good chat, ask the coach if they'd like to go ahead, then talk them through what happens next.",
    learn: [
      "Ask for the switch naturally",
      "Complete the sign-up journey with the customer",
      "Set expectations for the first bill",
      "Book the follow-up call",
      "Ask for a referral the right way",
    ],
    prerequisite: { id: "3", title: "Module 3: Bill Savings & Social Proof" },
    sections: [
      {
        heading: "Asking for the switch",
        points: [
          "If the quote works for them, simply ask: “Would you like to go ahead?”",
          "Then stop talking and let them answer.",
          "If they want time, agree a day to chat again. No pressure, no false urgency.",
        ],
      },
      {
        heading: "Signing up together",
        points: [
          "Go through the sign-up with them so nothing feels confusing.",
          "Check every detail is right before submitting.",
          "Explain that UW handles the switch, and what they'll hear from UW next.",
        ],
      },
      {
        heading: "After they switch",
        points: [
          "Explain what to expect from their first bill so there are no surprises.",
          "Book a quick follow-up call to check everything went smoothly.",
          "Be the person they can message with any question.",
        ],
      },
      {
        heading: "Asking for referrals",
        points: [
          "Once they're happy, ask: “Is there anyone you know who'd like a look at their bills too?”",
          "Never push. Happy customers are your best introductions.",
        ],
      },
    ],
  },
];

export function getModule(id: string) {
  return trainingModules.find((m) => m.id === id);
}

// Badge catalog: static definitions (emoji/title/how-to-earn). The `earned`
// field here is always a placeholder — real earned state and dates come from
// the `user_badges` table and are computed in `usePartnerData()`.
export const badges = [
  { id: "first-step", emoji: "🎬", title: "First Step", how: "Watch your first module video", earned: null },
  { id: "first-practice", emoji: "🗣️", title: "Found Your Voice", how: "Start your first practice with the AI coach", earned: null },
  { id: "halfway", emoji: "🚀", title: "Halfway There", how: "Complete 2 of the 4 modules", earned: null },
  { id: "fully-trained", emoji: "🎓", title: "Fully Trained", how: "Complete all 4 modules", earned: null },
  { id: "early-bird", emoji: "🏆", title: "Early Bird", how: "Complete Module 1 in 24 hours", earned: null },
  { id: "speed", emoji: "⚡", title: "Speed Learner", how: "Finish 2 modules in 1 week", earned: null },
  { id: "convo", emoji: "🎙️", title: "Conversationalist", how: "Complete 10+ AI sessions", earned: null },
  { id: "dedicated", emoji: "📚", title: "Dedicated", how: "Practise 5 days in a row", earned: null },
  { id: "first-customer", emoji: "🌟", title: "First Customer", how: "Sign your first customer", earned: null },
  { id: "on-fire", emoji: "🔥", title: "On Fire", how: "Keep a 7-day practice streak", earned: null },
];

export const scenarios = [
  { value: "objections", icon: "💬", label: "Customer objections" },
  { value: "product", icon: "❓", label: "Product Q&A" },
  { value: "first-call", icon: "📞", label: "First customer call" },
  { value: "closing", icon: "🤝", label: "Closing techniques" },
  { value: "savings", icon: "💰", label: "Bill savings walkthrough" },
];

/** Steps inside each module; finishing the module is the fourth. */
export const MODULE_STEPS = ["video", "read", "practice"] as const;
export type ModuleStep = (typeof MODULE_STEPS)[number];

// Admin dashboard (`/admin`) data types and aggregation live in
// `use-admin-data.ts`, loaded live from Supabase across all partners.
