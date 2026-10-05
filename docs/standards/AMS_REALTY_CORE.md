# AMS REALTY CORE

**Версия:** 1  
**Статус:** профиль недвижимости поверх AMS SITE CORE  
**Назначение:** сайты агентств недвижимости, застройщиков, каталоги новостроек и вторичного рынка, сайты команд риелторов

---

## 0. Связь с AMS SITE CORE

AMS REALTY CORE не является отдельной архитектурой.

Он добавляет к AMS SITE CORE правила недвижимости:

- каталог;
- snapshot;
- синхронизация;
- объекты;
- ЖК;
- застройщики;
- агенты;
- география;
- lifecycle;
- приватность адресов;
- свежесть цен;
- Content Gate;
- Exit Mode.

Все правила AMS SITE CORE действуют, если этот документ явно не уточняет их.

Если возникает конфликт:

1. проверить, является ли правило явным уточнением профиля;
2. если нет — считать конфликт ошибкой;
3. не придумывать третье решение;
4. вынести вопрос владельцу.

---

## 1. Главная модель

Базовая схема:

```text
External Data Provider
→ signed immutable snapshot
→ local persistent storage
→ SnapshotRepository
→ DTO / ViewModel
→ Next.js pages
→ UI
```

External Data Provider может быть:

- AMS Data Hub;
- другой Hub;
- другой совместимый сервис;
- локальный Exit Bundle.

Сайт зависит не от конкретного Hub, а от snapshot-контракта.

Обычный page request никогда не должен обращаться в Hub.

---

## 2. Когда применяется REALTY CORE

Профиль подходит, если:

- каталог приходит из внешнего источника;
- сайт сам не редактирует факты объектов;
- нет обязательной CMS;
- нет собственной project-БД;
- сервер рендерит страницы из локального snapshot;
- избранное может жить в browser storage;
- личный кабинет отсутствует;
- объём каталога укладывается в ресурсы VPS.

Профиль перестаёт быть достаточным, если появляется доказанный триггер REALTY FULL.

---

## 3. Hard Contract недвижимости

1. Snapshot — единственный автоматический источник каталожных фактов.
2. Прямого чтения БД Data Provider сайтом нет.
3. Запросов к Hub во время рендера страницы нет.
4. Некорректный snapshot не заменяет last-good.
5. URL и SEO принадлежат сайту.
6. Публичная идентичность сущности должна переживать смену Data Provider.
7. Приватные данные не передаются в публичный snapshot.
8. Точность геоданных нельзя повышать на стороне сайта.
9. Устаревшая цена скрывается.
10. Отсутствующий факт не заменяется `0`, `false` или выдуманным значением.
11. Сайт обязан работать при недоступном Hub.
12. Сайт обязан иметь Exit Mode.
13. Другой Data Provider можно подключить без изменения UI и SEO при соблюдении snapshot-контракта.
14. Внешний Data Provider не является владельцем canonical.
15. Сайт не парсит XML/YRL-фиды — это задача Data Provider.
16. Сырые модели snapshot не передаются в UI.
17. Плохие данные никогда не принимаются молча.
18. Каталог не требует Redis, БД или отдельного backend без измеренного триггера.

---

## 4. Владение данными

### Data Provider владеет

- фактическими данными объектов;
- фактическими данными ЖК;
- фактическими данными застройщиков;
- фактическими данными агентов;
- публичными UID;
- `publicUrlId`;
- текущим slug сущности;
- `slugHistory`;
- lifecycle;
- media manifest;
- датами проверки изменчивых фактов;
- публичными геоданными;
- публичными контактами;
- версией публикации.

### Сайт владеет

- URL-грамматикой;
- сборкой canonical path;
- SEO Registry;
- H1;
- title;
- description;
- Content Gate;
- правилами индексации;
- sitemap;
- robots;
- длинным редакционным контентом;
- журналом;
- навигацией;
- UI;
- заявками.

### Важное разделение

Data Provider поставляет identity:

```text
slug = rostov-central
publicUrlId = abc123
```

