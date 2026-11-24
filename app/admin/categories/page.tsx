"use client";

import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { DashboardShell, RoleGuard } from "@/components/DashboardShell";
import { PageHeading } from "@/components/UI";
import { Pagination, usePagination } from "@/components/Pagination";
import { useApp } from "@/contexts/AppContext";
import { confirmDelete, showAlert } from "@/lib/sweetalert";
import type { Category } from "@/types";

function CategoryDialog({ initial, onClose, onSave }: { initial?: Category; onClose: () => void; onSave: (category: Omit<Category, "id">) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const type = form.get("type");
    if (!name) { void showAlert("error", "Unable to save category", "Enter a category name."); return; }
    if (type !== "income" && type !== "expense") { void showAlert("error", "Unable to save category", "Select whether this category is for income or expense."); return; }
    onSave({ name, color: String(form.get("color") ?? "#476c56"), type });
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="category-title"><div className="modal-head"><h2 className="modal-title" id="category-title">{initial ? "Edit category" : "New category"}</h2><button className="row-action" aria-label="Close dialog" onClick={onClose}>×</button></div><form className="modal-form" onSubmit={submit}><div className="form-group"><label className="form-label" htmlFor="name">Category name</label><input id="name" name="name" className="field" defaultValue={initial?.name} /></div><div className="form-group"><label className="form-label" htmlFor="type">Category for</label><select id="type" name="type" className="select-field" defaultValue={initial?.type ?? "expense"}><option value="income">Income</option><option value="expense">Expense</option></select></div><div className="form-group"><label className="form-label" htmlFor="color">Category color</label><input id="color" name="color" type="color" className="field" defaultValue={initial?.color ?? "#476c56"} style={{ height: 40, padding: 4 }} /></div><div className="form-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary">Save category</button></div></form></section></div>;
}

function CategoryContent() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [selected, setSelected] = useState<Category | null | undefined>(undefined);
  const pagination = usePagination(categories.length);
  const pageCategories = categories.slice(pagination.offset, pagination.offset + pagination.limit);
  function save(category: Omit<Category, "id">) {
    if (selected) updateCategory({ ...selected, ...category });
    else addCategory(category);
    void showAlert("success", selected ? "Category updated" : "Category added", `${category.name} was ${selected ? "updated" : "added"} successfully for ${category.type}.`);
    setSelected(undefined);
  }
  async function removeCategory(category: Category) {
    if (!(await confirmDelete("Delete category?", `Delete ${category.name}? Existing transactions will keep their category text.`))) return;
    deleteCategory(category.id);
    void showAlert("success", "Category deleted", `${category.name} was deleted successfully.`);
  }
  return <RoleGuard role="admin"><DashboardShell role="admin" title="Categories"><PageHeading eyebrow="ADMINISTRATION" title="Manage categories" description="Keep spending organized with clear, useful categories." action={<button className="btn btn-primary" onClick={() => setSelected(null)}><Plus size={16} />Add category</button>} />
    <div className="grid category-grid">{pageCategories.map((category) => <section className="card category-card" key={category.id}><div className="category-swatch" style={{ background: category.color }} /><div className="category-name">{category.name}</div><span className={`pill ${category.type}`}>{category.type === "income" ? "Income" : "Expense"}</span><button className="row-action" aria-label={`Edit ${category.name}`} onClick={() => setSelected(category)}><Pencil size={15} /></button><button className="row-action" aria-label={`Delete ${category.name}`} onClick={() => void removeCategory(category)}><Trash2 size={15} /></button></section>)}</div>
    <Pagination {...pagination} />
    {categories.length === 0 && <div className="card empty-state"><Tags size={22} style={{ marginBottom: 8 }} /><div>No categories yet. Add one to get started.</div></div>}
    {selected !== undefined && <CategoryDialog initial={selected ?? undefined} onClose={() => setSelected(undefined)} onSave={save} />}
  </DashboardShell></RoleGuard>;
}
export default function AdminCategoriesPage() { return <CategoryContent />; }
