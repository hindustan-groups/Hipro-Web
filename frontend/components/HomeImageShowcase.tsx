"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { ImageShowcaseContent, ImageShowcaseItem } from "@/lib/types";

// Authoritative default showcase items (verified high-res infrastructure & architecture photos)
export const DEFAULT_SHOWCASE_ITEMS: ImageShowcaseItem[] = [
  {
    id: "showcase-1",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85",
    title: "Luxury Estate Residential Architecture",
    alt: "Luxury residential architectural estate built by HiPRO",
    category: "Residential",
    order: 1,
    active: true,
  },
  {
    id: "showcase-2",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85",
    title: "Commercial High-Rise IT Facade",
    alt: "Glass curtain corporate commercial IT building",
    category: "Commercial",
    order: 2,
    active: true,
  },
  {
    id: "showcase-3",
    image: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1200&q=85",
    title: "Elevated Transit Viaduct & River Span",
    alt: "Heavy civil infrastructure viaduct and bridge span",
    category: "Infrastructure",
    order: 3,
    active: true,
  },
  {
    id: "showcase-4",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=85",
    title: "Pre-Engineered Logistics & Warehousing Hub",
    alt: "Industrial pre-engineered warehouse and logistics hub",
    category: "Industrial",
    order: 4,
    active: true,
  },
  {
    id: "showcase-5",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=85",
    title: "Architectural Planning & Structural Layout",
    alt: "Architectural design layout and building engineering",
    category: "Planning",
    order: 5,
    active: true,
  },
  {
    id: "showcase-6",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=85",
    title: "Heavy Civil Execution & Site Engineering",
    alt: "Heavy civil construction site and engineering operations",
    category: "Engineering",
    order: 6,
    active: true,
  },
  {
    id: "showcase-7",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=85",
    title: "Cable-Stayed Riverfront Infrastructure",
    alt: "Cable-stayed river bridge infrastructure engineering",
    category: "Infrastructure",
    order: 7,
    active: true,
  },
  {
    id: "showcase-8",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85",
    title: "Modern Contemporary Villa Design",
    alt: "Contemporary private villa architectural construction",
    category: "Residential",
    order: 8,
    active: true,
  },
  {
    id: "showcase-9",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85",
    title: "Bespoke Architectural Residence",
    alt: "Modern luxury residence with panoramic glazing",
    category: "Residential",
    order: 9,
    active: true,
  },
  {
    id: "showcase-10",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85",
    title: "Corporate Campus & Commercial Complex",
    alt: "Corporate business park commercial development",
    category: "Commercial",
    order: 10,
    active: true,
  },
];

export const DEFAULT_IMAGE_SHOWCASE: ImageShowcaseContent = {
  badge: "OUR WORK IN FOCUS",
  title: "Engineering & Architectural Footprint",
  subtitle: "A continuous glimpse across our landmark infrastructure, industrial, commercial and residential executions.",
  enabled: true,
  items: DEFAULT_SHOWCASE_ITEMS,
};

// Reusable Single Marquee Row component — exactly identical styles for both Row 1 and Row 2
export interface MarqueeRowProps {
  images: ImageShowcaseItem[];
  direction: "left" | "right";
  speed?: number; // duration in seconds
  className?: string;
}

