// Loads and persists real per-user data from Supabase, replacing the static
// mock data in `uw-data.ts` for anything that should differ per partner:
// module progress, practice sessions, and earned badges.

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fireConfetti } from "@/lib/confetti";
import { trainingModules, badges as badgeCatalog, scenarios, MODULE_STEPS, type ModuleStep, type TrainingModule } from "@/lib/uw-data";
import type { TranscriptMessage } from "@/components/uw/TranscriptPanel";

export type SessionDisplay = {
  id: string;
  date: string;
  daysAgo: number;
  duration: string;
  scenario: string;
  icon: string;
  rating: number;
  topics: string[];
  transcript: Pick<TranscriptMessage, "who" | "text" | "at">[];
};

export type BadgeDisplay = (typeof badgeCatalog)[number] & { earned: string | null };

type ModuleStatusMap = Record<
  string,
  { status: "completed" | "unlocked" | "locked"; completedAt: string | null; steps: string[] }
>;

function formatDuration(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60);
  return `${m} minute${m === 1 ? "" : "s"}`;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

export function usePartnerData() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);
  const [moduleStatus, setModuleStatus] = useState<ModuleStatusMap>({});
  const [sessionRows, setSessionRows] = useState<SessionDisplay[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? null;
    setUserId(uid);
    if (!uid) {
      setLoading(false);
      return;
    }

    const [{ data: profile }, { data: progressRows }, { data: sessions }, { data: userBadges }] = await Promise.all([
      supabase.from("profiles").select("created_at").eq("id", uid).maybeSingle(),
      supabase.from("module_progress").select("module_id, status, completed_at, steps").eq("user_id", uid),
      supabase
        .from("practice_sessions")
        .select("id, module_id, started_at, duration_seconds, transcript, rating")
        .eq("user_id", uid)
        .order("started_at", { ascending: false }),
      supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", uid),
    ]);

    setJoinedAt(profile?.created_at ? new Date(profile.created_at) : null);

    const map: ModuleStatusMap = {};
    for (const row of progressRows ?? []) {
      map[row.module_id] = {
        status: row.status as "completed" | "unlocked" | "locked",
        completedAt: row.completed_at,
        steps: row.steps ?? [],
      };
    }
    // First module defaults to unlocked for every partner, even before any row exists.
    if (!map["1"]) map["1"] = { status: "unlocked", completedAt: null, steps: [] };
    setModuleStatus(map);

    const now = new Date();
    setSessionRows(
      (sessions ?? []).map((s) => {
        const started = new Date(s.started_at);
        const scenario = scenarios.find((sc) => sc.value === s.module_id);
        const transcript = Array.isArray(s.transcript) ? (s.transcript as SessionDisplay["transcript"]) : [];
        return {
          id: s.id,
          date: started.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
          daysAgo: daysBetween(started, now),
          duration: formatDuration(s.duration_seconds ?? 0),
          scenario: scenario?.label ?? "Practice session",
          icon: scenario?.icon ?? "🎙️",
          rating: s.rating ?? 0,
          topics: scenario ? [scenario.label] : [],
          transcript,
        };
      }),
    );

    const badgeMap: Record<string, string> = {};
    for (const b of userBadges ?? []) badgeMap[b.badge_id] = b.earned_at;
    setEarnedBadgeIds(badgeMap);

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const modules: TrainingModule[] = trainingModules.map((m) => {
    const entry = moduleStatus[m.id];
    if (!entry) return { ...m, status: "locked" as const, completedOn: undefined };
    return {
      ...m,
      status: entry.status,
      completedOn: entry.completedAt
        ? `Completed ${new Date(entry.completedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}`
        : undefined,
    };
  });

  const modulesCompleted = modules.filter((m) => m.status === "completed").length;
  const nextModule = modules.find((m) => m.status === "unlocked") ?? modules.find((m) => m.status === "locked");
  const practiceSeconds = sessionRows.reduce((total, s) => total + Number.parseInt(s.duration, 10) * 60 || 0, 0);
  const practiceMinutes = sessionRows.length
    ? Math.round(sessionRows.reduce((t, s) => t + (Number.parseFloat(s.duration) || 0), 0))
    : 0;

  // Each module counts four points: video, read, practice, then finishing it.
  const pointsPerModule = MODULE_STEPS.length + 1;
  const moduleSteps = (id: string): string[] =>
    moduleStatus[id]?.status === "completed" ? [...MODULE_STEPS] : (moduleStatus[id]?.steps ?? []);
  const modulePercent = (id: string): number => {
    if (moduleStatus[id]?.status === "completed") return 100;
    const done = MODULE_STEPS.filter((st) => moduleStatus[id]?.steps.includes(st)).length;
    return Math.round((done / pointsPerModule) * 100);
  };
  const overallPercent = Math.round(
    trainingModules.reduce((t, m) => t + modulePercent(m.id), 0) / trainingModules.length,
  );
  const anyStep = (step: ModuleStep) => Object.values(moduleStatus).some((e) => e.steps.includes(step) || e.status === "completed");

  const stats = {
    overallPercent,
    modulesCompleted,
    totalModules: modules.length,
    aiSessionsCount: sessionRows.length,
    practiceMinutes,
    nextModule,
  };

  // Recent activity, derived from module completions + sessions (newest first).
  const recentActivity = [
    ...modules
      .filter((m) => m.status === "completed" && m.completedOn)
      .map((m) => ({ id: `mod-${m.id}`, when: m.completedOn!, text: `Finished ${m.shortTitle} ✓` })),
    ...sessionRows.map((s) => ({ id: `ses-${s.id}`, when: s.date, text: `Completed ${s.duration} AI practice (${s.scenario})` })),
  ].slice(0, 5);

  const sessionDates = new Set(sessionRows.map((s) => s.date.split(",")[0]));
  const streakDays = sessionDates.size; // simple proxy: distinct days practised

  const badges: BadgeDisplay[] = badgeCatalog.map((b) => {
    if (earnedBadgeIds[b.id]) return { ...b, earned: new Date(earnedBadgeIds[b.id]).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) };
    let autoEarned = false;
    if (b.id === "first-step" && anyStep("video")) {
      autoEarned = true;
    } else if (b.id === "first-practice" && (anyStep("practice") || sessionRows.length > 0)) {
      autoEarned = true;
    } else if (b.id === "halfway" && modulesCompleted >= 2) {
      autoEarned = true;
    } else if (b.id === "fully-trained" && modulesCompleted >= trainingModules.length) {
      autoEarned = true;
    } else if (b.id === "early-bird" && joinedAt && modules[0]?.status === "completed") {
      autoEarned = true;
    } else if (b.id === "speed" && modulesCompleted >= 2) {
      autoEarned = true;
    } else if (b.id === "convo" && sessionRows.length >= 10) {
      autoEarned = true;
    } else if (b.id === "dedicated" && streakDays >= 5) {
      autoEarned = true;
    } else if (b.id === "on-fire" && streakDays >= 7) {
      autoEarned = true;
    }
    return { ...b, earned: autoEarned ? "Just now" : null };
  });

  // Celebrate badges earned since the last load in this view (not on first load).
  const earnedKey = badges.filter((b) => b.earned).map((b) => b.id).join(",");
  const seenBadges = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (loading) return;
    const now = new Set(earnedKey ? earnedKey.split(",") : []);
    if (seenBadges.current) {
      for (const id of now) {
        if (!seenBadges.current.has(id)) {
          const b = badgeCatalog.find((x) => x.id === id);
          if (b) {
            fireConfetti();
            toast.success(`${b.emoji} Badge unlocked: ${b.title}`, { description: b.how });
          }
        }
      }
    }
    seenBadges.current = now;
  }, [loading, earnedKey]);

  /** Records a step inside a module (watched, read, practised). */
  const markStep = useCallback(
    async (moduleId: string, step: ModuleStep) => {
      if (!userId) return;
      const entry = moduleStatus[moduleId];
      if (!entry || entry.status === "completed" || entry.steps.includes(step)) return;
      const steps = [...entry.steps, step];
      setModuleStatus((prev) => ({ ...prev, [moduleId]: { ...entry, steps } }));
      await supabase
        .from("module_progress")
        .upsert(
          { user_id: userId, module_id: moduleId, status: entry.status, steps, updated_at: new Date().toISOString() },
          { onConflict: "user_id,module_id" },
        );
    },
    [userId, moduleStatus],
  );

  const completeModule = useCallback(
    async (moduleId: string) => {
      if (!userId) return;
      const now = new Date().toISOString();
      await supabase
        .from("module_progress")
        .upsert({ user_id: userId, module_id: moduleId, status: "completed", completed_at: now }, { onConflict: "user_id,module_id" });
      const nextId = String(Number.parseInt(moduleId, 10) + 1);
      if (trainingModules.some((m) => m.id === nextId)) {
        await supabase
          .from("module_progress")
          .upsert({ user_id: userId, module_id: nextId, status: "unlocked" }, { onConflict: "user_id,module_id" });
      }
      await load();
    },
    [userId, load],
  );

  const saveSession = useCallback(
    async (input: { scenario: string; durationSeconds: number; transcript: TranscriptMessage[]; rating?: number }) => {
      if (!userId) return;
      await supabase.from("practice_sessions").insert({
        user_id: userId,
        module_id: input.scenario,
        duration_seconds: input.durationSeconds,
        transcript: input.transcript.map(({ who, text, at }) => ({ who, text, at })),
        rating: input.rating ?? null,
      });
      await load();
    },
    [userId, load],
  );

  return {
    loading,
    modules,
    stats,
    recentActivity,
    badges,
    sessions: sessionRows,
    moduleSteps,
    modulePercent,
    markStep,
    completeModule,
    saveSession,
    refresh: load,
  };
}
