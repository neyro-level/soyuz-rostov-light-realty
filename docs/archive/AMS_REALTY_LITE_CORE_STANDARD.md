# AMS REALTY LITE CORE STANDARD 1.1.0 — SOLO + AI

**Версия:** 1.1.0 FINAL  
**Статус:** CANONICAL / READY FOR STARTER IMPLEMENTATION  
**Профиль:** `AMS_PROFILE=REALTY_LITE`  
**Модель разработки:** solo owner / product architect + AI / Codex  
**Базовый runtime:** Next.js App Router · React · TypeScript strict · Tailwind CSS 4.x · shadcn/ui · Zod · pnpm  
**Data backend:** AMS Data Hub signed snapshot contract  
**Project database:** NONE  
**CMS / Admin:** NONE  
**Repository:** SourceCraft  
**Production baseline:** Timeweb Cloud VPS · Docker · Nginx · persistent mounted data volume  
**UI constitution:** AMS UI Core v5.0  
**Architecture reference:** AMS Data Hub v3.1.2+ current canonical · AMS Realty Platform URL/SEO patterns proven on «Союз застройщиков»  
**Подход:** docs-first · server-first · snapshot-first · SEO-owned-by-site · portability-by-design · privacy-by-contract · security-by-default · minimum ceremony  
**Документ предназначен:** в первую очередь для AI/Codex как техническая конституция и source of truth.

## VERSION INTENT

`1.1.0` — MINOR release без смены продуктовой концепции.

Причина MINOR:

```text
Lite 1.0.1 architecture remains valid
+
Hub 3.1.2 contract alignment
+
URL ownership clarification
+
privacy/publication contract hardening
+
security/performance baseline update
+
new-build Content Gate mechanisms
+
AI-readable operational invariants
```

Главное правило чтения AI:

> Если этот документ конфликтует со старой перепиской, памятью, устаревшим master-plan или кодом-шаблоном, AI обязан зафиксировать конфликт и считать эту конституцию целевым стандартом, пока owner явно не утвердит более новую версию/ADR.


---

# 0. EXECUTIVE DECISION

`AMS REALTY LITE` — канонический клиентский профиль AMS для сайтов недвижимости, которым не нужен собственный mutable application backend.

Lite является **полноценным самостоятельным Next.js-приложением**, а не «тонким frontend к AMS Data Hub».

Ключевая формула:

```text
AMS DATA HUB
= ingestion + normalization + project factual state + snapshots

AMS REALTY LITE
= independent site + SEO + URL grammar + UI + content + leads
```

Lite:

```text
Next.js
+
local verified last-good snapshot
+
project-owned SEO / URL / content rules
+
repository-owned static/editorial content
+
LeadSink
+
no PostgreSQL
+
no Payload
+
no Prisma
+
no CMS
+
no Admin
```

Главный архитектурный инвариант:

> **Обычный page rendering никогда не зависит от доступности AMS Data Hub.**

Data Hub не является runtime backend страницы.

Сайт не делает:

```text
page request
→ Hub API
→ render
```

Правильно:

```text
Hub
→ signed immutable snapshot
→ local atomic apply
→ local last-good dataset
→ Next.js renders locally
```

При прекращении работы с AMS:

```text
ProjectExitBundleV1
+
client-controlled media
+
DATA_MODE=local
+
LEADS_MODE=direct
→ самостоятельный сайт
```

---

# 1. НАЗНАЧЕНИЕ И ГРАНИЦЫ ПРОФИЛЯ

## 1.1. Для каких проектов используется REALTY_LITE

Типовой профиль:

```text
агентство недвижимости
застройщик / отдел продаж
каталог вторичной недвижимости
каталог новостроек
смешанный каталог
1..N городов
десятки / сотни ЖК
сотни / несколько тысяч объектов
команда / агенты
30–40 статей блога
сервисные и коммерческие страницы
SEO-каталоги / районы / approved facets
формы заявок
карта / фильтры / избранное
```

Количество объектов само по себе **не является причиной** добавлять Payload/PostgreSQL на клиентский сайт.

## 1.2. REALTY_LITE подходит, если

```text
клиенту не нужен CMS/Admin
контент меняется нечасто
статьи можно публиковать через Git/AI workflow
inventory приходит из Hub
SEO управляется кодом/конфигом проекта
нет серверного личного кабинета
нет сложного mutable workflow клиента
```

## 1.3. REALTY_LITE не подходит, если появляется доказанный trigger

```text
клиент должен сам редактировать данные через Admin
много редакторов / роли / права
черновики / approval / publishing workflow
частые ручные изменения сущностей на стороне клиента
операционный кабинет
сложный user-generated state
персональный кабинет с серверным состоянием
project-specific mutable relationships, которых нет в Hub
```

Тогда рассматривается `REALTY_FULL`.

Переход на FULL не должен менять URL grammar, public identity, SEO architecture, UI contracts и Hub ingestion.

---

# 2. HARD CONTRACT

Эти правила нельзя ослаблять ради скорости разработки. Для AI это набор **необсуждаемых инвариантов**, если owner не создал явный ADR, который меняет конкретное правило.

## 2.1. Data / runtime

1. У REALTY_LITE **нет project PostgreSQL**.
2. У REALTY_LITE **нет Payload CMS**.
3. У REALTY_LITE **нет Prisma или другого ORM**.
4. У REALTY_LITE **нет client Admin**.
5. Lite не парсит XML/YRL/API feeds.
6. Lite не хранит source credentials клиентских feeds.
7. Lite не подключается напрямую к Hub PostgreSQL.
8. Lite не делает Hub API request для обычного page rendering.
9. Public UI не получает raw snapshot records напрямую.
10. Все snapshot данные проходят `SnapshotRepository → DTO/ViewModel → UI`.
11. Broken snapshot никогда не заменяет last-good.
12. Empty/invalid snapshot никогда не превращает сайт в пустой каталог.
13. `publishSequence` монотонный; anti-replay обязателен.
14. Snapshot применяется только атомарно после полной проверки.
15. Production local data хранится в persistent mounted volume, а не только в ephemeral container filesystem.
16. Hub snapshot contract является единственным автоматическим data input Lite.
17. Lite **не переопределяет Hub enums/DTO вручную**. Канонические schema/types берутся из `@ams/data-contracts` / `@ams/realty-contracts` либо из их vendored immutable copy для exit/local mode.
18. Наличие нового типа данных в snapshot не активирует публичный route автоматически.
19. Lite использует только public/project-consumable projection Hub. Internal/source/private поля не должны быть известны UI.
20. Current snapshot и previous revision могут одновременно жить в памяти только для controlled in-flight transition; бессрочное накопление revision запрещено.

## 2.2. Site ownership

21. URL grammar принадлежит сайту.
22. SEO strategy принадлежит сайту.
23. Canonical/indexability/sitemap/robots принадлежат сайту.
24. Hub хранит persistent **entity URL identity state**, но не определяет URL policy и не является владельцем готового canonical path.
25. Static commercial content принадлежит repository проекта.
26. Blog/journal content принадлежит repository проекта.
27. Long-form SEO content ЖК по умолчанию принадлежит repository проекта.
28. Design System принадлежит проекту.
29. Lead handling не является обязанностью Data Hub.
30. Final route, HTTP status, canonical и indexability вычисляет Lite.
31. Grammar migration и project-owned redirect rules живут в Lite repository.
32. Hub factual/project state не может автоматически переписать структуру публичных URL.

## 2.3. Portability

33. Сайт обязан поддерживать `DATA_MODE=hub | local`.
34. Handoff не требует AMS Hub credentials.
35. Handoff не требует AMS-owned media origin.
36. После handoff проект должен собираться на clean machine из repository + Exit Bundle.
37. Build не зависит от приватного AMS package registry, если package нельзя передать клиенту.
38. Published URLs и redirects переносятся вместе с проектом.
39. Текущий публичный dataset переносится вместе с проектом.
40. Snapshot schemas, необходимые для build/runtime, vendored или передаваемы.
41. После exit `LEADS_MODE=direct` должен работать без AMS service.
42. После exit текущий сайт продолжает работать, даже если будущий XML ingestion новый подрядчик реализует отдельно.

## 2.4. SEO / URL

43. URL schema фиксируется до production.
44. Published public identity не переиспользуется.
45. Published slug не меняется автоматически из-за feed title/address changes.
46. Canonical path строится **только** единым Lite URL builder.
47. Hub-provided `canonicalPath`, если временно присутствует в legacy contract, не является source of truth и не используется как основание для rendering/canonical generation.
48. Random filter combinations не становятся indexable URL автоматически.
49. Sitemap содержит только реально разрешённые canonical URLs.
50. Structured Data строится только из factual/source-backed данных.
51. Никаких synthetic ratings, counts, prices, dates, reviews или availability.
52. `slugHistory[]` материализуется Lite в прямые one-hop `301` на текущий canonical.
53. Grammar migration redirects принадлежат Lite repository и не смешиваются с entity slug history.
54. Framework trailing-slash normalization использует framework `308`; SEO/legacy migration redirect — `301`.
55. Redirect chains/loops release-blocking, если их можно устранить.

## 2.5. Privacy / publication

56. Lite никогда не получает и не пытается восстановить private apartment number.
57. Lite использует `addressPublic` и `geoPublic` только в разрешённой Hub точности.
58. `locationPrecision` можно только понизить; повышать/восстанавливать точность запрещено.
59. Геокодирование публичного адреса ради восстановления скрытых координат запрещено.
60. Raw feed HTML не существует в public rendering contract.
61. HTML description допускается только как `descriptionHtmlSafe` после Hub sanitization и через фиксированный безопасный renderer.
62. `descriptionText` — канонический plain-text input для Content Gate/поиска/метаданных, если применимо.
63. Если public Agent relation отсутствует, listing использует `ProjectPublicContact` из snapshot `project/contacts`.
64. Карточка/страница объекта не должна терять контактный CTA только из-за скрытого/неразрешённого Agent.
65. `NO_ACTIVE_LISTINGS` не равен `DEPARTED` и не создаёт redirect агента.
66. `isImageOrderChangeAllowed=false` означает: Lite сохраняет snapshot order feed-origin media и не сортирует его самостоятельно.

## 2.6. UI

67. AMS UI Core v5.0 применяется полностью.
68. Server Components — default.
69. `"use client"` — только interactive leaf.
70. Reusable UI не импортирует snapshot storage implementation.
71. Один project = один Design System.
72. `REUSE → VARIANT → CREATE`.
73. shadcn/ui — primitive foundation.
74. Design literals не размазываются по JSX.
75. Карта, фильтры, галерея и избранное не превращают весь каталог в client SPA.

## 2.7. Security

76. Browser никогда не получает Hub private keys/secrets.
77. Browser не получает private agent/source/internal data.
78. Snapshot signature проверяется server-side.
79. Manifest `keyId` проверяется против trust set и revoked-key denylist.
80. Internal sync endpoint не является public data API.
81. Webhook является trigger, а не carrier данных.
82. Configurable outbound URLs имеют allowlist и SSRF protection.
83. Form PII не попадает в analytics/logs.
84. Secrets не попадают в Git/docs/browser bundle.
85. Production Next.js не может быть ниже project-approved security floor.
86. Security-floor verification по lockfile является release gate.
87. Remote Image Optimization на Lite VPS по умолчанию не используется; media variants готовятся upstream и выбираются custom loader.
88. Если built-in Next Image Optimization намеренно включён ADR-ом, допускается только exact approved media origin без wildcard и только на patched Next.js.
89. Inventory/catalog/entity/geo routes по умолчанию не используют ISR/SSG/`use cache`; исключение — только ADR + freshness/security proof.
90. Snapshot sync/download/verify не должен блокировать public rendering path.

## 2.8. Simplicity

91. Redis, broker, Meilisearch, Elasticsearch, PostGIS, Kubernetes, microservices запрещены без доказанного trigger.
92. Separate backend запрещён без доказанного trigger.
93. Universal page builder запрещён.
94. Client CMS «на будущее» запрещён.
95. При одинаковой безопасности выбирается решение, проще для solo owner + AI.
96. Нельзя добавлять инфраструктуру только потому, что она «может пригодиться».

---

# 3. SOURCE OF TRUTH И ПОВЕДЕНИЕ AI

## 3.1. Приоритет источников

```text
1. approved current constitution / explicit owner ADR
2. exact deployed/source commit + actual runtime state
3. AMS REALTY LITE CORE STANDARD
4. AMS Data Hub current canonical public contract
5. approved project PROJECT.md / project Master Plan
6. AMS UI Core
7. Snapshot Contract major/minor used by project
8. URL / SEO registry and project config
9. Design System / globals.css
10. Figma / visual reference
11. chat / memory
```

Разъяснение:

- Figma, screenshots и чаты — input, но не runtime source of truth.
- Старый project plan не может молча отменить новый Lite Standard.
- Фактический код важен для аудита текущего состояния, но если он конфликтует с утверждённым Standard, AI должен зафиксировать deviation, а не объявлять код новым каноном.

## 3.2. Contract ownership

Каноническое правило:

```text
Hub contract package
→ owns public enums / schemas / DTO primitives

Lite
→ imports/consumes them
→ maps them into page DTO/ViewModel
→ does not fork equivalent enums by hand
```

Допустимо:

```text
@ams/data-contracts
@ams/realty-contracts
```

либо для handoff/local mode:

```text
vendored immutable schemas
```

Недопустимо:

```text
Hub: GARAGE_BOX
Lite: GARAGE

Hub: RENT_LONG / RENT_SHORT
Lite: RENT
```

без versioned adapter, миграции и explicit compatibility decision.

Если contract package недоступен:

```text
AI MUST NOT invent missing enum values.
AI MUST inspect vendored schema / DATA_CONTRACT.md / Hub public contract.
```

## 3.3. AI workflow

```text
прочитать Hard Contract
→ определить project profile
→ проверить фактический repository state
→ проверить Snapshot Contract major/minor
→ проверить imported/vendored contract schemas
→ проверить URL/SEO contracts
→ проверить privacy/publication boundary
→ проверить security floor по lockfile
→ REUSE → VARIANT → CREATE
→ выполнить только реальные relevant checks
→ честно указать VERIFIED / HYPOTHESIS / REQUIRES CHECK
```

AI не пишет `DONE / GREEN / CHECKED`, если proof фактически не запускался.

## 3.4. Без owner decision AI не делает

```text
добавление БД
Payload
Prisma/ORM
CMS/Admin
смену URL grammar
смену publicUrlId semantics
смену Snapshot Contract major
смену entity identity model
Redis / broker / search engine
новый production service
перенос SEO ownership в Hub
перенос готового canonicalPath ownership в Hub
universal page builder
server-side personal account
ISR/use cache для inventory routes
built-in remote image optimization с wildcard hosts
runtime AI-generated factual copy
```

## 3.5. Правило неопределённости

Если стандарт зависит от поля, которого нет в текущем Hub contract:

```text
do not fabricate
→ mark REQUIRES HUB CONTRACT
→ isolate code behind typed capability
→ keep existing safe behavior
→ create explicit cross-standard task
```

Если project config не определил threshold/SEO decision:

```text
do not guess
→ choose non-indexable / disabled safe state
→ record owner decision required
```

---

# 4. КАНОНИЧЕСКИЙ СТЕК REALTY_LITE

