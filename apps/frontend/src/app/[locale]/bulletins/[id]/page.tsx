import { getBulletinById } from "@/lib/db/bulletins";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Megaphone, Tag, Timer } from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatDateTime, formatShortDate } from "@/lib/utils/ist";
import { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bulletin = await getBulletinById(id);

  if (!bulletin) {
    return { title: "Not Found" };
  }

  // Extract a short title from the body
  const titleText = bulletin.body.split('\n')[0].substring(0, 50) + (bulletin.body.length > 50 ? '...' : '');
  const title = `${bulletin.kind === "offer" ? "Offer" : "Update"}: ${titleText} | Janta Medicare LLP`;
  const description = bulletin.body.substring(0, 150) + "...";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: bulletin.image_url ? [{ url: bulletin.image_url, width: 1200, height: 630 }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function BulletinDetailPage({ params }: Props) {
  const { id, locale } = await params;
  const bulletin = await getBulletinById(id);
  const t = await getTranslations("BulletinBoard");

  if (!bulletin) {
    notFound();
  }

  const isOffer = bulletin.kind === "offer";
  
  // Extract a title from the body for the schema
  const titleText = bulletin.body.split('\n')[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isOffer ? "Offer" : "Article",
    name: titleText,
    headline: titleText,
    description: bulletin.body,
    image: bulletin.image_url || "https://jantamedicare.com/websitelogo/og-image.png",
    url: `https://jantamedicare.com/${locale}/bulletins/${id}`,
    datePublished: bulletin.created_at,
    publisher: {
      "@type": "MedicalOrganization",
      name: "Janta Medicare LLP",
      logo: {
        "@type": "ImageObject",
        url: "https://jantamedicare.com/websitelogo/jantamedicarelogo.webp"
      }
    },
    ...(isOffer && bulletin.ends_at ? { priceValidUntil: bulletin.ends_at } : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-10 md:py-14 max-w-3xl mx-auto">
        <Link
          href="/bulletins"
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary-dark hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all updates
        </Link>

        <article className="bg-surface rounded-3xl border border-line shadow-sm overflow-hidden">
          {bulletin.image_url && (
            <div className="relative w-full h-64 md:h-96 bg-surface-muted">
              <Image
                src={bulletin.image_url}
                alt="Bulletin image"
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          <div className="p-6 md:p-10">
            <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-line pb-6">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isOffer ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"}`}>
                {isOffer ? (
                  <><Tag className="h-3.5 w-3.5" /> {t("offer")}</>
                ) : (
                  <><Megaphone className="h-3.5 w-3.5" /> {t("product")}</>
                )}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                Posted on {formatDateTime(bulletin.created_at)}
              </span>
            </div>

            <div className="prose prose-blue max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap text-foreground text-base md:text-lg leading-relaxed">
                {bulletin.body}
              </p>
            </div>

            {isOffer && bulletin.ends_at && (
              <div className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 ring-1 ring-inset ring-orange-600/20">
                <Timer className="h-5 w-5" />
                {t("validTill", { date: formatShortDate(bulletin.ends_at) })}
              </div>
            )}
          </div>
        </article>
      </div>
    </>
  );
}
