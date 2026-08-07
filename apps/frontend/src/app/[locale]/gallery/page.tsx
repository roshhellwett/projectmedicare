import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { getGalleryImages } from "@/lib/db/gallery";
import PageHeader from "@/components/PageHeader";
import { Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("GalleryPage");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function GalleryPage() {
  const images = await getGalleryImages();
  const t = await getTranslations("GalleryPage");

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<ImageIcon className="h-4 w-4" />}
        title={t("title")}
        sub={t("sub")}
      />

      {images.length === 0 ? (
        <div className="card mt-8 p-12 text-center text-muted">
          <ImageIcon className="mx-auto h-12 w-12 opacity-20 mb-3" />
          <p>{t("empty")}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative h-48 w-full sm:h-56 md:h-64 overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-all hover:shadow-md"
            >
              <Image
                src={image.url}
                alt={t("altText")}
                fill
                priority={index < 4}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
