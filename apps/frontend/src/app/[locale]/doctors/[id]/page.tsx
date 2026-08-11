import { getDoctorById } from "@/lib/db/doctors";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  BadgeCheck,
  CalendarCheck,
  GraduationCap,
  Phone,
  Stethoscope,
  ArrowLeft,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { mainContact } from "@/data/stores";
import { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const doctor = await getDoctorById(id);

  if (!doctor) {
    return { title: "Doctor Not Found" };
  }

  const title = `${doctor.name} - ${doctor.specialty} | Janta Medicare LLP`;
  const description = `Book an appointment with ${doctor.name}, a leading ${doctor.specialty} at Janta Medicare LLP in Howrah.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: [
        {
          url:
            doctor.image_url ||
            (doctor.gender === "female"
              ? "/assets/femaledoctor.webp"
              : "/assets/maledoctor.webp"),
          width: 800,
          height: 800,
          alt: doctor.name,
        },
      ],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function DoctorProfilePage({ params }: Props) {
  const { id, locale } = await params;
  const doctor = await getDoctorById(id);
  const t = await getTranslations("DoctorsPage");

  if (!doctor) {
    notFound();
  }

  const isDaily = doctor.is_daily_chamber;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    medicalSpecialty: doctor.specialty,
    image:
      doctor.image_url ||
      (doctor.gender === "female"
        ? "https://jantamedicare.com/assets/femaledoctor.webp"
        : "https://jantamedicare.com/assets/maledoctor.webp"),
    telephone: doctor.contact || mainContact.diagnostic,
    url: `https://jantamedicare.com/${locale}/doctors/${id}`,
    worksFor: {
      "@type": "MedicalOrganization",
      name: "Janta Medicare LLP",
    },
    location: {
      "@type": "Place",
      name: "Janta Medicare LLP - Shibpur Store",
      address: {
        "@type": "PostalAddress",
        streetAddress: "53, Kalikumar Mukharjee Lane, Tram Depot More",
        addressLocality: "Shibpur, Howrah",
        addressRegion: "West Bengal",
        postalCode: "711102",
        addressCountry: "IN",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-10 md:py-14 max-w-4xl mx-auto">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary-dark hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all doctors
        </Link>

        <div className="bg-surface overflow-hidden rounded-3xl border border-line shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-primary/5"></div>
          
          <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="relative h-40 w-40 md:h-48 md:w-48 shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-md ring-1 ring-black/5 bg-white mx-auto md:mx-0">
              <Image
                src={
                  doctor.image_url ||
                  (doctor.gender === "female"
                    ? "/assets/femaledoctor.webp"
                    : "/assets/maledoctor.webp")
                }
                alt={doctor.name}
                fill
                sizes="(max-width: 768px) 160px, 192px"
                className="object-cover"
                priority
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 mb-4">
                {doctor.department}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-2 flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                {doctor.name}
                <BadgeCheck className="h-6 w-6 text-primary shrink-0 mx-auto md:mx-0" />
              </h1>
              <p className="text-lg font-medium text-secondary-dark/90 mb-6">
                {doctor.specialty}
              </p>

              {doctor.qualifications.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Qualifications
                  </h3>
                  <ul className="space-y-2 inline-block text-left">
                    {doctor.qualifications.map((q) => (
                      <li
                        key={q}
                        className="flex items-start gap-2.5 text-sm font-medium text-foreground"
                      >
                        <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-8 border-t border-line">
                <a
                  href={`tel:${(doctor.contact || mainContact.diagnostic).replace(/\s+/g, "")}`}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:scale-[1.02]"
                >
                  <Phone className="h-4 w-4" />
                  {t("bookAppointment")}
                </a>
                
                {isDaily ? (
                   <span className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-primary/5 px-6 py-3.5 text-sm font-semibold text-primary">
                   <CalendarCheck className="h-4 w-4" />
                   Sits Every Day
                 </span>
                ) : (
                  <span className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-surface-muted px-6 py-3.5 text-sm font-semibold text-muted-foreground">
                   <Stethoscope className="h-4 w-4" />
                   Visiting Specialist
                 </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
