"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2, GripVertical, RefreshCw, EyeOff, Eye } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { HeroSlide } from "@/lib/types";

export default function AdminHero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // New slide form state
  const [isAdding, setIsAdding] = useState(false);
  const [newSlide, setNewSlide] = useState<Partial<HeroSlide>>({
    tagline: "", title: "", subtitle: "", image: "", order: 0, active: true
  });

  const fetchSlides = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/hero");
      const json = await res.json();
      if (json.success) setSlides(json.data);
      else setError(json.error || "Failed to load slides");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleSaveNew = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSlide, order: slides.length + 1 })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess("Slide added successfully");
        setIsAdding(false);
        setNewSlide({ tagline: "", title: "", subtitle: "", image: "", order: 0, active: true });
        fetchSlides();
      } else {
        setError(json.error || "Failed to add slide");
      }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (id: string, updates: Partial<HeroSlide>) => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess("Slide updated successfully");
        fetchSlides();
      } else {
        setError(json.error || "Failed to update slide");
      }
    } catch { setError("Network error"); }
    finally { setSaving(false); setEditingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/hero?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSuccess("Slide deleted successfully");
        fetchSlides();
      } else {
        setError(json.error || "Failed to delete slide");
      }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 font-bold text-2xl">Hero Section</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage the slides on the homepage hero section.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchSlides} disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-none text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-4 py-2 rounded-none text-sm font-bold transition-colors shadow-sm shadow-blue-900/20">
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-none bg-red-50 border border-red-100 text-red-600 text-sm font-medium">{error}</div>}
      {success && <div className="p-4 rounded-none bg-green-50 border border-green-100 text-green-700 text-sm font-medium">{success}</div>}

      {/* Add New Slide Form */}
      {isAdding && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-none p-6 mb-6">
          <h3 className="text-slate-900 font-bold mb-4">Add New Slide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Tagline</label>
                <input type="text" value={newSlide.tagline} onChange={e => setNewSlide({...newSlide, tagline: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20"
                  placeholder="e.g., WELCOME TO HINDUSTAN PROJECTS" />
              </div>
              <div>
                <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Main Title</label>
                <input type="text" value={newSlide.title} onChange={e => setNewSlide({...newSlide, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20"
                  placeholder="e.g., Building Infrastructure." />
              </div>
              <div>
                <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Subtitle</label>
                <textarea value={newSlide.subtitle} onChange={e => setNewSlide({...newSlide, subtitle: e.target.value})} rows={3}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 resize-none"
                  placeholder="e.g., We are committed to building sustainable..." />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Background Image</label>
              <div className="bg-slate-50 border border-slate-200 rounded-none p-4">
                <ImageUpload value={newSlide.image || ""} onChange={(url) => setNewSlide({...newSlide, image: url})} />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSaveNew} disabled={saving}
              className="bg-construction-navy hover:bg-blue-800 text-white px-6 py-2.5 rounded-none text-sm font-bold transition-colors shadow-sm disabled:opacity-50">
              {saving ? "Saving..." : "Save Slide"}
            </button>
            <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 rounded-none text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Slides */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2].map(i => <div key={i} className="h-32 bg-white border border-slate-200 shadow-sm rounded-none" />)}
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-none p-12 text-center">
          <p className="text-slate-500 font-medium">No slides found. Click "Add Slide" to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide) => (
            <div key={slide.id} className="bg-white border border-slate-200 shadow-sm rounded-none p-6 transition-shadow hover:shadow-md">
              {editingId === slide.id ? (
                // Edit Mode
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Tagline</label>
                      <input type="text" defaultValue={slide.tagline} id={`tagline-${slide.id}`}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20" />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Title</label>
                      <input type="text" defaultValue={slide.title} id={`title-${slide.id}`}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20" />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Subtitle</label>
                      <textarea defaultValue={slide.subtitle} id={`subtitle-${slide.id}`} rows={3}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-construction-navy/20 resize-none" />
                    </div>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                        <input type="checkbox" defaultChecked={slide.active} id={`active-${slide.id}`} className="rounded-none border-slate-300 text-construction-navy focus:ring-construction-navy" />
                        Active Slide
                      </label>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <span>Order:</span>
                        <input type="number" defaultValue={slide.order} id={`order-${slide.id}`} className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-none text-center" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-slate-500 text-[10px] uppercase tracking-widest font-bold block mb-1">Background Image</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-none p-4">
                      {/* We use a slight hack here: since ImageUpload manages its own state and passes via onChange,
                          to keep this form simple without a complex state object for editing, we can just use a local state wrapper or 
                          just use the existing slide.image and listen for changes. For simplicity, we'll use a local state variable in a separate component or just update directly.
                          Actually, let's just make the image upload update the slide immediately or wait for save.
                       */}
                       <ImageUpload value={slide.image} onChange={(url) => {
                          const imgInput = document.getElementById(`image-${slide.id}`) as HTMLInputElement;
                          if (imgInput) imgInput.value = url;
                       }} />
                       <input type="hidden" id={`image-${slide.id}`} defaultValue={slide.image} />
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                      <button onClick={() => setEditingId(null)} className="px-5 py-2 rounded-none text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors">
                        Cancel
                      </button>
                      <button onClick={() => {
                        const tagline = (document.getElementById(`tagline-${slide.id}`) as HTMLInputElement).value;
                        const title = (document.getElementById(`title-${slide.id}`) as HTMLInputElement).value;
                        const subtitle = (document.getElementById(`subtitle-${slide.id}`) as HTMLTextAreaElement).value;
                        const image = (document.getElementById(`image-${slide.id}`) as HTMLInputElement).value;
                        const active = (document.getElementById(`active-${slide.id}`) as HTMLInputElement).checked;
                        const order = parseInt((document.getElementById(`order-${slide.id}`) as HTMLInputElement).value);
                        handleUpdate(slide.id!, { tagline, title, subtitle, image, active, order });
                      }} disabled={saving}
                        className="bg-construction-navy hover:bg-blue-800 text-white px-6 py-2 rounded-none text-sm font-bold transition-colors shadow-sm disabled:opacity-50">
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Info */}
                  <div className="flex-1 flex gap-4">
                    <div className="w-8 flex flex-col items-center justify-center text-slate-300">
                      <GripVertical className="w-5 h-5" />
                      <span className="text-xs font-bold mt-1">{slide.order}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-construction-navy bg-blue-50 px-2 py-0.5 rounded-none border border-blue-100">
                          {slide.tagline}
                        </span>
                        {!slide.active && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-none border border-amber-200">
                            <EyeOff className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{slide.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{slide.subtitle}</p>
                    </div>
                  </div>
                  
                  {/* Right: Image & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 md:w-64 shrink-0">
                    <div className="w-24 h-16 rounded-none border border-slate-200 overflow-hidden bg-slate-100 relative">
                      {slide.image && (
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingId(slide.id!)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-construction-navy bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-none transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(slide.id!)}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-none transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
