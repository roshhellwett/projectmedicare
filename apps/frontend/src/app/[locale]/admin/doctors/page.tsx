import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DoctorManager from "@/components/admin/DoctorManager";
import { getDoctors } from "@/lib/db/doctors";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Doctor Manager — Janta Medicare LLP Admin",
  description: "Manage doctor profiles and chamber schedules.",
  robots: { index: false, follow: false },
};

export default async function AdminDoctorsPage() {
  const doctors = await getDoctors();
  const locale = await getLocale();

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-6">
        <Link
          href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
      <PageHeader
        eyebrow="Admin"
        eyebrowIcon={<Stethoscope className="h-4 w-4" />}
        title="Doctor Manager"
        sub="Add, edit, or remove doctor profiles displayed on the website."
      />
      <DoctorManager initialDoctors={doctors} />
    </div>
  );
}
