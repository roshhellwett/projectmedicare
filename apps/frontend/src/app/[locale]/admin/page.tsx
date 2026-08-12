import { getTranslations, getLocale } from "next-intl/server";
import { getStats } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  CalendarHeart,
  Database,
  FlaskConical,
  LayoutDashboard,
  Megaphone,
  Pill,
  ShieldCheck,
  Image as ImageIcon,
  HardDrive,
  Stethoscope,
  Settings,
  FileText,
  ShoppingBag,
  Box,
  ClipboardList,
  MessageCircle,
} from "lucide-react";
import { getActiveCamp } from "@/lib/db/camp";
import { getVisibleBulletins } from "@/lib/db/bulletins";
import { getGalleryImages } from "@/lib/db/gallery";
import { getJobApplications } from "@/lib/db/careers";
import { getMedicineOrders } from "@/lib/db/orders";
import { getDoctors } from "@/lib/db/doctors";
import { getPackages } from "@/lib/db/packages";
import { getPackageOrders } from "@/lib/db/package-orders";
import { formatCampDate } from "@/lib/utils/ist";
import { getFeedbacks } from "@/lib/db/feedbacks";
import { getAllAnnouncements } from "@/lib/db/announcements";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import RefreshStatsButton from "@/components/admin/RefreshStatsButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function Tile({
  href,
  icon: Icon,
  tone,
  title,
  desc,
  status,
  cta,
  badge,
}: {
  href: string;
  icon: any;
  tone: string;
  title: string;
  desc: string;
  status: string;
  cta: string;
  badge?: number;
}) {
  return (
    <Link href={href} className="card card-hover group flex flex-col relative">
      {badge ? (
        <span className="absolute top-4 right-4 flex h-6 items-center justify-center rounded-full bg-error px-2 text-xs font-bold text-white shadow-sm ring-2 ring-background">
          🔥 {badge} New
        </span>
      ) : null}
      <span className={`icon-tile ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {desc}
      </p>
      <p className="mt-3 text-xs font-semibold text-secondary-dark">
        {status}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 border-t border-line pt-4 text-sm font-semibold text-primary">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function SkeletonTile() {
  return (
    <div className="card flex flex-col animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-muted" />
      <div className="mt-4 h-6 w-1/2 rounded bg-muted" />
      <div className="mt-2 h-4 w-full rounded bg-muted" />
      <div className="mt-1 h-4 w-4/5 rounded bg-muted" />
      <div className="mt-3 h-3 w-1/3 rounded bg-muted" />
      <div className="mt-5 border-t border-line pt-4">
        <div className="h-4 w-1/4 rounded bg-muted" />
      </div>
    </div>
  );
}

async function AlertsGroup({ currentStoreId, locale }: { currentStoreId?: string, locale: string }) {
  noStore();
  const [orders, packageOrders, feedbacks] = await Promise.all([
    getMedicineOrders(),
    getPackageOrders(),
    getFeedbacks(),
  ]);

  const pendingOrders = orders.filter(o => o.status === "pending" && (!currentStoreId || !o.assigned_store_id)).slice(0, 3);
  const pendingPackages = packageOrders.filter(o => o.status === "pending" && (!currentStoreId || !o.store_id)).slice(0, 3);
  const recentFeedbacks = feedbacks.slice(0, 3);

  if (pendingOrders.length === 0 && pendingPackages.length === 0 && recentFeedbacks.length === 0) {
    return null; // Nothing urgent
  }

  return (
    <div className="mb-10 space-y-6">
      <h2 className="text-lg font-bold text-foreground">Immediate Attention Required</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Medicine Orders Alert */}
        {pendingOrders.length > 0 && (
          <div className="card !p-0 overflow-hidden border-error/30 ring-1 ring-error/20">
            <div className="bg-error/10 px-4 py-3 border-b border-error/20 flex justify-between items-center">
              <h3 className="font-semibold text-error flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                New Medicine Orders
              </h3>
              <span className="text-xs font-bold bg-error text-white px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
            </div>
            <div className="divide-y divide-line">
              {pendingOrders.map(order => (
                <div key={order.id} className="p-4 bg-surface hover:bg-surface-muted transition-colors">
                  <div className="font-medium text-sm">{order.name}</div>
                  <div className="text-xs text-muted mt-1">{new Date(order.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <Link href={`/${locale}/admin/orders`} className="block text-center text-sm font-semibold text-primary py-3 hover:bg-primary/5 transition-colors">
              View All Orders
            </Link>
          </div>
        )}

        {/* Package Bookings Alert */}
        {pendingPackages.length > 0 && (
          <div className="card !p-0 overflow-hidden border-orange-500/30 ring-1 ring-orange-500/20">
            <div className="bg-orange-500/10 px-4 py-3 border-b border-orange-500/20 flex justify-between items-center">
              <h3 className="font-semibold text-orange-600 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                New Package Bookings
              </h3>
              <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">{pendingPackages.length}</span>
            </div>
            <div className="divide-y divide-line">
              {pendingPackages.map(order => (
                <div key={order.id} className="p-4 bg-surface hover:bg-surface-muted transition-colors">
                  <div className="font-medium text-sm">{order.customer_name}</div>
                  <div className="text-xs text-muted mt-1">{new Date(order.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <Link href={`/${locale}/admin/package-orders`} className="block text-center text-sm font-semibold text-orange-600 py-3 hover:bg-orange-500/5 transition-colors">
              View All Bookings
            </Link>
          </div>
        )}

        {/* Feedbacks Alert */}
        {recentFeedbacks.length > 0 && (
          <div className="card !p-0 overflow-hidden border-blue-500/30 ring-1 ring-blue-500/20">
            <div className="bg-blue-500/10 px-4 py-3 border-b border-blue-500/20 flex justify-between items-center">
              <h3 className="font-semibold text-blue-600 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Recent Feedbacks
              </h3>
            </div>
            <div className="divide-y divide-line">
              {recentFeedbacks.map(fb => (
                <div key={fb.id} className="p-4 bg-surface hover:bg-surface-muted transition-colors">
                  <div className="font-medium text-sm">{fb.name}</div>
                  <div className="text-xs text-muted mt-1 truncate">{fb.note}</div>
                </div>
              ))}
            </div>
            <Link href={`/${locale}/admin/feedbacks`} className="block text-center text-sm font-semibold text-blue-600 py-3 hover:bg-blue-500/5 transition-colors">
              View All Feedbacks
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

async function OperationsGroup({ currentStoreId, locale, t }: { currentStoreId?: string, locale: string, t: any }) {
  noStore();
  const [orders, packageOrders] = await Promise.all([
    getMedicineOrders(),
    getPackageOrders()
  ]);

  const relevantOrders = orders.filter((o) => {
    if (o.status !== "pending") return false;
    if (!currentStoreId) return true;
    if (o.assigned_store_id && o.assigned_store_id !== currentStoreId) return false;
    return true;
  });

  const relevantPackageOrders = packageOrders.filter((o) => {
    if (o.status !== "pending") return false;
    if (!currentStoreId) return true;
    if (o.store_id && o.store_id !== currentStoreId) return false;
    return true;
  });

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-foreground">Operations & Sales</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Tile
          href={`/${locale}/admin/orders`}
          icon={ShoppingBag}
          tone="is-green"
          title={t("orders.title")}
          desc={t("orders.desc")}
          status={`${relevantOrders.length} pending order(s)`}
          cta={t("orders.button")}
          badge={relevantOrders.length > 0 ? relevantOrders.length : undefined}
        />
        <Tile
          href={`/${locale}/admin/package-orders`}
          icon={ClipboardList}
          tone="is-accent"
          title="Package Bookings"
          desc="View and manage incoming customer bookings for health packages."
          status={`${relevantPackageOrders.length} pending booking(s)`}
          cta="Open package bookings"
          badge={relevantPackageOrders.length > 0 ? relevantPackageOrders.length : undefined}
        />
      </div>
    </div>
  );
}

async function CatalogGroup({ locale, t }: { locale: string, t: any }) {
  noStore();
  const [stats, packages, doctors] = await Promise.all([
    getStats(),
    getPackages(),
    getDoctors()
  ]);

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-foreground">Catalog Management</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Tile
          href={`/${locale}/admin/medicines`}
          icon={Pill}
          tone="is-green"
          title={t("medicines.title")}
          desc={t("medicines.desc")}
          status={`${stats.medicinesCount.toLocaleString()} medicines in catalogue`}
          cta="Open medicines manager"
        />
        <Tile
          href={`/${locale}/admin/rates`}
          icon={FlaskConical}
          tone="is-accent"
          title={t("rates.title")}
          desc={t("rates.desc")}
          status={`${stats.ratesCount.toLocaleString()} lab tests listed`}
          cta="Open rates manager"
        />
        <Tile
          href={`/${locale}/admin/packages`}
          icon={Box}
          tone="is-accent"
          title="Health Packages"
          desc="Manage health diagnostic packages, their prices, and featured status."
          status={`${packages.length} package(s) available`}
          cta="Open package manager"
        />
        <Tile
          href={`/${locale}/admin/doctors`}
          icon={Stethoscope}
          tone=""
          title="Doctors"
          desc="Manage doctor profiles, specialties, and schedules for the public website."
          status={`${doctors.length} doctor(s) listed`}
          cta="Open doctor manager"
        />
      </div>
    </div>
  );
}

async function ContentGroup({ locale }: { locale: string }) {
  noStore();
  const [bulletins, camp, announcements, gallery] = await Promise.all([
    getVisibleBulletins(50),
    getActiveCamp(),
    getAllAnnouncements(),
    getGalleryImages()
  ]);

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-foreground">Content & Marketing</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Tile
          href={`/${locale}/admin/bulletins`}
          icon={Megaphone}
          tone="is-green"
          title="Live bulletin board"
          desc="Post products and time-limited offers. Offers expire on their own and are cleaned up by the worker."
          status={`${bulletins.length} product(s) currently visible`}
          cta="Open bulletin manager"
        />
        <Tile
          href={`/${locale}/admin/camp`}
          icon={CalendarHeart}
          tone=""
          title="Sunday camp post"
          desc="Publish this week's free camp with venue, date and one photo. The previous post is archived automatically."
          status={camp ? `Live: ${formatCampDate(camp.camp_date)}` : "No camp published yet"}
          cta="Open camp manager"
        />
        <Tile
          href={`/${locale}/admin/announcements`}
          icon={Megaphone}
          tone="is-accent"
          title="Announcements"
          desc="Post dynamic announcement banners on the homepage."
          status={`${announcements.filter(a => a.is_active).length} active announcement(s)`}
          cta="Open announcements"
        />
        <Tile
          href={`/${locale}/admin/gallery`}
          icon={ImageIcon}
          tone=""
          title="Photo Gallery"
          desc="Upload and manage photos of activities to display on the public gallery page."
          status={`${gallery.length} photo(s) currently published`}
          cta="Open gallery manager"
        />
      </div>
    </div>
  );
}

async function InboxGroup({ locale, t }: { locale: string, t: any }) {
  noStore();
  const [applications, feedbacks] = await Promise.all([
    getJobApplications(),
    getFeedbacks()
  ]);

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-foreground">Inbox & System</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Tile
          href={`/${locale}/admin/feedbacks`}
          icon={MessageCircle}
          tone="is-green"
          title={t("feedbacks.title")}
          desc={t("feedbacks.desc")}
          status={`${feedbacks.length} feedback(s) received`}
          cta={t("feedbacks.button")}
        />
        <Tile
          href={`/${locale}/admin/careers`}
          icon={FileText}
          tone="is-accent"
          title={t("careers.title")}
          desc={t("careers.desc")}
          status={`${applications.length} application(s) received`}
          cta={t("careers.button")}
        />
        <Tile
          href={`/${locale}/admin/settings`}
          icon={Settings}
          tone="is-accent"
          title="Settings & API Keys"
          desc="Manage encrypted environment variables and third-party API keys."
          status="Secure Storage"
          cta="Open settings"
        />
      </div>
    </div>
  );
}

async function SystemStatusHeader({ t }: { t: any }) {
  noStore();
  const stats = await getStats();

  return (
    <>
      <div
        className={`card card-marked mb-6 !pl-6 ${stats.supabaseConnected ? "is-green" : "is-accent"}`}
      >
        <div className="flex min-w-0 items-start gap-3">
          <Database
            className={`mt-0.5 h-5 w-5 shrink-0 ${stats.supabaseConnected ? "text-secondary-dark" : "text-accent"}`}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {stats.supabaseConnected ? t("dbConnected") : t("dbMissing")}
            </p>
            <p className="mt-1 text-sm text-muted">
              {stats.supabaseConnected
                ? t("dbConnectedSub")
                : t("dbMissingSub")}
            </p>
          </div>
        </div>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Pill,
            value: stats.medicinesCount.toLocaleString(),
            label: "Total medicines",
            tone: "is-green",
          },
          {
            icon: FlaskConical,
            value: stats.ratesCount.toLocaleString(),
            label: "Total lab tests",
            tone: "is-accent",
          },
          {
            icon: LayoutDashboard,
            value: stats.supabaseConnected ? "Live" : "JSON",
            label: "Data source",
            tone: "",
          },
          {
            icon: HardDrive,
            value: `${(stats.storageSizeBytes / (1024 * 1024)).toFixed(1)} MB`,
            label: "Storage used (500 MB max)",
            tone:
              stats.storageSizeBytes / (1024 * 1024) > 400
                ? "is-accent"
                : "is-green",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="card flex min-w-0 items-center gap-3.5 !py-5"
          >
            <span className={`icon-tile ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="tnum block font-heading text-2xl font-bold leading-none text-primary-deep">
                {s.value}
              </span>
              <span className="mt-1 block truncate text-xs text-muted">
                {s.label}
              </span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default async function AdminPage() {
  noStore();
  const t = await getTranslations("AdminPage");
  const locale = await getLocale();
  const cookieStore = await cookies();
  const currentStoreId = cookieStore.get("admin_store_id")?.value;

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<ShieldCheck className="h-4 w-4" />}
        title={t("title")}
        sub={t("sub")}
      />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">System Status</h2>
        <form
          action={async () => {
            "use server";
            revalidateTag("stats", "max");
          }}
        >
          <RefreshStatsButton />
        </form>
      </div>

      <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded-xl mb-8"></div>}>
        <SystemStatusHeader t={t} />
      </Suspense>

      <Suspense fallback={
        <div className="mb-10 animate-pulse bg-muted rounded-xl h-64"></div>
      }>
        <AlertsGroup currentStoreId={currentStoreId} locale={locale} />
      </Suspense>

      <Suspense fallback={
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-foreground">Operations & Sales</h2>
          <div className="grid gap-4 md:grid-cols-2"><SkeletonTile /><SkeletonTile /></div>
        </div>
      }>
        <OperationsGroup currentStoreId={currentStoreId} locale={locale} t={t} />
      </Suspense>

      <Suspense fallback={
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-foreground">Catalog Management</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><SkeletonTile /><SkeletonTile /><SkeletonTile /><SkeletonTile /></div>
        </div>
      }>
        <CatalogGroup locale={locale} t={t} />
      </Suspense>

      <Suspense fallback={
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-foreground">Content & Marketing</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><SkeletonTile /><SkeletonTile /><SkeletonTile /><SkeletonTile /></div>
        </div>
      }>
        <ContentGroup locale={locale} />
      </Suspense>

      <Suspense fallback={
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-foreground">Inbox & System</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><SkeletonTile /><SkeletonTile /><SkeletonTile /></div>
        </div>
      }>
        <InboxGroup locale={locale} t={t} />
      </Suspense>

    </div>
  );
}
