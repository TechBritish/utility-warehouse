import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Loader2, Mic, MicOff, PhoneOff, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VOICE_PAGES, buildSiteKnowledge, type VoicePage } from "@/lib/site-knowledge";

// @vapi-ai/web is browser-only, so it's imported lazily inside start().
type VapiInstance = InstanceType<typeof import("@vapi-ai/web").default>;
type Status = "idle" | "connecting" | "active";
type Line = { who: "ai" | "you"; text: string };

const NAMED_TARGETS: Record<string, string> = {
  "start training button": 'a[href="/signup"]',
  "sign in button": 'a[href="/login"]',
  "theme toggle": 'button[aria-label*="mode"]',
  "main menu": 'nav[aria-label="Main"]',
};

function flash(el: Element | null) {
  if (!(el instanceof HTMLElement)) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("uw-voice-highlight");
  window.setTimeout(() => el.classList.remove("uw-voice-highlight"), 3500);
  return true;
}

function waitFor(selector: string, tries = 20): Promise<Element | null> {
  return new Promise((resolve) => {
    const tick = (n: number) => {
      const el = document.querySelector(selector);
      if (el || n <= 0) return resolve(el);
      window.setTimeout(() => tick(n - 1), 150);
    };
    tick(tries);
  });
}

const fn = (name: string, description: string, properties: Record<string, unknown> = {}, required: string[] = []) => ({
  type: "function" as const,
  async: true,
  function: { name, description, parameters: { type: "object", properties, required } },
});

const TOOLS = [
  fn(
    "navigate",
    "Open a page of the website.",
    {
      page: { type: "string", enum: [...Object.keys(VOICE_PAGES), "module"] },
      moduleId: { type: "string", description: "Module id when page is 'module' (1-4)" },
    },
    ["page"],
  ),
  fn("scroll_to", "Scroll to and highlight a section by its id.", { id: { type: "string" } }, ["id"]),
  fn("highlight", "Point out a named button or area.", { target: { type: "string" } }, ["target"]),
  fn("start_tour", "Start the dashboard walkthrough tour."),
  fn("toggle_theme", "Switch between light and dark mode."),
  fn("start_practice", "Open the Voice AI trainer to practise a conversation."),
  fn("end_call", "End the voice conversation."),
];

