// Real auth backed by Supabase (see src/lib/supabase.ts).
//
// Supabase's own session check is async, but most of the app (dashboard
// greeting, header avatar, route guards) wants a *synchronous* read. To
// bridge that, we keep a small localStorage mirror of the current Supabase
// session that's kept in sync via `initAuthListener()` (called once from the
// root layout) and updated immediately on login/signup/logout.

import { supabase } from "@/lib/supabase";

const AUTH_KEY = "uw-auth-session";

export type AuthSession = {
  email: string;
  name?: string;
  signedInAt: string;
};

function writeCache(session: AuthSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (session) window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(AUTH_KEY) !== null;
  } catch {
    return false;
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

/**
 * Subscribes to real Supabase auth state and keeps the localStorage mirror
 * in sync (covers token refresh, cross-tab sign-out, magic-link return,
 * etc). Call once near the app root. Returns an unsubscribe function.
 */
export function initAuthListener(): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      writeCache({
        email: session.user.email ?? "",
        name: (session.user.user_metadata?.full_name as string | undefined) ?? undefined,
        signedInAt: new Date().toISOString(),
      });
    } else {
      writeCache(null);
    }
  });
  return () => data.subscription.unsubscribe();
}

/** True client-side check against Supabase (use for route guards). */
export async function hasActiveSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<{ error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) return { error: error.message };
  if (data.session?.user) {
    writeCache({ email, name, signedInAt: new Date().toISOString() });
  }
  return { error: null };
}

export async function login(email: string, password: string): Promise<{ error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  writeCache({
    email,
    name: (data.user?.user_metadata?.full_name as string | undefined) ?? undefined,
    signedInAt: new Date().toISOString(),
  });
  return { error: null };
}

/** Emails a password-reset link that lands on /reset-password. */
export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error: error?.message ?? null };
}

/** Emails a one-click sign-in link for an existing account. */
export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/dashboard` },
  });
  return { error: error?.message ?? null };
}

/** Sets a new password for the signed-in (or recovering) user. */
export async function updatePassword(password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error?.message ?? null };
}

/** True if the signed-in user has is_admin on their profile. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).maybeSingle();
  return !!me?.is_admin;
}

/** Best-effort display name: explicit name, or derived from the email's local part. */
export function getDisplayName(session: AuthSession | null): string {
  if (!session) return "Partner";
  if (session.name?.trim()) return session.name.trim();
  const local = session.email.split("@")[0] ?? "";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Partner";
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/** Up to 2-letter initials for an avatar, derived from a display name. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function logout(): Promise<void> {
  writeCache(null);
  try {
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
}