```text
Runtime:       Next.js App Router
UI:            React
Language:      TypeScript strict
Validation:    Zod
Package:       pnpm
Styling:       Tailwind CSS 4.x
Primitives:    shadcn/ui
Icons:         Lucide
Content:       repository-owned Markdown + typed config
Data:          local immutable Hub snapshot
Data reader:   SnapshotRepository
Proxy:         Nginx
Deployment:    Docker
Git/CI:        SourceCraft
Production:    Timeweb Cloud VPS
Durable data:  host bind mount / named persistent volume
Node:          Node.js 24 LTS baseline unless newer LTS explicitly adopted
```

Нет:

```text
Payload
PostgreSQL
Prisma
ORM
DB migrations
DB backup for client site
Admin panel
XML parser
feed scheduler
feed credentials
Hub DB access
```

## 4.1. Security floor — version policy

Конституция задаёт **minimum security floor**, но exact dependency truth всегда:

```text
package.json
+
pnpm lockfile
+
approved deployment image
```

На дату выпуска `1.1.0`:

```text
Next.js >= 16.3.8 on 16.3 line
Node.js 24 LTS
Tailwind CSS 4.x
React = version compatible with selected Next.js release and free of known affected RSC advisories
```

Для React:

```text
если project явно pin-ит React 19.2.x
→ security floor >= 19.2.4

если Next App Router использует bundled/canary React integration
→ exact resolved RSC packages проверяются lockfile/security audit
```

Не фиксировать старый React minor только ради совпадения с историческим starter.

## 4.2. Security update SLA

Official security release для Next/React:

```text
official advisory published
→ assess applicability immediately
→ patch within 72 hours after compatibility proof
→ verify lockfile
→ targeted regression tests
→ release
```

Критический out-of-band advisory может требовать немедленного patch path.

`verify:security` обязан проверять:

```text
Next version >= approved floor
known vulnerable RSC package versions absent
unsupported/EOL Node absent
wildcard remote image host absent
forbidden cache mode absent on inventory routes
```

## 4.3. Verified external baseline at 1.1.0 release

На 2026-09-30 официальный Next.js security release требует обновление `16.3.x` до `16.3.8`.

Релиз закрывает, среди прочего:

```text
SSRF in Image Optimization when allow-listed remote URLs are used
SSG/ISR cache-poisoning classes
root-param/use-cache cache isolation issue
other metadata/dev-server issues
```

Это **не означает**, что любой `/{geo}/` route автоматически уязвим.

Правило Lite строже по архитектурным причинам:

```text
inventory/catalog/entity/geo
→ current local snapshot
→ dynamic server render
→ no ISR/SSG/use cache by default
```

Причины:

```text
freshness is controlled by publishSequence
cache invalidation complexity is unnecessary
self-hosted catalog correctness is easier to prove
security surface is smaller
```

---

# 5. PRODUCTION TOPOLOGY

Канонический baseline:

```text
Internet
  ↓
Nginx
  ↓
Next.js REALTY_LITE runtime
  ↓
SnapshotRepository
  ↓
persistent mounted volume
  /var/lib/ams-realty-lite/<project>/
```

Data delivery:

```text
AMS Data Hub
  ↓
signed immutable snapshot
  ↓
private/project S3 artifact
  ↓
Lite snapshot-sync worker
  ↓
verify
  ↓
atomic local apply
  ↓
shared persistent volume
  ↓
Next.js reads CURRENT
  ↓
ACK to Hub
```

## 5.1. Process separation

Default production topology:

```text
Container/process A: web
→ Next.js
→ reads CURRENT
→ serves pages/forms/internal trigger

Container/process B: snapshot-sync
→ polls / wakes on trigger
→ downloads/verifies snapshot
→ writes revision
→ atomically switches CURRENT
→ sends ACK
```

Оба процесса используют один project-scoped persistent volume.

Hard rule:

```text
heavy download/hash/Zod/index proof
-X→ public request lifecycle
```

Webhook/internal trigger в web process:

```text
authenticate
→ validate project
→ set wake flag / invoke lightweight worker signal
→ return
```

Webhook не скачивает snapshot и не делает полный apply внутри request handler по умолчанию.

Если конкретный project сознательно выбирает in-process sync:

```text
ADR REQUIRED
+
render isolation proof
+
memory/concurrency proof
+
failure test
```

## 5.2. Failure behavior

```text
Hub unavailable
→ current local last-good remains active

S3 unavailable
→ current local last-good remains active

sync worker crashes
→ public Next.js process continues serving current revision

bad snapshot
→ rejected
→ current last-good untouched
```

## 5.3. Replica baseline

Baseline production:

```text
one web replica
+
one sync worker
+
one shared project volume
```

Multi-replica web допускается только после explicit shared-state/cache strategy proof.

## 5.4. Nginx baseline

Nginx обеспечивает:

```text
TLS
HTTP/2
gzip and/or Brotli where available
immutable cache headers for /_next/static
request/body limits
rate limit for /api/public/leads
rate limit for /api/internal/snapshot
proxy timeouts
forwarded headers policy
```

Короткий anonymous GET proxy cache для HTML, например до 60 секунд, **не является default**.

Он допускается только после proof:

```text
publishSequence changed
→ new public response visible within declared cache SLA
```

---

# 6. КАНОНИЧЕСКАЯ СТРУКТУРА РЕПОЗИТОРИЯ

Предпочтительная форма:

```text
src/
  app/
    (site)/
    api/
      internal/
        snapshot/
      public/
        leads/

  platform/
    contracts/
    snapshot/
      verify/
      sync/
      storage/
    data/
      repository/
      indexes/
      dto/
    grammar/
    seo/
    lifecycle/
    media/
    leads/
    analytics/
    security/
    observability/

  project/
    project.config.ts
    env.ts
    grammar.config.ts
    seo.config.ts
    category.config.ts
    lead.config.ts
    analytics.config.ts
    content/
    redirects/

  ui/
    primitives/
    layout/
    shared/
    domain/
    pages/

content/
  journal/
  developments/
  legal/

workers/
  snapshot-sync/

public/

data/
  fixtures/

scripts/

tests/

docs/
  PROJECT.md
  ARCHITECTURE.md
  DATA_CONTRACT.md
  SEO.md
  URL_GRAMMAR.md
  CONTENT.md
  DESIGN.md
  OPERATIONS.md
  HANDOFF.md
```

Допустима workspace form:

```text
packages/contracts
packages/ui
packages/snapshot-client
```

если starter уже использует workspace packages.

## 6.1. Dependency direction

```text
project → platform contracts/config hooks
app     → platform / project / ui
ui      → DTO/contracts only
worker  → snapshot sync/storage/contracts

platform core -X→ project literals
ui            -X→ snapshot storage implementation
ui            -X→ Node fs
ui            -X→ Hub client
web render    -X→ full snapshot download/apply
```

`src/platform/**` не содержит бренд, город или project-specific literals.

## 6.2. Project-owned content boundaries

```text
content/journal/**
→ articles

content/developments/<developmentUid>.md
→ long-form project SEO/editorial text for Development

src/project/content/**
→ typed commercial claims/config

src/project/redirects/**
→ grammar migration / project-owned redirects
```

Одно content class → один owner.

Hub dynamic short editorial не должен дублировать repository long-form authoritative text.

---

# 7. DATA OWNERSHIP BOUNDARY

## 7.1. Hub владеет

```text
XML/YRL/API ingestion
source adapters
source profiles
normalization
project factual state
shared factual catalog
source provenance
identity resolution
agents factual state
agent publication projection
ProjectPublicContact factual values
lifecycle factual state
persistent project entity URL identity state
slug history
entity redirect target identity when applicable
snapshot composition
snapshot signing
snapshot publication
media mirror / approved public media variants
```

Hub **не владеет** final page path grammar.

Если legacy Hub contract временно содержит `canonicalPath`, Lite трактует его как compatibility field, а не как authoritative canonical owner.

## 7.2. Lite владеет

```text
URL grammar
route semantics
canonical path materialization
grammar migration redirects
SEO strategy
SEO registry mechanism
Content Gate
indexability
canonical
sitemaps
robots
structured data
static commercial content
long-form Development SEO content by default
journal/blog
UI
analytics
lead UX and LeadSink
local last-good snapshot activation
project-specific public location reduction
```

## 7.3. Lite не владеет

```text
raw feed parsing
source credentials
feed scheduling
source revisions
agent matching
consent evidence
shared catalog editing
Hub tenant operations
private source facts
exact hidden location
media rights/provenance source state
```

## 7.4. ProjectPublicContact

Single factual owner:

```text
Hub / Project scope
→ snapshot project/contacts
→ Lite ProjectContactDTO
→ listing/agent fallback UI
```

`project.config.ts` может хранить:

```text
labels
CTA order
button presentation
contact surface enable/disable policy
```

но не дублирует factual phone/email/address/messengers как второй source of truth в `DATA_MODE=hub`.

В `DATA_MODE=local` authoritative values приходят из exported local dataset.

## 7.5. Long-form Development editorial

Default:

```text
Hub
→ Development facts
→ short operational/presentation overrides

Lite repository
→ content/developments/<developmentUid>.md
→ long-form SEO/commercial editorial
```

Если future project сознательно переносит long-form Development editorial в Hub:

```text
explicit ADR
+
repository source disabled for this content class
```

---

# 8. SNAPSHOT CONTRACT

## 8.1. Snapshot — единственный автоматический data input Lite

Snapshot является immutable public/project-consumable artifact.

Канонические logical datasets по Hub 3.1.2:

```text
geo
developers
developments
buildings
prices
media
inventory
agents
project/contacts
editorial
urls
redirects
lifecycle
```

Фактический набор определяется manifest и supported contract minor.

Hard rule:

```text
inventory
→ ONE unified dataset
→ typed by propertyType
→ property-specific facts union
```

Нельзя ожидать физические dataset families:

```text
inventory/apartments
inventory/houses
inventory/land
...
```

если только будущий versioned contract явно не вводит transport sharding.

## 8.2. Contract source

Lite не объявляет независимые копии Hub enum/schema.

Canonical source:

```text
@ams/data-contracts
+
@ams/realty-contracts
```

или vendored immutable equivalent для exit.

`DATA_CONTRACT.md` описывает:

```text
which contract version is consumed
which fields Lite actually uses
derived Lite-only semantics
compatibility rules
```

но не изобретает альтернативный upstream vocabulary.

## 8.3. Manifest minimum

```text
schemaMajor
schemaMinor

projectId
publishSequence

generatedAt
publishedAt

catalogRevision?
sourceRevisions[]

files[]

keyId
signature
```

Каждый file:

```text
kind
key
sha256
bytes
count
```

## 8.4. Trust set / signature

Lite хранит public trust set:

```text
current keyId → Ed25519 public key
next keyId?   → public key during planned overlap
revokedKeyIds → denylist/state
```

Acceptance:

```text
keyId known
AND keyId not revoked
AND signature valid
```

Unknown/revoked key:

```text
reject snapshot
→ keep last-good
```

Key rotation не требует schema-major migration.

## 8.5. Lite принимает snapshot только если hard gates pass

Hard snapshot gates:

```text
manifest parses
projectId exact match
schemaMajor supported
publishSequence > current
keyId trusted and not revoked
signature valid
all declared files present
sha256 matches
bytes matches
dataset envelope/serialization valid
critical project-level references valid
no forbidden/private contract surface
safety limits pass
```

Любой hard-gate fail:

```text
reject entire incoming snapshot
→ current last-good untouched
```

## 8.6. Entity-level quarantine policy

Не каждая локальная semantic ошибка обязана блокировать весь snapshot.

После hard gates Lite выполняет record/relationship/url materialization validation.

Примеры entity-level issue:

```text
one entity cannot materialize canonical URL
one optional relation points to missing entity
one record violates non-critical public DTO semantic rule
one media relation is unusable
one long-form local content reference is stale
```

Policy:

```text
issue
→ quarantine affected entity
→ quarantine dependent public projections when required
→ operational warning
→ recompute usable entity ratio
```

Default project threshold:

```text
MAX_ENTITY_QUARANTINE_PERCENT = 0.5
```

Если:

```text
quarantined entities / candidate public entities <= threshold
AND no critical invariant broken
→ snapshot may activate with quarantine report
```

Если:

```text
ratio > threshold
OR critical identity/contact/URL uniqueness invariant fails
→ reject entire snapshot
```

Project may set stricter threshold, including `0`.

Critical regardless of ratio:

```text
duplicate publicUrlId
identity collision
project/contacts absent when required fallback cannot be satisfied
redirect loop affecting shared route space
unsupported property/contract major semantics
private-field leak
```

Quarantine никогда не «исправляет» factual value эвристикой.

## 8.7. Anti-replay

```text
incoming.publishSequence <= current.publishSequence
→ reject
```

Rollback выполняется Hub как **новый higher sequence** с прежним approved content state.

## 8.8. Major/minor compatibility

```text
minor
→ backward-compatible within supported major unless capability explicitly unsupported

major
→ explicit project upgrade required
```

Lite starter обязан иметь declarative:

```text
SUPPORTED_SNAPSHOT_MAJOR=<n>
SUPPORTED_SNAPSHOT_MINOR_MAX=<n or compatibility policy>
```

## 8.9. Forbidden public data proof

Lite contract не должен содержать/принимать:

```text
apartmentNumberPrivate
sourceAddressRaw
raw feed HTML
source endpoint / credential ref
AgentExternalIdentity
phoneNorm/emailNorm identity helpers
consent evidence
raw matching state
raw ImportIssue payload
Hub audit internals
```

Если forbidden field обнаружен в public snapshot:

```text
privacy gate FAIL
→ reject entire snapshot
→ alert
```

---

# 9. SNAPSHOT SYNC / APPLY

## 9.1. Delivery modes

```text
webhook trigger
+
poll fallback
```

Webhook не содержит dataset.

Он сообщает только:

```text
project has a newer manifest available
```

Lite скачивает manifest/artifacts только server-side project credentials.

## 9.2. Canonical sync sequence

Default worker flow:

```text
receive wake signal / scheduled poll
→ acquire single-writer apply lock
→ fetch current manifest
→ verify keyId/signature/project/schema/sequence
→ download into temporary revision directory
→ verify hashes/bytes
→ parse datasets
→ hard contract validation
→ build record indexes
→ run entity quarantine/materialization proof
→ run referential integrity after quarantine closure
→ fsync where applicable
→ atomic activate revision
→ update CURRENT pointer/meta
→ release lock
→ ACK applied publishSequence
```

## 9.3. Atomicity

Нельзя:

```text
overwrite current files one-by-one
```

Правильно:

```text
revisions/<sequence>.tmp/
→ complete verify
→ rename to revisions/<sequence>/
→ atomically replace CURRENT pointer
```

## 9.4. Single-writer lock

Concurrent apply запрещён.

Canonical mechanism:

```text
atomic filesystem lock
+
lease timestamp
+
stale lock recovery
```

Точная implementation фиксируется в `ARCHITECTURE.md` и проверяется integration test.

## 9.5. Worker isolation

Default:

```text
snapshot-sync worker
→ performs remote fetch / hash / validation / write / ACK

Next web process
→ reads CURRENT
→ reloads immutable local revision when sequence changes
```

Web process не должен выполнять тяжёлую sync работу в page request.

## 9.6. Failure policy

Любая ошибка до atomic activation:

```text
incoming snapshot rejected
current last-good untouched
operational error logged without secrets/PII
Hub ACK not sent as applied
```

Entity quarantine under approved threshold — не sync failure, но:

```text
activation report MUST include:
publishSequence
quarantine count
quarantine ratio
reason codes
affected entity types
```

## 9.7. Durable local state

Production path example:

```text
/var/lib/ams-realty-lite/<project>/
  current.json
  revisions/
    184/
    185/
  state/
    applied.json
    sync.json
    quarantine.json
    wake.flag
```

