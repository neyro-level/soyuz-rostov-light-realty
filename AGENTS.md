# Союз Ростов Light Realty

Локальный router. Глобальный канон — `~/.codex/AGENTS.md`.

## Plan

- Plan ID: `SZ-ROSTOV-LITE-MAIN`
- Version: `v1.4`
- Status: `APPROVED`
- Canonical file: `docs/MASTER_PLAN.md`
- Standards: `docs/standards/`
- Inventory: `docs/task-manager-inventory.v1.json`

Порядок чтения: `AGENTS.md` → `docs/MASTER_PLAN.md` → `docs/DELIVERY_STATE.yaml` → `docs/standards/` → текущая Task Manager task.

Приоритет при конфликте: ADR владельца → Lite Standard → Hub contract → master plan → UI Core → код → чат.

## Invariants

- `AMS_PROFILE=REALTY_LITE`, `PROJECT_CLASS=COMMERCIAL`, `DELIVERY_PROFILE=COMMERCIAL`
- Базы данных нет: запрещены PostgreSQL, Payload, Prisma, CMS и `DATABASE_URL`
- Git: SourceCraft primary, `PR_ONLY`, лёгкая проверка на PR, один ручной `merge-gate` перед merge
- Production этим планом не делается
- Платформа: `src/platform/**`. Проектный слой: `src/project/**` и `docs/seo/**`

## Delivery state

Текущий эпик и позиция — `docs/DELIVERY_STATE.yaml`.
