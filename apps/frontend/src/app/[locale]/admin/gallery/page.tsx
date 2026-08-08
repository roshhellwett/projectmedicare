import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GalleryManager from "@/components/admin/GalleryManager";
import { getGalleryImages } from "@/lib/db/gallery";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery Manager — Janta Medicare LLP Admin",
  description: "Upload and manage photos for the public gallery page.",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  const images = await getGalleryImages();
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
        eyebrowIcon={<ImageIcon className="h-4 w-4" />}
        title="Photo Gallery"
        sub="Upload photos from recent camps and activities to display on your public gallery page."
      />
      <GalleryManager initialImages={images} />
    </div>
  );
}
