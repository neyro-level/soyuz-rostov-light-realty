# AMS UI CORE

**Версия:** 1  
**Статус:** базовая UI-конституция AMS  
**Модель работы:** владелец / архитектор + AI  
**Назначение:** единые правила интерфейса для лендингов, корпоративных сайтов, каталогов и веб-приложений

---

## 0. Связь с AMS SITE CORE

AMS UI CORE отвечает только за интерфейс.

Он определяет:

- дизайн-систему;
- UI-примитивы;
- токены;
- типографику;
- layout;
- визуальную иерархию;
- компоненты;
- responsive;
- accessibility;
- client/server границы UI;
- правила переиспользования;
- визуальные состояния;
- UI-проверки.

AMS UI CORE не владеет:

- URL;
- SEO Registry;
- canonical;
- sitemap;
- robots;
- источниками данных;
- snapshot;
- Repository;
- доставкой заявок;
- инфраструктурой;
- production topology.

Эти вопросы регулируются AMS SITE CORE и активным отраслевым профилем.

Если правило UI конфликтует с AMS SITE CORE, действует Core, если владелец явно не принял другое архитектурное решение.

---

## 1. Главный принцип

```text
Один проект → одна дизайн-система → один набор примитивов → повторное использование.
```

Новая страница не должна становиться новым дизайном.

Сначала создаётся система:

- токены;
- typography roles;
- layout primitives;
- базовые UI primitives;
- shared components;
- domain components.

После этого страницы собираются из системы.

Цель:

- визуальная целостность;
- минимальное количество уникального кода;
- предсказуемое поведение;
- доступность;
- хорошая мобильная версия;
- лёгкая поддержка одним владельцем и AI.

---

## 2. Источники истины UI

Приоритет:

1. явное решение владельца;
2. утверждённый дизайн проекта или дизайн-система;
3. AMS SITE CORE;
4. AMS UI CORE;
5. активный отраслевой UI-профиль, если он есть;
6. фактические токены и утверждённые компоненты проекта;
7. макеты и референсы;
8. решение AI.

Если макет противоречит утверждённой дизайн-системе, AI не создаёт второй параллельный стиль молча.

Если значения дизайна неизвестны:

- не придумывать случайные цвета;
- не придумывать случайные радиусы;
- не создавать новую типографическую шкалу;
- использовать существующий системный токен;
- либо зафиксировать вопрос владельцу.

Версии библиотек и их API проверяются по фактическому проекту и официальной документации.

---

## 3. Hard Contract UI

1. В одном проекте используется одна UI-система.
2. shadcn/ui — основной источник UI-примитивов.
3. Вторая полноценная UI-библиотека без отдельного решения запрещена.
4. Используется один набор иконок — Lucide, если проектом не утверждено иное.
5. Design tokens являются источником визуальных значений.
6. Проектные цвета не хардкодятся в компонентах.
7. Повторяющийся визуальный паттерн превращается в компонент, variant или token.
8. Новый компонент создаётся только после проверки возможности переиспользования.
9. Компонент UI не получает доступ к БД, Hub, файлам или внешнему API.
10. UI получает props, DTO или ViewModel.
11. Компонент не содержит проектные факты, которые должны приходить из content/data слоя.
12. Server Components используются по умолчанию.
13. Client Component создаётся только при необходимости browser interaction.
14. Страница или большая секция не переводится в client mode ради одного интерактивного элемента.
15. Accessibility нельзя отключать ради визуального эффекта.
16. Мобильная версия является обязательной частью дизайна, а не адаптацией после desktop.
17. Неиспользуемые UI-зависимости, токены и компоненты удаляются.
18. Визуальная сложность должна иметь функцию.
19. Случайные эффекты, декоративные библиотеки и animation frameworks не добавляются без причины.
20. UI не должен ломать SEO-семантику AMS SITE CORE.

---

## 4. shadcn/ui

### 4.1. Роль shadcn

