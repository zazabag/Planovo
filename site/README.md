# Planovo site

Новый продуктовый сайт Planovo. Это изолированный публичный frontend:
он не импортирует код KEMS, не использует его базу данных и не затрагивает
сервер первого клиентского контура.

## Локальный запуск

Нужен Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Локальный адрес: [http://localhost:3000](http://localhost:3000).

## Проверка

```bash
npm run lint
npm test
npm run test:e2e
npm run test:release
```

`npm run test:release` выполняет TypeScript-проверку, production build,
SSR/SEO/content/bundle gates и Playwright-проверки Chromium: WCAG AA,
клавиатура, мобильное меню, адаптив, overflow, ссылки и интерактивный
сценарий расписания, hash-offset и фирменную 404.

## Структура

- `app/` — страницы `/`, `/schedule`, `/case/kems`, legal routes, metadata,
  robots, sitemap, фирменная 404 и постоянные legacy-редиректы;
- `components/landing/` — продуктовые секции и два client island;
- `components/ui/` — минимальные UI-примитивы;
- `lib/` — типизированный продуктовый, кейсовый и юридический контент;
- `design/og-source.svg` — редактируемый исходник social preview;
- `public/` — favicon, знак Planovo, локальные font-subset и
  оптимизированная OG-карточка;
- `tests/` — SSR, claims, SEO, budgets и browser QA.

## Границы v1

- публичный лендинг без базы данных, авторизации и формы-заглушки;
- CTA открывают подтверждённые Telegram и email;
- журнал, оценки, кабинеты учащихся и другие будущие модули обозначены как
  следующий этап или план развития, а не как готовый функционал;
- страницы не ссылаются на операционные URL первого клиентского контура;
- production deploy выполняется только по отдельной команде владельца;
- текущий root deploy pipeline не собирает `site/`. До отдельного release
  adapter нельзя использовать старую публикацию и нельзя направлять домен
  напрямую на Sites: `/kems/*` и `/api/*` должны остаться за существующим
  Caddy.
