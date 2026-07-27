import type { Metadata } from "next";

export const legalConfig = {
  revision: "27 июля 2026 г.",
  operator: {
    fullName: "Индивидуальный предприниматель Шпарага Андрей Дмитриевич",
    shortName: "ИП Шпарага Андрей Дмитриевич",
    inn: "781457531980",
    ogrnip: "326784700129638",
    address:
      "197373, Россия, г. Санкт-Петербург, ул. Планерная, д. 47, корп. 4, кв. 42",
    email: "an.shpar@mail.ru",
  },
} as const;

type LegalMetadataOptions = {
  title: string;
  description: string;
  canonical: `/${string}`;
};

export function createLegalMetadata({
  title,
  description,
  canonical,
}: LegalMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Planovo",
      title,
      description,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}