shadcn/ui используется как основной источник интерфейсных примитивов.

Компоненты shadcn:

- добавляются в кодовую базу проекта;
- могут адаптироваться к токенам проекта;
- могут расширяться variant-ами;
- остаются частью проектного UI-кода.

Допустимы build-time и CLI-зависимости, необходимые актуальной версии shadcn.

Не следует считать shadcn обычной закрытой компонентной библиотекой: проект владеет добавленными компонентами.

---

## 5. Primitive Base

При инициализации shadcn выбирается одна поддерживаемая primitive base.

Базовая политика AMS:

```text
default = Radix
```

Другая официально поддерживаемая shadcn base допускается, если:

- она выбрана при старте проекта;
- есть причина проекта;
- это не создаёт второй параллельный primitive layer.

В одном проекте нельзя без отдельного решения смешивать несколько primitive bases для одинаковых задач.

Секции и страницы не импортируют primitive library напрямую.

Они используют AMS/shadcn primitives.

---

## 6. Добавление и изменение primitives

Перед добавлением компонента:

1. проверить, есть ли он уже;
2. проверить официальный компонент shadcn;
3. добавить только необходимое;
4. проверить зависимости;
5. проверить визуальную совместимость с токенами.

Официальные shadcn-компоненты добавляются через актуальный CLI.

Перед `overwrite` изменённого primitive:

- сравнить изменения;
- сохранить проектные modifications;
- не перетирать компонент вслепую.

### Разрешено

- добавлять variants;
- добавлять sizes;
- связывать primitive с tokens;
- исправлять accessibility;
- добавлять проектно-независимое поведение.

### Запрещено

- помещать внутрь primitive бизнес-логику;
- делать запросы к данным;
- помещать проектные тексты;
- помещать аналитику;
- копировать тот же primitive под новым названием.

---

## 7. REUSE → VARIANT → COMPOSE → CREATE

Перед созданием UI-элемента AI проходит последовательность:

### 1. REUSE

Использовать существующий компонент без изменения.

### 2. VARIANT

Если отличается внешний вид или состояние — добавить variant/size/prop в существующий компонент.

### 3. COMPOSE

Собрать более крупный компонент из существующих primitives и shared components.

### 4. CREATE

Создать новый компонент только если предыдущие варианты не подходят.

Новый компонент должен иметь отдельную семантическую или функциональную ответственность.

Не нужно превращать один универсальный компонент в десятки несвязанных boolean props.

Если variants начинают описывать разные сущности, создаётся отдельный domain component.

---

## 8. Native HTML и primitives

Интерактивные элементы проекта:

- button;
- input;
- textarea;
- select;
- dialog;
- menu;
- tabs;
- accordion;
- tooltip;
- checkbox;
- radio;
- switch;

строятся через утверждённые primitives.

Сырой интерактивный HTML со своей параллельной стилизацией в секциях запрещён.

При этом обычный семантический HTML разрешён и нужен:

- `article`;
- `section`;
- `header`;
- `footer`;
- `nav`;
- `main`;
- `ul`;
- `ol`;
- `figure`;
- `div`;
- `span`.

Не нужно оборачивать любой статический блок в `Card` только потому, что Card существует.

`Card` используется там, где это реально паттерн дизайн-системы.

---

## 9. Tailwind CSS

Tailwind — основной способ utility styling.

Проект использует актуальную major-версию, утверждённую AMS SITE CORE.

Для Tailwind CSS 4 дизайн-токены связываются с theme variables.

### Разрешено

- обычные utility classes;
- responsive utilities;
- state variants;
- CSS variables;
- `@theme`;
- `@theme inline`;
- project utilities, если они действительно повторяются.

### Запрещено без причины

- inline style с проектными design values;
- случайный component CSS;
- большая свалка `@apply`;
- дублирующая CSS-система рядом с Tailwind.

---

## 10. Arbitrary values

В UI-коде нельзя систематически создавать дизайн через случайные arbitrary values:

