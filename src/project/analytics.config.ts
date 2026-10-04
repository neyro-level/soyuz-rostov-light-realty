import { env } from "../platform/env";

export const analytics = {
  provider: "yandex-metrika" as const,
  counterId: env.ANALYTICS_METRIKA_ID ?? "",
  origins: ["https://mc.yandex.ru", "https://mc.yandex.com"],
};
