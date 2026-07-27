import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function AkedaSection() {
  return (
    <section className="akeda-section" aria-labelledby="akeda-title">
      <Container className="akeda-section__inner">
        <div className="akeda-monogram" aria-hidden="true">
          <span>A</span>
          <i />
          <span>P</span>
        </div>
        <div>
          <p className="eyebrow">
            <span aria-hidden="true" />
            Создано внутри Akeda
          </p>
          <h2 id="akeda-title">Planovo — продукт Akeda.</h2>
          <p>
            Отдельное продуктовое направление для образования: развитие
            системы, внедрение клиентских контуров и поддержка после запуска.
          </p>
        </div>
        <a href="https://akeda.ru/" target="_blank" rel="noreferrer">
          Перейти на сайт Akeda
          <ArrowUpRight aria-hidden="true" />
        </a>
      </Container>
    </section>
  );
}
