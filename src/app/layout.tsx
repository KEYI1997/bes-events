import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: {
    default: "境曜有限公司 | 活動整合服務專家",
    template: "%s | 境曜有限公司",
  },
  description:
    "境曜有限公司（Bright Events Services）專注於各類型活動整合與現場執行，提供啟動儀式、燈光音響舞台、專案企劃、外派調酒、Show Girl 等一站式活動服務。",
  keywords: [
    "活動公司",
    "啟動儀式",
    "燈光音響",
    "舞台租借",
    "專案企劃",
    "外派調酒",
    "Show Girl",
    "記者會",
    "尾牙春酒",
    "企業家庭日",
    "境曜",
  ],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "境曜有限公司",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant-TW">
      <head>
        <link rel="stylesheet" href="https://early.webawesome.com/webawesome@3/dist/styles/theme.css" />
        <script type="module" src="https://early.webawesome.com/webawesome@3/dist/webawesome.loader.js"></script>
      </head>
      <body className="antialiased overflow-x-hidden">
        <LayoutWrapper
          header={<Header />}
          footer={<Footer />}
          floatingButtons={<FloatingButtons />}
        >
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
