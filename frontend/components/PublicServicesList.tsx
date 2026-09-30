"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/types";
import DynamicIcon from "@/components/DynamicIcon";
import { cleanServiceTitle, getServiceSlug } from "@/lib/companyData";
import { isOptimizableImage } from "@/lib/imageUtils";

interface PublicServicesListProps {
  services: Service[];
  initialCount?: number;
}

export default function PublicServicesList({ services = [], initialCount = 4 }: PublicServicesListProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const visibleServices = services.slice(0, visibleCount);
  const hasMore = services.length > visibleCount;

  return (
    <div>
      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {visibleServices.map((s, i) => {
          const cleanTitle = cleanServiceTitle(s.title);
          const slug = getServiceSlug(cleanTitle);
          const firstWord = (cleanTitle || "Service").split(" ")[0];
          const imageUrl = s.image || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=75";

          return (
            <div
              key={s.id || i}
              className="group relative h-[320px] md:h-[380px] w-full rounded-[2rem] overflow-hidden shadow-lg shadow-slate-900/10 bg-slate-900"
            >
              {/* Background Image */}
              <Image
                src={imageUrl}
                alt={s.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={!isOptimizableImage(imageUrl)}
                loading="lazy"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300" />

              {/* Content Box */}
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                      <DynamicIcon name={s.icon || "Wrench"} className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] uppercase tracking-widest font-bold text-slate-300">
                      {s.category || "Our Capabilities"}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white font-display mb-2 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-slate-200 font-light line-clamp-2 text-sm md:text-base">
                    {s.description}
                  </p>
                </div>

                <Link
                  href={`/services/${slug}`}
                  className="inline-flex shrink-0 items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-orange-900/30 hover:shadow-orange-900/50"
                >
                  Explore {firstWord}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* View More Services / Load More Button */}
      {hasMore ? (
        <div className="mt-14 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + initialCount)}
            className="inline-flex items-center justify-center gap-2.5 bg-construction-navy hover:bg-slate-900 text-white font-bold px-10 py-4 text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer group border border-construction-navy hover:border-slate-900 focus-visible:ring-2 focus-visible:ring-construction-navy focus-visible:outline-none"
          >
            <span>View More Services ({services.length - visibleCount} remaining)</span>
            <ArrowUpRight className="w-4 h-4 text-construction-red group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      ) : services.length > initialCount ? (
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Showing all {services.length} services
          </p>
        </div>
      ) : null}
    </div>
  );
}
