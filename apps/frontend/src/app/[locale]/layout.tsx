import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Libre_Baskerville } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JantaChat from "@/components/chat/JantaChat";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-baskerville",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B6FB3",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/websitelogo/jantamedicarelogo.webp",
      shortcut: "/websitelogo/jantamedicarelogo.webp",
      apple: "/websitelogo/jantamedicarelogo.webp",
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Janta Medicare",
      images: [
        {
          url: "/websitelogo/og-image.png",
          width: 1200,
          height: 630,
          alt: "Janta Medicare Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/websitelogo/og-image.png"],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${plex.variable} ${baskerville.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
              Skip to content
            </a>
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <JantaChat />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
