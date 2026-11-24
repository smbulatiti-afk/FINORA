export type Role = "admin" | "user";
export type TransactionType = "income" | "expense";

export interface AppUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  joinedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  title: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
}

export interface Session {
  userId: string;
  name: string;
  role: Role;
}
