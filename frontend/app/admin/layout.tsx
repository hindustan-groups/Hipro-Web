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
    <div className="fixed inset-0 w-full h-full flex overflow-hidden bg-slate-50/90 text-slate-900 font-sans antialiased selection:bg-red-500/20 selection:text-red-900 admin-root-viewport">
      {/* Subtle Apple-style Ambient Glow Blooms */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-red-200/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-indigo-200/15 rounded-full blur-3xl pointer-events-none" />

      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
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
