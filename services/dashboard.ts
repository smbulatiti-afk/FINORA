import { apiFetch } from "./api-client";
import type { Transaction } from "@/types";
export interface DashboardSeries { month: string; income: string; expense: string }
export const dashboardService = {
  me: (month: string) => apiFetch<{ income: string; expense: string; balance: string; transactionCount: number; recentTransactions: Transaction[]; series: DashboardSeries[] }>(`/dashboard/me?month=${encodeURIComponent(month)}`),
  reports: (month: string) => apiFetch<{ income: string; expense: string; balance: string; series: DashboardSeries[]; expenseByCategory: Array<{ name: string; amount: string }> }>(`/reports/me?month=${encodeURIComponent(month)}`),
  admin: (month: string) => apiFetch<{ registeredUsers: number; income: string; expense: string; balance: string; transactionCount: number; recentTransactions: Transaction[]; series: DashboardSeries[] }>(`/admin/dashboard?month=${encodeURIComponent(month)}`),
};
