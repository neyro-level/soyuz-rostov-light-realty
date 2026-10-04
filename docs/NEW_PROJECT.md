# Новый проект на Realty Lite

Порядок замены проектного слоя. Платформу (`src/platform/**`) не править.

1. `src/project/site.config.ts` — бренд, контакты, URL.
2. `src/project/grammar.config.ts` — geo, категории, районы, routes.
3. `src/project/features.config.ts` — ON/DISABLED страниц.
4. `src/project/navigation.config.ts` — шапка и подвал.
5. `src/project/seo.config.ts` и `docs/seo/SEO_REGISTRY_SEED.csv`.
6. `src/project/data.config.ts` — путь к local fixture/snapshot.
7. `src/project/lead.config.ts` — `LEADS_MODE=direct` и destination.
8. `src/project/media.config.ts` и `src/project/image-loader.ts` — origin без wildcard.
9. `src/project/analytics.config.ts` — opt-in Metrika.
10. `src/project/performance.config.ts` — LCP ≤ 2.5s, CLS ≤ 0.1.
11. `fixtures/<project>/` — Exit Bundle dataset.
12. Проверить `pnpm template:check`, затем `pnpm verify:exit-mode` и `pnpm verify:performance`.
