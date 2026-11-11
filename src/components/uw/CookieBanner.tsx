import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { getConsent, setConsent, trackPageView } from "@/lib/analytics";

/**
 * Records a page view on every route change and asks once for analytics
 * consent. Choosing either option hides the banner for good on that browser.
 */
export function CookieBanner() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(getConsent() === null);
  }, []);

  useEffect(() => {
    void trackPageView(pathname);
  }, [pathname]);

  if (!show) return null;

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    setShow(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie choice"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 p-4 shadow-lift backdrop-blur sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-sm sm:rounded-2xl sm:border"
    >
      <p className="text-sm font-semibold">Can we use analytics cookies?</p>
      <p className="mt-1 text-sm text-muted-foreground">
        They help us see how people find and use this site, so we can make it better. No adverts, and
        we never sell your data.{" "}
        <Link to="/privacy" className="font-medium text-brand hover:underline">
          Privacy notice
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <Button className="min-h-11 flex-1 rounded-xl" onClick={() => choose("granted")}>
          Accept
        </Button>
        <Button variant="outline" className="min-h-11 flex-1 rounded-xl" onClick={() => choose("denied")}>
          No thanks
        </Button>
      </div>
    </div>
  );
}
