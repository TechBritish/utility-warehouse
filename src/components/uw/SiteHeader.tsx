import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/uw/ThemeToggle";
import { Mic } from "lucide-react";

export function UwLogo({
  inverted = false,
  compact = false,
}: {
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
        <Mic className="size-5" aria-hidden="true" />
      </span>
      <span
        className={`${compact ? "hidden sm:inline " : ""}${
          inverted
            ? "text-sm font-bold tracking-tight text-primary-foreground"
            : "text-sm font-bold tracking-tight text-foreground"
        }`}
      >
        Partner Coach
      </span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Partner Coach home">
          <UwLogo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          <a href="#why" className="text-sm text-muted-foreground hover:text-foreground">
            Why voice AI
          </a>
          <a href="#modules" className="text-sm text-muted-foreground hover:text-foreground">
            Modules
          </a>
          <Link to="/guidelines" className="text-sm text-muted-foreground hover:text-foreground">
            Conversation guide
          </Link>
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Admin
          </Link>
          <a href="/#bill-check" className="text-sm text-muted-foreground hover:text-foreground">
            Free bill check
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="min-h-11 rounded-xl px-4">
            <Link to="/signup">Start training</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
