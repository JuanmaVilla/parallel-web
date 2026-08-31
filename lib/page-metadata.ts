import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing, type Pathname } from "@/i18n/routing";
import { languageAlternates, ogLocale, routePath, siteUrl } from "./seo";

/**
 * Metadata de una pagina interna — Parallel Studios
 *
 * Existe por una trampa del framework: la metadata se mergea SHALLOW entre
 * segmentos. Una pagina que declare solo `openGraph.title` reemplaza el
 * objeto `openGraph` ENTERO del layout y se lleva puestos `siteName`, `type`
 * y los `alternateLocale`. Lo mismo con `alternates` y los hreflang.
 *
 * Asi que cada pagina tiene que repetir los objetos completos. Repetirlos a
 * mano en cuatro archivos es garantia de que se desincronicen: se arman aca,
 * una sola vez, y cada pagina pasa su ruta y su namespace de textos.
 *
 * Los textos salen de `meta.pages.<key>` en messages/*.json — el title y la
 * description de cada pagina son copy, no codigo.
 */
export async function pageMetadata({
  locale,
  href,
  key,
}: {
  /** El de los params de ruta. Next lo tipa `string`. */
  locale: string;
  /** Ruta INTERNA de la pagina. De aca salen el canonical y los hreflang. */
  href: Pathname;
  /** Clave bajo `meta.pages` en messages/*.json. */
  key: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta.pages" });
  const title = t(`${key}.title`);
  const description = t(`${key}.description`);
  const path = routePath(locale, href);

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: languageAlternates(href),
    },
    openGraph: {
      // El title de openGraph no hereda el `template` del layout: si no se
      // repite el nombre del estudio, la tarjeta social sale sin marca.
      title: `${title} — Parallel Studios`,
      description,
      siteName: "Parallel Studios",
      url: path,
      locale: ogLocale(locale),
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map(ogLocale),
      type: "website",
    },
    twitter: { card: "summary_large_image" },
    metadataBase: new URL(siteUrl),
  };
}
