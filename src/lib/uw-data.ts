// Static content catalog for the UW Partner Coach frontend: module copy,
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
  /** Path to the module's video walkthrough, served from /public. */
  video: string;
};

// `status`/`completedOn` below are placeholder defaults only — real values
// come from the `module_progress` table and overwrite these in
// `usePartnerData()`. They're only used as a fallback before that data loads.
export const trainingModules: TrainingModule[] = [
  {
    id: "1",
    number: 1,
    title: "Module 1: Your UW Story",
    shortTitle: "Your UW Story",
    description: "Craft the personal story that opens every customer conversation.",
    status: "unlocked",
    meta: "📹 12 min video • 🎙️ 5 min practice",
    video: "/your_uw_story.mp4",
    learn: [
      "Introduce yourself without sounding scripted",
      "Explain why you joined UW in under 30 seconds",
      "Turn everyday conversations into opportunities",
      "Ask for permission before pitching",
      "Handle the “is this one of those schemes?” question",
    ],
  },
  {
    id: "2",
    number: 2,
    title: "Module 2: Commission & Earnings",
    shortTitle: "Commission & Earnings",
    description: "Understand how you get paid — and how to talk about it compliantly.",
    status: "locked",
    meta: "📹 18 min video • 🎙️ 5 min practice",
    video: "/commission_and_earnings.mp4",
    learn: [
      "Read your commission statement with confidence",
      "Explain the earnings model without income promises",
      "Set realistic personal targets",
      "Know which numbers you may never quote",
      "Answer “how much do you make?” compliantly",
    ],
    prerequisite: { id: "1", title: "Module 1: Your UW Story" },
  },
  {
    id: "3",
    number: 3,
    title: "Module 3: Bill Savings & Social Proof",
    shortTitle: "Bill Savings & Social Proof",
    description:
      "Show customers where their money goes today, build a like-for-like comparison and use real stories to build trust — without ever promising a number you cannot prove.",
    status: "locked",
    meta: "📹 15 min video • 🎙️ 5 min practice",
    video: "/bill_savings_and_social_proof.mp4",
    learn: [
      "Calculate real customer savings using the UW bundle discount",
      "Handle “too expensive” objections with confidence",
      "Use social proof to build trust",
      "Show a bill comparison in under 60 seconds",
      "Close with the UW Price Pledge guarantee",
      "Keep every claim compliant and evidence-backed",
    ],
    prerequisite: { id: "2", title: "Module 2: Commission & Earnings" },
  },
  {
    id: "4",
    number: 4,
    title: "Module 4: Closing & Onboarding",
    shortTitle: "Closing & Onboarding",
    description: "Complete Module 3 to unlock",
    status: "locked",
    meta: "30 min interactive",
    video: "/closing_and_onboarding.mp4",
    learn: [
      "Ask for the switch naturally",
      "Complete the sign-up journey with the customer",
      "Set expectations for the first bill",
      "Book the follow-up call",
      "Ask for a referral the right way",
    ],
    prerequisite: { id: "3", title: "Module 3: Bill Savings & Social Proof" },
  },
];

export function getModule(id: string) {
  return trainingModules.find((m) => m.id === id);
}

// Badge catalog: static definitions (emoji/title/how-to-earn). The `earned`
// field here is always a placeholder — real earned state and dates come from
// the `user_badges` table and are computed in `usePartnerData()`.
export const badges = [
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

// Admin dashboard (`/admin`) data types and aggregation live in
// `use-admin-data.ts`, loaded live from Supabase across all partners.
