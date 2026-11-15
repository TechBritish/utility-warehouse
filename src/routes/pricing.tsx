import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Crown, Lock, ShieldCheck, Sparkles, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/uw/SiteHeader";
import { BOOKING_URL, checkoutUrl, PLANS, type Billing, type Plan } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing | Partner Coach" },
      {
        name: "description",
        content: "Partner Coach membership: Basic £29.99 a month or Premium £149.99 a month, or save 20% paying yearly. Cancel any time.",
      },
    ],
  }),
  component: PricingPage,
});

const FAQS = [
  {
    q: "Can I cancel any time?",
    a: "Yes. There's no contract. Cancel whenever you like and you keep access until the end of the month you've paid for.",
  },
  {
    q: "Can I switch between Basic and Premium?",
    a: "Yes. Start on Basic and move up to Premium whenever you're ready, or step back down.",
  },
  {
    q: "Is this run by Utility Warehouse?",
    a: "No. Partner Coach is an independent training tool for John and Sheila's Partner team. It's separate from UW's own joining fee and doesn't replace UW's official training or Partner Guidelines.",
  },
  {
    q: "Will this guarantee I earn money?",
    a: "No. Partner Coach helps you practise and build confidence. What you earn as a UW Partner depends on your own effort and the customers you introduce.",
  },
  {
    q: "How do I pay?",
    a: "By card through Stripe, a secure payment provider. We never see or store your card details.",
  },
];

function PricingPage() {
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [billing, setBilling] = useState<Billing>("monthly");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id, email: data.user.email ?? null });
    });
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-70"
            style={{
              background:
                "radial-gradient(60% 50% at 15% 0%, var(--brand-soft), transparent 70%), radial-gradient(50% 40% at 95% 10%, color-mix(in oklab, var(--gold) 25%, transparent), transparent 70%)",
            }}
          />
          <div className="mx-auto max-w-6xl px-4 pt-14 pb-6 text-center sm:px-6 sm:pt-20">
            <span className="animate-rise inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles className="size-3.5" aria-hidden="true" /> Simple monthly membership
            </span>
            <h1 className="animate-rise mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Pick the plan that fits you
            </h1>
            <p className="animate-rise mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Train with voice AI, track your progress and get support from Sheila. No contract, cancel any
              time.
            </p>
          </div>
        </section>

        <section aria-label="Plans" className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
          <div className="mb-8 flex justify-center">
            <div role="radiogroup" aria-label="Billing" className="inline-flex items-center rounded-full border border-border bg-card p-1 shadow-card">
              {(["monthly", "yearly"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={billing === b}
                  onClick={() => setBilling(b)}
                  className={`min-h-11 rounded-full px-5 text-sm font-semibold transition-colors ${
                    billing === b ? "bg-gradient-brand text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {b === "monthly" ? "Monthly" : "Yearly"}
                  {b === "yearly" && (
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${billing === b ? "bg-white/25" : "bg-success/15 text-success"}`}>
                      Save 20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 md:items-stretch">
            {PLANS.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} billing={billing} user={user} delay={i * 0.1} />
            ))}
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Lock className="size-4" aria-hidden="true" /> Secure payment by Stripe
            </li>
            <li className="flex items-center gap-1.5">
              <Undo2 className="size-4" aria-hidden="true" /> Cancel any time
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="size-4" aria-hidden="true" /> No contract
            </li>
          </ul>
        </section>

        <section className="border-t border-border bg-secondary/40 py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Questions about pricing</h2>
            <Accordion type="single" collapsible className="mt-6">
              {FAQS.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-8 text-sm text-muted-foreground">
              Not sure which plan is right?{" "}
              <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">
                Book a quick chat with Sheila
              </a>
              . Just want lower bills?{" "}
              <Link to="/" hash="bill-check" className="font-medium text-brand hover:underline">
                Get a free bill check
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function PlanCard({
  plan,
  billing,
  user,
  delay,
}: {
  plan: Plan;
  billing: Billing;
  user: { id: string; email: string | null } | null;
  delay: number;
}) {
  const yearly = billing === "yearly";
  const href = checkoutUrl(plan, billing, { userId: user?.id ?? null, email: user?.email ?? null });
  const featured = plan.highlight;

  return (
    <div
      className={`animate-rise relative flex flex-col rounded-3xl p-6 sm:p-8 ${
        featured
          ? "uw-glow-border bg-card shadow-2xl"
          : "border border-border bg-card shadow-card"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      {featured && (
        <span aria-hidden="true" className="absolute inset-0 rounded-3xl bg-card" style={{ zIndex: -1 }} />
      )}
      {featured && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#f0b429] px-3 py-1 text-xs font-bold text-[#1e1240] shadow">
          <Crown className="size-3.5" aria-hidden="true" /> Most support
        </span>
      )}
      <h2 className="text-xl font-bold">{plan.name}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
      <p className="mt-5 flex items-baseline gap-1">
        <span className="text-5xl font-extrabold tracking-tight">{yearly ? plan.yearlyPrice : plan.price}</span>
        <span className="text-muted-foreground">{yearly ? "/year" : "/month"}</span>
      </p>
      {yearly && (
        <p className="mt-1 text-sm">
          <span className="text-muted-foreground line-through">{plan.yearlyFullPrice}</span>{" "}
          <span className="font-semibold text-success">You save 20%</span>
        </p>
      )}

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f.text} className="flex gap-3 text-sm sm:text-base">
            <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
            <span>
              {f.text}
              {f.soon && (
                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Coming soon
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {href ? (
        <Button
          asChild
          size="lg"
          className={`mt-8 min-h-12 rounded-xl text-base ${featured ? "uw-shine bg-gradient-brand" : ""}`}
          variant={featured ? "default" : "outline"}
        >
          <a href={href}>
            Choose {plan.name} <ArrowRight />
          </a>
        </Button>
      ) : (
        <Button
          asChild
          size="lg"
          className={`mt-8 min-h-12 rounded-xl text-base ${featured ? "uw-shine bg-gradient-brand" : ""}`}
          variant={featured ? "default" : "outline"}
        >
          <a href={BOOKING_URL} target="_blank" rel="noreferrer">
            Join {plan.name} with Sheila <ArrowRight />
          </a>
        </Button>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">{yearly ? "Billed once a year. Cancel renewal any time." : "Billed monthly. Cancel any time."}</p>
    </div>
  );
}
