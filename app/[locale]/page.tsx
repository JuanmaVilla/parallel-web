import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { ScrollStack } from "@/components/home/ScrollStack";
import { ServiceCards } from "@/components/home/ServiceCards";
import { AboutUs } from "@/components/home/AboutUs";
import { DiscScene } from "@/components/home/DiscScene";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { CtaBand } from "@/components/ui/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteSchema } from "@/lib/schema";

/**
 * Home del sitio.
 *
 * No es la landing. La landing (app/[locale]/landing-page) cuenta todo en una
 * sola pagina porque llega gente desde un aviso y no va a navegar; el home es
 * la puerta de un sitio de cuatro paginas y su trabajo es otro: mostrar de
 * que se trata y repartir hacia donde corresponda.
 *
 * De ahi lo que hay y lo que no. Estan los tres momentos grandes —el hero, el
 * disco y el antes/despues— porque son lo que convence de que el estudio
 * suena; no estan la tabla de precios, el proceso ni las preguntas, que son
 * lo que se lee cuando ya se decidio mirar en serio y viven en /servicios y
 * /contacto.
 *
 * El orden alterna escena y bloque quieto: hero, texto apilado y tarjetas son
 * escenas dirigidas por scroll —las tres primeras van juntas porque el texto
 * apilado releva al hero por diseno y las tarjetas le ponen nombre a los
 * servicios que ese texto deliberadamente no nombra—, y a partir de ahi cada
 * escena tiene su bloque quieto al lado: nosotros, el disco, el
 * antes/despues. Dos escenas seguidas mas abajo se anularian.
 *
 * Nosotros va antes del disco y no despues de la prueba: es lo que separa las
 * tarjetas de la escena siguiente, y ademas presenta a quien hace el trabajo
 * justo antes de mostrarlo.
 *
 * Cada seccion termina apuntando a una ruta, no a un ancla — salvo el
 * antes/despues, que esta en esta misma pagina. El home no resuelve, deriva.
 */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const meta = await getTranslations({ locale, namespace: "meta" });

  // Solo la organizacion y el WebSite. El catalogo de servicios y las
  // preguntas los declara /servicios, que es donde se ven.
  const schema = siteSchema({ locale, description: meta("description") });

  return (
    <>
      <JsonLd data={schema} />
      {/* "Ver paquetes" sale del home —la tabla vive en /servicios—, pero
          "escucha una muestra" se queda: el antes/despues esta en esta misma
          pagina y mandarlo a otra ruta seria un rodeo. */}
      <Hero ctaPrimaryHref="/servicios" />
      <ScrollStack />
      <ServiceCards />
      {/* Recortado: el bloque entero es la apertura de /nosotros, y verlo
          identico en las dos paginas deja al enlace sin nada que prometer. */}
      <AboutUs variant="teaser" ctaHref="/nosotros" />
      {/* El "escucha una muestra" sigue siendo un ancla: el antes/despues
          esta en esta misma pagina, tres bloques mas abajo. El de precios si
          sale del home — la tabla vive en /servicios. */}
      <DiscScene priceCtaHref="/servicios" />
      <BeforeAfter />
      {/* En negro: BeforeAfter ya va en superficie. */}
      <CtaBand tone="bg" />
    </>
  );
}
