import { setRequestLocale } from "next-intl/server";
import { getEnvKeys } from "@/lib/actions/settings";
import PageHeader from "@/components/PageHeader";
import { Settings } from "lucide-react";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings & API Keys — Janta Medicare Admin",
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let keys: any[] = [];
  try {
    keys = await getEnvKeys();
  } catch (err) {
    console.error("Failed to load keys:", err);
  }

  return (
    <div className="container py-8 md:py-12">
      <PageHeader
        eyebrow="System Configuration"
        eyebrowIcon={<Settings className="h-4 w-4" />}
        title="Settings & API Keys"
        sub="Manage encrypted environment variables and third-party API integrations securely. These keys are heavily encrypted in the database."
      />

      <div className="mt-8">
        <SettingsClient keys={keys} />
      </div>
    </div>
  );
}
