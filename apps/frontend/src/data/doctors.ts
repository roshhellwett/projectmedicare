export type Doctor = {
  name: string;
  specialty: string;
  department: string;
  qualifications: string[];
};

export const doctors: Doctor[] = [
  {
    name: "Dr. Sakar Anita Sunil Jalan",
    specialty: "General Physician · Diabetology & Cardiology",
    department: "General Physician",
    qualifications: [
      "MBBS, DNB - Internal Medicine",
      "Fellowship in Critical Care Medicine",
      "Diabetologist, Cardiology, PDT (III)",
    ],
  },
  {
    name: "Dr. Archana Verma",
    specialty: "Infertility & IVF Specialist",
    department: "Obs & Gynaecology",
    qualifications: ["MBBS, DGO, DNB", "Infertility & IVF Specialist"],
  },
  {
    name: "Dr. Lalit Agarwal",
    specialty: "Consultant Pediatrician & Neonatologist",
    department: "Paediatrician",
    qualifications: [
      "MBBS, MD (Paediatrics)",
      "Fellowship (Neonatology)",
      "PGPN (Boston)",
    ],
  },
  {
    name: "Dr. Megha Agarwal",
    specialty: "Consultant Dermatologist and Aesthetic Physician",
    department: "Dermatology",
    qualifications: ["MBBS, MD (Dermatology, Venereology and Leprosy)"],
  },
  {
    name: "Dr. Soumyojyoti Chongar",
    specialty: "Consultant Orthopaedic Surgeon",
    department: "Orthopaedic",
    qualifications: [
      "MBBS, DNB (Orthopaedics)",
      "Specialist in Joint Replacement & Spine Surgery",
    ],
  },
  {
    name: "Dr. Vijay Kumar Jain",
    specialty: "Senior General and Advanced Laparoscopic Surgeon",
    department: "Surgeon",
    qualifications: ["M.S."],
  },
  {
    name: "Dr. Pragati Singh",
    specialty: "General Physician",
    department: "General Physician",
    qualifications: ["MBBS, CCCMD (Psychiatry)"],
  },
  {
    name: "Dr. Hiral Mehta",
    specialty: "General Physician",
    department: "General Physician",
    qualifications: ["MBBS"],
  },
  {
    name: "Dr. Balram Nishad",
    specialty: "Anaesthesiologist and General Physician",
    department: "General Physician",
    qualifications: ["MBBS, DA Consultant"],
  },
  {
    name: "Dr. Shristy Shaw",
    specialty: "General and Aesthetic Dentist",
    department: "Dentist",
    qualifications: [
      "BDS",
      "FAGE (Manipal)",
      "CART",
      "Dental Laser (California)",
    ],
  },
  {
    name: "Dr. Neeraj Agarwal",
    specialty: "Consultant Urologist, Uro-oncologist, Uro-Gynecologist",
    department: "Urology",
    qualifications: [
      "MBBS",
      "DNB (General Surgery)",
      "MCH (Urology)",
      "FMAS (AMASI)",
      "MNAMS",
    ],
  },
  {
    name: "Dr. S. Pal",
    specialty: "General Practitioner",
    department: "General Practitioner",
    qualifications: [],
  },
];

export const doctorChamberInfo = {
  name: "Dr. Seema Farhin",
  detail: "Sits everyday at the Shibpur chamber",
  fee: 300,
};
