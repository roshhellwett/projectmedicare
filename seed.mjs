import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const supabaseUrl = "https://qfmtonrojibmnfqblfdm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbXRvbnJvamlibW5mcWJsZmRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTkyOTAxMCwiZXhwIjoyMTAxNTA1MDEwfQ.Y0yKkXHasSCzpZVyCq8TW0Qx4BFCk5ytZaV7VGBRFrw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Medicines...");
  const medicines = JSON.parse(
    readFileSync("apps/frontend/src/data/medicines.json", "utf-8"),
  );

  for (let i = 0; i < medicines.length; i += 1000) {
    const chunk = medicines.slice(i, i + 1000);
    const { error } = await supabase.from("medicines").upsert(chunk);
    if (error) {
      console.error("Error inserting medicines chunk", i, error);
      return;
    }
    console.log(`Inserted medicines ${i} to ${i + chunk.length}`);
  }

  console.log("Seeding Patient Rates...");
  const rates = JSON.parse(
    readFileSync("apps/frontend/src/data/rates.json", "utf-8"),
  );

  for (let i = 0; i < rates.length; i += 1000) {
    const chunk = rates.slice(i, i + 1000);
    const { error } = await supabase.from("patient_rates").upsert(chunk);
    if (error) {
      console.error("Error inserting rates chunk", i, error);
      return;
    }
    console.log(`Inserted rates ${i} to ${i + chunk.length}`);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
