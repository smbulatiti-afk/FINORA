"use client";

import type { FormEvent } from "react";
import { useApp } from "@/contexts/AppContext";
import { localDateKey } from "@/lib/format";
import { showTransactionAlert } from "@/lib/sweetalert";
import type { TransactionType } from "@/types";

export function TransactionForm({ type, onSave }: { type: TransactionType; onSave: (value: { title: string; amount: number; category: string; date: string; description: string }) => void }) {
  const { categories } = useApp();
  const matchingCategories = categories.filter((category) => category.type === type);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const amount = Number(form.get("amount"));
    const date = String(form.get("date") ?? "");
    const category = String(form.get("category") ?? "");
    if (!title || !date || !Number.isFinite(amount) || amount <= 0 || !matchingCategories.some((item) => item.name === category)) {
      void showTransactionAlert("error", "Add a description, valid amount, category, and date.");
      return;
    }
    onSave({ title, amount, date, category, description: String(form.get("description") ?? "").trim() });
    event.currentTarget.reset();
  }

  return <section className="card form-card"><form noValidate onSubmit={submit}><div className="form-grid">
    <div className="form-group full"><label className="form-label" htmlFor="title">{type === "income" ? "Income source" : "Expense title"}</label><input id="title" name="title" className="field" placeholder={type === "income" ? "e.g. Monthly salary" : "e.g. Weekly groceries"} /></div>
    <div className="form-group"><label className="form-label" htmlFor="amount">Amount</label><div className="amount-input-wrap"><span className="amount-prefix">₱</span><input id="amount" name="amount" className="field" type="number" step="0.01" min="0.01" placeholder="0.00" /></div></div>
    <div className="form-group"><label className="form-label" htmlFor="category">Category</label><select id="category" name="category" className="select-field" defaultValue=""><option value="" disabled>{matchingCategories.length ? "Select a category" : `No ${type} categories available`}</option>{matchingCategories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select>{matchingCategories.length === 0 && <span className="card-description">Ask an administrator to add a {type} category.</span>}</div>
    <div className="form-group full"><label className="form-label" htmlFor="date">Date</label><input id="date" name="date" type="date" className="field" defaultValue={localDateKey()} /></div>
    <div className="form-group full"><label className="form-label" htmlFor="description">Description <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label><textarea id="description" name="description" className="textarea-field" placeholder="Add a note about this transaction" /></div>
  </div><div className="form-footer"><button type="submit" className="btn btn-primary">Save {type}</button></div></form></section>;
}
