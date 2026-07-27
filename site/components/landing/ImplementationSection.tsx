import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { implementationSteps } from "@/lib/landing-content";

export function ImplementationSection() {
  return (
    <section
      className="implementation-section"
      id="implementation"
      aria-labelledby="implementation-title"
    >
      <Container>
        <div className="implementation-intro">
          <SectionHeading
            theme="dark"
            eyebrow="Не коробка без контекста"
            title={
              <span id="implementation-title">
                Внедряем Planovo под реальный процесс учреждения.
              </span>
            }
            body="Первый контур может работать рядом с действующими системами. Границы замены и интеграции определяются только после диагностики."
          />
          <ButtonLink
            href="https://t.me/planovoo"
            target="_blank"
            rel="noreferrer"
            variant="light"
          >
            Обсудить первый контур
          </ButtonLink>
        </div>

        <ol className="implementation-steps">
          {implementationSteps.map((step, index) => (
            <li key={step.number}>
              <div className="implementation-step__number">
                <span className="mono">{step.number}</span>
                {index < implementationSteps.length - 1 ? (
                  <ArrowDown aria-hidden="true" />
                ) : null}
              </div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="implementation-note">
          Состав, стоимость и сроки определяются после диагностики. Новые модули,
          интеграции и специальная разработка оцениваются отдельно.
        </p>
      </Container>
    </section>
  );
}
