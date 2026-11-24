"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { DashboardShell, RoleGuard } from "@/components/DashboardShell";
import { TransactionForm } from "@/components/TransactionForm";
import { PageHeading } from "@/components/UI";
import { useApp } from "@/contexts/AppContext";
import { showTransactionAlert } from "@/lib/sweetalert";

function ExpenseEntry() {
  const { session, addTransaction } = useApp();
  const router = useRouter();
  function save(value: { title: string; amount: number; category: string; date: string; description: string }) {
    addTransaction({ ...value, type: "expense", userId: session?.userId ?? "", userName: session?.name ?? "" });
    void showTransactionAlert("success", "Expense transaction added successfully.");
    router.push("/user/transactions");
  }
  return <RoleGuard role="user"><DashboardShell role="user" title="Add expense"><PageHeading eyebrow="MONEY OUT" title="Add an expense" description="Keep a record of the things you spend on." action={<div className="stat-icon"><ArrowUpRight size={18} /></div>} /><TransactionForm type="expense" onSave={save} /></DashboardShell></RoleGuard>;
}
export default function ExpensesPage() { return <ExpenseEntry />; }
