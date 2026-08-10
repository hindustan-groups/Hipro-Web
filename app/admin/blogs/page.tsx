"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Plus, Trash2, Eye, EyeOff, Search } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import ImageUpload from "@/components/admin/ImageUpload";

const EMPTY: Omit<BlogPost, "id" | "createdAt" | "updatedAt"> = {
  title: "", excerpt: "", content: "", image: "", date: "", author: "Admin", category: "News", active: true,
  slug: "", metaTitle: "", metaDescription: "", keywords: "",
};

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/blogs");
      const json = await res.json();
      if (json.success) setBlogs(json.data);
      else setError(json.error || "Failed to load blogs");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) { setShowForm(false); setForm(EMPTY); fetchBlogs(); }
      else setError(json.error || "Failed to save");
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const deleteBlog = async (id?: string) => {
    if (!id || !confirm("Delete this blog post?")) return;
    try {
      await fetch(`/api/blogs`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchBlogs();
    } catch { /* silent */ }
  };

  const toggleActive = async (b: BlogPost) => {
    await fetch(`/api/blogs`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: b.id, active: !b.active }),
    });
    fetchBlogs();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={fetchBlogs} disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-none text-xs font-medium disabled:opacity-50 transition-colors shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-4 py-2 rounded-none text-sm font-semibold transition-colors shadow-md shadow-blue-900/20">
          <Plus className="w-4 h-4" /> Create Blog Post
        </button>
      </div>

      {error && <div className="p-4 rounded-none bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-none p-6 space-y-4">
          <h3 className="text-slate-900 font-bold text-lg">New Blog Post</h3>
          
          <div className="mb-4">
            <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Cover Image *</label>
            <ImageUpload 
              value={form.image} 
              onChange={(url) => setForm((p) => ({ ...p, image: url }))} 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Title *</label>
              <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Excerpt (Short Summary) *</label>
              <textarea required rows={2} value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Content *</label>
              <textarea required rows={5} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-mono" />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Category *</label>
              <input required value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g. Industry News"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Author</label>
              <input value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                placeholder="Admin"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
            
            <div className="md:col-span-2 pt-4 mt-2 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" /> SEO & Discovery Settings
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">URL Slug (Auto-generated if blank)</label>
                  <input value={form.slug || ""} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="e.g. latest-industry-trends"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-mono" />
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Meta Title</label>
                  <input value={form.metaTitle || ""} onChange={(e) => setForm((p) => ({ ...p, metaTitle: e.target.value }))}
                    placeholder="Custom SEO Title"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
                </div>
                <div>
                  <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Keywords (comma separated)</label>
                  <input value={form.keywords || ""} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))}
                    placeholder="construction, news, read my blogs"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Meta Description</label>
                  <textarea rows={2} value={form.metaDescription || ""} onChange={(e) => setForm((p) => ({ ...p, metaDescription: e.target.value }))}
                    placeholder="Search engine snippet text..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || !form.image}
              className="bg-construction-navy hover:bg-blue-800 text-white px-6 py-2 rounded-none text-sm font-semibold disabled:opacity-50 transition-colors shadow-md shadow-blue-900/20">
              {saving ? "Saving..." : "Publish Post"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-2 rounded-none text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3.5 font-semibold w-16">Image</th>
                <th className="px-5 py-3.5 font-semibold">Title</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold text-center">Published</th>
                <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded-none w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : blogs.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-500 py-16">No blog posts yet. Click &quot;Create Blog Post&quot; to write one.</td></tr>
              ) : (
                blogs.map((b) => (
                  <tr key={b.id} className={`transition-colors ${b.active === false ? "opacity-50 bg-slate-50/50" : "hover:bg-slate-50"}`}>
                    <td className="px-5 py-4">
                      {b.image ? (
                        <img src={b.image} alt={b.title} className="w-10 h-10 object-cover rounded-none" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 rounded-none" />
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div className="line-clamp-1">{b.title}</div>
                      <div className="text-xs text-slate-500 font-normal">{b.author}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600"><span className="px-2 py-1 bg-slate-100 rounded-none text-xs">{b.category}</span></td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{b.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <button onClick={() => toggleActive(b)} className={`w-8 h-8 rounded-none flex items-center justify-center transition-colors ${b.active !== false ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700"}`}>
                          {b.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <button onClick={() => deleteBlog(b.id)}
                          className="w-8 h-8 rounded-none bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 flex items-center justify-center transition-all shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium">{blogs.length} blog posts</div>
      </div>
    </div>
  );
}
