import { AkedaSection } from "@/components/landing/AkedaSection";
import { CapabilityLadderSection } from "@/components/landing/CapabilityLadderSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { ImplementationSection } from "@/components/landing/ImplementationSection";
import { KemsCaseSection } from "@/components/landing/KemsCaseSection";
import { ProofSection } from "@/components/landing/ProofSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { absoluteUrl } from "@/lib/site-config";
import { faqItems } from "@/lib/landing-content";
import { legalConfig } from "@/lib/legal-content";

const homeFaqItems = [
  faqItems[0],
  faqItems[1],
  faqItems[2],
  faqItems[3],
  faqItems[4],
  faqItems[8],
  faqItems[9],
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://akeda.ru/#organization",
      name: "Akeda",
      url: "https://akeda.ru/",
    },
    {
      "@type": "Organization",
      "@id": `${absoluteUrl()}#operator`,
      name: legalConfig.operator.shortName,
      legalName: legalConfig.operator.fullName,
      taxID: legalConfig.operator.inn,
      email: legalConfig.operator.email,
      url: absoluteUrl(),
    },
    {
      "@type": "WebSite",
      "@id": `${absoluteUrl()}#website`,
      url: absoluteUrl(),
      name: "Planovo",
      inLanguage: "ru-RU",
      creator: { "@id": "https://akeda.ru/#organization" },
      publisher: { "@id": `${absoluteUrl()}#operator` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${absoluteUrl()}#software`,
      name: "Planovo",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Система создания, проверки и публикации расписания для частных образовательных организаций.",
      creator: { "@id": "https://akeda.ru/#organization" },
      provider: { "@id": `${absoluteUrl()}#operator` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <SiteHeader />
      <main id="main-content">
        <HeroSection />
        <ProofSection />
        <WorkflowSection showVisual={false} />
        <CapabilityLadderSection />
        <KemsCaseSection />
        <ImplementationSection />
        <AkedaSection />
        <FaqSection items={homeFaqItems} />
        <FinalCtaSection />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
