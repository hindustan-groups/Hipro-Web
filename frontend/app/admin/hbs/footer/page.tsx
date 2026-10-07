import { redirect } from "next/navigation";

export default function HbsFooterRedirectPage() {
  redirect("/admin/hbs/settings?tab=footer");
}
