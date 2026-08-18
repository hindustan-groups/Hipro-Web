"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({ 
  value, 
  duration = 2000 
}: { 
  value?: string | number; 
  duration?: number;
}) {
  const [count, setCount] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const valStr = String(value ?? "0");
    let targetNum = 0;
    let prefix = "";
    let suffix = "";
    let isFloat = false;

    const match = valStr.match(/^([^0-9]*)([0-9.,]+)(.*)$/);
    
    if (match) {
      prefix = match[1];
      const numStr = match[2].replace(/,/g, '');
      targetNum = parseFloat(numStr) || 0;
      isFloat = numStr.includes('.');
      suffix = match[3];
    } else {
      setCount(valStr);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            const easeOutProgress = progress * (2 - progress);
            const currentNum = targetNum * easeOutProgress;
            
            let displayNum = "";
            if (isFloat) {
              displayNum = currentNum.toFixed(1);
            } else {
              displayNum = Math.floor(currentNum).toLocaleString("en-US");
            }
            
            setCount(`${prefix}${displayNum}${suffix}`);
            
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(valStr); // Ensure exact final value
            }
          };
          window.requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref} suppressHydrationWarning>{count}</span>;
}