Data volume переживает container recreation.

## 9.8. Revision retention on disk

Disk retention policy — operational config.

Minimum:

```text
current
+
previous known-good revision
```

Дополнительные локальные revisions могут храниться ограниченно для rollback/debug, но не бесконечно.

Hub rollback всегда публикует **new higher publishSequence**; Lite не переключается назад на lower sequence как production rollback mechanism.

## 9.9. SUSPENDED project behavior

Если Hub project state `SUSPENDED`:

```text
no new publication may arrive
→ existing authorized manifest/artifacts remain readable
→ Lite keeps current last-good
→ restart/clean recovery may re-fetch already-published authorized snapshot
→ public UX does not show an error only because snapshot is stale
```

---

# 10. SNAPSHOT REPOSITORY / DTO BOUNDARY

Raw snapshot не используется страницами напрямую.

```text
Snapshot Files
→ SnapshotRepository
→ domain queries
→ DTO / ViewModel
→ UI
```

## 10.1. Responsibilities SnapshotRepository

```text
load current publishSequence
validate local active contract
cache parsed immutable revision
build in-memory indexes
query/filter/sort
resolve entity by uid/publicUrlId
resolve geo/development/agent relations
resolve ProjectPublicContact
return safe domain records
materialize Lite-owned URLs
expose only public-safe data
```

SnapshotRepository не знает raw XML/YRL.

## 10.2. In-memory revision cache

Baseline:

```text
current publishSequence
→ immutable loaded revision
→ in-memory indexes keyed by publishSequence
```

После смены CURRENT:

```text
next request sees new sequence
→ loads new immutable revision
→ builds new indexes
→ old in-flight requests may finish on old immutable revision
```

Memory invariant:

```text
maximum 2 loaded revisions
= current + previous/in-flight
```

После завершения in-flight использования old revision:

```text
old indexes/references released
→ eligible for GC
```

Нельзя держать все исторические revisions в heap.

## 10.3. Memory budget proof

Каждый starter/project фиксирует memory budget контейнера в `ARCHITECTURE.md` / `OPERATIONS.md`.

Representative proof минимум:

```text
5,000 inventory entities
100 developments
agents
media refs
geo
URL indexes
```

Измерить:

```text
cold load time
index-build time
heap before load
heap after current load
peak heap during current→next transition
heap after previous revision release
representative catalog query latency
```

Числовые acceptance thresholds — project/deployment values, не universal constants.

## 10.4. UI contracts

Примеры:

```text
GeoDTO
DevelopmentCardDTO
DevelopmentDetailsDTO
PropertyCardDTO
PropertyDetailsDTO
PropertyListDTO
PropertyFilterDTO
AgentCardDTO
AgentDetailsDTO
ProjectContactDTO
JournalCardDTO
JournalArticleDTO
BreadcrumbDTO
SEOPageContext
MediaVariantDTO
```

UI не знает:

```text
manifest internals
sha256
sourceRevision details
AgentExternalIdentity
consent evidence
source IDs
private geo/address
Hub credentials
```

## 10.5. DTO projection rule

```text
Hub public contract
→ SnapshotRepository
→ page-specific DTO
```

Page DTO может:

```text
combine relations
format labels
derive market
select media variant
reduce location precision further
build canonical URL
```

Page DTO не может:

```text
invent factual values
increase location precision
restore private data
change source media order when prohibited
invent agent contact
```

---

# 11. CANONICAL INVENTORY TAXONOMY

Lite принимает vocabulary из current Hub public contracts.

## 11.1. Property types

Canonical V1:

```text
APARTMENT
ROOM
HOUSE
HOUSE_PART
LAND
COTTAGE
TOWNHOUSE
GARAGE_BOX
```

Architecture-ready contract values may include:

```text
COMMERCIAL
NEW_BUILD_UNIT
OTHER
```

Rules:

```text
GARAGE_BOX is canonical
GARAGE is not a Lite forked alias
OTHER never means silent public activation
```

Новый/architecture-ready type:

```text
contract supports
+
project category status allows
+
route/DTO/UI capability exists
→ may become public
```

Иначе:

```text
data may exist
→ public route remains disabled/quarantined according to compatibility policy
```

## 11.2. Transaction types

Canonical:

```text
SALE
RENT_LONG
RENT_SHORT
UNKNOWN
```

Не использовать локальный upstream enum:

```text
SALE
RENT
```

как независимый Lite contract.

UI может объединять `RENT_LONG` и `RENT_SHORT` в общий presentation filter «Аренда», но data semantics сохраняются.

## 11.3. Deal kind

Canonical:

```text
SECONDARY_SALE
PRIMARY_SALE
ASSIGNMENT
UNKNOWN
```

`transactionType` и `dealKind` — разные измерения.

Пример:

```text
SALE + PRIMARY_SALE
```

не превращается в отдельный transaction type.

## 11.4. Lite-derived market

`market` — Lite SEO/navigation abstraction, а не обязательный независимый Hub source field.

Default derivation:

```text
dealKind == PRIMARY_SALE
OR dealKind == ASSIGNMENT
→ NEWBUILD
```

Если public inventory имеет confirmed `developmentUid`/Development relation и project policy считает такие listings новостройкой:

```text
confirmed development relation
→ NEWBUILD
```

Иначе:

```text
SALE inventory
→ SECONDARY
```

Для rental:

```text
market derivation is project-specific
→ do not force SECONDARY/NEWBUILD without project rule
```

Exact derivation table фиксируется в `DATA_CONTRACT.md`.

Никакая derivation не меняет upstream factual `transactionType/dealKind`.

## 11.5. Property facts

Typed facts names должны совпадать с Hub contract.

Examples:

```text
totalAreaM2
livingAreaM2
kitchenAreaM2
lotAreaM2
floorsTotal
buildingYear
ceilingHeightM
```

Не создавать альтернативное:

```text
plotAreaM2
```

если Hub contract использует `lotAreaM2`.

## 11.6. Money

Lite не вводит свой параллельный Money model.

```text
price/money representation
→ exact @ams/data-contracts MoneyValue
```

Preferred contract property:

```text
integer minor units where currency supports it
+
currency code
```

Но exact serialized field names берутся из фактической versioned schema.

AI запрещено одновременно поддерживать два равноправных representation (`priceMinor` и `price`) без compatibility adapter.

## 11.7. Sparse semantics

Отсутствие значения не равно:

```text
false
0
empty string
```

Lite сохраняет contract semantics `null/undefined/ABSENT`, не придумывает factual default.

## 11.8. Source raw values

Raw technical source values не обязаны и обычно не должны попадать в Lite snapshot.

Если field нужен только diagnostics/provenance:

```text
-X→ public DTO
-X→ metadata
-X→ analytics
```

---

# 12. AGENTS / TEAM

Agent является project-scoped entity.

Lite получает только public projection класса `AgentPublicV1`.

Public minimum:

```text
uid
slug
role
fullName
position?
bio?
specializations[]
photo?
explicitly-public work contacts
listingPresenceStatus?
```

Не допускаются в snapshot/UI:

```text
AgentExternalIdentity
source IDs
phoneNorm
emailNorm
consent evidence
audit/matching state
private contacts
```

Routes, если module активен:

```text
/komanda/
/komanda/{slug}/
```

или иной project-approved namespace.

## 12.1. Agent publication

Lite не решает legal publication basis.

Hub уже выполняет public projection gate.

Если Agent присутствует в public snapshot:

```text
Lite may render public fields
```

Если Agent relation скрыт/отсутствует:

```text
listing stays public
→ no personal agent block
→ ProjectPublicContact fallback
```

Lite не пытается получить агента по phone/name/source metadata.

## 12.2. ProjectPublicContact fallback

Canonical:

```text
snapshot project/contacts
→ ProjectContactDTO
→ listing CTA/contact
```

Fallback используется, если:

```text
listing.agentUid absent
OR agentUid does not resolve to public Agent
OR project surface intentionally uses agency contact
```

Hard UX invariant:

```text
publishable listing with contact-required flow
→ public agent OR ProjectPublicContact
```

Если оба отсутствуют:

```text
critical snapshot/project readiness issue
```

Не подставлять invented phone/email из config.

## 12.3. Agent inventory relation

Agent page может связывать active inventory по `agentUid`.

```text
agentUid
→ SnapshotRepository query
→ current public listings
```

Нельзя показывать неактуальные/hidden listings как active только ради наполнения страницы.

## 12.4. NO_ACTIVE_LISTINGS

`listingPresenceStatus=NO_ACTIVE_LISTINGS`:

```text
Agent page may remain 200
no redirect
show profile/contact
show explicit empty state
```

Default SEO treatment:

```text
200
noindex,follow
outside sitemap
```

пока нет активных объектов, если project SEO Registry не утвердил иной factual-content rule.

Текст empty state должен быть нейтральным, например:

```text
«Сейчас нет опубликованных объектов»
```

без выдуманной причины.

## 12.5. DEPARTED / redirect

Отсутствие active listings не означает departure.

Redirect к `/komanda/` или другому target выполняется только если Hub presentation lifecycle/URL state явно даёт:

```text
REDIRECTED
```

или другой project-approved lifecycle redirect.

## 12.6. Agent structured data

`Person` допустим только из public factual fields.

```text
worksFor → Organization
```

если relation фактически подтверждена public project data.

Не публиковать:

```text
private phone
internal IDs
consent metadata
source identity
```

---

# 13. SITE GRAMMAR — GEO-FIRST PLATFORM MODEL

REALTY_LITE использует масштабируемую geo-first URL model.

Главное ownership rule:

```text
Hub owns entity URL identity state.
Lite owns path grammar and final canonical path.
```

## 13.1. Canonical principles

```text
local catalogs = geo-first
global entities = stable, usually without geo in path
max canonical path depth for catalog grammar = 3 segments
one URL builder / parser
computed reserved namespaces
Hub canonicalPath is not authoritative
```

## 13.2. Canonical grammar

Baseline:

```text
/                                      # brand / agency home

/{geo}/                                # geo hub
/{geo}/{category}/                     # city/category catalog
/{geo}/{category}/{sub}/               # district | approved facet | metro-*
/{geo}/zastroyshchiki/                 # local developers hub

/{category}/                           # global category root
/novostroyki/zhk-{slug}/               # global development entity
/kvartiry/{semantic}-{publicUrlId}/    # apartment entity example
/doma/{semantic}-{publicUrlId}/        # house entity example
/uchastki/{semantic}-{publicUrlId}/    # land entity example
/zastroyshchiki/{slug}/                # developer entity

/komanda/
/komanda/{slug}/

/ipoteka/
/prodat/
/o-kompanii/
/kontakty/
/journal/**
/legal/**
```

Exact category slugs — project config.

## 13.3. Geo modes

```text
SINGLE_GEO
MULTI_GEO
```

Primary geo hub остаётся stable surface.

```text
/{primaryGeo}/
→ 200 registry outcome
```

в обоих режимах.

В `SINGLE_GEO` неактивный другой geo:

```text
/{otherGeo}/ → 404
```

Global entity из этого geo может оставаться public по entity policy.

## 13.4. Global entity stability

Entity URL не должен переезжать при:

```text
SINGLE_GEO → MULTI_GEO
новом городе
изменении feed title
изменении address wording
relink source identity
```

## 13.5. publicUrlId

`publicUrlId`:

```text
stable
opaque
public-safe
immutable after publication
never reused
independent from slug
```

Target REALTY_LITE 1.1.0 format:

```text
lowercase Base32 alphabet: a-z + 2-7
length: 5..8
regex: ^[a-z2-7]{5,8}$
```

No numeric DB sequence.

No semantic meaning.

Это требует одинаковой проверки в Hub public contract и Lite.

Если current project уже имеет опубликованный другой approved format:

```text
do not mutate published identities silently
→ project ADR
→ compatibility parser
→ migration proof
```

## 13.6. Canonical builder

Единственный owner путей:

```text
src/platform/grammar/
  buildUrl(pageKey/context)
  parseUrl(path)
  buildEntityUrl(entity)
  materializeSlugHistory(entity)
```

Hard property:

```text
parseUrl(buildUrl(k)) ≡ k
```

Canonical paths не собираются вручную в:

```text
UI
SEO metadata
sitemap
breadcrumbs
JSON-LD
analytics
lead messages
redirect targets
```

## 13.7. Hub URL identity state

Canonical target Hub state for dynamic entity:

```text
entityUid
publicUrlId
slug
slugHistory[]
lifecycle/presentation state
redirectTargetEntityUid?
```

Hub **не должен быть owner** готового path.

Если current Hub 3.1.2 snapshot ещё содержит:

```text
canonicalPath
```

Lite 1.1.0:

```text
may read for diagnostics/migration evidence
-X→ use as canonical source
-X→ block activation solely because it differs from new Lite grammar
```

Final canonical:

```text
entity identity state
+
Lite grammar
→ buildEntityUrl()
```

## 13.8. slugHistory materialization

Example:

```text
current slug = 2k-ulitsa-lenina
slugHistory = [kvartira-lenina, 2-komnaty-lenina]
publicUrlId = a7f3k
```

Lite materializes old entity paths using grammar version that owned the historical slug where known.

For same-grammar slug history:

```text
old path
→ 301
→ current buildEntityUrl(entity)
```

Rules:

```text
one-hop
no loop
no redirect chain
target normalized
target current canonical
```

Hub does not need to store every fully materialized path if history is reproducible from identity + grammar version.

If historical grammar changed materially, migration redirect belongs to Lite repository.

## 13.9. Grammar migration redirects

Stored in:

```text
src/project/redirects/
```

Use cases:

```text
old namespace → new namespace
old geo grammar → new grammar
legacy Tilda URL → canonical Lite URL
old project-specific route scheme → current scheme
```

These redirects are:

```text
Lite-owned
versioned in Git
one-hop 301
```

Do not place dynamic snapshot entity redirects in `next.config` because snapshot state changes without build.

## 13.10. Dynamic redirect execution

Canonical dynamic mechanism for current snapshot redirects:

```text
proxy.ts / equivalent request interception in supported Next runtime
→ reads in-memory/current redirect index
→ NextResponse.redirect(target, 301)
```

For `410 GONE`:

```text
route resolver / route handler
→ 410 response
```

Exact API name is Next-version-sensitive and must be verified against the selected release docs.

Hard semantic requirement is stable even if framework file naming changes:

```text
dynamic snapshot redirects resolved at runtime
static grammar migrations may be build-time config
```

## 13.11. Typed Site Grammar Config

Platform logic does not infer architecture from snapshot record counts.

```ts
type PublicationStatus =
  | "ACTIVE"
  | "NOINDEX_AUTO"
  | "PREPARED_OFF"
  | "OUT"

export const siteGrammar = {
  geoMode: "SINGLE_GEO" as "SINGLE_GEO" | "MULTI_GEO",
  primaryGeo: "<project-geo-slug>",

  categoryStatus: {
    // kvartiry: "ACTIVE",
  },

  marketCapability: {
    newbuild: "ACTIVE",
    secondary: "ACTIVE",
  },

  geoCategoryStatus: {
    // "<geo>": {
    //   kvartiry: "ACTIVE",
    // },
  },

  marketStatus: {
    // "<geo>": {
    //   newbuild: "ACTIVE",
    //   secondary: "ACTIVE",
    // },
  },

  entityPrefixes: {
    residentialComplex: "zhk-",
    cottageVillage: "kp-",
  },

  facetWhitelist: {},
  projectStaticSlugs: [],
}
```

Ownership:

