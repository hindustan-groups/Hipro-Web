"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MessageSquare, ArrowRight, ChevronRight, X, MapPin } from "lucide-react";
import type { HbsContent, HbsNavbarConfig } from "@/lib/types";
import { cleanTelNumber, getContactWhatsAppUrl } from "@/lib/hbsWhatsApp";

export const DEFAULT_NAVBAR_CONFIG: HbsNavbarConfig = {
  navItems: [
    { id: "home", label: "Home", visible: true, order: 1 },
    { id: "about", label: "About", visible: true, order: 2 },
    { id: "services", label: "Services", visible: true, order: 3 },
    { id: "projects", label: "Projects", visible: true, order: 4 },
    { id: "why-choose-us", label: "Why Choose Us", visible: true, order: 5 },
    { id: "gallery", label: "Gallery", visible: true, order: 6 },
    { id: "contact", label: "Contact", visible: true, order: 7 },
  ],
  primaryCta: {
    enabled: true,
    label: "Get a Free Consultation",
    destination: "/contact",
  },
  contactActions: {
    callEnabled: true,
    callLabel: "Call",
    phone: "",
    whatsappEnabled: true,
    whatsappLabel: "WhatsApp",
    whatsappNumber: "",
  },
  behaviour: {
    sticky: true,
    compactOnScroll: true,
    transparentAtTop: false,
    activeIndicator: true,
  },
  animation: {
    navbarAnimation: true,
    mobileMenuAnimation: true,
    scrollAnimation: true,
    intensity: "normal",
    speed: "normal",
  },
  branding: {
    logoAltText: "Hind Building Solutions",
    brandSubtitle: "Engineering & Turnkey Solutions",
  },
  accessibility: {
    menuAriaLabel: "Navigation Menu",
    reducedMotionSafe: true,
  },
};

/** Viewport width (px) at which the desktop navbar takes over from the hamburger. Matches Tailwind `lg`. */
const DESKTOP_MIN_WIDTH = 1024;
const MOBILE_NAV_ID = "hbs-mobile-navigation";

interface HbsNavbarProps {
  content: HbsContent;
  /** Optional override config for live admin preview without saving */
  previewConfig?: HbsNavbarConfig;
  /** Admin preview only: force the mobile layout regardless of the real viewport width */
  previewViewport?: "desktop" | "mobile";
}

