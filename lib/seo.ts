import { hasLocale } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale, type Pathname } from "@/i18n/routing";

/**
 * URL publica del sitio — Parallel Studios
 *
 * Unico lugar del codigo donde vive el dominio. Lo leen `app/robots.ts`,
 * `app/sitemap.ts` y el `metadataBase` de `app/[locale]/layout.tsx`; de ahi
 * salen el canonical, los hreflang y la URL absoluta de la imagen OG.
 *
 * Todavia no hay dominio de produccion decidido, asi que cae en localhost.
 * Al desplegar hay que definir `NEXT_PUBLIC_SITE_URL` en el entorno — en
 * Vercel, Settings > Environment Variables — y no hace falta tocar ningun
 * archivo. La barra final sobra: se recorta aca.
 *
 * IMPORTANTE: robots.txt y sitemap.xml se prerenderizan, asi que este valor
 * queda horneado en el BUILD, no se lee en cada request. La variable tiene
 * que existir cuando corre `next build`; definirla despues no cambia nada
 * hasta el proximo deploy.
 *
 * Con el fallback puesto, un build sin la variable NO rompe: publica un
 * sitemap y un canonical que apuntan a localhost. Es deliberado —falla
 * visible en vez de silenciosa— pero significa que desplegar sin definirla
 * deja el sitio mal canonicalizado.
 *
 * La variable va con prefijo NEXT_PUBLIC porque el valor no es secreto y asi
 * resuelve igual en cualquier contexto de render.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Path relativo de la home de un locale: "/es", "/en".
 *
 * Para los campos de `metadata`, que se resuelven contra `metadataBase` y
 * por eso van relativos.
 */
export function localePath(locale: string) {
  return `/${locale}`;
}

/**
 * URL absoluta de la home de un locale.
 *
 * Para el sitemap, que exige URLs absolutas.
 */
export function localeUrl(locale: string) {
  return `${siteUrl}${localePath(locale)}`;
}

/**
 * Codigo de `og:locale`, que NO es el mismo formato que el locale del router.
 *
 * Open Graph pide `idioma_TERRITORIO` (es_AR), no el codigo de idioma suelto
 * (es) que usan las rutas y el atributo lang. Facebook y WhatsApp ignoran el
 * valor si no matchea ese formato.
 *
 * es -> es_AR porque el estudio cobra en pesos y escribe en rioplatense.
 * en -> en_US como variante mas neutra para el publico del exterior.
 */
const OG_LOCALES: Record<string, string> = {
  es: "es_AR",
  en: "en_US",
};

export function ogLocale(locale: string) {
  return OG_LOCALES[locale] ?? locale;
}

/**
 * Path publico de una ruta interna en un idioma: routePath("en", "/servicios")
 * devuelve "/en/services".
 *
 * Es la unica forma correcta de armar una URL del sitio fuera de un `<Link>`:
 * los paths estan traducidos por idioma en i18n/routing.ts, asi que
 * concatenar el locale con la ruta interna a mano genera URLs que no existen.
 */
export function routePath(locale: string, href: Pathname) {
  return getPathname({ locale: asLocale(locale), href });
}

/**
 * Estrecha el locale que llega de los params de ruta —que Next tipa como
 * `string`— al union del router.
 *
 * El proxy solo deja pasar locales validos y el layout hace notFound() con
 * cualquier otro, asi que en la practica el fallback no se usa. Esta igual
 * porque `generateMetadata` corre ANTES que el layout: sin el, un valor
 * invalido reventaria armando la metadata en vez de devolver un 404 limpio.
 */
function asLocale(locale: string): Locale {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

/** URL absoluta de una ruta interna. Para el sitemap, que las exige. */
export function routeUrl(locale: string, href: Pathname) {
  return `${siteUrl}${routePath(locale, href)}`;
}

/**
 * Los hreflang de una ruta: un path por idioma, mas el x-default.
 *
 * Va apuntado al defaultLocale y no a "/", que responde 307: el destino de
 * un x-default devuelve 200.
 */
export function languageAlternates(href: Pathname) {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [locale, routePath(locale, href)]),
  );
  languages["x-default"] = routePath(routing.defaultLocale, href);
  return languages;
}
