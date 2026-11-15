import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, LogIn, Mic, PiggyBank, X } from "lucide-react";

/** Fired to open Ava and start a voice call (handled in VoiceGuide). */
export const AVA_START_EVENT = "uw:ava-start";
/** Fired when the welcome popup closes, so Ava can show her nudge. */
export const WELCOME_CLOSED_EVENT = "uw:welcome-closed";

const STEPS = [
  {
    icon: PiggyBank,
    title: "Want lower bills?",
    text: "Leave your details for a free bill check from Sheila.",
    cta: "Get a free bill check",
    action: "bills" as const,
  },
  {
    icon: GraduationCap,
    title: "Thinking of becoming a Partner?",
    text: "Create a free account and start the short training.",
    cta: "Start free",
    action: "signup" as const,
  },
  {
    icon: LogIn,
    title: "Already a Partner?",
    text: "Sign in to carry on your training where you left off.",
    cta: "Sign in",
    action: "login" as const,
  },
];

/** Simple "how this site works" popup, shown on every visit to the home page. */
export function WelcomePopup() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    window.dispatchEvent(new Event(WELCOME_CLOSED_EVENT));
  };

  const speakToAva = () => {
    setOpen(false);
    window.dispatchEvent(new Event(AVA_START_EVENT));
  };

  const go = (action: (typeof STEPS)[number]["action"]) => {
    close();
    if (action === "bills") {
      document.getElementById("bill-check")?.scrollIntoView({ behavior: "smooth" });
    } else {
      void navigate({ to: action === "signup" ? "/signup" : "/login" });
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-dvh w-full overflow-y-auto rounded-t-3xl bg-card p-5 pt-6 shadow-lift sm:max-w-lg sm:rounded-3xl sm:p-8"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 grid size-14 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
        >
          <X className="size-8" strokeWidth={2.5} aria-hidden="true" />
        </button>

        <h2 id="welcome-title" className="pr-16 text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome! Here's how it works
        </h2>
        <p className="mt-1 text-muted-foreground">Pick what you're here for. It takes seconds.</p>

        <button
          type="button"
          onClick={speakToAva}
          className="mt-5 flex min-h-20 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-brand px-5 text-xl font-bold text-primary-foreground shadow-elevated transition-transform hover:scale-[1.02] sm:text-2xl"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/20">
            <Mic className="size-7" aria-hidden="true" />
          </span>
          Speak to Ava
        </button>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Not sure? Ava is our friendly AI helper. Just talk, she'll guide you.
        </p>

        <ol className="mt-5 space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.action}>
              <button
                type="button"
                onClick={() => go(s.action)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-3 text-left transition-colors hover:bg-accent sm:p-4"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <s.icon className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {i + 1}. {s.title}
                  </span>
                  <span className="block text-sm text-muted-foreground">{s.text}</span>
                </span>
                <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand sm:flex">
                  {s.cta} <ArrowRight className="size-4" aria-hidden="true" />
                </span>
                <ArrowRight className="size-5 shrink-0 text-brand sm:hidden" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={close}
          className="mt-4 min-h-11 w-full text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          No thanks, just let me look around
        </button>
      </div>
    </div>
  );
}
