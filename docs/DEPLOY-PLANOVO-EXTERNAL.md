# Внешний контур Planovo Pro

Этот контур обслуживает публичные домены `planovo.pro` и `www.planovo.pro`.
Статика Planovo живёт отдельно от KEMS, а KEMS получает только маршруты `/kems/*`
и `/api/*` через локальный upstream `http://127.0.0.1:18080`.

## Что принадлежит Planovo

- `/opt/planovo-pro/releases/<git-sha>/site` — неизменяемый релиз статики.
- `/opt/planovo-pro/current` — symlink на активный релиз.
- `/etc/nginx/sites-available/planovo-pro.conf` — публичный nginx virtual host.
- `/etc/nginx/sites-enabled/planovo-pro.conf` — symlink для включения сайта.

## Что нельзя трогать

- `/opt/schedulekems`
- `/opt/schedulekems/deploy/planovo-site`
- любые `docker-compose.yml`, контейнеры, базы и volume KEMS
- общий старый proxy/rsync, который синхронизирует весь сервер или чужие каталоги

## Предварительная диагностика

```bash
node scripts/deploy-planovo-external.mjs --user <ssh-user>
```

Без `--apply` скрипт:

- собирает `dist/planovo-pro`;
- создаёт manifest с SHA-256 каждого файла;
- генерирует nginx-конфиг в `dist/planovo-external/`;
- по SSH читает состояние nginx, портов, сертификатов, KEMS health и каталогов в `/opt`.

Если SSH недоступен или нет сертификата
`/etc/letsencrypt/live/planovo.pro/fullchain.pem`, реальный deploy не запускать.

## Публикация

```bash
node scripts/deploy-planovo-external.mjs --user <ssh-user> --apply
```

Скрипт с `--apply`:

1. Проверяет, что remote root находится только внутри `/opt/planovo-pro`.
2. Проверяет наличие сертификатов `planovo.pro`.
3. Проверяет KEMS через `http://127.0.0.1:18080/api/v1/public/health`.
4. Создаёт новый релиз `/opt/planovo-pro/releases/<sha>/site`.
5. Делает `rsync --delete` только внутрь нового каталога релиза.
6. Устанавливает отдельный nginx-конфиг Planovo.
7. Выполняет `nginx -t`, затем `systemctl reload nginx`.
8. Запускает внешний smoke.

`--delete` безопасен, потому что применяется только к новому release-каталогу Planovo,
а не к `/opt`, `/var/www`, `/opt/schedulekems` или старым `planovo-site`.

## Проверки после публикации

```bash
node scripts/smoke-planovo-external.mjs
```

Проверяются:

- `https://planovo.pro/`
- `https://www.planovo.pro/`
- `https://planovo.pro/kems/student/`
- `https://planovo.pro/kems/teacher/`
- `https://planovo.pro/kems/admin/`
- `https://planovo.pro/api/v1/public/health`
- редирект `http://planovo.pro/` на HTTPS

## Если публикация остановилась

Остановиться и не переключать nginx, если обнаружено хотя бы одно:

- SSH ведёт в неизвестный сервер или нет прав на `nginx -t`;
- сертификаты отсутствуют или относятся не к `planovo.pro`;
- актуальный лендинг найден только в старом серверном каталоге и отличается от репозитория;
- KEMS health на `127.0.0.1:18080` не отвечает;
- требуется удалить или перезаписать каталог вне `/opt/planovo-pro`.