export function MarqueeRow({
  images,
  direction,
  speed = 34,
  className = "",
}: MarqueeRowProps) {
  // Ensure we have enough items for an uninterrupted continuous loop on ultra-wide screens
  const baseItems = useMemo(() => {
    if (!images || images.length === 0) return [];
    const list = [...images];
    while (list.length < 6) {
      list.push(...images);
    }
    return list;
  }, [images]);

  if (baseItems.length === 0) return null;

  const animationClass =
    direction === "left" ? "animate-marquee-left" : "animate-marquee-right";

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        ["--marquee-duration" as any]: `${speed}s`,
      }}
    >
      <div className="flex flex-nowrap w-max">
        {/* Track 1 */}
        <div
          className={`flex shrink-0 items-center gap-3 sm:gap-4 md:gap-5 pr-3 sm:pr-4 md:pr-5 ${animationClass}`}
        >
          {baseItems.map((item, idx) => (
            <ShowcaseCard key={`t1-${item.id || idx}-${idx}`} item={item} />
          ))}
        </div>

        {/* Track 2 (Duplicated sequence for seamless mathematical loop) */}
        <div
          aria-hidden="true"
          className={`flex shrink-0 items-center gap-3 sm:gap-4 md:gap-5 pr-3 sm:pr-4 md:pr-5 ${animationClass}`}
        >
          {baseItems.map((item, idx) => (
            <ShowcaseCard key={`t2-${item.id || idx}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Single Image Card — strictly identical dimensions, radius, containment and hover behavior
function ShowcaseCard({ item }: { item: ImageShowcaseItem }) {
  return (
    <div
      className="group relative shrink-0 overflow-hidden rounded-md sm:rounded-lg border border-slate-700/60 bg-slate-900/90 shadow-sm transition-all duration-300 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-950/20
                 w-[130px] h-[85px] sm:w-[175px] sm:h-[110px] md:w-[300px] md:h-[185px] lg:w-[350px] lg:h-[215px]"
    >
      {/* Ambient background matching image color tone to eliminate empty black bars without cropping */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="100px"
          className="object-cover blur-xl opacity-25 scale-125"
          aria-hidden="true"
        />
      </div>

      {/* Main architectural photo: full aspect ratio preserved, zero cutting or distortion */}
      <div className="relative w-full h-full p-1 sm:p-2 flex items-center justify-center">
        <Image
          src={item.image}
          alt={item.alt || item.title || "HiPRO Engineering Project"}
          fill
          sizes="(max-width: 640px) 140px, (max-width: 1024px) 300px, 360px"
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      {/* Subtle architectural frame inner ring */}
      <div className="absolute inset-0 rounded-md sm:rounded-lg ring-1 ring-inset ring-white/10 pointer-events-none" />

      {/* Sleek caption badge on desktop hover */}
      {item.title && (
        <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2.5 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] sm:text-xs font-semibold text-white truncate drop-shadow-sm font-sans tracking-tight">
            {item.title}
          </span>
          {item.category && (
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-600/90 text-white font-bold shrink-0 ml-1.5 shadow-sm">
              {item.category}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Master Dual-Row Image Showcase Section
export interface HomeImageShowcaseProps {
  content?: ImageShowcaseContent | null;
  className?: string;
}

export default function HomeImageShowcase({
  content,
  className = "",
}: HomeImageShowcaseProps) {
  // Active items from CMS or fallback to default engineering items
  const activeItems = useMemo(() => {
    const rawItems = content?.items && content.items.length > 0
      ? content.items
      : DEFAULT_SHOWCASE_ITEMS;

    return rawItems
      .filter((item) => item.active !== false && item.image && item.image.trim().length > 0)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [content]);

  // Split or offset images so Row 1 and Row 2 show diverse complementary perspectives
  const { row1Items, row2Items } = useMemo(() => {
    if (activeItems.length <= 3) {
      return { row1Items: activeItems, row2Items: activeItems };
    }
    // Offset row 2 by half array length so vertically adjacent cards are not identical
    const mid = Math.floor(activeItems.length / 2);
    const row2 = [...activeItems.slice(mid), ...activeItems.slice(0, mid)];
    return { row1Items: activeItems, row2Items: row2 };
  }, [activeItems]);

  // If explicitly disabled in CMS or no active items, render nothing
  if ((content && content.enabled === false) || activeItems.length === 0) {
    return null;
  }

  const badge = content?.badge ?? DEFAULT_IMAGE_SHOWCASE.badge;
  const title = content?.title ?? DEFAULT_IMAGE_SHOWCASE.title;
  const subtitle = content?.subtitle ?? DEFAULT_IMAGE_SHOWCASE.subtitle;

  return (
    <section
      aria-label="Project and Image Showcase"
      className={`relative w-full py-12 sm:py-16 md:py-20 bg-slate-950 overflow-hidden text-white ${className}`}
    >
      {/* Background Architectural Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Subtle top & bottom divider lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      {/* Section Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 text-center">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-slate-900 border border-slate-800 text-[11px] sm:text-xs font-bold text-red-500 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <Sparkles className="w-3 h-3 text-red-400" />
            {badge}
          </div>
        )}

        {title && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white">
            {title}
          </h2>
        )}

        {subtitle && (
          <p className="mt-2.5 max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-400 font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Dual Row Showcase Container with Edge Mask & Blur */}
      <div className="relative w-full overflow-hidden">
        {/* Optical Blur & Fade Overlay Curtains (Left & Right) */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 md:w-44 lg:w-60 z-20 pointer-events-none bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent backdrop-blur-[2px]"
          style={{
            maskImage: "linear-gradient(to right, black 20%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 md:w-44 lg:w-60 z-20 pointer-events-none bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent backdrop-blur-[2px]"
          style={{
            maskImage: "linear-gradient(to left, black 20%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to left, black 20%, transparent 100%)",
          }}
        />

        {/* Row 1: RIGHT → LEFT */}
        <div className="mb-3 sm:mb-4 md:mb-5">
          <MarqueeRow
            images={row1Items}
            direction="left"
            speed={32}
          />
        </div>

        {/* Row 2: LEFT → RIGHT (Slightly varied speed ~38s for natural architectural flow) */}
        <div>
          <MarqueeRow
            images={row2Items}
            direction="right"
            speed={38}
          />
        </div>
      </div>
    </section>
  );
}
