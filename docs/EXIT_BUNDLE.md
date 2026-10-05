# Exit Bundle

Handoff-пакет без AMS Hub, S3 и базы данных. Docker/compose — артефакты репозитория, не production rollout.

## Состав

- Git-репозиторий с lockfile
- локальный snapshot/fixture (`fixtures/`)
- vendored Hub contract в `src/platform/hub`
- SEO registry `docs/seo/`
- `DATA_MODE=local`
- `LEADS_ROUTE=direct` (mock sink до SMTP владельца)
- заменяемый `MEDIA_ORIGIN`
- `Dockerfile` и `compose.yaml`

## Что не входит

- Hub credentials
- AMS S3 credentials
- `DATABASE_URL`
- Payload/PostgreSQL
- production deploy
