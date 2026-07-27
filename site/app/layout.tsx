import type { Metadata, Viewport } from "next";
import { legalConfig } from "@/lib/legal-content";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";
import "./inner-pages.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Planovo — управление расписанием для частных колледжей и школ",
  description: siteConfig.description,
  applicationName: "Planovo",
  authors: [
    { name: "Akeda", url: "https://akeda.ru/" },
    { name: legalConfig.operator.shortName },
  ],
  creator: "Akeda",
  publisher: legalConfig.operator.shortName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "Planovo",
    title: "Planovo — одна актуальная версия расписания для каждой роли",
    description:
      "Создание, проверка и публикация расписания для частных образовательных организаций.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Planovo — одна актуальная версия расписания для каждой роли",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Planovo — одна актуальная версия расписания для каждой роли",
    description:
      "Создание, проверка и публикация расписания для частных образовательных организаций.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef4fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1018" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
