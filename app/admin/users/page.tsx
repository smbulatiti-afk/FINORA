"use client";

import { Plus, Search, Trash2, UserRoundPen } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { DashboardShell, RoleGuard } from "@/components/DashboardShell";
import { PageHeading, SearchInput } from "@/components/UI";
import { Pagination, usePagination } from "@/components/Pagination";
import { useApp } from "@/contexts/AppContext";
import { shortDate } from "@/lib/format";
import { confirmDelete, showAlert } from "@/lib/sweetalert";
import type { AppUser } from "@/types";

type UserFormValue = Pick<AppUser, "name" | "username" | "email"> & { password?: string; confirmPassword?: string };

function UserDialog({ initial, users, onClose, onSave }: { initial?: AppUser; users: AppUser[]; onClose: () => void; onSave: (value: UserFormValue) => Promise<void> }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const username = String(form.get("username") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    if (!name || !username || !email) { void showAlert("error", "Unable to save user", "Complete all fields to continue."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { void showAlert("error", "Unable to save user", "Enter a valid email address."); return; }
    if ((!initial && (username.toLowerCase() === "admin" || email.toLowerCase() === "admin@example.com")) || users.some((user) => user.id !== initial?.id && (user.username.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === email.toLowerCase()))) {
      void showAlert("error", "Unable to save user", "That email address or username is reserved or already in use.");
      return;
    }
    const profile = { name, username, email };
    if (initial) {
      void onSave(profile);
      return;
    }
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (password.length < 8 || password.length > 128) { void showAlert("error", "Unable to add user", "The initial password must be between 8 and 128 characters."); return; }
    if (password !== confirmPassword) { void showAlert("error", "Unable to add user", "The passwords do not match."); return; }
    void onSave({ ...profile, password, confirmPassword });
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
    <div className="modal-head"><h2 className="modal-title" id="user-modal-title">{initial ? "Edit user" : "Add a user"}</h2><button className="row-action" aria-label="Close dialog" onClick={onClose}>×</button></div>
    <form className="modal-form" noValidate onSubmit={submit}><div className="form-group"><label className="form-label" htmlFor="name">Full name</label><input id="name" name="name" className="field" defaultValue={initial?.name} /></div><div className="form-group"><label className="form-label" htmlFor="username">Username</label><input id="username" name="username" className="field" defaultValue={initial?.username} /></div><div className="form-group"><label className="form-label" htmlFor="email">Email address</label><input id="email" name="email" type="email" className="field" defaultValue={initial?.email} /></div>{!initial && <><div className="form-group"><label className="form-label" htmlFor="password">Initial password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} className="field" /></div><div className="form-group"><label className="form-label" htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} className="field" /></div></>}<div className="form-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit">{initial ? "Save changes" : "Add user"}</button></div></form>
  </section></div>;
}

function UsersContent() {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<AppUser | null | undefined>(undefined);
  const visibleUsers = useMemo(() => users.filter((user) => {
    const matchesQuery = `${user.name} ${user.username} ${user.email}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "all" || user.role === filter);
  }), [filter, query, users]);
  const pagination = usePagination(visibleUsers.length, JSON.stringify([query, filter]));
  const pageUsers = visibleUsers.slice(pagination.offset, pagination.offset + pagination.limit);
  async function save(user: UserFormValue) {
    try {
      if (selected) {
        await updateUser({ ...selected, name: user.name, username: user.username, email: user.email });
      } else {
        if (!user.password || !user.confirmPassword) throw new Error("An initial password is required to add a user.");
        await addUser({ name: user.name, username: user.username, email: user.email, password: user.password, confirmPassword: user.confirmPassword });
      }
      await showAlert("success", selected ? "User updated" : "User added", `${user.name}'s account was ${selected ? "updated" : "added"} successfully.`);
      setSelected(undefined);
    } catch (error) {
      await showAlert("error", selected ? "Unable to update user" : "Unable to add user", error instanceof Error ? error.message : "The user could not be saved.");
    }
  }
  async function removeUser(user: AppUser) {
    if (!(await confirmDelete("Delete user?", `Delete ${user.name} and their transactions?`))) return;
    deleteUser(user.id);
    void showAlert("success", "User deleted", `${user.name} and their transactions were deleted.`);
  }
  return <RoleGuard role="admin"><DashboardShell role="admin" title="Users">
    <PageHeading eyebrow="ADMINISTRATION" title="Manage users" description="View and maintain accounts across your platform." action={<button className="btn btn-primary" onClick={() => setSelected(null)}><Plus size={16} />Add user</button>} />
    <section className="card table-card">
      <div className="table-toolbar"><div><div className="card-title">All users <span style={{ color: "var(--muted)", fontWeight: 400 }}>({users.length})</span></div><div className="card-description">{visibleUsers.length} matching the current search and role</div></div><div className="filters"><SearchInput value={query} onChange={setQuery} placeholder="Search users" /><select className="select-field" aria-label="Filter users by role" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All roles</option><option value="user">Users</option><option value="admin">Admins</option></select></div></div>
      <div className="table-wrap"><table><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Status</th><th /></tr></thead><tbody>
        {pageUsers.map((user) => <tr key={user.id}><td><div className="person-cell"><div className="person-avatar">{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><div className="person-name">{user.name}</div><div className="person-email">{user.email}</div></div></div></td><td>@{user.username}</td><td><span className="pill">{user.role === "admin" ? "Admin" : "User"}</span></td><td>{shortDate(user.joinedAt)}</td><td><span className="pill income">Active</span></td><td><div className="row-actions"><button className="row-action" aria-label={`Edit ${user.name}`} onClick={() => setSelected(user)}><UserRoundPen size={15} /></button><button className="row-action" aria-label={`Delete ${user.name}`} onClick={() => void removeUser(user)}><Trash2 size={15} /></button></div></td></tr>)}
      </tbody></table>{visibleUsers.length === 0 && <div className="empty-state">{users.length === 0 ? "No registered users yet." : "No users match your search."}</div>}</div>
      <Pagination {...pagination} />
    </section>
    {selected !== undefined && <UserDialog initial={selected ?? undefined} users={users} onClose={() => setSelected(undefined)} onSave={save} />}
  </DashboardShell></RoleGuard>;
}

export default function AdminUsersPage() { return <UsersContent />; }
