"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings2,
  Tags,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import type { Role } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";

const adminItems = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  { label: "Categories", href: "/admin/categories", icon: Tags },
];

const userItems = [
  { label: "Overview", href: "/user/dashboard", icon: LayoutDashboard },
  { label: "Add income", href: "/user/income", icon: CircleDollarSign },
  { label: "Add expense", href: "/user/expenses", icon: PlusCircle },
  { label: "Transactions", href: "/user/transactions", icon: ArrowLeftRight },
  { label: "Reports", href: "/user/reports", icon: BarChart3 },
];

export function RoleGuard({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { session, sessionReady } = useApp();
  const router = useRouter();
  useEffect(() => {
    if (sessionReady && (!session || session.role !== role))
      router.replace("/login");
  }, [role, router, session, sessionReady]);
  if (sessionReady && (!session || session.role !== role)) return null;
  if (!sessionReady)
    return (
      <div className="content">
        <p className="subtitle">Loading your FINORA workspace…</p>
      </div>
    );
  return <>{children}</>;
}

export function DashboardShell({
  role,
  children,
  title,
}: {
  role: Role;
  children: React.ReactNode;
  title: string;
}) {
  const { session, signOut, toggleTheme } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = role === "admin" ? adminItems : userItems;

  useEffect(() => {
    document.title = `${title} | FINORA`;
  }, [title]);

  function logout() {
    signOut();
    router.push("/login");
  }

  return (
    <div className="app-shell">
      <aside
        className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}
      >
        <div className="brand">
          <div className="brand-mark">
            <Wallet size={19} />
          </div>
          <div>
            <div className="brand-name">FINORA</div>
            <div className="brand-sub">
              Financial Organization and <br /> Record Assistant
            </div>
          </div>
        </div>
        <div className="nav-label">
          {role === "admin" ? "Administration" : "Workspace"}
        </div>
        <nav className="nav-list" aria-label="Main navigation">
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${pathname === href ? " active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {!collapsed && <div className="nav-label">Preferences</div>}
          <button className="logout-button" onClick={toggleTheme}>
            <Settings2 size={17} />
            <span className="logout-label">Appearance</span>
          </button>
          <div className="profile">
            <div className="avatar">
              {(session?.name ?? "A")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="profile-meta">
              <div className="profile-name">{session?.name ?? "Account"}</div>
              <div className="profile-role">
                {role === "admin" ? "Administrator" : "Personal account"}
              </div>
            </div>
          </div>
          <button className="logout-button" onClick={logout}>
            <LogOut size={17} />
            <span className="logout-label">Log out</span>
          </button>
        </div>
        <button
          className="icon-button collapse-button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute",
            right: -17,
            top: 85,
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--surface)",
          }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </aside>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 15,
            border: 0,
            background: "rgba(0,0,0,.25)",
          }}
        />
      )}
      <main className={`main-column${collapsed ? " collapsed" : ""}`}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="page-title">{title}</div>
          </div>
          <div className="topbar-actions">
            <span className="top-date">
              {new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              }).format(new Date())}
            </span>
            <ThemeToggle />
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
