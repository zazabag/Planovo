import type { Metadata } from "next";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  FileSpreadsheet,
  History,
  Link2,
  MessageSquareMore,
  Printer,
} from "lucide-react";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { InnerPageHero } from "@/components/ui/InnerPageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  kemsBefore,
  kemsBuilt,
  kemsEvidence,
  kemsFaq,
  kemsProgress,
} from "@/lib/kems-case-content";

export const metadata: Metadata = {
  title: "Первый клиентский контур Planovo — кейс частного колледжа",
  description:
    "Как частный колледж переходит от таблиц, ссылок и распечаток к связанному расписанию. Что уже создано, что готовится к запуску и что будет измеряться.",
  alternates: { canonical: "/case/kems" },
  openGraph: {
    type: "article",
    url: "/case/kems",
    title: "От множества таблиц — к связанному расписанию",
    description:
      "Первый клиентский контур Planovo для частного колледжа готовится к запуску.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Первый клиентский контур Planovo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "От множества таблиц — к связанному расписанию",
    description:
      "Первый клиентский контур Planovo для частного колледжа готовится к запуску.",
    images: ["/og.png"],
  },
};

function CaseStatusVisual() {
  return (
    <div className="case-status-visual" aria-label="Статус первого проекта">
      <div className="case-status-visual__topline">
        <span>CASE 01</span>
        <span className="mono">KEMS · 2026</span>
      </div>
      <div className="case-status-visual__core">
        <span className="case-status-visual__pulse" aria-hidden="true" />
        <p>
          <small>Текущий статус</small>
          <strong>Готовится к запуску</strong>
          <span>в учебном процессе</span>
        </p>
      </div>
      <ol>
        {kemsProgress.map((item, index) => (
          <li key={item.index} className={index === 0 ? "is-complete" : ""}>
            <span className="mono">{item.index}</span>
            <p>
              <strong>{item.state}</strong>
              <small>{item.body}</small>
            </p>
            {index === 0 ? <Check aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function KemsCasePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <SiteHeader />
      <main id="main-content">
        <InnerPageHero
          eyebrow="Первый оплаченный проект · частный колледж"
          title={
            <>
              От множества таблиц —{" "}
              <span className="inner-hero__signal">
                к связанному расписанию.
              </span>
            </>
          }
          lead="Первый клиентский контур Planovo создаётся для частного колледжа. Учебная часть получает конструктор, проверки, версии и публикацию; преподаватели — своё расписание и доступность; учащиеся — адаптивную утверждённую версию."
          status="Результаты в цифрах измерим после запуска · сейчас показываем подтверждённые функции"
          primaryLabel="Обсудить похожий процесс"
          secondaryLabel="Что уже создано"
          secondaryHref="/case/kems#built"
        >
          <CaseStatusVisual />
        </InnerPageHero>

        <section
          className="case-story-section"
          id="before"
          aria-labelledby="case-before-title"
        >
          <Container>
            <div className="case-story-grid">
              <SectionHeading
                eyebrow="До Planovo"
                title={
                  <span id="case-before-title">
                    Расписание существовало сразу в нескольких версиях.
                  </span>
                }
                body="Учебная часть собирала данные в Google-таблицах. Учащимся отправляли ссылки и вывешивали распечатки, изменения передавали через чаты и звонки, а преподаватели вручную искали свои занятия в общей сетке."
              />
              <div className="case-source-stack" aria-hidden="true">
                <span>
                  <FileSpreadsheet />
                  Группы_финал_2.xlsx
                </span>
                <span>
                  <Printer />
                  Расписание на стене
                </span>
                <span>
                  <MessageSquareMore />
                  ИЗМЕНЕНИЯ!
                </span>
                <span>
                  <Link2 />
                  Новая ссылка
                </span>
              </div>
            </div>

            <ul className="case-fact-list">
              {kemsBefore.map((item, index) => (
                <li key={item}>
                  <span className="mono">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section
          className="case-origin-section"
          aria-labelledby="case-origin-title"
        >
          <Container className="case-origin-section__inner">
            <p className="eyebrow">
              <span aria-hidden="true" />
              От процесса — к продукту
            </p>
            <h2 id="case-origin-title">
              Проект начался не с каталога функций, а с ежедневной проблемы.
            </h2>
            <div className="case-origin-section__body">
              <p>
                Команда изучила, как колледж собирает, меняет и распространяет
                расписание, а затем показала рабочий сценарий будущей системы.
                После демонстрации учреждение заказало внедрение.
              </p>
              <p>
                Вместо новых копий расписания создаётся один управляемый
                контур: связанные данные, рабочая версия, проверки, публикация
                и отдельные представления для ролей. Это один оплаченный
                проект, а не доказательство работы во множестве учреждений.
              </p>
            </div>
          </Container>
        </section>

        <section
          className="case-built-section"
          id="built"
          aria-labelledby="case-built-title"
        >
          <Container>
            <SectionHeading
              theme="dark"
              eyebrow="Подтверждено в коде и тестах"
              title={
                <span id="case-built-title">
                  В первом контуре подтверждены три ролевых сценария.
                </span>
              }
              body="У каждой роли — своё представление одной опубликованной версии. Ниже только то, что реализовано в первом контуре."
            />

            <div className="case-built-grid">
              {kemsBuilt.map((item) => (
                <article key={item.index}>
                  <div className="case-built-card__topline">
                    <span className="mono">{item.index}</span>
                    <span>{item.label}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <ArrowDownRight aria-hidden="true" />
                </article>
              ))}
            </div>

            <div className="case-built-disclosure">
              <p>
                Авторизованного кабинета учащегося и отдельной роли родителя в
                текущем контуре нет. Интерфейс учащегося показан в
                демонстрационном сценарии Planovo.
              </p>
              <a href="/schedule#scenario">
                Пройти демонстрационный сценарий
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </Container>
        </section>

        <section
          className="case-evidence-section"
          aria-labelledby="case-evidence-title"
        >
          <Container>
            <div className="case-evidence-section__heading">
              <SectionHeading
                eyebrow="Проверенный срез · 27 июля 2026"
                title={
                  <span id="case-evidence-title">
                    Подтверждаем инженерные сценарии, а не придумываем
                    бизнес-результат.
                  </span>
                }
              />
              <p>
                Эти проверки подтверждают технические сценарии первого
                контура. Они не доказывают экономию времени, снижение ошибок
                или результат эксплуатации.
              </p>
            </div>

            <div className="case-evidence-grid">
              {kemsEvidence.map((item) => (
                <article key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section
          className="case-progress-section"
          aria-labelledby="case-progress-title"
        >
          <Container>
            <SectionHeading
              eyebrow="Что дальше"
              title={
                <span id="case-progress-title">
                  После запуска измерим, как контур работает в учебном процессе.
                </span>
              }
              body="Зафиксируем время изменений, обнаруженные конфликты, повторные вопросы и активность пользователей. До первого замера не публикуем проценты улучшения."
            />

            <ol className="case-progress-list">
              {kemsProgress.map((item, index) => (
                <li key={item.index}>
                  <span className="mono">{item.index}</span>
                  <div>
                    <small>{index === 0 ? "Реализовано" : index === 1 ? "Следующий факт" : "После запуска"}</small>
                    <h3>{item.state}</h3>
                    <p>{item.body}</p>
                  </div>
                  {index < kemsProgress.length - 1 ? (
                    <ArrowRight aria-hidden="true" />
                  ) : (
                    <History aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>

            <div className="section-actions">
              <ButtonLink
                href="https://t.me/planovoo"
                target="_blank"
                rel="noreferrer"
                variant="primary"
              >
                Обсудить похожую ситуацию
              </ButtonLink>
              <ButtonLink href="/schedule" variant="text">
                Посмотреть ядро расписания
              </ButtonLink>
            </div>
          </Container>
        </section>

        <FaqSection
          id="case-faq"
          items={kemsFaq}
          eyebrow="Кейс без приукрашивания"
          title="Что подтверждено — и чего пока не утверждаем."
          body="Статус первого проекта, границы публикации и следующий этап измерений."
        />

        <FinalCtaSection
          eyebrow="Сопоставим процессы"
          title="У вас расписание тоже живёт в таблицах, ссылках и чатах?"
          body="Покажите текущий процесс. Сопоставим его с уже созданным ядром расписания и честно разделим готовые сценарии, настройку и новую разработку."
          telegramLabel="Обсудить свой процесс"
        />
      </main>
      <SiteFooter />
    </>
  );
}
