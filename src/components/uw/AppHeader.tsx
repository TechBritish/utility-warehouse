import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UwLogo } from "@/components/uw/SiteHeader";
import { getSession, getDisplayName, getInitials, logout } from "@/lib/auth";
import { useIsAdmin } from "@/lib/use-admin-data";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", always: true },
  { to: "/trainer", label: "Practice", always: true },
  { to: "/sessions", label: "Sessions", always: false },
  { to: "/badges", label: "Badges", always: false },
] as const;

/**
 * Shared header for signed-in pages (dashboard, training, sessions, badges,
 * settings). Provides primary navigation plus an account menu with
 * settings/log-out, so users can move between pages without relying on the
 * marketing `SiteHeader` (which only links to anchors on the landing page).
 */
export function AppHeader() {
  const navigate = useNavigate();
  const session = getSession();
  const displayName = getDisplayName(session);
  const firstName = displayName.split(" ")[0];
  const initials = getInitials(displayName);
  const isAdmin = useIsAdmin();

  async function handleLogout() {
    await logout();
    navigate({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Link to="/dashboard" aria-label="Dashboard home" className="min-w-0">
          <UwLogo compact />
        </Link>
        <nav aria-label="Main" className="flex min-w-0 items-center gap-3 overflow-x-auto sm:gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm text-muted-foreground hover:text-foreground [&.active]:font-semibold [&.active]:text-foreground ${link.always ? "" : "hidden md:inline"}`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm text-muted-foreground hover:text-foreground [&.active]:font-semibold [&.active]:text-foreground"
            >
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="min-h-11 gap-2 px-2">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline">{firstName}</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/sessions" })}>
                Past practice sessions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/badges" })}>
                Badges
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  window.localStorage.setItem("uw-onboarding-tour", "pending");
                  await navigate({ to: "/dashboard" });
                  window.dispatchEvent(new Event("uw:start-tour"));
                }}
              >
                Replay the tour
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