```text
bg-[#...]
text-[17px]
mt-[53px]
rounded-[7px]
shadow-[...]
```

Если значение является частью дизайна:

- сделать token;
- использовать существующий scale;
- создать variant.

Разовое техническое значение допускается только если:

- оно действительно уникально;
- не является design decision;
- его нельзя выразить существующей системой;
- рядом понятна причина.

Если исключение повторяется — оно перестаёт быть исключением и должно стать token/variant.

---

## 11. Design Tokens

Design tokens — главный источник визуальных значений.

Категории:

- colors;
- typography;
- spacing;
- radius;
- shadows;
- container widths;
- motion;
- z-index;
- breakpoints, если нужны проектные;
- surface roles.

Компоненты используют семантические роли, а не сырые значения.

Пример:

```text
primary
primary-foreground
background
foreground
card
muted
border
destructive
surface-soft
surface-strong
```

Цвет `#0057B8` может существовать внутри token definition.

В JSX должен использоваться смысл:

```text
bg-primary
text-foreground
border-border
```

---

## 12. Цвет

Цветовая система строится из ролей.

Минимум:

- background;
- foreground;
- card;
- card-foreground;
- primary;
- primary-foreground;
- secondary;
- secondary-foreground;
- muted;
- muted-foreground;
- accent;
- accent-foreground;
- destructive;
- border;
- input;
- ring.

Дополнительные роли создаются только при реальном использовании.

Запрещено создавать случайные имена вроде `specialBlue`, если это не системная роль проекта.

Имена должны описывать функцию, а не оттенок.

---

## 13. Theme Mode

Светлая тема является базовым режимом коммерческого сайта.

Dark theme создаётся только если:

- она входит в требования продукта;
- есть полный набор tokens;
- все states и contrast проверены.

Нельзя добавлять неполную dark theme «потому что shadcn её умеет».

Если dark theme не используется, проектная dark-логика не должна усложнять UI.

---

## 14. Radius

Radius задаётся дизайн-системой.

Используется небольшая семантическая шкала:

```text
sm
md
lg
xl
full
```

Не требуется искусственно делать все радиусы одинаковыми.

Нельзя использовать десятки близких значений без причины.

`rounded-full` предназначен для форм, которые действительно должны быть круглыми или pill:

- avatar;
- status dot;
- icon button;
- chip;
- radio;
- switch;
- pill CTA, если это часть дизайна.

---

## 15. Shadows

Тени используются как системные роли.

Например:

```text
shadow-sm
shadow-card
shadow-overlay
```

Не следует создавать уникальную тень для каждого блока.

Если дизайн обходится без теней — они не добавляются.

---

## 16. Typography

Типографика задаётся ролями.

Базовые роли:

```text
display
h1
h2
h3
h4
body-lg
body
body-sm
caption
```

Каждая роль определяет:

- font size;
- line height;
- letter spacing;
- при необходимости responsive scale.

Font weight задаётся отдельно, если дизайн не требует связанного token.

HTML-тег и визуальная роль — разные вещи.

Допустимо:

```html
<h2 class="text-h3">
```

если семантическая структура страницы требует H2.

Нельзя менять heading level ради размера текста.

---

## 17. Шрифт

Если проект имеет утверждённый брендовый шрифт — используется он.

Если брендового решения нет, AMS fallback:

```text
Manrope
```

Шрифты подключаются оптимизированным способом для Next.js.

Правила:

- только нужные families;
- только нужные weights;
- обязательна кириллица для русскоязычного проекта;
- загрузка шрифта не должна блокировать рендер;
- одна основная family предпочтительнее нескольких.

Второй шрифт добавляется только при реальной роли в дизайн-системе.

---

## 18. Spacing

Spacing использует ограниченную системную шкалу.

Нельзя собирать ритм страницы случайными значениями.

Разделяются:

### Component spacing

Внутренние padding/gap компонентов.

### Section spacing

