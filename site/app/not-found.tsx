import type { Metadata } from "next";
import { ArrowRight, CalendarRange, FileSearch } from "lucide-react";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Страница не найдена — Planovo",
  description:
    "Запрошенной страницы нет. Вернитесь на главную Planovo или посмотрите ядро расписания.",
  robots: {
    index: false,
    follow: false,
  },
};

const recoveryLinks = [
  {
    href: "/schedule",
    label: "Ядро расписания",
    detail: "Как создаётся и публикуется одна актуальная версия.",
  },
  {
    href: "/case/kems",
    label: "Первый клиентский контур",
    detail: "Что уже реализовано и как проверяется перед запуском.",
  },
];

export default function NotFound() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <SiteHeader />
      <main id="main-content" className="not-found-page">
        <section className="not-found-hero" id="top">
          <div className="not-found-hero__grid" aria-hidden="true" />
          <Container className="not-found-hero__inner">
            <div className="not-found-hero__copy">
              <p className="eyebrow">
                <span aria-hidden="true" />
                Ошибка 404
              </p>
              <h1>
                Такой страницы нет.
                <span> Актуальное расписание — есть.</span>
              </h1>
              <p>
                Адрес мог измениться или в ссылке есть ошибка. Вернитесь на
                главную либо сразу разберите рабочий сценарий Planovo.
              </p>
              <div className="not-found-hero__actions">
                <ButtonLink href="/">На главную</ButtonLink>
                <ButtonLink href="/schedule#scenario" variant="secondary">
                  Посмотреть сценарий
                </ButtonLink>
              </div>
            </div>

            <div className="not-found-map" aria-label="Доступные разделы">
              <div className="not-found-map__topline">
                <span className="mono">ROUTE / 404</span>
                <FileSearch aria-hidden="true" />
              </div>
              <div className="not-found-map__status">
                <CalendarRange aria-hidden="true" />
                <div>
                  <span>Запрошенный маршрут</span>
                  <strong>не найден</strong>
                </div>
              </div>
              <nav aria-label="Куда перейти">
                {recoveryLinks.map((item, index) => (
                  <a href={item.href} key={item.href}>
                    <span className="mono">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.detail}</small>
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </a>
                ))}
              </nav>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
