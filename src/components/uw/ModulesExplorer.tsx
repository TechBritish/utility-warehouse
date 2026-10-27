import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Lightbulb,
  Calculator,
  PiggyBank,
  Handshake,
  Check,
  Lock,
  BarChart3,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trainingModules, type TrainingModule } from "@/lib/uw-data";

const icons = [Lightbulb, Calculator, PiggyBank, Handshake];

const extras: Record<
  string,
  { duration: string; difficulty: string; completions: string; takeaways: string[] }
> = {
  "1": {
    duration: "17 min",
    difficulty: "Beginner",
    completions: "5,102 completions",
    takeaways: [
      "A confident, natural opening line for any conversation",
      "The one question that qualifies a prospect in seconds",
    ],
  },
  "2": {
    duration: "23 min",
    difficulty: "Beginner",
    completions: "4,588 completions",
    takeaways: [
      "A compliant, honest way to talk about earnings",
      "A personal target you can actually hit this month",
    ],
  },
  "3": {
    duration: "20 min",
    difficulty: "Intermediate",
    completions: "3,214 completions",
    takeaways: [
      "A 60-second bill comparison that sells itself",
      "Your go-to response to 'it's too expensive'",
    ],
  },
  "4": {
    duration: "30 min",
    difficulty: "Intermediate",
    completions: "1,890 completions",
    takeaways: [
      "A smooth close that doesn't feel pushy",
      "A referral ask that keeps the door open",
    ],
  },
};

export function ModulesExplorer() {
  const modules = trainingModules as [TrainingModule, ...TrainingModule[]];
  const [activeId, setActiveId] = useState(modules[0].id);
  const active: TrainingModule = modules.find((m) => m.id === activeId) ?? modules[0];
  const activeIndex = Math.max(
    0,
    modules.findIndex((m) => m.id === activeId),
  );
  const ActiveIcon = icons[activeIndex] ?? Lightbulb;
  const info = extras[active.id] ?? {
    paragraphs: [active.description],
    duration: active.meta,
    difficulty: "Beginner",
    completions: "New module",
    takeaways: active.learn.slice(0, 2),
  };

  function moveFocus(delta: number) {
    const nextIndex = (activeIndex + delta + modules.length) % modules.length;
    setActiveId(modules[nextIndex]!.id);
  }


  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[280px_1fr]">
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Training modules"
        aria-orientation="vertical"
        className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            moveFocus(1);
          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            moveFocus(-1);
          }
        }}
      >
        {trainingModules.map((m, i) => {
          const Icon = icons[i] ?? Lightbulb;
          const isActive = m.id === activeId;
          return (
            <button
              key={m.id}
              id={`module-tab-${m.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`module-panel-${m.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(m.id)}
              className={
                "flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                (isActive
                  ? "bg-brand text-primary-foreground shadow-card"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground")
              }
            >
              <span
                className={
                  "grid size-9 shrink-0 place-items-center rounded-lg " +
                  (isActive ? "bg-primary-foreground/15" : "bg-background")
                }
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium tracking-wide uppercase opacity-80">
                  Module {m.number}
                </span>
                <span className="block truncate font-semibold">{m.shortTitle}</span>
              </span>
              {m.status === "locked" && (
                <Lock className="ml-auto size-4 shrink-0 opacity-70" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Preview */}
      <div
        id={`module-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`module-tab-${active.id}`}
        tabIndex={0}
        className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="grid size-32 shrink-0 place-items-center rounded-3xl bg-accent text-accent-foreground">
            <ActiveIcon className="size-16" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{active.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {active.description} Practise the exact phrasing with your AI coach until it feels
              natural, then get instant feedback on tone, pacing and compliance before you try it
              with a real customer.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Each module blends a short video walkthrough with hands-on voice practice, so you
              learn the theory and build the muscle memory in the same session.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BarChart3 className="size-3.5" aria-hidden="true" />
                {info.difficulty}
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-3.5" aria-hidden="true" />
                {info.completions}
              </span>
            </div>
          </div>
        </div>

        {/* Module video */}
        <div className="relative mt-6 max-h-[70vh] w-full overflow-hidden rounded-2xl bg-gradient-night">
          <video
            key={active.video}
            controls
            preload="metadata"
            className="mx-auto max-h-[70vh] w-full object-contain"
            aria-label={`${active.title} video walkthrough`}
          >
            <source src={active.video} type="video/mp4" />
          </video>
        </div>

        {/* What you'll learn */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold">What you'll learn</h4>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {active.learn.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Key takeaways */}
        <div className="mt-6 rounded-xl bg-secondary/60 p-4">
          <h4 className="text-sm font-semibold">Key takeaways</h4>
          <ul className="mt-2 space-y-1.5">
            {info.takeaways.map((item) => (
              <li key={item} className="text-sm text-muted-foreground">
                • {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {active.status === "locked" ? (
            <Badge variant="secondary" className="rounded-full text-muted-foreground">
              <Lock className="size-3" aria-hidden="true" />
              Sign in to unlock
            </Badge>
          ) : (
            <Button asChild size="lg" className="min-h-11 rounded-xl px-6">
              <Link to="/training">
                Start this module
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
