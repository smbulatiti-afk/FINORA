"use client";

import { useRouter } from "next/navigation";
import { ArrowDownLeft } from "lucide-react";
import { DashboardShell, RoleGuard } from "@/components/DashboardShell";
import { TransactionForm } from "@/components/TransactionForm";
import { PageHeading } from "@/components/UI";
import { useApp } from "@/contexts/AppContext";
import { showTransactionAlert } from "@/lib/sweetalert";

function IncomeEntry() {
  const { session, addTransaction } = useApp();
  const router = useRouter();
  function save(value: { title: string; amount: number; category: string; date: string; description: string }) {
    addTransaction({ ...value, type: "income", userId: session?.userId ?? "", userName: session?.name ?? "" });
    void showTransactionAlert("success", "Income transaction added successfully.");
    router.push("/user/transactions");
  }
  return <RoleGuard role="user"><DashboardShell role="user" title="Add income"><PageHeading eyebrow="MONEY IN" title="Add income" description="Record a salary, side project, or any other income." action={<div className="stat-icon"><ArrowDownLeft size={18} /></div>} /><TransactionForm type="income" onSave={save} /></DashboardShell></RoleGuard>;
}
export default function IncomePage() { return <IncomeEntry />; }
