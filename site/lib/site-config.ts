export const siteConfig = {
  name: "Planovo",
  url: "https://planovo.pro",
  description:
    "Planovo помогает учебной части собирать, проверять и публиковать расписание, а преподавателям и учащимся — видеть утверждённую версию.",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
