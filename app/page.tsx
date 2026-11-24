"use client";

import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Wallet size={19} />
          </span>
          <span className="landing-brand-copy">
            <span className="brand-name">FINORA</span>
            <span className="brand-sub">
              Financial Organization and Record Assistant
            </span>
          </span>
        </Link>
        <div className="landing-actions">
          <ThemeToggle />
          <Link className="btn btn-secondary" href="/login">
            Sign in
          </Link>
          <Link className="btn btn-primary" href="/user/register">
            Create account
          </Link>
        </div>
      </header>
      <section className="landing-hero">
        <div className="eyebrow">
          ORGANIZE YOUR FINANCES. TRACK YOUR PROGRESS.
        </div>
        <h1>A calmer way to keep track of your finances.</h1>
        <p>
          Record income and expenses, see where you stand, and review your
          progress month by month. Your workspace starts empty and grows with
          the records you add.
        </p>
        <div className="landing-actions">
          <Link className="btn btn-primary" href="/user/register">
            Get started <ArrowRight size={16} />
          </Link>
          <Link className="text-link" href="/login">
            I already have an account
          </Link>
        </div>
      </section>
      <footer className="landing-footer">
        FINORA · Financial Organization and Record Assistant
      </footer>
    </main>
  );
}