```text
categoryStatus
→ global category capability

marketCapability
→ global entity market capability

geoCategoryStatus
→ local geo/category catalog activation

marketStatus
→ local geo market listing activation
```

Local catalog OFF must not automatically hide a valid global entity.

## 13.12. Computed reservedRoot

Reserved root namespaces computed:

```text
reservedRoot =
  platformReserved
  ∪ categorySlugs(all statuses)
  ∪ projectStaticSlugs
```

Baseline:

```text
api
admin
_next
media
robots.txt
sitemap*
search
poisk
legal
journal
```

Project may add:

```text
zastroyshchiki
ipoteka
prodat
o-kompanii
kontakty
komanda
```

A geo slug may never collide with `reservedRoot`.

## 13.13. Resolver precedence

For:

```text
/{x}/
```

Resolver:

```text
1. reservedRoot
2. published/registry-known geo according to geoMode
3. 404
```

For:

```text
/{geo}/{x}/
```

Resolver:

```text
1. geo resolves
2. x resolves as allowed geo category
3. x resolves as allowed geo developers namespace
4. 404
```

For:

```text
/{geo}/{category}/{x}/
```

Resolver:

```text
1. geo resolves
2. category passes global + geo status
3. x resolves as district
4. x resolves as approved facet
5. x resolves as other explicitly reserved third-segment grammar
6. 404
```

Arbitrary fourth catalog segment:

```text
→ 404
```

## 13.14. Namespace / collision guards

Merge/release-blocking checks:

```text
geo ↔ geo
geo ↔ reservedRoot
geo ↔ category
entity ↔ entity
publicUrlId duplicate
district ↔ district within geo
district ↔ facet within geo/category
developer ↔ reservedRoot
facet ↔ reserved sub
duplicate materialized canonical
path depth violation
redirect loop
redirect chain
```

Mechanical guards:

```text
no-literal-hrefs
platform-no-project-literals
registry-url
```

`registry-url` now proves:

```text
materialized route registry URL
===
buildUrl(registry pageKey/context)
```

It does **not** compare against Hub `canonicalPath`.

## 13.15. Trailing slash contract

Default:

```ts
trailingSlash: true
```

Canonical paths end with `/`.

Framework normalization:

```text
canonical without slash
→ 308 framework normalization
```

SEO/legacy redirect:

```text
legacy URL
→ 301 directly to normalized canonical target
```

Do not create:

```text
308 normalization
→ 301 migration
→ canonical
```

when a direct one-hop target can be emitted.

## 13.16. Snapshot URL validation order

After snapshot hard gates:

```text
1. publicUrlId format/uniqueness
2. slug syntax/uniqueness within identity scope
3. entity identity relation validity
4. build canonical through Lite grammar
5. materialize slugHistory
6. merge project grammar migrations
7. build redirect graph
8. detect loops/chains/collisions
9. apply quarantine/reject threshold
```

A stale legacy Hub `canonicalPath` alone is not a rejection reason.

---

# 14. PUBLICATION STATUS MODEL

Канонический enum:

```text
ACTIVE
NOINDEX_AUTO
PREPARED_OFF
OUT
```

## ACTIVE

Route существует; indexability решают SEO Registry + Content Gate + lifecycle.

## NOINDEX_AUTO

Route может существовать для UX/discovery, но:

```text
200
noindex,follow
self-canonical
outside sitemap
not primary navigation unless project explicitly allows
```

## PREPARED_OFF

```text
data contract supported
UI may have reusable capability
public route disabled
404
not in sitemap
not in navigation
```

## OUT

Scope отсутствует в продукте.

Наличие records в snapshot не меняет статус.

---

# 15. SEO OWNERSHIP / SEO REGISTRY

SEO полностью принадлежит Lite.

Hub не решает:

```text
index/noindex
canonical
metadata templates
sitemap inclusion
filter indexation
page intent
internal linking
robots
structured data
```

## 15.1. SEO Registry

Project обязан иметь code/file-owned typed registry.

Recommended source form:

```text
docs/seo/SEO_REGISTRY_SEED.csv
+
src/project/seo.config.ts
```

Registry row minimum:

```text
pageKey
urlPattern / entity class
targetIntent
tier?
minInventory?
status
robotsDefault
metadataTemplateKey
contentGateRule
release
```

Нельзя создавать SEO URL только потому, что filter технически существует.

## 15.2. Intent ownership

Каждый indexable page class имеет один owner intent.

Duplicate-intent pages запрещены.

Semantic collisions фиксируются явно.

## 15.3. Metadata

Каждая public page при применимости:

```text
title
description
canonical
Open Graph
one logical H1
heading hierarchy
meaningful alt
structured data
sitemap/robots decision
```

Dynamic values используются только если factual and fresh.

## 15.4. Morphology

Русские падежи City/District не вычисляются эвристикой в template logic.

Canonical ownership:

```text
Hub Shared Geo
→ owner-approved morphology facts

Lite project config
→ optional explicit override
```

Fields:

```text
name
nameGenitive
nameLocative
preposition
```

District additionally may expose:

```text
type = admin_district | microdistrict | other approved enum
synonyms[]
agglomerationOf?
```

Rules:

```text
template code never auto-declines Russian names
project override must be explicit and typed
agglomeration relation must not create cycles
```

Если required grammatical form отсутствует:

```text
do not guess
→ use safe wording that avoids inflection
OR mark content template incomplete
```

## 15.5. Variable commercial claims provenance

Claims вида:

```text
«10 лет на рынке»
«309 отзывов»
«12 банков-партнёров»
«ставка от X%»
«N объектов»
```

не должны быть literals без provenance.

Typed claim minimum:

```text
key
value
source
checkedAt
expiresAt?
```

Publication:

```text
valid source
+
checkedAt present
+
fresh according to project rule
→ render
```

Иначе блок скрывается или использует статичную формулировку без variable claim.

Нельзя автоматически подменять устаревшее число новым через AI/runtime inference.

---

# 16. CONTENT GATE

SEO page не становится indexable только потому, что route существует.

Final decision:

```text
route status
×
SEO registry
×
current snapshot facts
×
inventory threshold
×
content completeness
×
lifecycle
×
project indexing mode
→ indexability
```

## 16.1. Gate classes

Минимально:

```text
GEO_HUB
CATEGORY_GEO
DISTRICT
FACET
DEVELOPMENT
DEVELOPER
PROPERTY
AGENT
JOURNAL_ARTICLE
JOURNAL_CATEGORY
STATIC_COMMERCIAL
```

## 16.2. Numeric thresholds

Market-dependent numbers не являются universal Lite constants.

Они живут в project config / SEO Registry.

```text
Platform owns mechanism.
Project owns effective thresholds.
```

## 16.3. Valid thin page

Если route `ACTIVE`, но Gate не проходит:

```text
200
noindex,follow
self-canonical
outside sitemap
```

Не использовать fake `404` только из-за временного падения inventory.

## 16.4. Property factual gate

Property/detail Gate может требовать project-configured набор factual fields:

```text
price
area
location
photos
descriptionText
```

Exact criteria фиксируются project SEO/data contract.

HTML presence не считается самостоятельным доказательством контента; description completeness считается по safe/plain factual projection.

## 16.5. Development / ЖК Content Gate

Для `DEVELOPMENT` Lite считает Gate самостоятельно.

Hub public Development contract должен предоставлять факты, достаточные для Gate, когда такие факты доступны:

```text
salesStatus
completionStatus
class?
deadline?
priceByRooms[]
  roomType
  price
  priceCheckedAt
media counts / typed media
layout count
constructionProgress[]
  capturedAt
  media/reference
sourceUpdatedAt / updatedAt
```

Exact serialized schema берётся из Hub contracts.

Lite может дополнительно использовать repository long-form content:

```text
content/developments/<developmentUid>.md
```

Gate может включать:

```text
minimum factual completeness
minimum media
layout presence
current sales status
price freshness
construction progress freshness
long-form content length
content provenance
```

Thresholds определяет project config.

## 16.6. Price freshness mechanism

Platform mechanism Lite поддерживает age-based policy.

Default recommended project policy profile:

```text
PRICE_HIDE_AFTER_DAYS = 45
PRICE_GATE_FAIL_AFTER_DAYS = 120
```

Семантика:

```text
price age <= hide threshold
→ price may render if otherwise valid
→ AggregateOffer may render if factual rules pass

price age > hide threshold
→ hide public price / AggregateOffer
→ page may remain indexable if other Gate rules pass

price age > gate-fail threshold
→ Development price-dependent Gate FAIL
```

Числа не являются вечными universal constants: project может override.

Нельзя проставлять `priceCheckedAt = snapshot.publishedAt`, если фактическая цена не проверялась в этот момент.

## 16.7. New-build unit default

Если public Property относится к новостройке:

```text
derived market = NEWBUILD
```

platform default:

```text
property detail
→ 200
→ noindex,follow
→ self-canonical
→ outside sitemap
```

Owner SEO intent по умолчанию:

```text
Development / ЖК page
```

Project может изменить правило только explicit ADR/SEO Registry decision.

Это предотвращает каннибализацию intent между тысячами unit pages и страницей ЖК.

## 16.8. Long-form Development content gate

Recommended file:

```text
content/developments/<developmentUid>.md
```

Frontmatter minimum:

```yaml
developmentUid: "..."
title: "..."
source: "..."
checkedAt: "YYYY-MM-DD"
draft: false
```

Optional:

```yaml
updatedAt: "..."
reviewBy: "..."
```

Gate может требовать:

```text
body substantive
length >= project threshold
source present
checkedAt present
fresh enough according to project policy
```

Validation:

```text
uid exists in current snapshot
OR content explicitly marked archived
```

Если current Hub недоступен во время local/exit build:

```text
do not fail build solely because live Hub cannot be queried
```

Use current local dataset / Exit Bundle.

Unknown/stale uid:

```text
warning by default
```

unless project release policy explicitly makes it blocking.

---

# 17. FILTERS / PAGINATION / SEARCH

## 17.1. Query filters

Default:

```text
?priceFrom=
?priceTo=
?rooms=
?district=
?sort=
?view=
?page=
?query=
```

Нестабильные/комбинаторные filter URLs:

```text
noindex,follow
```

Canonical — согласно project policy.

## 17.2. Approved path facets

Только typed whitelist может превращать один filter intent в path:

```text
/{geo}/{category}/{approvedFacet}/
```

Комбинации:

```text
district × facet
facet × facet
arbitrary N filters
```

не создают canonical path.

## 17.3. Pagination

Page 2+ должна быть crawlable через server-rendered `<a href>`.

Default:

```text
?page=2+
→ noindex,follow
→ self-canonical
```

Не canonical page 2 → page 1.

## 17.4. Search

Baseline search работает по local snapshot indexes.

```text
normalized text index
→ bounded in-memory search
```

Meilisearch/Elasticsearch не добавляется без measured trigger.

---

# 18. SITEMAPS / ROBOTS / STRUCTURED DATA / INDEXNOW

## 18.1. Logical sitemaps

Пример:

```text
static
geo-hubs
category-geo
developments
developers
properties
agents
journal
```

Не обязательно физически делить каждый класс, если объём мал; logical ownership обязателен.

## 18.2. Sitemap inclusion

```text
canonical
AND route resolves 200
AND project indexing public
AND status permits
AND Gate/indexing permits
AND lifecycle permits
→ sitemap
```

Все URL строятся через `buildUrl`.

## 18.3. lastmod

`lastmod` — factual change time сущности/content, а не время генерации sitemap/snapshot.

Use, в порядке доступности и semantics:

```text
entity sourceUpdatedAt / updatedAt
content updatedAt
meaningful project editorial updatedAt
```

Нельзя:

```text
snapshot.publishedAt
→ автоматически lastmod для всех URL
```

если сущность фактически не менялась.

## 18.4. Sitemap sharding

При росте:

```text
> 45,000 URLs per physical sitemap
→ shard
→ sitemap index
```

45k — operational safety margin ниже protocol maximum.

Shard logic deterministic.

## 18.5. Robots

Project-level indexing mode:

```text
INDEXING_MODE=private | staging | public
```

`staging/private` не допускают accidental indexing.

## 18.6. Structured Data

Допустимые типы — только там, где фактически применимы:

```text
RealEstateAgent
BreadcrumbList
Offer
Apartment / Residence-like factual types where schema.org semantics fit
Person
Article / BlogPosting
FAQPage
AggregateOffer only from fresh verified facts
```

Запрещено:

```text
fake rating
fake review count
synthetic availability
synthetic lastmod/dateModified
unverified "официальный сайт"
stale price in AggregateOffer
```

## 18.7. IndexNow — optional module

IndexNow для Яндекса/совместимых engines — optional low-cost module.

Trigger:

```text
successful snapshot activation
OR project content deploy
```

Process:

```text
previous indexable canonical set
vs
current indexable canonical set
→ diff new / meaningfully changed / removed
→ URLs built only via buildUrl
→ bounded batch
→ retry-safe submission
```

Only URLs that:

```text
pass Content Gate
AND are canonical
AND INDEXING_MODE=public
```

may be submitted as active URLs.

Removed/redirected URL handling follows search-engine protocol/project policy.

Disabled when:

```text
INDEXING_MODE=private
INDEXING_MODE=staging
```

IndexNow failure:

```text
-X→ block snapshot activation
→ operational warning/retry
```

---

# 19. ENTITY LIFECYCLE / REDIRECTS

Hub предоставляет factual lifecycle + project presentation/identity state.

Lite применяет final HTTP/SEO policy.

Нужно различать два слоя.

## 19.1. Factual lifecycle

Hub domain may expose:

```text
ACTIVE
INACTIVE
ARCHIVED
DEPARTED
```

Эти значения описывают state сущности/человека и **не являются напрямую HTTP status**.

## 19.2. Presentation lifecycle

Public execution state:

```text
VISIBLE
ARCHIVED_VISIBLE
REDIRECTED
GONE
```

Именно presentation state используется Lite для HTTP behavior.

### VISIBLE

```text
200
normal project SEO policy
```

### ARCHIVED_VISIBLE

Обычно:

```text
200
«не актуально»
noindex,follow
outside sitemap
alternatives
```

### REDIRECTED

```text
301 → exact relevant canonical target
```

Target:

```text
redirectTargetEntityUid
→ resolve entity
→ buildUrl(target)
```

или explicit safe project redirect target.

### GONE

```text
410
```

Нерелевантный bulk redirect на homepage запрещён.

## 19.3. PublicationStatus ≠ lifecycle

Не путать:

```text
PublicationStatus.ACTIVE
```

с:

```text
factual lifecycle ACTIVE
```

и с:

```text
presentation lifecycle VISIBLE
```

Это три разные модели.

## 19.4. Agent exception

`NO_ACTIVE_LISTINGS`:

```text
-X→ DEPARTED
-X→ REDIRECTED
```

Agent remains `VISIBLE`/200 until explicit lifecycle says otherwise.

## 19.5. Redirect graph

```text
no loop
no avoidable chain
normalized canonical target
one-hop preferred
```

Sources:

```text
entity slugHistory
Hub entity redirect relation
Lite project grammar migrations
```

All merge into one resolved runtime redirect index.

## 19.6. Redirect execution

Dynamic snapshot-driven redirect:

```text
runtime proxy/resolver
→ 301
```

Static grammar migration:

```text
project redirects config / framework build config
→ 301
```

Slash normalization:

```text
framework
→ 308
```

`410` emitted by route resolver/handler.

## 19.7. Priority

When rules collide:

```text
security/reserved route
→ explicit project grammar migration
→ entity lifecycle redirect
→ slugHistory redirect
→ canonical route
```

