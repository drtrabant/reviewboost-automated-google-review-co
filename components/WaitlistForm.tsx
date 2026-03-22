"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type FormState = "idle" | "loading" | "success" | "error";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function sanitize(input: string): string {
  return input.replace(/[<>]/g, "").trim();
}

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const colors = [
      "#F59E0B", // amber-500
      "#10B981", // emerald-500
      "#3B82F6", // blue-500
      "#EF4444", // red-500
      "#8B5CF6", // violet-500
      "#EC4899", // pink-500
      "#F97316", // orange-500
    ];

    interface Particle {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      decay: number;
    }

    const particles: Particle[] = [];
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 80,
        y: height / 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -14 - 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
        decay: 0.012 + Math.random() * 0.008,
      });
    }

    let animationId: number;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      let alive = false;

      for (const p of particles) {
        if (p.opacity <= 0) continue;
        alive = true;

        p.x += p.vx;
        p.vy += 0.35;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;
        p.vx *= 0.99;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (alive) {
        animationId = requestAnimationFrame(animate);
      }
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

function CheckmarkIcon() {
  return (
    <svg
      className="h-6 w-6 text-emerald-500 animate-[scaleIn_0.3s_ease-out]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
        className="animate-[draw_0.4s_ease-out_forwards]"
        style={{
          strokeDasharray: 24,
          strokeDashoffset: 24,
          animation: "draw 0.4s ease-out 0.1s forwards",
        }}
      />
      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>
    </svg>
  );
}

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const emailError =
    emailTouched && email.length > 0 && !isValidEmail(email)
      ? "Please enter a valid email address"
      : "";

  const canSubmit = isValidEmail(email) && formState !== "loading";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSubmit) return;

      setFormState("loading");
      setErrorMessage("");

      try {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: sanitize(email),
            businessName: sanitize(businessName),
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error || `Something went wrong (${response.status})`
          );
        }

        setFormState("success");
        setShowConfetti(true);

        // Hide confetti after animation completes
        setTimeout(() => setShowConfetti(false), 2500);
      } catch (err) {
        setFormState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
      }
    },
    [email, businessName, canSubmit]
  );

  if (formState === "success") {
    return (
      <div className="relative w-full max-w-md mx-auto">
        {showConfetti && <ConfettiCanvas />}
        <div className="relative rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center backdrop-blur-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckmarkIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            You&apos;re on the list!
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            We&apos;ll reach out when your spot is ready. Check{" "}
            <span className="font-medium text-gray-800">{email}</span> for a
            confirmation.
          </p>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            No spam, ever. Unsubscribe anytime.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-md mx-auto space-y-3"
    >
      {/* Email field */}
      <div>
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@yourbusiness.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          disabled={formState === "loading"}
          aria-invalid={emailError ? "true" : undefined}
          aria-describedby={emailError ? "email-error" : undefined}
          className={`
            w-full rounded-xl border bg-white px-4 py-3.5 text-base text-gray-900
            placeholder:text-gray-400
            outline-none transition-all duration-150
            focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500
            disabled:opacity-60 disabled:cursor-not-allowed
            ${
              emailError
                ? "border-red-300 focus:ring-red-500/30 focus:border-red-500"
                : "border-gray-200 hover:border-gray-300"
            }
          `}
        />
        {emailError && (
          <p
            id="email-error"
            role="alert"
            className="mt-1.5 text-xs text-red-600 pl-1"
          >
            {emailError}
          </p>
        )}
      </div>

      {/* Business name field (optional) */}
      <div>
        <label htmlFor="waitlist-business" className="sr-only">
          Business name (optional)
        </label>
        <input
          id="waitlist-business"
          type="text"
          autoComplete="organization"
          placeholder="Business name (optional)"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          disabled={formState === "loading"}
          maxLength={120}
          className="
            w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base
            text-gray-900 placeholder:text-gray-400
            outline-none transition-all duration-150
            hover:border-gray-300
            focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!canSubmit}