Сайт решает canonical path:

```text
/kvartiry/rostov-central-abc123/
```

Provider не присылает canonical path как источник истины.

---

## 5. Независимость от Hub

Чтобы заменить AMS Data Hub другим поставщиком, новый поставщик должен:

- выдавать совместимый snapshot;
- сохранить UID;
- сохранить `publicUrlId`;
- сохранить текущие slug;
- перенести `slugHistory`;
- перенести lifecycle;
- сохранить семантику публичных полей.

Если поставщик не может сохранить идентичность, выполняется отдельная migration-процедура с явной таблицей redirects.

Смена Hub никогда не является причиной молча менять URL.

---

## 6. Production topology

Базовая topology:

```text
Reverse proxy
├─ web process
└─ snapshot sync process
       ↓
persistent volume
       ↓
current + previous snapshot revisions
```

Web:

- только читает активную ревизию;
- обслуживает публичный трафик;
- не имеет credentials на запись в Data Provider.

Sync process:

- единственный writer snapshot storage;
- скачивает новую публикацию;
- проверяет её;
- атомарно активирует;
- отправляет ACK.

Это не отдельный backend.

Оба процесса могут собираться из одного application image.

Для маленького сайта допускается одна web replica.

Несколько replicas требуют отдельной проверки согласованности storage.

---

## 7. Режимы данных

Для REALTY CORE используются:

```text
DATA_MODE = snapshot | local
```

### snapshot

Обычная production-работа с внешним Data Provider.

### local

Автономная работа на Exit Bundle.

В режиме `local`:

- нет sync;
- нет provider credentials;
- нет ACK;
- сайт работает через тот же SnapshotRepository.

Режим `db` означает переход за границы REALTY CORE.

---

## 8. Snapshot Contract

Snapshot — неизменяемая публикация данных.

Он состоит из:

- `manifest.json`;
- detached Ed25519 signature;
- набора файлов данных.

### 8.1. Подпись

Подписываются точные UTF-8 bytes файла `manifest.json`.

Подпись хранится отдельно.

Проверка:

1. получить manifest bytes;
2. выбрать разрешённый public key по `keyId`;
3. проверить detached Ed25519 signature;
4. только после успешной подписи доверять содержимому manifest;
5. затем загружать файлы данных.

Повторная сериализация JSON не используется как payload подписи.

### 8.2. Manifest

Минимально:

```text
schemaMajor
schemaMinor
schemaPatch?
projectId
publishSequence
generatedAt
publishedAt
keyId
files[]
sourceRevisions[]
```

Для каждого файла:

```text
kind
key
sha256
bytes
count
```

---

## 9. Совместимость схем

### Major

Новый `schemaMajor` считается несовместимым.

Snapshot отклоняется до обновления сайта.

### Minor

Minor разрешает только backward-compatible additive changes:

- новое optional поле;
- новый optional файл;
- расширение, которое старый consumer может безопасно игнорировать.

Minor не может:

- переименовывать существующее поле;
- менять семантику поля;
- делать optional поле обязательным;
- менять денежные единицы;
- менять формат идентификаторов;
- добавлять enum value, которое старый contract не может безопасно принять.

### Patch

Patch не меняет структуру контракта.

---

## 10. Trust Set

Сайт хранит trust set публичных ключей:

- текущий ключ;
- ключи плановой ротации;
- denylist отозванных ключей.

Private signing key никогда не находится на сайте.

Worker получает только public keys для проверки.

---

## 11. Приём snapshot

Snapshot принимается только если одновременно:

1. подпись валидна;
2. `projectId` совпадает;
3. key разрешён;
4. `publishSequence` больше активного;
5. schema совместима;
6. SHA-256 каждого файла совпадает;
7. размер файла совпадает;
8. данные проходят Zod-контракт;
9. Privacy Gate проходит;
10. UID валидны;
11. `publicUrlId` уникальны;
12. canonical URL после сборки не конфликтуют;
13. slug не конфликтуют с зарезервированными корнями;
14. связи сущностей валидны;
15. доля карантина не превышает порог.

