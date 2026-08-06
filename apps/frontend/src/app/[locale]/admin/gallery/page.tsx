import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GalleryManager from "@/components/admin/GalleryManager";
import { getGalleryImages } from "@/lib/db/gallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery Manager — Janta Medicare Admin",
  description: "Upload and manage photos for the public gallery page.",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="container py-10 md:py-14">
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
