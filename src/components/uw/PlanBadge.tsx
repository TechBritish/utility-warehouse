import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Crown, Sparkles } from "lucide-react";

import { supabase } from "@/lib/supabase";

type Sub = { plan: "basic" | "premium"; status: string };

/** Shows the member's plan, or a gentle link to see plans if they don't have one. */
export function PlanBadge() {
  const [sub, setSub] = useState<Sub | null | undefined>(undefined);

  useEffect(() => {
    supabase
      .from("subscriptions")
      .select("plan, status")
      .in("status", ["active", "trialing", "past_due"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data }) => setSub((data?.[0] as Sub | undefined) ?? null));
  }, []);

  if (sub === undefined) return null;
  if (sub) {
    const premium = sub.plan === "premium";
    return (
      <span
        className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          premium ? "bg-[#f0b429]/20 text-[#8a6100] dark:text-[#f0b429]" : "bg-brand/10 text-brand"
        }`}
      >
        {premium ? <Crown className="size-3.5" aria-hidden="true" /> : <Sparkles className="size-3.5" aria-hidden="true" />}
        {premium ? "Premium member" : "Basic member"}
      </span>
    );
  }
  return (
    <Link
      to="/pricing"
      className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand hover:bg-brand/15"
    >
      <Sparkles className="size-3.5" aria-hidden="true" /> See membership plans
    </Link>
  );
}
