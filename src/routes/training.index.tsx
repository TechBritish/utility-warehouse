import { createFileRoute, redirect } from "@tanstack/react-router";

// The module list now lives on the dashboard ("My training"), so old links land there.
export const Route = createFileRoute("/training/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
