import { getTranslations, getLocale } from "next-intl/server";
import { getStats } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
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
import {
  FileText,
  ShoppingBag,
  Box,
  ClipboardList,
  MessageCircle,
} from "lucide-react";
import { getFeedbacks } from "@/lib/db/feedbacks";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const t = await getTranslations("AdminPage");
  const locale = await getLocale();
  const [
    stats,
    camp,
    bulletins,
    gallery,
    applications,
    orders,
    doctors,
    packages,
    packageOrders,
    feedbacks,
  ] = await Promise.all([
    getStats(),
    getActiveCamp(),
    getVisibleBulletins(50),
    getGalleryImages(),
    getJobApplications(),
    getMedicineOrders(),
    getDoctors(),
    getPackages(),
    getPackageOrders(),
    getFeedbacks(),
  ]);

  const tiles = [
    {
      href: `/${locale}/admin/medicines`,
      icon: Pill,
      tone: "is-green",
      title: t("medicines.title"),
      desc: t("medicines.desc"),
      status: `${stats.medicinesCount.toLocaleString()} medicines in catalogue`,
      cta: "Open medicines manager",
    },
    {
      href: `/${locale}/admin/orders`,
      icon: ShoppingBag,
      tone: "is-green",
      title: t("orders.title"),
      desc: t("orders.desc"),
      status: `${orders.length} order(s) total`,
      cta: t("orders.button"),
    },
    {
      href: `/${locale}/admin/rates`,
      icon: FlaskConical,
      tone: "is-accent",
      title: t("rates.title"),
      desc: t("rates.desc"),
      status: `${stats.ratesCount.toLocaleString()} lab tests listed`,
      cta: "Open rates manager",
    },
    {
      href: `/${locale}/admin/packages`,
      icon: Box,
      tone: "is-accent",
      title: "Health Packages",
      desc: "Manage health diagnostic packages, their prices, and featured status.",
      status: `${packages.length} package(s) available`,
      cta: "Open package manager",
    },
    {
      href: `/${locale}/admin/package-orders`,
      icon: ClipboardList,
      tone: "is-accent",
      title: "Package Bookings",
      desc: "View and manage incoming customer bookings for health packages.",
      status: `${packageOrders.length} booking(s) total`,
      cta: "Open package bookings",
    },
    {
      href: `/${locale}/admin/doctors`,
      icon: Stethoscope,
      tone: "",
      title: "Doctors",
      desc: "Manage doctor profiles, specialties, and schedules for the public website.",
      status: `${doctors.length} doctor(s) listed`,
      cta: "Open doctor manager",
    },
    {
      href: `/${locale}/admin/bulletins`,
      icon: Megaphone,
      tone: "is-green",
      title: "Live bulletin board",
      desc: "Post notices and time-limited offers. Offers expire on their own and are cleaned up by the worker.",
      status: `${bulletins.length} notice(s) currently visible`,
      cta: "Open bulletin manager",
    },
    {
      href: `/${locale}/admin/camp`,
      icon: CalendarHeart,
      tone: "",
      title: "Sunday camp post",
      desc: "Publish this week's free camp with venue, date and one photo. The previous post is archived automatically.",
      status: camp
        ? `Live: ${formatCampDate(camp.camp_date)} · ${camp.venue}`
        : "No camp published yet",
      cta: "Open camp manager",
    },
    {
      href: `/${locale}/admin/gallery`,
      icon: ImageIcon,
      tone: "",
      title: "Photo Gallery",
      desc: "Upload and manage photos of activities to display on the public gallery page.",
      status: `${gallery.length} photo(s) currently published`,
      cta: "Open gallery manager",
    },
    {
      href: `/${locale}/admin/careers`,
      icon: FileText,
      tone: "is-accent",
      title: t("careers.title"),
      desc: t("careers.desc"),
      status: `${applications.length} application(s) received`,
      cta: t("careers.button"),
    },
    {
      href: `/${locale}/admin/feedbacks`,
      icon: MessageCircle,
      tone: "is-green",
      title: t("feedbacks.title"),
      desc: t("feedbacks.desc"),
      status: `${feedbacks.length} feedback(s) received`,
      cta: t("feedbacks.button"),
    },
  ];

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<ShieldCheck className="h-4 w-4" />}
        title={t("title")}
        sub={t("sub")}
      />

      {/* Connection status */}
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

      {/* Stats */}
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

      {/* Management tiles */}
      <div className="grid gap-4 md:grid-cols-2">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="card card-hover group flex flex-col"
          >
            <span className={`icon-tile ${tile.tone}`}>
              <tile.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg">{tile.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              {tile.desc}
            </p>
            <p className="mt-3 text-xs font-semibold text-secondary-dark">
              {tile.status}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 border-t border-line pt-4 text-sm font-semibold text-primary">
              {tile.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
