import type { Metadata } from "next";
import {
  ArrowDownRight,
  Check,
  CircleAlert,
  Clock3,
  Layers3,
  MoveRight,
} from "lucide-react";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { ImplementationSection } from "@/components/landing/ImplementationSection";
import { RolesSection } from "@/components/landing/RolesSection";
import { SchedulePropagationDemo } from "@/components/landing/SchedulePropagationDemo";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { Container } from "@/components/ui/Container";
import { InnerPageHero } from "@/components/ui/InnerPageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  scheduleChanges,
  scheduleFaq,
  scheduleModel,
  scheduleScope,
  scheduleWorkflowSteps,
} from "@/lib/schedule-content";

export const metadata: Metadata = {
  title: "Planovo Расписание — управление учебным расписанием",
  description:
    "Planovo помогает частным колледжам и школам собирать, проверять и публиковать расписание: конфликты, версии, переносы и ролевые представления.",
  alternates: { canonical: "/schedule" },
  openGraph: {
    type: "website",
    url: "/schedule",
    title: "Planovo Расписание — одна актуальная версия для каждой роли",
    description:
      "Конструктор, проверки конфликтов, версии, публикация и изменения расписания.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Planovo Расписание",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Planovo Расписание — одна актуальная версия для каждой роли",
    description:
      "Конструктор, проверки конфликтов, версии, публикация и изменения расписания.",
    images: ["/og.png"],
  },
};

export default function SchedulePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <SiteHeader />
      <main id="main-content">
        <InnerPageHero
          eyebrow="Ядро расписания Planovo"
          title={
            <>
              Соберите, проверьте и опубликуйте{" "}
              <span className="inner-hero__signal">одну актуальную версию.</span>
            </>
          }
          lead="Planovo связывает группы, преподавателей, дисциплины и аудитории. Учебная часть видит объяснимые конфликты и публикует проверенный вариант для преподавателей и учащихся."
          status="Реализовано в первом клиентском контуре · готовится к учебному запуску"
          primaryLabel="Обсудить пилот расписания"
          secondaryLabel="Пройти рабочий сценарий"
          secondaryHref="/schedule#scenario"
        >
          <div className="inner-hero__demo" id="scenario">
            <div className="inner-hero__demo-label">
              <span>Демонстрационный сценарий</span>
              <span className="mono">изменение → версия</span>
            </div>
            <SchedulePropagationDemo />
          </div>
        </InnerPageHero>

        <section
          className="model-section"
          id="model"
          aria-labelledby="model-title"
        >
          <Container>
            <SectionHeading
              eyebrow="Связанная модель"
              title={
                <span id="model-title">
                  Система проверяет не клетку в таблице, а контекст занятия.
                </span>
              }
              body="Время, группа, преподаватель и аудитория существуют не отдельно. Planovo связывает их с правилами, доступностью, вместимостью и текущей версией расписания."
            />

            <div className="model-ledger">
              <div className="model-ledger__axis" aria-hidden="true">
                <span>Связи</span>
                <MoveRight />
              </div>
              {scheduleModel.map((item) => (
                <article key={item.index} className="model-card">
                  <span className="model-card__index mono">{item.index}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                  <ArrowDownRight aria-hidden="true" />
                </article>
              ))}
            </div>
          </Container>
        </section>

        <WorkflowSection
          steps={scheduleWorkflowSteps}
          showVisual={false}
          secondaryLabel="Что входит в ядро"
          secondaryHref="#scope"
        />

        <section
          className="changes-section"
          id="changes"
          aria-labelledby="changes-title"
        >
          <Container>
            <div className="changes-section__intro">
              <SectionHeading
                eyebrow="Ежедневная работа"
                title={
                  <span id="changes-title">
                    Расписание продолжает жить после первой публикации.
                  </span>
                }
                body="Planovo поддерживает не только сборку новой сетки, но и изменения, которые возникают в течение учебного периода."
              />
              <div className="changes-section__note">
                <Clock3 aria-hidden="true" />
                <p>
                  Перед сохранением система показывает, какую часть расписания
                  затронет действие.
                </p>
              </div>
            </div>

            <div className="change-groups">
              {scheduleChanges.map((group, index) => (
                <article key={group.label}>
                  <div className="change-group__topline">
                    <span className="mono">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{group.label}</h3>
                  </div>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>
                        <ArrowDownRight aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <RolesSection />

        <section
          className="readiness-section"
          id="scope"
          aria-labelledby="scope-title"
        >
          <Container>
            <SectionHeading
              theme="dark"
              eyebrow="Честная граница"
              title={
                <span id="scope-title">
                  Что реализовано сейчас — и что не выдаём за готовое.
                </span>
              }
              body="Статус важнее длинного списка функций. Каждый следующий процесс появляется после требований и согласованного объёма."
            />

            <div className="readiness-grid">
              {scheduleScope.map((group) => (
                <article
                  key={group.status}
                  className={`readiness-card readiness-card--${group.tone}`}
                >
                  <div className="readiness-card__status">
                    {group.tone === "ready" ? (
                      <Check aria-hidden="true" />
                    ) : group.tone === "project" ? (
                      <Layers3 aria-hidden="true" />
                    ) : (
                      <CircleAlert aria-hidden="true" />
                    )}
                    <span>{group.status}</span>
                  </div>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <ImplementationSection />

        <FaqSection
          id="schedule-faq"
          items={scheduleFaq}
          eyebrow="Расписание без мелкого шрифта"
          title="Что важно знать о ядре расписания."
          body="Точные границы готового конструктора, внедрения и следующих этапов."
        />

        <FinalCtaSection
          eyebrow="Начните с одной недели"
          title="Покажите одну неделю вашего текущего расписания."
          body="Разберём источники данных, правила, роли и путь одного изменения. После встречи предложим границы пилота расписания: что запускается на готовом ядре, а что потребует настройки или разработки."
          telegramLabel="Обсудить пилот расписания"
        />
      </main>
      <SiteFooter />
    </>
  );
}
