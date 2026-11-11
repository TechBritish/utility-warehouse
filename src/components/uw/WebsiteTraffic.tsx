import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Eye, Globe, MousePointerClick, UserPlus } from "lucide-react";

import { supabase } from "@/lib/supabase";

type Summary = {
  page_views: number;
  visitors: number;
  sessions: number;
  signups: number;
  daily: { day: string; views: number; visitors: number }[];
  top_pages: { path: string; views: number }[];
  top_sources: { source: string; views: number }[];
  devices: { device: string; views: number }[];
};

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

/** Admin panel: website visits recorded in `page_views` (see src/lib/analytics.ts). */
export function WebsiteTraffic() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    supabase.rpc("admin_traffic_summary", { days }).then(({ data: res, error: err }) => {
      if (cancelled) return;
      if (err) setError(true);
      else setData(res as Summary);
    });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const daily = (data?.daily ?? []).map((d) => ({
    ...d,
    label: new Date(d.day).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
  }));

  return (
    <section aria-labelledby="traffic-heading" className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="traffic-heading" className="text-lg font-semibold text-foreground">
            Website traffic
          </h2>
          <p className="text-sm text-muted-foreground">Everyone who visits simple-options.co.uk.</p>
        </div>
        <div className="flex rounded-xl border border-border p-1" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              aria-pressed={days === r.days}
              className={
                days === r.days
                  ? "min-h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
                  : "min-h-9 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mt-6 text-sm text-muted-foreground">Couldn't load traffic data. Try refreshing the page.</p>
      ) : !data ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading traffic…</p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icon: Eye, label: "Page views", value: data.page_views },
              { icon: Globe, label: "Unique visitors*", value: data.visitors },
              { icon: MousePointerClick, label: "Visits*", value: data.sessions },
              { icon: UserPlus, label: "New sign-ups", value: data.signups },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-secondary/60 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                  <span className="text-xs font-medium">{label}</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{value.toLocaleString("en-GB")}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 h-56 w-full">
            {daily.length === 0 ? (
              <p className="pt-16 text-center text-sm text-muted-foreground">
                No visits recorded yet. Numbers appear here as people visit the site.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="views" name="Page views" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <TopList title="Top pages" rows={data.top_pages.map((p) => ({ name: p.path, views: p.views }))} />
            <TopList title="Where visitors come from" rows={data.top_sources.map((s) => ({ name: s.source, views: s.views }))} />
            <TopList title="Devices" rows={data.devices.map((d) => ({ name: d.device, views: d.views }))} />
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            *Unique visitors and visits only count people who accepted analytics cookies. Page views count
            everyone.
          </p>
        </>
      )}
    </section>
  );
}

function TopList({ title, rows }: { title: string; rows: { name: string; views: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Nothing yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((r) => (
            <li key={r.name} className="text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-foreground">{r.name}</span>
                <span className="shrink-0 text-muted-foreground">{r.views}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-brand" style={{ width: `${(r.views / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
