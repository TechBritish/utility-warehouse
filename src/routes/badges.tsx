import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/uw/AppHeader";
import { usePartnerData } from "@/lib/use-partner-data";
import { Progress } from "@/components/ui/progress";
import { RequireAuth } from "@/components/uw/RequireAuth";

export const Route = createFileRoute("/badges")({
  head: () => ({
    meta: [
      { title: "Your Badges | Partner Coach" },
      {
        name: "description",
        content: "Track the achievements you've earned and see what to unlock next on your UW partner journey.",
      },
      { property: "og:title", content: "Your Badges | Partner Coach" },
      {
        property: "og:description",
        content: "Track the achievements you've earned and see what to unlock next on your UW partner journey.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <BadgesPage />
    </RequireAuth>
  ),
});

function BadgesPage() {
  const { badges } = usePartnerData();
  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);
  const pct = badges.length ? Math.round((earned.length / badges.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Badges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {earned.length} of {badges.length} earned. Keep practising to unlock the rest.
        </p>

        <div className="mt-4 flex items-center gap-3" aria-label={`${pct}% of badges earned`}>
          <Progress value={pct} className="h-2.5 flex-1" />
          <span className="text-sm font-semibold text-foreground">{pct}%</span>
        </div>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Earned</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {earned.map((b) => (
            <li key={b.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="text-3xl" aria-hidden>{b.emoji}</span>
              <div>
                <p className="font-semibold text-foreground">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.how}</p>
                <p className="mt-1 text-xs font-medium text-success">Earned {b.earned}</p>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Up next</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {locked.map((b) => (
            <li key={b.id} className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-4 opacity-75">
              <span className="text-3xl grayscale" aria-hidden>{b.emoji}</span>
              <div>
                <p className="font-semibold text-foreground">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.how}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">🔒 Not yet earned</p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
