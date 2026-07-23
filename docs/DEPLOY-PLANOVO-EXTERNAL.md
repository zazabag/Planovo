# Внешний контур Planovo Pro

Этот контур обслуживает публичные домены `planovo.pro` и `www.planovo.pro`.
Статика Planovo живёт отдельно от KEMS, а KEMS получает только маршруты `/kems/*`
и `/api/*` через локальный upstream `http://127.0.0.1:18080`.

## Что принадлежит Planovo

- `/home/deploy/planovo-pro/releases/<git-sha>/site` — неизменяемый релиз статики.
- `/home/deploy/planovo-pro/current` — symlink на активный релиз.
- `/home/deploy/planovo-pro/runtime` — Caddyfile, compose, активная копия сайта и ACME-хранилище.
- Docker compose project `planovo-pro-edge`, контейнер `planovo-pro-edge`.

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
- создаёт manifest с SHA-256 каждого файла;
- по SSH читает состояние портов, docker, KEMS health и каталогов в `/opt`.

Если SSH недоступен, 80/443 заняты неизвестным процессом или KEMS health не отвечает,
реальный deploy не запускать.

## Публикация

```bash
node scripts/deploy-planovo-external.mjs --apply
```

Скрипт с `--apply`:

1. Проверяет, что remote root находится только внутри `/home/deploy/planovo-pro`.
2. Проверяет KEMS через `http://127.0.0.1:18080/api/v1/public/health`.
3. Проверяет доступ из host-network контейнера к этому же KEMS upstream.
4. Создаёт новый релиз `/home/deploy/planovo-pro/releases/<sha>/site`.
5. Делает `rsync --delete` только внутрь нового каталога релиза.
6. Кладёт отдельный `Caddyfile` и `docker-compose.yml` в runtime-каталог Planovo.
7. Запускает `docker compose -p planovo-pro-edge ... up -d`.
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
- требуется удалить или перезаписать каталог вне `/home/deploy/planovo-pro`.
