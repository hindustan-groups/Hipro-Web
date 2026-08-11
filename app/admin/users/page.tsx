"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Shield, User, Loader2 } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    permissions: [] as string[],
  });

  const availableSections = [
    { key: "hero", label: "Hero Section" },
    { key: "about", label: "About Page" },
    { key: "contacts", label: "Contacts" },
    { key: "quotes", label: "Quote Requests" },
    { key: "projects", label: "Projects" },
    { key: "services", label: "Services" },
    { key: "testimonials", label: "Testimonials" },
    { key: "team", label: "Team" },
    { key: "newsletter", label: "Newsletter" },
    { key: "blogs", label: "Blogs" },
    { key: "stats", label: "Stats" },
    { key: "applications", label: "Job Applications" },
    { key: "jobs", label: "Job Postings" }
  ];

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin-users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: "", email: "", password: "", role: "employee", permissions: [] });
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create user");
      }
    } catch (error) {
      alert("Error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin-users/${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
      else alert("Failed to delete user");
    } catch (e) {
      alert("Error occurred");
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display uppercase tracking-tight">Users & Roles</h2>
          <p className="text-slate-500 text-sm mt-1">Manage admin access and employee permissions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-construction-navy hover:bg-slate-800 text-white px-5 py-2.5 rounded-none-none text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add User</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 border border-slate-200 shadow-sm mb-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Full Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="john@hindustan.com" />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Password</label>
              <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1.5 font-bold">Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                <option value="employee">Employee (Limited Access)</option>
                <option value="admin">Master Admin (Full Access)</option>
              </select>
            </div>
          </div>

          {formData.role === "employee" && (
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-3 font-bold">Employee Permissions (Allowed Sections)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100">
                {availableSections.map(section => (
                  <label key={section.key} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={formData.permissions.includes(section.key)}
                      onChange={() => handleTogglePermission(section.key)}
                      className="w-4 h-4 border-slate-300 text-construction-red focus:ring-construction-red rounded-none-none"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-black transition-colors">{section.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button disabled={submitting} type="submit" className="bg-construction-red hover:bg-red-700 text-white px-8 py-3 rounded-none-none text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50">
              {submitting ? "Saving..." : "Create User"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Permissions</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none-none bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {user.role === "admin" ? <Shield className="w-5 h-5 text-amber-500" /> : <User className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      user.role === "admin" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === "admin" ? (
                      <span className="text-slate-400 text-xs">Full Access</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          try {
                            const perms = JSON.parse(user.permissions);
                            if (!perms.length) return <span className="text-slate-400 text-xs">No access</span>;
                            return perms.map((p: string) => (
                              <span key={p} className="bg-slate-100 text-slate-600 px-2 py-0.5 text-xs rounded-none-none border border-slate-200 capitalize">
                                {p}
                              </span>
                            ));
                          } catch (e) {
                            return <span className="text-slate-400 text-xs">Invalid</span>;
                          }
                        })()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
