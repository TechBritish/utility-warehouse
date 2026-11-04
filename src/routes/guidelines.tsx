import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/uw/SiteHeader";

export const Route = createFileRoute("/guidelines")({
  head: () => ({
    meta: [
      { title: "Conversation Guide — UW Partner Coach" },
      {
        name: "description",
        content:
          "A practice summary of honest, careful ways to talk about UW, savings and earnings. Always follow UW's official Partner Guidelines.",
      },
      { property: "og:title", content: "Conversation Guide — UW Partner Coach" },
      {
        property: "og:description",
        content:
          "Good and risky ways to talk about UW, savings and earnings. A practice aid, not UW's official guidelines.",
      },
    ],
  }),
  component: GuidelinesPage,
});

const approved = [
  "UW lets you bundle your energy, broadband, mobile and insurance with one provider.",
  "You'll get one app and one bill for all the services you take with UW.",
  "I can give you a personalised quote based on your current bills.",
  "UW offers a Price Pledge on energy for eligible bundled customers.",
  "UW is regulated by Ofgem, Ofcom and the Financial Conduct Authority.",
  "Let's check your current contracts and any exit fees before you switch.",
];

const prohibited = [
  {
    text: "You'll definitely save £500 a year with UW.",
    reason: "Specific unverified savings claims cannot be guaranteed for every customer.",
  },
  {
    text: "Everyone who joins UW ends up saving money.",
    reason: "Universal guarantees are misleading — savings depend on individual circumstances.",
  },
  {
    text: "You could easily earn £5,000 a month as a Partner.",
    reason: "Never promise income. Earnings vary and are not guaranteed.",
  },
  {
    text: "It's passive income. Set it up once and the money rolls in.",
    reason: "Partner earnings depend on ongoing effort and on customers staying with UW. Calling it passive overstates it.",
  },
  {
    text: "You'll get £200 to £500 for every meeting you book.",
    reason: "Quoting per-meeting or per-customer sums as typical is an earnings claim. Use UW's own published figures and terms only.",
  },
  {
    text: "We're definitely cheaper than British Gas / EE / Sky.",
    reason: "Unverified comparisons against named competitors are not permitted.",
  },
  {
    text: "You need to sign up today or you'll miss out forever.",
    reason: "Pressure tactics and false urgency mislead people and damage trust.",
  },
  {
    text: "Other providers are ripping you off / are worse than us.",
    reason: "Disparaging competitors is not permitted in any customer conversation.",
  },
  {
    text: "This is the best deal you'll ever find, no exceptions.",
    reason: "Absolute statements cannot be substantiated and may mislead customers.",
  },
];

const accordionSections = [
  {
    value: "income",
    title: "Income Claims",
    why: "Why it matters: UK advertising and consumer protection rules require claims to be fair, clear and not misleading. Income claims are where Partner marketing most often goes wrong.",
    rules: [
      "Never state or imply a guaranteed income figure.",
      "Never present your own earnings, or anyone else's, as typical for new Partners.",
      "Do not promise earnings timelines (e.g. 'you'll be earning within a month').",
      "Point earnings questions to UW's official earnings information and commission plan.",
    ],
    instead: [
      "\"Earnings depend on the customers you sign up and vary from Partner to Partner.\"",
      "\"I can show you exactly how the commission plan works so you can see it for yourself.\"",
    ],
    script:
      "\"Everyone's results are different, but I'm happy to walk you through exactly how commission is calculated so you can decide if it's right for you.\"",
  },
  {
    value: "savings",
    title: "Savings Claims",
    why: "Why it matters: savings depend on each household's bills and usage. An unverified figure can mislead a customer.",
    rules: [
      "Only quote savings figures from an official UW quote for that household.",
      "Never state a fixed savings amount before running a quote.",
      "Avoid words like 'guaranteed' or 'always' when discussing savings.",
      "Make clear that savings depend on current tariffs and usage.",
    ],
    instead: [
      "\"Let's run a personalised quote so you can see exactly what you'd pay.\"",
      "\"Many customers do save when they bundle, but it depends on your current deals.\"",
    ],
    script:
      "\"I can't promise a figure until I've seen your current bills, but let's get you a personalised quote so you know exactly where you stand.\"",
  },
  {
    value: "product",
    title: "Product Claims",
    why: "Why it matters: customers rely on what you tell them about services, contracts and coverage.",
    rules: [
      "Only describe features and services that are currently live and available in the customer's area.",
      "Don't promise future features or roadmap items as if they exist today.",
      "Be accurate about contract lengths, exit fees and coverage.",
      "Refer technical or coverage questions to official UW resources if unsure.",
    ],
    instead: [
      "\"UW bundles energy, broadband, mobile and insurance under one account.\"",
      "\"Let me check availability and contract terms for your postcode before we go further.\"",
    ],
    script:
      "\"I want to make sure I give you accurate information, so let me confirm availability for your address before we talk numbers.\"",
  },
  {
    value: "social",
    title: "Social Proof & Testimonials",
    why: "Why it matters: testimonials must be genuine and must not imply typical results.",
    rules: [
      "Only share testimonials that are real, attributed and approved for use.",
      "Never imply a single testimonial represents a 'typical' customer outcome.",
      "Do not fabricate or exaggerate a customer story.",
      "Avoid using other Partners' private earnings stories without consent.",
    ],
    instead: [
      "\"One customer I helped saved by bundling their energy and broadband — results vary.\"",
      "\"I'll only share stories from people who've agreed I can.\"",
    ],
    script:
      "\"I can share a couple of real examples, but keep in mind everyone's situation is a bit different.\"",
  },
  {
    value: "marketing",
    title: "Marketing Materials",
    why: "Why it matters: UW provides official materials so everything customers see is accurate and up to date.",
    rules: [
      "Use UW's official materials, and check UW's Partner Guidelines before creating your own.",
      "Don't edit official UW materials.",
      "Do not post customer testimonials or savings figures on personal social media without approval.",
      "Always include required disclaimers on printed or digital materials.",
    ],
    instead: [
      "\"I'll use the official UW brochure to walk you through this.\"",
      "\"Let me check the official wording before I send that over.\"",
    ],
    script:
      "\"I always use our official materials so you're getting accurate, up-to-date information.\"",
  },
];