Вертикальный ритм между крупными частями страницы.

### Container padding

Горизонтальный безопасный отступ контента.

За один тип spacing отвечает один слой.

Например:

- Container — horizontal page padding;
- Section — vertical section padding;
- component — внутренний padding.

Нельзя одновременно компенсировать один и тот же layout отступами на трёх уровнях.

---

## 19. Containers

Используется небольшой набор container roles.

Минимум:

```text
site
narrow
wide
```

### site

Основной контент сайта.

### narrow

Статьи, документы, формы, текстовые страницы.

### wide

Только для интерфейсов или секций, которым действительно нужна большая ширина.

Ширина не задаётся заново каждой секцией.

---

## 20. Sections

Повторяемый каркас секции должен управлять:

- vertical spacing;
- background role;
- container;
- optional anchor/id;
- optional class extension.

Типовые section spacing:

```text
sm
md
lg
hero
```

`md` — стандартный.

Секция не должна вручную создавать собственный page container, если layout действительно не исключение.

---

## 21. Layout hierarchy

Логические слои UI:

```text
primitives
↓
shared
↓
domain
↓
sections
↓
page composition
```

Дополнительно существует layout:

- Header;
- Footer;
- navigation shells;
- page shell.

Физические папки могут отличаться.

Главное правило — зависимости идут вверх по композиции.

Нижний слой не импортирует верхний.

---

## 22. Базовые shared components

Для большинства сайтов полезны:

### Container

- site/narrow/wide;
- responsive page padding.

### Section

- background role;
- vertical rhythm;
- container integration.

### SectionHeader

- eyebrow optional;
- heading;
- supporting text;
- optional action.

### EmptyState

Для отсутствующих данных.

### ErrorState

Для контролируемой ошибки.

### ImageFrame

- aspect ratio;
- media crop;
- placeholder/fallback.

### CTA block

Повторяемая коммерческая точка действия.

Shared components не должны содержать контент конкретной компании.

---

## 23. Button

Button строится на shadcn primitive.

Типовые variants:

- default;
- secondary;
- outline;
- ghost;
- link.

Дополнительные variants создаются только из дизайн-системы проекта.

Типовые sizes:

- sm;
- default;
- lg;
- icon.

Обязательные states:

- hover;
- focus-visible;
- active;
- disabled;
- loading, если действие асинхронное.

Ссылка, визуально оформленная как кнопка, использует утверждённый pattern shadcn/Next Link, а не дублирующий компонент.

---

## 24. Forms

UI формы отвечает за:

- layout;
- labels;
- descriptions;
- required state;
- validation state;
- error state;
- loading;
- success;
- disabled;
- focus;
- accessibility.

Доставка заявки, durable spool, retry и transport регулируются AMS SITE CORE.

UI не реализует собственную альтернативную систему отправки.

Для одного типа lead action предпочтительно иметь одну каноническую LeadForm с configuration/props, а не копии формы по страницам.

---

## 25. Form accessibility

Каждое поле:

- имеет label;
- имеет стабильный id;
- связывает hint/error через aria;
- получает `aria-invalid` при ошибке;
- не полагается только на placeholder.

Ошибка:

- понятна текстом;
- не обозначается только цветом;
- находится рядом с проблемным полем.

После server error пользователь не теряет введённые данные без необходимости.

---

## 26. Header

Header должен решать навигационную задачу, а не быть самостоятельным приложением.

Типично содержит:

- brand/logo;
- primary navigation;
- контакт или utility action;
- основной CTA;
- mobile navigation.

Mobile navigation использует доступный overlay/sheet/menu primitive.

Не создаётся отдельная вторая навигационная архитектура для mobile.

---

## 27. Footer

Footer обычно содержит:

- основные разделы;
- контакты;
- реквизиты;
- legal links;
- дополнительные utility links.

Footer использует те же tokens и компоненты, а не отдельную мини-дизайн-систему.

---

## 28. Commercial hierarchy

