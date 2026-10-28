import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  X,
  Mic,
  MicOff,
  Volume2,
  History,
  Star,
  Download,
  Share2,
  ChevronDown,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Lightbulb,
  RotateCw,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LiveWaveform, type VizMode } from "@/components/uw/LiveWaveform";
import { TranscriptPanel, type TranscriptMessage } from "@/components/uw/TranscriptPanel";
import { SessionSummaryDialog } from "@/components/uw/SessionSummaryDialog";
import { useMicAnalyser } from "@/hooks/use-mic-analyser";
import { useVapi } from "@/hooks/use-vapi";
import { useIsMobile } from "@/hooks/use-mobile";
import { fireConfetti } from "@/lib/confetti";
import { scenarios } from "@/lib/uw-data";
import { usePartnerData } from "@/lib/use-partner-data";
import { cn } from "@/lib/utils";
import { RequireAuth } from "@/components/uw/RequireAuth";

export const Route = createFileRoute("/trainer")({
  head: () => ({
    meta: [
      { title: "Voice AI Trainer — Practise UW Conversations" },
      {
        name: "description",
        content:
          "Tap, speak and practise real UW customer conversations with your voice AI coach. Live mic visualisation, objectives and instant feedback.",
      },
      { property: "og:title", content: "Voice AI Trainer — Practise UW Conversations" },
      {
        property: "og:description",
        content: "Your 24/7 voice AI coach for objection handling and customer conversations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Trainer />
    </RequireAuth>
  ),
});

// Fallback scripted exchange, used only when Vapi credentials are not configured
// (see `@/lib/vapi-config`) so the demo still works offline.
const script: Omit<TranscriptMessage, "id">[] = [
  {
    who: "ai",
    text: "Hi Sarah! Let's practise objections. I'm a busy neighbour — go ahead.",
    at: "00:02",
    reaction: "🤔",
  },
  {
    who: "you",
    text: "Hi Jane! Quick question — who do you pay for broadband at the moment?",
    at: "00:11",
  },
  {
    who: "ai",
    text: "Honestly I'm quite busy right now, and I think switching is a hassle.",
    at: "00:18",
    reaction: "👍",
  },
  {
    who: "you",
    text: "Totally fair. It takes about ten minutes and I handle the rest for you.",
    at: "00:27",
  },
  {
    who: "ai",
    text: "Great acknowledgement before answering — that keeps people listening. Try quantifying the saving next.",
    at: "00:34",
    keyTip: true,
    reaction: "🎉",
  },
  {
    who: "you",
    text: "Most households on a bundle see a single simpler bill each month.",
    at: "00:44",
  },
];

const focusAreas = [
  "Overcoming objections",
  "Explaining bundles",
  "Building rapport",
  "Closing confidently",
  "Answering technical questions",
];

type ScenarioContent = {
  preview: { who: "ai" | "you"; text: string }[];
  tips: string[];
  objectives: string[];
};

const scenarioContent: Record<string, ScenarioContent> = {
  objections: {
    preview: [
      { who: "ai", text: "I'm happy with my current supplier, thanks." },
      { who: "you", text: "Makes sense — what do you like most about them?" },
      { who: "ai", text: "It's just easy, I don't want the hassle of switching." },
      { who: "you", text: "That's exactly why people bundle — one bill, one login." },
    ],
    tips: [
      "Listen fully before you respond.",
      "Acknowledge the concern in their own words.",
      "Ask one question at a time.",
      "Never promise specific income or savings.",
      "Close with a clear next step.",
    ],
    objectives: ["Acknowledge the objection", "Overcoming objections", "Explaining bundles"],
  },
  product: {
    preview: [
      { who: "ai", text: "So what actually is Utility Warehouse?" },
      { who: "you", text: "One provider for energy, broadband, mobile and insurance — on one bill." },
      { who: "ai", text: "And what's this Cashback Card thing?" },
      { who: "you", text: "You earn cashback when you shop, which comes off your bill." },
    ],
    tips: [
      "Keep answers short, then check they've understood.",
      "Use plain English, not product jargon.",
      "If you don't know, say you'll find out.",
      "Link each feature to what they care about.",
    ],
    objectives: ["Explaining bundles", "Answering technical questions", "Checking understanding"],
  },
  "first-call": {
    preview: [
      { who: "ai", text: "Hiya, you said you wanted a quick chat?" },
      { who: "you", text: "Thanks for making time! How's everything at home at the moment?" },
      { who: "ai", text: "Busy, bills keep going up to be honest." },
      { who: "you", text: "That's really common — can I ask who you're with for energy?" },
    ],
    tips: [
      "Build rapport before you mention UW.",
      "Ask open questions about their bills and home.",
      "Let them talk more than you.",
      "Agree a follow-up before you end the call.",
    ],
    objectives: ["Building rapport", "Discovering their needs", "Agreeing a next step"],
  },
  closing: {
    preview: [
      { who: "ai", text: "I've had a think... I'm still not totally sure." },
      { who: "you", text: "Totally fair — what's the one thing holding you back?" },
      { who: "ai", text: "Mainly whether it's worth the switch." },
      { who: "you", text: "Shall we look at your actual bills together on Thursday?" },
    ],
    tips: [
      "Find the real reason behind the hesitation.",
      "Summarise what they said they want.",
      "Ask for the next step directly.",
      "Offer a specific day and time.",
    ],
    objectives: ["Handling hesitation", "Closing confidently", "Agreeing a next step"],
  },
  savings: {
    preview: [
      { who: "ai", text: "Would I actually save money switching to you?" },
      { who: "you", text: "Let's find out — roughly what do you pay for energy each month?" },
      { who: "ai", text: "About £150, plus broadband and two mobiles." },
      { who: "you", text: "Great, let's put those side by side with a bundle." },
    ],
    tips: [
      "Get their real numbers before comparing.",
      "Never promise a specific saving.",
      "Show the whole picture: one bill, cashback, price promise.",
      "Let them reach the conclusion themselves.",
    ],
    objectives: ["Gathering their bills", "Explaining bundles", "No savings promises"],
  },
};

// Opening line the role-play customer says, per scenario.
const defaultOpener = "Oh hiya. Look, I'm happy with my current supplier, thanks.";

/** Spoken intro before the role-play: who she is and how to use the trainer. */
function introLine(scenarioLabel: string, goalMinutes: number) {
  return (
    `Hi, I'm Sammy, your UW practice coach. Quick how-to before we start. ` +
    `I'll play a customer for the scenario you picked, ${scenarioLabel}, and you just talk to me out loud, like a real conversation. ` +
    `Your live objectives tick off as you go. Below me you can mute, pause, or switch on push-to-talk, and change scenario from the dropdown. ` +
    `Aim for your ${goalMinutes} minute goal, and your transcripts are in View history and Export. ` +
    `Say "end session" any time for feedback. Right, I'm your customer now. `
  );
}
const scenarioOpeners: Record<string, string> = {
  objections: defaultOpener,
  product: "Hi! So go on then, what actually is Utility Warehouse?",
  "first-call": "Hiya, you said you wanted a quick chat? I've only got a few minutes.",
  closing: "I've had a think about what you said... I'm still not totally sure.",
  savings: "Alright, so would I actually save money switching to you lot?",
};

const levelStyles = {
  beginner: "border-success text-success data-[state=checked]:bg-success/15",
  intermediate: "border-warning text-warning data-[state=checked]:bg-warning/15",
  advanced: "border-destructive text-destructive data-[state=checked]:bg-destructive/15",
} as const;

const SPEEDS = [0.75, 1, 1.25, 1.5];

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Parses an "mm:ss" timestamp (as produced by `formatTime`) into whole seconds. */
function parseTimeLabel(at: string): number {
  const parts = at.split(":").map((n) => Number.parseInt(n, 10));
  const m = parts[0] ?? 0;
  const s = parts[1] ?? 0;
  if (Number.isNaN(m) || Number.isNaN(s)) return 0;
  return m * 60 + s;
}

/**
 * Derives real session metrics from the actual transcript turns and elapsed
 * time, rather than hardcoded placeholder numbers. Falls back to sane
 * defaults when there isn't enough data (e.g. a session ended immediately).
 */
function computeSessionMetrics(
  messages: TranscriptMessage[],
  durationSeconds: number,
): import("@/components/uw/SessionSummaryDialog").SessionMetrics {
  const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const yourWords = messages.filter((m) => m.who === "you").reduce((n, m) => n + countWords(m.text), 0);
  const aiWords = messages.filter((m) => m.who === "ai").reduce((n, m) => n + countWords(m.text), 0);
  const totalWords = yourWords + aiWords;

  const speakingPct = totalWords > 0 ? Math.round((yourWords / totalWords) * 100) : 50;

  const turns = messages.length;

  // Average gap between consecutive turns, as a proxy for response time.
  let avgResponseSeconds = 0;
  if (messages.length > 1) {
    const gaps: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      const gap = parseTimeLabel(messages[i]!.at) - parseTimeLabel(messages[i - 1]!.at);
      if (gap > 0) gaps.push(gap);
    }
    if (gaps.length > 0) avgResponseSeconds = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  }

  const minutes = durationSeconds / 60;
  const wpm = minutes > 0 ? Math.round(yourWords / minutes) : 0;

  return {
    durationLabel: formatTime(durationSeconds),
    speakingPct,
    turns,
    avgResponse: avgResponseSeconds > 0 ? `${avgResponseSeconds.toFixed(1)}s` : "—",
    wpm,
  };
}

function Trainer() {
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const lastMetrics = useRef<import("@/components/uw/SessionSummaryDialog").SessionMetrics>({
    durationLabel: "00:00",
    speakingPct: 50,
    turns: 0,
    avgResponse: "—",
    wpm: 0,
  });
  const searchRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useIsMobile();
  const { saveSession } = usePartnerData();

  // Pre-session config
  const [scenario, setScenario] = useState("objections");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [goalMinutes, setGoalMinutes] = useState([15]);
  const [focus, setFocus] = useState<string[]>([]);

  // Audio
  const mic = useMicAnalyser();
  const vapi = useVapi();
  // True while a mid-call scenario switch restarts the Vapi call, so the
  // old call's "ended" doesn't end the session.
  const switchingRef = useRef(false);
  const useRealVoiceAi = vapi.isConfigured;
  const [vizMode, setVizMode] = useState<VizMode>("bars");
  const [sensitivity, setSensitivity] = useState([1]);
  const [speed, setSpeed] = useState(1);
  const [pushToTalk, setPushToTalk] = useState(false);
  const [holding, setHolding] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);

  // Conversation
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [scriptedAiSpeaking, setScriptedAiSpeaking] = useState(false);
  const aiSpeaking = useRealVoiceAi ? vapi.aiSpeaking : scriptedAiSpeaking;
  const [silence, setSilence] = useState(0);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [goalCelebrated, setGoalCelebrated] = useState(false);

  const speaking = !muted && (pushToTalk ? holding : mic.level > 0.12);

  // Preferences
  useEffect(() => {
    try {
      const raw = localStorage.getItem("uw-trainer-prefs");
      if (!raw) return;
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (typeof p["speed"] === "number") setSpeed(p["speed"]);
      if (typeof p["vizMode"] === "string") setVizMode(p["vizMode"] as VizMode);
      if (typeof p["sensitivity"] === "number") setSensitivity([p["sensitivity"]]);
      if (typeof p["pushToTalk"] === "boolean") setPushToTalk(p["pushToTalk"]);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "uw-trainer-prefs",
        JSON.stringify({ speed, vizMode, sensitivity: sensitivity[0], pushToTalk }),
      );
    } catch {
      /* ignore */
    }
  }, [speed, vizMode, sensitivity, pushToTalk]);

  // Session timer
  useEffect(() => {
    if (!active || paused) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [active, paused]);

  // Silence tracking
  useEffect(() => {
    if (!active || paused) return;
    if (speaking) {
      setSilence(0);
      return;
    }
    const id = window.setInterval(() => setSilence((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [active, paused, speaking]);

  // Scripted conversation (fallback demo mode only — skipped when Vapi is configured)
  useEffect(() => {
    if (useRealVoiceAi) return;
    if (!active || paused) return;
    if (messages.length >= script.length) return;
    const next = script[messages.length]!;
    const delay = 5200 / speed;
    let typeId = 0;
    const id = window.setTimeout(() => {
      if (next.who === "ai") {
        setTyping(true);
        typeId = window.setTimeout(() => {
          setTyping(false);
          setScriptedAiSpeaking(true);
          if (navigator.vibrate) navigator.vibrate(40);
          setMessages((m) => [...m, { ...next, id: `m${m.length}` }]);
          window.setTimeout(() => setScriptedAiSpeaking(false), 2600);
          if (next.keyTip) fireConfetti(1200);
        }, 1100);
      } else {
        setMessages((m) => [...m, { ...next, id: `m${m.length}` }]);
      }
    }, delay);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(typeId);
    };
  }, [useRealVoiceAi, active, paused, messages.length, speed]);

  // Live conversation — syncs real Vapi transcript turns into the same
  // messages state the UI already renders.
  const syncedVapiCount = useRef(0);
  useEffect(() => {
    if (!useRealVoiceAi) return;
    if (vapi.transcript.length <= syncedVapiCount.current) return;
    const newTurns = vapi.transcript.slice(syncedVapiCount.current);
    syncedVapiCount.current = vapi.transcript.length;
    setMessages((m) => [
      ...m,
      ...newTurns.map((t, i) => ({
        ...t,
        id: `v${m.length + i}`,
        at: formatTime(seconds),
      })),
    ]);
    if (navigator.vibrate) navigator.vibrate(40);
  }, [useRealVoiceAi, vapi.transcript, seconds]);

  useEffect(() => {
    if (!useRealVoiceAi) return;
    if (vapi.error) toast.error(vapi.error);
  }, [useRealVoiceAi, vapi.error]);

  useEffect(() => {
    if (!useRealVoiceAi) return;
    if (vapi.status === "active" || vapi.status === "error") switchingRef.current = false;
    if (vapi.status === "ended" && active && !switchingRef.current) endSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useRealVoiceAi, vapi.status]);

  // Objectives auto-check
  const content = scenarioContent[scenario] ?? scenarioContent["objections"]!;
  const objectives = focus.length ? focus : content.objectives;
  useEffect(() => {
    const reached = Math.min(objectives.length, Math.floor(messages.length / 2));
    const next = objectives.slice(0, reached);
    if (next.length > done.length) {
      const justDone = next[next.length - 1]!;
      setDone(next);
      toast.success(`Objective complete — ${justDone}`);
    }
  }, [messages.length, objectives, done.length]);

  // Goal progress
  const goalSeconds = (goalMinutes[0] ?? 15) * 60;
  const progress = Math.min(100, (seconds / goalSeconds) * 100);
  useEffect(() => {
    if (active && !goalCelebrated && seconds >= goalSeconds) {
      setGoalCelebrated(true);
      fireConfetti();
      toast.success("Practice goal reached! 🎉");
    }
  }, [active, seconds, goalSeconds, goalCelebrated]);

  // Wake lock
  useEffect(() => {
    if (!active) return;
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    void nav.wakeLock
      ?.request("screen")
      .then((l) => {
        lock = l;
      })
      .catch(() => {});
    return () => {
      void lock?.release().catch(() => {});
    };
  }, [active]);

  const endSession = useCallback(() => {
    if (useRealVoiceAi) vapi.stop();
    lastMetrics.current = computeSessionMetrics(messages, seconds);
    if (seconds > 0 && messages.length > 0) {
      void saveSession({
        scenario,
        durationSeconds: seconds,
        transcript: messages,
        rating: undefined,
      });
    }
    setActive(false);
    setPaused(false);
    setSeconds(0);
    setMessages([]);
    setDone([]);
    setGoalCelebrated(false);
    setSummaryOpen(true);
    syncedVapiCount.current = 0;
  }, [messages, seconds, scenario, saveSession, useRealVoiceAi, vapi]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typingInField =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (!active || typingInField) return;
      if (e.code === "Space") {
        e.preventDefault();
        setMuted((m) => !m);
      } else if (e.key === "Escape") {
        endSession();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, endSession]);

  function toggleFocus(area: string) {
    setFocus((f) => {
      if (f.includes(area)) return f.filter((a) => a !== area);
      if (f.length >= 3) return f;
      return [...f, area];
    });
  }

  function vapiStartOptions(scenarioValue = scenario, withIntro = true) {
    const label = scenarios.find((s) => s.value === scenarioValue)?.label ?? "Customer objections";
    const opener = scenarioOpeners[scenarioValue] ?? defaultOpener;
    return {
      firstMessage: withIntro
        ? introLine(label, goalMinutes[0] ?? 15) + opener
        : `Okay, switching to ${label}. I'm your customer now. ${opener}`,
      variableValues: {
        scenario: label,
        level,
        focus: focus.length ? focus.join(", ") : "general practice",
      },
    };
  }

  // Switching scenario changes the content, resets objectives and, mid-call,
  // restarts the role-play as the new scenario (without repeating the intro).
  function changeScenario(value: string) {
    if (value === scenario) return;
    setScenario(value);
    setDone([]);
    if (active && useRealVoiceAi) {
      const label = scenarios.find((s) => s.value === value)?.label ?? value;
      toast(`Switching to ${label}…`);
      switchingRef.current = true;
      vapi.stop();
      window.setTimeout(() => {
        // Reset only now: start() clears the old transcript in the same tick,
        // so old turns can't be re-synced as new ones.
        syncedVapiCount.current = 0;
        void vapi.start(vapiStartOptions(value, false));
      }, 600);
    }
  }

  async function startSession() {
    if (mic.status === "idle" || mic.status === "denied") {
      const granted = await mic.request();
      if (!granted) {
        toast.error("Microphone access is needed to practise. Allow it in your browser and try again.");
        return;
      }
    }
    setActive(true);
    setPaused(false);
    setMessages([]);
    setSilence(0);
    setHintDismissed(false);
    if (useRealVoiceAi) {
      syncedVapiCount.current = 0;
      await vapi.start(vapiStartOptions());
    }
  }

  const voiceState = aiSpeaking ? "ai" : speaking ? "user" : "idle";
  const statusLabel = aiSpeaking
    ? "Coach speaking…"
    : speaking
      ? "You're speaking"
      : pushToTalk
        ? "Hold to speak"
        : "Listening…";

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-night text-primary-foreground">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-4 sm:px-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="min-h-12 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <Link to="/dashboard">
            <ArrowLeft />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </Button>
        <p className="text-center font-mono text-sm text-primary-foreground/80">
          {formatTime(seconds)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-12 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          onClick={() => setHistoryOpen(true)}
        >
          <History />
          <span className="hidden sm:inline">View history</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="End session"
          onClick={endSession}
          disabled={!active}
          className="min-h-12 min-w-12 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <X />
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 pb-6 sm:px-6">
        {!active ? (
          <div className="flex w-full flex-1 flex-col items-center py-6 text-center">
            <button
              type="button"
              onClick={() => void startSession()}
              aria-label="Start practice session"
              className="relative grid size-40 place-items-center rounded-full bg-gradient-brand shadow-lift transition-transform duration-200 active:scale-[0.98] sm:size-48"
            >
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/40" />
              <Mic className="relative size-14 text-primary-foreground" aria-hidden="true" />
            </button>
            <p className="mt-8 text-lg font-semibold">Tap to start practice session</p>
            <p className="mt-2 max-w-sm text-sm text-primary-foreground/70">
              No question is too small. Your coach is ready whenever you are.
            </p>

            {/* Warm-up: microphone */}
            <div className="mt-8 w-full rounded-2xl bg-card/50 p-6 text-left text-foreground backdrop-blur">
              <h2 className="text-sm font-semibold">Mic check</h2>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  className="min-h-12 rounded-xl"
                  onClick={() => void startSession()}
                  disabled={mic.status === "requesting"}
                >
                  <Mic className="size-4" />
                  {mic.status === "requesting" ? "Requesting…" : "Allow microphone & start"}
                </Button>
                <span
                  className={cn(
                    "text-sm font-medium",
                    mic.status === "ready" && "text-success",
                    mic.status === "denied" && "text-destructive",
                    mic.status !== "ready" && mic.status !== "denied" && "text-muted-foreground",
                  )}
                  role="status"
                >
                  {mic.status === "ready"
                    ? "Microphone ready ✓"
                    : mic.status === "denied"
                      ? "Access denied ⚠️"
                      : mic.status === "requesting"
                        ? "Waiting for permission…"
                        : "Microphone not connected"}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Say something to test your mic — the bars should move.
              </p>
              <LiveWaveform
                analyser={mic.analyserRef.current}
                mode={vizMode}
                sensitivity={sensitivity[0] ?? 1}
                state={mic.level > 0.12 ? "user" : "idle"}
                className="mt-2 h-16"
              />
              {mic.status === "ready" && mic.level > 0.12 && (
                <p className="text-xs font-medium text-success">Mic working ✓</p>
              )}
            </div>

            {/* Scenario preview */}
            <div className="mt-4 w-full rounded-2xl bg-card/50 p-6 text-left text-foreground backdrop-blur">
              <h2 className="text-sm font-semibold">What this scenario sounds like</h2>
              <div className="mt-3 space-y-2">
                {content.preview.map((m, i) => (
                  <p
                    key={i}
                    className={cn(
                      "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                      m.who === "you"
                        ? "ml-auto rounded-br-sm bg-muted"
                        : "rounded-bl-sm bg-gradient-brand text-primary-foreground",
                    )}
                  >
                    {m.text}
                  </p>
                ))}
              </div>
              <Button className="mt-4 min-h-12 w-full rounded-xl" onClick={() => void startSession()}>
                Got it, let&apos;s start
              </Button>
            </div>

            {/* Quick tips */}
            <Collapsible className="mt-4 w-full rounded-2xl bg-card/50 p-6 text-left text-foreground backdrop-blur">
              <CollapsibleTrigger className="group flex min-h-12 w-full cursor-pointer items-center justify-between text-sm font-semibold">
                Quick tips for this scenario
                <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2">
                {content.tips.map((t) => (
                  <p key={t} className="flex gap-2 text-sm text-foreground/85">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                    {t}
                  </p>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Pre-session configuration */}
            <div className="mt-4 w-full rounded-2xl bg-card/50 p-6 text-left text-foreground backdrop-blur">
              <h2 className="text-sm font-semibold">Session setup</h2>

              <div className="mt-4 space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Scenario</label>
                <Select value={scenario} onValueChange={changeScenario}>
                  <SelectTrigger aria-label="Practice scenario" className="min-h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <span className="mr-1">{s.icon}</span>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Challenge level</label>
                <RadioGroup
                  value={level}
                  onValueChange={(v) => setLevel(v as typeof level)}
                  className="grid grid-cols-3 gap-2"
                >
                  {(
                    [
                      ["beginner", "Beginner"],
                      ["intermediate", "Intermediate"],
                      ["advanced", "Advanced"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className={cn(
                        "flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors",
                        levelStyles[value],
                        level !== value && "bg-transparent",
                      )}
                      data-state={level === value ? "checked" : "unchecked"}
                    >
                      <RadioGroupItem value={value} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Practice goal</label>
                  <span className="text-xs font-semibold">{goalMinutes[0]} min</span>
                </div>
                <Slider
                  value={goalMinutes}
                  onValueChange={setGoalMinutes}
                  min={5}
                  max={30}
                  step={5}
                  aria-label="Practice goal minutes"
                />
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  What to practice (up to 3)
                </label>
                <div className="space-y-2">
                  {focusAreas.map((area) => {
                    const checked = focus.includes(area);
                    const disabled = !checked && focus.length >= 3;
                    return (
                      <label
                        key={area}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl border border-border px-3",
                          disabled ? "opacity-50" : "cursor-pointer hover:bg-accent",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={() => toggleFocus(area)}
                        />
                        <span className="text-sm">{area}</span>
                      </label>
                    );
                  })}
                </div>
                {focus.length >= 3 && (
                  <p className="text-xs text-muted-foreground">Maximum of 3 focus areas selected.</p>
                )}
              </div>

              <Button
                onClick={() => void startSession()}
                className="mt-6 min-h-12 w-full rounded-xl text-base relative animate-pulse-ring"
              >
                Start practice session
              </Button>
              {focus.length === 0 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Tip: pick what you want to practise above, or just start — we'll default to objections and bundles.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-1 flex-col gap-4 landscape:flex-row landscape:items-start">
            <div className="landscape:w-1/2">
              {isMobile && (
                <p className="mb-2 text-center text-xs text-primary-foreground/60 portrait:block landscape:hidden">
                  Rotate to landscape for a bigger transcript
                </p>
              )}
              <div className="relative my-4">
                <div
                  className={cn(
                    "rounded-3xl p-2 transition-all",
                    speaking && "animate-pulse-ring ring-2 ring-success/60",
                    aiSpeaking && "ring-2 ring-warning/60",
                  )}
                >
                  <LiveWaveform
                    analyser={useRealVoiceAi ? null : mic.analyserRef.current}
                    level={useRealVoiceAi ? vapi.volumeLevel : undefined}
                    mode={vizMode}
                    state={voiceState}
                    sensitivity={sensitivity[0] ?? 1}
                    className="h-28 sm:h-36"
                  />
                </div>
                <p className="mt-2 text-center text-sm font-medium text-primary-foreground/85" role="status">
                  {statusLabel}
                </p>
                {useRealVoiceAi && vapi.status === "error" && (
                  <div className="mx-auto mt-3 flex max-w-sm items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-left text-xs">
                    <p className="flex-1">{vapi.error ?? "Call disconnected."}</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="min-h-9 shrink-0 rounded-lg"
                      onClick={() => void vapi.start(vapiStartOptions())}
                    >
                      Reconnect
                    </Button>
                  </div>
                )}
                {!speaking && !aiSpeaking && silence >= 2 && silence < 5 && (
                  <p className="mt-1 text-center text-xs text-primary-foreground/60">
                    Waiting for response…
                  </p>
                )}
                {!speaking && silence >= 5 && !hintDismissed && (
                  <div className="mx-auto mt-3 flex max-w-sm items-start gap-2 rounded-xl border border-gold/40 bg-primary-foreground/10 p-3 text-left text-xs">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                    <p className="flex-1">
                      {silence >= 10 ? content.tips[1] : content.tips[0]}
                    </p>
                    <button
                      type="button"
                      aria-label="Dismiss hint"
                      onClick={() => setHintDismissed(true)}
                      className="rounded p-1 hover:bg-primary-foreground/15"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}
                {silence >= 30 && (
                  <div className="mt-3 text-center">
                    <Button asChild variant="secondary" size="sm" className="min-h-11 rounded-xl">
                      <Link to="/guidelines">Need help? View guidelines</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Goal progress */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-primary-foreground/75">
                  <span>
                    {Math.floor(seconds / 60)} min / {goalMinutes[0]} min goal
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div
                  className="mt-1 h-2 w-full overflow-hidden rounded-full bg-primary-foreground/15"
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Practice goal progress"
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      progress < 40 ? "bg-success" : progress < 80 ? "bg-warning" : "bg-gradient-brand",
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Objectives */}
              <Collapsible defaultOpen className="mt-4 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/8 p-4">
                <CollapsibleTrigger className="group flex min-h-11 w-full cursor-pointer items-center justify-between text-sm font-semibold">
                  Live objectives
                  <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {objectives.map((o) => {
                    const complete = done.includes(o);
                    return (
                      <p key={o} className="flex items-center gap-2 text-sm">
                        {complete ? (
                          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                        ) : (
                          <Circle className="size-4 opacity-50" aria-hidden="true" />
                        )}
                        <span className={cn(complete && "line-through opacity-70")}>{o}</span>
                      </p>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </div>

            <TranscriptPanel
              messages={messages}
              typing={useRealVoiceAi ? vapi.status === "connecting" : typing}
              partial={useRealVoiceAi ? vapi.partial : null}
              searchRef={searchRef}
              className="min-h-64 flex-1 landscape:h-[60dvh]"
            />
          </div>
        )}

        {/* Bottom toolbar */}
        {active && (
          <div className="mt-6 w-full rounded-2xl border border-primary-foreground/15 bg-primary-foreground/8 p-4 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
              {pushToTalk ? (
                <Button
                  variant="secondary"
                  className="min-h-12 justify-start rounded-xl"
                  onPointerDown={() => setHolding(true)}
                  onPointerUp={() => setHolding(false)}
                  onPointerLeave={() => setHolding(false)}
                  aria-pressed={holding}
                >
                  <Mic /> {holding ? "Release to send" : "Hold to talk"}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() =>
                    setMuted((m) => {
                      const next = !m;
                      if (useRealVoiceAi) vapi.setMuted(next);
                      return next;
                    })
                  }
                  aria-pressed={muted}
                  className="min-h-12 justify-start text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  {muted ? <MicOff /> : <Mic />}
                  {muted ? "Unmute" : "Mute"}
                </Button>
              )}
              <div className="flex min-w-0 items-center gap-3">
                <Volume2 className="size-4 shrink-0 text-primary-foreground/70" aria-hidden="true" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={5}
                  aria-label="AI voice volume"
                  className="min-w-0 flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="min-h-12 text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  onClick={() => {
                    setPaused((p) => !p);
                    toast(paused ? "Session resumed" : "Session paused");
                  }}
                  aria-pressed={paused}
                >
                  {paused ? <Play /> : <Pause />}
                  {paused ? "Resume" : "Pause"}
                </Button>
                <Select value={scenario} onValueChange={changeScenario}>
                  <SelectTrigger
                    aria-label="Practice scenario"
                    className="min-h-12 border-primary-foreground/25 bg-transparent text-primary-foreground"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 border-t border-primary-foreground/15 pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-primary-foreground/70">Playback speed</p>
                <div className="mt-2 flex gap-2">
                  {SPEEDS.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={speed === s ? "secondary" : "ghost"}
                      className={cn(
                        "min-h-11 flex-1 rounded-xl",
                        speed === s
                          ? "text-secondary-foreground"
                          : "text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                      )}
                      onClick={() => {
                        setSpeed(s);
                        toast(`Playback speed ${s}x`);
                      }}
                      aria-pressed={speed === s}
                    >
                      {s}x
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-primary-foreground/70">Visualisation</p>
                <Tabs value={vizMode} onValueChange={(v) => setVizMode(v as VizMode)} className="mt-2">
                  <TabsList className="w-full">
                    <TabsTrigger value="bars" className="flex-1">
                      Bars
                    </TabsTrigger>
                    <TabsTrigger value="circle" className="flex-1">
                      Circle
                    </TabsTrigger>
                    <TabsTrigger value="frequency" className="flex-1">
                      Frequency
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <p className="text-xs font-medium text-primary-foreground/70">
                  Visualiser sensitivity
                </p>
                <Slider
                  value={sensitivity}
                  onValueChange={setSensitivity}
                  min={0.5}
                  max={2}
                  step={0.5}
                  aria-label="Visualiser sensitivity"
                  className="mt-3"
                />
              </div>

              <div className="space-y-3">
                <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <Radio className="size-4 opacity-70" aria-hidden="true" />
                    Push-to-talk mode
                  </span>
                  <Switch
                    checked={pushToTalk}
                    onCheckedChange={setPushToTalk}
                    aria-label="Push to talk mode"
                  />
                </label>
                <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="size-4 opacity-70" aria-hidden="true" />
                    Noise suppression
                  </span>
                  <Switch
                    checked={noiseSuppression}
                    onCheckedChange={(v) => {
                      setNoiseSuppression(v);
                      toast(v ? "Noise suppression on" : "Noise suppression off");
                    }}
                    aria-label="Noise suppression"
                  />
                </label>
                <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <RotateCw className="size-4 opacity-70" aria-hidden="true" />
                    Echo cancellation
                  </span>
                  <Switch
                    checked={echoCancellation}
                    onCheckedChange={(v) => {
                      setEchoCancellation(v);
                      toast(v ? "Echo cancellation on" : "Echo cancellation off");
                    }}
                    aria-label="Echo cancellation"
                  />
                </label>
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] text-primary-foreground/55">
              Shortcuts: Space mute · Esc end session · ⌘/Ctrl + K search transcript
            </p>
          </div>
        )}
      </main>

      <SessionSummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        metrics={lastMetrics.current}
        onPractiseAgain={() => {
          setSummaryOpen(false);
          void startSession();
        }}
      />

      <HistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}

function HistorySheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [filter, setFilter] = useState<"7" | "30" | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { sessions: practiceSessions } = usePartnerData();

  const filtered = practiceSessions.filter((s) => {
    if (filter === "7") return s.daysAgo <= 7;
    if (filter === "30") return s.daysAgo <= 30;
    return true;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col text-foreground sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Practice History</SheetTitle>
        </SheetHeader>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="w-full">
            <TabsTrigger value="7" className="flex-1">
              Last 7 days
            </TabsTrigger>
            <TabsTrigger value="30" className="flex-1">
              Last 30 days
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1">
              All time
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1 space-y-3 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No sessions yet. Start your first practice!
            </p>
          )}
          {filtered.map((s) => {
            const isOpen = expanded === s.id;
            return (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{s.date}</p>
                    <p className="text-xs text-muted-foreground">{s.duration}</p>
                  </div>
                  <span className="text-xl" aria-hidden="true">
                    {s.icon}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">{s.scenario}</p>
                <div className="mt-1 flex items-center gap-0.5" aria-label={`${s.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < s.rating ? "fill-gold text-gold" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.topics.map((t) => (
                    <Badge key={t} variant="secondary" className="rounded-full text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 min-h-11 w-full rounded-xl"
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                >
                  {isOpen ? "Collapse" : "Review transcript"}
                  <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </Button>

                {isOpen && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    {s.transcript.map((m, i) => (
                      <div
                        key={i}
                        className={
                          m.who === "you"
                            ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-muted px-3 py-2 text-right"
                            : "max-w-[88%] rounded-2xl rounded-bl-sm bg-gradient-brand px-3 py-2 text-primary-foreground"
                        }
                      >
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-wide ${m.who === "you" ? "text-muted-foreground" : "text-primary-foreground/70"}`}
                        >
                          {m.who === "you" ? "You" : "AI Coach"} · {m.at}
                        </p>
                        <p className="mt-0.5 text-sm">{m.text}</p>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-11 flex-1 rounded-xl"
                        onClick={() => toast.success("Download ready!")}
                      >
                        <Download className="size-4" />
                        Download .txt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-11 flex-1 rounded-xl"
                        onClick={() => toast("Shared with mentor")}
                      >
                        <Share2 className="size-4" />
                        Share with mentor
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
