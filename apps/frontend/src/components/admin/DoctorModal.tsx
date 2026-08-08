"use client";

import { useState, useRef } from "react";
import { Doctor, DoctorInput } from "@/lib/db/doctors";
import { X, Upload, Loader2, XCircle } from "lucide-react";
import Image from "next/image";

type DoctorModalProps = {
  doctor: Doctor | null;
  onClose: () => void;
  onSave: () => void;
};

export default function DoctorModal({
  doctor,
  onClose,
  onSave,
}: DoctorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    doctor?.image_url || null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image before upload
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const newFile = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, "") + ".webp",
                  {
                    type: "image/webp",
                    lastModified: Date.now(),
                  },
                );
                resolve(newFile);
              } else {
                reject(new Error("Canvas to Blob failed"));
              }
            },
            "image/webp",
            0.8,
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Parse qualifications (comma separated to array)
    const qualsRaw = formData.get("qualifications") as string;
    const qualifications = qualsRaw
      .split(",")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    const input: DoctorInput = {
      name: formData.get("name") as string,
      gender: formData.get("gender") as "male" | "female",
      specialty: formData.get("specialty") as string,
      department: formData.get("department") as string,
      qualifications,
      contact: (formData.get("contact") as string) || null,
      is_daily_chamber: formData.get("is_daily_chamber") === "on",
      daily_fee: Number(formData.get("daily_fee")) || 300,
      display_order: Number(formData.get("display_order")) || 999,
      image_url: doctor?.image_url || null,
    };

    try {
      // 1. Upload new image if provided
      if (imageFile) {
        const compressed = await compressImage(imageFile);
        const uploadForm = new FormData();
        uploadForm.append("file", compressed);

        const uploadRes = await fetch("/api/admin/doctors/upload", {
          method: "POST",
          body: uploadForm,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadData.error || "Failed to upload image");

        input.image_url = uploadData.url;
      }

      // 2. Save doctor record
      const url = doctor
        ? `/api/admin/doctors/${doctor.id}`
        : "/api/admin/doctors";
      const method = doctor ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save doctor");
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-surface p-6 shadow-xl border border-line">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {doctor ? "Edit Doctor" : "Add Doctor"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Image Upload */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line bg-surface-muted">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline btn-sm"
                    >
                      <Upload className="h-4 w-4" /> Choose Image
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="btn btn-outline btn-sm text-red-600"
                      >
                        <XCircle className="h-4 w-4" /> Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    Leave blank to use default gender avatar. Large images are
                    automatically compressed.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-semibold"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={doctor?.name}
                required
                className="input"
                placeholder="Dr. John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="gender"
                className="mb-1.5 block text-sm font-semibold"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                defaultValue={doctor?.gender || "male"}
                required
                className="input"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="department"
                className="mb-1.5 block text-sm font-semibold"
              >
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="department"
                name="department"
                defaultValue={doctor?.department}
                required
                className="input"
                placeholder="e.g. Cardiology"
              />
            </div>

            <div>
              <label
                htmlFor="specialty"
                className="mb-1.5 block text-sm font-semibold"
              >
                Specialty <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="specialty"
                name="specialty"
                defaultValue={doctor?.specialty}
                required
                className="input"
                placeholder="e.g. Senior Cardiologist"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="qualifications"
                className="mb-1.5 block text-sm font-semibold"
              >
                Qualifications <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="qualifications"
                name="qualifications"
                defaultValue={doctor?.qualifications?.join(", ")}
                required
                className="input"
                placeholder="MBBS, MD (Comma separated)"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="contact"
                className="mb-1.5 block text-sm font-semibold"
              >
                Contact Number (Optional)
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                defaultValue={doctor?.contact || ""}
                className="input"
                placeholder="+91 9876543210"
              />
              <p className="mt-1 text-xs text-muted">
                If left blank, the &quot;Book Appointment&quot; button will NOT be shown
                for this doctor.
              </p>
            </div>
          </div>

          <div className="my-6 border-t border-line" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_daily_chamber"
                name="is_daily_chamber"
                defaultChecked={doctor?.is_daily_chamber || false}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="is_daily_chamber"
                className="text-sm font-semibold"
              >
                Is Daily Chamber Doctor?
              </label>
            </div>

            <div>
              <label
                htmlFor="daily_fee"
                className="mb-1.5 block text-sm font-semibold"
              >
                Daily Fee (₹)
              </label>
              <input
                type="number"
                id="daily_fee"
                name="daily_fee"
                defaultValue={doctor?.daily_fee || 300}
                className="input"
                placeholder="300"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="display_order"
                className="mb-1.5 block text-sm font-semibold"
              >
                Display Order Priority
              </label>
              <input
                type="number"
                id="display_order"
                name="display_order"
                defaultValue={doctor?.display_order ?? 999}
                className="input max-w-[200px]"
                placeholder="999"
              />
              <p className="mt-1 text-xs text-muted">
                Lower number = appears higher in the list (e.g. 1 is at the
                top).
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {doctor ? "Update Doctor" : "Add Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
