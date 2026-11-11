import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getConsent } from "@/lib/analytics";
import { marketingLead } from "@/lib/marketing-tags";
import { supabase } from "@/lib/supabase";

type Interest = "bills" | "partner" | "both";

const INTERESTS: { value: Interest; label: string }[] = [
  { value: "bills", label: "Lower bills" },
  { value: "partner", label: "Becoming a Partner" },
  { value: "both", label: "Both" },
];

/** "Free bill check" form. Saves to Supabase `leads`, shown on /admin. */
export function LeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<Interest>("bills");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Please add your name.");
    if (!phone.trim() && !email.trim()) return setError("Please add a phone number or email so Sheila can reach you.");
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError("That email doesn't look quite right.");
    if (!consent) return setError("Please tick the box so Sheila is allowed to contact you.");

    setSending(true);
    const params = new URLSearchParams(window.location.search);
    let visitorId: string | null = null;
    try {
      if (getConsent() !== "denied") visitorId = window.localStorage.getItem("uw-visitor-id");
    } catch {
      /* storage unavailable */
    }
    const { error: err } = await supabase.from("leads").insert({
      name: name.trim().slice(0, 100),
      phone: phone.trim().slice(0, 30) || null,
      email: email.trim().slice(0, 200) || null,
      interest,
      message: message.trim().slice(0, 1000) || null,
      consent: true,
      source_path: window.location.pathname.slice(0, 300),
      utm_source: params.get("utm_source")?.slice(0, 100) ?? null,
      utm_campaign: params.get("utm_campaign")?.slice(0, 100) ?? null,
      visitor_id: visitorId,
    });
    setSending(false);
    if (err) return setError("Sorry, that didn't send. Please try again in a moment.");
    marketingLead();
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card sm:p-8">
        <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden="true" />
        <h3 className="mt-3 text-xl font-bold">Thanks, {name.trim().split(" ")[0]}!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Sheila will be in touch soon. There's no obligation and no pressure.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="lead-name">Your name</Label>
          <Input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-phone">Phone</Label>
          <Input id="lead-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className="min-h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-email">Email</Label>
          <Input id="lead-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="min-h-11" />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">I'm interested in</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button
              key={i.value}
              type="button"
              onClick={() => setInterest(i.value)}
              aria-pressed={interest === i.value}
              className={
                interest === i.value
                  ? "min-h-11 rounded-xl border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground"
                  : "min-h-11 rounded-xl border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
              }
            >
              {i.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="lead-message">Anything you'd like Sheila to know? (optional)</Label>
        <Textarea
          id="lead-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="e.g. best time to call, who you're with now"
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox id="lead-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
        <Label htmlFor="lead-consent" className="text-sm leading-snug font-normal text-muted-foreground">
          I'm happy for Sheila Gwillam-Winter to contact me about this. My details are handled as set out
          in the{" "}
          <Link to="/privacy" className="font-medium text-brand hover:underline">
            privacy notice
          </Link>
          .
        </Label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={sending} className="min-h-12 w-full rounded-xl text-base">
        {sending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {sending ? "Sending…" : "Get my free bill check"}
      </Button>
    </form>
  );
}
