import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Star } from "lucide-react";

import { AppHeader } from "@/components/uw/AppHeader";
import { Badge } from "@/components/ui/badge";
import { usePartnerData } from "@/lib/use-partner-data";
import { RequireAuth } from "@/components/uw/RequireAuth";

export const Route = createFileRoute("/sessions")({
  head: () => ({
    meta: [
      { title: "Practice Session History | Partner Coach" },
      {
        name: "description",
        content: "Review your past AI voice practice sessions, scores and full transcripts.",
      },
      { property: "og:title", content: "Practice Session History | Partner Coach" },
      {
        property: "og:description",
        content: "Review your past AI voice practice sessions, scores and full transcripts.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <SessionsPage />
    </RequireAuth>
  ),
});

function Rating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={i <= value ? "size-4 fill-gold text-gold" : "size-4 text-muted-foreground/40"}
          aria-hidden
        />
      ))}
    </span>
  );
}

function SessionsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { loading, sessions } = usePartnerData();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Session History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading
            ? "Loading…"
            : `${sessions.length} practice sessions. Expand any session to read the transcript.`}
        </p>

        {!loading && sessions.length === 0 && (
          <p className="mt-6 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No sessions yet. Start a practice session with your AI coach to see it here.
          </p>
        )}

        <ul className="mt-6 space-y-3">
          {sessions.map((s) => {
            const open = openId === s.id;
            return (
              <li key={s.id} className="rounded-2xl border border-border bg-card">
                <button
                  onClick={() => setOpenId(open ? null : s.id)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-xl" aria-hidden>
                      {s.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{s.scenario}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.date} • {s.duration}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {s.topics.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Rating value={s.rating} />
                    <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-border p-4">
                    <ol className="space-y-3">
                      {s.transcript.map((line, i) => (
                        <li key={i} className={`flex ${line.who === "you" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                              line.who === "you"
                                ? "bg-gradient-brand text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-[10px] opacity-70">
                              {line.who === "you" ? "You" : "AI Coach"} • {line.at}
                            </p>
                            <p className="mt-0.5">{line.text}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
