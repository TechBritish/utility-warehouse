import { useEffect, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";

const STORAGE_KEY = "uw-onboarding-tour";

type Step = {
  title: string;
  description: string;
  ref?: RefObject<HTMLElement | null>;
};

export function useOnboardingTour() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value !== "done") {
      window.localStorage.setItem(STORAGE_KEY, "pending");
      setEnabled(true);
    }
    // Ava and the profile menu can replay the tour.
    const replay = () => {
      window.localStorage.setItem(STORAGE_KEY, "pending");
      setEnabled(true);
    };
    window.addEventListener("uw:start-tour", replay);
    return () => window.removeEventListener("uw:start-tour", replay);
  }, []);

  return {
    enabled,
    dismiss: () => setEnabled(false),
    restart: () => {
      window.localStorage.setItem(STORAGE_KEY, "pending");
      setEnabled(true);
    },
  };
}

export function OnboardingTour({ steps, onFinish }: { steps: Step[]; onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = steps[index];

  useEffect(() => {
    function update() {
      const el = step?.ref?.current;
      setRect(el ? el.getBoundingClientRect() : null);
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finish(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish(completed: boolean) {
    if (dontShow || completed) {
      window.localStorage.setItem(STORAGE_KEY, "done");
    }
    if (completed) {
      fireConfetti();
      toast.success("You're all set! 🎉");
    }
    onFinish();
  }

  const isLast = index === steps.length - 1;

  const cardStyle = rect
    ? {
        top: Math.min(rect.bottom + 12, window.innerHeight - 220),
        left: Math.max(16, Math.min(rect.left, window.innerWidth - 336)),
      }
    : { top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 160 };

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Onboarding tour">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-[1px]" />
      {rect && (
        <div
          className="pointer-events-none absolute rounded-2xl ring-4 ring-brand transition-all duration-200"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}
      <div
        className="absolute w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-5 shadow-lift"
        style={cardStyle}
      >
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
          Step {index + 1} of {steps.length}
        </p>
        <h3 className="mt-1 text-base font-bold">{step?.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{step?.description}</p>


        <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Checkbox checked={dontShow} onCheckedChange={(v) => setDontShow(Boolean(v))} />
          Don't show this again
        </label>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" className="min-h-9" onClick={() => finish(false)}>
            Skip tour
          </Button>
          <div className="flex gap-2">
            {index > 0 && (
              <Button variant="outline" size="sm" className="min-h-9" onClick={() => setIndex((i) => i - 1)}>
                Back
              </Button>
            )}
            <Button
              size="sm"
              className="min-h-9"
              onClick={() => (isLast ? finish(true) : setIndex((i) => i + 1))}
            >
              {isLast ? "Got it!" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
