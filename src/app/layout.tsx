import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import JsonLd from "@/components/JsonLd";
import SiteCursor from "@/components/SiteCursor";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "境曜有限公司｜台北活動企劃、啟動儀式與活動整合",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "活動企劃與會展服務",
  keywords: [
    "境曜有限公司",
    "境曜活動",
    "BES Events",
    "台北活動公司",
    "活動公司",
    "活動企劃公司",
    "活動統包",
    "啟動儀式",
    "AI 互動道具",
    "活動特效",
    "外派調酒",
    "活動人員派遣",
    "記者會",
    "尾牙春酒",
    "企業家庭日",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "境曜有限公司｜台北活動企劃與整合執行",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: 1536,
        height: 1024,
        alt: "境曜有限公司活動企劃與現場整合服務",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "境曜有限公司｜台北活動企劃與整合執行",
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant-TW">
      <body className="antialiased overflow-x-hidden">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <LayoutWrapper
          header={<Header />}
          footer={<Footer />}
          floatingButtons={<FloatingButtons />}
        >
          {children}
        </LayoutWrapper>
        <SiteCursor />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
