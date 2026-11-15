// Membership plans. Paste each Stripe Payment Link URL into `paymentLink`
// Live Stripe account: Empire Worldwide (acct_1Uc2taCtp2qIsfxI).
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
  /** Pay yearly, 20% off 12 months. */
  yearlyPrice: string;
  yearlyFullPrice: string;
  yearlyPence: number;
  yearlyPaymentLink: string;
  highlight?: boolean;
};

export type Billing = "monthly" | "yearly";

export const BOOKING_URL = "https://partner.uw.co.uk/partner/john-and-sheila-gwillam-winter-854311";

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "£29.99",
    pence: 2999,
    tagline: "Everything you need to get started with confidence.",
    paymentLink: "https://buy.stripe.com/28E6oG6gac6P1T4doV0oM02",
    yearlyPrice: "£287.90",
    yearlyFullPrice: "£359.88",
    yearlyPence: 28790,
    yearlyPaymentLink: "https://buy.stripe.com/eVq14mcEy0o79lw4Sp0oM05",
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
    paymentLink: "https://buy.stripe.com/3cI5kCawqdaTapA84B0oM03",
    yearlyPrice: "£1,439.90",
    yearlyFullPrice: "£1,799.88",
    yearlyPence: 143990,
    yearlyPaymentLink: "https://buy.stripe.com/aFa00i6gac6PgNY1Gd0oM04",
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

export function checkoutUrl(
  plan: Plan,
  billing: Billing,
  opts: { userId?: string | null; email?: string | null },
): string | null {
  const link = billing === "yearly" ? plan.yearlyPaymentLink : plan.paymentLink;
  if (!link) return null;
  const url = new URL(link);
  if (opts.userId) url.searchParams.set("client_reference_id", opts.userId);
  if (opts.email) url.searchParams.set("prefilled_email", opts.email);
  return url.toString();
}