Exact priority map documented in `URL_GRAMMAR.md` and tested.

---

# 20. JOURNAL / BLOG — CANONICAL LITE MODULE

Для типового блога на 30–40 статей БД/CMS не используется.

Канонический подход:

```text
repository Markdown
→ frontmatter Zod validation
→ build-time content index
→ static/server-rendered journal pages
```

## 20.1. Default content format

Default:

```text
Markdown (.md)
```

MDX допускается только если реальная статья требует approved interactive/custom components.

Universal block-builder запрещён.

## 20.2. Repository structure

```text
content/
  journal/
    2026-09-example-slug.md
    ...

src/project/content/
  journal.config.ts
```

## 20.3. Frontmatter contract

Минимум:

```yaml
title: "..."
description: "..."
slug: "..."
publishedAt: "2026-09-20"
updatedAt: "2026-09-25"
category: "..."
tags: ["..."]
cover: "/..."
authorKey: "..."
draft: false
```

Опционально:

```yaml
seoTitle: "..."
ogImage: "/..."
related: ["slug-a", "slug-b"]
```

`canonical` не задаётся произвольно в article frontmatter. Canonical управляется grammar/redirect contract.

## 20.4. Validation

Build/verify блокируется при:

```text
duplicate slug
missing title/description/date/category
invalid date
invalid referenced cover
unknown category
draft leak in production index
broken explicit related slug
published article route collision
```

## 20.5. Routes

Canonical baseline:

```text
/journal/
/journal/category/{slug}/
/journal/{slug}/
```

Tags по умолчанию — UI/filter metadata, а не SEO routes.

## 20.6. Journal hub

Функции:

```text
latest articles
category filters
server-rendered pagination
featured articles optional
commercial contextual blocks
search optional
```

## 20.7. Article page

Минимум:

```text
H1
publishedAt
updatedAt if changed
category
cover
article body
Table of Contents optional
related articles
contextual commercial CTA
breadcrumbs
share controls optional
```

## 20.8. Related articles

```text
explicit related[]
→ same category/tags fallback
→ newest relevant
```

Без AI runtime dependency.

## 20.9. Journal → entity links by UID

Для устойчивых ссылок на dynamic entities Markdown может использовать bounded syntax:

```text
[[development:<uid>]]
[[property:<uid>]]
[[agent:<uid>]]
```

Renderer:

```text
parse approved token
→ resolve uid through current SnapshotRepository
→ buildUrl(entity)
→ render normal <a>
```

Если entity не найдена:

```text
render human-readable text without link
→ operational warning
-X→ break public page
-X→ require live Hub during build
```

Link label may be:

```text
entity factual name/title
or explicit safe label syntax defined in CONTENT.md
```

Arbitrary executable MDX/JS for entity resolution запрещён.

## 20.10. Journal SEO

Article candidate index only if:

```text
draft=false
publishedAt <= now
required metadata valid
body non-empty/substantive
route canonical
project indexing public
```

Structured Data:

```text
Article or BlogPosting
BreadcrumbList
```

Author публикуется только если factual.

## 20.11. Journal sitemap

Только published/non-draft canonical articles.

`lastmod` = factual `updatedAt`, если реально менялось содержание.

## 20.12. RSS

RSS — optional low-cost module.

Если включён:

```text
/journal/rss.xml
```

строится из validated content index.

## 20.13. Publication workflow

```text
new article
→ Markdown file
→ validation
→ PR
→ preview
→ merge
→ deploy
```

Для 30–40 статей это canonical workflow.

Если клиенту нужен самостоятельный editorial Admin — trigger для FULL или отдельного content service.

---

# 21. STATIC EDITORIAL / COMMERCIAL CONTENT

Static content принадлежит repository.

Типично:

```text
/
/o-kompanii/
/uslugi/... if approved
/ipoteka/
/prodat/
/kontakty/
/legal/**
```

Page composition живёт в code.

Тексты могут жить в:

```text
src/project/content/*.ts
content/*.md
content/developments/*.md
```

в зависимости от nature страницы.

Правило:

```text
commercial composition → code-first
long-form text/legal → Markdown allowed
Development long-form SEO → content/developments/<developmentUid>.md by default
```

Universal page builder не создаётся.

## 21.1. Typed commercial claims

Переменные маркетинговые claims хранятся typed:

```text
value
source
checkedAt
expiry/freshness rule
```

Если provenance/freshness отсутствуют:

```text
claim hidden
OR rewritten to timeless factual wording
```

Нельзя оставлять числа/ставки/счётчики как бессрочные literals.

## 21.2. Development content ownership

```text
Development facts → Hub
short dynamic presentation → Hub project scope
long-form SEO/commercial narrative → Lite repository
```

Один authoritative long-form source per Development.

---

# 22. PROJECT EDITORIAL FROM HUB

Dynamic entity editorial может приходить из Hub project scope:

```text
shortDescription
descriptionText
descriptionHtmlSafe
FAQ
presentation notes
media ordering state where allowed
agent bio
```

Это не даёт Hub ownership над SEO.

Final page metadata/indexability всегда рассчитывает Lite.

## 22.1. Description safety

Lite может рендерить:

```text
descriptionText
```

как plain text.

HTML допускается только:

```text
descriptionHtmlSafe
```

и только через fixed safe renderer/approved sanitized HTML path.

Allowed semantic tag baseline:

```text
p
br
ul
ol
li
strong
em
```

Lite не должен принимать произвольный source HTML и не должен расширять allowlist на event/style/script/iframe/link attributes без отдельного security review.

Нельзя использовать `dangerouslySetInnerHTML` на произвольной строке.

Если implementation технически использует HTML injection API для уже sanitised `descriptionHtmlSafe`, boundary должен быть encapsulated в одном audited renderer component.

## 22.2. Content Gate source

`description non-empty` для Gate:

```text
descriptionText
```

а не raw HTML length.

## 22.3. Missing editorial

Если Hub editorial отсутствует:

```text
Lite does not invent text
Lite does not runtime-generate factual copy with AI
```

Page may remain thin/noindex according to Content Gate.

---

# 23. MEDIA CONTRACT

## 23.1. Source

Snapshot public DTO предоставляет approved media references.

Normal mode:

```text
Hub media mirror
→ validated bytes
→ Hub-generated responsive variants
→ configured media origin
→ Lite MediaDTO
```

Lite не зависит от producer CDN.

## 23.2. Responsive variants

Target Hub/Lite contract:

```text
MediaAsset
  original metadata
  variants[]
    width
    height?
    format
    url
    bytes?
```

Recommended baseline generation:

```text
widths: 480 / 960 / 1600
formats: WebP + AVIF where operationally supported
fallback: JPEG or source-compatible approved raster
```

Точный набор может меняться contract-minor/project policy.

Lite не должен предполагать, что оригинал — единственный usable asset.

## 23.3. Lite image delivery

Default:

```text
next/image
+
custom loader
→ chooses already prepared Hub variant/origin URL
```

Goal:

```text
no server-side remote Image Optimization workload on Lite VPS
```

Default config:

```text
images.loader = custom
```

or equivalent supported configuration in selected Next version.

`remotePatterns` не нужны для Hub variant delivery, если custom loader path не вызывает built-in optimizer.

Если built-in Image Optimization специально включается:

```text
ADR required
exact MEDIA_ORIGIN only
no wildcard
patched Next.js >= security floor
SSRF regression test
```

## 23.4. Host policy

Media origins:

```text
explicit allowlist
no wildcard remote hosts
```

Lite components не hardcode AMS S3 hostname.

## 23.5. Order contract

If:

```text
isImageOrderChangeAllowed = false
```

then:

```text
Lite renders feed-origin media in snapshot order
-X→ local resort
-X→ "best photo" heuristic
-X→ random shuffle
```

Manual project-owned media may have explicit separate order if contract allows, but must not silently reorder protected feed-origin sequence.

## 23.6. UI requirements

```text
stable aspect ratio
responsive sizes
missing-image fallback
lazy below critical area
intentional LCP media
meaningful alt where factual
```

Do not eager-load entire gallery.

## 23.7. Exit portability

До handoff:

```text
media copied to client-controlled storage
or transferred as project assets
```

Exit Bundle media manifest rewrites to client-controlled origin.

Custom loader/media resolver must support origin replacement via config, not component rewrite.

---

# 24. FORMS / LEADS

Data Hub не является Lead Hub.

Lite использует `LeadSink` abstraction.

## 24.1. Modes

```text
LEADS_MODE=direct
LEADS_MODE=dual
LEADS_MODE=hub
```

`hub` здесь означает отдельный lead service, не AMS Data Hub factual platform.

## 24.2. Handoff invariant

После client exit:

```text
LEADS_MODE=direct
```

работает без AMS-owned lead endpoint.

## 24.3. Direct mode baseline

```text
LeadForm
→ server validation
→ anti-spam
→ consent gate
→ LeadSink
→ client CRM / email / webhook / messenger adapter
```

Сайт без БД не имеет права притворяться, что гарантирует durable queue.

Если ни один direct destination не подтвердил приём:

```text
form must not silently report guaranteed delivery
```

UX показывает controlled retry/error state.

Если бизнес требует guaranteed durable async outbox при outage:

```text
external durable Lead Hub/service
OR REALTY_FULL/backend profile
```

Не добавлять локальную БД в Lite скрытно.

## 24.4. LeadSubmission context

```text
pageKey
entityRef?
publicUrlId?
developmentUid?
agentUid?
sourceSurface?
```

Только public-safe references.

## 24.5. Security

```text
server validation
rate limit
honeypot/captcha by trigger
consent
PII redaction
host allowlist
secrets server-only
```

PII не передаётся в analytics.

## 24.6. Personal-data destination decision

До production forms каждый project обязан зафиксировать:

```text
operator/client
legal basis/consent model
destination systems
processing geography where relevant
retention policy
deletion procedure
processor responsibilities
```

Technical default для российских проектов, пока owner/legal не утвердили другое:

```text
direct destination
→ client-controlled Russian CRM/email/service where feasible
```

Messenger/external CRM integration не считается автоматически безопасной или соответствующей требованиям только потому, что технически работает.

Если integration может создавать cross-border/personal-data transfer concern:

```text
REQUIRES CHECK
→ client/operator + legal/security decision before production
```

Конституция не определяет юридическую квалификацию конкретного сервиса.

## 24.7. Cookie/analytics separation

Lead submission не зависит от analytics consent.

```text
analytics rejected
→ form still works
```

Form fields never become analytics dimensions.

---

# 25. FAVORITES / COMPARISON

Допустимы без DB/Auth:

```text
localStorage
URL state
```

Нет:

```text
server writes
cross-device sync
user account
```

Это остаётся REALTY_LITE.

Public data для сохранённых IDs разрешается только через normal repository/DTO lookup.

---

# 26. MAPS

Map является enhancement, не data source.

```text
server page
→ bounded MapMarkerDTO
→ lazy client map leaf
```

Карта не является единственным способом открыть объекты.

Indexable entities должны иметь crawlable HTML links вне map-only UI.

Большой marker workload — trigger для optimization proof, но не для БД автоматически.

---

# 27. CACHE / FRESHNESS

REALTY_LITE избегает сложной cache invalidation topology.

## 27.1. Snapshot-aware repository

Primary freshness mechanism:

```text
publishSequence changes
→ CURRENT changes
→ repository loads new immutable revision
```

## 27.2. Static surfaces

Допускается build-time/static rendering для:

```text
static commercial pages
legal pages
journal articles/categories where appropriate
static assets
```

при условии, что они не зависят от current inventory state.

## 27.3. Dynamic data surfaces

Default dynamic server render:

```text
geo hubs with inventory-dependent facts
catalogs
property/entity pages
development pages with current price/inventory facts
agent pages with current listings
sitemap.xml
robots when environment/current state affects output
```

Source:

```text
in-memory SnapshotRepository
```

## 27.4. ISR / SSG / use cache policy

Для inventory-dependent surfaces:

```text
ISR
SSG from inventory snapshot at build time
'use cache'
Cache Components for current factual entity output
```

по умолчанию **запрещены**.

Exception:

```text
explicit ADR
+
freshness SLA
+
cache-key isolation proof
+
snapshot activation visibility proof
+
security review against current Next advisories
```

Reason:

```text
snapshot is already a local fast data source
publishSequence already solves freshness
extra server cache creates invalidation complexity
```

## 27.5. Client/router caches

Normal framework/client navigation caching may exist, but must not cause indefinite stale factual data.

Project tests must prove a fresh navigation/new request after activation observes new sequence within declared UX SLA.

## 27.6. Nginx cache

HTML proxy cache is OFF by default.

Optional bounded anonymous GET cache may be enabled after proof.

Example target:

```text
TTL <= 60s
```

but exact TTL is project config.

Proof:

```text
snapshot N activated
→ external response changes within TTL/SLA
```

Never cache:

```text
lead POST
internal snapshot trigger
health mutable state where misleading
responses with user-specific data
```

## 27.7. Sitemap/robots freshness

`sitemap.xml`:

```text
generated from current repository state
```

`robots`:

```text
generated from current INDEXING_MODE/config
```

They must not remain stale indefinitely after deploy/state change.

---

# 28. PERFORMANCE

UI Core baseline:

```text
mobile LCP <= 2.5s
CLS <= 0.1
```

Дополнительно проверять:

```text
server render latency representative catalog
snapshot load/reload time
index-build time
filter response
catalog JS size
map lazy loading
gallery loading
article page JS size
image payload/variant selection
font weights
memory peak during revision switch
```

Не eager-load:

```text
all gallery media
all map code
all filters as client app
all snapshot data to browser
```

Browser получает только DTO, нужный текущей странице/interaction.

## 28.1. Representative data proof

Starter baseline fixture:

```text
5,000 inventory entities
100 developments
representative agents
representative media references
multi-geo indexes
```

Measure:

```text
web container idle heap
current revision loaded heap
current + next transition peak
heap after old revision release
load/index-build duration
catalog query p50/p95 in local proof where tooling allows
HTML response size
client JS per representative route
```

Exact thresholds depend on VPS/container budget.

## 28.2. Memory invariant

Runtime keeps:

```text
current revision
+
at most one previous/in-flight revision
```

After switch settles:

```text
previous released
```

Memory leak across many publishSequence changes is release-blocking.

## 28.3. Image performance

Use Hub-prepared variants.

Lite selects variant based on rendered size/DPR policy.

Avoid:

```text
VPS CPU image transcoding
full-original download for card thumbnails
wildcard remote optimizer
```

LCP image can be prioritized intentionally; below-fold gallery remains lazy.

## 28.4. Performance trigger

If 5k representative dataset is healthy but real project grows to tens of thousands and exceeds budget:

```text
measure first
→ optimize indexes/serialization
→ consider sharding/search only after evidence
```

DB/search engine is not automatic.

---

# 29. SECURITY

## 29.1. Attack surface reduction

Отсутствие DB/Admin/Auth является преимуществом Lite.

Default public server routes минимальны:

```text
site pages
lead endpoint
internal snapshot trigger endpoint
health endpoint
```

## 29.2. Security floor

At release of Standard 1.1.0:

```text
Next.js 16.3 line → minimum 16.3.8
Node.js → supported LTS; baseline 24 LTS
React/RSC packages → no known affected versions in resolved lockfile
```

Next 16.3.8 minimum основан на official 2026-09-30 security release.

AI must not keep an older pin merely because it exists in an old project plan.

## 29.3. Internal snapshot endpoint

Обязательно:

```text
POST only
HMAC/timestamp or equivalent authenticated trigger
replay window
rate limit
projectId validation
no dataset in request body
no arbitrary URL input
lightweight wake/signal only by default
```

