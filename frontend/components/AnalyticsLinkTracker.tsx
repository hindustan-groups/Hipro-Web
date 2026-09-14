"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Global click event listener for contact links (tel:, mailto:, wa.me).
 * Captures clicks transparently across all server and client components without altering markup.
 */
export default function AnalyticsLinkTracker() {
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target || !target.href) return;

      const href = target.href.toLowerCase();

      // WhatsApp links (wa.me or api.whatsapp.com)
      if (href.includes("wa.me") || href.includes("whatsapp.com")) {
        const location =
          target.closest("footer")
            ? "footer"
            : target.closest("[role='region']")
            ? "mobile_sticky_bar"
            : target.closest("#section-cta")
            ? "cta_section"
            : "body";

        trackEvent("contact_whatsapp_click", { location });
        return;
      }

      // Phone calls (tel:)
      if (href.startsWith("tel:")) {
        const location =
          target.closest("footer")
            ? "footer"
            : target.closest("[role='region']")
            ? "mobile_sticky_bar"
            : target.closest("#section-cta")
            ? "cta_section"
            : target.closest("header") || target.closest("nav")
            ? "header"
            : "body";

        trackEvent("contact_phone_click", { location });
        return;
      }

      // Email links (mailto:)
      if (href.startsWith("mailto:")) {
        const location = target.closest("footer") ? "footer" : "body";

        trackEvent("contact_email_click", { location });
        return;
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  return null;
}
