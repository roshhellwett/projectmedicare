import { isAdminAuthenticated } from "@/lib/auth/guard";
import { isAdminPasswordConfigured } from "@/lib/auth/session";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminNav from "@/components/admin/AdminNav";
import ToastProvider from "@/components/Toast";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <>
        <AdminLogin
          configured={
            isAdminPasswordConfigured() &&
            Boolean(process.env.ADMIN_SESSION_SECRET)
          }
        />
        <ToastProvider />
      </>
    );
  }

  return (
    <div className="bg-background">
      <div className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <AdminNav />
          <AdminLogoutButton />
        </div>
      </div>
      {children}
      <ToastProvider />
    </div>
  );
}
