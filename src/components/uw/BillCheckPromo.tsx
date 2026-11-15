import { useEffect, useRef } from "react";
import { CheckCircle2, Clock, Flame, Gift, Phone, ShieldCheck, Smartphone, Wifi, Zap } from "lucide-react";

import { LeadForm } from "@/components/uw/LeadForm";

const BILLS = [
  { icon: Zap, label: "Energy", delay: "0s" },
  { icon: Wifi, label: "Broadband", delay: "0.4s" },
  { icon: Smartphone, label: "Mobile", delay: "0.8s" },
  { icon: ShieldCheck, label: "Insurance", delay: "1.2s" },
];

const STEPS = [
  { icon: Clock, title: "60 seconds", text: "Pop in your name and number." },
  { icon: Phone, title: "Sheila calls you", text: "A friendly chat about what you pay now." },
  { icon: Gift, title: "Your free quote", text: "See if one simple bill could work out better." },
];

/** Animated, promotional "free bill check" section with the lead form. */
export function BillCheckPromo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>(".uw-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="bill-check"
      className="relative scroll-mt-20 overflow-hidden border-b border-border bg-gradient-to-br from-[#1e1240] via-[#33206b] to-[#120c24] py-16 text-white sm:py-24"
    >
      {/* Moving colour blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -top-24 -left-24 size-80 rounded-full bg-[#7c3aed]/40 blur-3xl" />
        <div className="animate-blob absolute top-1/3 -right-20 size-72 rounded-full bg-[#f0b429]/25 blur-3xl" style={{ animationDelay: "-5s" }} />
        <div className="animate-blob absolute -bottom-24 left-1/3 size-80 rounded-full bg-[#22c55e]/20 blur-3xl" style={{ animationDelay: "-9s" }} />
      </div>

      <div ref={ref} className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="uw-reveal inline-flex items-center gap-2 rounded-full bg-[#f0b429] px-3 py-1 text-xs font-bold tracking-wide text-[#1e1240] uppercase">
            <Flame className="size-4" aria-hidden="true" /> 100% free · no obligation
          </span>
          <h2
            className="uw-reveal mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl"
            style={{ transitionDelay: "0.1s" }}
          >
            Are you paying too much for your bills?
          </h2>
          <p className="uw-reveal mt-4 text-lg leading-relaxed text-white/80" style={{ transitionDelay: "0.2s" }}>
            Get a <strong className="text-[#f0b429]">free bill check from Sheila</strong>. She'll look at what you
            pay today and show you whether putting everything on one simple Utility Warehouse bill could work
            out better for you.
          </p>

          {/* Bills we check */}
          <ul className="mt-7 grid grid-cols-4 gap-2 sm:gap-3">
            {BILLS.map((b, i) => (
              <li key={b.label} className="uw-reveal" style={{ transitionDelay: `${0.25 + i * 0.08}s` }}>
                <div
                  className="animate-float flex flex-col items-center gap-2 rounded-2xl bg-white/10 px-1 py-3 text-center ring-1 ring-white/15 backdrop-blur"
                  style={{ animationDelay: b.delay }}
                >
                  <span className="grid size-10 place-items-center rounded-full bg-white/15">
                    <b.icon className="size-5 text-[#f0b429]" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold sm:text-sm">{b.label}</span>
                </div>
              </li>
            ))}
          </ul>

          {/* How it works */}
          <ol className="mt-8 space-y-4">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="uw-reveal flex items-start gap-3"
                style={{ transitionDelay: `${0.45 + i * 0.12}s` }}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#7c3aed] ring-1 ring-white/20">
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold">
                    {i + 1}. {s.title}
                  </span>
                  <span className="block text-sm text-white/75">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="uw-reveal mt-6 flex items-center gap-2 text-sm text-white/70" style={{ transitionDelay: "0.8s" }}>
            <CheckCircle2 className="size-4 text-[#22c55e]" aria-hidden="true" />
            No pushy sales. Just a friendly chat with a real person.
          </p>
        </div>

        <div className="animate-rise">
          <div className="uw-glow-border rounded-[1.1rem] text-foreground shadow-2xl">
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