UI коммерческого сайта должен помогать пользователю быстро понять предложение.

### Первый экран

Визуальная иерархия должна позволять быстро увидеть:

1. кто / что это;
2. что предлагается;
3. для кого;
4. почему это имеет значение;
5. основное действие;
6. ключевое доказательство, если оно реально существует.

Типовая структура:

```text
eyebrow optional
H1
supporting proposition
proof / qualifier
primary CTA
secondary CTA optional
visual
```

Нельзя компенсировать слабое коммерческое сообщение декоративностью.

### Второй экран

Должен продолжать решение пользователя:

- раскрыть проблему;
- показать отличие;
- дать доказательство;
- объяснить услугу;
- показать релевантный каталог/результат.

Не должно быть случайного «красивого блока», не продолжающего смысл первого экрана.

UI не придумывает маркетинговые факты — он только правильно организует утверждённый контент.

---

## 29. Pages and Sections

Каждая крупная смысловая секция — отдельный компонент.

Например:

```text
HeroSection
ServicesSection
AdvantagesSection
CatalogPreviewSection
ProofSection
LeadSection
FAQSection
```

Page composition:

- собирает секции;
- не реализует низкоуровневые primitives;
- не содержит сложную UI-логику.

Новая страница сначала пытается переиспользовать существующие sections.

Копирование одинаковой секции между страницами запрещено.

---

## 30. Domain Components

Каталоги и приложения могут иметь domain UI:

- PropertyCard;
- DevelopmentCard;
- ProductCard;
- CaseCard;
- AgentCard;
- FilterBar;
- ResultCount;
- PriceDisplay.

Domain component:

- собирается из primitives/shared;
- знает DTO своего домена;
- не знает Repository;
- не делает запросы к источнику.

Одинаковую сущность нельзя отображать пятью несвязанными карточками без обоснования.

---

## 31. Server and Client

UI следует server-first модели AMS SITE CORE.

Client Component нужен для:

- menu;
- dialog;
- accordion;
- tabs;
- form interaction;
- carousel;
- map;
- browser storage;
- drag/drop;
- local interactive state.

Server Component подходит для:

- layout;
- content sections;
- cards без browser state;
- article;
- catalog markup;
- SEO-visible content.

Правильный pattern:

```text
Server section
└─ small Client Island
```

Неправильный:

```text
"use client"
EntirePage()
```

только потому, что внутри находится один accordion.

---

## 32. Responsive

Подход:

```text
mobile first
```

Дизайн должен быть полноценным на узком экране.

Responsive меняет:

- layout;
- columns;
- gaps;
- type scale;
- navigation;
- order, если смысл не нарушается;
- visibility только при обосновании.

Нельзя скрывать важный коммерческий или юридический контент на mobile ради удобства верстки.

---

## 33. Responsive verification

Минимальная визуальная проверка:

```text
375 px
768 px
1024 px
1440 px
```

Дополнительно проверяются реальные промежуточные состояния, если layout ломается между этими точками.

Проверяются:

- horizontal overflow;
- navigation;
- hero;
- forms;
- cards;
- tables;
- dialogs;
- long headings;
- long Russian words;
- images;
- sticky elements.

---

## 34. Accessibility

Цель AMS — WCAG 2.2 AA для основной пользовательской части, если проект не требует более высокого уровня.

Минимум:

- семантический HTML;
- keyboard navigation;
- видимый focus;
- правильные labels;
- доступные dialogs/menus;
- корректная heading hierarchy;
- status не передаётся только цветом;
- meaningful images имеют alt;
- decorative images имеют пустой alt;
- motion учитывает reduced motion.

### Contrast

Ориентир:

- обычный текст — не ниже 4.5:1;
- крупный текст — не ниже 3:1;
- важные UI boundaries/focus — различимы и достаточны по контрасту.

### Touch targets

AMS target:

```text
44 × 44 CSS px
```

