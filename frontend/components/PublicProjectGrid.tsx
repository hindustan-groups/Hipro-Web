"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, Search, ArrowUpDown, Filter, Building } from "lucide-react";
import type { Project } from "@/lib/types";

const categoryColor: Record<string, string> = {
  Commercial: "text-black bg-slate-100 border border-slate-200",
  Residential: "text-construction-red bg-red-50 border border-red-100",
  Industrial: "text-slate-800 bg-slate-100 border border-slate-200",
};

export default function PublicProjectGrid({ projects = [] }: { projects: Project[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery]           = useState<string>("");
  const [sortBy, setSortBy]                     = useState<"newest" | "oldest" | "title">("newest");

  const categories = ["All", "Commercial", "Residential", "Industrial"];

  // Filter logic
  let filtered = (projects || []).filter((p) => {
    if (!p) return false;
    const cat = p.category || "Commercial";
    const title = p.title || "";
    const loc = p.location || "";
    const desc = p.description || "";
    const q = searchQuery.trim().toLowerCase();

    const matchesCategory = selectedCategory === "All" || cat.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !q ||
      title.toLowerCase().includes(q) ||
      loc.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // Sort logic
  filtered = [...filtered].sort((a, b) => {
    if (!a || !b) return 0;
    if (sortBy === "newest") {
      return (new Date(b.date || 0).getTime() || 0) - (new Date(a.date || 0).getTime() || 0);
    }
    if (sortBy === "oldest") {
      return (new Date(a.date || 0).getTime() || 0) - (new Date(b.date || 0).getTime() || 0);
    }
    if (sortBy === "title") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return 0;
  });

  const ongoingProjects   = filtered.filter((p) => p && (p.status === "active" || p.status === "ongoing"));
  const completedProjects = filtered.filter((p) => p && (p.status === "archived" || p.status === "completed"));

  return (
    <div>
      {/* Search, Category Filter & Sorting Bar */}
      <section className="bg-white py-8 px-4 border-b border-slate-200 shadow-sm sticky top-16 z-20 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-none text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                  selectedCategory === cat
                    ? "bg-black text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-construction-red hover:text-construction-red"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input & Sort Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-none pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-construction-navy/20 focus:border-construction-navy"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold uppercase tracking-wider text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

        </div>
      </section>

      {/* Ongoing Projects Section */}
      <section id="ongoing" className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-8">
            <h2 className="text-3xl font-bold text-black font-display uppercase tracking-tight">
              Ongoing <span className="text-construction-red">Projects</span> ({ongoingProjects.length})
            </h2>
          </div>

          {ongoingProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ongoingProjects.map((p, i) => (
                <Link
                  href={`/projects/${p.id}`}
                  key={p.id || i}
                  className="group rounded-none border border-slate-200/80 bg-white overflow-hidden hover:border-construction-red/40 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 flex flex-col hover:-translate-y-1"
                >
                  <div className="overflow-hidden h-60 relative">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none shadow-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Ongoing
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-none mb-3 ${categoryColor[p.category] || categoryColor.Commercial}`}>
                        {p.category}
                      </span>
                      <h3 className="text-xl font-bold text-black mb-2 font-display uppercase tracking-tight group-hover:text-construction-red transition-colors">{p.title}</h3>
                      <p className="text-xs text-slate-600 font-light mb-4 leading-relaxed line-clamp-2">{p.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-construction-red" />{p.location}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-black" />{p.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 font-light italic col-span-full py-8">No ongoing projects match the selected criteria.</p>
          )}
        </div>
      </section>

      {/* Completed Projects Section */}
      <section id="completed" className="py-16 bg-slate-50 px-4 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-8">
            <h2 className="text-3xl font-bold text-black font-display uppercase tracking-tight">
              Completed <span className="text-construction-red">Projects</span> ({completedProjects.length})
            </h2>
          </div>

          {completedProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedProjects.map((p, i) => (
                <Link
                  href={`/projects/${p.id}`}
                  key={p.id || i}
                  className="group rounded-none border border-slate-200/80 bg-white overflow-hidden hover:border-construction-red/40 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 flex flex-col hover:-translate-y-1"
                >
                  <div className="overflow-hidden h-60 relative">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none shadow-md">
                      Completed
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-none mb-3 ${categoryColor[p.category] || categoryColor.Commercial}`}>
                        {p.category}
                      </span>
                      <h3 className="text-xl font-bold text-black mb-2 font-display uppercase tracking-tight group-hover:text-construction-red transition-colors">{p.title}</h3>
                      <p className="text-xs text-slate-600 font-light mb-4 leading-relaxed line-clamp-2">{p.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-construction-red" />{p.location}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-black" />{p.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 font-light italic col-span-full py-8">No completed projects match the selected criteria.</p>
          )}
        </div>
      </section>
    </div>
  );
}
