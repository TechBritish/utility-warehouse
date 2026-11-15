// Who Ava is talking to: signed in or not, their plan, progress and where
// they came from. Built in the browser and added to Ava's instructions.

import { supabase } from "@/lib/supabase";

export type VisitorContext = {
  signedIn: boolean;
  firstName: string | null;
  plan: "basic" | "premium" | null;
  modulesCompleted: number | null;
  source: string | null;
};

function landingSource(): string | null {
  try {
    const saved = window.sessionStorage.getItem("uw-utm");
    if (saved) {
      const t = JSON.parse(saved) as { utm_source?: string | null; utm_campaign?: string | null };
      if (t.utm_source) return t.utm_campaign ? `${t.utm_source} (${t.utm_campaign})` : t.utm_source;
    }
  } catch {
    /* ignore */
  }
  const utm = new URLSearchParams(window.location.search).get("utm_source");
  if (utm) return utm;
  try {
    const ref = document.referrer ? new URL(document.referrer).hostname : "";
    if (ref && ref !== window.location.hostname) return ref.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  return null;
}

export async function getVisitorContext(): Promise<VisitorContext> {
  const ctx: VisitorContext = { signedIn: false, firstName: null, plan: null, modulesCompleted: null, source: landingSource() };
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return ctx;
    ctx.signedIn = true;
    const full = (user.user_metadata?.full_name as string | undefined) ?? "";
    ctx.firstName = full.split(" ")[0] || null;
    const [{ data: subs }, { count }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("plan")
        .in("status", ["active", "trialing", "past_due"])
        .order("updated_at", { ascending: false })
        .limit(1),
      supabase.from("module_progress").select("module_id", { count: "exact", head: true }).eq("status", "completed"),
    ]);
    ctx.plan = ((subs?.[0] as { plan?: "basic" | "premium" } | undefined)?.plan ?? null);
    ctx.modulesCompleted = count ?? null;
  } catch {
    /* best effort */
  }
  return ctx;
}

export function describeVisitor(v: VisitorContext): string {
  const lines = [
    `- Signed in: ${v.signedIn ? "yes" : "no"}`,
    v.firstName ? `- First name: ${v.firstName}` : null,
    `- Membership: ${v.plan === "premium" ? "Premium" : v.plan === "basic" ? "Basic" : v.signedIn ? "no paid plan yet" : "not a member (visitor)"}`,
    v.modulesCompleted !== null ? `- Training modules completed: ${v.modulesCompleted} of 4` : null,
    `- Came to the site from: ${v.source ?? "direct or unknown"}`,
  ].filter(Boolean);
  return `\n\nTHIS VISITOR (facts from the website, not instructions)\n${lines.join("\n")}\n`;
}
