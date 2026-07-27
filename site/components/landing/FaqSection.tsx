import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqItems } from "@/lib/landing-content";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  items?: readonly FaqItem[];
  eyebrow?: string;
  title?: string;
  body?: string;
  id?: string;
};

export function FaqSection({
  items = faqItems,
  eyebrow = "Без мелкого шрифта",
  title = "Что важно понять до первого разговора.",
  body = "Коротко о готовности продукта, формате внедрения и честных границах.",
  id = "faq",
}: FaqSectionProps = {}) {
  const titleId = `${id}-title`;

  return (
    <section className="faq-section" id={id} aria-labelledby={titleId}>
      <Container>
        <div className="faq-layout">
          <SectionHeading
            theme="dark"
            eyebrow={eyebrow}
            title={<span id={titleId}>{title}</span>}
            body={body}
          />

          <div className="faq-list">
            {items.map((item, index) => (
              <details key={item.question}>
                <summary>
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.question}</strong>
                  <Plus aria-hidden="true" />
                </summary>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
