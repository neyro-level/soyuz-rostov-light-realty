export const H5_UTILITY_PAGE_KEYS = [
  "thanks",
  "privacy",
  "consent",
  "search",
  "favorites",
] as const;

export type H5UtilityPageKey = (typeof H5_UTILITY_PAGE_KEYS)[number];

export function isH5UtilityPageKey(pageKey: string): pageKey is H5UtilityPageKey {
  return (H5_UTILITY_PAGE_KEYS as readonly string[]).includes(pageKey);
}

/** Starter block 2 — без выдуманных legal-текстов до утверждения владельца. */
export const h5UtilityBodies: Record<H5UtilityPageKey, string> = {
  thanks:
    "Мы получили заявку и свяжемся с вами в рабочее время. Если вопрос срочный — позвоните по телефону в шапке сайта.",
  privacy:
    "Полный текст политики обработки персональных данных публикуется перед production-release. Ниже — краткое описание из SEO-реестра.",
  consent:
    "Полный текст согласия на обработку персональных данных публикуется перед production-release.",
  search:
    "Введите запрос, чтобы найти объект в текущей выдаче каталога. Расширенный поиск — в следующих итерациях Freeze.",
  favorites:
    "Избранное хранится только в этом браузере. Добавляйте карточки с каталога — список появится здесь.",
};
