# Новый проект на AMS Realty Lite

Меняется только **проектный слой** и данные. Не трогать `src/platform/**`, контракты Repository и `src/ui/primitives/**` без ADR.

## Полный список замен

| Область | Файлы |
|--------|--------|
| Site | `src/project/site.config.ts` |
| Home copy | `src/project/home.config.ts` |
| Home model | `src/project/build-home-model.ts`, `src/project/home-href.ts` |
| UI copy | `src/project/ui-text.config.ts` |
| Theme | `src/project/theme.css` (+ overlay `fixtures/fixture-alt/project/theme.css`) |
| Grammar | `src/project/grammar.config.ts` |
| Features | `src/project/features.config.ts` |
| Navigation | `src/project/navigation.config.ts` |
| SEO | `src/project/seo.config.ts`, `src/project/seo-vars.ts`, `docs/seo/SEO_REGISTRY_SEED.csv` |
| Pages | `src/project/utility-pages.config.ts`, `src/project/starter-pages.config.ts`, `src/project/entity-pages.config.ts`, `src/project/catalog-entry.config.ts`, `src/project/entity-detail-model.ts` |
| Legacy | `src/project/redirects/legacy.ts` |
| Data | `src/project/data.config.ts`, `src/project/runtime.ts` |
| Media | `src/project/media.config.ts`, `src/project/image-loader.ts` |
| Leads | `src/project/lead.config.ts` |
| Analytics | `src/project/analytics.config.ts` |
| Performance | `src/project/performance.config.ts` |
| Env | `.env.example` — `DATA_MODE`, `LEAD_TRANSPORT`, SMTP, spool (без `DATABASE_URL`) |
| Fixture | `fixtures/<your-project>/` — signed snapshot, `trust.json`, keys |
| Alt overlay | `fixtures/fixture-alt/project/{site,grammar,seo,legacy,home,ui-text,theme}` |

Для dual-build используйте `PROJECT_FIXTURE=fixture-alt`. `template:check` собирает primary и alt и сканирует `.next` на литералы primary-бренда.

## Что не меняется

- `src/platform/**`
- `src/ui/**` — только пропсы и copy снаружи
- `scripts/verify-*.ts`, `template:check` — не ослаблять
- Нет PostgreSQL, Payload, Prisma, CMS

См. также `docs/TEMPLATE_EXCLUDE.md`.

## Порядок запуска

1. Заполнить конфиги и fixture; подписать manifest (`scripts/resign-fixture-alt.ts` как образец).
2. `pnpm verify:layers` — нет project literals / brand colors в platform и UI.
3. `pnpm template:check` — primary + alt без правок platform; `.next` alt без primary-бренда.
4. `pnpm verify:exit-mode` и `pnpm verify:performance`.
5. Перед Freeze: `pnpm verify:freeze` и полный `pnpm verify`.

Подробные gate-чеклисты: `docs/TEMPLATE_FREEZE_GATE.md`.
