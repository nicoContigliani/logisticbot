import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['es', 'en'] as const;
type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('logisticbot-lang')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await getLocale();
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
