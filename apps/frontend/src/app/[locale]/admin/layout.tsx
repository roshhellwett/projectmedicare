import { isAdminAuthenticated } from "@/lib/auth/guard";
import { isAdminPasswordConfigured } from "@/lib/auth/session";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminNav from "@/components/admin/AdminNav";
import AdminStoreSelector from "@/components/admin/AdminStoreSelector";
import { cookies } from "next/headers";
import { getPharmacyStores } from "@/lib/db/stores";
import { Store, Menu } from "lucide-react";
import Link from "next/link";
import MobileAdminNav from "@/components/admin/MobileAdminNav";

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
      </>
    );
  }

  const cookieStore = await cookies();
  const storeCookie = cookieStore.get("admin_store_id");
  const storeId = storeCookie?.value;

  const stores = await getPharmacyStores();
  const selectedStore = stores.find((s) => s.id === storeId);

  return (
    <div className="bg-background relative min-h-screen flex flex-col md:flex-row">
      {!selectedStore && <AdminStoreSelector stores={stores} />}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        <AdminNav />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:h-screen md:overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-30 px-4 py-3 flex items-center justify-between md:justify-end">
          {/* Mobile Header Left Side */}
          <div className="md:hidden flex items-center gap-3">
            <MobileAdminNav />
            <Link href="/en/admin" className="font-heading font-bold text-lg text-primary">
              Admin
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {selectedStore && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <Store className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{selectedStore.name}</span>
                  <span className="sm:hidden">Store</span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    const cookieStore = await cookies();
                    cookieStore.delete("admin_store_id");
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs text-muted hover:text-primary transition-colors underline underline-offset-2"
                  >
                    Change
                  </button>
                </form>
              </div>
            )}
            <AdminLogoutButton />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
