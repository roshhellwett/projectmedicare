import { doctors, doctorChamberInfo } from "../data/doctors";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { resolve } from "path";

// Load .env
config({ path: resolve(__dirname, "../../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting doctors seeding...");

  for (const doc of doctors) {
    // Determine gender based on name (simple heuristic)
    // Dr. Sakar Anita Sunil Jalan, Dr. Archana Verma, Dr. Megha Agarwal, Dr. Pragati Singh, Dr. Hiral Mehta, Dr. Shristy Shaw, Dr. Seema Farhin -> Female
    // Others -> Male
    const nameLower = doc.name.toLowerCase();
    const isFemale =
      nameLower.includes("anita") ||
      nameLower.includes("archana") ||
      nameLower.includes("megha") ||
      nameLower.includes("pragati") ||
      nameLower.includes("hiral") ||
      nameLower.includes("shristy") ||
      nameLower.includes("seema");

    const gender = isFemale ? "female" : "male";

    // Check if daily chamber
    const isDaily = doc.name === doctorChamberInfo.name;

    const payload = {
      name: doc.name,
      gender,
      specialty: doc.specialty,
      department: doc.department,
      qualifications: doc.qualifications,
      contact: doc.contact || null,
      is_daily_chamber: isDaily,
      daily_fee: isDaily ? doctorChamberInfo.fee : 300,
      image_url: null,
    };

    const { error } = await supabase.from("doctors").insert(payload);
    if (error) {
      console.error(`Failed to insert ${doc.name}:`, error.message);
    } else {
      console.log(`Inserted ${doc.name}`);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