Только после этого revision может стать `CURRENT`.

---

## 12. Anti-replay

`publishSequence` монотонно растёт.

Новый snapshot должен иметь:

```text
incomingSequence > currentSequence
```

Локально откатывать sequence нельзя.

Если нужно вернуть старые данные:

- Data Provider публикует их снова;
- новая публикация получает новый больший sequence.

---

## 13. Карантин

Локальная ошибка отдельной сущности не обязана уничтожать весь snapshot.

Сущность можно отправить в quarantine, если:

- битая необязательная связь;
- конфликт slug, который не затрагивает весь namespace;
- повреждено неключевое поле;
- локальная ошибка медиа.

Критическая ошибка отклоняет snapshot целиком.

Критические ошибки:

- Privacy Gate;
- подпись;
- projectId;
- sequence;
- schema;
- hash;
- публичные контакты проекта;
- глобальная уникальность URL;
- нарушение identity.

Базовый порог:

```text
MAX_ENTITY_QUARANTINE_RATIO = 0.005
```

Это означает 0.5% записей.

Порог может быть ужесточён проектом.

---

## 14. Privacy Gate

Публичный snapshot не должен содержать:

- номер квартиры, если он приватный;
- сырой внутренний адрес;
- скрытые точные координаты;
- личные контакты сотрудника;
- внутренние provider ID, не предназначенные для публикации;
- документы согласия;
- служебные заметки;
- секреты.

При обнаружении запрещённого поля:

- snapshot отклоняется;
- значение поля не попадает в лог;
- фиксируется только код инцидента и идентификатор безопасного уровня.

---

## 15. Публичная география

Сайт получает только:

```text
addressPublic
geoPublic
geoPrecision
```

Примеры precision:

- exact;
- street;
- district;
- city.

Сайт может снизить точность.

Сайт не может:

- повысить точность;
- геокодировать маскированный адрес для восстановления точки;
- восстанавливать номер квартиры;
- сопоставлять внешние источники ради деанонимизации.

---

## 16. Sync

Sync запускается:

- сигналом Data Provider;
- либо периодическим polling.

Внутренний trigger является только сигналом.

Он не принимает snapshot payload.

Trigger:

- POST only;
- authenticated;
- rate-limited;
- timestamp protected;
- не принимает произвольный remote URL.

Worker самостоятельно обращается только к разрешённому origin.

---

## 17. Алгоритм sync

```text
1. получить trigger / polling result
2. взять single-writer lock
3. скачать manifest + signature
4. проверить подпись
5. проверить sequence и schema
6. скачать data files во временную revision
7. проверить hash / size / schema
8. выполнить Privacy Gate
9. проверить identity / URL / relations
10. сформировать quarantine report
11. атомарно завершить revision
12. атомарно переключить CURRENT
13. записать pending ACK
14. отправить ACK
15. снять lock
```

Web всегда видит либо старую, либо новую ревизию целиком.

---

## 18. ACK без потерь

ACK должен быть идемпотентным.

Нельзя допускать:

```text
CURRENT switched
→ network failed
→ ACK lost
→ provider считает публикацию непринятой
```

Поэтому:

- состояние pending ACK хранится локально;
- повторный ACK разрешён;
- повтор текущего `publishSequence` не вызывает повторный apply;
- worker может увидеть, что snapshot уже активен, и повторить только ACK;
- Data Provider должен принимать повторный ACK безопасно.

ACK не содержит приватных данных.

---

## 19. Storage revisions

На диске хранятся минимум:

- active revision;
- previous known-good revision.

Временные incomplete revisions не считаются рабочими.

Очистка старых revisions выполняется по ограниченной политике.

Нельзя бесконечно хранить историю.

---

## 20. Поведение при недоступном Hub

Если Data Provider недоступен:

- сайт продолжает работать на last-good;
- страницы не начинают обращаться к Provider;
- посетитель не получает техническую ошибку Hub;
- health показывает возраст snapshot;
- мониторинг сообщает о проблеме владельцу.

