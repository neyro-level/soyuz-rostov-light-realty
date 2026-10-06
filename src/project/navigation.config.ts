export type NavGroupConfig = {
  title: string;
  pageKeys: string[];
  includeNoindex?: boolean;
};

export const navigation = {
  ctaLabel: "Подобрать вариант",
  ctaPageKey: "contacts",
  labels: {
    catNovostroyki: "Новостройки",
    catKvartiry: "Квартиры",
    facetVtorichka: "Вторичная недвижимость",
    developers: "Застройщики",
    ipoteka: "Ипотека",
    yurist: "Юрист по недвижимости",
    about: "О компании",
    contacts: "Контакты",
    vacancies: "Вакансии",
    privacy: "Политика ПДн",
    consent: "Согласие на обработку ПДн",
    search: "Поиск",
    favorites: "Избранное",
  } as Record<string, string>,
  header: [
    {
      title: "Недвижимость",
      pageKeys: [
        "catNovostroyki",
        "catKvartiry",
        "facetVtorichka",
        "developers",
      ],
    },
    { title: "Услуги", pageKeys: ["ipoteka", "yurist"] },
    {
      title: "Компания",
      pageKeys: ["about", "contacts", "vacancies"],
    },
  ] satisfies NavGroupConfig[],
  footer: [
    {
      title: "Недвижимость",
      pageKeys: [
        "catNovostroyki",
        "catKvartiry",
        "facetVtorichka",
        "developers",
      ],
    },
    { title: "Услуги", pageKeys: ["ipoteka", "yurist"] },
    {
      title: "Компания",
      pageKeys: ["about", "contacts", "vacancies"],
    },
    {
      title: "Документы",
      pageKeys: ["privacy", "consent"],
      includeNoindex: true,
    },
  ] satisfies NavGroupConfig[],
};
