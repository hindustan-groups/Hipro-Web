"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Plus, Trash2, Eye, EyeOff, Edit } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import DynamicIcon from "@/components/DynamicIcon";
import { Service, Guarantee } from "@/lib/types";

const EMPTY_SERVICE: Omit<Service, "id" | "createdAt"> = {
  title: "", description: "", category: "Design & Planning", icon: "Wrench", image: "", order: 99, active: true, features: []
};

const EMPTY_GUARANTEE: Omit<Guarantee, "id" | "createdAt"> = {
  badge: "", title: "", description: "", bg: "bg-construction-navy", accent: "text-blue-200", image: "", hasShield: false, order: 99, active: true,
};

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState<"services" | "guarantees">("services");
  
  const [services, setServices] = useState<Service[]>([]);
  const [guarantees, setGuarantees] = useState<Guarantee[]>([]);
  
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Forms
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);
  const [guaranteeForm, setGuaranteeForm] = useState(EMPTY_GUARANTEE);

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const [resS, resG] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/guarantees")
      ]);
      const [jsonS, jsonG] = await Promise.all([resS.json(), resG.json()]);
      
      if (jsonS.success) setServices(jsonS.data);
      if (jsonG.success) setGuarantees(jsonG.data);
    } catch { setError("Network error"); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Handlers
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = "/api/services";
      const method = editingServiceId ? "PATCH" : "POST";
      const body = editingServiceId ? { id: editingServiceId, ...serviceForm } : serviceForm;
      
      const res  = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body) 
      });
      const json = await res.json();
      if (json.success) { 
        setShowForm(false); 
        setServiceForm(EMPTY_SERVICE); 
        setEditingServiceId(null); 
        fetchData(); 
      } else {
        setError(json.error || "Failed to save");
      }
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const startEditService = (service: Service) => {
    setEditingServiceId(service.id || null);
    
    let featuresList: string[] = [];
    try {
      featuresList = typeof service.features === "string" 
        ? JSON.parse(service.features) 
        : (Array.isArray(service.features) ? service.features : []);
    } catch {
      featuresList = [];
    }

    setServiceForm({
      title: service.title,
      description: service.description,
      category: service.category || "Design & Planning",
      icon: service.icon || "Wrench",
      image: service.image || "",
      order: service.order ?? 99,
      active: service.active !== false,
      features: featuresList,
    });
    
    setActiveTab("services");
    setShowForm(true);
  };

  const handleGuaranteeSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res  = await fetch("/api/guarantees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(guaranteeForm) });
      const json = await res.json();
      if (json.success) { setShowForm(false); setGuaranteeForm(EMPTY_GUARANTEE); fetchData(); }
      else setError(json.error || "Failed to save");
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const deleteItem = async (type: "services" | "guarantees", id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await fetch(`/api/${type}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      fetchData();
    } catch { /* silent */ }
  };

  const toggleActive = async (type: "services" | "guarantees", item: any) => {
    await fetch(`/api/${type}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, active: !item.active }) });
    fetchData();
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button onClick={() => { setActiveTab("services"); setShowForm(false); setError(""); }} className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "services" ? "border-construction-red text-construction-red" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
          Core Services
        </button>
        <button onClick={() => { setActiveTab("guarantees"); setShowForm(false); setError(""); }} className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "guarantees" ? "border-construction-red text-construction-red" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
          Guarantees
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-none-none text-xs font-medium disabled:opacity-50 transition-colors shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
        <button onClick={() => { setEditingServiceId(null); setServiceForm(EMPTY_SERVICE); setShowForm(!showForm || editingServiceId !== null); }}
          className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-4 py-2 rounded-none-none text-sm font-semibold transition-colors shadow-md shadow-blue-900/20">
          <Plus className="w-4 h-4" /> Add {activeTab === "services" ? "Service" : "Guarantee"}
        </button>
      </div>

      {error && <div className="p-4 rounded-none-none bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}

      {/* Forms */}
      {showForm && activeTab === "services" && (
        <form onSubmit={handleServiceSubmit} className="bg-white border border-slate-200 shadow-sm rounded-none-none p-6 space-y-4">
          <h3 className="text-slate-900 font-bold text-lg">{editingServiceId ? "Edit Service" : "New Service"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Title</label>
              <input required value={serviceForm.title} onChange={(e) => setServiceForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Category</label>
              <select required value={serviceForm.category} onChange={(e) => setServiceForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all">
                <option value="Design & Planning">Design & Planning</option>
                <option value="Construction & Execution">Construction & Execution</option>
                <option value="Management & Specialized">Management & Specialized</option>
              </select>
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Icon (Lucide Name)</label>
              <div className="relative flex items-center">
                <input required value={serviceForm.icon} onChange={(e) => setServiceForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="e.g. HardHat, Wrench, Building"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all font-mono" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-none-none bg-slate-100 border border-slate-200 flex items-center justify-center text-construction-navy pointer-events-none shadow-sm">
                  <DynamicIcon name={serviceForm.icon || "HelpCircle"} className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Image</label>
              <ImageUpload value={serviceForm.image} onChange={(url) => setServiceForm((p) => ({ ...p, image: url }))} />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Order Index</label>
              <input type="number" required value={serviceForm.order} onChange={(e) => setServiceForm((p) => ({ ...p, order: parseInt(e.target.value) || 99 }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
          </div>
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Description</label>
            <textarea required rows={3} value={serviceForm.description} onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-none transition-all" />
          </div>
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Features (Capabilities) - One per line</label>
            <textarea rows={4} value={serviceForm.features ? serviceForm.features.join('\n') : ''} onChange={(e) => setServiceForm((p) => ({ ...p, features: e.target.value.split('\n').filter(f => f.trim() !== '') }))}
              placeholder="e.g. 3D Building Information Modeling (BIM)"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-none transition-all" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-construction-navy hover:bg-blue-800 text-white px-6 py-2 rounded-none-none text-sm font-semibold disabled:opacity-50">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingServiceId(null); setServiceForm(EMPTY_SERVICE); }} className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-none-none text-sm font-semibold">Cancel</button>
          </div>
        </form>
      )}

      {showForm && activeTab === "guarantees" && (
        <form onSubmit={handleGuaranteeSubmit} className="bg-white border border-slate-200 shadow-sm rounded-none-none p-6 space-y-4">
          <h3 className="text-slate-900 font-bold text-lg">New Guarantee</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {(["title", "badge", "bg", "accent"] as const).map((field) => (
              <div key={field}>
                <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">{field}</label>
                <input required value={guaranteeForm[field as keyof typeof guaranteeForm] as string} onChange={(e) => setGuaranteeForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
              </div>
            ))}
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Has Shield Icon</label>
              <select value={guaranteeForm.hasShield ? "yes" : "no"} onChange={(e) => setGuaranteeForm(p => ({ ...p, hasShield: e.target.value === "yes" }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all">
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Order Index</label>
              <input type="number" required value={guaranteeForm.order} onChange={(e) => setGuaranteeForm((p) => ({ ...p, order: parseInt(e.target.value) || 99 }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Image</label>
              <ImageUpload value={guaranteeForm.image} onChange={(url) => setGuaranteeForm((p) => ({ ...p, image: url }))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-500 text-xs uppercase tracking-wider block mb-1 font-medium">Description</label>
              <textarea required rows={3} value={guaranteeForm.description} onChange={(e) => setGuaranteeForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy resize-none transition-all" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-construction-navy hover:bg-blue-800 text-white px-6 py-2 rounded-none-none text-sm font-semibold disabled:opacity-50">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-none-none text-sm font-semibold">Cancel</button>
          </div>
        </form>
      )}

      {/* Tables */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-none-none overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "services" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5 font-semibold">Service</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Category</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Icon</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Order</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Active</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={6} className="px-5 py-4"><div className="h-10 bg-slate-100 rounded-none-none" /></td></tr>)
                ) : services.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-slate-500 py-16">No services yet.</td></tr>
                ) : (
                  services.map((s) => (
                    <tr key={s.id} className={`transition-colors ${s.active === false ? "opacity-50 bg-slate-50/50" : "hover:bg-slate-50"}`}>
                      <td className="px-5 py-4"><p className="text-slate-900 font-semibold">{s.title}</p></td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{s.category || "Design & Planning"}</td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono">
                          <DynamicIcon name={s.icon} className="w-3.5 h-3.5 text-construction-navy" />
                          <span>{s.icon}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{s.order}</td>
                      <td className="px-5 py-4"><button onClick={() => toggleActive("services", s)} className={`w-8 h-8 rounded-none-none flex items-center justify-center ${s.active !== false ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-50 border border-slate-200 text-slate-400"}`}>{s.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => startEditService(s)} className="w-8 h-8 rounded-none-none bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200" title="Edit Service">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => deleteItem("services", s.id as string)} className="w-8 h-8 rounded-none-none text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 flex items-center justify-center" title="Delete Service">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5 font-semibold">Guarantee</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Badge</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Order</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Active</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-5 py-4"><div className="h-10 bg-slate-100 rounded-none-none" /></td></tr>)
                ) : guarantees.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-slate-500 py-16">No guarantees yet.</td></tr>
                ) : (
                  guarantees.map((g) => (
                    <tr key={g.id} className={`transition-colors ${g.active === false ? "opacity-50 bg-slate-50/50" : "hover:bg-slate-50"}`}>
                      <td className="px-5 py-4"><p className="text-slate-900 font-semibold">{g.title}</p></td>
                      <td className="px-5 py-4"><span className="text-xs bg-slate-100 px-2 py-1 rounded-none-none">{g.badge}</span></td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{g.order}</td>
                      <td className="px-5 py-4"><button onClick={() => toggleActive("guarantees", g)} className={`w-8 h-8 rounded-none-none flex items-center justify-center ${g.active !== false ? "bg-green-100 text-green-700" : "bg-slate-50 text-slate-400"}`}>{g.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button></td>
                      <td className="px-5 py-4"><button onClick={() => deleteItem("guarantees", g.id as string)} className="w-8 h-8 rounded-none-none text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium">
          {activeTab === "services" ? services.length : guarantees.length} items
        </div>
      </div>
    </div>
  );
}