Если snapshot ещё ни разу не был получен:

- каталог показывает контролируемое состояние;
- страницы каталога не индексируются;
- health = degraded;
- остальной сайт продолжает работать.

---

## 21. SnapshotRepository

SnapshotRepository — единственная публичная точка чтения каталога.

Он:

- читает `CURRENT`;
- валидирует revision metadata;
- строит необходимые индексы;
- отдаёт DTO;
- скрывает raw snapshot model.

UI не получает provider schema.

Основные группы DTO:

- property card;
- property details;
- development card;
- development details;
- developer;
- agent;
- geo;
- media;
- public project contact.

---

## 22. Память и индексы

Индексы строятся только под реальные запросы сайта.

Типично:

- UID;
- publicUrlId;
- geo;
- category;
- developmentUid;
- agentUid;
- slug;
- простой text index.

Запрещено строить универсальную поисковую инфраструктуру заранее.

В памяти одновременно не должно бесконтрольно оставаться много revisions.

После переключения старая revision освобождается после завершения безопасного transition.

---

## 23. Таксономия недвижимости

Минимальная таксономия типов объектов:

```text
APARTMENT
ROOM
HOUSE
HOUSE_PART
COTTAGE
TOWNHOUSE
GARAGE_BOX
LAND
COMMERCIAL
NEW_BUILD_UNIT
OTHER
```

`OTHER` не публикуется автоматически без правила проекта.

Тип сделки:

```text
SALE
RENT_LONG
RENT_SHORT
UNKNOWN
```

Вид продажи:

```text
SECONDARY_SALE
PRIMARY_SALE
ASSIGNMENT
UNKNOWN
```

---

## 24. Вычисляемый рынок

Provider передаёт факты.

Маркетинговую классификацию рынка может вычислять сайт.

Например:

```text
NEWBUILD
SECONDARY
```

На основе deal kind, development relation и project policy.

Сырой текст источника не используется как SEO-классификация.

---

## 25. Отсутствующие значения

`null` означает «нет данных».

Нельзя автоматически превращать отсутствие в `0`, `false` или выдуманный факт.

UI скрывает факт, если он отсутствует.

---

## 26. Деньги

Деньги хранятся:

- в минимальных денежных единицах;
- с валютой.

Форматирование выполняется одним formatter.

Нельзя хранить отображаемую строку цены как основной числовой факт.

---

## 27. Агенты

В публичный DTO агента попадает только публичная проекция:

- uid;
- slug;
- имя;
- роль;
- должность;
- bio;
- специализации;
- фото;
- публичные рабочие контакты;
- lifecycle.

Личные контакты не публикуются.

Если объект не имеет активного публичного агента, используется публичный контакт проекта.

Карточка объекта не остаётся без CTA.

---

## 28. Публичный контакт проекта

Snapshot обязан содержать публичный fallback contact проекта.

Минимально:

- phone;
- email optional;
- messengers optional;
- address optional;
- working hours optional.

Это единый резервный CTA для объектов и ЖК.

---

## 29. Lifecycle агента

Типовые состояния:

- active;
- hidden;
- departed;
- redirected.

Отсутствие активных объектов само по себе не означает redirect.

Если агент существует, но активных объектов нет:

```text
200
noindex,follow
```

Redirect применяется только при явном lifecycle-решении.

---

## 30. URL Grammar

Сайт является единственным владельцем URL Grammar.

Базовые классы:

```text
/{geo}/
/{geo}/{category}/
/{geo}/{category}/{facet}/

/novostroyki/zhk-{slug}/
/{objectNamespace}/{slug}-{publicUrlId}/
/zastroyshchiki/{slug}/
/komanda/
/komanda/{slug}/

/journal/
/journal/category/{slug}/
/journal/{slug}/
```

Точный набор классов определяется проектом.

Глубина каталожного URL по умолчанию ограничивается тремя сегментами.

---

