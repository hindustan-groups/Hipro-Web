"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { isOptimizableImage } from "@/lib/imageUtils";

export interface GalleryImageItem {
  url: string;
  alt?: string;
  caption?: string;
}

interface ProjectGalleryLightboxProps {
  images: GalleryImageItem[];
  projectTitle: string;
}

export default function ProjectGalleryLightbox({
  images,
  projectTitle,
}: ProjectGalleryLightboxProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isOpen = lightboxIndex !== null && lightboxIndex >= 0 && lightboxIndex < images.length;
  const currentImage = isOpen ? images[lightboxIndex] : null;

  const handleOpen = (index: number) => {
    setLightboxIndex(index);
  };

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  }, [images.length]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  }, [images.length]);

  // Keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleClose, handlePrev, handleNext]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {images.map((item, idx) => {
          const isFeaturedSpan = idx === 0 && images.length >= 3;
          const altText = item.alt || `${projectTitle} - Architectural Execution Record ${idx + 1}`;

          return (
            <figure
              key={`${item.url}-${idx}`}
              className={`group relative overflow-hidden bg-slate-900 border border-slate-800 transition-all duration-300 hover:border-amber-500/50 cursor-pointer ${
                isFeaturedSpan ? "sm:col-span-2 lg:col-span-2 aspect-[16/10]" : "aspect-[4/3]"
              }`}
              onClick={() => handleOpen(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpen(idx);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View photo ${idx + 1} of ${images.length} in full screen: ${altText}`}
            >
              <Image
                src={item.url}
                alt={altText}
                fill
                sizes={isFeaturedSpan ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                unoptimized={!isOptimizableImage(item.url)}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Overlay with magnifying icon and caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 md:p-6">
                <div className="self-end">
                  <span className="p-2.5 rounded-none bg-black/70 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shadow-lg">
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-semibold block mb-1">
                    Plate {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                  </span>
                  {item.caption && (
                    <figcaption className="text-xs text-white/90 font-medium line-clamp-2">
                      {item.caption}
                    </figcaption>
                  )}
                </div>
              </div>
            </figure>
          );
        })}
      </div>

      {/* Accessible Fullscreen Lightbox Modal */}
      {isOpen && currentImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${lightboxIndex + 1} of ${images.length}: ${currentImage.alt || projectTitle}`}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md transition-opacity duration-300"
          onClick={handleClose}
        >
          {/* Header Bar */}
          <div
            className="flex items-center justify-between px-4 sm:px-8 py-4 bg-black/40 border-b border-white/10 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                Image {lightboxIndex + 1} of {images.length}
              </span>
              <span className="hidden sm:inline-block text-white/40 text-xs">|</span>
              <span className="hidden sm:inline-block text-xs text-white/80 font-medium truncate max-w-md">
                {projectTitle}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close image gallery"
              className="p-2.5 rounded-none bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central Image Viewport */}
          <div
            className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-16 py-4 flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-2 sm:left-6 z-20 p-3 rounded-none bg-black/60 hover:bg-amber-500 text-white hover:text-black border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Stage Image */}
            <div className="relative w-full h-full max-h-[78vh] flex items-center justify-center">
              <Image
                src={currentImage.url}
                alt={currentImage.alt || `${projectTitle} - Image ${lightboxIndex + 1}`}
                fill
                sizes="100vw"
                unoptimized={!isOptimizableImage(currentImage.url)}
                className="object-contain select-none"
                priority
              />
            </div>

            {/* Next Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-2 sm:right-6 z-20 p-3 rounded-none bg-black/60 hover:bg-amber-500 text-white hover:text-black border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Footer Bar with Caption */}
          <div
            className="px-4 sm:px-8 py-3 bg-black/40 border-t border-white/10 text-center z-20 min-h-[48px] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentImage.caption ? (
              <p className="text-xs sm:text-sm text-white/90 font-light max-w-3xl mx-auto">
                {currentImage.caption}
              </p>
            ) : currentImage.alt ? (
              <p className="text-xs text-white/60 font-light max-w-3xl mx-auto">
                {currentImage.alt}
              </p>
            ) : (
              <p className="text-[11px] text-white/40 font-mono uppercase tracking-wider">
                HiPRO Architectural Portfolio Archive
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
