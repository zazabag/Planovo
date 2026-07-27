import { ArrowRight, FlaskConical } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { proofCapabilities } from "@/lib/landing-content";

export function ProofSection() {
  return (
    <section className="proof-section" id="proof" aria-labelledby="proof-title">
      <Container>
        <div className="proof-ledger">
          <div className="proof-ledger__index">
            <span className="mono">01 / KEMS</span>
            <span className="proof-status">
              <i aria-hidden="true" />
              Готовится к запуску
            </span>
          </div>
          <div className="proof-ledger__statement">
            <p className="eyebrow">
              <span aria-hidden="true" />
              Первый оплаченный клиентский контур
            </p>
            <h2 id="proof-title">
              Planovo уже создаётся на реальном процессе частного колледжа.
            </h2>
            <p>
              В первом инстансе собраны связанные справочники, конструктор,
              проверки конфликтов, версии, публикация, кабинет преподавателя и
              адаптивное расписание для студентов.
            </p>
          </div>
          <div className="proof-ledger__stamp" aria-hidden="true">
            <FlaskConical />
            <span>CLIENT<br />INSTANCE</span>
          </div>
        </div>

        <div className="proof-capabilities" aria-label="Подтверждённые возможности">
          <span className="proof-capabilities__label">Реализовано в контуре</span>
          <div className="proof-capabilities__ticker">
            {proofCapabilities.map((item) => (
              <span key={item}>
                <ArrowRight aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <p className="proof-note">
          Результаты в цифрах измерим после запуска — без придуманных процентов
          экономии до начала реальной эксплуатации.
        </p>
      </Container>
    </section>
  );
}
