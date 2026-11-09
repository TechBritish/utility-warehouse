import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UwLogo } from "@/components/uw/SiteHeader";
import { isCurrentUserAdmin, updatePassword } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Partner Coach" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  // The emailed link signs the user in via the URL; wait for that session.
  const [status, setStatus] = useState<"checking" | "ready" | "expired">("checking");

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setStatus("ready");
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) setStatus("ready");
    });
    const timer = window.setTimeout(() => {
      setStatus((current) => (current === "checking" ? "expired" : current));
    }, 4000);
    return () => {
      data.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ResetForm) => {
    const { error } = await updatePassword(data.password);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Password updated");
    navigate({ to: (await isCurrentUserAdmin()) ? "/admin" : "/dashboard" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-night px-4 py-10">
      <div className="w-full max-w-[400px] rounded-2xl bg-card p-6 shadow-lift sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <UwLogo />
          <h1 className="mt-6 text-2xl font-bold text-foreground">Set a new password</h1>
        </div>

        {status === "checking" ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : status === "expired" ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              This reset link has expired or was already used. Request a new one from the sign-in
              page.
            </p>
            <Button asChild className="min-h-12 w-full rounded-xl">
              <Link to="/login">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-11"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={!!errors.confirm}
                {...register("confirm")}
              />
              {errors.confirm ? (
                <p className="text-xs text-destructive">{errors.confirm.message}</p>
              ) : null}
            </div>

            <Button type="submit" disabled={isSubmitting} className="min-h-12 w-full rounded-xl">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save new password"
              )}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
