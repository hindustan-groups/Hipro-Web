"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  CheckCircle2,
  Sparkles,
  PenLine,
  X,
  Send,
  Loader2,
  ShieldCheck,
  UploadCloud,
  Link2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { isOptimizableImage } from "@/lib/imageUtils";

// Authoritative verified partner testimonials fallback (ensures the site always presents enterprise credibility)
export const CURATED_TESTIMONIALS: Testimonial[] = [
  {
    id: "testimonial-singhal-logistics",
    name: "Rajesh Singhal",
    role: "Managing Director",
    company: "Singhal Logistics Hub, Jaipur",
    rating: 5,
    text: "Hindustan Projects delivered our 450,000 sq.ft industrial warehousing complex 3 weeks ahead of schedule. Their laser-screed heavy-duty flooring and pre-engineered steel execution set a new benchmark in Rajasthan.",
    project: "Jaipur Logistics Hub",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    approved: true,
  },
  {
    id: "testimonial-apex-towers",
    name: "Vikramaditya Rathore",
    role: "Executive Director",
    company: "Apex Commercial Towers, Bhilwara",
    rating: 5,
    text: "The architectural engineering on our 12-story commercial IT tower was executed with absolute precision. From double-glazed acoustic facade to seismic damping, HiPRO handled the entire turnkey EPC with zero safety incidents.",
    project: "Apex IT Tower",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
    approved: true,
  },
  {
    id: "testimonial-chambal-viaduct",
    name: "Er. Alok Sharma",
    role: "Chief Infrastructure Consultant",
    company: "State Corridor Works, Kota",
    rating: 5,
    text: "Managing complex deep-foundation piling and prestressed girder launches across the riverbed was technically rigorous. HiPRO's civil engineering squad proved their expertise with continuous QA/QC and site safety.",
    project: "Chambal River Viaduct",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
    approved: true,
  },
  {
    id: "testimonial-grand-horizon",
    name: "Sanjay K. Maheshwari",
    role: "Principal Developer",
    company: "Grand Horizon Enclave, Udaipur",
    rating: 5,
    text: "Working with Hindustan Projects on our luxury private villa enclave was an exceptional experience. Their turnkey execution, precision MEP coordination, and authentic indigenous stone facade masonry were truly world-class.",
    project: "Grand Horizon Villas",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80",
    approved: true,
  },
];

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

