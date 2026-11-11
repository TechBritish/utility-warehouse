// Ad platform tags (Meta Pixel, Google tag). Loaded only after the visitor
// chooses "Accept all" in the cookie banner, and only when an ID is set below.
// Fill these in from Meta Events Manager and Google Ads / Analytics.

import { getConsent } from "@/lib/analytics";

/** Meta (Facebook/Instagram) Pixel ID, e.g. "1234567890123456". */
export const META_PIXEL_ID = "";
/** Google tag ID, e.g. "G-XXXXXXX" (Analytics) or "AW-XXXXXXX" (Ads). */
export const GOOGLE_TAG_ID = "";

type Win = Window & { fbq?: (...args: unknown[]) => void; dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

let loaded = false;

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Loads the ad tags once, if the visitor accepted marketing cookies. */
export function loadMarketingTags(): void {
  if (loaded || typeof window === "undefined" || getConsent() !== "all") return;
  if (/^(localhost|127\.|\[::1\])/.test(window.location.hostname)) return;
  loaded = true;
  const w = window as Win;

  if (META_PIXEL_ID) {
    const queue: unknown[][] = [];
    const fbq = (...args: unknown[]) => {
      const real = (w as Win & { _fbq?: { callMethod?: (...a: unknown[]) => void } })._fbq;
      if (real?.callMethod) real.callMethod.apply(real, args);
      else queue.push(args);
    };
    Object.assign(fbq, { queue, push: fbq, loaded: true, version: "2.0" });
    w.fbq = fbq;
    (w as Win & { _fbq?: unknown })._fbq = fbq;
    addScript("https://connect.facebook.net/en_US/fbevents.js");
    w.fbq("init", META_PIXEL_ID);
  }

  if (GOOGLE_TAG_ID) {
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag("js", new Date());
    w.gtag("config", GOOGLE_TAG_ID, { send_page_view: false });
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_TAG_ID)}`);
  }
}

/** Tells the ad platforms about a page view (single-page app navigation). */
export function marketingPageView(path: string): void {
  if (!loaded) return;
  const w = window as Win;
  if (META_PIXEL_ID) w.fbq?.("track", "PageView");
  if (GOOGLE_TAG_ID) w.gtag?.("event", "page_view", { page_path: path });
}

/** Tells the ad platforms someone became a lead (bill check form sent). */
export function marketingLead(): void {
  if (!loaded) return;
  const w = window as Win;
  if (META_PIXEL_ID) w.fbq?.("track", "Lead");
  if (GOOGLE_TAG_ID) w.gtag?.("event", "generate_lead");
}
