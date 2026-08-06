import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryImages } from "@/lib/db/gallery";
import PageHeader from "@/components/PageHeader";
import { Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photo Gallery — Janta Medicare",
  description: "View photos from our recent health camps and community activities.",
};

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow="Gallery"
        eyebrowIcon={<ImageIcon className="h-4 w-4" />}
        title="Our Activities"
        sub="A glimpse into our recent health camps, events, and community services."
      />

      {images.length === 0 ? (
        <div className="card mt-8 p-12 text-center text-muted">
          <ImageIcon className="mx-auto h-12 w-12 opacity-20 mb-3" />
          <p>No photos available at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative h-48 w-full sm:h-56 md:h-64 overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-all hover:shadow-md"
            >
              <Image
                src={image.url}
                alt="Janta Medicare activity"
                fill
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
