import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  Lock,
  FolderOpen,
  Trophy,
  PiggyBank,
  Handshake,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { TrainingModule, ModuleStatus } from "@/lib/uw-data";
import { usePartnerData } from "@/lib/use-partner-data";
import { RequireAuth } from "@/components/uw/RequireAuth";
import { AppHeader } from "@/components/uw/AppHeader";

export const Route = createFileRoute("/training/")({
  head: () => ({
    meta: [
      { title: "Your Training Path — Partner Coach" },
      {
        name: "description",
        content: "Track and complete your UW Partner training modules in sequence to unlock advanced content.",
      },
      { property: "og:title", content: "Your Training Path — Partner Coach" },
      {
        property: "og:description",
        content: "Complete modules in sequence to unlock advanced content.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <TrainingIndex />
    </RequireAuth>
  ),
});

const MODULE_ICONS: Record<string, typeof PiggyBank> = {
  "1": BookOpen,
  "2": ClipboardCheck,
  "3": PiggyBank,
  "4": Handshake,
};

type Filter = "all" | "completed" | "in-progress" | "locked";

function statusToFilter(status: ModuleStatus): Filter {
  if (status === "completed") return "completed";
  if (status === "unlocked") return "in-progress";
  return "locked";
}

function TrainingIndex() {
  const { loading, modules, stats } = usePartnerData();
  const [filter, setFilter] = useState<Filter>("all");
  const [progress, setProgress] = useState(0);

  const targetProgress = modules.length
    ? Math.round((stats.modulesCompleted / modules.length) * 100)
    : 0;
  useEffect(() => {
    const t = window.setTimeout(() => setProgress(targetProgress), 100);
    return () => window.clearTimeout(t);
  }, [targetProgress]);

  const counts = useMemo(() => {
    const completed = modules.filter((m) => m.status === "completed").length;
    const inProgress = modules.filter((m) => m.status === "unlocked").length;
    const locked = modules.filter((m) => m.status === "locked").length;
    return { completed, inProgress, locked };
  }, [modules]);

  const allComplete = modules.length > 0 && counts.completed === modules.length;

  const filtered = useMemo(() => {
    if (filter === "all") return modules;
    return modules.filter((m) => statusToFilter(m.status) === filter);
  }, [filter, modules]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "completed", label: `Completed (${counts.completed})` },
    { key: "in-progress", label: `In Progress (${counts.inProgress})` },
    { key: "locked", label: `Locked (${counts.locked})` },
  ];

  return (
    <div className="min-h-dvh bg-secondary/40 pb-16">
      <AppHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Training</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">Your Training Path</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete modules in sequence to unlock advanced content
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label="2 of 4 modules complete (50%)"
          >
            <div
              className="h-full rounded-full bg-gradient-brand transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            2 of 4 modules complete (50%)
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="45 minutes practiced" />
            <Stat label="7 sessions completed" />
            <Stat label="Next unlock: Complete Module 3" />
          </div>
        </div>

        <div className="mt-8 flex gap-6 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={
                filter === t.key
                  ? "min-h-11 border-b-2 border-brand px-1 pb-3 text-sm font-semibold text-foreground"
                  : "min-h-11 border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              }
              aria-current={filter === t.key ? "page" : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-start gap-4">
                    <Skeleton className="size-12 shrink-0 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-10 w-32 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : allComplete ? (
            <CelebrationState />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filtered.map((m) => (
                <ModuleCard key={m.id} module={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label }: { label: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-4 py-3 text-center text-sm font-medium text-muted-foreground">
      {label}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <FolderOpen className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">No modules yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Check back soon for training content</p>
    </div>
  );
}

function CelebrationState() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-night p-10 text-center shadow-card">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold/20 text-gold">
        <Trophy className="size-8" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-2xl font-bold text-primary-foreground">
        You've completed the foundation! 🎉
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/75">
        Great work — you're ready to keep building momentum. Share your progress or head back to
        your dashboard.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="min-h-11 rounded-xl">
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
        <a
          href="https://twitter.com/intent/tweet?text=I%20just%20completed%20my%20UW%20Partner%20training!"
          target="_blank"
          rel="noreferrer"
          className="min-h-11 rounded-xl border border-primary-foreground/35 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
        >
          Twitter
        </a>
        <a
          href="https://www.linkedin.com/sharing/share-offsite/"
          target="_blank"
          rel="noreferrer"
          className="min-h-11 rounded-xl border border-primary-foreground/35 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
        >
          LinkedIn
        </a>
        <a
          href="https://www.facebook.com/sharer/sharer.php"
          target="_blank"
          rel="noreferrer"
          className="min-h-11 rounded-xl border border-primary-foreground/35 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
        >
          Facebook
        </a>
      </div>
    </div>
  );
}

function ModuleCard({ module: m }: { module: TrainingModule }) {
  const Icon = MODULE_ICONS[m.id] ?? BookOpen;

  if (m.status === "completed") {
    return (
      <article className="rounded-2xl border border-border border-l-4 border-l-success bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-success/15 text-success">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold">{m.shortTitle}</h3>
              <Badge className="shrink-0 rounded-full border-0 bg-success/15 text-success hover:bg-success/15">
                ✓ Completed
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">{m.completedOn}</p>
            <Button asChild variant="ghost" className="mt-4 min-h-11 rounded-xl">
              <Link to="/training/$moduleId" params={{ moduleId: m.id }}>
                Review module
              </Link>
            </Button>
          </div>
        </div>
      </article>
    );
  }

  if (m.status === "unlocked") {
    return (
      <article className="rounded-2xl border border-border bg-card p-6 shadow-card ring-2 ring-brand/20 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lift">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold">{m.shortTitle}</h3>
              <Badge className="shrink-0 rounded-full border-0 bg-gold/20 text-gold hover:bg-gold/20">
                🔓 Unlocked
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">{m.meta}</p>
            <Button asChild className="mt-4 min-h-11 w-full rounded-xl">
              <Link to="/training/$moduleId" params={{ moduleId: m.id }}>
                Start now
              </Link>
            </Button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-muted/50 p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted text-locked">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-muted-foreground">{m.shortTitle}</h3>
            <Badge variant="secondary" className="shrink-0 rounded-full text-muted-foreground">
              <Lock className="size-3" aria-hidden="true" />
              Locked
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Complete Module 3 to unlock
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{m.meta}</p>
          <Button disabled className="mt-4 min-h-11 rounded-xl">
            Complete Module 3
          </Button>
        </div>
      </div>
    </article>
  );
}
