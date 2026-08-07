import { createPublicClient, createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type DoctorGender = "male" | "female";

export type Doctor = {
  id: string;
  name: string;
  gender: DoctorGender;
  specialty: string;
  department: string;
  qualifications: string[];
  contact: string | null;
  image_url: string | null;
  is_daily_chamber: boolean;
  daily_fee: number;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type DoctorInput = Omit<Doctor, "id" | "created_at" | "updated_at">;

export async function getDoctors() {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .order("is_daily_chamber", { ascending: false })
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
  return data as Doctor[];
}

export async function adminCreateDoctor(input: DoctorInput) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin not configured");
  const { error } = await supabase.from("doctors").insert(input);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/[locale]/doctors", "page");
  revalidatePath("/[locale]/admin/doctors", "page");
}

export async function adminUpdateDoctor(id: string, input: DoctorInput) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin not configured");
  const { error } = await supabase
    .from("doctors")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/[locale]/doctors", "page");
  revalidatePath("/[locale]/admin/doctors", "page");
}

export async function adminDeleteDoctor(id: string) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin not configured");

  // First, get the doctor to see if they have a custom image
  const { data: doctor } = await supabase
    .from("doctors")
    .select("image_url")
    .eq("id", id)
    .single();

  // If they have a custom image in the doctor_images bucket, delete it
  if (
    doctor?.image_url &&
    doctor.image_url.includes("/storage/v1/object/public/doctor_images/")
  ) {
    try {
      // Extract the object path from the public URL
      const urlParts = doctor.image_url.split("/doctor_images/");
      if (urlParts.length > 1) {
        const objectPath = urlParts[1];
        await supabase.storage.from("doctor_images").remove([objectPath]);
      }
    } catch (err) {
      console.error("Failed to delete doctor image from storage:", err);
    }
  }

  // Delete the doctor record
  const { error } = await supabase.from("doctors").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/[locale]/doctors", "page");
  revalidatePath("/[locale]/admin/doctors", "page");
}
