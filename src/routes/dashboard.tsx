import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Check, Lock, Mic, PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AppHeader } from "@/components/uw/AppHeader";
import { RequireAuth } from "@/components/uw/RequireAuth";
import { getSession, getDisplayName } from "@/lib/auth";
import { usePartnerData } from "@/lib/use-partner-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Training — Partner Coach" },
      {
        name: "description",
        content: "Your four-step UW Partner training: watch, read, practise, done.",
      },
      { property: "og:title", content: "My Training — Partner Coach" },
      {
        property: "og:description",
        content: "Four short modules and a 24/7 voice AI practice coach.",
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

function Dashboard() {
  const { loading, modules, stats } = usePartnerData();
  const firstName = getDisplayName(getSession()).split(" ")[0];
  const allDone = stats.modulesCompleted === stats.totalModules;
  const next = modules.find((m) => m.status === "unlocked") ?? stats.nextModule;
  const percent = Math.round((stats.modulesCompleted / stats.totalModules) * 100);

  return (
    <div className="min-h-dvh bg-secondary/40 pb-16">
      <AppHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:py-10">
        <section aria-labelledby="progress-heading">
          <h1 id="progress-heading" className="text-3xl font-bold tracking-tight">
            Hi {firstName} 👋
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your training is four short modules. Each one is: watch a short video, read the key
            points, practise out loud, done. About 15 minutes each.
          </p>
        </section>

        {/* The one thing to do next */}
        <Card className="p-6" aria-labelledby="next-heading">
          {loading ? (
            <Skeleton className="h-28 w-full rounded-xl" />
          ) : allDone ? (
            <div className="text-center">
              <PartyPopper className="mx-auto size-10 text-brand" aria-hidden="true" />
              <h2 id="next-heading" className="mt-3 text-xl font-bold">
                You've finished all four modules!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Keep practising with your AI coach, and book a chat with Sheila to plan your next steps.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild className="min-h-12 rounded-xl px-6 text-base">
                  <Link to="/trainer">
                    <Mic aria-hidden="true" />
                    Practise a conversation
                  </Link>
                </Button>
                <Button asChild variant="outline" className="min-h-12 rounded-xl px-6 text-base">
                  <a href={SHEILA_BOOKING_URL} target="_blank" rel="noreferrer">
                    <CalendarCheck aria-hidden="true" />
                    Book a chat with Sheila
                  </a>
                </Button>
              </div>
            </div>
          ) : next ? (
            <>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold">
                  {stats.modulesCompleted} of {stats.totalModules} modules done
                </span>
                <span className="text-muted-foreground">{percent}%</span>
              </div>
              <Progress value={percent} className="mt-2 h-2" />
              <h2 id="next-heading" className="mt-6 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {stats.modulesCompleted === 0 ? "Start here" : "Up next"}
              </h2>
              <p className="mt-1 text-xl font-bold">
                Module {next.number}: {next.shortTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{next.description}</p>
              <Button asChild className="mt-5 min-h-14 w-full rounded-xl text-base">
                <Link to="/training/$moduleId" params={{ moduleId: next.id }}>
                  {stats.modulesCompleted === 0 ? "Start Module 1" : `Continue to Module ${next.number}`}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </>
          ) : null}
        </Card>

        {/* All four modules, in order */}
        <section aria-labelledby="modules-heading">
          <h2 id="modules-heading" className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Your four modules
          </h2>
          <ol className="mt-3 space-y-3">
            {modules.map((m) => {
              const done = m.status === "completed";
              const locked = m.status === "locked";
              const row = (
                <div
                  className={
                    locked
                      ? "flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4 opacity-70"
                      : "flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
                  }
                >
                  <span
                    className={
                      done
                        ? "grid size-10 shrink-0 place-items-center rounded-full bg-success text-success-foreground"
                        : locked
                          ? "grid size-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
                          : "grid size-10 shrink-0 place-items-center rounded-full bg-gradient-brand font-bold text-primary-foreground"
                    }
                  >
                    {done ? (
                      <Check className="size-5" aria-hidden="true" />
                    ) : locked ? (
                      <Lock className="size-4" aria-hidden="true" />
                    ) : (
                      m.number
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      Module {m.number}: {m.shortTitle}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {done ? "Done ✓ (tap to look back)" : locked ? `Opens after Module ${m.number - 1}` : "Ready to start"}
                    </span>
                  </span>
                  {!locked && <ArrowRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />}
                </div>
              );
              return (
                <li key={m.id}>
                  {locked ? (
                    row
                  ) : (
                    <Link to="/training/$moduleId" params={{ moduleId: m.id }} className="block">
                      {row}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Practice any time */}
        <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
            <Mic className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Practise any time</h2>
            <p className="text-sm text-muted-foreground">
              Talk to your AI coach, who plays a customer. Great before a real conversation.
            </p>
          </div>
          <Button asChild variant="outline" className="min-h-12 rounded-xl px-6">
            <Link to="/trainer">Open practice</Link>
          </Button>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Stuck? Tap Ava, bottom right, or{" "}
          <a href={SHEILA_BOOKING_URL} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">
            book a chat with Sheila
          </a>
          .
        </p>
      </main>
    </div>
  );
}
