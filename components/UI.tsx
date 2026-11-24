"use client";

import { ArrowDownLeft, ArrowUpRight, MoreHorizontal, Search } from "lucide-react";
import type { ReactNode } from "react";
import { currency, currentMonthKey, shiftMonthKey, shortDate } from "@/lib/format";
import type { Transaction } from "@/types";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p className="subtitle">{description}</p>}</div>{action}</div>;
}

export function StatCard({ label, value, note, icon, change, tone }: { label: string; value: string; note: string; icon: ReactNode; change?: string; tone?: "income" | "expense" }) {
  return <section className="card stat-card"><div className="stat-top"><span className="stat-label">{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-value">{value}</div><div className={`stat-note ${tone === "income" ? "positive" : tone === "expense" ? "negative" : ""}`}>{change && <span>{change}</span>}<span className={tone ? "" : undefined}>{note}</span></div></section>;
}

export function ChartCard({ title, description, children, legend }: { title: string; description: string; children: ReactNode; legend?: boolean }) {
  return <section className="card"><div className="card-header"><div><h2 className="card-title">{title}</h2><p className="card-description">{description}</p></div>{legend && <div className="chart-legend"><span className="legend-item"><i className="legend-dot" />Income</span><span className="legend-item"><i className="legend-dot expense" />Expenses</span></div>}</div><div className="chart-area">{children}</div></section>;
}

export function OverviewChart({ income, expense, monthKey = currentMonthKey() }: { income: number[]; expense: number[]; monthKey?: string }) {
  const width = 620;
  const height = 205;
  const max = Math.max(...income, ...expense, 1) * 1.15;
  if ([...income, ...expense].every((value) => value === 0)) return <div className="empty-chart">Add transactions to see your monthly trends.</div>;
  const points = (values: number[]) => values.map((value, index) => `${92 + index * ((width - 108) / (values.length - 1))},${height - 24 - (value / max) * (height - 52)}`).join(" ");
  const labels = Array.from({ length: 7 }, (_, index) => {
    const [year, monthNumber] = shiftMonthKey(monthKey, index - 6).split("-").map(Number);
    const month = new Date(year, monthNumber - 1, 1);
    return month.toLocaleString("en-US", { month: "short" });
  });
  return <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly income and expense overview">
    {[0, 1, 2, 3].map((line) => <g key={line}><line x1="88" x2={width - 12} y1={25 + line * 48} y2={25 + line * 48} stroke="var(--line)" strokeDasharray="3 5" /><text x="0" y={29 + line * 48} fill="var(--muted)" fontSize="9">{currency(Math.round(max * (3 - line) / 3))}</text></g>)}
    <polyline fill="none" stroke="var(--chart-income)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points(income)} />
    <polyline fill="none" stroke="var(--chart-expense)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points(expense)} />
    {labels.map((label, index) => <text key={label} x={92 + index * ((width - 108) / 6)} y={height - 3} textAnchor="middle" fill="var(--muted)" fontSize="9">{label}</text>)}
  </svg>;
}

export function TransactionTable({ transactions, showUser = false, emptyMessage = "No transactions match your search.", onEdit, onDelete }: { transactions: Transaction[]; showUser?: boolean; emptyMessage?: string; onEdit?: (transaction: Transaction) => void; onDelete?: (transaction: Transaction) => void }) {
  const sortedTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  return <div className="table-wrap"><table><thead><tr>{showUser && <th>User</th>}<th>Description</th><th>Category</th><th>Type</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th>{(onEdit || onDelete) && <th />}</tr></thead><tbody>
    {sortedTransactions.map((transaction) => <tr key={transaction.id}>
      {showUser && <td><div className="person-cell"><div className="person-avatar">{transaction.userName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><span className="person-name">{transaction.userName}</span></div></td>}
      <td><div className="person-name">{transaction.title}</div><div className="person-email">{transaction.description}</div></td><td>{transaction.category}</td>
      <td><span className={`pill ${transaction.type}`}>{transaction.type}</span></td><td>{shortDate(transaction.date)}</td>
      <td style={{ textAlign: "right", fontWeight: 600, color: transaction.type === "income" ? "var(--green)" : "var(--text)" }}>{transaction.type === "income" ? "+" : "−"}{currency(transaction.amount)}</td>
      {(onEdit || onDelete) && <td><div className="row-actions">{onEdit && <button className="row-action" aria-label={`Edit ${transaction.title}`} onClick={() => onEdit(transaction)}><MoreHorizontal size={17} /></button>}{onDelete && <button className="row-action" aria-label={`Delete ${transaction.title}`} onClick={() => onDelete(transaction)}><span style={{ fontSize: 17 }}>×</span></button>}</div></td>}
    </tr>)}
  </tbody></table>{transactions.length === 0 && <div className="empty-state">{emptyMessage}</div>}</div>;
}

export function RecentTransactions({ transactions, showUser = false }: { transactions: Transaction[]; showUser?: boolean }) {
  const sortedTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  return <section className="card"><div className="card-header"><div><h2 className="card-title">{showUser ? "Recent user activity" : "Recent transactions"}</h2><p className="card-description">{showUser ? "Latest transactions recorded by your users" : "Your latest money activity"}</p></div></div><div className="activity-list">
    {sortedTransactions.slice(0, 5).map((transaction) => <div className="activity-item" key={transaction.id}><div className="activity-icon">{transaction.type === "income" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</div><div><div className="activity-name">{transaction.title}</div><div className="activity-sub">{showUser ? `${transaction.userName} · ` : ""}{transaction.category} · {shortDate(transaction.date)}</div></div><div className={`activity-amount ${transaction.type === "income" ? "positive" : ""}`}>{transaction.type === "income" ? "+" : "−"}{currency(transaction.amount)}</div></div>)}
    {transactions.length === 0 && <div className="empty-state">{showUser ? "No transactions have been recorded yet." : "No transactions yet. Start by adding your first income or expense."}</div>}
  </div></section>;
}

export function SearchInput({ value, onChange, placeholder = "Search" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div className="search-box"><Search size={15} /><input className="field" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div>;
}