## 31. Identity и slug

Публичная identity сущности:

```text
uid
publicUrlId
slug
slugHistory
```

Provider обязан сохранять её между публикациями.

`publicUrlId`:

- непрозрачный;
- стабильный;
- не строится из внутреннего ID источника;
- не меняется при переименовании объекта;
- не меняется при смене адреса.

Slug может измениться.

Предыдущий slug попадает в `slugHistory`.

Старый URL получает permanent redirect на новый canonical.

---

## 32. Смена Data Provider

При миграции на другой Hub:

```text
старый provider export
→ identity migration
→ новый provider
→ тот же snapshot contract
```

Обязательное требование:

```text
uid / publicUrlId / slugHistory сохраняются
```

Если это невозможно:

- составляется migration map;
- публикуется redirect map;
- migration проверяется до переключения.

Нельзя просто пересоздать IDs.

---

## 33. Разбор URL

Рекомендуемый порядок:

1. технические и зарезервированные routes;
2. известные geo slug;
3. entity routes;
4. normalisation;
5. redirect history;
6. lifecycle;
7. 410;
8. 404;
9. page rendering;
10. Content Gate.

Geo slug не может конфликтовать с зарезервированным root.

Это проверяется автоматически.

---

## 34. Lifecycle сущности

| Lifecycle | HTTP | Индексация |
|---|---:|---|
| `VISIBLE` | 200 | по Content Gate |
| `ARCHIVED_VISIBLE` | 200 | `noindex,follow` |
| `REDIRECTED` | 308 | нет |
| `GONE` | 410 | нет |

Redirect target должен быть конкретной связанной сущностью либо заранее разрешённой безопасной целью.

Массовый redirect на главную запрещён.

---

## 35. Приоритет redirects

```text
URL normalization
→ slugHistory
→ explicit migration
→ lifecycle redirect
→ 410
→ 404
```

Redirect chains блокируют выпуск.

---

## 36. SEO Registry недвижимости

Классы страниц:

- geo hub;
- category listing;
- approved facet;
- development;
- property;
- developer;
- agent;
- journal article.

Для каждого intent один URL-владелец.

Один intent не должен индексироваться на нескольких URL.

---

## 37. Морфология

Русские падежи не вычисляются эвристикой в production.

Используются утверждённые формы:

```text
name
nameGenitive
nameLocative
preposition
```

Если нужной формы нет:

- используется безопасный текст без склонения;
- вопрос фиксируется для контентной доработки.

---

## 38. Content Gate листингов

Geo/category/facet listing может индексироваться только если:

- intent разрешён;
- facet в whitelist;
- количество объектов не ниже project threshold;
- объекты актуальны;
- страница имеет достаточный уникальный контент;
- canonical корректен.

Порог количества объектов задаётся проектом.

Он не должен быть спрятан в коде.

---

## 39. Свежесть цен

Базовые пороги:

```text
PRICE_HIDE_AFTER_DAYS      = 45
PRICE_GATE_FAIL_AFTER_DAYS = 120
```

Если цена старше hide threshold:

- цену не показывать;
- не использовать её в structured data.

Если данные ЖК по цене старше gate threshold:

- страница ЖК не проходит Content Gate.

`priceCheckedAt` меняется только при реальной проверке.

Проект может задавать более строгие пороги.

---

## 40. Gate объекта

Объект может быть SEO-индексируемым только при достаточных фактах.

Минимально:

- публичная identity;
- lifecycle visible;
- цена или подтверждённый статус «по запросу»;
- площадь;
- публичная география;
- достаточное медиа;
- корректный CTA.

Тонкая карточка может оставаться доступной пользователю с `noindex`.

---

## 41. Gate ЖК

Индексируемая страница ЖК должна иметь достаточный набор:

- название;
- публичное geo;
- статус;
- срок сдачи, если применимо;
- класс, если применимо;
- достаточные медиа;
- планировки или подтверждённые предложения;
- актуальные цены или корректную альтернативу;
- редакционный текст;
- CTA.