## 29.4. Snapshot remote fetch

```text
fixed/approved origin
HTTPS
project-scoped credentials
private-address protection if configurable
redirect re-check
timeouts
max bytes
content type checks
```

## 29.5. Signature trust

```text
manifest.keyId
→ trusted public key
→ revoked check
→ Ed25519 verify
```

Unknown/revoked:

```text
reject
keep last-good
```

## 29.6. Image security

Default architecture avoids remote Next optimizer.

```text
Hub generates variants
→ Lite custom loader
→ direct approved media origin
```

If built-in optimizer enabled:

```text
exact origin allowlist
no wildcard
patched Next
SSRF test
ADR
```

## 29.7. Rendering/cache security

Inventory-dependent routes:

```text
dynamic render from local repository
no ISR/SSG/use cache by default
```

Any cache adoption requires current-framework security review.

## 29.8. Safe HTML

Raw HTML is forbidden.

Only:

```text
descriptionHtmlSafe
```

from public contract may enter audited renderer.

Allowed tags are fixed/bounded.

No arbitrary attributes/scripts/styles/iframes.

## 29.9. Location privacy

Lite never:

```text
receives apartmentNumberPrivate by contract
geocodes addressPublic to increase precision
reverse-engineers hidden exact coordinate
combines historic generalized coordinates to infer exact point
```

May only reduce precision.

## 29.10. Secrets

Semantic env examples:

```text
AMS_PROFILE=REALTY_LITE
PROJECT_ID
PUBLIC_SITE_URL
DATA_MODE
INDEXING_MODE
SUPPORTED_SNAPSHOT_MAJOR
SNAPSHOT_MANIFEST_URL
SNAPSHOT_TRUST_SET
SNAPSHOT_CREDENTIAL_REF
SNAPSHOT_POLL_SECRET
SNAPSHOT_WEBHOOK_SECRET
MEDIA_ORIGIN
LEADS_MODE
LEAD_*
ANALYTICS_*
TZ
```

Exact names may preserve starter equivalents.

No private signing key belongs in Lite.

## 29.11. Logs

Не логируются:

```text
snapshot credentials
private/signing material
lead body
phone/email/message
cookies
auth headers
secret URLs/tokens
private address/source payloads
```

Safe diagnostics:

```text
projectId
publishSequence
schemaMajor/minor
keyId
file kind
safe error code
hash mismatch yes/no
quarantine counts/reason codes
```

## 29.12. Nginx security baseline

```text
TLS
HTTP/2
request/body limits
security headers per project/browser policy
rate limit public lead endpoint
rate limit internal snapshot endpoint
static immutable caching
compressed HTML/JSON where safe
```

---

# 30. INDEXING ENVIRONMENT SAFETY

Staging/preview не должен индексироваться.

```text
INDEXING_MODE=staging
→ noindex
→ robots disallow policy as appropriate
→ sitemap public publication disabled
```

Production indexing требует explicit owner config:

```text
INDEXING_MODE=public
```

Deploy сам по себе не должен случайно включать индексацию.

---

# 31. PROJECT PORTABILITY / EXIT MODE

Portability — hard feature, не documentation promise.

## 31.1. Runtime independence

Hub недоступен:

```text
current last-good site works
```

## 31.2. Vendor independence

После прекращения AMS:

```text
repository
+
ProjectExitBundleV1
+
media copy
+
client lead config
→ site builds and runs
```

## 31.3. DATA_MODE

```text
DATA_MODE=hub
```

Normal operation:

```text
remote snapshot sync enabled
webhook/poll enabled
ACK enabled
```

```text
DATA_MODE=local
```

Handoff:

```text
remote Hub sync disabled
Hub webhook disabled
Hub ACK disabled
AMS S3 credentials absent
local dataset is authoritative input
```

## 31.4. Local mode must preserve

```text
build
start
catalog
entity pages
agents
URLs
redirects
lifecycle
journal
static content
forms via direct LeadSink
```

## 31.5. Build independence proof

```text
clean machine/container
+ repository
+ Exit Bundle
+ no AMS credentials
→ pnpm install --frozen-lockfile
→ build
→ production start
→ public smoke
```

## 31.6. Contract vendoring

Snapshot Zod schemas required to build/run handed-off site must be:

```text
vendored immutable source
or
transferable package artifact
```

Private non-transferable AMS package cannot be mandatory.

---

# 32. LOCAL DEVELOPMENT / FIXTURES

Developer must be able to run project without production Hub.

Repository contains sanitized fixture datasets:

```text
data/fixtures/minimal/
data/fixtures/representative/
data/fixtures/lifecycle/
data/fixtures/multi-geo/
```

Fixtures не содержат private client data/PII.

Required profiles:

```text
fixture-single-geo
fixture-multi-geo
fixture-secondary-first
fixture-newbuild-first
fixture-mixed-inventory
fixture-agents
fixture-archived
```

Bastion-like mixed source should be representable after normalization, but fixture does not copy private/raw feed blindly.

---

# 33. UI CORE APPLICATION

AMS UI Core v5.0 применяется без ослабления.

## 33.1. Layering

```text
SHADCN PRIMITIVES
→ LAYOUT
→ SHARED
→ DOMAIN
→ PAGE-SPECIFIC
→ PAGE COMPOSITION
```

## 33.2. Design values

`src/app/globals.css` — single source of truth values.

## 33.3. Containers

```text
narrow → articles/legal/focused text
site   → normal commercial pages
wide   → catalog/map/gallery only when needed
```

## 33.4. Journal profile

Journal расширяет основной Design System.

Он не получает отдельную typography/UI ecosystem.

Article body использует `narrow` container и approved long-form roles.

## 33.5. Server/client

```text
SERVER SECTION
└── CLIENT INTERACTIVE LEAF
```

---

# 34. ANALYTICS

Analytics contract project-owned.

Default provider for Russian Realty Lite projects:

```text
Yandex Metrica
```

но provider remains replaceable.

## 34.1. Consent modes

Baseline:

```text
necessary only
all allowed analytics
```

Analytics scripts that require consent:

```text
load only after consent
```

Consent state is stored with minimal non-PII implementation appropriate to project.

Lead forms must work regardless of analytics consent.

## 34.2. Webvisor / session replay

На страницах/состояниях с personal-data forms:

```text
Webvisor/session replay OFF by default
```

Alternative only after explicit privacy configuration:

```text
field masking proven
PII masking tested
legal/project decision recorded
```

No raw form payload may reach analytics.

## 34.3. Default dimensions without PII

```text
page_key
geo_slug
category
market
entity_type
source_surface
publish_sequence?  # operational dimension if useful and bounded
```

Events examples:

```text
catalog_view
filter_apply
map_open
entity_open
agent_open
journal_open
journal_to_commercial
lead_open
lead_submit
phone_click
messenger_click
```

Never:

```text
phone
email
message
client name
raw form payload
private address
agent matching data
```

## 34.4. Cookie banner text

Exact legal/banner wording is project/legal content, not platform hardcode.

Platform owns:

```text
consent mechanism
script gating
preference persistence
withdraw/change mechanism where implemented
```

Project owns:

```text
text
provider list
purposes
policy links
```

---

# 35. DOCUMENTATION CONTRACT

Обязательны:

```text
docs/PROJECT.md
docs/ARCHITECTURE.md
docs/DATA_CONTRACT.md
docs/URL_GRAMMAR.md
docs/SEO.md
docs/CONTENT.md
docs/DESIGN.md
docs/OPERATIONS.md
docs/HANDOFF.md
docs/SECURITY.md
```

Если starter уже имеет canonical equivalents:

```text
do not create duplicate sources of truth
→ synchronize existing docs
```

## 35.1. PROJECT.md

Минимум:

```text
client/domain
AMS_PROFILE=REALTY_LITE
projectId
primary locale/currency
geoMode
primaryGeo
category statuses
market statuses
Snapshot Contract major/minor
DATA_MODE
LEADS_MODE
INDEXING_MODE
media origins
analytics provider
production topology
SourceCraft repository
memory budget
publicUrlId format/legacy mode
```

## 35.2. DATA_CONTRACT.md

```text
Hub contract package/version
snapshot datasets used
schema major/minor support
propertyType/transactionType/dealKind usage
MoneyValue exact serialized shape
market derivation
DTO mapping
required references
ProjectPublicContact
locationPrecision behavior
descriptionHtmlSafe behavior
media variants
apply/quarantine/rollback semantics
fixture profiles
```

## 35.3. URL_GRAMMAR.md

```text
pageKey grammar
reserved namespaces
entity patterns
publicUrlId rules
slugHistory materialization
grammar migration redirects
trailing slash policy
308 normalization semantics
301 SEO redirect semantics
410 semantics
redirect priority
```

## 35.4. SEO.md

```text
intent ownership
SEO Registry
Content Gate
Development Gate
price freshness
NEWBUILD unit default
filter policy
pagination
sitemaps
lastmod
IndexNow decision
robots
structured data
journal SEO
lifecycle
```

## 35.5. CONTENT.md

```text
static content ownership
Development long-form content
typed claim provenance
journal categories
frontmatter schema
entity UID links syntax
article workflow
media policy
internal linking policy
```

## 35.6. OPERATIONS.md

```text
deploy
rollback
snapshot manual sync
sync worker lifecycle
bad snapshot recovery
entity quarantine report
stale lock recovery
Hub outage
S3 outage
lead channel outage
volume backup/copy
health checks
memory proof
security patch workflow
```

## 35.7. HANDOFF.md

```text
create Exit Bundle
copy media
switch DATA_MODE=local
switch LEADS_MODE=direct
remove AMS credentials
vendor/transfer contracts
clean build proof
DNS/Nginx notes
lead destination replacement
```

## 35.8. SECURITY.md

```text
security floor
Next/React/Node update process
snapshot trust set/key rotation expectations
remote fetch policy
image delivery mode
safe HTML renderer
location privacy rules
PII logging policy
rate limits
cookie/analytics privacy configuration
```

---

# 36. VERIFICATION GATES

Starter должен иметь команды с эквивалентной семантикой.

Suggested interface:

```bash
pnpm verify:lite
pnpm verify:snapshot
pnpm verify:contracts
pnpm verify:seo-contracts
pnpm verify:ui-core
pnpm verify:journal
pnpm verify:security
pnpm verify:performance
pnpm verify:exit-mode
pnpm verify
```

Exact implementation lives in project scripts.

## 36.1. Contract/taxonomy tests

```text
Lite imports/vends same Hub contract schemas
GARAGE_BOX accepted
forked GARAGE enum absent
RENT_LONG accepted
RENT_SHORT accepted
dealKind semantics accepted
lotAreaM2 naming matches contract
MoneyValue serialization matches imported schema
unknown major rejected
supported minor accepted
```

Goal:

```text
first valid Bastion-compatible Hub snapshot
→ no hand-written enum translation required
```

## 36.2. Snapshot mandatory tests

```text
valid trusted key/signature → accept
invalid signature → reject
unknown keyId → reject
revoked keyId → reject
wrong projectId → reject
unsupported schemaMajor → reject
lower/equal sequence → reject
hash mismatch → reject
bytes mismatch → reject
missing required dataset → reject
hard schema/envelope error → reject
private forbidden field leak → reject
critical identity collision → reject
activation failure → last-good untouched
restart with Hub unavailable → current dataset works
concurrent apply → one writer only
stale lock → controlled recovery
```

Entity-level policy:

```text
one quarantinable entity under threshold → activate + warning
quarantine ratio above threshold → reject
dependent invalid refs removed/quarantined deterministically
quarantine report persisted
```

## 36.3. Privacy/publication tests

```text
descriptionHtmlSafe renderer allows only approved tags
arbitrary/raw HTML not renderable
Content Gate uses descriptionText
locationPrecision never increases
geocoding/reconstruction path absent
ProjectPublicContact fallback works
missing public agent does not remove listing CTA
NO_ACTIVE_LISTINGS → 200, no redirect
NO_ACTIVE_LISTINGS default noindex outside sitemap
isImageOrderChangeAllowed=false preserves order
```

## 36.4. Repository tests

```text
query by publicUrlId
filter by geo/category/derived market
sort
pagination
agent relation
ProjectPublicContact relation
entity lifecycle
inactive geo global entity
multi-geo counts
two-revision max cache behavior
old revision released after transition
```

## 36.5. URL/SEO tests

```text
parseUrl(buildUrl(k)) = k
publicUrlId regex
reserved root precedence
primary geo 200
inactive geo 404 in SINGLE
active secondary geo 200 in MULTI
global entity URL unchanged across modes
Hub canonicalPath ignored as canonical owner
slugHistory → direct one-hop 301
grammar migration → direct one-hop 301
framework slash normalization = 308
redirect no loops/chains
PREPARED_OFF = 404
valid thin ACTIVE = 200 noindex
approved facet only
random combinations noindex
sitemap URL returns 200
canonical unique
lastmod factual, not blanket snapshot time
```

## 36.6. Development/Newbuild SEO tests

```text
price freshness <= hide threshold → eligible
price beyond hide threshold → price/AggregateOffer hidden
price beyond gate-fail threshold → configured Gate fail
long-form Development uid resolve or archived warning behavior
NEWBUILD property detail default 200 noindex
Development page remains owner intent
stale variable claim hidden
morphology never auto-guessed
```

## 36.7. Journal tests

```text
frontmatter validation
duplicate slug rejection
draft excluded from production
future article policy
category exists
related slug exists
cover exists
article sitemap only published
Article structured data factual
entity UID link resolves through buildUrl
missing entity UID link degrades to text + warning
broken internal link report
```

## 36.8. Media tests

```text
MediaAsset variants parsed
custom image loader selects approved variant
built-in server Image Optimization not invoked in default mode
no wildcard remotePatterns
protected image order preserved
missing variant falls back safely
media origin replaceable for exit
```

## 36.9. Rendering/cache tests

```text
inventory routes are dynamic server-rendered
inventory routes do not use ISR/SSG/use cache by default
snapshot switch visible on new requests within project SLA
journal/static build-time rendering still works
sitemap current after sequence change
```

## 36.10. Security tests

```text
lockfile Next version >= security floor
known affected RSC package versions absent
internal snapshot trigger authenticated/replay bounded
lead endpoint rate-limited
snapshot endpoint rate-limited
SSRF/private remote target blocked where remote fetch configurable
secrets absent from client bundle/log fixtures
PII absent from analytics events
```

## 36.11. Performance tests

Representative:

```text
5,000 inventory
100 developments
```

Record:

```text
load/index time
current heap
transition peak
post-release heap
representative query latency
page JS/image behavior
```

## 36.12. UI/A11y

```text
logical H1
keyboard/focus
labels/errors
contrast
responsive
reduced motion
media fallback
server/client boundary
```

## 36.13. Exit mode proof

Mandatory before commercial handoff:

```text
repository + Exit Bundle
no Hub credentials
no AMS S3 credentials
DATA_MODE=local
LEADS_MODE=direct
→ build
→ start
→ catalogs work
→ entity URLs work
→ redirects work
→ agents work
→ journal works
→ Development long-form works
→ media works
→ lead form works
```

---

# 37. RELEASE / OPERATIONS

SourceCraft — canonical Git/CI contour.

Recommended rhythm:

```text
WORK
→ implementation + targeted proof

PR
→ review

MERGE
→ exact-head proof

RELEASE
→ immutable artifact
→ deploy
→ live smoke
```

`merge != release`.

Production deploy — explicit owner command.

No application build on production host if standard AMS deploy flow provides immutable build artifact/image.

