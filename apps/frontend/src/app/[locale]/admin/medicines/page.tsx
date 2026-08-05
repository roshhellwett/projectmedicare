import PageHeader from "@/components/PageHeader";
import AdminMedicinesTable from "@/components/AdminMedicinesTable";
import { Pill } from "lucide-react";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

export default async function AdminMedicinesPage() {
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
        eyebrow="Medicines"
        eyebrowIcon={<Pill className="h-4 w-4" />}
        title="Manage Medicines"
        sub="Add, edit, or delete medicines from the database. Changes are reflected on the website immediately."
      />

      <AdminMedicinesTable />
    </div>
  );
}