Неполная страница:

```text
200
noindex,follow
```

---

## 42. NEW_BUILD_UNIT

Отдельные квартиры/юниты новостройки по умолчанию не являются владельцами SEO-intent.

Базовая политика:

```text
200
noindex,follow
```

Основной SEO-владелец — ЖК.

Иное решение требует явной SEO-стратегии проекта.

---

## 43. Фильтры

Фильтр работает через GET.

Без JavaScript основные параметры должны оставаться функциональными.

Path создают только approved SEO facets.

Комбинации произвольных фильтров:

```text
query params
noindex,follow
```

Нельзя автоматически превращать все комбинации в SEO-страницы.

---

## 44. Пагинация

`page=1` нормализуется к основному URL.

Page 2+:

- отдельный URL;
- self canonical;
- обычные crawlable ссылки между страницами.

Индексация page 2+ задаётся проектной политикой.

Для небольших агентских каталогов допустим `noindex,follow`.

Для больших каталогов допускается `index,follow`, если это обосновано SEO-архитектурой.

---

## 45. Поиск

Поиск:

- работает по локальному индексу;
- не требует внешнего search service по умолчанию;
- страницы поисковой выдачи не являются SEO landing pages;
- search results получают `noindex`.

Внешний search engine добавляется только после измеренного ограничения локального поиска.

---

## 46. Sitemap и robots

Они формируются из текущего SnapshotRepository.

В sitemap попадает только страница, которая:

- существует;
- canonical;
- HTTP 200;
- lifecycle разрешает;
- проходит Content Gate;
- разрешена `INDEXING_MODE`.

Snapshot может измениться без rebuild приложения.

Поэтому runtime sitemap и robots не должны оставаться замороженными на старом build-time snapshot.

`lastmod` берётся только из реальных данных.

---

## 47. Structured Data недвижимости

Допустимые типы выбираются по семантике:

- Organization;
- RealEstateAgent;
- Person;
- BreadcrumbList;
- ItemList;
- Residence;
- Apartment;
- Offer;
- AggregateOffer;
- Article;
- BlogPosting;
- FAQPage.

Цена в Offer/AggregateOffer используется только если она свежая.

Запрещены:

- фиктивный AggregateRating;
- фиктивные Review;
- устаревшая цена;
- синтетическое наличие;
- приватные данные.

---

## 48. Редакционный контент

Длинный SEO-контент ЖК принадлежит сайту, а не Hub.

Он связывается с сущностью по стабильному UID.

Если Data Provider меняется, текст остаётся на сайте.

Описание Provider может использоваться как фактический материал, но не заменяет project editorial content, не рендерится как сырой HTML и проходит безопасный renderer.

---

## 49. Журнал

Журнал принадлежит сайту.

Статья может ссылаться на сущность по UID.

При рендере UID разрешается через SnapshotRepository в текущий canonical URL.

Если сущность исчезла, статья не ломается: ссылка либо удаляется, либо переводится на разрешённую lifecycle-цель.

Статья индексируется только если она опубликована, не находится в будущем, не является draft и имеет содержательный текст.

---

## 50. Медиа

Provider может готовить варианты изображений заранее.

Рекомендуемые классы размеров:

- small;
- medium;
- large.

Форматы:

- AVIF/WebP при наличии;
- fallback.

Сайт получает media key и metadata.

Конкретный storage origin задаётся конфигурацией сайта.

Компонент не зависит от домена конкретного Hub.

---

## 51. Exit Mode и медиа

Signed snapshot в Exit Mode **не изменяется**.

Нельзя переписывать подписанный manifest.

Для выхода:

```text
snapshot bytes — сохраняются
media keys — сохраняются
media files — копируются клиенту
MEDIA_ORIGIN — меняется на storage клиента
```

Если нужен дополнительный mapping, он хранится как отдельная локальная конфигурация сайта и не изменяет signed snapshot.

---

## 52. Заявки

REALTY CORE использует механизм AMS SITE CORE без отдельной конкурирующей конфигурации.

