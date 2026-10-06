/** H2 static routes: StarterPageShell block 2 until full content ships. */
export const H2_STATIC_PAGE_KEYS = [
  "ipoteka",
  "yurist",
  "about",
  "contacts",
  "vacancies",
] as const;

export type H2StaticPageKey = (typeof H2_STATIC_PAGE_KEYS)[number];

export function isH2StaticPageKey(pageKey: string): pageKey is H2StaticPageKey {
  return (H2_STATIC_PAGE_KEYS as readonly string[]).includes(pageKey);
}

/** Neutral starter copy — no rates, bank names, or vacancy listings. */
export const h2StarterBodies: Record<
  Exclude<H2StaticPageKey, "contacts">,
  string
> = {
  ipoteka:
    "Помогаем с подбором ипотечной программы и подготовкой документов. Оставьте заявку — уточним задачу и следующий шаг.",
  yurist:
    "Юридическое сопровождение сделок: проверка объекта и документов, договоры, регистрация. Напишите, чем помочь.",
  about:
    "Краткая информация о компании появится на этой странице. По вопросам подбора недвижимости — через контакты или заявку.",
  vacancies:
    "Раздел с актуальными вакансиями в подготовке. Для отклика свяжитесь с нами через контакты или форму заявки.",
};
