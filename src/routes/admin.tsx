import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpDown,
  Download,
  Search,
  Users,
  TrendingUp,
  Mic,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/uw/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminData, type AdminPartner, type PartnerStatus } from "@/lib/use-admin-data";
import { RequireAuth } from "@/components/uw/RequireAuth";
import { WebsiteTraffic } from "@/components/uw/WebsiteTraffic";
import { LeadsPanel } from "@/components/uw/LeadsPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Partner Management | Partner Coach" },
      {
        name: "description",
        content:
          "Track partner onboarding progress, practice activity and training completion across your UW team.",
      },
      { property: "og:title", content: "Admin — Partner Management | Partner Coach" },
      {
        property: "og:description",
        content:
          "Track partner onboarding progress, practice activity and training completion across your UW team.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AdminPage />
    </RequireAuth>
  ),
});

const statusStyles: Record<PartnerStatus, { label: string; className: string }> = {
  "on-track": { label: "On track", className: "bg-success/15 text-success border-success/30" },
  "at-risk": { label: "At risk", className: "bg-warning/15 text-warning-foreground border-warning/30" },
  completed: { label: "Completed", className: "bg-info/15 text-info border-info/30" },
  new: { label: "New", className: "bg-muted text-muted-foreground border-border" },
};

type SortKey = "name" | "modulesDone" | "aiSessions" | "practiceMins" | "joinedDaysAgo";

function exportCsv(rows: AdminPartner[]) {
  const header = ["Name", "Email", "Path", "Days since join", "Modules done", "AI sessions", "Practice mins", "Last active", "Status"];
  const lines = rows.map((p) =>
    [p.name, p.email, p.path, p.joinedDaysAgo, p.modulesDone, p.aiSessions, p.practiceMins, p.lastActive, statusStyles[p.status].label].join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "uw-partners.csv";
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${rows.length} partners to CSV`);
}

function AdminPage() {
  const { loading, isAdmin, partners, moduleCompletionStats, weeklySignups } = useAdminData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PartnerStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastActive" as never);
  const [sortAsc, setSortAsc] = useState(false);

  const stats = useMemo(() => {
    const total = partners.length;
    const active = partners.filter((p) => !p.lastActive.includes("day") && p.lastActive !== "Never").length;
    const avgModules = total ? partners.reduce((s, p) => s + p.modulesDone, 0) / total : 0;
    const totalSessions = partners.reduce((s, p) => s + p.aiSessions, 0);
    return { total, active, avgModules: avgModules.toFixed(1), totalSessions };
  }, [partners]);

  const rows = useMemo(() => {
    let list = partners.filter(
      (p) =>
        (statusFilter === "all" || p.status === statusFilter) &&
        (p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.email.toLowerCase().includes(query.toLowerCase())),
    );
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
        return sortAsc ? cmp : -cmp;
      });
    }
    return list;
  }, [partners, query, statusFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground">
          Loading partner data…
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is only available to team admins. Ask an existing admin to grant your account access.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block text-sm underline underline-offset-4 hover:text-foreground">
            ← Back to my dashboard
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Team admin</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Partner Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time onboarding progress across your partner team.
            </p>
          </div>
          <Button onClick={() => exportCsv(rows)} className="min-h-11 rounded-xl">
            <Download className="size-4" /> Export CSV
          </Button>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: Users, label: "Total partners", value: stats.total },
            { icon: TrendingUp, label: "Active this week", value: stats.active },
            { icon: GraduationCap, label: "Avg modules done", value: stats.avgModules },
            { icon: Mic, label: "AI practice sessions", value: stats.totalSessions },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4" aria-hidden />
                <span className="text-xs font-medium">{label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <LeadsPanel />
        <WebsiteTraffic />

        {/* Charts */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section aria-label="Module completion rates" className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Module completion rate</h2>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleCompletionStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="module" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" unit="%" />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="rate" fill="var(--brand)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section aria-label="Weekly signups" className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">New partners per week</h2>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklySignups}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="partners" stroke="var(--info)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Filters + table */}
        <section aria-label="Partner roster" className="mt-6 rounded-2xl border border-border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="min-h-11 rounded-xl pl-9"
                aria-label="Search partners"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="min-h-11 w-40 rounded-xl" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="on-track">On track</SelectItem>
                <SelectItem value="at-risk">At risk</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {(
                    [
                      ["name", "Partner"],
                      ["modulesDone", "Modules"],
                      ["aiSessions", "AI sessions"],
                      ["practiceMins", "Practice"],
                      ["joinedDaysAgo", "Joined"],
                    ] as [SortKey, string][]
                  ).map(([key, label]) => (
                    <TableHead key={key}>
                      <button
                        onClick={() => toggleSort(key)}
                        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                      >
                        {label} <ArrowUpDown className="size-3" aria-hidden />
                      </button>
                    </TableHead>
                  ))}
                  <TableHead>Last active</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.email}</div>
                      <Badge variant="outline" className="mt-1 text-[10px]">{p.path}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={(p.modulesDone / 4) * 100} className="h-2 w-16" />
                        <span className="text-xs text-muted-foreground">{p.modulesDone}/4</span>
                      </div>
                    </TableCell>
                    <TableCell>{p.aiSessions}</TableCell>
                    <TableCell>{p.practiceMins} min</TableCell>
                    <TableCell>{p.joinedDaysAgo}d ago</TableCell>
                    <TableCell className="text-muted-foreground">{p.lastActive}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[p.status].className}>
                        {statusStyles[p.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No partners match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/dashboard" className="underline underline-offset-4 hover:text-foreground">
            ← Back to my dashboard
          </Link>
        </p>
      </main>
    </div>
  );
}
