import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Mic,
  Lock,
  Check,
  PiggyBank,
  Handshake,
  CalendarCheck,
  ClipboardList,
  Clock,
  Target,
  Play,
  Trophy,
  History,
  User,
  Compass,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/uw/AppHeader";
import { OnboardingTour, useOnboardingTour } from "@/components/uw/OnboardingTour";
import { RequireAuth } from "@/components/uw/RequireAuth";
import { getSession, getDisplayName } from "@/lib/auth";
import { usePartnerData } from "@/lib/use-partner-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Training Dashboard — Partner Coach" },
      {
        name: "description",
        content:
          "Track your module progress, badges and voice AI practice sessions on your UW Partner training dashboard.",
      },
      { property: "og:title", content: "Your Training Dashboard — Partner Coach" },
      {
        property: "og:description",
        content: "Modules, progress, badges and 24/7 voice AI practice, all in one place.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

const SHEILA_BOOKING_URL = "https://partner.uw.co.uk/partner/john-and-sheila-gwillam-winter-854311";

const resources = [
  { icon: ClipboardList, label: "Conversation guide", meta: "Safer ways to talk about UW", to: "/guidelines" },
  { icon: History, label: "Past practice sessions", meta: "Transcripts and scores", to: "/sessions" },
  { icon: Trophy, label: "All badges", meta: "See what you can unlock", to: "/badges" },
] as const;

const quickActions = [
  { key: "practice", icon: Mic, label: "Practise now" },
  { key: "sessions", icon: History, label: "Past sessions" },
  { key: "profile", icon: User, label: "Update profile" },
  { key: "tour", icon: Compass, label: "Replay the tour" },
] as const;

function Dashboard() {
  const navigate = useNavigate();
  const progressRingRef = useRef<HTMLDivElement>(null);
  const nextModuleRef = useRef<HTMLDivElement>(null);
  const aiCardRef = useRef<HTMLDivElement>(null);
  const milestonesRef = useRef<HTMLDivElement>(null);
  const continueBtnRef = useRef<HTMLDivElement>(null);

  const { enabled: tourEnabled, dismiss } = useOnboardingTour();
  const { loading, modules, stats, recentActivity, badges, sessions, modulePercent } = usePartnerData();
  const [selectedBadge, setSelectedBadge] = useState<(typeof badges)[number] | null>(null);

  const displayName = getDisplayName(getSession());
  const firstName = displayName.split(" ")[0];

  const PROGRESS = stats.overallPercent;
  const badgesEarned = badges.filter((b) => b.earned).length;
  const AI_SESSIONS_COUNT = stats.aiSessionsCount;
  const lastSession = sessions[0];
  const upcomingLocked = modules.find((m) => m.status === "locked");
  const statCards = [
    { icon: Check, label: "Modules completed", value: `${stats.modulesCompleted} / ${stats.totalModules}` },
    { icon: Mic, label: "AI sessions", value: `${stats.aiSessionsCount} total` },
    { icon: Clock, label: "Practice time", value: `${stats.practiceMinutes} minutes` },
    { icon: Trophy, label: "Badges earned", value: `${badgesEarned} / ${badges.length}` },
    { icon: Target, label: "Up next", value: stats.nextModule?.shortTitle ?? "All done 🎉" },
  ];
  const continueModule = modules.find((m) => m.status === "unlocked") ?? stats.nextModule;


  const tourSteps = [
    {
      title: "Welcome to Partner Coach 👋",
      description:
        "This quick tour shows you exactly what to click to complete your training. It takes less than a minute — let's go!",
    },
    {
      title: "Your progress at a glance",
      description:
        "This ring is your overall progress. Every step counts: watching a video, reading the key points, practising and finishing a module.",
      ref: progressRingRef,
    },
    {
      title: "Always start here",
      description:
        "Your next module is always here. Tap it to open it. Each module is four simple steps: watch, read, practise, done.",
      ref: nextModuleRef,
    },
    {
      title: "Practice with your AI coach",
      description:
        "Rehearse real customer conversations by voice, any time — no judgment, unlimited retries. This is where confidence is built.",
      ref: aiCardRef,
    },
    {
      title: "Your training path",
      description:
        "All four modules with a progress bar each. They open one at a time, in order, so you can't get lost.",
      ref: milestonesRef,
    },
    {
      title: "You're ready!",
      description:
        "That's it. Tap “Continue training” to pick up exactly where you left off. You can replay this tour any time from Quick actions or your profile menu.",
      ref: continueBtnRef,
    },
  ];

  return (
    <div className="min-h-dvh bg-secondary/40 pb-24 lg:pb-0">
      <AppHeader />

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:py-10">
        {/* Left: progress */}
        <section aria-labelledby="progress-heading" className="space-y-5 lg:col-span-4 lg:order-1">
          {/* Achievement badges */}
          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Achievements
            </h2>
            <TooltipProvider delayDuration={200}>
              <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
                {badges.map((b) => {
                  const earned = Boolean(b.earned);
                  const card = (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => setSelectedBadge(b)}
                      className={
                        earned
                          ? "flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-card transition-transform duration-150 hover:-translate-y-0.5"
                          : "flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-muted/40 p-3 opacity-60 grayscale transition-transform duration-150 hover:-translate-y-0.5"
                      }
                      aria-label={`${b.title}${earned ? "" : " (locked)"}`}
                    >
                      <span className="relative text-3xl">
                        {b.emoji}
                        {!earned && (
                          <Lock className="absolute -right-1 -bottom-1 size-3.5 rounded-full bg-background p-0.5 text-locked" />
                        )}
                      </span>
                      <span className="truncate text-center text-xs font-medium">{b.title}</span>
                    </button>
                  );
                  return earned ? (
                    card
                  ) : (
                    <Tooltip key={b.id}>
                      <TooltipTrigger asChild>{card}</TooltipTrigger>
                      <TooltipContent>How to unlock: {b.how}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>

          <div ref={progressRingRef} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h1 id="progress-heading" className="text-xl font-bold tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You're on the Fast-Track path. Nice pace.
            </p>

            <div className="mt-6 flex justify-center">
              <ProgressRing value={PROGRESS} />
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              {stats.modulesCompleted} of {stats.totalModules} modules complete
            </p>

            <dl className="mt-6 space-y-3">
              {statCards.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <dt className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{label}</dt>
                  <dd className="shrink-0 text-sm font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div ref={continueBtnRef}>
              <Button asChild className="mt-6 min-h-12 w-full rounded-xl text-base">
                {continueModule ? (
                  <Link to="/training/$moduleId" params={{ moduleId: continueModule.id }}>
                    {stats.overallPercent === 0 ? "Start training" : "Continue training"}
                  </Link>
                ) : (
                  <Link to="/trainer">Practise with your AI coach</Link>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Middle: what's next */}
        <section aria-labelledby="next-heading" className="space-y-5 lg:col-span-5 lg:order-2">
          <h2 id="next-heading" className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            What's next
          </h2>

          {stats.nextModule ? (
            <article ref={nextModuleRef} className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                  <PiggyBank className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <Badge className="rounded-full border-0 bg-success/15 text-success hover:bg-success/15">
                    <Check className="size-3" aria-hidden="true" />
                    Unlocked
                  </Badge>
                  <h3 className="mt-2 text-lg font-semibold">{stats.nextModule.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {stats.nextModule.description}
                  </p>
                  <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Play className="size-3.5" aria-hidden="true" /> {stats.nextModule.meta} · Watch, read, practise, done
                    </span>
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Module progress</span>
                      <span>{modulePercent(stats.nextModule.id)}%</span>
                    </div>
                    <Progress value={modulePercent(stats.nextModule.id)} className="mt-1.5 h-2" />
                  </div>
                  <Button asChild className="mt-5 min-h-11 rounded-xl">
                    <Link to="/training/$moduleId" params={{ moduleId: stats.nextModule.id }}>
                      {modulePercent(stats.nextModule.id) > 0 ? "Continue module" : "Start module"}
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ) : (
            <article ref={nextModuleRef} className="rounded-2xl border border-border bg-gradient-night p-6 text-center text-primary-foreground shadow-card">
              <p className="text-sm font-semibold">All modules complete 🎉</p>
            </article>
          )}

          {upcomingLocked && (
            <article className="rounded-2xl border border-border bg-muted/50 p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted text-locked">
                  <Handshake className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <Badge variant="secondary" className="rounded-full text-muted-foreground">
                    <Lock className="size-3" aria-hidden="true" />
                    Locked
                  </Badge>
                  <h3 className="mt-2 text-lg font-semibold text-muted-foreground">
                    {upcomingLocked.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {upcomingLocked.prerequisite
                      ? `Complete ${upcomingLocked.prerequisite.title} to unlock.`
                      : "Complete the previous module to unlock."}
                  </p>
                  <Button disabled className="mt-5 min-h-11 rounded-xl">
                    Locked
                  </Button>
                </div>
              </div>
            </article>
          )}

          <article ref={aiCardRef} className="relative overflow-hidden rounded-2xl bg-gradient-night p-6 shadow-card">
            {AI_SESSIONS_COUNT === 0 ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="grid size-16 place-items-center rounded-full bg-brand/20 text-primary-foreground">
                  <Mic className="size-7" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-primary-foreground">
                  Start your first practice session
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-primary-foreground/75">
                  It only takes 5 minutes to build confidence
                </p>
                <Button asChild className="mt-5 min-h-11 rounded-xl">
                  <Link to="/trainer">Practice now</Link>
                </Button>
              </div>
            ) : (
              <>
                <span className="grid size-12 place-items-center rounded-2xl bg-primary-foreground/12 text-primary-foreground">
                  <Mic className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-primary-foreground">
                  Practise with your AI coach
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/75">
                  Feeling stuck? Ask your coach anything about UW services, objections or openers.
                </p>
                <p className="mt-3 font-mono text-xs text-primary-foreground/60">
                  {lastSession ? `Last session: ${lastSession.date} · ${lastSession.duration}` : "No sessions yet"}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-5 min-h-11 rounded-xl border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link to="/trainer">Start new session</Link>
                </Button>
              </>
            )}
          </article>

          {/* Recent activity */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Recent activity
            </h2>
            <ol className="mt-4 space-y-1">
              {recentActivity.slice(0, 5).map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-accent"
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Clock className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">{a.when}</span>
                    <span className="block text-sm font-medium">{a.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            {recentActivity.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing yet. Your first steps will show up here.
              </p>
            )}
            <Link to="/sessions" className="mt-2 inline-block text-sm font-medium text-brand hover:underline">
              View past practice sessions →
            </Link>
          </div>
        </section>

        {/* Right: milestones & resources */}
        <section aria-labelledby="milestones-heading" className="space-y-5 lg:col-span-3 lg:order-3">
          {/* Quick actions */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Quick actions
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {quickActions.map((qa) => {
                const Icon = qa.icon;
                const locked = false;
                return (
                  <button
                    key={qa.key}
                    type="button"
                    aria-label={qa.label}
                    onClick={() => {
                      if (qa.key === "practice") navigate({ to: "/trainer" });
                      else if (qa.key === "sessions") navigate({ to: "/sessions" });
                      else if (qa.key === "profile") navigate({ to: "/settings" });
                      else window.dispatchEvent(new Event("uw:start-tour"));
                    }}
                    className={
                      locked
                        ? "relative flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 p-3 text-center opacity-70"
                        : "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background p-3 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card"
                    }
                  >
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                    <span className="text-xs font-medium leading-tight">{qa.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={milestonesRef} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 id="milestones-heading" className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Your training path
            </h2>
            <ol className="mt-5 space-y-4">
              {modules.map((m) => {
                const pct = modulePercent(m.id);
                const locked = m.status === "locked";
                const inner = (
                  <>
                    <span className="flex items-center justify-between gap-2 text-sm">
                      <span className={locked ? "flex items-center gap-1.5 text-muted-foreground" : "font-medium"}>
                        {locked && <Lock className="size-3 shrink-0" aria-hidden="true" />}
                        {m.status === "completed" && <Check className="size-3.5 shrink-0 text-success" aria-hidden="true" />}
                        {m.number}. {m.shortTitle}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{locked ? "Locked" : `${pct}%`}</span>
                    </span>
                    <Progress value={pct} className="mt-1.5 h-1.5" />
                  </>
                );
                return (
                  <li key={m.id}>
                    {locked ? (
                      <div className="opacity-70">{inner}</div>
                    ) : (
                      <Link
                        to="/training/$moduleId"
                        params={{ moduleId: m.id }}
                        className="-mx-2 block rounded-xl px-2 py-1 hover:bg-accent"
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Resources
            </h2>
            <ul className="mt-4 space-y-1">
              {resources.map(({ icon: Icon, label, meta, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent"
                  >
                    <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{label}</span>
                      <span className="block text-xs text-muted-foreground">{meta}</span>
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={SHEILA_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent"
                >
                  <CalendarCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">Book a chat with Sheila</span>
                    <span className="block text-xs text-muted-foreground">Questions, support, next steps</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Mobile sticky practice CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <Button asChild className="min-h-12 w-full rounded-xl text-base">
          <Link to="/trainer">
            <Mic />
            Practise now
          </Link>
        </Button>
      </div>

      {/* Badge detail dialog */}
      <Dialog open={Boolean(selectedBadge)} onOpenChange={(open) => !open && setSelectedBadge(null)}>
        <DialogContent className="rounded-2xl">
          {selectedBadge && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <span className="text-3xl">{selectedBadge.emoji}</span>
                  {selectedBadge.title}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{selectedBadge.how}</p>
              <p className="text-sm">
                {selectedBadge.earned ? (
                  <span className="font-medium text-success">Earned {selectedBadge.earned}</span>
                ) : (
                  <span className="font-medium text-locked">Not yet unlocked</span>
                )}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>


      {tourEnabled && <OnboardingTour steps={tourSteps} onFinish={dismiss} />}
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative grid size-36 place-items-center"
      role="img"
      aria-label={`${value} percent of training complete`}
    >
      <svg viewBox="0 0 120 120" className="size-36 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
        />
      </svg>
      <span className="absolute text-3xl font-bold">{value}%</span>
    </div>
  );
}
