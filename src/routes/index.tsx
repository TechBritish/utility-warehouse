import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mic,
  Clock,
  TrendingUp,
  Play,
  Check,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader, UwLogo } from "@/components/uw/SiteHeader";
import { Waveform } from "@/components/uw/Waveform";
import { LeadForm } from "@/components/uw/LeadForm";
import { VideoDemoDialog } from "@/components/uw/VideoDemoDialog";
import { ModulesExplorer } from "@/components/uw/ModulesExplorer";
import { DialogTrigger } from "@/components/ui/dialog";
import heroPartner from "@/assets/hero-partner.jpg";
import aiOrb from "@/assets/ai-orb.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Partner Coach — Voice AI Training for New UW Partners" },
      {
        name: "description",
        content:
          "Practise real customer conversations with a 24/7 voice AI coach. Four foundation modules, instant feedback and progress tracking for UW Partners.",
      },
      { property: "og:title", content: "Partner Coach — Your Personal AI Coach for UW Success" },
      {
        property: "og:description",
        content:
          "Voice-first training for new UW Partners. Practise anywhere, build confidence before your first customer conversation.",
      },
    ],
  }),
  component: Landing,
});

const reasons = [
  {
    icon: Mic,
    title: "Practice real conversations",
    body: "Role-play customer objections and questions with an AI that responds like a real prospect. No judgment, unlimited retries.",
  },
  {
    icon: Clock,
    title: "Train on your schedule",
    body: "Five-minute sessions between errands or deep practice at midnight. The AI coach never sleeps.",
  },
  {
    icon: TrendingUp,
    title: "Track your progress",
    body: "See your confidence grow. The AI adapts to your level and highlights what to work on next.",
  },
];

const steps = [
  {
    n: "01",
    title: "Sign up in 30 seconds",
    body: "Just your name and email to get started.",
  },
  {
    n: "02",
    title: "Complete 4 foundation modules",
    body: "UW basics, commission plan, bill savings, your first customer.",
  },
  {
    n: "03",
    title: "Practise with your AI coach",
    body: "Tap, speak, get instant feedback on every answer.",
  },
  {
    n: "04",
    title: "Go live with confidence",
    body: "Have your first real conversation and unlock advanced training.",
  },
];


const faqs = [
  {
    q: "Is this portal only for new UW Partners?",
    a: "Primarily yes, but existing Partners can refresh their skills any time.",
  },
  {
    q: "Do I need to finish training before speaking to customers?",
    a: "We strongly recommend Modules 1–4 and at least three AI practice sessions first. Confidence makes conversations easier.",
  },
  {
    q: "How much does the training cost?",
    a: "There's no charge for the portal. It's exclusive to Partners in John and Sheila's team, so ask Sheila if you'd like access.",
  },
  {
    q: "Will the AI help me earn more?",
    a: "The AI helps you practise conversations and build confidence. Your results depend on your effort, your market and how you apply the training.",
  },
  {
    q: "Is this run by Utility Warehouse?",
    a: "No. Partner Coach is an independent practice tool for John and Sheila's Partner team. It doesn't replace UW's own training or the official UW Partner Guidelines, which you must always follow.",
  },
  {
    q: "What if I don't like talking to an AI?",
    a: "No problem. Every module has written content and video. The AI is optional, but most Partners find it the fastest way to build confidence.",
  },
];

