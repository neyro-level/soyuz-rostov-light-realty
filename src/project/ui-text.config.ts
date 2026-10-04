import { site } from "./site.config";

export const uiText = {
  form: {
    nameLabel: "Имя",
    phoneLabel: "Телефон",
    consentLabel: "Согласен на обработку",
    consentLinkLabel: "ПДн",
    submitLabel: "Отправить",
    retryMessage: "Не удалось отправить. Повторите.",
    transportDisabledMessage:
      "Приём заявок временно недоступен. Позвоните по телефону на сайте.",
  },
  analytics: {
    acceptLabel: "Разрешить",
    declineLabel: "Отклонить",
    prompt: "Сбор статистики только после согласия.",
  },
  notFoundFallback: "Страница не найдена",
  innLabel: "ИНН",
};

export function legalLine(): string {
  return `${site.legalName}, ${uiText.innLabel} ${site.inn}, ${site.address}, ${site.phoneDisplay}, ${site.email}, ${site.hoursDisplay}`;
}

export function copyrightLine(year: number): string {
  return `© ${year} ${site.brand}`;
}
