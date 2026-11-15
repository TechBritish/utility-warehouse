// Membership plans. Paste each Stripe Payment Link URL into `paymentLink`
// (Stripe dashboard → Payment Links → Create, recurring monthly price).
// Until a link is added, the button sends people to "Book a chat with Sheila".

export type PlanId = "basic" | "premium";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  pence: number;
  tagline: string;
  features: { text: string; soon?: boolean }[];
  paymentLink: string;
  highlight?: boolean;
};

export const BOOKING_URL = "https://partner.uw.co.uk/partner/john-and-sheila-gwillam-winter-854311";

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "£29.99",
    pence: 2999,
    tagline: "Everything you need to get started with confidence.",
    paymentLink: "https://buy.stripe.com/test_eVq00j8Hr1aafkv4tJdjO00",
    features: [
      { text: "All 4 foundation training modules" },
      { text: "Voice AI practice with real-style customers" },
      { text: "Ava, your 24/7 AI guide" },
      { text: "Progress tracking, badges and rewards" },
      { text: "Conversation guide and UW guidelines" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "£149.99",
    pence: 14999,
    tagline: "For Partners who want to grow faster with Sheila by their side.",
    paymentLink: "https://buy.stripe.com/test_dRm9AT4rb0660pB4tJdjO01",
    highlight: true,
    features: [
      { text: "Everything in Basic" },
      { text: "Unlimited Voice AI practice" },
      { text: "1-to-1 coaching with Sheila" },
      { text: "Your own referral page and link", soon: true },
      { text: "Advanced training modules", soon: true },
    ],
  },
];

export function checkoutUrl(plan: Plan, opts: { userId?: string | null; email?: string | null }): string | null {
  if (!plan.paymentLink) return null;
  const url = new URL(plan.paymentLink);
  if (opts.userId) url.searchParams.set("client_reference_id", opts.userId);
  if (opts.email) url.searchParams.set("prefilled_email", opts.email);
  return url.toString();
}
