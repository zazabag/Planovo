import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

type InnerPageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  status: string;
  primaryLabel: string;
  primaryHref?: string;
  secondaryLabel: string;
  secondaryHref: string;
  children?: ReactNode;
};

export function InnerPageHero({
  eyebrow,
  title,
  lead,
  status,
  primaryLabel,
  primaryHref = "https://t.me/planovoo",
  secondaryLabel,
  secondaryHref,
  children,
}: InnerPageHeroProps) {
  return (
    <section className="inner-hero" id="top" aria-labelledby="page-title">
      <div className="inner-hero__grid" aria-hidden="true" />
      <Container className="inner-hero__inner">
        <div className="inner-hero__copy">
          <p className="eyebrow">
            <span aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 id="page-title">{title}</h1>
          <p className="inner-hero__lead">{lead}</p>
          <div className="inner-hero__actions">
            <ButtonLink
              href={primaryHref}
              target={primaryHref.startsWith("http") ? "_blank" : undefined}
              rel={primaryHref.startsWith("http") ? "noreferrer" : undefined}
              variant="primary"
            >
              {primaryLabel}
            </ButtonLink>
            <ButtonLink href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </ButtonLink>
          </div>
          <p className="inner-hero__status">
            <span aria-hidden="true">
              <Check />
            </span>
            {status}
          </p>
        </div>
        {children ? <div className="inner-hero__visual">{children}</div> : null}
      </Container>
    </section>
  );
}
