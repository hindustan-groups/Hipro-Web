import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminAccessWrapper from "@/components/admin/AdminAccessWrapper";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Panel — Hindustan Projects",
  description: "Admin dashboard",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/admin-login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/20 text-slate-900 font-sans relative">
      {/* Subtle Ambient Glassmorphic Glow Blooms */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-red-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-indigo-100/20 rounded-full blur-3xl pointer-events-none" />

      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-full">
          <AdminAccessWrapper user={user}>
            {children}
          </AdminAccessWrapper>
        </main>
      </div>
    </div>
  );
}