Доступны:

```text
LEADS_ROUTE = direct | service | dual
LEAD_TRANSPORT = none | smtp | webhook | crm
```

До внешней доставки заявка сохраняется в зашифрованный durable local spool.

Для объектов context может содержать только публичные ссылки:

- page key;
- property UID;
- publicUrlId;
- development UID;
- agent UID;
- source surface.

ПД не попадают в analytics или logs.

---

## 53. Независимость заявок от AMS

Для Exit Mode обязательно должна работать:

```text
LEADS_ROUTE = direct
```

с транспортом клиента.

Если используется AMS lead-service и он недоступен:

- принятая локально заявка остаётся в spool;
- повторяется доставка;
- сайт не теряет lead.

При полном отказе от AMS сервис отключается без изменения форм и UI.

---

## 54. Избранное и сравнение

Для Lite-модели:

- избранное хранится в localStorage или URL;
- сравнение хранится в localStorage или URL;
- нет server-side user account;
- персональная страница избранного не индексируется.

---

## 55. Карта

Карта — client island.

Она:

- загружается лениво;
- получает только разрешённую точность координат;
- не восстанавливает скрытые координаты;
- ограничивает число markers;
- при необходимости использует client-side clustering.

---

## 56. Рендер

Динамически из активного snapshot обычно рендерятся:

- geo;
- listings;
- properties;
- developments;
- agents;
- sitemap;
- robots.

Статические по смыслу страницы могут быть pre-rendered.

Нельзя включать ISR или cache, если он способен показать удалённый объект, старую цену, устаревший lifecycle или старый sitemap.

---

## 57. Производительность

Базовый representative dataset для теста:

- 5 000 объектов;
- 100 ЖК;
- агенты;
- multi-geo;
- media metadata.

Измеряется:

- memory before load;
- memory with active revision;
- peak during switch;
- memory after previous revision release;
- index build time;
- key page response time;
- client JS;
- HTML size.

Числовой memory budget зависит от реального VPS.

Он задаётся проектом после измерения.

---

## 58. Безопасность Provider integration

Worker:

- скачивает только с allowlist origin;
- запрещает private/internal IP targets;
- не следует произвольным redirect на неизвестный host;
- имеет timeout;
- имеет size limits;
- проверяет HTTPS;
- не доверяет filename от сервера;
- проверяет hash до активации.

Web не должен иметь signing secret Provider.

На сайте хранятся только public verification keys.

---

## 59. Health и наблюдаемость

Health может показывать:

```text
status
current publishSequence
snapshot age
last successful sync
pending ACK
lead spool count
```

Health не показывает:

- ПД;
- credentials;
- raw snapshot;
- внутренние адреса;
- содержимое заявок.

Статусы:

- `ok`;
- `degraded`.

---

## 60. Exit Bundle

Автономный Exit Bundle должен позволить поднять сайт без AMS.

Он включает:

- last-good signed snapshot;
- detached signature;
- публичные verification keys, необходимые для чтения сохранённой revision;
- совместимые schema contracts;
- локальные project-конфиги;
- медиа или инструкцию подключения media storage клиента;
- direct lead configuration;
- инструкцию запуска.

После выхода:

- sync отключён;
- provider credentials удалены;
- ACK отключён;
- SnapshotRepository остаётся тем же.

---

## 61. Доказательство Exit Mode

Перед передачей сайт должен быть проверен:

```text
без AMS credentials
без AMS network access
production install
production build
production start
```

Smoke test:

- главная;
- каталог;
- listing;
- объект;
- ЖК;
- агент;
- 404;
- 410;
- redirect;
- journal;
- media;
- форма;
- lead spool;
- direct delivery.

---

## 62. Локальная разработка

Для разработки используются тестовые snapshots.

Нужны минимум:

### main

Нормальный набор данных.

### alt

Другой бренд и география.

Проверяет отсутствие проектных литералов в platform.

### broken

Ошибки:

- bad signature;
- hash mismatch;
- duplicate publicUrlId;
- privacy violation;
- broken relation;
- invalid slug;
- excessive quarantine.

### representative

Набор для performance test.

Тестовые данные явно помечены как тестовые.

---

## 63. UI

REALTY CORE не создаёт отдельную UI-систему.

Он использует общую AMS UI-конституцию.

Domain UI получает DTO:

- PropertyCard;
- DevelopmentCard;
- AgentCard;
- filters;
- gallery;
- pagination;
- map.

Сырой snapshot object в UI запрещён.

---

## 64. Переход на REALTY FULL

Переход нужен, если появляется хотя бы одно:

- клиенту нужна CMS/админка для каталога;
- нужны редакторы и роли;
- личный кабинет;
- server-side избранное;
- собственные изменяемые данные сайта;
- каталог больше не укладывается в memory budget;
- локальный поиск доказанно не справляется;
- нужен сложный workflow lead queue;
- требуется несколько replicas с общим изменяемым состоянием;
- нужен transaction state.

Переход не меняет автоматически URL, publicUrlId, slugHistory, SEO Registry, Content Gate, DTO и UI.

Repository заменяет источник за тем же интерфейсом.

---

## 65. Что не строить в REALTY CORE

Без доказанного триггера запрещены:

- PostgreSQL;
- Prisma;
- Payload;
- CMS;
- проектная БД;
- Redis;
- message broker;
- Elasticsearch;
- Meilisearch;
- второй backend;
- прямой SQL к Hub;
- запросы к Hub во время page render;
- XML/YRL parser на сайте;
- автоматическая генерация SEO-страниц из всех filters;
- raw provider models в UI;
- raw HTML от Provider;
- wildcard media origins;
- бесконечная история revisions;
- локальный ручной fork фактов Provider.

---

## 66. Проверки профиля

Дополнительно к Core должны проверяться:

### contracts

- schema compatibility;
- enum;
- taxonomy;
- monetary units.

### snapshot

- signature;
- anti-replay;
- hash;
- size;
- atomic switch;
- last-good;
- quarantine.

### privacy

- запрещённые поля;
- DTO;
- JSON-LD;
- coordinate precision.

### grammar

- build/parse;
- reserved roots;
- publicUrlId;
- slugHistory;
- redirects;
- 410;
- redirect chains.

### content gate

- listing thresholds;
- development gate;
- property gate;
- price freshness;
- NEW_BUILD_UNIT policy.

### sync

- lock;
- partial download;
- crash before switch;
- crash after switch;
- lost ACK;
- ACK retry.

### exit

- offline build/start;
- local snapshot;
- local media origin;
- direct leads.

---

## 67. Definition of Done

REALTY-проект не считается готовым, пока:

- сайт работает без live-запросов к Hub;
- SnapshotRepository является единственной точкой каталожного чтения;
- signature реально проверяется;
- bad snapshot не заменяет last-good;
- lost ACK восстанавливается;
- identity стабильна;
- смена slug создаёт permanent redirect;
- privacy gate работает;
- price freshness работает;
- Content Gate работает;
- runtime sitemap соответствует активному snapshot;
- media provider заменяем;
- заявка сначала попадает в durable spool;
- Exit Mode реально проверен;
- сайт запускается без AMS credentials;
- UI не зависит от raw snapshot;
- production build и smoke tests проходят.

---

## 68. Финальная инструкция AI

При работе с недвижимостью считать истинной следующую модель:

```text
Сайт владеет URL, SEO, UI и поведением страниц.

Data Provider владеет фактами каталога и переносимой публичной identity.

Связь между ними — подписанный snapshot contract.

Hub не вызывается во время рендера.

Плохой snapshot не заменяет last-good.

Недоступный Hub не останавливает сайт.

Другой Hub можно подключить без переписывания сайта,
если он сохраняет контракт и публичную identity.

Заявка сначала надёжно сохраняется локально,
и только потом доставляется наружу.

Любая новая инфраструктура должна быть оправдана измеренной необходимостью.
```