function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-70"
            style={{
              background:
                "radial-gradient(60% 50% at 15% 0%, var(--brand-soft), transparent 70%), radial-gradient(50% 40% at 95% 10%, color-mix(in oklab, var(--gold) 25%, transparent), transparent 70%)",
            }}
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div className="animate-rise">
              <Badge className="rounded-full border-0 bg-accent px-3 py-1 text-accent-foreground hover:bg-accent">
                Voice-first partner training
              </Badge>
              <h1 className="mt-5 text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Your personal <span className="text-gradient-brand">AI coach</span> for UW success
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Practise real customer conversations with a 24/7 voice AI coach, then put it into
                practice with support from John and Sheila's UW Partner team.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-h-12 rounded-xl px-6 text-base">
                  <Link to="/signup">
                    Start your training
                    <ArrowRight />
                  </Link>
                </Button>
                <VideoDemoDialog>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className="min-h-12 rounded-xl border-primary/40 px-6 text-base text-primary hover:bg-accent"
                    >
                      <Play />
                      Watch how it works
                    </Button>
                  </DialogTrigger>
                </VideoDemoDialog>
              </div>
              <ul className="mt-9 grid gap-3 sm:grid-cols-2">
                {[
                  "Four short foundation modules",
                  "Available 24/7 on any device",
                  "Practise until you're confident",
                  "Exclusive to Sheila's team",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 shrink-0 text-success" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hero visual */}
            <div className="relative animate-rise lg:pl-16" style={{ animationDelay: "120ms" }}>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-night p-6 shadow-lift sm:p-8">
                <div className="flex items-center justify-between text-primary-foreground/70">
                  <span className="text-xs font-medium tracking-wide uppercase">
                    Live practice session
                  </span>
                  <span className="font-mono text-xs">04:12</span>
                </div>
                <Waveform className="my-8 h-32" />
                <div className="space-y-3">
                  <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary-foreground/12 px-4 py-3 text-sm text-primary-foreground">
                    How do I explain the bundle discount?
                  </p>
                  <p className="max-w-[90%] rounded-2xl rounded-bl-sm bg-gradient-brand px-4 py-3 text-sm text-primary-foreground shadow-lift">
                    Great question! Let me walk you through it — start with the bills they already
                    pay, then show what changes when they come together.
                  </p>
                </div>
              </div>
              <img
                src={heroPartner}
                alt="A woman practising a voice session on her phone in a café"
                width={1024}
                height={1280}
                className="absolute bottom-6 left-0 hidden size-32 rounded-3xl border-4 border-background object-cover shadow-lift lg:block"
              />
            </div>
          </div>
        </section>

        {/* Why voice AI */}
        <section id="why" className="border-y border-border bg-secondary/50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Why voice AI training?
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {reasons.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="size-6" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              From nervous to confident in four steps
            </h2>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <span className="font-mono text-sm font-medium text-primary">{s.n}</span>
                  <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Modules */}
        <section id="modules" className="border-y border-border bg-secondary/50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              What you'll master
            </h2>
            <div className="mt-6 flex items-center gap-4">
              <Progress value={0} className="h-2" />
              <span className="shrink-0 text-sm text-muted-foreground">0% complete</span>
            </div>
            <ModulesExplorer />
          </div>
        </section>

        {/* Meet your AI coach */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-night p-8 shadow-lift">
              <img
                src={aiOrb}
                alt="Abstract glowing orb representing the voice AI coach"
                loading="lazy"
                width={1024}
                height={1024}
                className="mx-auto size-56 rounded-full object-cover sm:size-72"
              />
              <Waveform className="mt-8 h-16" bars={[24, 44, 62, 36, 70, 40, 26, 52, 32]} />
              <p className="mt-6 text-center font-mono text-xs text-primary-foreground/70">
                listening…
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Always ready to practise
              </h2>
              <ul className="mt-7 space-y-4">
                {[
                  "Responds in natural conversation, not scripted Q&A",
                  "Handles objections like a real customer",
                  "Gives instant feedback on your answers",
                  "Adapts difficulty as you improve",
                  "Available in English, with more languages planned",
                ].map((f) => (
                  <li key={f} className="flex gap-3 text-sm leading-relaxed sm:text-base">
                    <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="mt-8 min-h-12 rounded-xl px-6">
                <Link to="/signup">
                  <Mic />
                  Start free training
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Your mentors */}
        <section className="border-y border-border bg-secondary/50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Real support from real people
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              The AI coach is for practice. When you're ready for real conversations, you're
              supported by John and Sheila Gwillam-Winter, UW Partners since 2003.
            </p>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                { title: "Partners since 2003", body: "More than two decades helping households in Kent and across the UK with their bills." },
                { title: "Senior Group Leader", body: "John and Sheila support and train their own team of UW Partners." },
                { title: "Practical help", body: "Questions the AI can't answer go to a real person. Contact details are at the bottom of this page." },
              ].map((c) => (
                <li key={c.title} className="rounded-2xl border-l-4 border-l-primary bg-card p-6 shadow-card">
                  <h3 className="text-base font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Free bill check (lead form) */}
        <section id="bill-check" className="scroll-mt-20 border-b border-border py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Get a free bill check from Sheila
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Leave your details and Sheila will look at what you pay today for energy, broadband,
                mobile and insurance, and get you a proper UW quote. Or ask her about becoming a
                Partner. No obligation, no pressure.
              </p>
            </div>
            <LeadForm />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Common questions</h2>
            <Accordion type="single" collapsible className="mt-8">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`f${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold text-primary hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-8 rounded-2xl bg-secondary p-5 text-xs leading-relaxed text-muted-foreground">
              UW Partners must follow UW's official Partner Guidelines at all times. Nothing on this
              site is an income claim or a guarantee of results. Earnings vary from Partner to
              Partner and depend on the customers you introduce.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center shadow-lift sm:p-16">
            <h2 className="text-3xl font-bold tracking-tight text-balance text-primary-foreground sm:text-4xl">
              You've got this. Let's practise your first conversation.
            </h2>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-8 min-h-12 rounded-xl px-8 text-base"
            >
              <Link to="/signup">
                <Mic />
                Start your training
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <UwLogo />
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a href="https://uw.co.uk" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                About UW
              </a>
              <Link to="/guidelines" className="text-muted-foreground hover:text-foreground">
                Conversation guide
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <a href="mailto:john.and.sheila@uw.partners" className="text-muted-foreground hover:text-foreground">
                Contact John and Sheila
              </a>
            </nav>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Partner Coach is an independent training resource for John and Sheila
            Gwillam-Winter's UW Partner team, built by British AI Consulting. It is not operated,
            approved or endorsed by Utility Warehouse Limited. "UW" and "Utility Warehouse" are
            used only to describe the services Partners refer.
          </p>
        </div>
      </footer>
    </div>
  );
}