export function VoiceGuide() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  const vapiRef = useRef<VapiInstance | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [partial, setPartial] = useState<Line | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines, partial]);

  useEffect(() => () => vapiRef.current?.stop(), []);

  const runTool = useCallback(
    async (name: string, args: Record<string, string>): Promise<string> => {
      switch (name) {
        case "navigate": {
          if (args.page === "module") {
            const moduleId = args.moduleId ?? "1";
            await navigate({ to: "/training/$moduleId", params: { moduleId } });
            return `Opened module ${moduleId}.`;
          }
          const to = VOICE_PAGES[args.page as VoicePage];
          if (!to) return `Unknown page ${args.page}.`;
          await navigate({ to });
          return `Opened ${args.page}.`;
        }
        case "scroll_to": {
          const el = await waitFor(`#${CSS.escape(args.id ?? "")}`);
          const target = el?.closest("section") ?? el;
          return flash(target) ? `Scrolled to ${args.id}.` : `Section ${args.id} isn't on this page.`;
        }
        case "highlight": {
          const sel = NAMED_TARGETS[(args.target ?? "").toLowerCase()];
          const el = sel ? await waitFor(sel) : null;
          return flash(el) ? `Highlighted ${args.target}.` : `Couldn't find ${args.target} here.`;
        }
        case "start_tour":
          window.localStorage.setItem("uw-onboarding-tour", "pending");
          await navigate({ to: "/dashboard" });
          window.dispatchEvent(new Event("uw:start-tour"));
          return "Tour started on the dashboard.";
        case "toggle_theme":
          window.dispatchEvent(new Event("uw:toggle-theme"));
          return "Theme switched.";
        case "start_practice":
          await navigate({ to: "/trainer" });
          return "Opened the Voice AI trainer.";
        case "end_call":
          window.setTimeout(() => vapiRef.current?.stop(), 1500);
          return "Ending the call.";
        default:
          return `Unknown action ${name}.`;
      }
    },
    [navigate],
  );

  const start = useCallback(async () => {
    if (!publicKey || !assistantId) {
      toast.error("Voice guide isn't set up yet — the Vapi credentials are missing.");
      return;
    }
    setStatus("connecting");
    setLines([]);
    setPartial(null);
    try {
      let vapi = vapiRef.current;
      if (!vapi) {
        const mod = await import("@vapi-ai/web");
        let Ctor: unknown = mod;
        while (Ctor && typeof Ctor !== "function" && (Ctor as { default?: unknown }).default) {
          Ctor = (Ctor as { default?: unknown }).default;
        }
        vapi = new (Ctor as new (k: string) => VapiInstance)(publicKey);
        vapiRef.current = vapi;

        vapi.on("call-start", () => setStatus("active"));
        vapi.on("call-end", () => {
          setStatus("idle");
          setSpeaking(false);
          setVolume(0);
          setMuted(false);
        });
        vapi.on("speech-start", () => setSpeaking(true));
        vapi.on("speech-end", () => setSpeaking(false));
        vapi.on("volume-level", (v: number) => setVolume(v));
        vapi.on("error", (e: unknown) => {
          console.error("Voice guide error", e);
          setStatus("idle");
          toast.error("The voice guide couldn't connect. Please try again.");
        });
        vapi.on("message", async (msg: any) => {
          if (msg.type === "transcript" && msg.transcript) {
            const who = msg.role === "user" ? "you" : "ai";
            if (msg.transcriptType === "final") {
              setPartial(null);
              setLines((p) => [...p, { who, text: msg.transcript }]);
            } else setPartial({ who, text: msg.transcript });
          }
          if (msg.type === "tool-calls" && Array.isArray(msg.toolCallList)) {
            for (const call of msg.toolCallList) {
              const name = call.function?.name as string;
              const raw = call.function?.arguments;
              const args = typeof raw === "string" ? JSON.parse(raw || "{}") : (raw ?? {});
              const result = await runTool(name, args);
              setLastAction(result);
              vapiRef.current?.send({
                type: "add-message",
                message: { role: "system", content: `Action result: ${result} User is now on ${pathRef.current}.` },
              });
            }
          }
        });
      }

      // Same Vapi assistant as the /trainer page (VITE_VAPI_ASSISTANT_ID), so
      // there's a single assistant with the full product/site knowledge and
      // a consistent voice — just with its own first message, system prompt
      // and navigation tools layered on top for this site-guide context.
      await vapi.start(assistantId, {
        firstMessage:
          "Hi, I'm Ava — think of me as your UW sales trainer. I can tell you how the Partner opportunity works, help you handle a tricky customer question, or get you practising right now. What would help most?",
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: buildSiteKnowledge(pathRef.current) }],
          tools: TOOLS,
        },
      } as any);
    } catch (e) {
      console.error(e);
      setStatus("idle");
      toast.error("The voice guide couldn't start. Check your microphone and try again.");
    }
  }, [publicKey, assistantId, runTool]);

  const stop = () => vapiRef.current?.stop();
  const toggleMute = () => {
    const next = !muted;
    vapiRef.current?.setMuted(next);
    setMuted(next);
  };

  // The trainer page runs its own voice session.
  if (location.pathname.startsWith("/trainer") && status === "idle") return null;

  const active = status === "active";

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open && (
        <div
          role="dialog"
          aria-label="Voice guide"
          className="w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-border bg-card shadow-elevated"
        >
          <div className="flex items-center justify-between bg-gradient-brand px-4 py-3 text-primary-foreground">
            <div>
              <p className="text-sm font-bold">Ava · Voice guide</p>
              <p className="text-xs opacity-80">
                {status === "connecting" ? "Connecting…" : active ? (speaking ? "Speaking…" : "Listening…") : "Ask me anything about the site"}
              </p>
            </div>
            <button aria-label="Close voice guide" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-primary-foreground/15">
              <X className="size-4" />
            </button>
          </div>

          <div ref={logRef} className="max-h-64 min-h-32 space-y-2 overflow-y-auto px-4 py-3 text-sm">
            {lines.length === 0 && !partial && (
              <div className="space-y-1 text-muted-foreground">
                <p>Try saying:</p>
                <ul className="list-disc space-y-0.5 pl-5 text-xs">
                  <li>“What's in Module 3?”</li>
                  <li>“Take me to the guidelines”</li>
                  <li>“Show me the FAQ”</li>
                  <li>“Start the tour” · “Switch to dark mode”</li>
                  <li>“I want to practise a call”</li>
                </ul>
              </div>
            )}
            {[...lines, ...(partial ? [partial] : [])].map((l, i) => (
              <p
                key={i}
                className={cn(
                  "rounded-xl px-3 py-2",
                  l.who === "you" ? "ml-8 bg-primary text-primary-foreground" : "mr-8 bg-secondary text-secondary-foreground",
                  partial && i === lines.length && "opacity-70",
                )}
              >
                {l.text}
              </p>
            ))}
          </div>

          {lastAction && active && (
            <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">✓ {lastAction}</p>
          )}

          <div className="flex items-center gap-2 border-t border-border p-3">
            {active ? (
              <>
                <Button variant="outline" size="sm" className="min-h-11 flex-1 rounded-xl" onClick={toggleMute}>
                  {muted ? <MicOff /> : <Mic />} {muted ? "Unmute" : "Mute"}
                </Button>
                <Button variant="destructive" size="sm" className="min-h-11 flex-1 rounded-xl" onClick={stop}>
                  <PhoneOff /> End
                </Button>
              </>
            ) : (
              <Button className="min-h-11 w-full rounded-xl" onClick={start} disabled={status === "connecting"}>
                {status === "connecting" ? <Loader2 className="animate-spin" /> : <Mic />}
                {status === "connecting" ? "Connecting…" : "Start talking"}
              </Button>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open && status === "idle") void start();
        }}
        aria-label={open ? "Hide voice guide" : "Talk to the voice guide"}
        className="relative grid size-14 place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-elevated transition-transform hover:scale-105"
      >
        {active && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary/40"
            style={{ transform: `scale(${1 + Math.min(volume, 1) * 0.6})`, transition: "transform 80ms" }}
          />
        )}
        {status === "connecting" ? <Loader2 className="relative size-6 animate-spin" /> : <Mic className="relative size-6" />}
      </button>
    </div>
  );
}
