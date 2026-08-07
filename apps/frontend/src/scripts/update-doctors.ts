import { createAdminClient } from "../lib/supabase/admin";

const doctorsData = [
  {
    nameMatch: "Sakar Anita",
    department: "General Physician, Diabetology & Cardiology",
    specialty: "General Physician - Diabetology & Cardiology",
    qualifications: [
      "MBBS",
      "DNB-Internal Medicine",
      "Fellowship in Critical Care Medicine",
      "Diabetologist",
      "Cardiology PDT(III)",
    ],
  },
  {
    nameMatch: "Archana Verma",
    department: "Obs & Gynaecology",
    specialty: "Infertility & IVF Specialist",
    qualifications: ["MBBS", "DGO", "DNB", "Infertility & IVF Specialist"],
  },
  {
    nameMatch: "Lalit Agarwal",
    department: "Paediatrician",
    specialty: "Consultant Pediatrician & Neonatologist",
    qualifications: [
      "MBBS",
      "MD (Paediatrics)",
      "Fellowship (Neonatology)",
      "PGPN (Boston)",
      "Consultant Pediatrician & Neonatologist",
    ],
  },
  {
    nameMatch: "Megha Agarwal",
    department: "Dermatology",
    specialty: "Consultant Dermatologist and Aesthetic Physician",
    qualifications: [
      "MBBS",
      "MD (Dermatology, Venereology and Leprosy)",
      "Consultant Dermatologist and Aesthetic Physician",
    ],
  },
  {
    nameMatch: "Soumyojyoti Chongar",
    department: "Orthopaedic",
    specialty: "Consultant Orthopaedic Surgeon",
    qualifications: [
      "MBBS",
      "DNB (Orthopaedics)",
      "Consultant Orthopaedic Surgeon",
      "Specialist in Joint Replacement & Spine Surgery",
    ],
  },
  {
    nameMatch: "Vijay Kumar Jain",
    department: "Surgeon",
    specialty: "Senior General and Advanced Laparoscopic Surgeon",
    qualifications: ["M.S. Senior General and Advanced Laparoscopic Surgeon"],
  },
  {
    nameMatch: "Pragati Singh",
    department: "General Physician",
    specialty: "General Physician",
    qualifications: ["MBBS", "CCCMD (Psychiatry)"],
  },
  {
    nameMatch: "Hiral Mehta",
    department: "General Physician",
    specialty: "General Physician",
    qualifications: ["MBBS", "General Physician"],
  },
  {
    nameMatch: "Balram Nishad",
    department: "General Physician",
    specialty: "Consultant Anaesthesiologist and General Physician",
    qualifications: [
      "MBBS",
      "DA Consultant Anaesthesiologist and General Physician",
    ],
  },
  {
    nameMatch: "Shristy Shaw",
    department: "General and Aesthetic Dentist",
    specialty: "General and Aesthetic Dentist",
    qualifications: [
      "BDS",
      "FAGE (Manipal)",
      "CART",
      "Dental Laser (California)",
    ],
  },
  {
    nameMatch: "Neeraj Agarwal",
    department: "Urology",
    specialty: "Consultant Urologist, Uro-oncologist, Uro-Gynecologist",
    qualifications: [
      "MBBS",
      "DNB (General Surgery)",
      "MCH (Urology)",
      "FMAS (AMASI)",
      "MNAMS",
      "Consultant Urologist, Uro-oncologist, Uro-Gynecologist",
    ],
  },
  {
    nameMatch: "S. Pal",
    department: "General Practitioner",
    specialty: "General Practitioner",
    qualifications: ["Dr. S. Pal"],
  },
];

async function updateDoctors() {
  console.log("Starting doctor update script...");
  const supabase = createAdminClient();

  if (!supabase) {
    console.error("No Supabase admin client configured. Exiting.");
    process.exit(1);
  }

  // Fetch all existing doctors to get their IDs
  const { data: existingDoctors, error: fetchError } = await supabase
    .from("doctors")
    .select("id, name");

  if (fetchError) {
    console.error("Error fetching existing doctors:", fetchError);
    process.exit(1);
  }

  for (const docUpdate of doctorsData) {
    // Find matching doctor
    const matchedDoctor = existingDoctors?.find((d) =>
      d.name.toLowerCase().includes(docUpdate.nameMatch.toLowerCase()),
    );

    if (!matchedDoctor) {
      console.warn(
        `Could not find a match for ${docUpdate.nameMatch}. Skipping.`,
      );
      continue;
    }

    console.log(`Updating ${matchedDoctor.name}...`);

    const { error: updateError } = await supabase
      .from("doctors")
      .update({
        department: docUpdate.department,
        specialty: docUpdate.specialty,
        qualifications: docUpdate.qualifications,
      })
      .eq("id", matchedDoctor.id);

    if (updateError) {
      console.error(`Error updating ${matchedDoctor.name}:`, updateError);
    } else {
      console.log(`Successfully updated ${matchedDoctor.name}.`);
    }
  }

  console.log("Doctor updates complete!");
}

updateDoctors().catch(console.error);
