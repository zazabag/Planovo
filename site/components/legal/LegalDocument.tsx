import type { ReactNode } from "react";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Container } from "@/components/ui/Container";
import { legalConfig } from "@/lib/legal-content";

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
};

export function LegalDocument({
  eyebrow,
  title,
  summary,
  children,
}: LegalDocumentProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <SiteHeader />
      <main id="main-content" className="legal-page">
        <header className="legal-hero" id="top">
          <Container>
            <p className="eyebrow">
              <span aria-hidden="true" />
              {eyebrow}
            </p>
            <h1>{title}</h1>
            <p>{summary}</p>
            <span className="legal-hero__revision">
              Редакция от {legalConfig.revision}
            </span>
          </Container>
        </header>
        <Container>
          <article className="legal-document">{children}</article>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
