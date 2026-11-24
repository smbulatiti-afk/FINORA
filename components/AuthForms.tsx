"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useApp } from "@/contexts/AppContext";
import { authService } from "@/services/auth";
import type { Role } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";

function AuthBrand() {
  return <div className="brand"><div className="brand-mark"><Wallet size={19} /></div><div><div className="brand-name">FINORA</div><div className="brand-sub">Financial Organization and Record Assistant</div></div></div>;
}

export function AuthLayout({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) {
  return <main className="auth-page"><aside className="auth-aside"><AuthBrand /><div className="auth-aside-copy"><h2>Make room for what matters.</h2><p>A clearer picture of your money starts with the small things. Keep your spending thoughtful and your goals in sight.</p></div><div className="auth-aside-foot">A calmer way to manage your money · {isAdmin ? "Administrator access" : "Your personal space"}</div></aside><div className="auth-panel"><div className="auth-mobile-brand"><AuthBrand /></div><div className="auth-theme-toggle"><ThemeToggle /></div><div className="auth-form-wrap">{children}</div></div></main>;
}

export function LoginForm({ registered = false, passwordReset = false }: { registered?: boolean; passwordReset?: boolean }) {
  const { signIn } = useApp();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get("identifier") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!identifier || !password) {
      setError("Enter your username or email and password to continue.");
      return;
    }
    const role = await signIn(identifier, password, form.get("remember") === "on");
    if (!role) {
      setError("Sign-in failed. Check your username or email and password.");
      return;
    }
    router.push(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
  }

  return <AuthLayout>
    <div className="auth-heading"><div className="eyebrow">WELCOME BACK</div><h1>Sign in to your account</h1><p>Enter your credentials. We’ll take you to the correct workspace.</p></div>
    <form className="auth-fields" onSubmit={submit}>
      <div className="auth-field"><label htmlFor="identifier">Username or email address</label><input id="identifier" name="identifier" className="field" placeholder="you@example.com" autoComplete="username" required /></div>
      <div className="auth-field"><label htmlFor="password">Password</label><div className="password-wrap"><input id="password" name="password" className="field" type={visible ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" required /><button type="button" className="password-toggle" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
      <div className="auth-options"><label className="checkbox-label"><input type="checkbox" name="remember" />Remember me</label><Link className="text-link" href="/forgot-password">Forgot password?</Link></div>
      {error && <div role="alert" className="auth-error">{error}</div>}
      <button className="btn btn-primary auth-submit" type="submit">Sign in</button>
    </form>
    {registered && <div role="status" className="pill income" style={{ margin: "18px auto 0", width: "fit-content" }}>Account created — sign in to continue</div>}
    {passwordReset && <div role="status" className="pill income" style={{ margin: "18px auto 0", width: "fit-content" }}>Password updated — sign in with your new password</div>}
    <p className="auth-bottom">New to FINORA? <Link className="text-link" href="/user/register">Create an account</Link></p>
  </AuthLayout>;
}

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await authService.requestPasswordReset(String(form.get("email") ?? "").trim());
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to request a password reset right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return <AuthLayout>
    <div className="auth-heading"><div className="eyebrow">ACCOUNT RECOVERY</div><h1>Forgot your password?</h1><p>Enter the email address associated with your account and we’ll send recovery instructions if it exists.</p></div>
    {submitted ? <div role="status" className="pill income" style={{ width: "100%", justifyContent: "center", padding: "14px", whiteSpace: "normal", textAlign: "center" }}>If an account matches that email, password reset instructions will be sent shortly. Check your inbox.</div> : <form className="auth-fields" onSubmit={submit}>
      <div className="auth-field"><label htmlFor="recovery-email">Email address</label><input id="recovery-email" name="email" type="email" className="field" placeholder="you@example.com" autoComplete="email" required /></div>
      {error && <div role="alert" className="auth-error">{error}</div>}
      <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send reset instructions"}</button>
    </form>}
    <p className="auth-bottom"><Link className="text-link" href="/login">Back to sign in</Link></p>
  </AuthLayout>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Those passwords don’t match. Please try again.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await authService.resetPassword({ token, password, confirmPassword });
      router.push("/login?passwordReset=1");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to reset your password. Request a new reset link and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return <AuthLayout>
    <div className="auth-heading"><div className="eyebrow">ACCOUNT RECOVERY</div><h1>Choose a new password</h1><p>Use at least 8 characters for your new password.</p></div>
    {!token ? <div role="alert" className="auth-error">This password reset link is incomplete. Request a new one to continue.</div> : <form className="auth-fields" onSubmit={submit}>
      <div className="auth-field"><label htmlFor="password">New password</label><div className="password-wrap"><input id="password" name="password" className="field" type={visible ? "text" : "password"} autoComplete="new-password" minLength={8} required /><button type="button" className="password-toggle" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
      <div className="auth-field"><label htmlFor="confirmPassword">Confirm new password</label><div className="password-wrap"><input id="confirmPassword" name="confirmPassword" className="field" type={visible ? "text" : "password"} autoComplete="new-password" minLength={8} required /><button type="button" className="password-toggle" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
      {error && <div role="alert" className="auth-error">{error}</div>}
      <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>{submitting ? "Updating password…" : "Reset password"}</button>
    </form>}
    <p className="auth-bottom"><Link className="text-link" href="/login">Back to sign in</Link></p>
  </AuthLayout>;
}

export function RegisterForm() {
  const { register, users } = useApp();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const username = String(form.get("username") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (!name || !username || !email || !password || !confirm) {
      setError("Please complete every field.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (email.toLowerCase() === "admin@example.com" || username.toLowerCase() === "admin" || users.some((user) => user.email.toLowerCase() === email.toLowerCase() || user.username.toLowerCase() === username.toLowerCase())) {
      setError("That email address or username is already in use.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don’t match. Please try again.");
      return;
    }
    try {
      await register({ name, username, email, password, confirm });
      router.push("/login?registered=1");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create your account.");
    }
  }

  return <AuthLayout>
    <div className="auth-heading"><div className="eyebrow">GET STARTED</div><h1>Create your account</h1><p>A few details and you’re ready to go.</p></div>
    <form className="auth-fields" onSubmit={submit}>
      <div className="auth-field"><label htmlFor="name">Full name</label><input id="name" name="name" className="field" placeholder="Your name" autoComplete="name" required /></div>
      <div className="auth-field"><label htmlFor="username">Username</label><input id="username" name="username" className="field" placeholder="Choose a username" autoComplete="username" required /></div>
      <div className="auth-field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" className="field" placeholder="you@example.com" autoComplete="email" required /></div>
      <div className="auth-field"><label htmlFor="password">Password</label><div className="password-wrap"><input id="password" name="password" className="field" type={visible ? "text" : "password"} placeholder="At least 8 characters" autoComplete="new-password" required /><button type="button" className="password-toggle" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
      <div className="auth-field"><label htmlFor="confirm">Confirm password</label><div className="password-wrap"><input id="confirm" name="confirm" className="field" type={visible ? "text" : "password"} placeholder="Enter your password again" autoComplete="new-password" required /><button type="button" className="password-toggle" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
      {error && <div role="alert" className="auth-error">{error}</div>}
      <button className="btn btn-primary auth-submit" type="submit">Create account</button>
    </form>
    <p className="auth-bottom">Already have an account? <Link className="text-link" href="/login">Sign in</Link></p>
  </AuthLayout>;
}
