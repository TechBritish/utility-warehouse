import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap, LogIn, Phone, PhoneOff, PiggyBank } from "lucide-react";

import aiOrb from "@/assets/ai-orb.jpg";

/** Fired to open Ava and start a voice call (handled in VoiceGuide). */
export const AVA_START_EVENT = "uw:ava-start";
/** Fired when the welcome popup closes, so Ava can show her nudge. */
export const WELCOME_CLOSED_EVENT = "uw:welcome-closed";

const SHORTCUTS = [
  { icon: PiggyBank, label: "Bill check", action: "bills" as const },
  { icon: GraduationCap, label: "Join free", action: "signup" as const },
  { icon: LogIn, label: "Sign in", action: "login" as const },
];

const CALL_CSS = `
@keyframes uw-ring { 0%,100% { transform: rotate(0) } 10%,30% { transform: rotate(-14deg) } 20%,40% { transform: rotate(14deg) } 50% { transform: rotate(0) } }
@keyframes uw-buzz { 0%,100% { transform: translateX(0) } 2%,6% { transform: translateX(-3px) } 4%,8% { transform: translateX(3px) } 10% { transform: translateX(0) } }
@keyframes uw-dots { 0%,20% { opacity: .2 } 50% { opacity: 1 } 100% { opacity: .2 } }
.uw-ring { animation: uw-ring 1.2s ease-in-out infinite }
.uw-buzz { animation: uw-buzz 2.4s ease-in-out infinite }
.uw-dot { animation: uw-dots 1.4s infinite }
@media (prefers-reduced-motion: reduce) { .uw-ring, .uw-buzz, .uw-dot { animation: none } }
`;

function clock() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** Home page welcome, styled as an iPhone incoming call from Ava. Shown on every visit. */
export function WelcomePopup() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  const close = () => {
    setOpen(false);
    window.dispatchEvent(new Event(WELCOME_CLOSED_EVENT));
  };

  const answer = () => {
    setOpen(false);
    window.dispatchEvent(new Event(AVA_START_EVENT));
  };

  const go = (action: (typeof SHORTCUTS)[number]["action"]) => {
    close();
    if (action === "bills") {
      document.getElementById("bill-check")?.scrollIntoView({ behavior: "smooth" });
    } else {
      void navigate({ to: action === "signup" ? "/signup" : "/login" });
    }
  };

  if (!open) return null;

  return (
    <AvaCallScreen
      message="Hi! Answer and I'll show you around in a minute. Lower bills, joining, or signing in."
      shortcuts={SHORTCUTS.map((sc) => ({ icon: sc.icon, label: sc.label, onClick: () => go(sc.action) }))}
      onAnswer={answer}
      onDecline={close}
    />
  );
}

type Shortcut = { icon: typeof PiggyBank; label: string; onClick: () => void };

/** iPhone-style incoming call from Ava. Green answers (starts a voice call), red declines. */
export function AvaCallScreen({
  message,
  shortcuts = [],
  onAnswer,
  onDecline,
}: {
  message: string;
  shortcuts?: Shortcut[];
  onAnswer: () => void;
  onDecline: () => void;
}) {
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(clock());
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDecline();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 backdrop-blur-md"
      onClick={onDecline}
    >
      <style>{CALL_CSS}</style>
      {/* Phone */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(e) => e.stopPropagation()}
        className="uw-buzz relative flex h-[min(760px,calc(100dvh-24px))] w-[min(370px,100%)] flex-col overflow-hidden rounded-[3rem] border-[10px] border-neutral-900 bg-gradient-to-b from-[#2b1d4f] via-[#3d2a6b] to-[#120c24] text-white shadow-2xl ring-1 ring-white/10"
      >
        {/* Status bar + dynamic island */}
        <div className="relative flex h-11 shrink-0 items-center justify-between px-7 text-sm font-semibold">
          <span>{time}</span>
          <span className="absolute top-2 left-1/2 h-7 w-28 -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="flex items-end gap-px">
              {[4, 6, 8, 10].map((h) => (
                <span key={h} className="w-[3px] rounded-sm bg-white" style={{ height: h }} />
              ))}
            </span>
            <span className="ml-1 h-3 w-6 rounded-[4px] border border-white/80 p-px">
              <span className="block h-full w-4/5 rounded-[2px] bg-white" />
            </span>
          </span>
        </div>

        {/* Caller */}
        <div className="flex min-h-0 flex-1 flex-col items-center px-6 pt-3 text-center sm:pt-8">
          <p className="text-sm text-white/70">
            Incoming call
            <span className="uw-dot">.</span>
            <span className="uw-dot" style={{ animationDelay: ".2s" }}>.</span>
            <span className="uw-dot" style={{ animationDelay: ".4s" }}>.</span>
          </p>
          <h2 id="welcome-title" className="mt-2 text-4xl font-semibold tracking-tight">
            Ava
          </h2>
          <p className="mt-1 text-base text-white/80">Simple Options · Your AI helper</p>

          <div className="relative mt-4 grid size-[clamp(5.5rem,17dvh,10rem)] shrink-0 place-items-center sm:mt-8">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/15 motion-reduce:hidden" aria-hidden="true" />
            <span className="absolute -inset-3 rounded-full ring-2 ring-white/10" aria-hidden="true" />
            <img src={aiOrb} alt="" className="relative size-full rounded-full object-cover ring-4 ring-white/20" />
          </div>

          <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-white/80 sm:mt-6">
            {message}
          </p>
        </div>

        {/* Decline / Accept (red and green), always in view above the shortcuts */}
        <div className="flex shrink-0 items-start justify-between px-10 pb-3 pt-2">
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={onDecline}
              aria-label="Decline, close this"
              className="grid size-16 place-items-center rounded-full bg-[#ff3b30] shadow-lg transition-transform hover:scale-105 active:scale-95 sm:size-20"
            >
              <PhoneOff className="size-8 sm:size-9" aria-hidden="true" />
            </button>
            <span className="text-sm">Decline</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={onAnswer}
              aria-label="Accept, speak to Ava"
              className="grid size-16 place-items-center rounded-full bg-[#34c759] shadow-lg transition-transform hover:scale-105 active:scale-95 sm:size-20"
            >
              <Phone className="uw-ring size-8 fill-white sm:size-9" aria-hidden="true" />
            </button>
            <span className="text-sm">Speak to Ava</span>
          </div>
        </div>

        {/* Shortcuts (grey): bill check, join free, sign in. Sit at the bottom, like the iOS Remind Me / Message row */}
        <div className="grid w-full shrink-0 grid-cols-3 gap-2 px-6 pb-6">
          {shortcuts.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={s.onClick}
              className="flex flex-col items-center gap-1 rounded-2xl py-1.5 text-xs font-medium text-white/90 hover:bg-white/10"
            >
              <span className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur">
                <s.icon className="size-5" aria-hidden="true" />
              </span>
              {s.label}
            </button>
          ))}
        </div>
        <span className="absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-white/70" aria-hidden="true" />
      </div>
    </div>
  );
}
