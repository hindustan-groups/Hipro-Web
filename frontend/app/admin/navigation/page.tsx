"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import Navbar from "@/components/Navbar";

const defaultNavLinks = [
  { href: "/", label: "Home", isMegaMenu: false },
  { href: "/about", label: "About Us", isMegaMenu: false },
  { 
    href: "/services", 
    label: "Services", 
    isMegaMenu: true,
    megaMenuImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=75",
    megaMenuTitle: "Turnkey Construction & Engineering",
    megaMenuSubtitle: "Delivering visionary architectural blueprints, BIM modeling, and master infrastructure execution across India.",
    megaMenuLink: "/services",
    megaMenuCategories: [],
  },
  { href: "/projects", label: "Projects", isMegaMenu: false },
  { href: "/careers", label: "Careers", isMegaMenu: false },
  { href: "/contact", label: "Contact", isMegaMenu: false },
];

export default function AdminNavigation() {
  const [navConfig, setNavConfig] = useState<any[]>(defaultNavLinks);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((res) => res.json()).catch(() => ({})),
      fetch("/api/services").then((res) => res.json()).catch(() => ({})),
    ]).then(([settingsRes, servicesRes]) => {
      if (settingsRes.success && settingsRes.data?.navigationConfig) {
        try {
          const parsed = JSON.parse(settingsRes.data.navigationConfig);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNavConfig(parsed);
          }
        } catch (e) {
          setNavConfig(defaultNavLinks);
        }
      }
      if (servicesRes.success && Array.isArray(servicesRes.data)) {
        setServices(servicesRes.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navigationConfig: JSON.stringify(navConfig) }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Navigation saved successfully!");
      } else {
        setMessage("Error saving navigation.");
      }
    } catch (e) {
      setMessage("Network error");
    }
    setSaving(false);
  };

  const addTopLevelLink = () => {
    setNavConfig([...navConfig, { href: "/", label: "New Link", isMegaMenu: false }]);
  };

  const removeTopLevelLink = (index: number) => {
    const updated = [...navConfig];
    updated.splice(index, 1);
    setNavConfig(updated);
  };

  const updateTopLevelLink = (index: number, field: string, value: any) => {
    const updated = [...navConfig];
    updated[index][field] = value;
    setNavConfig(updated);
  };

  // Mega Menu Handlers
  const addCategory = (linkIndex: number) => {
    const updated = [...navConfig];
    if (!updated[linkIndex].megaMenuCategories) {
      updated[linkIndex].megaMenuCategories = [];
    }
    updated[linkIndex].megaMenuCategories.push({ title: "New Category", links: [] });
    setNavConfig(updated);
  };

  const removeCategory = (linkIndex: number, catIndex: number) => {
    const updated = [...navConfig];
    updated[linkIndex].megaMenuCategories.splice(catIndex, 1);
    setNavConfig(updated);
  };

  const updateCategoryTitle = (linkIndex: number, catIndex: number, title: string) => {
    const updated = [...navConfig];
    updated[linkIndex].megaMenuCategories[catIndex].title = title;
    setNavConfig(updated);
  };

  const addSubLink = (linkIndex: number, catIndex: number) => {
    const updated = [...navConfig];
    updated[linkIndex].megaMenuCategories[catIndex].links.push({ href: "/", label: "Sub Link" });
    setNavConfig(updated);
  };

  const removeSubLink = (linkIndex: number, catIndex: number, subIndex: number) => {
    const updated = [...navConfig];
    updated[linkIndex].megaMenuCategories[catIndex].links.splice(subIndex, 1);
    setNavConfig(updated);
  };

  const updateSubLink = (linkIndex: number, catIndex: number, subIndex: number, field: string, value: string) => {
    const updated = [...navConfig];
    updated[linkIndex].megaMenuCategories[catIndex].links[subIndex][field] = value;
    setNavConfig(updated);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Navigation Menu Builder</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your header links and mega menus dynamically.</p>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className="text-sm font-semibold text-green-600">{message}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-construction-navy hover:bg-blue-800 text-white px-6 py-2.5 rounded-none-none text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Navigation
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-slate-100 p-8 rounded-none-none border border-slate-200 shadow-inner">
        <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Live Preview</h3>
        <div className="pointer-events-auto z-50">
          <Navbar navConfigString={JSON.stringify(navConfig)} previewMode={true} services={services} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-6">
        <div className="space-y-6">
          {navConfig.map((link, i) => (
            <div key={i} className="border border-slate-200 bg-slate-50 p-4 relative">
              <button onClick={() => removeTopLevelLink(i)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="flex gap-4 items-start w-full pr-12">
                <div className="w-1/3">
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Label</label>
                  <input
                    value={link.label}
                    onChange={(e) => updateTopLevelLink(i, "label", e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-construction-navy"
                  />
                </div>
                {!link.isMegaMenu && (
                  <div className="w-1/3">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">URL Route</label>
                    <input
                      value={link.href}
                      onChange={(e) => updateTopLevelLink(i, "href", e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-construction-navy"
                    />
                  </div>
                )}
                <div className="w-1/3 flex items-center pt-6 gap-2">
                  <input
                    type="checkbox"
                    checked={link.isMegaMenu}
                    onChange={(e) => updateTopLevelLink(i, "isMegaMenu", e.target.checked)}
                    className="w-4 h-4 text-construction-navy focus:ring-construction-navy border-slate-300"
                  />
                  <label className="text-sm font-bold text-slate-700">Is Mega Menu?</label>
                </div>
              </div>

              {/* Mega Menu Editor */}
              {link.isMegaMenu && (
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Mega Menu Title (Right Side)</label>
                      <input
                        value={link.megaMenuTitle || ""}
                        onChange={(e) => updateTopLevelLink(i, "megaMenuTitle", e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-construction-navy"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Mega Menu Subtitle / Link</label>
                      <input
                        value={link.megaMenuSubtitle || ""}
                        onChange={(e) => updateTopLevelLink(i, "megaMenuSubtitle", e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-construction-navy"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Featured Banner Image (Right-Side Mega Menu)</label>
                      <ImageUpload value={link.megaMenuImage || ""} onChange={(url) => updateTopLevelLink(i, "megaMenuImage", url)} />
                      <input
                        value={link.megaMenuImage || ""}
                        onChange={(e) => updateTopLevelLink(i, "megaMenuImage", e.target.value)}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-construction-navy mt-2"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">Categories & Links</h4>
                      <button onClick={() => addCategory(i)} className="text-sm font-semibold text-construction-navy hover:text-blue-800 flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Category
                      </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-4">
                      {link.megaMenuCategories?.map((cat: any, cIdx: number) => (
                        <div key={cIdx} className="bg-white border border-slate-200 p-4 relative">
                          <button onClick={() => removeCategory(i, cIdx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <input
                            value={cat.title}
                            onChange={(e) => updateCategoryTitle(i, cIdx, e.target.value)}
                            className="w-full font-bold text-slate-900 mb-4 border-b border-transparent hover:border-slate-300 focus:border-construction-navy focus:outline-none bg-transparent"
                            placeholder="Category Title"
                          />
                          
                          <div className="space-y-2">
                            {cat.links?.map((subLink: any, sIdx: number) => (
                              <div key={sIdx} className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-slate-300 cursor-move" />
                                <input
                                  value={subLink.label}
                                  onChange={(e) => updateSubLink(i, cIdx, sIdx, "label", e.target.value)}
                                  placeholder="Label"
                                  className="w-1/2 bg-slate-50 border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy"
                                />
                                <input
                                  value={subLink.href}
                                  onChange={(e) => updateSubLink(i, cIdx, sIdx, "href", e.target.value)}
                                  placeholder="URL"
                                  className="w-1/2 bg-slate-50 border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy"
                                />
                                <button onClick={() => removeSubLink(i, cIdx, sIdx)} className="text-slate-400 hover:text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <button onClick={() => addSubLink(i, cIdx)} className="text-xs font-bold text-slate-500 hover:text-construction-navy flex items-center gap-1 mt-3">
                            <Plus className="w-3 h-3" /> Add Link
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addTopLevelLink}
            className="w-full border-2 border-dashed border-slate-300 hover:border-construction-navy hover:text-construction-navy text-slate-500 font-bold py-6 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Top-Level Link
          </button>
        </div>
      </div>
    </div>
  );
}
