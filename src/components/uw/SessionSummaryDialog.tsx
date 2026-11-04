import {
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PartyPopper, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type SessionMetrics = {
  durationLabel: string;
  speakingPct: number;
  turns: number;
  avgResponse: string;
  wpm: number;
};

const radarData = [
  { skill: "Confidence", value: 4 },
  { skill: "Clarity", value: 5 },
  { skill: "Objections", value: 3 },
  { skill: "Product", value: 4 },
  { skill: "Closing", value: 3 },
];

const progressData = [
  { s: "S1", score: 52 },
  { s: "S2", score: 58 },
  { s: "S3", score: 55 },
  { s: "S4", score: 64 },
  { s: "S5", score: 71 },
  { s: "S6", score: 74 },
  { s: "S7", score: 82 },
];

const nextTips = [
  "Pause for two beats after an objection before answering.",
  "Use the customer's own bills and an official UW quote, never a guessed figure.",
  "Always close with a specific next step and time.",
];

function shareAchievement(metrics: SessionMetrics) {
  try {
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 630;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    const g = ctx.createLinearGradient(0, 0, 1200, 630);
    g.addColorStop(0, "#3b1d76");
    g.addColorStop(1, "#7c3aed");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px system-ui, sans-serif";
    ctx.fillText("Partner Coach", 80, 140);
    ctx.font = "500 40px system-ui, sans-serif";
    ctx.fillText("Practice session complete", 80, 200);
    ctx.font = "bold 96px system-ui, sans-serif";
    ctx.fillText(metrics.durationLabel, 80, 340);
    ctx.font = "500 36px system-ui, sans-serif";
    ctx.fillText(`${metrics.turns} exchanges · ${metrics.wpm} wpm`, 80, 410);
    ctx.fillStyle = "#f0b429";
    ctx.fillRect(80, 470, 220, 10);
    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "uw-practice-achievement.png";
    a.click();
    toast.success("Achievement image downloaded");
  } catch {
    toast.error("Could not create the image");
  }
}

export function SessionSummaryDialog({
  open,
  onOpenChange,
  metrics,
  onPractiseAgain,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  metrics: SessionMetrics;
  onPractiseAgain: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <PartyPopper className="size-5 text-gold" aria-hidden="true" />
            Session complete
          </DialogTitle>
        </DialogHeader>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
              <Radar
                dataKey="value"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["Duration", metrics.durationLabel],
            ["You vs coach", `${metrics.speakingPct}% / ${100 - metrics.speakingPct}%`],
            ["Exchanges", `${metrics.turns}`],
            ["Avg response", metrics.avgResponse],
            ["Words per minute", `${metrics.wpm}`],
            ["Topics", "Savings, objections"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-card p-3">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <section>
          <h3 className="text-sm font-semibold">What to work on next</h3>
          <ul className="mt-2 space-y-2">
            {nextTips.map((t) => (
              <li
                key={t}
                className="rounded-xl bg-accent p-3 text-sm leading-relaxed text-accent-foreground"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Your progress over time</h3>
          <div className="mt-2 h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <XAxis dataKey="s" tick={{ fontSize: 11 }} />
                <YAxis width={28} tick={{ fontSize: 11 }} domain={[40, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="min-h-11 flex-1 rounded-xl" onClick={onPractiseAgain}>
            Practise again
          </Button>
          <Button
            variant="secondary"
            className="min-h-11 flex-1 rounded-xl"
            onClick={() => shareAchievement(metrics)}
          >
            <Share2 className="size-4" />
            Share achievement
          </Button>
          <Button asChild variant="outline" className="min-h-11 flex-1 rounded-xl">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
