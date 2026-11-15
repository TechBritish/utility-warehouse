// Stripe webhook: unlocks Partner Coach memberships.
// Needs the Supabase secret STRIPE_WEBHOOK_SECRET (Stripe → Webhooks → signing secret).
// Point Stripe at: https://qavjiqnumjgoautynbil.supabase.co/functions/v1/stripe-webhook
// Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
import { createClient } from "jsr:@supabase/supabase-js@2";

const PLAN_BY_PENCE: Record<number, "basic" | "premium"> = { 2999: "basic", 14999: "premium", 28790: "basic", 143990: "premium" };

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

async function verify(payload: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  );
  const t = parts["t"];
  const sigs = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return sigs.some((s) => s.length === hex.length && [...s].every((c, i) => c === hex[i]));
}

async function userIdForEmail(email: string | null): Promise<string | null> {
  if (!email) return null;
  const { data } = await db.from("profiles").select("id").ilike("email", email).maybeSingle();
  return data?.id ?? null;
}

Deno.serve(async (req) => {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return new Response("not configured", { status: 503 });
  const payload = await req.text();
  if (!(await verify(payload, req.headers.get("stripe-signature"), secret))) {
    return new Response("bad signature", { status: 400 });
  }
  const event = JSON.parse(payload);
  const obj = event.data?.object ?? {};

  if (event.type === "checkout.session.completed" && obj.mode === "subscription") {
    const plan = PLAN_BY_PENCE[obj.amount_total];
    if (!plan) return new Response("unknown amount", { status: 200 });
    const email = obj.customer_details?.email ?? obj.customer_email ?? null;
    const userId = obj.client_reference_id || (await userIdForEmail(email));
    const row = {
      user_id: userId,
      email,
      plan,
      status: "active",
      stripe_customer_id: obj.customer ?? null,
      stripe_subscription_id: obj.subscription ?? null,
      updated_at: new Date().toISOString(),
    };
    if (userId) await db.from("subscriptions").delete().eq("user_id", userId);
    const { error } = await db.from("subscriptions").upsert(row, { onConflict: "stripe_subscription_id" });
    if (error) {
      console.error(error);
      return new Response("db error", { status: 500 });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const pence = obj.items?.data?.[0]?.price?.unit_amount;
    const update: Record<string, unknown> = {
      status: event.type === "customer.subscription.deleted" ? "canceled" : obj.status,
      current_period_end: obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    if (PLAN_BY_PENCE[pence]) update.plan = PLAN_BY_PENCE[pence];
    await db.from("subscriptions").update(update).eq("stripe_subscription_id", obj.id);
  }

  return new Response("ok", { status: 200 });
});
