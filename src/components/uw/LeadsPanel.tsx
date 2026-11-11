import { useEffect, useState } from "react";
import { Download, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string | null;
  interest: "bills" | "partner" | "both";
  message: string | null;
  source_path: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  status: "new" | "contacted" | "done";
};

const INTEREST_LABEL: Record<Lead["interest"], string> = {
  bills: "Lower bills",
  partner: "Becoming a Partner",
  both: "Bills + Partner",
};

const STATUS_NEXT: Record<Lead["status"], Lead["status"]> = { new: "contacted", contacted: "done", done: "new" };
const STATUS_STYLE: Record<Lead["status"], string> = {
  new: "bg-brand/15 text-brand",
  contacted: "bg-warning/20 text-warning",
  done: "bg-success/15 text-success",
};

/** Admin panel: people who asked for a free bill check (Supabase `leads`). */
export function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    supabase
      .from("leads")
      .select("id, created_at, name, phone, email, interest, message, source_path, utm_source, utm_campaign, status")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => setLeads((data as Lead[] | null) ?? []));
  }, []);

  const cycleStatus = async (lead: Lead) => {
    const status = STATUS_NEXT[lead.status];
    setLeads((prev) => prev?.map((l) => (l.id === lead.id ? { ...l, status } : l)) ?? null);
    await supabase.from("leads").update({ status }).eq("id", lead.id);
  };

  const exportCsv = () => {
    if (!leads?.length) return;
    const head = ["Date", "Name", "Phone", "Email", "Interest", "Message", "Source", "Campaign", "Status"];
    const rows = leads.map((l) => [
      new Date(l.created_at).toLocaleString("en-GB"),
      l.name,
      l.phone ?? "",
      l.email ?? "",
      INTEREST_LABEL[l.interest],
      l.message ?? "",
      l.utm_source ?? "",
      l.utm_campaign ?? "",
      l.status,
    ]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const newCount = leads?.filter((l) => l.status === "new").length ?? 0;

  return (
    <section aria-labelledby="leads-heading" className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="leads-heading" className="text-lg font-semibold text-foreground">
            Leads {newCount > 0 && <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-xs text-primary-foreground">{newCount} new</span>}
          </h2>
          <p className="text-sm text-muted-foreground">People who asked for a free bill check. Tap a status to update it.</p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!leads?.length} className="min-h-11 rounded-xl">
          <Download className="size-4" /> Export leads
        </Button>
      </div>

      {leads === null ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading leads…</p>
      ) : leads.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No leads yet. They'll appear here as soon as someone fills in the form.</p>
      ) : (
        <ul className="mt-5 divide-y divide-border">
          {leads.map((l) => (
            <li key={l.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {l.name} <span className="font-normal text-muted-foreground">· {INTEREST_LABEL[l.interest]}</span>
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {l.phone && (
                    <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-brand hover:underline">
                      <Phone className="size-3.5" aria-hidden="true" /> {l.phone}
                    </a>
                  )}
                  {l.email && (
                    <a href={`mailto:${l.email}`} className="inline-flex min-w-0 items-center gap-1 break-all text-brand hover:underline">
                      <Mail className="size-3.5 shrink-0" aria-hidden="true" /> {l.email}
                    </a>
                  )}
                </div>
                {l.message && <p className="mt-1 text-sm text-muted-foreground">“{l.message}”</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  {l.utm_source ? ` · from ${l.utm_source}${l.utm_campaign ? ` (${l.utm_campaign})` : ""}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void cycleStatus(l)}
                className={`min-h-9 shrink-0 self-start rounded-full px-3 text-xs font-semibold capitalize ${STATUS_STYLE[l.status]}`}
                aria-label={`Status ${l.status}, tap to change`}
              >
                {l.status}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