## 37.1. Release preflight

Before release:

```text
pnpm install --frozen-lockfile
contract checks
security-floor check
targeted tests
build
runtime smoke
```

If official critical/high security advisory is applicable:

```text
old vulnerable release cannot be declared production-ready
```

## 37.2. Release smoke

```text
/
primary geo
one category hub
one property entity
one development entity if enabled
one agent if enabled
agent fallback contact path
/journal/
one article
lead form
robots
sitemap
health
snapshot sequence
```

## 37.3. Snapshot activation smoke

After a new sequence:

```text
health shows new sequence
one entity changed as expected
canonical unchanged when identity unchanged
sitemap/lastmod behavior correct
no quarantine spike
ACK sent
```

## 37.4. Rollback

Application rollback:

```text
previous immutable app release
```

Data rollback:

```text
Hub republishes approved old content
→ NEW higher publishSequence
```

Lite never accepts lower sequence rollback.

---

# 38. OBSERVABILITY

Lite не требует heavyweight observability stack.

Minimum actionable state:

```text
site up/down
current publishSequence
snapshot generated/published age
last sync attempt
last successful apply
last ACK attempt/result
rejected snapshot count/reason
quarantine count/ratio/reasons
volume readable/writable
sync worker alive
lead channel availability/errors
memory/load proof metrics where collected
```

## 38.1. Health endpoint

May expose only safe fields:

```text
status
projectId safe identifier if policy allows
publishSequence
snapshotAgeSeconds
lastApplyAt
syncWorkerState
quarantineCount
leadSinkState summary
```

Never:

```text
credentials
manifest secret URL
phone/email
private source data
raw error payload
```

## 38.2. Staleness ownership

Lite exposes factual state:

```text
snapshotAgeSeconds
lastApplyAt
publishSequence
```

Primary fleet-level staleness alert remains Hub-owned through delivery/ACK state.

```text
Hub E13/E31
→ ACK stale / Source stale alert
```

Lite does not need a second independent monitoring platform just to duplicate Hub fleet alerting.

Local health may still support infrastructure monitoring for:

```text
web down
worker down
volume failure
lead endpoint failure
```

## 38.3. SUSPENDED

A stale snapshot caused by project `SUSPENDED` is not automatically a public error.

Operations should distinguish:

```text
STALE_UNEXPECTED
SUSPENDED_EXPECTED_NO_NEW_DATA
```

where project integration exposes that context safely.

---

# 39. SCALING / TRIGGERS

REALTY_LITE остаётся default, пока измерения не доказывают проблему.

Potential triggers:

```text
inventory tens of thousands
in-memory filtering latency unacceptable
memory footprint unacceptable
full-text search becomes product-critical
multi-replica required
very high traffic
heavy map marker workload
client editorial Admin required
server-side user accounts required
durable lead queue required locally
```

Даже при trigger сначала выбирается минимальное изменение.

Примеры:

```text
search bottleneck
→ measure
→ optimized in-memory index
→ only then external search if necessary

client editing need
→ evaluate FULL

multi-replica
→ shared data/cache strategy ADR
```

---

# 40. LIGHT → FULL COMPATIBILITY

Переход на FULL не должен означать переписывание frontend platform.

Сохраняются:

```text
URL grammar
publicUrlId
SEO Registry mechanism
Content Gate
DTO contracts
UI
Design System
journal URLs/content where desired
Hub SourceAdapters
Hub normalization
Hub source revisions
```

Меняется persistence/content backend проекта.

Цель:

```text
SnapshotRepository
→ future FullRepository
```

UI остаётся repository-neutral.

---

# 41. WHAT NOT TO BUILD IN REALTY_LITE

```text
Payload CMS
PostgreSQL
Prisma / ORM
project DB
client Admin
custom auth
server personal account
XML/YRL parser
feed scheduler
feed source credentials
Hub DB access
Hub request per page render
second backend
Redis
RabbitMQ
Kafka
Kubernetes
microservices
Meilisearch/Elasticsearch without proof
universal page builder
visual filter-to-SEO generator
arbitrary CMS SEO pages
server-side favorites
raw snapshot in UI
raw internal Agent model in UI
wildcard image hosts
remote image optimization on VPS by default
hidden fallback to empty catalog
silent acceptance of bad snapshot
silent URL mutation from feed
Hub-owned final canonical path
manual duplicated Hub enums
fake facts for SEO
runtime AI-generated factual copy
runtime geocoding to restore hidden precision
automatic redirect for NO_ACTIVE_LISTINGS
ISR/use cache for inventory routes without ADR
dynamic snapshot redirects hardcoded into next.config
unbounded in-memory revision history
```

---

# 42. DEFINITION OF DONE — REALTY_LITE STARTER 1.1.0

## Architecture

- [ ] `AMS_PROFILE=REALTY_LITE`.
- [ ] No Payload dependency.
- [ ] No Prisma/ORM dependency.
- [ ] No PostgreSQL requirement.
- [ ] No Admin/CMS route.
- [ ] `src/platform/**` has no project literals.
- [ ] UI has no snapshot storage imports.
- [ ] Web rendering path does not download/apply snapshots.
- [ ] Sync worker/default isolated apply path exists.

## Contracts

- [ ] Hub public schemas imported or vendored.
- [ ] No forked duplicate taxonomy.
- [ ] `GARAGE_BOX`, `RENT_LONG`, `RENT_SHORT`, `dealKind` supported.
- [ ] `lotAreaM2` and MoneyValue match contract.
- [ ] `project/contacts` supported.
- [ ] `keyId` trust/revocation supported.
- [ ] unified `inventory` dataset supported.

## Snapshot

- [ ] Manifest validation implemented.
- [ ] Ed25519/public-key verification implemented.
- [ ] trust set + revoked key behavior implemented.
- [ ] anti-replay implemented.
- [ ] atomic apply implemented.
- [ ] local last-good implemented.
- [ ] persistent volume path documented.
- [ ] webhook trigger implemented safely.
- [ ] polling fallback implemented.
- [ ] ACK implemented in hub mode.
- [ ] bad hard-gate snapshot cannot replace last-good.
- [ ] entity quarantine threshold implemented and reported.

## Data / privacy

- [ ] repository/DTO boundary exists.
- [ ] mixed inventory taxonomy supported.
- [ ] agents public contract supported.
- [ ] ProjectPublicContact fallback supported.
- [ ] geo/development relations supported.
- [ ] locationPrecision can only decrease.
- [ ] no private apartment/address reconstruction.
- [ ] safe description renderer exists.
- [ ] raw HTML cannot reach UI.
- [ ] protected media order preserved.
- [ ] immutable revision in-memory indexes supported.
- [ ] max two loaded revisions enforced/proven.

## URL / SEO

- [ ] `buildUrl/parseUrl` single owner.
- [ ] Hub canonicalPath not authoritative.
- [ ] geo-first local grammar supported.
- [ ] stable global entity URLs supported.
- [ ] publicUrlId format enforced or project legacy ADR exists.
- [ ] slugHistory materializes one-hop 301.
- [ ] grammar migrations Lite-owned.
- [ ] trailing slash normalization 308.
- [ ] SEO legacy redirects 301.
- [ ] SINGLE_GEO/MULTI_GEO supported.
- [ ] publication status model implemented.
- [ ] SEO Registry implemented.
- [ ] Content Gate implemented.
- [ ] Development Gate implemented.
- [ ] price freshness mechanism implemented.
- [ ] NEWBUILD unit default implemented.
- [ ] morphology facts/override contract implemented.
- [ ] filter whitelist implemented.
- [ ] pagination policy implemented.
- [ ] sitemap/robots implemented.
- [ ] factual lastmod implemented.
- [ ] IndexNow decision documented.
- [ ] structured data factual-only.
- [ ] lifecycle 200/noindex/301/410 implemented.

## Journal / content

- [ ] repository Markdown pipeline.
- [ ] Zod frontmatter validation.
- [ ] journal hub.
- [ ] category pages.
- [ ] article pages.
- [ ] related articles.
- [ ] entity UID link resolver.
- [ ] missing entity link graceful fallback.
- [ ] article structured data.
- [ ] journal sitemap.
- [ ] drafts/future publication policy.
- [ ] RSS decision documented.
- [ ] `content/developments/<uid>.md` pipeline supported.
- [ ] typed variable claims require provenance + checkedAt.

## Media

- [ ] MediaAsset variants contract supported.
- [ ] custom loader/default no VPS remote image optimization.
- [ ] approved media origin only.
- [ ] no wildcard hosts.
- [ ] missing-image fallback.
- [ ] responsive variant selection.
- [ ] media origin replaceable for exit.

## UI

- [ ] AMS UI Core v5.0 applied.
- [ ] Design Intake complete.
- [ ] representative page proof.
- [ ] responsive/a11y checks.
- [ ] map/gallery lazy loading where relevant.

## Leads / analytics

- [ ] canonical LeadForm.
- [ ] server validation.
- [ ] anti-spam.
- [ ] consent target.
- [ ] LeadSink abstraction.
- [ ] `LEADS_MODE=direct` works.
- [ ] failure not silently reported as guaranteed success.
- [ ] no PII analytics/log leak.
- [ ] lead destination/legal decision documented per project.
- [ ] Yandex Metrica or selected provider gated by consent where required.
- [ ] Webvisor/session replay form policy explicit.

## Security

- [ ] Next.js lockfile >= approved security floor.
- [ ] known vulnerable RSC packages absent.
- [ ] Node supported LTS.
- [ ] internal snapshot trigger protected.
- [ ] lead/snapshot endpoint rate limits configured.
- [ ] no forbidden cache mode on inventory routes.
- [ ] safe HTML test passes.
- [ ] location privacy tests pass.
- [ ] secret scanning/log tests pass.

## Performance

- [ ] representative 5k inventory + 100 Development proof.
- [ ] load/index-build time measured.
- [ ] current heap measured.
- [ ] current→next peak measured.
- [ ] old revision released.
- [ ] image variant strategy measured.
- [ ] project memory budget documented.

## Portability

- [ ] `DATA_MODE=hub` works.
- [ ] `DATA_MODE=local` works.
- [ ] `LEADS_MODE=direct` works without AMS.
- [ ] media origin replaceable.
- [ ] transferable/vendored snapshot contracts.
- [ ] Exit Bundle clean build proof passes.

## Operations

- [ ] SourceCraft canonical.
- [ ] Docker/Nginx production documented.
- [ ] sync worker documented.
- [ ] volume recovery documented.
- [ ] snapshot manual sync documented.
- [ ] Hub outage proof.
- [ ] S3 outage proof.
- [ ] staging indexing protection.
- [ ] immutable release artifact.
- [ ] live smoke checklist.

---

# 43. RECOMMENDED STARTER IMPLEMENTATION ORDER

Это порядок построения canonical REALTY_LITE 1.1.0 starter.

```text
1. Repository / docs foundation
2. REALTY_LITE profile guard
3. Hub public contract import/vendoring
4. Snapshot manifest + keyId trust set
5. Local snapshot storage
6. Signature/hash/schema validation
7. Entity quarantine policy
8. Sync worker + atomic apply + ACK
9. SnapshotRepository + in-memory indexes
10. max-two-revision memory behavior
11. DTO/ViewModel contracts
12. unified inventory taxonomy
13. ProjectPublicContact fallback
14. privacy-safe description/location handling
15. URL grammar builder/parser
16. publicUrlId + slugHistory materialization
17. project grammar migrations / redirect graph
18. project config + status matrices
19. SEO Registry + Content Gate
20. Development Gate + price freshness
21. NEWBUILD unit policy
22. sitemap/robots/lastmod/IndexNow decision
23. UI foundation / UI Core
24. catalog + representative entity routes
25. Agent module
26. media variants + custom loader
27. Development long-form Markdown module
28. Journal Markdown + entity UID links
29. LeadSink
30. analytics/consent
31. security/architecture guards
32. cache/rendering guards
33. representative performance proof
34. fixtures/integration tests
35. DATA_MODE=local
36. Exit Bundle integration proof
37. production/staging proof
38. starter freeze
```

Do not start project-specific visual polish before:

```text
contracts
snapshot
URL grammar
privacy
SEO mechanism
```

are stable enough to avoid rework.

---

# 44. PROJECT-SPECIFIC LAYER EXPECTATION

Клон REALTY_LITE starter для нового клиента должен требовать преимущественно:

```text
brand/config
geo config
category/market statuses
URL/SEO registry
Content Gate project thresholds
Development Gate thresholds
price freshness thresholds
static content
Development long-form content
journal articles
Design System values
LeadSink config
analytics/consent config
Project registration in Hub
Snapshot project credentials
media origin
memory/container budget
legacy URL migrations where applicable
```

Новый клиент не должен требовать:

```text
new DB
new CMS
new XML parser inside site
new jobs system
new data backend
rewrite of platform grammar
rewrite of DTO boundary
forked Hub taxonomy
custom snapshot protocol
```

Если нужен новый source format:

```text
change Hub SourceAdapter/Profile
-X→ change Lite ingestion
```

Если нужен bulk XLSX import для shared catalog:

```text
Hub responsibility
-X→ Lite project responsibility
```

Если клиенту нужен self-service editor/Admin:

```text
evaluate REALTY_FULL
```

Если existing project migration имеет старые URLs:

```text
project redirect migration file
→ one-hop 301
→ current buildUrl canonical
```

---

# 45. FINAL FORMULA

```text
                     AMS DATA HUB
                         │
                         │ signed immutable snapshot
                         │ public/project projection only
                         ▼
               ┌────────────────────────┐
               │    AMS REALTY LITE     │
               │                        │
               │ Next.js                │
               │ TypeScript strict      │
               │ no DB                  │
               │ no CMS                 │
               │ no Admin               │
               │ SnapshotRepository     │
               │ local last-good        │
               │ sync worker            │
               │ SEO Registry           │
               │ Content Gate           │
               │ URL Grammar            │
               │ UI Core                │
               │ Markdown content       │
               │ LeadSink               │
               └───────────┬────────────┘
                           │
                       client exit
                           │
                           ▼
                  ProjectExitBundleV1
                           +
                  client media origin
                           +
                    DATA_MODE=local
                           +
                   LEADS_MODE=direct
                           │
                           ▼
                  independent website
```

Final ownership:

```text
FEEDS / INGESTION
→ Hub

SHARED FACTS
→ Hub

PROJECT FACTS
→ Hub project scope

AGENTS FACTUAL/PUBLICATION STATE
→ Hub project scope

PROJECT PUBLIC CONTACT
→ Hub project scope

PERSISTENT ENTITY URL IDENTITY
→ Hub project scope

FINAL URL PATH GRAMMAR
→ Lite

CANONICAL PATH MATERIALIZATION
→ Lite

GRAMMAR MIGRATION REDIRECTS
→ Lite repository

SEO STRATEGY
→ Lite code/config

CONTENT GATE
→ Lite

INDEXABILITY
→ Lite

CANONICAL / SITEMAP / ROBOTS / INDEXNOW
→ Lite

STATIC COMMERCIAL CONTENT
→ Lite repository

DEVELOPMENT LONG-FORM SEO
→ Lite repository by default

BLOG / JOURNAL
→ Lite repository Markdown

UI / DESIGN SYSTEM
→ Lite repository

LEADS
→ Lite LeadSink / external destination

MEDIA NORMALIZATION / VARIANTS
→ Hub

MEDIA PRESENTATION
→ Lite

CLIENT EXIT
→ must work without AMS Hub
```

