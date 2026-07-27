import { Bell, Clock3, History, LayoutGrid, UsersRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { roles } from "@/lib/landing-content";

function StudyOfficeView() {
  return (
    <div className="role-view role-view--office" aria-hidden="true">
      <div className="role-view__toolbar">
        <span>Неделя 11</span>
        <strong>Опубликовать</strong>
      </div>
      <div className="mini-board">
        <span className="mini-board__time">10:00</span>
        <span className="mini-board__cell mini-board__cell--muted" />
        <span className="mini-board__cell mini-board__cell--active">
          ИС-21
          <small>Веб-разработка</small>
        </span>
        <span className="mini-board__time">11:40</span>
        <span className="mini-board__cell mini-board__cell--muted" />
        <span className="mini-board__cell mini-board__cell--warning">
          Конфликт
          <small>Аудитория</small>
        </span>
        <span className="mini-board__time">13:20</span>
        <span className="mini-board__cell mini-board__cell--signal">
          ИС-21
          <small>Проектирование ИС</small>
        </span>
        <span className="mini-board__cell mini-board__cell--muted" />
      </div>
      <div className="role-view__footer">
        <span><History /> История версий</span>
        <span><LayoutGrid /> Сетка по группам</span>
      </div>
    </div>
  );
}

function TeacherView() {
  return (
    <div className="role-view role-view--teacher" aria-hidden="true">
      <div className="teacher-profile">
        <span>ЕВ</span>
        <p>
          <strong>Е. Р. Волкова</strong>
          <small>Расписание на сегодня</small>
        </p>
      </div>
      <div className="availability-grid">
        {Array.from({ length: 15 }, (_, index) => (
          <span
            key={index}
            className={
              [1, 2, 4, 5, 8, 9, 11, 13].includes(index)
                ? "is-available"
                : ""
            }
          />
        ))}
      </div>
      <div className="teacher-next">
        <Clock3 />
        <p>
          <small>Следующее занятие</small>
          <strong>13:20 · Ауд. 214</strong>
        </p>
      </div>
    </div>
  );
}

function StudentView() {
  return (
    <div className="role-view role-view--student" aria-hidden="true">
      <div className="student-day">
        <span>12</span>
        <p>
          <small>Среда</small>
          <strong>Марта</strong>
        </p>
      </div>
      <div className="student-now">
        <small>Сейчас</small>
        <strong>Веб-разработка</strong>
        <span>идёт сейчас</span>
      </div>
      <div className="student-change">
        <Bell />
        <p>
          <small>Изменение</small>
          <strong>Следующая пара · 13:20</strong>
          <span>Аудитория 214</span>
        </p>
      </div>
    </div>
  );
}

const views = [<StudyOfficeView key="office" />, <TeacherView key="teacher" />, <StudentView key="student" />];

export function RolesSection() {
  return (
    <section className="roles-section" id="roles" aria-labelledby="roles-title">
      <Container>
        <SectionHeading
          eyebrow="Одна версия · три рабочих интерфейса"
          title={<span id="roles-title">Каждому — его работа, время и изменения.</span>}
          body="Planovo не показывает всем один и тот же огромный экран. Единая версия расписания превращается в понятное представление для каждой роли."
        />

        <div className="roles-slices">
          <div className="roles-slices__cursor" aria-hidden="true">
            <span className="mono">13:20</span>
          </div>
          {roles.map((role, index) => (
            <article
              key={role.key}
              className={`role-slice role-slice--${role.key}`}
            >
              <div className="role-slice__index">
                <span className="mono">0{index + 1}</span>
                <span>{role.scope}</span>
              </div>
              <div className="role-slice__copy">
                <p className="role-slice__label">{role.label}</p>
                <h3>{role.title}</h3>
                <p>{role.body}</p>
              </div>
              {views[index]}
              <ul>
                {role.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="roles-disclaimer">
          <UsersRound aria-hidden="true" />
          <p>
            <strong>Честная граница текущего контура.</strong> Интерфейс учащегося
            сейчас работает как режим просмотра с выбором группы.
            Авторизованный личный кабинет — следующий этап продукта.
          </p>
        </div>
      </Container>
    </section>
  );
}
