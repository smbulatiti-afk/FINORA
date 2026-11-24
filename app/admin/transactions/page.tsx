"use client";

import { useMemo, useState } from "react";
import { DashboardShell, RoleGuard } from "@/components/DashboardShell";
import { TransactionEditor } from "@/components/TransactionEditor";
import { PageHeading, SearchInput, TransactionTable } from "@/components/UI";
import { Pagination, usePagination } from "@/components/Pagination";
import { useApp } from "@/contexts/AppContext";
import { currency } from "@/lib/format";
import { confirmTransactionDelete, showTransactionAlert } from "@/lib/sweetalert";
import type { Transaction, TransactionType } from "@/types";

function AdminTransactions() {
  const {
    transactions,
    users,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useApp();
  const [query, setQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [editorType, setEditorType] = useState<TransactionType | null>(null);
  const customerUsers = users.filter((user) => user.role === "user");
  const visible = useMemo(() => transactions.filter((item) =>
    `${item.title} ${item.userName} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase()) &&
    (userFilter === "all" || item.userId === userFilter) &&
    (typeFilter === "all" || item.type === typeFilter) &&
    (categoryFilter === "all" || item.category === categoryFilter) &&
    (monthFilter === "all" || item.date.slice(0, 7) === monthFilter) &&
    (yearFilter === "all" || item.date.slice(0, 4) === yearFilter)
  ), [categoryFilter, monthFilter, query, transactions, typeFilter, userFilter, yearFilter]);
  const pagination = usePagination(visible.length, JSON.stringify([query, userFilter, typeFilter, categoryFilter, monthFilter, yearFilter]));
  const pageTransactions = visible.slice(pagination.offset, pagination.offset + pagination.limit);
  const categoryOptions = Array.from(new Set(transactions.map((item) => item.category))).sort((a, b) => a.localeCompare(b));
  const monthOptions = Array.from(new Set(transactions.map((item) => item.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a));
  const yearOptions = Array.from(new Set(transactions.map((item) => item.date.slice(0, 4)))).sort((a, b) => b.localeCompare(a));
  const summaries = customerUsers.map((user) => {
    const userTransactions = transactions.filter(
      (item) => item.userId === user.id,
    );
    return {
      user,
      income: userTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0),
      expense: userTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0),
    };
  });
  const summaryPagination = usePagination(summaries.length);
  const pageSummaries = summaries.slice(summaryPagination.offset, summaryPagination.offset + summaryPagination.limit);
  function save(transaction: Omit<Transaction, "id">) {
    if (selected) updateTransaction({ ...transaction, id: selected.id });
    else addTransaction(transaction);
    void showTransactionAlert(
      "success",
      selected
        ? "Transaction updated successfully."
        : "Transaction added successfully.",
    );
    setSelected(null);
    setEditorType(null);
  }
  async function removeTransaction(transaction: Transaction) {
    if (!(await confirmTransactionDelete(`Delete "${transaction.title}" for ${transaction.userName}?`))) return;
    deleteTransaction(transaction.id);
    void showTransactionAlert("success", "Transaction deleted successfully.");
  }
  function openNew(typeToAdd: TransactionType) {
    setSelected(null);
    setEditorType(typeToAdd);
  }
  return (
    <RoleGuard role="admin">
      <DashboardShell role="admin" title="Transactions">
        <PageHeading
          eyebrow="ADMINISTRATION"
          title="All transactions"
          description="Manage income and expenses recorded by all users, including historical records."
          action={
            <div className="filters">
              <button
                className="btn btn-secondary"
                onClick={() => openNew("income")}
              >
                Add income
              </button>
              <button
                className="btn btn-primary"
                onClick={() => openNew("expense")}
              >
                Add expense
              </button>
            </div>
          }
        />
        <section className="card table-card">
          <div className="table-toolbar">
            <div>
              <div className="card-title">
                Transactions <span style={{ color: "var(--muted)", fontWeight: 400 }}>({visible.length})</span>
              </div>
              <div className="card-description">Search and filter income and expenses across all users</div>
            </div>
            <div className="filters transaction-filters">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search transactions"
              />
              <select className="select-field" aria-label="Filter transactions by user" value={userFilter} onChange={(event) => setUserFilter(event.target.value)}>
                <option value="all">All users</option>
                {customerUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
              <select className="select-field" aria-label="Filter transactions by type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select className="select-field" aria-label="Filter transactions by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">All categories</option>
                {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <select className="select-field" aria-label="Filter transactions by month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
                <option value="all">All months</option>
                {monthOptions.map((month) => {
                  const [year, monthNumber] = month.split("-").map(Number);
                  return <option key={month} value={month}>{new Date(year, monthNumber - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" })}</option>;
                })}
              </select>
              <select className="select-field" aria-label="Filter transactions by year" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
                <option value="all">All years</option>
                {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>
          <TransactionTable
            transactions={pageTransactions}
            showUser
            emptyMessage={
              transactions.length === 0
                ? "No transactions have been recorded yet."
                : "No transactions match your search or filters."
            }
            onEdit={(transaction) => {
              setEditorType(transaction.type);
              setSelected(transaction);
            }}
            onDelete={removeTransaction}
          />
          <Pagination {...pagination} />
        </section>
        <section className="card table-card" style={{ marginTop: 20 }}>
          <div className="card-header" style={{ paddingBottom: 17 }}>
            <div>
              <h2 className="card-title">Transaction totals by user</h2>
              <p className="card-description">
                Income, expenses, and balances across all recorded transactions
              </p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th style={{ textAlign: "right" }}>Income</th>
                  <th style={{ textAlign: "right" }}>Expenses</th>
                  <th style={{ textAlign: "right" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {pageSummaries.map(({ user, income, expense }) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td style={{ textAlign: "right" }}>{currency(income)}</td>
                    <td style={{ textAlign: "right" }}>{currency(expense)}</td>
                    <td style={{ textAlign: "right" }}>
                      {currency(income - expense)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {summaries.length === 0 && (
              <div className="empty-state">No registered users yet.</div>
            )}
          </div>
          <Pagination {...summaryPagination} />
        </section>
        {editorType && (
          <TransactionEditor
            key={`${editorType}-${selected?.id ?? "new"}`}
            type={editorType}
            initial={selected ?? undefined}
            users={customerUsers}
            onClose={() => {
              setEditorType(null);
              setSelected(null);
            }}
            onSave={save}
          />
        )}
      </DashboardShell>
    </RoleGuard>
  );
}
export default function AdminTransactionsPage() {
  return <AdminTransactions />;
}
