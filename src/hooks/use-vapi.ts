import { useCallback, useEffect, useRef, useState } from "react";

import { VAPI_PUBLIC_KEY, VAPI_TRAINER_ASSISTANT_ID } from "@/lib/vapi-config";

// @vapi-ai/web relies on browser-only APIs (WebRTC/daily-js), so it must
// never be imported at module scope (that would pull it into the SSR
// bundle, where it resolves to a broken stub and "Vapi is not a
// constructor" errors occur). Instead it's dynamically imported inside the
// effect below, which only ever runs client-side.
type VapiInstance = InstanceType<typeof import("@vapi-ai/web").default>;

export type VapiTranscriptMessage = {
  who: "ai" | "you";
  text: string;
};

export type VapiCallStatus = "idle" | "connecting" | "active" | "ended" | "error";

export type VapiPartialTranscript = {
  who: "ai" | "you";
  text: string;
} | null;

type VapiMessageEvent = {
  type: string;
  role?: "user" | "assistant" | "system";
  transcriptType?: "partial" | "final";
  transcript?: string;
};

/** Per-call assistant overrides (see Vapi's AssistantOverrides). */
export type VapiStartOptions = Parameters<VapiInstance["start"]>[1];

/** Vapi's "error" event payload is usually a plain object, not an Error. */
function describeVapiError(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { errorMsg?: string; error?: { message?: unknown; msg?: string }; message?: unknown };
  const msg = e?.errorMsg ?? e?.error?.msg ?? e?.error?.message ?? e?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string" && msg) return msg;
  return "Vapi call error";
}

/**
 * Thin wrapper around the Vapi Web SDK that exposes call lifecycle state
 * and final transcript turns in a shape the trainer UI already expects.
 *
 * Key and assistant ID come from `@/lib/vapi-config`.
 */
export function useVapi() {
  const vapiRef = useRef<VapiInstance | null>(null);
  const [status, setStatus] = useState<VapiCallStatus>("idle");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState<VapiTranscriptMessage[]>([]);
  const [partial, setPartial] = useState<VapiPartialTranscript>(null);
  const [error, setError] = useState<string | null>(null);

  const readyRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const publicKey = VAPI_PUBLIC_KEY;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    readyRef.current = import("@vapi-ai/web").then((mod) => {
      if (cancelled) return;

      // Depending on how the bundler interops the CJS `exports.default =
      // Vapi`, the constructor can end up at `mod`, `mod.default`, or
      // (double-wrapped) `mod.default.default`. Unwrap `.default` until we
      // land on an actual function/class.
      let VapiCtor: unknown = mod;
      while (
        VapiCtor &&
        typeof VapiCtor !== "function" &&
        (VapiCtor as { default?: unknown }).default
      ) {
        VapiCtor = (VapiCtor as { default?: unknown }).default;
      }

      if (typeof VapiCtor !== "function") {
        setStatus("error");
        setError("Failed to load Vapi SDK");
        return;
      }

      const vapi = new (VapiCtor as new (publicKey: string) => VapiInstance)(
        publicKey,
      );
      vapiRef.current = vapi;

      const onCallStart = () => {
        setStatus("active");
        setError(null);
      };
      const onCallEnd = () => setStatus("ended");
      const onSpeechStart = () => setAiSpeaking(true);
      const onSpeechEnd = () => setAiSpeaking(false);
      const onVolumeLevel = (level: number) => setVolumeLevel(level);
      const onMessage = (message: VapiMessageEvent) => {
        if (message.type !== "transcript" || !message.transcript) return;
        const who = message.role === "user" ? "you" : "ai";
        if (message.transcriptType === "final") {
          setPartial(null);
          setTranscript((prev) => [...prev, { who, text: message.transcript! }]);
        } else if (message.transcriptType === "partial") {
          setPartial({ who, text: message.transcript });
        }
      };
      const onError = (err: unknown) => {
        console.error("Vapi error", err);
        setStatus("error");
        setError(describeVapiError(err));
      };

      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);
      vapi.on("volume-level", onVolumeLevel);
      vapi.on("message", onMessage);
      vapi.on("error", onError);

      cleanup = () => {
        vapi.off("call-start", onCallStart);
        vapi.off("call-end", onCallEnd);
        vapi.off("speech-start", onSpeechStart);
        vapi.off("speech-end", onSpeechEnd);
        vapi.off("volume-level", onVolumeLevel);
        vapi.off("message", onMessage);
        vapi.off("error", onError);
        vapi.stop();
        vapiRef.current = null;
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const start = useCallback(async (options?: VapiStartOptions) => {
    const assistantId = VAPI_TRAINER_ASSISTANT_ID;
    setStatus("connecting");
    setError(null);
    setTranscript([]);
    setPartial(null);
    try {
      await readyRef.current;
      if (!vapiRef.current) {
        throw new Error("Vapi failed to initialize");
      }
      const call = await vapiRef.current.start(assistantId, options);
      // The SDK resolves null (and emits "error") when the call can't be created.
      if (!call) setStatus((s) => (s === "connecting" ? "error" : s));
    } catch (err) {
      setStatus("error");
      setError(describeVapiError(err));
    }
  }, []);

  const stop = useCallback(() => {
    vapiRef.current?.stop();
    setStatus("ended");
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    vapiRef.current?.setMuted(muted);
  }, []);

  const isConfigured = Boolean(VAPI_PUBLIC_KEY && VAPI_TRAINER_ASSISTANT_ID);

  return {
    status,
    aiSpeaking,
    volumeLevel,
    transcript,
    partial,
    error,
    start,
    stop,
    setMuted,
    isConfigured,
  };
}
