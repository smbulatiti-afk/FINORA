"use client";

import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Users } from "lucide-react";
import { DashboardShell, RoleGuard } from "@/components/DashboardShell";
import { ChartCard, OverviewChart, PageHeading, RecentTransactions, StatCard } from "@/components/UI";
import { Pagination, usePagination } from "@/components/Pagination";
import { MonthSelector } from "@/components/MonthSelector";
import { useApp } from "@/contexts/AppContext";
import { currency, currentMonthKey, shiftMonthKey } from "@/lib/format";
import { useState } from "react";

function AdminOverview() {
  const { users, transactions } = useApp();
  const registeredUsers = users.filter((user) => user.role === "user");
  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const monthlyTransactions = transactions.filter((item) => item.date.startsWith(monthKey));
  const income = monthlyTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = monthlyTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const monthlySeries = (type: "income" | "expense") => Array.from({ length: 7 }, (_, index) => {
    const key = shiftMonthKey(monthKey, index - 6);
    return transactions.filter((item) => item.type === type && item.date.startsWith(key)).reduce((sum, item) => sum + item.amount, 0);
  });
  const userSummaries = registeredUsers.map((user) => {
    const userTransactions = monthlyTransactions.filter((item) => item.userId === user.id);
    return {
      user,
      income: userTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0),
      expense: userTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0),
    };
  });
  const pagination = usePagination(userSummaries.length, monthKey);
  const pageSummaries = userSummaries.slice(pagination.offset, pagination.offset + pagination.limit);
  return <RoleGuard role="admin"><DashboardShell role="admin" title="Overview">
    <PageHeading eyebrow="PLATFORM FINANCIAL SNAPSHOT" title="Administrator overview" description="Review activity and totals across all user accounts for any month." action={<MonthSelector value={monthKey} onChange={setMonthKey} />} />
    <div className="grid stats-grid">
      <StatCard label="Registered users" value={registeredUsers.length.toLocaleString()} note="Active accounts" icon={<Users size={17} />} />
      <StatCard label="Transactions" value={monthlyTransactions.length.toLocaleString()} note="Selected month" icon={<ArrowLeftRight size={17} />} tone="income" />
      <StatCard label="Income recorded" value={currency(income)} note="Selected month · all users" icon={<ArrowDownLeft size={17} />} tone="income" />
      <StatCard label="Expenses recorded" value={currency(expense)} note="Selected month · all users" icon={<ArrowUpRight size={17} />} tone="expense" />
    </div>
    <div className="grid dashboard-grid">
      <ChartCard title="Platform activity" description="Monthly income and expenses through the selected month" legend><OverviewChart income={monthlySeries("income")} expense={monthlySeries("expense")} monthKey={monthKey} /></ChartCard>
      <RecentTransactions transactions={monthlyTransactions} showUser />
    </div>
    <section className="card table-card" style={{ marginTop: 20 }}>
      <div className="card-header" style={{ paddingBottom: 17 }}><div><h2 className="card-title">Monthly user summaries</h2><p className="card-description">Income and expenses for each user in the selected month</p></div></div>
      <div className="table-wrap"><table><thead><tr><th>User</th><th style={{ textAlign: "right" }}>Income</th><th style={{ textAlign: "right" }}>Expenses</th><th style={{ textAlign: "right" }}>Balance</th></tr></thead><tbody>
        {pageSummaries.map(({ user, income: userIncome, expense: userExpense }) => <tr key={user.id}><td>{user.name}</td><td style={{ textAlign: "right" }}>{currency(userIncome)}</td><td style={{ textAlign: "right" }}>{currency(userExpense)}</td><td style={{ textAlign: "right" }}>{currency(userIncome - userExpense)}</td></tr>)}
      </tbody></table>{userSummaries.length === 0 && <div className="empty-state">No registered users yet.</div>}</div>
      <Pagination {...pagination} />
    </section>
  </DashboardShell></RoleGuard>;
}

export default function AdminDashboardPage() {
  return <AdminOverview />;
}
