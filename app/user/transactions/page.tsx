"use client";

import { useMemo, useState } from "react";
import { DashboardShell, RoleGuard } from "@/components/DashboardShell";
import { TransactionEditor } from "@/components/TransactionEditor";
import { PageHeading, SearchInput, TransactionTable } from "@/components/UI";
import { Pagination, usePagination } from "@/components/Pagination";
import { useApp } from "@/contexts/AppContext";
import { confirmTransactionDelete, showTransactionAlert } from "@/lib/sweetalert";
import type { Transaction } from "@/types";

function PersonalTransactions() {
  const {
    session,
    transactions,
    updateTransaction,
    deleteTransaction,
  } = useApp();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const personal = useMemo(() => transactions.filter((item) => item.userId === session?.userId), [session?.userId, transactions]);
  const visible = useMemo(() => personal.filter((item) =>
    `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase()) &&
    (!date || item.date === date) &&
    (typeFilter === "all" || item.type === typeFilter) &&
    (categoryFilter === "all" || item.category === categoryFilter) &&
    (monthFilter === "all" || item.date.slice(0, 7) === monthFilter) &&
    (yearFilter === "all" || item.date.slice(0, 4) === yearFilter)
  ), [categoryFilter, date, monthFilter, personal, query, typeFilter, yearFilter]);
  const pagination = usePagination(visible.length, JSON.stringify([query, date, typeFilter, categoryFilter, monthFilter, yearFilter]));
  const pageTransactions = visible.slice(pagination.offset, pagination.offset + pagination.limit);
  const categoryOptions = Array.from(new Set(personal.map((item) => item.category))).sort((a, b) => a.localeCompare(b));
  const monthOptions = Array.from(new Set(personal.map((item) => item.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a));
  const yearOptions = Array.from(new Set(personal.map((item) => item.date.slice(0, 4)))).sort((a, b) => b.localeCompare(a));
  function save(transaction: Omit<Transaction, "id">) {
    if (selected) {
      updateTransaction({ ...transaction, id: selected.id });
      void showTransactionAlert("success", "Transaction updated successfully.");
    }
    setSelected(null);
  }
  async function removeTransaction(transaction: Transaction) {
    if (!(await confirmTransactionDelete(`Delete "${transaction.title}"?`))) return;
    deleteTransaction(transaction.id);
    void showTransactionAlert("success", "Transaction deleted successfully.");
  }
  return <RoleGuard role="user"><DashboardShell role="user" title="Transactions">
    <PageHeading eyebrow="YOUR ACTIVITY" title="Transactions" description="View, filter, and manage income and expenses from any month." />
    <section className="card table-card">
      <div className="table-toolbar">
        <div>
          <div className="card-title">All activity <span style={{ color: "var(--muted)", fontWeight: 400 }}>({visible.length})</span></div>
          <div className="card-description">Search and filter income and expenses, including historical records</div>
        </div>
        <div className="filters transaction-filters">
          <SearchInput value={query} onChange={setQuery} placeholder="Search activity" />
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
          <input className="field date-filter" aria-label="Filter by exact date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
      </div>
      <TransactionTable
        transactions={pageTransactions}
        emptyMessage={personal.length === 0 ? "No transactions yet. Start by adding your first income or expense." : "No transactions match your search or filters."}
        onEdit={setSelected}
        onDelete={removeTransaction}
      />
      <Pagination {...pagination} />
    </section>
    {selected && <TransactionEditor key={selected.id} type={selected.type} initial={selected} onClose={() => setSelected(null)} onSave={save} />}
  </DashboardShell></RoleGuard>;
}
export default function TransactionsPage() { return <PersonalTransactions />; }
