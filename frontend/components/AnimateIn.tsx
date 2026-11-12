"use client";
import React, { useEffect, useRef, useState } from "react";

export default function AnimateIn({ 
  children, 
  delay = 0, 
  className = "",
  direction = "up"
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "fade";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user's reduced-motion preference
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "50px" }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const getHiddenTransform = () => {
    switch (direction) {
      case "down": return "-translate-y-4";
      case "left": return "translate-x-4";
      case "right": return "-translate-x-4";
      case "fade": return "";
      case "up":
      default: return "translate-y-4";
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-500 ease-out will-change-[opacity,transform] ${
        isVisible 
          ? "opacity-100 translate-x-0 translate-y-0" 
          : `opacity-0 ${getHiddenTransform()}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
