# Новый проект на Realty Lite

Порядок замены проектного слоя. Платформу (`src/platform/**`) не править.

1. `src/project/site.config.ts` — бренд, контакты, URL.
2. `src/project/grammar.config.ts` — geo, категории, районы, routes.
3. `src/project/features.config.ts` — ON/DISABLED страниц.
4. `src/project/navigation.config.ts` — шапка и подвал.
5. `src/project/seo.config.ts` и `docs/seo/SEO_REGISTRY_SEED.csv`.
6. `src/project/ui-text.config.ts` — подписи формы, согласие, баннер Metrika, 404, сообщения формы.
7. `src/project/data.config.ts` — `PROJECT_FIXTURE` и путь к local fixture/snapshot.
8. `src/project/lead.config.ts` — `LEADS_ROUTE=direct` и destination.
9. `.env.example` — `LEAD_TRANSPORT` (`none` или `smtp`) и SMTP-переменные: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
10. `src/project/theme.css` — токены и `--font-sans` (по умолчанию платформенный Manrope).
11. `src/project/media.config.ts` и `src/project/image-loader.ts` — origin без wildcard.
12. `src/project/analytics.config.ts` — opt-in Metrika.
13. `src/project/performance.config.ts` — LCP ≤ 2.5s, CLS ≤ 0.1.
14. `fixtures/<project>/` — Exit Bundle dataset.
15. Проверить `pnpm template:check`, затем `pnpm verify:exit-mode` и `pnpm verify:performance`.
