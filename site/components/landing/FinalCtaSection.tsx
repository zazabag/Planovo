import { ArrowRight, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";

type FinalCtaSectionProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  telegramLabel?: string;
};

export function FinalCtaSection({
  eyebrow = "Начните с реальной проблемы",
  title = "Покажите, как вы собираете расписание сейчас.",
  body = "Разберём текущие таблицы, роли и путь изменений. После встречи предложим границы пилота: что можно запустить на готовом ядре, а что потребует настройки или разработки.",
  telegramLabel = "Написать в Telegram",
}: FinalCtaSectionProps = {}) {
  return (
    <section className="final-cta" id="contact" aria-labelledby="contact-title">
      <Container className="final-cta__inner">
        <div className="final-cta__copy">
          <p className="eyebrow">
            <span aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="contact-title">{title}</h2>
          <p>{body}</p>
        </div>

        <div className="contact-panel">
          <div className="contact-panel__topline">
            <span>Первый разговор</span>
            <span className="mono">30 минут · онлайн</span>
          </div>
          <a
            className="contact-method contact-method--primary"
            href="https://t.me/planovoo"
            target="_blank"
            rel="noreferrer"
          >
            <span className="contact-method__icon"><MessageCircle /></span>
            <span>
              <small>Прямой контакт</small>
              <strong>{telegramLabel}</strong>
            </span>
            <ArrowRight aria-hidden="true" />
          </a>
          <a
            className="contact-method"
            href="mailto:an.shpar@mail.ru?subject=Planovo%20%E2%80%94%20%D0%BE%D0%B1%D1%81%D1%83%D0%B4%D0%B8%D1%82%D1%8C%20%D0%BF%D0%B8%D0%BB%D0%BE%D1%82"
          >
            <span className="contact-method__icon"><Mail /></span>
            <span>
              <small>Рабочая почта</small>
              <strong>an.shpar@mail.ru</strong>
            </span>
            <ArrowRight aria-hidden="true" />
          </a>
          <p className="contact-panel__note">
            <ShieldCheck aria-hidden="true" />
            Здесь нет формы-заглушки: контакт откроется напрямую, а данные не
            сохраняются на сайте.
          </p>
        </div>
      </Container>
    </section>
  );
}
