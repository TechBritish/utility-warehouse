import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function VideoDemoDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="max-w-[800px] gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-lift">
        <DialogTitle className="sr-only">How UW Partner Coach works</DialogTitle>
        <DialogClose
          aria-label="Close video"
          className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-primary-foreground/15 text-primary-foreground backdrop-blur transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </DialogClose>

        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {open && (
            <video
              src="/uw-walkthrough.mp4"
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="h-full w-full"
            >
              Your browser can't play this video.
            </video>
          )}
        </div>

        <div className="bg-card px-6 py-8 text-center sm:px-10">
          <h3 className="text-2xl font-bold tracking-tight">See how easy it is</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sammy walks you through the portal, step by step
          </p>
          <Button asChild size="lg" className="mt-6 min-h-12 rounded-xl px-6">
            <Link to="/signup" onClick={() => setOpen(false)}>
              Start your training
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