для основных интерактивных controls на touch-интерфейсах, если дизайн позволяет.

---

## 35. Focus

Focus-visible должен быть системным.

Нельзя:

- убирать outline без замены;
- делать focus незаметным;
- использовать разные случайные focus styles.

Ring/focus role берётся из design tokens.

---

## 36. Images

UI отображает медиа по правилам AMS SITE CORE.

Обязательные принципы:

- зарезервированный aspect ratio;
- отсутствие layout shift;
- корректные responsive sizes;
- lazy loading вне LCP;
- приоритет только LCP media;
- neutral fallback;
- meaningful alt.

Gallery не загружает все полноразмерные изображения заранее.

---

## 37. Icons

По умолчанию используется Lucide.

Правила:

- единая толщина/стиль;
- icon size следует size role;
- icon-only control имеет accessible name;
- декоративная icon не должна создавать шум для screen reader.

Другой icon set добавляется только если Lucide объективно не покрывает задачу и владелец принял решение.

---

## 38. Motion

По умолчанию:

- CSS transitions;
- transform;
- opacity;
- небольшие state transitions.

Motion должен объяснять:

- изменение состояния;
- появление/исчезновение;
- перемещение;
- feedback.

Animation library не добавляется ради декоративного появления блоков.

Если сложная motion-сцена является частью продукта, допускается отдельное решение.

`prefers-reduced-motion` обязателен.

---

## 39. Carousels and Sliders

Carousel используется только если:

- последовательность действительно важна;
- контент не помещается разумно;
- есть mobile UX-причина.

Не использовать carousel как способ спрятать слабую структуру контента.

Обязательны:

- keyboard support;
- controls;
- focus behavior;
- swipe, если уместно;
- отсутствие обязательного autoplay.

Autoplay не должен мешать чтению.

---

## 40. Loading, Empty and Error States

Любая data-dependent UI-зона должна иметь определённые состояния:

```text
loading
empty
error
ready
```

Не нужно показывать Skeleton там, где сервер уже может отдать готовый HTML.

Skeleton применяется только при реальном ожидании UI.

EmptyState не должен выглядеть как техническая ошибка.

ErrorState должен объяснять следующий шаг, если он существует.

---

## 41. Dark Patterns

Запрещены:

- скрытый unsubscribe;
- замаскированная реклама;
- ложная срочность;
- fake scarcity;
- fake counters;
- ложные notifications;
- заранее отмеченное согласие, если оно не допустимо;
- визуальное принуждение к согласию;
- искусственные рейтинги.

UI не должен усиливать непроверенный маркетинговый факт.

---

## 42. Content in Components

Project-specific content не хардкодится в primitives/shared.

Разрешено хардкодить:

- технический aria-label общего компонента;
- нейтральный UI-текст, если он является частью primitive behavior.

Проектные:

- заголовки;
- телефоны;
- цены;
- преимущества;
- FAQ;
- адреса;
- CTA text;

приходят через props/content configuration.

---

## 43. Numbers and Formatting

UI не форматирует доменные данные вручную в каждом компоненте.

Общие formatter отвечают за:

- money;
- dates;
- areas;
- counts;
- plural forms;
- phone display.

UI получает либо raw semantic value + formatter API, либо готовую безопасную ViewModel.

---

## 44. Design Exceptions

Иногда точное соответствие дизайну требует исключения.

Исключение допустимо, если:

- оно действительно уникально;
- не разрушает accessibility;
- не создаёт второй дизайн-язык;
- понятно описано.

Если исключение повторяется:

```text
exception → token / variant / component
```

---

## 45. UI и отраслевые профили

AMS UI CORE универсален.

Отраслевой профиль может добавлять domain components и UX-паттерны.

Например REALTY:

- PropertyCard;
- DevelopmentCard;
- AgentCard;
- gallery;
- filters;
- map;
- pagination.

Профиль не создаёт вторую систему:

- Button;
- Input;
- colors;
- typography;
- spacing;
- modal;
- navigation.

