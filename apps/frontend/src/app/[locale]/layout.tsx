import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Libre_Baskerville } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import AnnouncementBanner from "@/components/site/AnnouncementBanner";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import ToastProvider from "@/components/Toast";

const JantaChat = dynamic(() => import("@/components/chat/JantaChat"));
const FloatingCart = dynamic(() => import("@/components/FloatingCart"));

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

  const siteUrl = "https://jantamedicare.com";

  return {
    metadataBase: new URL(siteUrl),
    title: t("title"),
    description: t("description"),
    keywords: [
      "Janta Medicare LLP",
      "best medical store",
      "pharmacy in Howrah",
      "doctor consultation",
      "health packages",
      "pathology lab",
      "genuine medicines",
      "discount medicines",
      "health camp"
    ],
    formatDetection: {
      telephone: false,
    },
    // @ts-ignore - Next.js types for startupImage array are sometimes strict, but it is supported
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: t('title'),
      startupImage: [
        {
          url: '/splash/apple-splash-2064-2752.jpg',
          media: '(device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2752-2064.jpg',
          media: '(device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-2048-2732.jpg',
          media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2732-2048.jpg',
          media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1668-2420.jpg',
          media: '(device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2420-1668.jpg',
          media: '(device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1668-2388.jpg',
          media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2388-1668.jpg',
          media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1668-2224.jpg',
          media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2224-1668.jpg',
          media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1536-2048.jpg',
          media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2048-1536.jpg',
          media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1640-2360.jpg',
          media: '(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2360-1640.jpg',
          media: '(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1620-2160.jpg',
          media: '(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2160-1620.jpg',
          media: '(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1488-2266.jpg',
          media: '(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2266-1488.jpg',
          media: '(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1320-2868.jpg',
          media: '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2868-1320.jpg',
          media: '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1206-2622.jpg',
          media: '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2622-1206.jpg',
          media: '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1260-2736.jpg',
          media: '(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2736-1260.jpg',
          media: '(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1290-2796.jpg',
          media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2796-1290.jpg',
          media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1179-2556.jpg',
          media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2556-1179.jpg',
          media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1170-2532.jpg',
          media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2532-1170.jpg',
          media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1284-2778.jpg',
          media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2778-1284.jpg',
          media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1080-2340.jpg',
          media: '(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2340-1080.jpg',
          media: '(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1242-2688.jpg',
          media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2688-1242.jpg',
          media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1125-2436.jpg',
          media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2436-1125.jpg',
          media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-828-1792.jpg',
          media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-1792-828.jpg',
          media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-1242-2208.jpg',
          media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-2208-1242.jpg',
          media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-750-1334.jpg',
          media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-1334-750.jpg',
          media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
        {
          url: '/splash/apple-splash-640-1136.jpg',
          media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
        },
        {
          url: '/splash/apple-splash-1136-640.jpg',
          media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
        },
      ]
    },
    icons: {
      icon: "/websitelogo/jantamedicarelogo.webp",
      shortcut: "/websitelogo/jantamedicarelogo.webp",
      apple: "/websitelogo/jantamedicarelogo.webp",
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Janta Medicare LLP",
      url: siteUrl,
      type: "website",
      images: [
        {
          url: "/websitelogo/og-image.png",
          width: 1200,
          height: 630,
          alt: "Janta Medicare LLP Logo",
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

  // Generate JSON-LD for MedicalOrganization
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: "Janta Medicare LLP",
    url: "https://jantamedicare.com",
    logo: "https://jantamedicare.com/websitelogo/jantamedicarelogo.webp",
    sameAs: [
      "https://www.facebook.com/profile.php?id=61565406085566", // Placeholder, user will update if needed
      "https://www.instagram.com/jantamedicarellp" // Placeholder
    ],
    department: [
      {
        "@type": "Pharmacy",
        name: "Janta Medicare LLP - Vivek Vihar Main Hub",
        address: {
          "@type": "PostalAddress",
          streetAddress:
            "493/C/A, G. T. Road (South), Fazir Bazar More, Shop No. 4",
          addressLocality: "Shibpur, Howrah",
          addressRegion: "West Bengal",
          postalCode: "711101",
          addressCountry: "IN",
        },
        telephone: "+91 82408 04490",
      },
      {
        "@type": "Pharmacy",
        name: "Janta Medicare LLP - Shibpur Store",
        address: {
          "@type": "PostalAddress",
          streetAddress: "53, Kalikumar Mukharjee Lane, Tram Depot More",
          addressLocality: "Shibpur, Howrah",
          addressRegion: "West Bengal",
          postalCode: "711102",
          addressCountry: "IN",
        },
        telephone: "+91 62907 45327",
      },
      {
        "@type": "Pharmacy",
        name: "Janta Medicare LLP - Pilkhana Store",
        address: {
          "@type": "PostalAddress",
          streetAddress: "67/A, G. T. Road (North), Oriya Para More, Pilkhana",
          addressLocality: "Salkia, Howrah",
          addressRegion: "West Bengal",
          postalCode: "711106",
          addressCountry: "IN",
        },
        telephone: "+91 91238 99472",
      },
    ],
  };

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${plex.variable} ${baskerville.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
              Skip to content
            </a>
            <div className="print:hidden">
              <Navbar />
              <AnnouncementBanner />
            </div>
            <main id="main" className="flex-1 print:flex-none print:w-full print:p-0 print:m-0">
              {children}
            </main>
            <div className="print:hidden">
              <Footer />
              <JantaChat />
              <FloatingCart />
              <ToastProvider />
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
