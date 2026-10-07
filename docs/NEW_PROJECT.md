# Новый проект на AMS Realty Lite (Template Freeze)

Краткая инструкция: меняется только **проектный слой** и данные. Не трогать `src/platform/**`, контракты Repository, `src/ui/primitives/**` и shared layout без ADR.

## Что меняется

| Область | Файлы |
|--------|--------|
| Site config | `src/project/site.config.ts` — бренд, юрлицо, телефоны, email, адрес, `siteUrl` |
| Design tokens | `src/project/theme.css` — `--sr-*`, `--font-sans` (см. `docs/SOUZ_DESIGN_SYSTEM.md`) |
| Grammar & routes | `src/project/grammar.config.ts` — geo, категории, районы, URL templates |
| Feature flags | `src/project/features.config.ts` — ON / DISABLED для страниц и модулей |
| Navigation | `src/project/navigation.config.ts` — header / footer |
| SEO | `src/project/seo.config.ts`, `docs/seo/SEO_REGISTRY_SEED.csv` |
| UI copy | `src/project/ui-text.config.ts` — формы, 404, utility, catalog labels |
| Utility pages | `src/project/utility-pages.config.ts`, `src/project/home-href.ts` |
| Legacy redirects | `src/project/redirects/legacy.ts` (+ при необходимости overlay в `fixtures/<id>/project/`) |
| Data fixture | `src/project/data.config.ts` — `PROJECT_FIXTURE`, путь к snapshot |
| Media | `src/project/media.config.ts`, `src/project/image-loader.ts` — origin без wildcard |
| Leads | `src/project/lead.config.ts` — `LEADS_ROUTE`, destination |
| Analytics | `src/project/analytics.config.ts` — opt-in Metrika |
| Performance budgets | `src/project/performance.config.ts` — LCP / CLS |
| Env | `.env.example` — `DATA_MODE`, `LEAD_TRANSPORT`, SMTP, spool (без `DATABASE_URL`) |
| Exit bundle | `fixtures/<your-project>/` — signed snapshot, `trust.json`, keys (см. README в fixture) |

Для второй проверки шаблона можно опереться на паттерн `fixtures/fixture-alt/project/*` (grammar, seo, site, legacy) и `PROJECT_FIXTURE=fixture-alt`.

## Что не меняется

- `src/platform/**` — grammar engine, snapshot, SEO runtime, leads spool, repository
- `src/ui/**` — primitives, domain, layout (только пропсы / copy снаружи)
- `scripts/verify-*.ts`, `template:check` — расширять по мере новых контрактов, не ослаблять
- Нет PostgreSQL, Payload, Prisma, CMS

## Порядок запуска

1. Заполнить конфиги и fixture dataset; подписать manifest (`scripts/resign-fixture-alt.ts` как образец).
2. `pnpm verify:layers` — нет project literals / brand colors в platform и UI.
3. `pnpm template:check` — primary + alt fixture собираются без правок platform.
4. `pnpm verify:exit-mode` и `pnpm verify:performance`.
5. Перед Freeze: `pnpm verify:freeze` и полный `pnpm verify`, `pnpm test:e2e`.

Подробные gate-чеклисты: `docs/TEMPLATE_FREEZE_GATE.md`.
