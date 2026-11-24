"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppUser, Category, Role, Session, Transaction } from "@/types";
import { authService } from "@/services/auth";
import { refreshSession, setAccessToken } from "@/services/api-client";
import { categoriesService, transactionsService, usersService } from "@/services/resources";

type Theme = "light" | "dark";

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  session: Session | null;
  sessionReady: boolean;
  signIn: (identifier: string, password: string, remember: boolean) => Promise<Role | null>;
  register: (user: Omit<AppUser, "id" | "role" | "joinedAt"> & { password: string; confirm: string }) => Promise<void>;
  signOut: () => Promise<void>;
  users: AppUser[];
  addUser: (user: Pick<AppUser, "name" | "username" | "email"> & { password: string; confirmPassword: string }) => Promise<void>;
  updateUser: (user: AppUser) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  categories: Category[];
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("pet-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
    void (async () => {
      try {
        if (await refreshSession()) {
          const user = await authService.me();
          setSession({ userId: user.id, name: user.name, role: user.role });
        }
      } catch {
        setSession(null);
        setAccessToken(null);
      } finally {
        setSessionReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("pet-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!sessionReady || !session) return;
    void (async () => {
      try {
        const categoryPage = await categoriesService.list("page=1&limit=50");
        setCategories(categoryPage.data);
        const transactionParams = new URLSearchParams({ page: "1", limit: "50" });
        const transactionPage = await transactionsService.list(transactionParams);
        setTransactions(transactionPage.data);
        if (session.role === "admin") {
          const userParams = new URLSearchParams({ page: "1", limit: "50" });
          setUsers((await usersService.list(userParams)).data);
        }
      } catch (error) {
        console.error("Unable to load FINORA API data.", error);
      }
    })();
  }, [session, sessionReady]);

  const value = useMemo<AppContextValue>(() => ({
    theme,
    toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    session,
    sessionReady,
    signIn: async (identifier, password) => {
      try {
        const result = await authService.login(identifier, password);
        setSession({ userId: result.user.id, name: result.user.name, role: result.user.role });
        return result.user.role;
      } catch {
        return null;
      }
    },
    register: async (user) => {
      await authService.register({
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        confirmPassword: user.confirm,
      });
    },
    signOut: async () => {
      try { await authService.logout(); } catch { setAccessToken(null); }
      setSession(null);
    },
    users,
    addUser: async (user) => {
      const created = await usersService.create(user);
      setUsers((current) => [created, ...current]);
    },
    updateUser: async (user) => {
      const updated = await usersService.update(user.id, { name: user.name, username: user.username, email: user.email });
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
    },
    deleteUser: async (id) => {
      await usersService.delete(id);
      setUsers((current) => current.filter((user) => user.id !== id));
      setTransactions((current) => current.filter((transaction) => transaction.userId !== id));
    },
    transactions,
    addTransaction: async (transaction) => {
      const created = await transactionsService.create(transaction);
      setTransactions((current) => [created, ...current]);
    },
    updateTransaction: async (transaction) => {
      const updated = await transactionsService.update(transaction.id, transaction);
      setTransactions((current) => current.map((item) => item.id === updated.id ? updated : item));
    },
    deleteTransaction: async (id) => {
      await transactionsService.delete(id);
      setTransactions((current) => current.filter((item) => item.id !== id));
    },
    categories,
    addCategory: async (category) => {
      const created = await categoriesService.create(category);
      setCategories((current) => [...current, created]);
    },
    updateCategory: async (category) => {
      const { id, ...value } = category;
      const updated = await categoriesService.update(id, value);
      setCategories((current) => current.map((item) => item.id === updated.id ? updated : item));
    },
    deleteCategory: async (id) => {
      await categoriesService.delete(id);
      setCategories((current) => current.filter((item) => item.id !== id));
    },
  }), [categories, session, sessionReady, theme, transactions, users]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider.");
  return context;
}
