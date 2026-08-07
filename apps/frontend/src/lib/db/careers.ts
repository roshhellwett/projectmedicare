import { createAdminClient, createPublicClient } from "@/lib/supabase/admin";

export type JobApplication = {
  id: string;
  name: string;
  phone: string;
  store_id: string;
  cv_path: string;
  created_at: string;
};

export const RESUMES_BUCKET = "resumes";

export async function getJobApplications(): Promise<JobApplication[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as JobApplication[];
}

export async function deleteJobApplication(id: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available.");

  const { data: existing } = await supabase
    .from("job_applications")
    .select("cv_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("job_applications")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  const path = (existing as { cv_path?: string | null } | null)?.cv_path;
  if (path) {
    await supabase.storage.from(RESUMES_BUCKET).remove([path]);
  }
}

export async function createJobApplication(
  name: string,
  phone: string,
  store_id: string,
  cv_path: string,
): Promise<void> {
  const supabase = createPublicClient();
  if (!supabase) throw new Error("Supabase client not available.");

  const { error } = await supabase.from("job_applications").insert({
    name,
    phone,
    store_id,
    cv_path,
  });

  if (error) {
    if (error.code === "23505") {
      // unique violation
      throw new Error("You have already applied using this phone number.");
    }
    throw new Error(error.message);
  }
}

export async function getCvDownloadUrl(id: string): Promise<string> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase admin client not available.");

  const { data: appData, error: dbError } = await supabase
    .from("job_applications")
    .select("cv_path, name, phone")
    .eq("id", id)
    .single();

  if (dbError || !appData?.cv_path) throw new Error("CV not found");

  // Format filename, e.g. "John Doe - 9876543210.pdf"
  const cleanName = appData.name.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const filename = `${cleanName}-${appData.phone}.pdf`;

  const { data, error } = await supabase.storage
    .from(RESUMES_BUCKET)
    .createSignedUrl(appData.cv_path, 60 * 60, {
      download: filename,
    }); // valid for 1 hour

  if (error || !data)
    throw new Error(error?.message || "Failed to generate URL");
  return data.signedUrl;
}
