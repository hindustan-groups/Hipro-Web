import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PopupForm from "@/components/PopupForm";
import { findAll } from "@/lib/db";
import type { Settings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settingsArray = await findAll<Settings>("settings");
  const settings = settingsArray.length > 0 ? settingsArray[0] : null;

  return (
    <>
      <Navbar navConfigString={settings?.navigationConfig || null} />
      <main className="min-h-screen">
        {children}
      </main>
      <PopupForm />
      <Footer />
    </>
  );
}