---

## 46. Порядок создания UI

### Этап 1. Изучить проект

Определить:

- brand;
- palette;
- font;
- radius;
- typography;
- density;
- container;
- section rhythm;
- reference patterns.

### Этап 2. Создать tokens

До массовой вёрстки.

### Этап 3. Подготовить primitives

Только реально необходимые.

### Этап 4. Создать shared layout

Минимум:

- Container;
- Section;
- SectionHeader;
- Header;
- Footer;
- core form UI;
- states.

### Этап 5. Собрать одну показательную страницу

Обычно главную или самую типичную.

### Этап 6. Проверить

- desktop;
- mobile;
- accessibility;
- hierarchy;
- tokens;
- reuse.

### Этап 7. Масштабировать

Остальные страницы собираются по:

```text
REUSE
→ VARIANT
→ COMPOSE
→ CREATE
```

Нельзя сначала сверстать весь сайт разными способами, а потом пытаться унифицировать.

---

## 47. Проверки UI

Автоматизируемые проверки должны по возможности ловить:

- вторую UI-library;
- второй icon library;
- project hex literals в components;
- запрещённые arbitrary design values;
- raw styled interactive controls вне primitives;
- client boundary violations;
- duplicate primitives;
- accessibility regressions;
- missing form labels;
- missing image alt rules;
- invalid heading patterns, где это проверяемо.

UI verification не заменяет визуальный review.

---

## 48. Visual Review

Перед завершением UI-задачи AI должен проверить:

- страница не выглядит как набор разных шаблонов;
- одинаковые элементы выглядят одинаково;
- CTA hierarchy понятна;
- первый экран читается без усилий;
- второй экран логично продолжает первый;
- spacing системный;
- responsive не ломает смысл;
- длинный русский текст не ломает layout;
- реальные данные не создают overflow;
- empty/error states существуют;
- focus и keyboard работают.

---

## 49. Что не строить

Без доказанной необходимости запрещены:

- вторая UI-library;
- второй набор primitives;
- второй icon set;
- отдельная mobile дизайн-система;
- page builder;
- design tokens в нескольких независимых местах;
- новый Button для каждой страницы;
- новый Card для каждого блока;
- новая форма для каждого CTA;
- Framer Motion / GSAP только ради fade-in;
- сложный animation framework;
- бесконечный набор variants;
- client-side rendering всей страницы ради мелкой интерактивности;
- декоративные эффекты, ухудшающие performance или читаемость.

---

## 50. Definition of Done

UI-задача считается выполненной, когда:

- используется одна дизайн-система;
- primitives не дублируются;
- новые элементы прошли REUSE → VARIANT → COMPOSE → CREATE;
- design values идут через tokens;
- нет случайных цветов/размеров;
- typography системна;
- Container и Section отвечают каждый за свою геометрию;
- Server Components используются по умолчанию;
- client islands минимальны;
- UI получает props/DTO, а не источник данных;
- форма использует единый UI-pattern и не дублирует delivery logic Core;
- accessibility проверена;
- responsive проверен;
- mobile version полноценна;
- коммерческая иерархия первого экрана понятна;
- второй экран логично продолжает решение пользователя;
- нет fake facts и dark patterns;
- production build не сломан;
- визуальный review выполнен.

---

## 51. Финальная инструкция AI

```text
Не проектируй страницу отдельно от системы.

Сначала найди существующий token, primitive,
shared component или domain component.

Если можно переиспользовать — переиспользуй.

Если нужен новый вид — создай variant.

Если нужен новый смысловой блок — собери композицию.

Новый компонент создавай только тогда,
когда у него действительно новая ответственность.

UI не владеет данными, SEO и инфраструктурой.

UI отвечает за ясность, иерархию,
доступность, responsive и визуальную целостность.

Простой сайт должен иметь простой UI-код.
Сложность разрешена только там,
где она решает реальную пользовательскую задачу.
```
