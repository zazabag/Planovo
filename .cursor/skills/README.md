# Cursor skills — Planovo (mobile / responsive)

Скачанные skills для оптимизации лендинга под телефон. Десктоп не трогаем — применяются через `assets/site-mobile-landing.css` (media ≤768px).

| Skill | Источник | Назначение |
|-------|----------|------------|
| [responsive-design](responsive-design/SKILL.md) | [flitzrrr/frontend-design-skills](https://github.com/flitzrrr/frontend-design-skills) | Mobile-first, breakpoints, touch, fluid type |
| [mobile-design](mobile-design/SKILL.md) | [liuchiawei/agent-skills](https://github.com/liuchiawei/agent-skills) | Touch ≥44px, не «маленький десктоп» |
| [responsive-testing](responsive-testing/SKILL.md) | [spencerpauly/awesome-cursor-skills](https://github.com/spencerpauly/awesome-cursor-skills) | Чеклист 375/428/768/1280px |
| [web-design-guidelines](web-design-guidelines/SKILL.md) | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | A11y, UX audit |

## Применение в Planovo

- Мобильный CSS: `assets/site-mobile-landing.css`
- Класс `.mobile-layout` на `.landing-page`: `assets/site-legal.js` → `syncMobileLandingLayout()`
- Процесс на телефоне: `process-stack` в `process-scroll.js` / `.css`
- Спека: `docs/RESPONSIVE.md` §4.0

## Тест после правок

1. 375×812 — нет горизонтального скролла страницы
2. Touch targets ≥44px на кнопках и пунктах меню
3. Ниши и демо — горизонтальный snap-scroll, не столбик гигантских карточек
4. ≥769px — `site-mobile-landing.css` не применяется
