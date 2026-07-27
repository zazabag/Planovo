import { ArrowDown, Check, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SchedulePropagationDemo } from "./SchedulePropagationDemo";

const telegramUrl = "https://t.me/planovoo";

export function HeroSection() {
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <div className="hero-section__grid" aria-hidden="true" />
      <Container className="hero-section__inner">
        <div className="hero-copy">
          <p className="hero-kicker">
            <Sparkles aria-hidden="true" size={15} />
            Для частных колледжей и школ
          </p>
          <h1 id="hero-title">
            Одна правка.{" "}
            <span className="hero-title__signal">Актуальное расписание</span> —
            у каждой роли.
          </h1>
          <p className="hero-copy__lead">
            Planovo проверяет ограничения до публикации. Учебная часть
            утверждает изменение — преподаватели и учащиеся видят новую версию.
          </p>
          <div className="hero-actions">
            <ButtonLink
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              variant="primary"
            >
              Обсудить пилот
            </ButtonLink>
            <ButtonLink href="#product" variant="secondary">
              Пройти сценарий переноса
            </ButtonLink>
          </div>
          <div className="hero-bridge">
            <span className="hero-bridge__icon" aria-hidden="true">
              <Check size={14} />
            </span>
            <p>
              Начните с расписания. Подключайте следующие процессы по мере
              готовности — без обязательной замены всей инфраструктуры.
            </p>
          </div>
        </div>

        <div className="hero-product" id="product">
          <div className="hero-product__label">
            <span>Демонстрационный сценарий</span>
            <span className="mono">3 этапа</span>
          </div>
          <SchedulePropagationDemo />
        </div>

        <a className="hero-scroll" href="#proof">
          <ArrowDown aria-hidden="true" />
          <span>Первый клиентский контур</span>
        </a>
      </Container>
    </section>
  );
}
