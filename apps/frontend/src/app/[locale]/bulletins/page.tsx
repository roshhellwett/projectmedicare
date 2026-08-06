import { getTranslations } from "next-intl/server";
import { Megaphone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { BulletinEmpty, BulletinItem } from "@/components/site/BulletinBoard";
import { getVisibleBulletins } from "@/lib/db/bulletins";

export const revalidate = 60;

export async function generateMetadata() {
  const t = await getTranslations("BulletinsPage");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaOgDesc"),
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function BulletinsPage() {
  const items = await getVisibleBulletins(60);
  const t = await getTranslations("BulletinsPage");

  return (
    <div className="container py-10 md:py-14">
      <PageHeader
        eyebrow={t("eyebrow")}
        eyebrowIcon={<Megaphone className="h-4 w-4" />}
        title={t("title")}
        sub={t("sub")}
      />
      {items.length === 0 ? (
        <BulletinEmpty />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <BulletinItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
