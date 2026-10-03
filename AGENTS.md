# Союз Ростов Light Realty

Локальный router. Глобальный канон — `~/.codex/AGENTS.md`.

## Plan

- Plan ID: `SZ-ROSTOV-LITE-MAIN`
- Version: `v1`
- Status: `APPROVED`
- Canonical file: `MASTER PLAN_ «Союз застройщиков».md`
- Inventory: `docs/task-manager-inventory.v1.json`

Порядок чтения: `AGENTS.md` → master plan → `docs/DELIVERY_STATE.yaml` → `docs/standards/` → текущая Task Manager task.

Приоритет при конфликте: ADR владельца → Lite Standard → Hub contract → master plan → UI Core → код → чат.

## Invariants

- `AMS_PROFILE=REALTY_LITE`, `PROJECT_CLASS=COMMERCIAL`, `DELIVERY_PROFILE=COMMERCIAL`
- Базы данных нет: запрещены PostgreSQL, Payload, Prisma, CMS и `DATABASE_URL`
- Git: SourceCraft primary, `PR_ONLY`, zero-CI на push/PR, один ручной gate перед merge
- Production этим планом не делается
- Платформа: `src/platform/**`. Проектный слой: `src/project/**` и `docs/seo/**`

## Delivery state

Текущий эпик и позиция — `docs/DELIVERY_STATE.yaml`.
