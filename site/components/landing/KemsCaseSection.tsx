import {
  ArrowRight,
  FileSpreadsheet,
  History,
  Link2,
  MessageSquareMore,
  Printer,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

const beforeItems = [
  { icon: FileSpreadsheet, text: "Данные в отдельных таблицах" },
  { icon: Printer, text: "Распечатки как канал публикации" },
  { icon: MessageSquareMore, text: "Правки через чаты и звонки" },
  { icon: Link2, text: "Новые ссылки на новые версии" },
] as const;

const afterItems = [
  "Связанная модель групп, дисциплин, преподавателей и аудиторий",
  "Конструктор с объяснимой проверкой конфликтов",
  "Черновые, утверждённые и архивные версии",
  "Переносы, замены, отмены и разовые изменения",
  "Интерфейсы учебной части, преподавателей и студентов",
] as const;

export function KemsCaseSection() {
  return (
    <section className="case-section" id="case" aria-labelledby="case-title">
      <Container>
        <div className="case-heading-row">
          <SectionHeading
            eyebrow="Первый клиентский контур"
            title={<span id="case-title">От множества таблиц — к связанному расписанию.</span>}
            body="В частном колледже расписание собиралось в Google-таблицах, распространялось ссылками и в печатном виде, а преподаватели вручную искали свои занятия в общей сетке."
          />
          <div className="case-heading-row__status">
            <span className="mono">KEMS · 2026</span>
            <p>
              <i aria-hidden="true" />
              Готовится к запуску в учебном процессе
            </p>
          </div>
        </div>

        <div className="case-transformation">
          <div className="case-before">
            <div className="case-pane__topline">
              <span>Было</span>
              <span className="mono">несколько источников</span>
            </div>
            <div className="scattered-files" aria-hidden="true">
              <span className="scattered-file scattered-file--one">
                Группы_финал_2.xlsx
              </span>
              <span className="scattered-file scattered-file--two">
                Расписание март
              </span>
              <span className="scattered-file scattered-file--three">
                ИЗМЕНЕНИЯ!
              </span>
            </div>
            <ul>
              {beforeItems.map(({ icon: Icon, text }) => (
                <li key={text}>
                  <Icon aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="case-divider" aria-hidden="true">
            <span>переход</span>
            <ArrowRight />
          </div>

          <div className="case-after">
            <div className="case-pane__topline">
              <span>Создаётся в Planovo</span>
              <span className="mono">один источник</span>
            </div>
            <div className="version-ledger">
              <div>
                <span className="version-ledger__dot" />
                <p><small>Черновик</small><strong>Сетка собрана</strong></p>
                <span className="version-ledger__state">рабочая версия</span>
              </div>
              <div>
                <span className="version-ledger__dot" />
                <p><small>Проверено</small><strong>Ограничения проверены</strong></p>
                <span className="version-ledger__state">готово к решению</span>
              </div>
              <div className="is-current">
                <span className="version-ledger__dot" />
                <p><small>Опубликовано</small><strong>Новая версия доступна ролям</strong></p>
                <span className="version-ledger__state">актуальное состояние</span>
              </div>
            </div>
            <ul>
              {afterItems.map((item) => (
                <li key={item}>
                  <span aria-hidden="true">↳</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="case-measurement">
          <History aria-hidden="true" />
          <div>
            <h3>Результаты измерим после запуска</h3>
            <p>
              Время создания и изменения расписания, обнаруженные конфликты,
              повторные вопросы учебной части, активность пользователей и
              скорость доставки изменений.
            </p>
          </div>
          <span>Без выдуманных метрик</span>
        </div>

        <div className="section-actions">
          <ButtonLink href="/case/kems" variant="primary">
            Разобрать первый кейс
          </ButtonLink>
          <ButtonLink href="/schedule" variant="text">
            Что входит в ядро расписания
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