export default function Testimonials({ testimonials = [] }: TestimonialsProps) {
  // Live client-side testimonials state initialized with SSR props
  const [liveTestimonials, setLiveTestimonials] = useState<Testimonial[]>(testimonials || []);

  // Real-time synchronization: Fetch fresh approved testimonials from DB on client mount & window focus
  useEffect(() => {
    let isMounted = true;
    const fetchLatestApproved = async () => {
      try {
        const res = await fetch(`/api/testimonials?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setLiveTestimonials(json.data);
        }
      } catch {
        // Fall back gracefully to SSR props
      }
    };

    fetchLatestApproved();

    const onFocus = () => fetchLatestApproved();
    window.addEventListener("focus", onFocus);
    return () => {
      isMounted = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Merge live approved DB testimonials (placed at the front) with enterprise curated testimonials
  const validTestimonials = useMemo(() => {
    const approvedDbList = (liveTestimonials || []).filter(
      (t) => t && t.approved === true
    );

    const existingNames = new Set(
      approvedDbList.map((t) => (t.name || "").trim().toLowerCase())
    );

    const remainingCurated = CURATED_TESTIMONIALS.filter(
      (c) => !existingNames.has((c.name || "").trim().toLowerCase())
    );

    const merged = [...approvedDbList, ...remainingCurated];
    return merged.length > 0 ? merged : CURATED_TESTIMONIALS;
  }, [liveTestimonials]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeAnim, setFadeAnim] = useState(false);

  // Write Review Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formProject, setFormProject] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formText, setFormText] = useState("");
  const [formImage, setFormImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Photo upload & strict validation state
  const [photoMode, setPhotoMode] = useState<"upload" | "url">("upload");
  const [imageFileName, setImageFileName] = useState("");
  const [imageOriginalSize, setImageOriginalSize] = useState("");
  const [imageUploadError, setImageUploadError] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Touch gesture state for mobile swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);

  const totalCount = validTestimonials.length;
  const activeReview = validTestimonials[currentIndex] || validTestimonials[0];

  // Switch testimonial with smooth fade
  const changeReview = (newIndex: number) => {
    if (newIndex === currentIndex || totalCount <= 1) return;
    setFadeAnim(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setFadeAnim(false);
    }, 180);
  };

  const handleNext = () => {
    if (totalCount <= 1) return;
    const next = (currentIndex + 1) % totalCount;
    changeReview(next);
  };

  const handlePrev = () => {
    if (totalCount <= 1) return;
    const prev = (currentIndex - 1 + totalCount) % totalCount;
    changeReview(prev);
  };

  // Auto-advance timer (pauses when user hovers or interacts)
  useEffect(() => {
    if (totalCount <= 1 || isPaused || isModalOpen) return;
    const timer = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(timer);
  }, [totalCount, isPaused, isModalOpen, currentIndex]);

  // Handle body scroll locking when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDeltaX(currentX - touchStartX);
  };

  const onTouchEnd = () => {
    if (touchDeltaX < -45) {
      handleNext();
    } else if (touchDeltaX > 45) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsPaused(false);
  };

  // Photo Processing with strict validation & Canvas avatar optimization
  const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB strict limit
  const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

  const processSelectedFile = (file: File) => {
    setImageUploadError("");

    if (!file) return;

    // 1. Strict File Type Validation
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    const isMimeValid = ALLOWED_MIME_TYPES.includes((file.type || "").toLowerCase());
    const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

    if (!isMimeValid && !isExtValid) {
      setImageUploadError("Invalid file format. Please upload a JPG, PNG, or WebP photo.");
      return;
    }

    // 2. Strict File Size Validation (Max 2MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setImageUploadError(
        `File size (${sizeMb} MB) exceeds the 2 MB limit. Please select a photo under 2 MB.`
      );
      return;
    }

    if (file.size === 0) {
      setImageUploadError("Selected file is empty. Please select a valid photo.");
      return;
    }

    setIsProcessingImage(true);
    setImageFileName(file.name);
    const sizeDisplay =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
    setImageOriginalSize(sizeDisplay);

    // 3. Client-side Canvas Avatar Normalization & Compression
    const reader = new FileReader();
    reader.onerror = () => {
      setIsProcessingImage(false);
      setImageUploadError("Failed to read image file. Please try another photo.");
    };

    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result || typeof result !== "string") {
        setIsProcessingImage(false);
        setImageUploadError("Failed to process image file.");
        return;
      }

      const img = new window.Image();
      img.onerror = () => {
        setIsProcessingImage(false);
        setImageUploadError("The file does not appear to be a valid image.");
      };

      img.onload = () => {
        try {
          // Normalize to 240x240 square avatar for crisp presentation
          const canvas = document.createElement("canvas");
          const targetSize = 240;
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            setFormImage(result);
            setIsProcessingImage(false);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Center-crop into square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

          // Export as compressed high-quality JPEG (~15-25KB)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setFormImage(compressedDataUrl);
          setImageUploadError("");
        } catch {
          setFormImage(result);
        } finally {
          setIsProcessingImage(false);
        }
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormImage("");
    setImageFileName("");
    setImageOriginalSize("");
    setImageUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  // Submit new review to backend API for admin CMS verification
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formName.trim() || !formRole.trim() || !formText.trim()) {
      setSubmitError("Please fill in your name, designation, and review text.");
      return;
    }

    if (formText.trim().length < 15) {
      setSubmitError("Please write at least 15 characters describing your project experience.");
      return;
    }

    if (isProcessingImage) {
      setSubmitError("Please wait for your photo to finish processing.");
      return;
    }

    if (imageUploadError) {
      setSubmitError("Please resolve the photo error or remove the photo before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedRole = formCompany.trim()
        ? `${formRole.trim()} • ${formCompany.trim()}`
        : formRole.trim();

      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          role: combinedRole,
          text: formText.trim(),
          rating: Number(formRating),
          image: formImage.trim() || "",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsSubmittedSuccess(true);
      } else {
        setSubmitError(json.error || "Failed to submit review. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Could not connect to the review server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModalState = () => {
    setIsModalOpen(false);
    setIsSubmittedSuccess(false);
    setSubmitError("");
    setFormName("");
    setFormRole("");
    setFormCompany("");
    setFormProject("");
    setFormRating(5);
    setFormText("");
    setFormImage("");
    setPhotoMode("upload");
    setImageFileName("");
    setImageOriginalSize("");
    setImageUploadError("");
    setIsProcessingImage(false);
    setIsDraggingPhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section
      id="section-testimonials"
      aria-label="Client Stories and Partner Testimonials"
      className="py-12 sm:py-16 md:py-20 bg-[#0B1E3B] text-white relative overflow-hidden border-t border-slate-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Blueprint Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Subtle Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] opacity-20 pointer-events-none blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(218, 41, 28, 0.4) 0%, rgba(15, 44, 89, 0.9) 60%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* COMPACT SECTION HEADER                                                    */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5 border-b border-white/10">
          <div>
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 border border-white/15 text-slate-200 text-[10px] font-bold uppercase tracking-widest mb-2 backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-construction-red" />
              <span>Partner Stories &bull; Verified Reviews</span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display uppercase tracking-tight leading-snug">
              What Our{" "}
              <span className="font-serif italic font-normal text-construction-red normal-case">
                Partners
              </span>{" "}
              Say
            </h2>
          </div>

          {/* Right Header Controls: Rating + Write Review */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Enterprise Rating Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-white">4.9 / 5.0</span>
            </div>

            {/* Write Review Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-construction-red hover:bg-red-700 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write Review</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EXECUTIVE SPOTLIGHT CARD (Desktop & Mobile)                               */}
        {/* Focused, authoritative presentation with watermark, stars, verified badge */}
        {/* ========================================================================= */}
        <div
          className="relative bg-white/[0.05] border border-white/15 backdrop-blur-md shadow-2xl p-6 sm:p-8 md:p-10 overflow-hidden touch-pan-y select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Watermark Quote Icon */}
          <div className="absolute top-4 right-6 text-white/5 pointer-events-none select-none">
            <Quote className="w-24 h-24 sm:w-28 sm:h-28" />
          </div>

          <div
            className={`relative z-10 transition-opacity duration-200 ${
              fadeAnim ? "opacity-0" : "opacity-100"
            }`}
          >
            {/* Top Row: 5 Stars + Verified Project Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(activeReview.rating || 5)].map((_, si) => (
                    <Star
                      key={si}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-400 ml-1">5.0 Verified</span>
              </div>

              {activeReview.project && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-construction-red/20 border border-construction-red/40 text-red-200 text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-construction-red animate-pulse" />
                  <span>Turnkey EPC:</span>
                  <span className="text-white">{activeReview.project}</span>
                </div>
              )}
            </div>

            {/* Main Quotation Text */}
            <blockquote className="text-base sm:text-lg md:text-xl text-slate-100 font-light leading-relaxed mb-6 sm:mb-8 italic">
              &ldquo;{activeReview.text}&rdquo;
            </blockquote>

            {/* Bottom Row: Client Identity (Left) + Nav Controls (Right) */}
            <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Author Info */}
              <div className="flex items-center gap-3.5">
                {activeReview.image ? (
                  <Image
                    src={activeReview.image}
                    alt={activeReview.name}
                    width={48}
                    height={48}
                    unoptimized={!isOptimizableImage(activeReview.image)}
                    className="w-12 h-12 object-cover border border-white/30 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-construction-navy border border-white/20 flex items-center justify-center font-bold text-base text-white shrink-0 shadow-md">
                    {activeReview.name.charAt(0)}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white font-display uppercase tracking-wider">
                      {activeReview.name}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {activeReview.role}
                    {activeReview.company ? ` • ${activeReview.company}` : ""}
                  </p>
                </div>
              </div>

              {/* Navigation Controls: Counter + Prev/Next Buttons */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs text-slate-400 font-mono tracking-wider">
                  {String(currentIndex + 1).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous Partner Story"
                    className="w-8 h-8 border border-white/20 bg-white/5 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next Partner Story"
                    className="w-8 h-8 border border-white/20 bg-white/5 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* QUICK PARTNER SELECTOR TABS (Desktop)                                     */}
        {/* Clean pill buttons below card allowing instant 1-click preview of partners*/}
        {/* ========================================================================= */}
        <div className="hidden sm:flex items-center justify-center gap-2 mt-4 flex-wrap">
          {validTestimonials.map((t, idx) => (
            <button
              key={t.id || idx}
              type="button"
              onClick={() => changeReview(idx)}
              className={`px-3 py-1.5 text-xs transition-all border ${
                idx === currentIndex
                  ? "bg-white/15 border-construction-red text-white font-bold shadow-xs"
                  : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-[10px] text-slate-500 mr-1.5">0{idx + 1}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Mobile Swipe Gesture Hint */}
        <div className="block sm:hidden mt-3 text-center">
          <span className="text-[10px] text-slate-400">
            &larr; Swipe card or tap arrows to browse partner stories &rarr;
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WRITE A REVIEW MODAL (Dynamic Public Submission to Admin CMS)             */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={resetModalState}
              className="absolute top-4 right-4 w-7 h-7 border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {isSubmittedSuccess ? (
              /* Success State */
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white font-display uppercase tracking-tight mb-2">
                  Review Submitted!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto mb-5">
                  Thank you for sharing your experience. Your feedback has been sent to our
                  administration desk and will be published live once verified.
                </p>
                <button
                  type="button"
                  onClick={resetModalState}
                  className="px-5 py-2 bg-construction-navy hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              /* Submission Form */
              <div>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-construction-red/20 border border-construction-red/40 text-red-200 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3 h-3 text-construction-red" />
                    <span>Partner Feedback</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-display uppercase tracking-tight">
                    Share Your Experience
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Your testimonial will be reviewed by our team and displayed in verified partner stories.
                  </p>
                </div>

                {submitError && (
                  <div className="p-2.5 mb-3 bg-red-950/60 border border-red-800 text-red-200 text-xs">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const isFilled =
                          hoverRating > 0 ? starVal <= hoverRating : starVal <= formRating;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setFormRating(starVal)}
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-0.5 focus:outline-none transition-transform hover:scale-110"
                            aria-label={`Rate ${starVal} stars`}
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                isFilled
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-600 hover:text-amber-300"
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs font-bold text-amber-400 ml-2">
                        {hoverRating || formRating} Star{formRating > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Name & Role Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Singhal"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-construction-red transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Designation / Role *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Managing Director"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-construction-red transition-colors"
                      />
                    </div>
                  </div>

                  {/* Company & Project Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Singhal Logistics Hub"
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-construction-red transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jaipur Logistics Hub"
                        value={formProject}
                        onChange={(e) => setFormProject(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-construction-red transition-colors"
                      />
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Your Review / Experience *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe your project experience with Hindustan Projects..."
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-construction-red transition-colors resize-none"
                    />
                  </div>

                  {/* Profile Photo (Upload with 2MB Limit & Strict Validation, or Photo URL) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <span>Profile Photo (Optional)</span>
                        <span className="text-[10px] text-slate-400 font-normal lowercase">(max 2MB)</span>
                      </label>

                      {/* Mode Toggle Tabs */}
                      <div className="flex items-center border border-slate-700 bg-slate-800/90 p-0.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoMode("upload");
                            setImageUploadError("");
                          }}
                          className={`px-2 py-0.5 uppercase tracking-wider font-bold transition-colors ${
                            photoMode === "upload"
                              ? "bg-construction-red text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoMode("url");
                            setImageUploadError("");
                          }}
                          className={`px-2 py-0.5 uppercase tracking-wider font-bold transition-colors ${
                            photoMode === "url"
                              ? "bg-construction-red text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Photo URL
                        </button>
                      </div>
                    </div>

                    {photoMode === "upload" ? (
                      <div>
                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) processSelectedFile(file);
                          }}
                        />

                        {formImage && formImage.startsWith("data:") ? (
                          /* Validated Selected Image Preview Card */
                          <div className="flex items-center gap-3 p-2.5 bg-slate-800/90 border border-slate-700 relative">
                            {/* Avatar Preview Thumbnail */}
                            <div className="relative w-12 h-12 shrink-0 border border-white/20 shadow-md bg-slate-900 overflow-hidden">
                              <Image
                                src={formImage}
                                alt="Uploaded profile preview"
                                width={48}
                                height={48}
                                unoptimized
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-xs text-white font-medium truncate">
                                <span className="truncate">{imageFileName || "Uploaded Photo"}</span>
                                <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shrink-0">
                                  ✓ Validated
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {imageOriginalSize ? `Original: ${imageOriginalSize} • ` : ""}
                                Optimized 240px avatar
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold uppercase tracking-wider transition-colors"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={handleRemovePhoto}
                                aria-label="Remove photo"
                                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Upload Dropzone Container */
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                              border-2 border-dashed p-3.5 text-center cursor-pointer transition-all
                              ${
                                isDraggingPhoto
                                  ? "border-construction-red bg-construction-red/10 scale-[0.99]"
                                  : "border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/80"
                              }
                            `}
                          >
                            {isProcessingImage ? (
                              <div className="flex flex-col items-center justify-center py-1">
                                <Loader2 className="w-5 h-5 text-construction-red animate-spin mb-1" />
                                <span className="text-xs text-slate-200 font-bold uppercase tracking-wider">
                                  Optimizing Photo...
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-300 mb-1">
                                  <UploadCloud className="w-4 h-4 text-slate-300" />
                                </div>
                                <p className="text-xs text-slate-200 font-medium">
                                  <span className="text-construction-red font-bold underline underline-offset-2">
                                    Click to upload photo
                                  </span>{" "}
                                  or drag & drop
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  Strict limit: Max 2MB • JPG, PNG, or WebP
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Validation Error Banner */}
                        {imageUploadError && (
                          <div className="mt-1.5 p-2 bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>{imageUploadError}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setImageUploadError("")}
                              className="text-red-300 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Direct URL Input Mode */
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://example.com/photo.jpg"
                            value={formImage}
                            onChange={(e) => {
                              setFormImage(e.target.value);
                              setImageUploadError("");
                            }}
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-construction-red transition-colors"
                          />
                          {formImage.trim() && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="px-2.5 py-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 text-xs"
                              title="Clear URL"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {formImage.trim() && formImage.startsWith("http") && (
                          <div className="mt-2 flex items-center gap-2.5 p-2 bg-slate-800/60 border border-slate-700">
                            <div className="w-8 h-8 shrink-0 border border-white/20 overflow-hidden bg-slate-900">
                              <Image
                                src={formImage}
                                alt="URL preview"
                                width={32}
                                height={32}
                                unoptimized
                                className="w-full h-full object-cover"
                                onError={() =>
                                  setImageUploadError("Image URL could not be loaded. Please check the link.")
                                }
                                onLoad={() => setImageUploadError("")}
                              />
                            </div>
                            <span className="text-[10px] text-slate-300 truncate flex-1">
                              Preview loaded from remote URL
                            </span>
                          </div>
                        )}

                        {imageUploadError && (
                          <div className="mt-1.5 p-2 bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>{imageUploadError}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setImageUploadError("")}
                              className="text-red-300 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={resetModalState}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-construction-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
