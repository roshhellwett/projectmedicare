"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { type GalleryImage } from "@/lib/db/gallery";

interface Props {
  initialImages: GalleryImage[];
}

export default function GalleryManager({ initialImages }: Props) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (data.image) {
        setImages((prev) => [data.image, ...prev]);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      // Clear input
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    setDeletingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setImages((prev) => prev.filter((img) => img.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Box */}
      <div className="card p-6 md:p-8">
        <h2 className="text-lg font-semibold text-foreground">
          Upload New Photo
        </h2>
        <p className="mt-1 text-sm text-muted">
          Add a new photo to the public gallery. Supported formats: JPG, PNG,
          WebP. Max size: 5MB. For the best look, try to upload images with a
          4:3 or 16:9 ratio.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 p-4 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {images.length >= 8 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-500/20 bg-red-500/5 p-12 text-center text-red-500 transition-colors">
            <AlertCircle className="h-8 w-8 mb-3 opacity-80" />
            <p className="font-semibold text-lg">Maximum limit reached</p>
            <p className="text-sm mt-1 opacity-80">
              You can only have 8 photos in the gallery. Delete an older photo
              below to upload a new one.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface p-12 transition-colors hover:bg-surface-hover">
            <label className="flex cursor-pointer flex-col items-center gap-3 text-center">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
              <div>
                <span className="font-semibold text-primary hover:underline">
                  {isUploading ? "Uploading..." : "Click to upload"}
                </span>
                <span className="text-muted"> or drag and drop</span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        )}
      </div>

      {/* Grid of Photos */}
      <div className="card p-6 md:p-8">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Manage Existing Photos
        </h2>

        {images.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <ImageIcon className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <p>No photos have been uploaded to the gallery yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative h-48 w-full sm:h-56 overflow-hidden rounded-xl border border-line bg-surface"
              >
                <Image
                  src={image.url}
                  alt="Gallery image"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={deletingId === image.id}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110 disabled:opacity-50"
                    title="Delete photo"
                  >
                    {deletingId === image.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
