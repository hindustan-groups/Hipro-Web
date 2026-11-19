import { redirect } from "next/navigation";

interface VerifyPartnerProps {
  searchParams?: Promise<{
    trackingId?: string;
    id?: string;
  }>;
}

/**
 * Backward compatibility route for legacy Smart Card QR codes printed with /verify-partner.
 * Redirects incoming scans to the canonical partner verification page.
 */
export default async function VerifyPartnerPage({ searchParams }: VerifyPartnerProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const queryId = resolvedParams.id || resolvedParams.trackingId || "";
  if (queryId) {
    redirect(`/empanelment/verify-partner?id=${encodeURIComponent(queryId)}`);
  }
  redirect("/empanelment/verify-partner");
}
