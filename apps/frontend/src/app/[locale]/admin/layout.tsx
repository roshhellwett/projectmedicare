import { isAdminAuthenticated } from "@/lib/auth/guard";
import { isAdminPasswordConfigured } from "@/lib/auth/session";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminNav from "@/components/admin/AdminNav";
import AdminStoreSelector from "@/components/admin/AdminStoreSelector";
import { cookies } from "next/headers";
import { getPharmacyStores } from "@/lib/db/stores";
import { Store } from "lucide-react";

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
    <div className="bg-background relative min-h-screen">
      {!selectedStore && <AdminStoreSelector stores={stores} />}
      
      <div className="border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-40">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <AdminNav />
          <div className="flex items-center gap-4">
            {selectedStore && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <Store className="h-3.5 w-3.5" />
                  {selectedStore.name}
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
                    Change Store
                  </button>
                </form>
              </div>
            )}
            <AdminLogoutButton />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
