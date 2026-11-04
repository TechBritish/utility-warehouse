import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Eye, EyeOff, Lightbulb, Loader2, X, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UwLogo } from "@/components/uw/SiteHeader";
import { fireConfetti } from "@/lib/confetti";
import { signUp } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Your Account — Partner Coach" },
      {
        name: "description",
        content: "Sign up for Partner Coach and start your personalized voice AI sales training path.",
      },
      { property: "og:title", content: "Create Your Account — Partner Coach" },
      {
        property: "og:description",
        content: "Create your Partner Coach account in three quick steps.",
      },
    ],
  }),
  component: SignupPage,
});

const step1Schema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email"),
    confirmEmail: z.string().min(1, "Please confirm your email"),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Emails do not match",
    path: ["confirmEmail"],
  });

const step2Schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const step3Schema = z.object({
  experience: z.enum(["new", "experienced"], {
    errorMap: () => ({ message: "Please choose an option" }),
  }),
  agree: z.literal(true, {
    errorMap: () => ({ message: "Please tick the box to continue" }),
  }),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;
type Step3Form = z.infer<typeof step3Schema>;

function getPasswordStrength(password: string) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(requirements).filter(Boolean).length;
  let label: "weak" | "medium" | "strong" = "weak";
  if (score >= 4) label = "strong";
  else if (score >= 2) label = "medium";
  return { requirements, score, label };
}

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Form | null>(null);

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-night px-4 py-10">
      <div className="w-full max-w-[440px] rounded-2xl bg-card p-6 shadow-lift sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <UwLogo />
        </div>

        <div className="mb-6 space-y-2">
          <Progress value={progress} />
          <p className="text-center text-xs text-muted-foreground">Step {step} of 3</p>
        </div>

        {step === 1 ? (
          <div key="step-1" className="animate-rise">
            <Step1
              defaultValues={step1Data ?? undefined}
              onNext={(data) => {
                setStep1Data(data);
                setStep(2);
              }}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div key="step-2" className="animate-rise">
            <Step2
              defaultValues={step2Data ?? undefined}
              onBack={() => setStep(1)}
              onNext={(data) => {
                setStep2Data(data);
                setStep(3);
              }}
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div key="step-3" className="animate-rise">
            <Step3
              isSubmitting={isSubmitting}
              onBack={() => setStep(2)}
              onSubmit={async () => {
                setIsSubmitting(true);
                const { error } = await signUp(
                  step1Data?.email ?? "",
                  step2Data?.password ?? "",
                  step1Data?.fullName ?? "",
                );
                setIsSubmitting(false);
                if (error) {
                  toast.error(error);
                  return;
                }
                localStorage.setItem("uw-onboarding-tour", "pending");
                fireConfetti();
                toast.success("Welcome aboard!");
                navigate({ to: "/dashboard" });
              }}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Step1({
  defaultValues,
  onNext,
}: {
  defaultValues?: Step1Form | undefined;
  onNext: (data: Step1Form) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    mode: "onBlur",
    ...(defaultValues ? { defaultValues } : {}),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Let&apos;s get started with the basics</p>

      <form onSubmit={handleSubmit(onNext)} noValidate className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} {...register("fullName")} />
          {errors.fullName ? <p className="text-xs text-destructive">{errors.fullName.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmEmail">Confirm email</Label>
          <Input
            id="confirmEmail"
            type="email"
            aria-invalid={!!errors.confirmEmail}
            {...register("confirmEmail")}
          />
          {errors.confirmEmail ? (
            <p className="text-xs text-destructive">{errors.confirmEmail.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="min-h-12 w-full rounded-xl">
          Continue
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Step2({
  defaultValues,
  onBack,
  onNext,
}: {
  defaultValues?: Step2Form | undefined;
  onBack: () => void;
  onNext: (data: Step2Form) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    mode: "onBlur",
    ...(defaultValues ? { defaultValues } : {}),
  });

  const password = watch("password") ?? "";
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const strengthColor =
    strength.label === "strong" ? "bg-success" : strength.label === "medium" ? "bg-warning" : "bg-destructive";

  const requirementItems = [
    { key: "length", label: "8+ characters" },
    { key: "uppercase", label: "One uppercase letter" },
    { key: "number", label: "One number" },
    { key: "special", label: "One special character" },
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Secure your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose a strong password</p>

      <form onSubmit={handleSubmit(onNext)} noValidate className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}

          {password ? (
            <div className="space-y-2 pt-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${strengthColor}`}
                  style={{ width: `${(strength.score / 4) * 100}%` }}
                />
              </div>
              <ul className="grid grid-cols-2 gap-1.5">
                {requirementItems.map((item) => {
                  const met = strength.requirements[item.key];
                  return (
                    <li
                      key={item.key}
                      className={`flex items-center gap-1.5 text-xs ${met ? "text-success" : "text-muted-foreground"}`}
                    >
                      {met ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                      {item.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              aria-invalid={!!errors.confirmPassword}
              className="pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onBack} className="min-h-12 flex-1 rounded-xl">
            Back
          </Button>
          <Button type="submit" className="min-h-12 flex-1 rounded-xl">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}

function Step3({
  isSubmitting,
  onBack,
  onSubmit,
}: {
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitted },
    trigger,
  } = useForm<Step3Form>({
    resolver: zodResolver(step3Schema),
    mode: "onBlur",
  });

  const experience = watch("experience");
  const agree = watch("agree");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Tell us about yourself</h1>
      <p className="mt-1 text-sm text-muted-foreground">This helps us customize your training path</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        <RadioGroup
          value={experience}
          onValueChange={(value) => {
            setValue("experience", value as Step3Form["experience"], { shouldValidate: isSubmitted });
          }}
          className="grid gap-3"
        >
          <label
            htmlFor="exp-new"
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
              experience === "new" ? "border-brand bg-brand-soft ring-2 ring-brand" : "border-border"
            }`}
          >
            <RadioGroupItem value="new" id="exp-new" className="mt-1" />
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-brand" />
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">I&apos;m new to sales</span>
                <Badge variant="secondary">4-week program</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Start with fundamentals and build confidence step-by-step
              </p>
            </div>
          </label>

          <label
            htmlFor="exp-experienced"
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
              experience === "experienced" ? "border-brand bg-brand-soft ring-2 ring-brand" : "border-border"
            }`}
          >
            <RadioGroupItem value="experienced" id="exp-experienced" className="mt-1" />
            <Zap className="mt-0.5 size-5 shrink-0 text-brand" />
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">I have sales experience</span>
                <Badge variant="secondary">2-week program</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Skip basics and focus on UW-specific techniques
              </p>
            </div>
          </label>
        </RadioGroup>
        {errors.experience ? <p className="text-xs text-destructive">{errors.experience.message}</p> : null}

        <div className="flex items-start gap-2 pt-1">
          <Checkbox
            id="agree"
            checked={agree === true}
            onCheckedChange={(checked) => {
              setValue("agree", checked === true ? true : (undefined as unknown as true), {
                shouldValidate: isSubmitted,
              });
            }}
          />
          <Label htmlFor="agree" className="text-sm font-normal leading-snug text-muted-foreground">
            I agree that Sheila Gwillam-Winter can store my name, email and training activity
            to run this portal and support my training, as set out in the{" "}
            <a href="/privacy" target="_blank" rel="noopener" className="text-primary hover:underline">
              privacy notice
            </a>
            . I can ask for my details to be deleted at any time.
          </Label>
        </div>
        {errors.agree ? <p className="text-xs text-destructive">{errors.agree.message}</p> : null}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isSubmitting}
            className="min-h-12 flex-1 rounded-xl"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => trigger()}
            className="min-h-12 flex-1 rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
