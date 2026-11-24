"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { DashboardShell, RoleGuard } from "@/components/DashboardShell";
import { ChartCard, OverviewChart, PageHeading, StatCard } from "@/components/UI";
import { MonthSelector } from "@/components/MonthSelector";
import { useApp } from "@/contexts/AppContext";
import { currency, currentMonthKey, shiftMonthKey } from "@/lib/format";
import type { Transaction } from "@/types";

function ReportsContent() {
  const { session, transactions, categories } = useApp();
  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const personal = transactions.filter((item) => item.userId === session?.userId);
  const monthly = personal.filter((item) => item.date.startsWith(monthKey));
  const income = monthly.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = monthly.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const expenseByCategory = Array.from(new Set(monthly.filter((item) => item.type === "expense").map((item) => item.category)))
    .map((name) => ({
      name,
      id: name,
      color: categories.find((category) => category.name === name && category.type === "expense")?.color ?? "var(--accent)",
      amount: monthly.filter((item) => item.type === "expense" && item.category === name).reduce((sum, item) => sum + item.amount, 0),
    }))
    .sort((a, b) => b.amount - a.amount);
  const series = (type: Transaction["type"]) => Array.from({ length: 7 }, (_, index) => {
    const key = shiftMonthKey(monthKey, index - 6);
    return personal.filter((item) => item.type === type && item.date.startsWith(key)).reduce((sum, item) => sum + item.amount, 0);
  });
  return <RoleGuard role="user"><DashboardShell role="user" title="Reports"><PageHeading eyebrow="YOUR FINANCIAL REPORT" title="Reports" description="A clear picture of where your money is going." action={<MonthSelector value={monthKey} onChange={setMonthKey} />} />
    <div className="grid stats-grid report-stats-grid"><StatCard label="Monthly income" value={currency(income)} note="Selected month" icon={<ArrowDownLeft size={17} />} tone="income" /><StatCard label="Monthly expenses" value={currency(expense)} note="Selected month" icon={<ArrowUpRight size={17} />} tone="expense" /><StatCard label="Monthly balance" value={currency(income - expense)} note="Income minus expenses" icon={<Wallet size={17} />} tone={income - expense >= 0 ? "income" : "expense"} /></div>
    <div className="grid report-grid"><ChartCard title="Income vs. expenses" description="Month-by-month comparison through the selected month" legend><OverviewChart income={series("income")} expense={series("expense")} monthKey={monthKey} /></ChartCard>
      <section className="card"><div className="card-header"><div><h2 className="card-title">Spending by category</h2><p className="card-description">Your recorded expenses in the selected month</p></div></div><div className="breakdown-list">{expenseByCategory.length ? expenseByCategory.map((item) => <div className="breakdown-row" key={item.id}><span>{item.name}</span><strong>{currency(item.amount)}</strong><div className="breakdown-track"><div className="breakdown-fill" style={{ width: `${Math.min(100, expense > 0 ? (item.amount / expense) * 100 : 0)}%`, background: item.color }} /></div></div>) : <div className="empty-state">Add an expense to see your spending breakdown.</div>}</div><div style={{ borderTop: "1px solid var(--line)", padding: "14px 21px", color: "var(--muted)", fontSize: 11 }}>Selected month expenses <strong style={{ float: "right", color: "var(--text)" }}>{currency(expense)}</strong></div></section>
    </div>
  </DashboardShell></RoleGuard>;
}
export default function ReportsPage() { return <ReportsContent />; }
