import {
  Building2,
  Check,
  CircleAlert,
  GraduationCap,
  UserRound,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { workflowSteps } from "@/lib/landing-content";

type WorkflowStep = {
  readonly number: string;
  readonly title: string;
  readonly body: string;
  readonly meta: string;
  readonly accent?: boolean;
};

type WorkflowSectionProps = {
  steps?: readonly WorkflowStep[];
  showVisual?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function WorkflowSection({
  steps = workflowSteps,
  showVisual = true,
  primaryLabel = "Показать свой процесс",
  secondaryLabel = "Посмотреть ядро расписания",
  secondaryHref = "/schedule",
}: WorkflowSectionProps = {}) {
  return (
    <section
      className="workflow-section"
      id="workflow"
      aria-labelledby="workflow-title"
    >
      <Container>
        <SectionHeading
          theme="dark"
          eyebrow="Одна правка — одна актуальная версия"
          title={
            <span id="workflow-title">
              Учебная часть меняет занятие. Остальным не нужно искать новую
              таблицу.
            </span>
          }
          body="Изменение проходит понятный путь от решения учебной части до актуального представления для каждой роли."
        />

        <div
          className={`workflow-layout${showVisual ? "" : " workflow-layout--steps-only"}`}
        >
          <ol className="workflow-steps">
            {steps.map((step) => (
              <li
                key={step.number}
                className={step.accent ? "is-accent" : undefined}
              >
                <span className="workflow-step__number mono">{step.number}</span>
                <div>
                  <span className="workflow-step__meta">{step.meta}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {showVisual ? <div className="constraint-map">
            <div className="constraint-map__topline">
              <span>Проверка связей</span>
              <span className="mono">12.03 · 13:20</span>
            </div>
            <div className="constraint-map__source">
              <span className="constraint-map__time mono">13:20</span>
              <div>
                <small>ИС-21 · Среда</small>
                <strong>Проектирование ИС</strong>
                <span>Перенос из аудитории 312</span>
              </div>
            </div>
            <div className="constraint-map__rails">
              <div>
                <span className="constraint-map__icon">
                  <GraduationCap />
                </span>
                <p>
                  <small>Группа</small>
                  <strong>ИС-21 свободна</strong>
                </p>
                <span className="constraint-map__result constraint-map__result--ok">
                  <Check />
                </span>
              </div>
              <div>
                <span className="constraint-map__icon">
                  <UserRound />
                </span>
                <p>
                  <small>Преподаватель</small>
                  <strong>Е. Р. Волкова свободна</strong>
                </p>
                <span className="constraint-map__result constraint-map__result--ok">
                  <Check />
                </span>
              </div>
              <div>
                <span className="constraint-map__icon">
                  <Building2 />
                </span>
                <p>
                  <small>Аудитория</small>
                  <strong>312 занята · 214 подходит</strong>
                </p>
                <span className="constraint-map__result constraint-map__result--warning">
                  <CircleAlert />
                </span>
              </div>
            </div>
            <div className="constraint-map__resolution">
              <span>Planovo объясняет конфликт</span>
              <strong>Учебная часть выбирает аудиторию 214</strong>
              <p>42 места · вместимость достаточна · пересечений нет</p>
            </div>
            <div className="constraint-map__published">
              <span className="mono">v19</span>
              <p>
                <small>Опубликовано</small>
                <strong>Новая версия доступна в ролевых представлениях</strong>
              </p>
              <Check />
            </div>
          </div> : null}
        </div>

        <p className="workflow-outcome">
          Одна система вместо новой ссылки, сообщения в чате и ещё одной
          распечатки на стене.
        </p>
        <div className="workflow-role-strip" aria-label="Ролевые представления">
          <span>Та же опубликованная версия</span>
          <div>
            <strong>Учебная часть</strong>
            <small>вся сетка</small>
          </div>
          <div>
            <strong>Преподаватель</strong>
            <small>своя загрузка</small>
          </div>
          <div>
            <strong>Учащийся</strong>
            <small>свой день</small>
          </div>
        </div>
        <div className="section-actions section-actions--dark">
          <ButtonLink
            href="https://t.me/planovoo"
            target="_blank"
            rel="noreferrer"
            variant="primary"
          >
            {primaryLabel}
          </ButtonLink>
          <ButtonLink href={secondaryHref} variant="secondary">
            {secondaryLabel}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
