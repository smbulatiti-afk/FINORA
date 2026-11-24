import type { AppUser, Category, Transaction } from "@/types";

export const initialUsers: AppUser[] = [];
export const initialTransactions: Transaction[] = [];
export const initialCategories: Category[] = [
  { id: "category-default-housing", name: "Housing", color: "#476c56", type: "expense" },
  { id: "category-default-food", name: "Food & dining", color: "#c79658", type: "expense" },
  { id: "category-default-transport", name: "Transport", color: "#6984a6", type: "expense" },
  { id: "category-default-shopping", name: "Shopping", color: "#b87872", type: "expense" },
  { id: "category-default-health", name: "Health", color: "#8d7dab", type: "expense" },
  { id: "category-default-salary", name: "Salary", color: "#598c75", type: "income" },
  { id: "category-default-freelance", name: "Freelance", color: "#8b9b61", type: "income" },
];
