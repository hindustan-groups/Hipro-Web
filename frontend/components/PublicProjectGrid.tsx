"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  MapPin,
  Calendar,
  Building,
  Ruler,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Star,
  Tag,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import type { Project } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";

interface PublicProjectGridProps {
  projects?: Project[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Commercial: "text-blue-900 bg-blue-50 border-blue-200",
  Industrial: "text-slate-900 bg-slate-100 border-slate-300",
  Residential: "text-amber-900 bg-amber-50 border-amber-200",
  Infrastructure: "text-emerald-900 bg-emerald-50 border-emerald-200",
  Institutional: "text-purple-900 bg-purple-50 border-purple-200",
};

export default function PublicProjectGrid({ projects = [] }: PublicProjectGridProps) {
  // 1. Strict Public Visibility Rule:
  // Only published projects that are NOT operationally archived are eligible.
  const publicProjects = useMemo(() => {
    return (projects || []).filter((p) => {
      if (!p) return false;
      const isPublished = p.publishStatus === "published";
      const notArchived = p.status !== "archived";
      return isPublished && notArchived;
    });
  }, [projects]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "ongoing" | "completed">("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "newest" | "oldest" | "order">("featured");

  // Dynamically extract available categories from verified published projects
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    publicProjects.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    const defaultList = ["Commercial", "Industrial", "Residential"];
    defaultList.forEach((c) => set.add(c));
    return ["All", ...Array.from(set)];
  }, [publicProjects]);

  // Dynamically extract available cities from verified published projects
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    publicProjects.forEach((p) => {
      if (p.city && p.city.trim()) {
        set.add(p.city.trim());
      }
    });
    return Array.from(set).sort();
  }, [publicProjects]);

  // Helper to parse services tags
  const getServicesArray = (servicesField?: string | string[] | null): string[] => {
    if (!servicesField) return [];
    if (Array.isArray(servicesField)) return servicesField;
    try {
      const parsed = JSON.parse(servicesField);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(servicesField)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  // Filter and Sort Processing
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return publicProjects
      .filter((p) => {
        // Search
        if (q) {
          const titleMatch = (p.title || "").toLowerCase().includes(q);
          const locationMatch = (p.location || "").toLowerCase().includes(q);
          const clientMatch = (p.client || "").toLowerCase().includes(q);
          const cityMatch = (p.city || "").toLowerCase().includes(q);
          const districtMatch = (p.district || "").toLowerCase().includes(q);
          const descMatch = (p.description || "").toLowerCase().includes(q);
          const shortDescMatch = (p.shortDescription || "").toLowerCase().includes(q);
          const services = getServicesArray(p.services).join(" ").toLowerCase();
          const servicesMatch = services.includes(q);

          if (
            !titleMatch &&
            !locationMatch &&
            !clientMatch &&
            !cityMatch &&
            !districtMatch &&
            !descMatch &&
            !shortDescMatch &&
            !servicesMatch
          ) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== "All") {
          if ((p.category || "").toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Operational Status
        if (selectedStatus !== "all") {
          if (selectedStatus === "ongoing") {
            if (p.status !== "ongoing" && p.status !== "active") return false;
          } else if (selectedStatus === "completed") {
            if (p.status !== "completed") return false;
          }
        }

        // City / Location
        if (selectedCity !== "all") {
          if ((p.city || "").toLowerCase() !== selectedCity.toLowerCase()) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "featured") {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (a.order ?? 0) - (b.order ?? 0);
        }
        if (sortBy === "order") {
          return (a.order ?? 0) - (b.order ?? 0);
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        return 0;
      });
  }, [publicProjects, searchQuery, selectedCategory, selectedStatus, selectedCity, sortBy]);

  // Extract featured projects (ONLY published featured projects)
  const featuredProjects = useMemo(() => {
    return publicProjects.filter((p) => p.featured === true);
  }, [publicProjects]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedStatus !== "all" ||
    selectedCity !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("all");
    setSelectedCity("all");
  };

  // If entire public dataset is empty
  if (publicProjects.length === 0) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center border border-slate-200 bg-slate-50/60 p-12 sm:p-16 shadow-xs">
          <div className="w-14 h-14 bg-white border border-slate-200 mx-auto flex items-center justify-center text-construction-navy mb-5 shadow-xs">
            <Building className="w-7 h-7 text-construction-navy" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display uppercase tracking-tight mb-3">
            Project Portfolio Updating
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed mb-6">
            Our active construction portfolio and case studies are currently undergoing scheduled technical verification. Please contact our engineering team to request project credentials and engineering dossiers.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-construction-navy hover:bg-slate-900 text-white font-bold px-6 py-3 text-xs uppercase tracking-widest transition-all shadow-sm"
          >
            <span>Inquire About Recent Projects</span>
            <ArrowUpRight className="w-4 h-4 text-construction-red" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-0">
      {/* ─────────────────────────────────────────────────────────────
          1. FEATURED PROJECTS SHOWCASE (Only shown if featured exist)
          ───────────────────────────────────────────────────────────── */}
      {featuredProjects.length > 0 && !hasActiveFilters && (
        <section className="py-12 md:py-16 bg-slate-50/70 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-construction-navy mb-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Flagship Landmarks
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display uppercase tracking-tight">
                  Featured <span className="text-construction-red font-serif italic font-normal normal-case">Execution Highlights</span>
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400 hidden sm:block">
                {featuredProjects.length} Highlighted Build{featuredProjects.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredProjects.map((p) => {
                const canonicalSlug = p.slug || p.id;
                const isOngoing = p.status === "ongoing" || p.status === "active";
                const services = getServicesArray(p.services);

                return (
                  <Link
                    key={p.id}
                    href={`/projects/${canonicalSlug}`}
                    className="group bg-white border border-slate-200/90 hover:border-construction-navy transition-all duration-300 shadow-sm hover:shadow-md flex flex-col overflow-hidden"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.imageAlt || `${p.title} - Hindustan Projects Portfolio`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          unoptimized={!isOptimizableImage(p.image)}
                          className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Building className="w-12 h-12" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs text-construction-navy text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          {p.category}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                            isOngoing
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {isOngoing ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Ongoing
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" /> Completed
                            </>
                          )}
                        </span>
                      </div>

                      {/* Bottom Title on Image */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                          {p.title}
                        </h3>
                        {p.location && (
                          <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-construction-red" />
                            {p.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Meta & Summary Section */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-light">
                        {p.shortDescription || p.description}
                      </p>

                      {/* Specifications Row (Only non-empty shown) */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                        {p.client && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Client</span>
                            <span className="font-semibold text-slate-800 truncate block">{p.client}</span>
                          </div>
                        )}
                        {p.area && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Scale</span>
                            <span className="font-semibold text-slate-800 truncate block">{p.area}</span>
                          </div>
                        )}
                        {p.date && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Timeline</span>
                            <span className="font-semibold text-slate-800 truncate block">{p.date}</span>
                          </div>
                        )}
                        {p.city && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                            <span className="font-semibold text-slate-800 truncate block">
                              {[p.city, p.state].filter(Boolean).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Services Chips (Max 3) */}
                      {services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {services.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-medium"
                            >
                              {s}
                            </span>
                          ))}
                          {services.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                              +{services.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-construction-navy group-hover:text-construction-red transition-colors">
                        <span>View Full Case Study</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. INTERACTIVE FILTER & SEARCH TOOLBAR (Sticky)
          ───────────────────────────────────────────────────────────── */}
      <section className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-y border-slate-200/90 shadow-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {availableCategories.map((cat) => {
                const active = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? "bg-construction-navy text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Box & Controls */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, client, city..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-8 pr-7 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-construction-navy placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Operational Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-construction-navy cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="ongoing">Status: Ongoing</option>
                <option value="completed">Status: Completed</option>
              </select>

              {/* Verified Location / City Filter (Only if verified cities exist) */}
              {availableCities.length > 0 && (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-construction-navy cursor-pointer"
                >
                  <option value="all">City: All Locations</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              )}

              {/* Sort Order */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 shrink-0">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold uppercase tracking-wider text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="order">Display Order</option>
                </select>
              </div>

              {/* Clear filters shortcut */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  title="Clear all active filters"
                  className="bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-600 px-2 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Indicators Bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>
              Showing <strong className="text-slate-900">{filteredProjects.length}</strong> of{" "}
              <strong className="text-slate-900">{publicProjects.length}</strong> published projects
            </span>
            {hasActiveFilters && (
              <span className="text-amber-800 font-medium">Filtered results active</span>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN PORTFOLIO GRID
          ───────────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length === 0 ? (
            /* No matching results state */
            <div className="bg-slate-50 border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto my-8">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight mb-2">
                No Projects Found
              </h3>
              <p className="text-xs text-slate-600 font-light leading-relaxed mb-5">
                No published projects match your selected combination of category, location, or search keywords.
              </p>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider transition-all shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((p) => {
                const canonicalSlug = p.slug || p.id;
                const isOngoing = p.status === "ongoing" || p.status === "active";
                const services = getServicesArray(p.services);
                const categoryClass =
                  CATEGORY_COLORS[p.category] || "text-slate-800 bg-slate-100 border-slate-200";

                return (
                  <Link
                    key={p.id}
                    href={`/projects/${canonicalSlug}`}
                    className="group bg-white border border-slate-200/90 hover:border-construction-navy transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col overflow-hidden hover:-translate-y-1"
                  >
                    {/* Cover Image Box */}
                    <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.imageAlt || `${p.title} - Hindustan Projects Portfolio`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized={!isOptimizableImage(p.image)}
                          className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Building className="w-10 h-10" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border shadow-xs ${categoryClass}`}
                        >
                          {p.category}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                            isOngoing
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {isOngoing ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Ongoing
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" /> Completed
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight group-hover:text-construction-navy transition-colors line-clamp-2 leading-snug">
                          {p.title}
                        </h3>

                        <p className="text-xs text-slate-600 font-light mt-2 line-clamp-2 leading-relaxed">
                          {p.shortDescription || p.description}
                        </p>
                      </div>

                      {/* Specifications Summary (Zero fake values: only rendered if exist) */}
                      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          {p.location && (
                            <span className="flex items-center gap-1 truncate max-w-[60%]">
                              <MapPin className="w-3.5 h-3.5 text-construction-red shrink-0" />
                              <span className="truncate">{p.location}</span>
                            </span>
                          )}
                          {p.date && (
                            <span className="flex items-center gap-1 font-mono text-[11px] shrink-0">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {p.date}
                            </span>
                          )}
                        </div>

                        {(p.client || p.area) && (
                          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                            {p.client && (
                              <span className="truncate max-w-[50%]">
                                <strong className="text-slate-800 font-medium">Client:</strong> {p.client}
                              </span>
                            )}
                            {p.area && (
                              <span className="shrink-0 text-slate-700 font-medium">
                                <strong className="text-slate-800 font-medium">Scale:</strong> {p.area}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Services preview (Max 2) */}
                        {services.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {services.slice(0, 2).map((s) => (
                              <span
                                key={s}
                                className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                            {services.length > 2 && (
                              <span className="text-[9px] text-slate-400">
                                +{services.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* CTA link */}
                      <div className="pt-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-construction-navy group-hover:text-construction-red transition-colors">
                        <span>View Project Case Study</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
