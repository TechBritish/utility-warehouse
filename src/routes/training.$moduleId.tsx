import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Play,
  Mic,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Video,
  ChevronDown,
  BookOpen,
  ClipboardCheck,
  PiggyBank,
  Handshake,
  ArrowLeft,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { getModule, scenarios } from "@/lib/uw-data";
import { usePartnerData } from "@/lib/use-partner-data";
import { fireConfetti } from "@/lib/confetti";
import { toast } from "sonner";
import { RequireAuth } from "@/components/uw/RequireAuth";

export const Route = createFileRoute("/training/$moduleId")({
  head: ({ params }) => {
    const mod = getModule(params.moduleId);
    const title = mod ? `${mod.title} — Partner Coach` : "Module not found — Partner Coach";
    const description = mod
      ? mod.description
      : "This training module could not be found.";
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

const MODULE_ICONS: Record<string, typeof PiggyBank> = {
  "1": BookOpen,
  "2": ClipboardCheck,
  "3": PiggyBank,
  "4": Handshake,
};

const RESOURCES = [
  { icon: FileText, title: "Bill Savings Calculator", size: "245 KB" },
  { icon: ImageIcon, title: "Comparison Chart", size: "1.2 MB" },
  { icon: FileIcon, title: "Compliance Guidelines", size: "310 KB" },
  { icon: Video, title: "Bonus Roleplay Clip", size: "18 MB" },
];

const PRACTICE_QUESTIONS = [
  {
    q: "How do you open a conversation about switching providers?",
    tip: "Lead with curiosity, not a pitch — ask what they currently pay.",
  },
  {
    q: "How do you handle 'I'm happy with my current provider'?",
    tip: "Acknowledge, then offer a no-obligation comparison.",
  },
  {
    q: "How do you explain the UW Price Pledge?",
    tip: "Keep it simple: if we can't save you money, we'll tell you.",
  },
  {
    q: "How do you respond to 'switching sounds like a hassle'?",
    tip: "Reassure them UW handles the entire switch end-to-end.",
  },
  {
    q: "How do you close and ask for the sign-up?",
    tip: "Ask directly and confidently — silence after the ask works in your favour.",
  },
];

const TRANSCRIPT = [
  "00:00 — Welcome back! Today we're covering bill savings and social proof.",
  "00:15 — Let's start with how to calculate a like-for-like comparison.",
  "02:40 — Here's how real customer stories build instant trust.",
  "05:10 — Finally, how to explain the UW Price Pledge accurately.",
];

function ModuleDetail() {
  const { moduleId } = Route.useParams();
  const navigate = useNavigate();
  const { modules, completeModule } = usePartnerData();
  const mod = modules.find((m) => m.id === moduleId) ?? getModule(moduleId);
  const [tab, setTab] = useState("overview");
  const [showSticky, setShowSticky] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [scenario, setScenario] = useState(scenarios[0]?.value ?? "");
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setShowSticky(!entries[0]?.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!mod) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold">Module not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find that training module. It may have been moved or renamed.
        </p>
        <Button asChild className="mt-6 min-h-11 rounded-xl">
          <Link to="/training">Back to training</Link>
        </Button>
      </div>
    );
  }

  const Icon = MODULE_ICONS[mod.id] ?? BookOpen;
  const prevModule = modules.find((m) => m.number === mod.number - 1);
  const nextModule = modules.find((m) => m.number === mod.number + 1);
  const isCompleted = mod.status === "completed";

  const handleComplete = async () => {
    fireConfetti();
    toast.success("Module completed! 🎉");
    await completeModule(mod.id);
    window.setTimeout(() => navigate({ to: "/training" }), 2000);
  };

  return (
    <div className="min-h-dvh bg-secondary/40 pb-28 lg:pb-10">
      {showSticky && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
            <span className="truncate text-sm font-semibold">{mod.shortTitle}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {capitalizeTab(tab)} · {isCompleted ? "✓ Completed" : "0% complete"}
            </span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/training">Training</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Module {mod.number}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{mod.shortTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button asChild variant="ghost" className="mt-3 min-h-11 rounded-xl px-2">
          <Link to="/training">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to training
          </Link>
        </Button>

        <div ref={headerRef} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
              <Icon className="size-8" aria-hidden="true" />
              {isCompleted && (
                <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-success text-success-foreground ring-2 ring-background">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
              )}
            </span>
            <div className="min-w-0">
              <Badge
                className={
                  isCompleted
                    ? "rounded-full border-0 bg-success/15 text-success hover:bg-success/15"
                    : "rounded-full border-0 bg-gold/20 text-gold hover:bg-gold/20"
                }
              >
                {isCompleted ? "✓ Completed" : "🔓 Unlocked"}
              </Badge>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{mod.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{mod.meta}</p>
            </div>
          </div>
          <p className="shrink-0 text-sm font-semibold text-muted-foreground sm:text-right">
            {isCompleted ? "✓ Completed" : "0% complete"}
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-8">
          <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
            {[
              { value: "overview", label: "Overview" },
              { value: "video", label: "Video" },
              { value: "practice", label: "Practice" },
              { value: "resources", label: "Resources" },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="min-h-11 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-brand data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">What you'll learn</h2>
              <ul className="mt-4 space-y-3">
                {mod.learn.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold">Module content</h2>
              <div className="prose-uw mt-4 space-y-4 text-sm leading-relaxed text-foreground">
                <h3 className="text-base font-semibold">Why bill savings matter</h3>
                <p className="text-muted-foreground">
                  Most customers have never compared their bundle against the market. Your job
                  isn't to sell — it's to show them, clearly and honestly, where their money is
                  going today.
                </p>
                <h3 className="text-base font-semibold">Building a like-for-like comparison</h3>
                <p className="text-muted-foreground">
                  Always compare equivalent packages: same speed, same channels, same data
                  allowance. A fair comparison builds trust faster than any script.
                </p>
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Ask to see a recent bill, not an estimate</li>
                  <li>Highlight hidden fees and price-rise clauses</li>
                  <li>Use the UW Price Pledge as your safety net</li>
                </ul>
                <h3 className="text-base font-semibold">Using social proof</h3>
                <p className="text-muted-foreground">
                  Real stories from real customers close more conversations than statistics.
                  Keep two or three recent examples ready to share.
                </p>
              </div>
            </Card>

            {mod.prerequisite && (
              <Card className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Prerequisite
                  </h2>
                  <p className="mt-1 text-sm font-medium">{mod.prerequisite.title}</p>
                </div>
                <Button asChild variant="outline" className="min-h-11 rounded-xl">
                  <Link to="/training/$moduleId" params={{ moduleId: mod.prerequisite.id }}>
                    View module
                  </Link>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="video" className="mt-6 space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-night">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="grid size-24 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground">
                  <Play className="size-12" aria-hidden="true" />
                </span>
                <p className="text-sm text-primary-foreground/75">Video content coming soon</p>
              </div>
            </div>
            <Card className="p-4">
              <button
                type="button"
                onClick={() => setTranscriptOpen((v) => !v)}
                className="flex min-h-11 w-full items-center justify-between text-left text-sm font-semibold"
                aria-expanded={transcriptOpen}
              >
                Transcript
                <ChevronDown
                  className={transcriptOpen ? "size-4 rotate-180 transition-transform" : "size-4 transition-transform"}
                  aria-hidden="true"
                />
              </button>
              {transcriptOpen && (
                <ul className="mt-3 space-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
                  {TRANSCRIPT.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="practice" className="mt-6 space-y-6">
            <Card className="p-6 text-center sm:text-left">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                  <Mic className="size-7" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold">Practice with your AI coach</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pick a scenario and rehearse the conversation in a safe space, any time.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger className="min-h-11 flex-1 rounded-xl">
                    <SelectValue placeholder="Choose a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.icon} {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button asChild className="min-h-12 rounded-xl px-8 text-base">
                  <Link to="/trainer">Start AI practice</Link>
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold">Sample practice questions</h2>
              <Accordion type="single" collapsible className="mt-3">
                {PRACTICE_QUESTIONS.map((item, i) => (
                  <AccordionItem key={item.q} value={`q-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-medium">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {item.tip}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {RESOURCES.map((r) => (
                <Card key={r.title} className="flex items-center gap-4 p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <r.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.size}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="min-h-11 shrink-0 rounded-xl"
                    onClick={() => toast.success("Download ready!")}
                  >
                    Download
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-0 sm:px-0 lg:px-6">
          {prevModule ? (
            <Button asChild variant="ghost" className="min-h-11 hidden rounded-xl sm:inline-flex">
              <Link to="/training/$moduleId" params={{ moduleId: prevModule.id }}>
                ← Previous: Module {prevModule.number}
              </Link>
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={handleComplete} className="min-h-12 flex-1 rounded-xl text-base sm:flex-none sm:px-8">
            Mark as complete
          </Button>
          {nextModule && nextModule.status !== "locked" ? (
            <Button asChild variant="ghost" className="min-h-11 hidden rounded-xl sm:inline-flex">
              <Link to="/training/$moduleId" params={{ moduleId: nextModule.id }}>
                Next: Module {nextModule.number} →
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}

function capitalizeTab(tab: string) {
  return tab.charAt(0).toUpperCase() + tab.slice(1);
}
