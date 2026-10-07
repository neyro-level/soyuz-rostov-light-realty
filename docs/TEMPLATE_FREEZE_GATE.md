# Template Freeze Gate (K1)

Точка готовности шаблона **без production**. Тег `REFERENCE BASELINE — TEMPLATE FREEZE` ставится только после merge PR K1 в `main` на exact SHA (команда владельца).

## Merge-wave

**Быстрый путь:** [PR #44](https://sourcecraft.dev/integrator-p/soyuz-rostov-light-realty/pr/44) `epic/K1-freeze` → `main` (стек H5–K1 одним merge-gate).

Пошагово PR **#33–#43**: `docs/MERGE_WAVE_TEMPLATE_FREEZE.md`.

## Автоматизация

`pnpm verify:freeze` — статические проверки Gate 6 и привязка к существующим verifiers. Полное доказательство Freeze:

```text
pnpm lint
pnpm build
pnpm verify
pnpm test:e2e
pnpm template:check
pnpm verify:exit-mode
```

## Gate 1 — Architecture

| Критерий | Доказательство |
|----------|----------------|
| Core docs | `docs/ФИНАЛЬНЫЙ_МАСТЕР_ПЛАН.md`, `docs/standards/*`, `AGENTS.md` |
| Repository boundary | `pnpm verify:repository`, `verify:contracts` |
| Runtime ≠ прямое чтение fixture | `verify:layers`, `app-no-snapshot-files` |
| Snapshot provider-neutral | `pnpm verify:snapshot` |
| last-good / ACK / lifecycle | `verify:snapshot`, `verify:lifecycle` |

## Gate 2 — Leads

| Критерий | Доказательство |
|----------|----------------|
| Encrypted spool, retry, direct | `pnpm verify:leads` |
| Accepted lead не теряется | cases in `scripts/verify-leads.ts` |

## Gate 3 — SEO

| Критерий | Доказательство |
|----------|----------------|
| URL grammar, canonical, Content Gate | `pnpm verify:seo-contracts`, `verify:grammar` |
| Sitemap, robots, 404/410/redirect | `verify:seo-contracts`, `verify:routes`, e2e `freeze-smoke` |

## Gate 4 — UI

| Критерий | Доказательство |
|----------|----------------|
| shadcn + Lucide | `pnpm verify:ui-core` |
| SOUZ tokens, layout shell | `docs/SOUZ_DESIGN_SYSTEM.md`, `src/project/theme.css` |
| Header / mobile / footer / home | e2e `header.spec.ts`, `home.spec.ts`, H2–H5 specs |
| Starter + responsive + a11y | utility pages e2e, manual spot-check |

## Gate 5 — Quality

| Критерий | Доказательство |
|----------|----------------|
| lint, build, verify | CI / local `pnpm verify` |
| e2e | `pnpm test:e2e` |
| Dual fixture | `pnpm template:check` |
| Exit mode | `pnpm verify:exit-mode` |

## Gate 6 — Cleanliness

| Критерий | Доказательство |
|----------|----------------|
| No DB / CMS | `pnpm verify:freeze` |
| No unused UI kit | `verify:ui-core` |
| No secrets in repo | `verify:env`, `verify:security` |
| No fake facts in generic layers | `verify:layers` project-literal guards |
