import { createFileRoute, redirect } from "@tanstack/react-router";

// Pricing is switched off for now: the portal is free. Old links go to sign-up.
export const Route = createFileRoute("/pricing")({
  beforeLoad: () => {
    throw redirect({ to: "/signup" });
  },
});
