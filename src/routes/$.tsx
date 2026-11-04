import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SearchX, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page not found — UW Partner Coach" },
      {
        name: "description",
        content: "The page you're looking for doesn't exist or has been moved.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Page not found — UW Partner Coach" },
      {
        property: "og:description",
        content: "The page you're looking for doesn't exist or has been moved.",
      },
    ],
  }),
  component: NotFoundPage,
});

const popularLinks = [
  { label: "Training", to: "/training" },
  { label: "Guidelines", to: "/guidelines" },
];

function NotFoundPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto grid size-28 place-items-center rounded-full bg-brand-soft">
          <SearchX className="size-12 text-primary" aria-hidden="true" />
        </span>
        <h1 className="mt-8 text-4xl font-bold tracking-tight text-balance">Page not found</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <form
          className="mt-8 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            toast("Search is coming soon");
          }}
        >
          <label htmlFor="notfound-search" className="sr-only">
            Search
          </label>
          <Input
            id="notfound-search"
            type="search"
            placeholder="Search for modules, resources, or help"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-11 rounded-xl"
          />
          <Button type="submit" size="icon" className="size-11 shrink-0 rounded-xl" aria-label="Search">
            <Search className="size-4" aria-hidden="true" />
          </Button>
        </form>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="min-h-12 rounded-xl px-6">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-h-12 rounded-xl px-6">
            <Link to="/">Back to home</Link>
          </Button>
        </div>

        <nav aria-label="Popular pages" className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {popularLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="mailto:john.and.sheila@uw.partners"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Support
          </a>
        </nav>
      </div>
    </div>
  );
}
