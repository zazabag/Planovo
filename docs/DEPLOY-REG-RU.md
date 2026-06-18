# Деплой planovo.pro (Reg.ru)

Статический сайт Planovo выкладывается в корень домена **без** префикса `/Planovo/` (в отличие от GitHub Pages).

## Текущий статус

- Домен **planovo.pro** привязан к хостингу Reg.ru (`server84.hosting.reg.ru`) — видна заглушка «Почти готово».
- Почты на домене нет — MX-записи трогать не нужно.

## 1. Сборка пакета

```bash
node scripts/build-deploy.mjs
```

Результат: папка `dist/planovo-pro/` — все HTML, демо, `assets/`, `_next/`, логотипы, `.htaccess`.

## 2. FTP / файловый менеджер Reg.ru

В [личном кабинете Reg.ru](https://www.reg.ru/user/account/) → **Хостинг** → ваш тариф → **Файловый менеджер** или **FTP**.

| Параметр | Где взять |
|----------|-----------|
| Хост | `server84.hosting.reg.ru` или `planovo.pro` |
| Логин / пароль | Раздел «FTP-пользователи» в панели хостинга |
| Папка сайта | Обычно `www/planovo.pro/` или `public_html/` |

**Загрузить:** всё содержимое `dist/planovo-pro/` **в корень** папки сайта (не в подпапку).

## 3. SSL (HTTPS)

В панели Reg.ru (ISPmanager):

1. **SSL-сертификаты** → **Let's Encrypt**
2. Домен: `planovo.pro`
3. Выпустить / установить сертификат
4. Включить **принудительный редирект HTTP → HTTPS** (или оставить `.htaccess` из сборки)

Проверка: https://planovo.pro открывается без предупреждений браузера.

## 4. Проверка после выкладки

- [ ] https://planovo.pro — главная, анимации, форма
- [ ] https://planovo.pro/education.html — демо учебных
- [ ] https://planovo.pro/sports.html — демо спорт
- [ ] https://planovo.pro/clubs.html — демо клубы
- [ ] https://planovo.pro/privacy.html — юридические страницы
- [ ] Мобильная вёрстка (ширина ≤768px)
- [ ] Favicon и logo.png грузятся по HTTPS

## 5. Обновление сайта

После правок в репозитории:

```bash
git pull origin main
node scripts/build-deploy.mjs
# загрузить dist/planovo-pro/ на хостинг (FTP или файловый менеджер)
```

GitHub Pages (`zazabag.github.io/Planovo/`) можно оставить как зеркало или настроить редирект отдельно.

## Что не выкладывать на прод

- `docs/`, `demo/education/` (исходники), `.git/`, `scripts/`, `.cursor/`
- Маркетинговые ролики в `docs/marketing/output/`
