import { site as altSite } from "../../fixtures/fixture-alt/project/site.config";
import { isAltFixture } from "./data.config";

export const primarySite = {
  brand: "Союз Застройщиков",
  legalName: "Индивидуальный предприниматель Мормуль Екатерина Владимировна",
  inn: "940400159853",
  director: "Мормуль Екатерина Владимировна",
  phoneDisplay: "+7 (988) 555-20-27",
  phoneTel: "+79885552027",
  email: "szrostov-promo@yandex.com",
  address: "г. Ростов-на-Дону, переулок Доломановский, 19, 1 этаж, офис 1",
  hoursDisplay: "Ежедневно 9:00–18:00",
  hoursSchema: "Mo-Su 09:00-18:00",
  siteUrl: "https://souz-home.ru",
} as const;

export const site = isAltFixture() ? altSite : primarySite;
