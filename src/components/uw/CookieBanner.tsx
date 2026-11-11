import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { getConsent, setConsent, trackPageView } from "@/lib/analytics";
import { loadMarketingTags, marketingPageView } from "@/lib/marketing-tags";

/**
 * Records a page view on every route change and asks once for analytics
 * consent. Choosing either option hides the banner for good on that browser.
 */
export function CookieBanner() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(getConsent() === null);
    loadMarketingTags();
  }, []);

  useEffect(() => {
    void trackPageView(pathname);
    marketingPageView(pathname);
  }, [pathname]);

  if (!show) return null;

  const choose = (value: "all" | "analytics" | "denied") => {
    setConsent(value);
    setShow(false);
    loadMarketingTags();
    marketingPageView(pathname);
  };

  return (
    <div
      role="region"
      aria-label="Cookie choice"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 p-4 shadow-lift backdrop-blur sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-sm sm:rounded-2xl sm:border"
    >
      <p className="text-sm font-semibold">Can we use cookies?</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Analytics cookies show us how people use this site. Marketing cookies let us show you our
        adverts on Facebook, Instagram and Google. We never sell your data.{" "}
        <Link to="/privacy" className="font-medium text-brand hover:underline">
          Privacy notice
        </Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button className="min-h-11 rounded-xl" onClick={() => choose("all")}>
          Accept all
        </Button>
        <Button variant="outline" className="min-h-11 rounded-xl" onClick={() => choose("denied")}>
          No thanks
        </Button>
        <button
          type="button"
          onClick={() => choose("analytics")}
          className="col-span-2 min-h-9 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Analytics only, no marketing
        </button>
      </div>
    </div>
  );
}
