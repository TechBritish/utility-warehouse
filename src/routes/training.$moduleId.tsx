import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Lock, Mic } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/uw/AppHeader";
import { RequireAuth } from "@/components/uw/RequireAuth";
import { getModule } from "@/lib/uw-data";
import { usePartnerData } from "@/lib/use-partner-data";
import { fireConfetti } from "@/lib/confetti";

export const Route = createFileRoute("/training/$moduleId")({
  head: ({ params }) => {
    const mod = getModule(params.moduleId);
    const title = mod ? `${mod.title} — Partner Coach` : "Module not found — Partner Coach";
    const description = mod ? mod.description : "This training module could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: () => (
    <RequireAuth>
      <ModuleDetail />
    </RequireAuth>
  ),
});

/** One numbered step on the module page. */
function Step({
  n,
  title,
  done,
  children,
}: {
  n: number;
  title: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span
          className={
            done
              ? "grid size-9 shrink-0 place-items-center rounded-full bg-success text-success-foreground"
              : "grid size-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground"
          }
        >
          {done ? <Check className="size-5" aria-hidden="true" /> : n}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function ModuleDetail() {
  const { moduleId } = Route.useParams();
  const navigate = useNavigate();
  const { loading, modules, stats, moduleSteps, modulePercent, markStep, completeModule } = usePartnerData();
  const mod = modules.find((m) => m.id === moduleId) ?? getModule(moduleId);
  const [saving, setSaving] = useState(false);
  const readEndRef = useRef<HTMLDivElement>(null);

  // Reaching the end of the key points counts as reading them.
  useEffect(() => {
    const el = readEndRef.current;
    if (!el || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void markStep(moduleId, "read");
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [moduleId, loading, markStep]);

  if (!mod) {
    return (
      <div className="min-h-dvh bg-secondary/40">
        <AppHeader />
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Module not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">We couldn't find that training module.</p>
          <Button asChild className="mt-6 min-h-12 rounded-xl">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const nextModule = modules.find((m) => m.number === mod.number + 1);
  const isCompleted = mod.status === "completed";
  const isLocked = !loading && mod.status === "locked";
  const stepsDone = moduleSteps(mod.id);
  const thisPercent = modulePercent(mod.id);

  const handleComplete = async () => {
    setSaving(true);
    await completeModule(mod.id);
    fireConfetti();
    if (nextModule) {
      toast.success(`Module ${mod.number} done! On to Module ${nextModule.number}.`);
      navigate({ to: "/training/$moduleId", params: { moduleId: nextModule.id } });
      window.scrollTo({ top: 0 });
    } else {
      toast.success("That's all four modules done. Brilliant work!");
      navigate({ to: "/dashboard" });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-dvh bg-secondary/40 pb-16">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
        <Button asChild variant="ghost" className="min-h-11 rounded-xl px-2">
          <Link to="/dashboard">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Dashboard
          </Link>
        </Button>

        <Card className="mt-4 space-y-4 p-5">
          <div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">This module</span>
              <span className="font-semibold text-brand">{thisPercent}%</span>
            </div>
            <Progress value={thisPercent} className="mt-2 h-2.5" />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>
                Module {mod.number} of {stats.totalModules} · Overall training
              </span>
              <span>{stats.overallPercent}%</span>
            </div>
            <Progress value={stats.overallPercent} className="mt-1.5 h-1.5" />
          </div>
        </Card>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">{mod.shortTitle}</h1>
        <p className="mt-2 text-muted-foreground">{mod.description}</p>
        {isCompleted && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success">
            <Check className="size-4" aria-hidden="true" /> You've finished this module
          </p>
        )}

        {isLocked ? (
          <Card className="mt-8 p-6 text-center">
            <Lock className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold">Finish the module before this one first</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Modules open one at a time, in order, so everything builds up step by step.
            </p>
            {stats.nextModule && (
              <Button asChild className="mt-5 min-h-12 rounded-xl px-6 text-base">
                <Link to="/training/$moduleId" params={{ moduleId: stats.nextModule.id }}>
                  Go to Module {stats.nextModule.number}: {stats.nextModule.shortTitle}
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="mt-8 space-y-5">
            <Step n={1} title="Watch the intro" done={stepsDone.includes("video")}>
              <div className="overflow-hidden rounded-2xl bg-gradient-night">
                <video
                  key={mod.video}
                  controls
                  playsInline
                  preload="metadata"
                  className="mx-auto max-h-[60vh] w-full object-contain"
                  aria-label={`${mod.shortTitle} intro video`}
                  onEnded={() => void markStep(mod.id, "video")}
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    if (v.duration && v.currentTime / v.duration > 0.8) void markStep(mod.id, "video");
                  }}
                >
                  <source src={mod.video} type="video/mp4" />
                </video>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Ticks off when you've watched it through.</p>
            </Step>

            <Step n={2} title="Read the key points" done={stepsDone.includes("read")}>
              <p className="text-sm font-semibold">By the end you'll be able to:</p>
              <ul className="mt-2 space-y-2">
                {mod.learn.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-5">
                {mod.sections.map((section) => (
                  <div key={section.heading}>
                    <h3 className="text-base font-semibold">{section.heading}</h3>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                      {section.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div ref={readEndRef} aria-hidden="true" />
            </Step>

            <Step n={3} title="Practise it out loud" done={stepsDone.includes("practice")}>
              <p className="text-sm text-muted-foreground">
                Your AI coach plays a customer. Just talk to it like a real conversation.
              </p>
              <p className="mt-3 rounded-xl bg-accent p-4 text-sm font-medium text-accent-foreground">
                Your task: {mod.practiceTask}
              </p>
              <Button asChild variant="outline" className="mt-4 min-h-12 w-full rounded-xl text-base sm:w-auto sm:px-6">
                <Link
                  to="/trainer"
                  search={{ scenario: mod.practiceScenario, module: mod.id }}
                  onClick={() => void markStep(mod.id, "practice")}
                >
                  <Mic aria-hidden="true" />
                  Start practice
                </Link>
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                About 5 minutes. When you're done, come back here to finish the module.
              </p>
            </Step>

            <Step n={4} title={isCompleted ? "All done" : "Finish this module"} done={isCompleted}>
              {isCompleted ? (
                <Button asChild className="min-h-12 w-full rounded-xl text-base">
                  {nextModule ? (
                    <Link to="/training/$moduleId" params={{ moduleId: nextModule.id }}>
                      Go to Module {nextModule.number}: {nextModule.shortTitle}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link to="/dashboard">Back to dashboard</Link>
                  )}
                </Button>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Watched it, read it and had a go? Tap below to finish
                    {nextModule ? ` and open Module ${nextModule.number}.` : " your training."}
                  </p>
                  <Button
                    onClick={handleComplete}
                    disabled={saving}
                    className="mt-4 min-h-12 w-full rounded-xl text-base"
                  >
                    {nextModule ? `Done, take me to Module ${nextModule.number}` : "Done, finish my training"}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </>
              )}
            </Step>
          </div>
        )}
      </main>
    </div>
  );
}
