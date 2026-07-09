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
| TASK-8 | Документация: адаптивный интерфейс (RESPONSIVE.md) | Owl-14 | `docs/Owl-14/responsive-spec` | done | [#5](https://github.com/zazabag/Planovo/pull/5) | брейкпоинты, правила по устройствам |
| TASK-9 | Лендинг: демо-ссылки, секция «Процесс», фиксы формы | zazabag | `fix/zazabag/landing-demo-process` | done | [#6](https://github.com/zazabag/Planovo/pull/6) | demo href, process-scroll, favicon |
| TASK-10 | Бренд-логотип, фон лендинга, glow «Проблема», mockup | zazabag | `feature/zazabag/brand-logo-landing` | done | [#7](https://github.com/zazabag/Planovo/pull/7) | logo.png 60px, landing-background, problem-aura |
| TASK-11 | Мобильный лендинг — отдельный компактный дизайн | zazabag | `feature/zazabag/mobile-landing-layout` | done | [#9](https://github.com/zazabag/Planovo/pull/9) | site-mobile-landing.css, process-stack, RESPONSIVE §4.0 |
| TASK-12 | Мобильный лендинг v2 (skills, карусели, touch) | zazabag | `feature/zazabag/mobile-landing-v2` | done | [#11](https://github.com/zazabag/Planovo/pull/11) | skills README, site-mobile-landing v2 |
| TASK-13 | Fix mobile: hero overlap, process line, problem, mockup | zazabag | `fix/zazabag/mobile-layout-fixes` | done | [#13](https://github.com/zazabag/Planovo/pull/13) | hero, demos steps, process SVG, admin panel |
| TASK-14 | Откат mobile-layout, hero-scroll, линия процесса, accent демо | zazabag | `fix/zazabag/landing-revert-process-demo` | done | [#15](https://github.com/zazabag/Planovo/pull/15) | без site-mobile-landing, пункты 1/3 |
| TASK-15 | Лендинг: демо-кнопки в нишах; демо: accent на пункте 2 | zazabag | `feature/zazabag/niche-demo-accent` | done | [#17](https://github.com/zazabag/Planovo/pull/17) | кнопки в niche-card, accent пункт 2 |
| TASK-16 | Fix: education teacher showcase — пункт 2 вместо 3 | zazabag | `fix/zazabag/education-teacher-showcase` | done | [#18](https://github.com/zazabag/Planovo/pull/18) | TeacherShowcase блок 2 |
| TASK-17 | Мобильный лендинг v3: compact layout, mobile-layout | zazabag | `feature/zazabag/mobile-landing-v3` | done | [#19](https://github.com/zazabag/Planovo/pull/19) | site-mobile-landing, syncMobileLandingLayout |
| TASK-18 | Fix mobile: проблема aura, demo tabs, process line | zazabag | `fix/zazabag/mobile-ui-fixes` | done | [#20](https://github.com/zazabag/Planovo/pull/20) | overlap, overflow, 5 tabs, SVG stack |
| TASK-19 | Мобильные ниши: карусель 1 карточка, кнопки на одной высоте | zazabag | `feature/zazabag/niche-mobile-carousel` | done | [#21](https://github.com/zazabag/Planovo/pull/21) | стрелка, flex CTA |
| TASK-20 | Fix: «Процесс» — init SVG на mobile, левый рельс | zazabag | `feature/zazabag/niche-mobile-carousel` | done | [#21](https://github.com/zazabag/Planovo/pull/21) | self-boot, tryProcessInit |
| TASK-21 | Fix: карусель ниш (2/3 slide) + анимация линии процесса | zazabag | `fix/zazabag/niche-carousel-process-regression` | done | [#22](https://github.com/zazabag/Planovo/pull/22) | px translate, badge scroll |
| TASK-22 | Revert: линия «Процесс» — визуал/анимация как PR #20 | zazabag | `fix/zazabag/process-line-revert-pr20` | done | [#23](https://github.com/zazabag/Planovo/pull/23) | SVG под карточками |
| TASK-23 | Новый бренд-логотип (календарь + процесс) | zazabag | — | done | — | logo-source.png → logo.png |
| TASK-24 | Деплой planovo.pro: legal, favicon, контакты, скрипты | zazabag | `feature/zazabag/planovo-pro-deploy` | done | [#24](https://github.com/zazabag/Planovo/pull/24) | Reg.ru, HTTPS, ИП реквизиты |
| TASK-25 | Лендинг: preview правок по рецензии (копирайт, простота, цвет) | Owl-14 | `feature/Owl-14/landing-review-recenziya` | done | [#25](https://github.com/zazabag/Planovo/pull/25) | review-ассеты на прод, `index-preview.html` для QA |
| TASK-26 | Лендинг v2: структура по логике akeda.ru, статика без React (fix мигания) | Owl-14 | `feature/Owl-14/landing-v2-static` | review | — | index.html — источник правды; FAQ; `landing-core.js` |
| TASK-27 | Убрать переходные файлы (`landing-review-preview.js`, чанк `4c37fd759bda90ef.js`) | — | — | todo | — | после инвалидации кэша, через 1–2 недели после деплоя TASK-26 |

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
