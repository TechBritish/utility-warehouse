import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bell, Mic, User } from "lucide-react";

import { AppHeader } from "@/components/uw/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/uw/ThemeToggle";
import { RequireAuth } from "@/components/uw/RequireAuth";
import { getSession, getDisplayName } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Partner Coach" },
      { name: "description", content: "Manage your profile, notifications and voice training preferences." },
      { property: "og:title", content: "Settings | Partner Coach" },
      { property: "og:description", content: "Manage your profile, notifications and voice training preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  ),
});

function Section({ icon: Icon, title, children }: { icon: typeof Bell; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-muted-foreground" aria-hidden /> {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function SettingsPage() {
  const session = getSession();
  const [name, setName] = useState(() => getDisplayName(session));
  const [email, setEmail] = useState(() => session?.email ?? "");
  const [prefs, setPrefs] = useState({
    weeklySummary: true,
    streakReminders: true,
    productUpdates: false,
    noiseSuppression: true,
    pushToTalk: false,
  });

  const set = (key: keyof typeof prefs) => (v: boolean) => setPrefs((p) => ({ ...p, [key]: v }));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preferences are saved locally in this demo. Accounts arrive with Lovable Cloud.
        </p>

        <div className="mt-6 space-y-4">
          <Section icon={User} title="Profile">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="min-h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="path">Training path</Label>
              <Select defaultValue="fast-track">
                <SelectTrigger id="path" className="min-h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast-track">Fast-Track (14 days)</SelectItem>
                  <SelectItem value="standard">Standard (30 days)</SelectItem>
                  <SelectItem value="self-paced">Self-Paced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Section>

          <Section icon={Bell} title="Notifications">
            {(
              [
                ["weeklySummary", "Weekly progress summary", "A Monday email with your stats"],
                ["streakReminders", "Practice streak reminders", "Nudges so you never miss a day"],
                ["productUpdates", "Product updates", "New modules and features"],
              ] as const
            ).map(([key, label, hint]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <Switch id={key} checked={prefs[key]} onCheckedChange={set(key)} />
              </div>
            ))}
          </Section>

          <Section icon={Mic} title="Voice trainer">
            {(
              [
                ["noiseSuppression", "Noise suppression", "Reduce background noise during practice"],
                ["pushToTalk", "Push-to-talk", "Hold the mic button to speak"],
              ] as const
            ).map(([key, label, hint]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <Switch id={key} checked={prefs[key]} onCheckedChange={set(key)} />
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium text-foreground">Appearance</p>
                <p className="text-xs text-muted-foreground">Light or dark theme</p>
              </div>
              <ThemeToggle />
            </div>
          </Section>

          <Button
            className="min-h-11 w-full rounded-xl"
            onClick={() => toast.success("Settings saved")}
          >
            Save changes
          </Button>
        </div>
      </main>
    </div>
  );
}
