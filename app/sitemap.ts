import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { routeUrl } from "@/lib/seo";
import { indexablePaths } from "@/lib/site-nav";

/**
 * sitemap.xml
 *
 * Se genera recorriendo `indexablePaths` x `routing.locales`, no a mano:
 * agregar un idioma o una ruta lo suma aca sin tocar este archivo, y no puede
 * quedar desincronizado del router.
 *
 * Los paths estan traducidos por idioma (i18n/routing.ts), asi que las URLs
 * salen de `routeUrl` y no de concatenar: /en/services, no /en/servicios.
 *
 * Cada entrada declara sus alternates: Next los emite como
 * `<xhtml:link rel="alternate" hreflang>`, que es la mitad del hreflang del
 * sitio. La otra mitad son las etiquetas en el HTML, que las ponen el
 * `alternates` de app/[locale]/layout.tsx y el de cada pagina interna.
 *
 * `x-default` apunta al defaultLocale y no a "/", que responde 307: el
 * destino de un x-default tiene que devolver 200.
 *
 * Sin `changeFrequency` ni `priority` a proposito: Google los ignora desde
 * hace anios y solo agregan ruido al archivo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Fecha del build. El contenido es estatico y se regenera con cada deploy,
  // asi que el momento del build es la ultima modificacion real.
  const lastModified = new Date();

  return indexablePaths.flatMap((href) => {
    const languages: Record<string, string> = Object.fromEntries(
      routing.locales.map((locale) => [locale, routeUrl(locale, href)]),
    );
    languages["x-default"] = routeUrl(routing.defaultLocale, href);

    return routing.locales.map((locale) => ({
      url: routeUrl(locale, href),
      lastModified,
      alternates: { languages },
    }));
  });
}