function GuidelinesPage() {
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <div className="min-h-dvh bg-background">
      {bannerVisible && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-brand px-4 py-3 text-primary-foreground sm:px-6">
          <p className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            This is a practice guide from John and Sheila's team, not UW's official Partner Guidelines. Always follow UW's own guidelines.
          </p>
          <button
            type="button"
            onClick={() => setBannerVisible(false)}
            aria-label="Dismiss banner"
            className="grid size-8 shrink-0 place-items-center rounded-lg hover:bg-primary-foreground/10"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="bg-gradient-brand py-14 text-primary-foreground sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-foreground/15">
              <ShieldCheck className="size-7" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance">
              Conversation guide
            </h1>
            <p className="mt-3 text-base text-primary-foreground/85 sm:text-lg">
              Honest, careful ways to talk about UW, savings and earnings
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <CheckCircle className="size-6 text-success" aria-hidden="true" />
                  Safer ways to say it
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Accurate and fair</p>
                <ul className="mt-5 space-y-3">
                  {approved.map((s) => (
                    <li
                      key={s}
                      className="flex gap-3 rounded-xl border-l-4 border-success bg-success/10 p-4 shadow-card"
                    >
                      <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                      <span className="text-sm leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <XCircle className="size-6 text-destructive" aria-hidden="true" />
                  Avoid saying
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Misleading or risky</p>
                <ul className="mt-5 space-y-3">
                  {prohibited.map((p) => (
                    <li
                      key={p.text}
                      className="flex gap-3 rounded-xl border-l-4 border-destructive bg-destructive/10 p-4 shadow-card"
                    >
                      <X className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
                      <span className="text-sm leading-relaxed">
                        <span className="font-medium">"{p.text}"</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {p.reason}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Accordion */}
        <section className="border-y border-border bg-secondary/50 py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              More detail
            </h2>
            <Accordion
              type="single"
              collapsible
              defaultValue="income"
              className="mt-8 space-y-3"
            >
              {accordionSections.map((s) => (
                <AccordionItem
                  key={s.value}
                  value={s.value}
                  className="rounded-2xl border border-border bg-card px-5 shadow-card"
                >
                  <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
                    {s.title}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-5 text-sm leading-relaxed">
                    <p className="text-muted-foreground">{s.why}</p>
                    <div>
                      <h3 className="text-sm font-semibold">Rules</h3>
                      <ul className="mt-2 space-y-1.5">
                        {s.rules.map((r) => (
                          <li key={r} className="flex gap-2 text-muted-foreground">
                            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">What to say instead</h3>
                      <ul className="mt-2 space-y-1.5">
                        {s.instead.map((i) => (
                          <li key={i} className="text-muted-foreground">
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border-l-4 border-success bg-success/10 p-4">
                      <p className="text-xs font-semibold tracking-wide text-success uppercase">
                        Example wording
                      </p>
                      <p className="mt-1">{s.script}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Footer card */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <ShieldCheck className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-lg font-semibold">UW's official rules come first</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                This page is a practice aid. UW's official Partner Guidelines, available to
                Partners through UW, always take priority. If you're unsure whether something is
                OK to say or post, ask John and Sheila before you use it.
              </p>
              <Button asChild className="mt-5 min-h-11 rounded-xl px-6">
                <a href="mailto:john.and.sheila@uw.partners">Ask John and Sheila</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