export default function HbsNavbar({ content, previewConfig, previewViewport }: HbsNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [drawerTop, setDrawerTop] = useState(64);

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isPreview = Boolean(previewConfig);
  const forceMobile = previewViewport === "mobile";

  // Safely parse dynamic navbar CMS settings from content.ctaSettings or use previewConfig
  const navConfig = useMemo<HbsNavbarConfig>(() => {
    if (previewConfig) return previewConfig;

    if (content.ctaSettings) {
      try {
        const parsed =
          typeof content.ctaSettings === "string"
            ? JSON.parse(content.ctaSettings)
            : content.ctaSettings;
        if (parsed && typeof parsed === "object") {
          const raw = parsed.navbar || parsed;
          return {
            navItems: Array.isArray(raw.navItems)
              ? raw.navItems
              : DEFAULT_NAVBAR_CONFIG.navItems,
            primaryCta: {
              ...DEFAULT_NAVBAR_CONFIG.primaryCta,
              ...(raw.primaryCta || {}),
            },
            contactActions: {
              ...DEFAULT_NAVBAR_CONFIG.contactActions,
              ...(raw.contactActions || {}),
            },
            behaviour: {
              ...DEFAULT_NAVBAR_CONFIG.behaviour,
              ...(raw.behaviour || {}),
            },
            animation: {
              ...DEFAULT_NAVBAR_CONFIG.animation,
              ...(raw.animation || {}),
            },
            branding: {
              ...DEFAULT_NAVBAR_CONFIG.branding,
              ...(raw.branding || {}),
            },
            accessibility: {
              ...DEFAULT_NAVBAR_CONFIG.accessibility,
              ...(raw.accessibility || {}),
            },
          };
        }
      } catch {
        // Fall back gracefully
      }
    }
    return DEFAULT_NAVBAR_CONFIG;
  }, [content.ctaSettings, previewConfig]);

  // Portal target is only available after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Mobile menu state helpers (single source of truth: mobileMenuOpen) ──
  const measureDrawerTop = useCallback(() => {
    const el = headerRef.current;
    if (!el) return;
    setDrawerTop(Math.max(0, Math.round(el.getBoundingClientRect().bottom)));
  }, []);

  const openMenu = useCallback(() => {
    measureDrawerTop();
    setMobileMenuOpen(true);
  }, [measureDrawerTop]);

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMobileMenuOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  }, []);

  // Close mobile menu on route change (covers link clicks + browser back/forward)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Browser back/forward on the same path (hash/query) must also close the menu
  useEffect(() => {
    const onPop = () => setMobileMenuOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // While open: lock page scroll, keep drawer anchored under header, trap focus, ESC to close
  useEffect(() => {
    if (!mobileMenuOpen) return;

    // ESC closes (also in admin preview)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (isPreview || e.key !== "Tab") return;

      // Focus trap: hamburger + drawer focusables
      const panel = drawerRef.current;
      const btn = menuButtonRef.current;
      if (!panel || !btn) return;
      const items = [
        btn,
        ...Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")),
      ];
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !items.includes(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // Move focus into the navigation
    const focusRaf = requestAnimationFrame(() => {
      drawerRef.current?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
    });

    if (isPreview) {
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        cancelAnimationFrame(focusRaf);
      };
    }

    // Body scroll lock (overflow-based so the sticky header stays put)
    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    // Keep the drawer flush with the header bottom (compacting header, rotation, resize)
    const onResize = () => {
      if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
        setMobileMenuOpen(false);
        return;
      }
      measureDrawerTop();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    const ro =
      typeof ResizeObserver !== "undefined" && headerRef.current
        ? new ResizeObserver(() => measureDrawerTop())
        : null;
    if (ro && headerRef.current) ro.observe(headerRef.current);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(focusRaf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      ro?.disconnect();
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.paddingRight = prev.bodyPaddingRight;
    };
  }, [mobileMenuOpen, isPreview, closeMenu, measureDrawerTop]);

  const isSubdomain = process.env.NEXT_PUBLIC_HBS_SUBDOMAIN_ACTIVE === "true";
  const prefix = isSubdomain ? "" : "/hbs";
  const homeHref = prefix || "/";

  const getHrefForId = (id: string) => {
    switch (id) {
      case "home":
        return homeHref;
      case "about":
        return `${prefix}/about`;
      case "services":
        return `${prefix}/services`;
      case "projects":
        return `${prefix}/projects`;
      case "why-choose-us":
        return `${prefix}/why-choose-us`;
      case "gallery":
        return `${prefix}/projects`;
      case "contact":
        return `${prefix}/contact`;
      default:
        return `${prefix}/${id}`;
    }
  };

  const dynamicLinks = [...navConfig.navItems]
    .filter((item) => item.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item) => ({
      id: item.id,
      label: item.label,
      href: getHrefForId(item.id),
    }));

  const navLinks = dynamicLinks.length > 0 ? dynamicLinks : [
    { id: "home", label: "Home", href: homeHref },
    { id: "about", label: "About", href: `${prefix}/about` },
    { id: "services", label: "Services", href: `${prefix}/services` },
    { id: "projects", label: "Projects", href: `${prefix}/projects` },
    { id: "why-choose-us", label: "Why Choose Us", href: `${prefix}/why-choose-us` },
    { id: "gallery", label: "Gallery", href: `${prefix}/projects` },
    { id: "contact", label: "Contact", href: `${prefix}/contact` },
  ];

  // CTA destinations & enablement
  const primaryCtaDestination = navConfig.primaryCta.destination?.startsWith("http")
    ? navConfig.primaryCta.destination
    : `${prefix}${navConfig.primaryCta.destination?.startsWith("/") ? "" : "/"}${navConfig.primaryCta.destination || "/contact"}`;

  const isPrimaryCtaEnabled = navConfig.primaryCta.enabled !== false;
  const activePhone = navConfig.contactActions.phone || content.phone || "+91 9482877757";
  const activeWhatsapp = navConfig.contactActions.whatsappNumber || content.whatsapp || "+91 9482877757";

  const isCallEnabled = navConfig.contactActions.callEnabled !== false && Boolean(activePhone);
  const isWhatsappEnabled = navConfig.contactActions.whatsappEnabled !== false && Boolean(activeWhatsapp);

  const phoneRaw = cleanTelNumber(activePhone);
  const contactWaUrl = getContactWhatsAppUrl(activeWhatsapp);

  // Behaviour settings
  const isSticky = navConfig.behaviour?.sticky !== false;
  const compactOnScroll = navConfig.behaviour?.compactOnScroll !== false;
  const transparentAtTop = navConfig.behaviour?.transparentAtTop === true;
  const showActiveIndicator = navConfig.behaviour?.activeIndicator !== false;

  // Animation settings
  const animSpeedMs =
    navConfig.animation?.speed === "fast"
      ? "180ms"
      : navConfig.animation?.speed === "slow"
      ? "360ms"
      : "240ms";

  const isAnimated = navConfig.animation?.navbarAnimation !== false;
  const isMobileAnim = navConfig.animation?.mobileMenuAnimation !== false;
  const drawerShift =
    navConfig.animation?.intensity === "subtle"
      ? "4px"
      : navConfig.animation?.intensity === "strong"
      ? "12px"
      : "8px";
  const reducedMotionSafe = navConfig.accessibility?.reducedMotionSafe !== false;

  // Mobile drawer CSS variables (CMS-driven). Animation OFF => instant state change.
  const mobileNavVars = {
    "--hbs-drawer-speed": isMobileAnim ? animSpeedMs : "0ms",
    "--hbs-drawer-stagger": isMobileAnim ? "35ms" : "0ms",
    "--hbs-drawer-shift": drawerShift,
    "--hbs-drawer-top": `${drawerTop}px`,
  } as React.CSSProperties;

  // Alt text & Branding
  const logoAlt = navConfig.branding?.logoAltText || "Hind Building Solutions";
  const logoImageSrc = content.logoMark || content.logoPrimary || content.logo || "/hbs-icon.jpg";
  const logoMobileSrc = content.logoMobile || logoImageSrc;
  // Full brand name in navbar: "Hind Building Solutions"
  const brandTitle = "Hind Building Solutions";
  const brandSubtitle = navConfig.branding?.brandSubtitle || "Engineering & Turnkey Solutions";
  const navLandmarkLabel = navConfig.accessibility?.menuAriaLabel || "Mobile navigation";

  // Responsive class switches (admin mobile preview forces the mobile layout)
  const desktopOnlyFlex = forceMobile ? "hidden" : "hidden lg:flex";
  const mobileOnlyFlex = forceMobile ? "flex" : "flex lg:hidden";
  const logoLayout = forceMobile ? "flex-1 min-w-0" : "flex-1 min-w-0 lg:flex-none lg:shrink-0";

  // Check if a link is active (including nested service/project slugs)
  const isLinkActive = (href: string) => {
    if (href === homeHref) {
      return pathname === homeHref;
    }
    return pathname === href || (Boolean(pathname) && pathname.startsWith(href + "/"));
  };

  // ── Mobile navigation drawer (shared by portal + inline preview) ──────────
  const headerInView = drawerTop > 0;
  const showWa = isWhatsappEnabled;
  const showCall = isCallEnabled;

  const mobileDrawer = (
    <div
      id={MOBILE_NAV_ID}
      data-open={mobileMenuOpen ? "true" : "false"}
      style={mobileNavVars}
      className={`${isPreview ? "hbs-mnav-fullscreen-glass--inline" : "hbs-mnav-fullscreen-glass"} ${
        reducedMotionSafe ? "hbs-mnav--rm-safe" : ""
      }`}
      aria-hidden={!mobileMenuOpen}
      role="dialog"
      aria-modal="true"
      aria-label={navLandmarkLabel}
    >
      {/* ── Top Bar: Header with Brand on Left and Easy-to-tap 44x44 Close 'X' Button on Right ── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-300/60 max-w-md mx-auto w-full shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hibuild-logo.png"
            alt={logoAlt}
            className="h-9 w-auto object-contain shrink-0"
          />
        </div>

        {/* 44×44px circular close button — super easy to tap */}
        <button
          type="button"
          onClick={() => closeMenu(true)}
          className="w-11 h-11 rounded-full bg-slate-900/10 hover:bg-slate-900/15 active:bg-slate-900/20 border border-slate-900/10 text-slate-900 flex items-center justify-center transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 shrink-0 shadow-xs backdrop-blur-md"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
        </button>
      </div>

      {/* ── Center Section: Everything Centered in the Middle of the Screen ("mid me aaye") ── */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-6 max-w-sm mx-auto w-full text-center">
        {/* Centered Navigation Links */}
        <nav aria-label={navLandmarkLabel} className="w-full">
          <ul className="flex flex-col items-center gap-2 w-full">
            {navLinks.map((link, idx) => {
              const active = isLinkActive(link.href);
              return (
                <li
                  key={link.id || link.href}
                  className="hbs-mnav__item w-full flex justify-center"
                  style={{ "--i": idx } as React.CSSProperties}
                >
                  <Link
                    href={link.href}
                    onClick={() => closeMenu(false)}
                    tabIndex={mobileMenuOpen ? undefined : -1}
                    className={`inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-2xl text-[21px] tracking-tight transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                      active
                        ? "bg-slate-950 text-white font-extrabold shadow-lg w-full max-w-[280px]"
                        : "text-slate-800 font-bold hover:text-slate-950 hover:bg-slate-900/5 w-full max-w-[280px]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && showActiveIndicator && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/25 shrink-0" aria-hidden="true" />
                    )}
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Centered CTAs Section */}
        {(isPrimaryCtaEnabled || showWa || showCall) && (
          <div
            className="hbs-mnav__item w-full max-w-[280px] mx-auto mt-6 pt-5 border-t border-slate-300/60 flex flex-col items-center gap-2.5"
            style={{ "--i": navLinks.length } as React.CSSProperties}
          >
            {isPrimaryCtaEnabled && (
              <Link
                href={primaryCtaDestination}
                data-hbs-cta="quote"
                onClick={() => closeMenu(false)}
                tabIndex={mobileMenuOpen ? undefined : -1}
                className="w-full min-h-[48px] rounded-full inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-850 active:bg-slate-900 text-white font-bold text-[14px] shadow-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <span>{navConfig.primaryCta.label || "Get Free Quote"}</span>
                <ArrowRight className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
              </Link>
            )}

            {(showWa || showCall) && (
              <div className={`grid gap-2 w-full ${showWa && showCall ? "grid-cols-2" : "grid-cols-1"}`}>
                {showWa && (
                  <a
                    href={contactWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-hbs-cta="whatsapp"
                    onClick={() => closeMenu(false)}
                    tabIndex={mobileMenuOpen ? undefined : -1}
                    className="min-h-[44px] rounded-full inline-flex items-center justify-center gap-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-[13px] shadow-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{navConfig.contactActions.whatsappLabel || "WhatsApp"}</span>
                  </a>
                )}
                {showCall && (
                  <a
                    href={`tel:${phoneRaw}`}
                    data-hbs-cta="call"
                    onClick={() => closeMenu(false)}
                    tabIndex={mobileMenuOpen ? undefined : -1}
                    className="min-h-[44px] rounded-full inline-flex items-center justify-center gap-1.5 px-3 bg-white/90 hover:bg-white active:bg-slate-100 border border-slate-300/80 text-slate-900 font-semibold text-[13px] shadow-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                    aria-label={`Call Hind Building Solutions at ${activePhone}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                    <span className="truncate">Call Us</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom: Centered Endorsement ── */}
      <div className="pt-2 text-center shrink-0 max-w-sm mx-auto w-full">
        <p className="text-[11px] text-slate-500 font-medium">
          A Specialized Division of Hindustan Projects (HiPRO)
        </p>
      </div>
    </div>
  );

  return (
    <header
      ref={headerRef}
      style={{ "--hbs-nav-speed": isAnimated ? animSpeedMs : "0ms", ...mobileNavVars } as React.CSSProperties}
      className={`w-full z-50 transition-all duration-300 ease-out border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs ${
        isSticky ? "sticky top-0" : "relative"
      }`}
    >
      {/* ── TOP ANNOUNCEMENT BAR (Deep Elegant Blue) ── */}
      <div className="w-full bg-[#0D2D5E] text-white text-[11px] sm:text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-white/10 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/90 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>A Brand Under Hindustan Projects</span>
          </div>
          <div className="flex items-center gap-5 text-white/90">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span>Our Locations: Rajasthan</span>
            </span>
            <span className="text-white/30">|</span>
            <a
              href={`tel:${phoneRaw}`}
              className="flex items-center gap-1.5 text-white hover:text-red-200 font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>Call Now: {activePhone}</span>
            </a>
          </div>
        </div>
      </div>

      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-300 ease-out ${
          scrolled && compactOnScroll ? "h-14 sm:h-[58px]" : "h-16 sm:h-[68px]"
        }`}
      >
        {/* ── LEFT: HiBUILD Brand Logo ──────────────── */}
        <Link
          href={homeHref}
          className={`${logoLayout} flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-lg p-1 transition-transform duration-200 active:scale-[0.98]`}
          aria-label="Hind Building Solutions Homepage"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hibuild-logo.png"
            alt="HiBUILD - Hind Building Solutions"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>

        {/* ── CENTER: Desktop Navigation Links ──────────────────── */}
        <nav
          aria-label="Primary Navigation"
          className={`${desktopOnlyFlex} items-center gap-6 lg:gap-8`}
        >
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.id || link.href}
                href={link.href}
                className={`group relative py-1 text-[15px] tracking-normal transition-all duration-200 flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  active
                    ? "text-red-600 font-bold"
                    : "text-slate-800 hover:text-red-600 font-semibold"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span>{link.label}</span>
                {active ? (
                  <span
                    aria-hidden="true"
                    className="mt-1 h-[2.5px] w-full bg-red-600 rounded-full"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="mt-1 h-[2.5px] w-0 bg-red-600/0 rounded-full group-hover:w-full group-hover:bg-red-600/50 transition-all duration-200"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── RIGHT: Secondary Call + Primary Get Free Consultation ───── */}
        <div className={`${desktopOnlyFlex} items-center gap-2.5`}>
          {isPrimaryCtaEnabled && (
            <Link
              href={primaryCtaDestination}
              data-hbs-cta="quote"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 group"
            >
              <span>{navConfig.primaryCta.label || "Get a Free Consultation"}</span>
              <ArrowRight className="w-4 h-4 shrink-0 opacity-90 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
            </Link>
          )}
        </div>

        {/* ── MOBILE: Refined Tactile Hamburger Button ──── */}
        <div className={`${mobileOnlyFlex} items-center shrink-0`}>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => (mobileMenuOpen ? closeMenu(false) : openMenu())}
            className={`hbs-burger-btn ${reducedMotionSafe ? "hbs-mnav--rm-safe" : ""} relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 text-slate-900 shadow-2xs transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900`}
            data-open={mobileMenuOpen ? "true" : "false"}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls={MOBILE_NAV_ID}
          >
            <span className="hbs-burger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Admin preview renders the drawer inline inside the phone frame */}
      {isPreview && mobileDrawer}

      {/* Public site: portal to <body> so the header's backdrop-filter can't trap position:fixed */}
      {!isPreview && isClient && createPortal(mobileDrawer, document.body)}
    </header>
  );
}
