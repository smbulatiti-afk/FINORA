import { apiFetch } from "./api-client";
import type { AppUser, Category, Transaction } from "@/types";
export interface PageMeta { page: number; limit: number; total: number; totalPages: number }
export interface Page<T> { data: T[]; meta: PageMeta }
function transactionNumbers(transaction: Transaction): Transaction {
  return { ...transaction, amount: Number(transaction.amount) };
}
function transactionPage(page: Page<Transaction>): Page<Transaction> {
  return { ...page, data: page.data.map(transactionNumbers) };
}
function transactionPayload(value: Partial<Omit<Transaction, "id">>): Partial<Pick<Transaction, "userId" | "type" | "title" | "category" | "amount" | "date" | "description">> {
  return {
    userId: value.userId,
    type: value.type,
    title: value.title,
    category: value.category,
    amount: value.amount,
    date: value.date,
    description: value.description,
  };
}
export const usersService = {
  list: (params: URLSearchParams) => apiFetch<Page<AppUser>>(`/admin/users${params.size ? `?${params}` : ""}`),
  create: (value: { name: string; username: string; email: string; password: string; confirmPassword: string }) => apiFetch<AppUser>("/admin/users", { method: "POST", body: JSON.stringify(value) }),
  update: (id: string, value: Partial<Pick<AppUser, "name" | "username" | "email">>) => apiFetch<AppUser>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(value) }),
  delete: (id: string) => apiFetch<{ success: boolean }>(`/admin/users/${id}`, { method: "DELETE" }),
};
export const categoriesService = {
  list: (params = "") => apiFetch<Page<Category>>(`/categories${params ? `?${params}` : "?page=1&limit=50"}`),
  create: (value: Omit<Category, "id">) => apiFetch<Category>("/categories", { method: "POST", body: JSON.stringify(value) }),
  update: (id: string, value: Omit<Category, "id">) => apiFetch<Category>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(value) }),
  delete: (id: string) => apiFetch<{ success: boolean }>(`/categories/${id}`, { method: "DELETE" }),
};
export const transactionsService = {
  list: async (params: URLSearchParams) => transactionPage(await apiFetch<Page<Transaction>>(`/transactions${params.size ? `?${params}` : "?page=1&limit=50"}`)),
  create: async (value: Omit<Transaction, "id">) => transactionNumbers(await apiFetch<Transaction>("/transactions", { method: "POST", body: JSON.stringify(transactionPayload(value)) })),
  update: async (id: string, value: Partial<Omit<Transaction, "id">>) => transactionNumbers(await apiFetch<Transaction>(`/transactions/${id}`, { method: "PATCH", body: JSON.stringify(transactionPayload(value)) })),
  delete: (id: string) => apiFetch<{ success: boolean }>(`/transactions/${id}`, { method: "DELETE" }),
};
