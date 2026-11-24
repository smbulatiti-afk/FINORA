"use client";

import type { FormEvent } from "react";
import { useApp } from "@/contexts/AppContext";
import { localDateKey } from "@/lib/format";
import { showTransactionAlert } from "@/lib/sweetalert";
import type { AppUser, Transaction, TransactionType } from "@/types";

export function TransactionEditor({ type, initial, users, onClose, onSave }: { type: TransactionType; initial?: Transaction; users?: AppUser[]; onClose: () => void; onSave: (value: Omit<Transaction, "id">) => void }) {
  const { session, categories } = useApp();
  const matchingCategories = categories.filter((category) => category.type === type);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    const title = String(form.get("title") ?? "").trim();
    const date = String(form.get("date") ?? "");
    const category = String(form.get("category") ?? "");
    const userId = String(form.get("userId") ?? initial?.userId ?? session?.userId ?? "");
    const selectedUser = users?.find((user) => user.id === userId);
    if (!title || !date || !matchingCategories.some((item) => item.name === category) || !Number.isFinite(amount) || amount <= 0 || (users && !selectedUser)) {
      void showTransactionAlert("error", "Select a user and category, and enter a description, valid amount, and date.");
      return;
    }
    onSave({
      userId,
      userName: selectedUser?.name ?? initial?.userName ?? session?.name ?? "",
      type,
      title,
      amount,
      date,
      category,
      description: String(form.get("description") ?? "").trim(),
    });
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title">
      <div className="modal-head"><div><h2 className="modal-title" id="transaction-modal-title">{initial ? "Edit" : "Add"} {type}</h2><p className="card-description" style={{ marginTop: 6 }}>Keep your records up to date.</p></div><button className="row-action" aria-label="Close dialog" onClick={onClose}>×</button></div>
      <form className="modal-form" noValidate onSubmit={submit}>
        {users && <div className="form-group"><label className="form-label" htmlFor="userId">User</label><select id="userId" name="userId" className="select-field" defaultValue={initial?.userId ?? users[0]?.id ?? ""}><option value="" disabled>Select a user</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></div>}
        <div className="form-group"><label className="form-label" htmlFor="title">{type === "income" ? "Income source" : "Expense title"}</label><input id="title" name="title" className="field" placeholder={type === "income" ? "e.g. Monthly salary" : "e.g. Groceries"} defaultValue={initial?.title} /></div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label" htmlFor="amount">Amount</label><div className="amount-input-wrap"><span className="amount-prefix">₱</span><input id="amount" name="amount" className="field" type="number" step="0.01" min="0.01" placeholder="0.00" defaultValue={initial?.amount} /></div></div>
          <div className="form-group"><label className="form-label" htmlFor="category">Category</label><select id="category" name="category" className="select-field" defaultValue={initial?.category ?? ""}><option value="" disabled>{matchingCategories.length ? "Select a category" : `No ${type} categories available`}</option>{matchingCategories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select>{matchingCategories.length === 0 && <span className="card-description">Add a {type} category in Manage categories first.</span>}</div>
          <div className="form-group full"><label className="form-label" htmlFor="date">Date</label><input id="date" name="date" type="date" className="field" defaultValue={initial?.date ?? localDateKey()} /></div>
          <div className="form-group full"><label className="form-label" htmlFor="description">Description <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label><textarea id="description" name="description" className="textarea-field" placeholder="Add a note about this transaction" defaultValue={initial?.description} /></div>
        </div>
        <div className="form-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary">Save {type}</button></div>
      </form>
    </section>
  </div>;
}