> **REALTY_LITE — полноценный SEO-first сайт недвижимости без собственной базы данных. Он получает versioned public data как подписанный snapshot, рендерит его локально и остаётся независимым от AMS runtime.**

> **Data Hub централизует сложность ingestion, нормализации и persistent dynamic state. Lite владеет продуктом, URL, SEO, контентом, frontend и конечным HTTP behavior.**

> **Если новая сложность не имеет реального trigger — она не добавляется.**

---

# 46. RELATION TO OTHER AMS STANDARDS

## AMS UI Core v5.0

Применяется непосредственно и полностью.

## AMS Realty Platform Core Standard 5.5

Остаётся каноном для DB/CMS-backed Realty profile, но не является техническим baseline REALTY_LITE.

Его проверенные patterns могут быть перенесены как:

```text
URL semantics
SEO Registry
Content Gate mechanisms
Design System principles
```

без переноса обязательной DB/Payload architecture.

## AMS Data Hub

Current canonical reference for this release:

```text
AMS Data Hub v3.1.2+
```

Data Hub и REALTY_LITE образуют contract pair:

```text
Hub owns data operations/public snapshot.
Lite owns final site behavior.
```

REALTY_LITE 1.1.0 требует от Hub public contract минимум:

```text
unified inventory dataset
canonical shared enums
project/contacts
manifest keyId
public agent projection
privacy-projected address/geo
safe description fields
entity URL identity state
media contract
```

Если Hub current version ещё содержит legacy `canonicalPath`:

```text
Lite does not treat it as owner.
```

Target cross-standard cleanup описан в §47.

## Project Master Plan

Конкретный проект (`Bastion`, `Союз`, другой клиент) получает собственный Master Plan поверх:

```text
REALTY_LITE CORE STANDARD
+
AMS UI CORE
+
PROJECT MASTER PLAN
+
PROJECT SEO/URL CONTRACT
```

Project plan может ужесточать thresholds/config.

Project plan не может молча нарушить Lite Hard Contract.

## SourceCraft

SourceCraft — canonical Git/CI/release contour по умолчанию.

GitHub не является обязательным source of truth для коммерческого project delivery.

---

---

# 47. CROSS-STANDARD HUB CONVERGENCE

Этот раздел **не переносит Hub responsibilities в Lite**.

Он фиксирует, какие Hub contract improvements нужны, чтобы целевая пара `Hub ↔ Lite 1.1.0` была полностью консистентна.

## 47.1. URL Registry contract

Target Hub public URL identity state:

```text
entityUid
publicUrlId
slug
slugHistory[]
lifecycle/presentation state
redirectTargetEntityUid?
```

Target:

```text
canonicalPath
-X→ authoritative Hub public contract
```

Final path всегда:

```text
Lite buildUrl/buildEntityUrl
```

Until Hub document/code is updated:

```text
legacy canonicalPath may remain present
→ Lite ignores it as canonical owner
```

## 47.2. DevelopmentV1 Content Gate facts

Hub should expose, when available and factual:

```text
priceByRooms[] + priceCheckedAt
media typed counts/references
layout count
constructionProgress[] + capturedAt
salesStatus
completionStatus
class
deadline
sourceUpdatedAt / updatedAt
```

Lite uses these inputs to calculate project-owned Gate/indexability.

Hub does not decide SEO result.

## 47.3. Shared Geo morphology

Hub Shared Geo target fields:

```text
City:
  name
  nameGenitive
  nameLocative
  preposition

District:
  name
  nameGenitive
  nameLocative
  preposition
  type
  synonyms[]
  agglomerationOf?
```

Relations must be acyclic where applicable.

Lite may explicitly override project presentation, but does not guess morphology.

## 47.4. Media variants

Hub media mirror target:

```text
source image
→ validate
→ mirror
→ responsive variants
→ MediaAsset.variants[]
```

Recommended widths/formats live in Hub media policy.

Lite consumes variants and avoids VPS transcoding.

## 47.5. XLSX bulk catalog tooling

XLSX is **not a Lite responsibility**.

For a project such as «Союз застройщиков» with approximately 80–100 manually maintained Development records, this is a real Hub operations trigger.

Recommended Hub flow:

```text
XLSX
→ parse
→ Zod/domain validation
→ dry-run
→ diff
→ explicit apply
→ audit/history
→ rollback/reconcile support
```

Identity:

```text
immutable uid
```

not row number/name.

This can move Hub E40 from optional to required **for the specific shared-catalog project**, without making XLSX mandatory for all Hub deployments.

## 47.6. Souz migration consequence

If «Союз застройщиков» moves from DB/Payload profile to REALTY_LITE:

```text
retain:
URL grammar
district model
SEO Registry
Content Gate thresholds
metadata patterns
commercial content
Design System

move to Hub:
Development factual catalog
bulk XLSX operations
shared factual geo/development state

remove from Lite:
Payload
project PostgreSQL
site-side Excel importer
site-side catalog mutation backend

replace:
site DB repository
→ SnapshotRepository

site lead outbox
→ LeadSink/external durable service if required
```

A new project Master Plan should be built **after** Lite 1.1.0 is accepted as its Technical Core.

---

# 48. VERIFIED / TARGET DECISION / REQUIRES CHECK

## 48.1. VERIFIED FROM AMS DOCUMENTS

From AMS Data Hub v3.1.2 and Lite 1.0.1 baseline:

```text
Lite has no project DB/CMS/Admin
Hub is not page-render runtime backend
Lite owns SEO and URL grammar
Hub v3.1.2 publishes signed immutable snapshots
Hub v3.1.2 includes project/contacts
Hub v3.1.2 includes manifest keyId and rotation/revocation model
Hub v3.1.2 canonical inventory is unified and typed
Hub v3.1.2 property types include GARAGE_BOX
Hub v3.1.2 transaction types include SALE/RENT_LONG/RENT_SHORT/UNKNOWN
Hub v3.1.2 includes dealKind
Hub privacy projection separates public location from private apartment data
Hub public description path uses sanitized HTML/plain text
Agent NO_ACTIVE_LISTINGS is not DEPARTED
ProjectExitBundleV1 / DATA_MODE=local are portability invariants
```

## 48.2. VERIFIED EXTERNALLY AT 2026-10-02

Official Next.js security release dated **2026-09-30**:

```text
Next.js 16.3.8 = patched Active LTS release for 16.3 line
```

The release documents:

```text
SSRF in Image Optimization under affected remote URL configuration
SSG/ISR cache-poisoning vulnerabilities
root-param/use-cache cache isolation vulnerability
additional metadata/dev-server issues
```

Official sources:

```text
https://nextjs.org/blog/september-2026-security-release
https://nextjs.org/support-policy
https://nodejs.org/en/about/previous-releases
https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components
```

Node 24 is an LTS line at the date of this Standard.

React security history confirms affected RSC lines and fixed `19.2.4` for the 19.2 stable line; current project must still verify actual resolved packages because Next App Router may integrate framework-specific React builds.

## 48.3. TARGET ARCHITECTURE DECISIONS IN 1.1.0

These are owner-standard decisions, not claims that Hub 3.1.2 already implements all of them:

```text
Lite canonical path materialization only
publicUrlId target format = lowercase Base32 5..8 chars
entity quarantine default threshold = 0.5%
sync worker separated from web rendering by default
max two loaded revisions
custom image loader / pre-generated variants by default
inventory-dependent routes no ISR/SSG/use cache by default
Development price freshness mechanism supported
NEWBUILD unit default = 200 noindex outside sitemap
Yandex Metrica default provider for RU projects
IndexNow optional module
```

## 48.4. REQUIRES CHECK PER PROJECT / IMPLEMENTATION

```text
exact @ams/data-contracts serialized MoneyValue shape
exact React packages resolved by chosen Next release
exact MediaAsset.variants schema after Hub implementation
exact publicUrlId compatibility for already published legacy projects
actual memory budget on selected VPS/container
Development Gate thresholds
price freshness thresholds if project overrides defaults
cookie banner/legal wording
lead destination/legal basis/retention
Webvisor/session replay policy
IndexNow enablement/key management
Nginx Brotli availability in chosen image/build
multi-replica need
XLSX trigger for each shared-catalog project
```

Do not turn REQUIRES CHECK items into invented facts.

---

# 49. CHANGELOG — 1.1.0

```text
MINOR / architecture concept preserved

Contract alignment:
- architecture reference updated to Hub v3.1.2+
- Hub contract schemas become canonical enum/DTO source
- unified inventory dataset adopted
- GARAGE → GARAGE_BOX corrected
- SALE/RENT fork removed; RENT_LONG/RENT_SHORT adopted
- dealKind added
- lotAreaM2 contract aligned
- ProjectPublicContact/project/contacts added
- manifest keyId/trust/revocation added

URL ownership:
- Hub canonicalPath no longer authoritative for Lite
- Lite materializes all canonical paths
- slugHistory → Lite one-hop 301
- grammar migrations → project repository
- publicUrlId target format fixed
- 308 slash normalization vs 301 SEO redirects clarified

Snapshot resilience:
- hard snapshot failures separated from quarantinable entity failures
- default entity quarantine threshold 0.5%
- critical identity/privacy failures always reject
- quarantine report added

Privacy/publication:
- safe description renderer defined
- raw HTML forbidden
- location precision cannot increase
- no geocoding to reconstruct exact point
- Agent fallback = ProjectPublicContact
- NO_ACTIVE_LISTINGS = 200/no redirect
- protected image ordering enforced

Security/runtime:
- Next security floor set to >=16.3.8 on 16.3 line
- incorrect audit date corrected: 16.3.8 release was 2026-09-30
- React/RSC resolved-package security check added
- Node 24 LTS baseline
- security patch SLA added
- inventory routes no ISR/SSG/use cache by default
- sync worker isolated from public render path
- Nginx baseline/rate limits clarified

Media:
- Hub responsive variants contract added
- custom image loader default
- VPS server-side remote optimization disabled by default
- wildcard media hosts forbidden

SEO:
- Development Content Gate mechanism added
- price freshness mechanism added
- NEWBUILD unit noindex default added
- factual sitemap lastmod added
- 45k sitemap shard threshold added
- IndexNow optional module added
- morphology ownership moved to Hub Shared Geo with Lite override
- typed commercial claims provenance added

Content:
- content/developments/<uid>.md added
- journal entity links by UID added
- missing entity link graceful fallback added

Analytics/leads:
- Yandex Metrica default provider added
- consent gating added
- Webvisor/session replay privacy rule added
- per-project personal-data destination decision added

Performance/operations:
- max two in-memory revisions
- representative 5k inventory + 100 Development proof
- memory budget requirement
- staleness ownership Hub ACK vs Lite health clarified
- verification suite expanded

Cross-standard:
- Hub URL identity convergence documented
- DevelopmentV1 Gate fields documented
- Shared Geo morphology fields documented
- Media variants documented
- XLSX shared-catalog trigger documented
- Souz Lite migration consequence documented
```

---

# 50. OPEN QUESTIONS / DECISION REGISTER

| ID | Question / decision | Owner | Close by | Status in 1.1.0 |
|---|---|---|---|---|
| OQ-L01 | `publicUrlId` format for new Lite projects. | AMS owner / architecture | Before starter freeze | **CLOSED:** lowercase Base32, 5–8 chars. Existing published legacy IDs require compatibility ADR, never silent mutation. |
| OQ-L02 | Exact `MoneyValue` serialized fields in shared contract. | Hub contracts / Lite architecture | Before contract package freeze | OPEN — Lite must import schema, not invent it. |
| OQ-L03 | Exact `MediaAsset.variants[]` contract. | Hub media / Lite architecture | Before media implementation | OPEN — mechanism required, serialized shape requires contract. |
| OQ-L04 | Cookie banner / privacy wording. | Client/operator + legal | Before analytics public launch | OPEN per project. |
| OQ-L05 | Lead destinations, legal basis, retention and cross-border assessment. | Client/operator + legal/security | Before forms public launch | OPEN per project. |
| OQ-L06 | Webvisor/session replay enablement and masking proof. | Project owner + privacy | Before enablement | OPEN; OFF on form surfaces by default. |
| OQ-L07 | Web container memory budget. | Project architect / operations | Before production sizing | OPEN per deployment; representative proof mandatory. |
| OQ-L08 | Development Content Gate thresholds. | Project SEO owner | Before Development indexing | OPEN per project. |
| OQ-L09 | Price freshness thresholds. | Project SEO/data owner | Before Development indexing | DEFAULT 45/120 days; project may override explicitly. |
| OQ-L10 | IndexNow enablement. | Project SEO owner | Before public SEO release | OPTIONAL / project decision. |
| OQ-L11 | XLSX bulk catalog import. | Hub/project owner | Before large manual shared catalog onboarding | TRIGGER-BASED; for Souz-scale 80–100 ЖК the trigger is considered present. |
| OQ-L12 | Legacy published project IDs/URLs incompatible with target format/grammar. | Project architect | Before migration | OPEN only for existing legacy projects; migration must preserve published identity/301 history. |

Open question cannot be answered by AI invention.

If milestone arrives and the decision is required for safe/public behavior:

```text
release gate remains blocked
```

unless a safe disabled/noindex/default behavior is explicitly defined above.

---

# 51. FINAL AI INSTRUCTION

When an AI/Codex agent receives a REALTY_LITE repository governed by this Standard, it must reason in this order:

```text
1. This is an independent website, not a frontend to live Hub API.
2. No project DB/CMS/Admin unless explicit profile change.
3. Public Hub contracts are data truth; do not fork enums.
4. Snapshot must pass trust/integrity/privacy gates.
5. Current data is read locally from last-good.
6. Hub owns identity state; Lite owns URL path grammar.
7. Lite owns SEO, Content Gate and final HTTP behavior.
8. Private precision/data can never be reconstructed.
9. Static/editorial repository content stays separate from factual Hub state.
10. Complexity requires a real measured/business trigger.
11. Portability/exit is a feature, not a promise.
12. If uncertain, mark REQUIRES CHECK instead of guessing.
```

Architecture summary:

```text
Hub
→ ingest / normalize / store persistent project facts
→ privacy/publication projection
→ signed immutable snapshot

Lite sync worker
→ verify
→ atomic local apply
→ last-good

Lite web
→ SnapshotRepository
→ DTO/ViewModel
→ URL/SEO/UI
→ public site

Client exit
→ repository + Exit Bundle + client media + direct leads
→ independent website
```

---

**Architecture status:** FINAL / CANONICAL / READY FOR STARTER IMPLEMENTATION  
**Standard version:** 1.1.0  
**Primary Hub reference:** AMS Data Hub v3.1.2+ current canonical  
**Hub runtime dependency:** FORBIDDEN  
**Project database:** NONE  
**CMS/Admin:** NONE  
**Snapshot:** SIGNED / IMMUTABLE / LAST-GOOD / KEY-ID VERIFIED / PRIVACY-PROJECTED  
**Inventory:** UNIFIED / CONTRACT-OWNED TAXONOMY  
**URL grammar:** LITE-OWNED  
**Hub canonicalPath:** NON-AUTHORITATIVE / LEGACY-COMPAT ONLY  
**SEO:** LITE-OWNED  
**Development long-form:** LITE REPOSITORY BY DEFAULT  
**Media:** HUB VARIANTS → LITE CUSTOM LOADER  
**Inventory caching:** NO ISR/SSG/USE-CACHE BY DEFAULT  
**Leads:** LITE LEADSINK  
**Exit:** DATA_MODE=local + client media + direct leads  
**Git/CI:** SourceCraft  

**Конец канонического документа — AMS REALTY LITE CORE STANDARD 1.1.0 — SOLO + AI.**
