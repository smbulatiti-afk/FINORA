"use client";

import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { DashboardShell, RoleGuard } from "@/components/DashboardShell";
import { ChartCard, OverviewChart, PageHeading, RecentTransactions, StatCard } from "@/components/UI";
import { MonthSelector } from "@/components/MonthSelector";
import { useApp } from "@/contexts/AppContext";
import { currency, currentMonthKey, greetingName, shiftMonthKey } from "@/lib/format";
import type { Transaction } from "@/types";
import { useState } from "react";

function UserOverview() {
  const { session, transactions } = useApp();
  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const personal = transactions.filter((item) => item.userId === session?.userId);
  const thisMonth = personal.filter((item) => item.date.startsWith(monthKey));
  const income = thisMonth.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = thisMonth.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const monthlySeries = (type: Transaction["type"]) => Array.from({ length: 7 }, (_, index) => {
    const key = shiftMonthKey(monthKey, index - 6);
    return personal.filter((item) => item.type === type && item.date.startsWith(key)).reduce((sum, item) => sum + item.amount, 0);
  });
  return <RoleGuard role="user"><DashboardShell role="user" title="Overview">
    <PageHeading eyebrow="YOUR FINANCIAL SNAPSHOT" title={`Good morning, ${greetingName(session?.name ?? "there")}`} description="A little clarity goes a long way. Review any month in your financial history." action={<MonthSelector value={monthKey} onChange={setMonthKey} />} />
    <div className="grid stats-grid">
      <StatCard label="Total income" value={currency(income)} note="Selected month" icon={<ArrowDownLeft size={17} />} tone="income" />
      <StatCard label="Total expenses" value={currency(expense)} note="Selected month" icon={<ArrowUpRight size={17} />} tone="expense" />
      <StatCard label="Remaining balance" value={currency(income - expense)} note="Income minus expenses" icon={<Wallet size={17} />} tone={income - expense >= 0 ? "income" : "expense"} />
      <StatCard label="Transactions" value={thisMonth.length.toString()} note="Selected month" icon={<ArrowDownLeft size={17} />} />
    </div>
    <div className="grid dashboard-grid"><ChartCard title="Income & expenses" description="Monthly cash flow through the selected month" legend><OverviewChart income={monthlySeries("income")} expense={monthlySeries("expense")} monthKey={monthKey} /></ChartCard><RecentTransactions transactions={thisMonth} /></div>
  </DashboardShell></RoleGuard>;
}
export default function UserDashboardPage() { return <UserOverview />; }
