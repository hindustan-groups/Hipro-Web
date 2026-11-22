"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Shield,
  User,
  Loader2,
  ArrowLeft,
  Users as UsersIcon,
  CheckCircle2,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    permissions: [] as string[],
  });

  const availableSections = [
    { key: "hero", label: "HiPRO · Hero CMS", group: "HiPRO Civil" },
    { key: "about", label: "HiPRO · About Page CMS", group: "HiPRO Civil" },
    { key: "projects", label: "HiPRO · Projects Portfolio", group: "HiPRO Civil" },
    { key: "services", label: "HiPRO · Services Catalog", group: "HiPRO Civil" },
    { key: "quotes", label: "HiPRO · Turnkey Quotes Hub", group: "HiPRO Civil" },
    { key: "cost-estimator", label: "HiPRO · Cost Estimator", group: "HiPRO Civil" },
    { key: "contacts", label: "HiPRO · Contact Inquiries", group: "HiPRO Civil" },
    { key: "blogs", label: "HiPRO · Blogs & Articles", group: "HiPRO Civil" },
    { key: "testimonials", label: "HiPRO · Client Reviews", group: "HiPRO Civil" },
    { key: "team", label: "HiPRO · Leadership Team", group: "HiPRO Civil" },
    { key: "applications", label: "HiPRO · Job Applications", group: "HiPRO Civil" },
    { key: "hbs", label: "HBS · Full Portal & Leads", group: "Hind Building" },
    { key: "empanelment", label: "Vendor Hub · Full Empanelment", group: "Vendor Hub" },
    { key: "automail", label: "AutoMail Studio", group: "Global Operations" },
    { key: "backup", label: "Database Backup Vault", group: "Holding Tools" },
    { key: "data-tools", label: "Data Import & Export", group: "Holding Tools" },
    { key: "api-keys", label: "API Keys & Secrets", group: "Holding Tools" },
  ];

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin-users", { credentials: "include" });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to load admin users", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTogglePermission = (key: string) => {
    setFormData((prev) => {
      if (prev.permissions.includes(key)) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== key) };
      } else {
        return { ...prev, permissions: [...prev.permissions, key] };
      }
    });
  };

  const handleSelectAllGroup = (group: string) => {
    const groupKeys = availableSections.filter((s) => s.group === group).map((s) => s.key);
    const allSelected = groupKeys.every((k) => formData.permissions.includes(k));

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !groupKeys.includes(p))
        : Array.from(new Set([...prev.permissions, ...groupKeys])),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({ name: "", email: "", password: "", role: "employee", permissions: [] });
        setToast({ message: "✓ New user created successfully in database!", type: "success" });
        fetchUsers();
      } else {
        const err = await res.json();
        setToast({ message: err.error || "Failed to create user", type: "error" });
      }
    } catch {
      setToast({ message: "Network error occurred while creating user", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete user account "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin-users/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setToast({ message: `User "${name}" deleted successfully.`, type: "success" });
        fetchUsers();
      } else {
        const err = await res.json();
        setToast({ message: err.error || "Failed to delete user", type: "error" });
      }
    } catch {
      setToast({ message: "Network error occurred while deleting user", type: "error" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_30px_rgba(15,23,42,0.03)] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors mb-3 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>← Back to Master Cockpit</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                  RBAC Security Matrix
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                  {users.length} Active Accounts
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight mt-0.5">
                Staff & Roles (RBAC)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage administrative user accounts, portal-level permissions, and security roles.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> <span>Add User Account</span></>}
        </button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* ── Add User Modal / Expandable Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-slate-200/90 shadow-lg p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                New User Account
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Configure Administrative User & Role
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Full Name *
              </label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. Ramesh Sharma"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="ramesh@hindustanprojects.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Initial Password *
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Access Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="employee">Staff / Officer (Scoped Permission Access)</option>
                <option value="admin">Super Admin (Unrestricted Full Holding Access)</option>
              </select>
            </div>
          </div>

          {/* Granular Section Permissions */}
          {formData.role === "employee" && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <label className="text-slate-800 text-xs font-bold uppercase tracking-wider block">
                    Assigned Portal Permissions (Scoped Access)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Select exactly which portals and modules this employee is authorized to view and modify.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableSections.map((section) => {
                  const isChecked = formData.permissions.includes(section.key);
                  return (
                    <label
                      key={section.key}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-500/20 text-blue-950 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(section.key)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <span className="text-xs truncate block">{section.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{section.group}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 inline-flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{submitting ? "Saving..." : "Create User Account"}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── Active User Accounts Table ── */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Registered Administrative Accounts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current database records authorized to access company administrative portals.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">Loading users from database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-mono">
                  <th className="px-6 py-3.5 font-bold">User Identity</th>
                  <th className="px-6 py-3.5 font-bold">Role Tier</th>
                  <th className="px-6 py-3.5 font-bold">Assigned Permissions</th>
                  <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0 shadow-2xs">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{user.name}</p>
                          <p className="text-slate-500 font-mono text-[11px]">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                          user.role === "admin"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}
                      >
                        {user.role === "admin" && <Shield className="w-3 h-3 text-amber-600" />}
                        <span>{user.role === "admin" ? "Master Admin" : "Staff"}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {user.role === "admin" ? (
                        <span className="text-slate-500 font-semibold font-mono text-[11px] bg-slate-100 px-2.5 py-1 rounded-md">
                          Full Unrestricted Access (All Portals)
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {(() => {
                            try {
                              const perms = Array.isArray(user.permissions)
                                ? user.permissions
                                : JSON.parse(user.permissions || "[]");
                              if (!perms.length) return <span className="text-slate-400">No scoped permissions</span>;
                              return perms.map((p: string) => (
                                <span
                                  key={p}
                                  className="bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] rounded font-mono border border-slate-200 capitalize"
                                >
                                  {p}
                                </span>
                              ));
                            } catch {
                              return <span className="text-slate-400">Custom</span>;
                            }
                          })()}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {user.email !== "admin@hindustanprojects.in" ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id, user.name)}
                          title="Delete user"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Protected Root</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
