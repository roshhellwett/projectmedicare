"use client";

import { useState } from "react";
import { Doctor } from "@/lib/db/doctors";
import { Plus, Pencil, Trash2, ShieldAlert } from "lucide-react";
import DoctorModal from "./DoctorModal";
import Image from "next/image";

export default function DoctorManager({ initialDoctors }: { initialDoctors: Doctor[] }) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to completely remove this doctor? This cannot be undone.")) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete doctor");
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("An error occurred while deleting the doctor.");
    } finally {
      setIsDeleting(null);
    }
  };

  const onSave = () => {
    // We just reload the page to get fresh data from the server
    window.location.reload();
  };

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">All Doctors</h2>
        <button onClick={handleAdd} className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" /> Add Doctor
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="card flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-line bg-surface-muted">
                  <Image
                    src={
                      doctor.image_url ||
                      (doctor.gender === "female"
                        ? "/assets/femaledoctor.webp"
                        : "/assets/maledoctor.webp")
                    }
                    alt={doctor.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{doctor.name}</h3>
                  <p className="truncate text-xs text-muted">{doctor.department}</p>
                </div>
              </div>
              
              <div className="space-y-1 text-sm text-muted">
                <p><strong className="font-medium text-foreground">Specialty:</strong> {doctor.specialty}</p>
                {doctor.contact && <p><strong className="font-medium text-foreground">Contact:</strong> {doctor.contact}</p>}
                {doctor.is_daily_chamber && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    <ShieldAlert className="h-3 w-3" /> Daily Chamber (₹{doctor.daily_fee})
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
              <button
                onClick={() => handleEdit(doctor)}
                className="btn btn-outline btn-sm"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={() => handleDelete(doctor.id)}
                disabled={isDeleting === doctor.id}
                className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-3 w-3" /> {isDeleting === doctor.id ? "..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className="card text-center py-12 text-muted">
          No doctors found. Add one to get started.
        </div>
      )}

      {isModalOpen && (
        <DoctorModal
          doctor={editingDoctor}
          onClose={() => setIsModalOpen(false)}
          onSave={onSave}
        />
      )}
    </div>
  );
}
