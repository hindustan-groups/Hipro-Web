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
    <div
      className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-900"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
