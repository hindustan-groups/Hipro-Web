import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PopupForm from "@/components/PopupForm";
import BackButton from "@/components/BackButton";
import { findAll } from "@/lib/db";
import type { Settings, Service } from "@/lib/types";

export const revalidate = 60;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settingsArray, services] = await Promise.all([
    findAll<Settings>("settings"),
    findAll<Service>("services"),
  ]);
  const settings = settingsArray.length > 0 ? settingsArray[0] : null;

  return (
    <>
      <Navbar navConfigString={settings?.navigationConfig || null} services={services} />
      <BackButton />
      <main className="min-h-screen">
        {children}
      </main>
      <PopupForm />
      <Footer />
    </>
  );
}
