# Реестр задач Planovo

Общая доска: кто над чем работает. **Обновлять до начала и после завершения задачи.**

Статусы: `todo` | `in-progress` | `review` | `done` | `blocked`

| ID | Задача | Владелец | Ветка | Статус | PR | Заметки |
|----|--------|----------|-------|--------|-----|---------|
| TASK-1 | Анализ источников (ScheduleKEMS, Planora) | Owl-14 | — | done | — | см. WORKLOG Task 1 |
| TASK-2 | Демо: учебные учреждения | Owl-14 | — | done | — | demo/education/ |
| TASK-3 | GitHub Pages + демо спорт/клубы | zazabag | — | done | — | см. WORKLOG Task 3 |
| TASK-4 | Правила Cursor + документация совместной работы | Owl-14 | `docs/cursor-collab-rules` | in-progress | — | .cursor/rules/, COLLABORATION.md |
| TASK-5 | Демо: визуальный showcase (education, sports, clubs) | Owl-14 | `feature/Owl-14/demo-showcase-walkthrough` | done | [#2](https://github.com/zazabag/Planovo/pull/2) | блочный тур, doodle-фон, Demoplan.md |
| TASK-6 | Мобильная адаптация сайта и демо | Owl-14 | `feature/Owl-14/mobile-responsive` | done | [#3](https://github.com/zazabag/Planovo/pull/3) | site-mobile.css, demo-mobile.css |
| TASK-7 | Fix: секция «Решение» — overflow на мобильном | Owl-14 | `fix/Owl-14/solution-mobile-overflow` | done | [#4](https://github.com/zazabag/Planovo/pull/4) | mockup, site-mobile.css |

## Как добавить задачу

1. Скопируй строку-шаблон:
   ```
   | TASK-N | Краткое описание | <github> | feature/<user>/... | todo | — | |
   ```
2. Замени `N`, описание, владельца.
3. Перед `in-progress` убедись, что никто другой не ведёт ту же задачу.
4. После merge: статус `done`, в колонку PR — ссылку.

## Правила

- Одна активная `in-progress` задача на человека (если не согласовано иначе).
- Задачи в одном файле/модуле — согласовать в «Заметки» или в чате.
- Агент Cursor при любом изменении кода **сначала читает этот файл**.
