import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CtaBand } from "@/components/ui/CtaBand";
import { MixCraft } from "@/components/services/MixCraft";
import { MasteringDeep } from "@/components/services/MasteringDeep";
import { SequenceSection } from "@/components/home/SequenceSection";
import { ChapterBreak } from "@/components/home/ChapterBreak";
import { Services } from "@/components/home/Services";
import { Process } from "@/components/home/Process";
import { JsonLd } from "@/components/seo/JsonLd";
import { servicesSchema, type ServiceItem } from "@/lib/schema";
import { pageMetadata } from "@/lib/page-metadata";
import { routeUrl } from "@/lib/seo";

export async function generateMetadata(
  props: PageProps<"/[locale]/servicios">,
): Promise<Metadata> {
  const { locale } = await props.params;
  return pageMetadata({ locale, href: "/servicios", key: "services" });
}

/**
 * Servicios y precios.
 *
 * Es la pagina que se lee decidiendo, y el orden va de que se hace a cuanto
 * sale: el detalle de la mezcla y del mastering primero, los tres paquetes
 * despues. Con el precio arriba de todo, la tabla se lee sin saber que
 * compara.
 *
 * Entre el detalle tecnico y los precios van la secuencia de video y la
 * marquesina, en ese orden y juntas. No es decoracion: la secuencia termina
 * a pantalla completa y la grilla de precios empieza en una caja de texto,
 * asi que sin la palabra gigante de por medio el corte es seco. Es el mismo
 * par que usa la landing, y ahi esta explicado — ver SequenceSection.tsx.
 *
 * El proceso cierra, despues del precio y no antes: "cuanto tarda" y "que
 * pasa si no me gusta" son preguntas que aparecen recien cuando el numero ya
 * se vio.
 *
 * Las preguntas frecuentes NO estan aca. Su encabezado es "antes de
 * escribirnos", que es literalmente la pantalla anterior al formulario:
 * viven en /contacto, y una sola vez.
 *
 * El ancla #paquetes la deja `Services`: es el destino de los CTA de precios
 * del home y de la landing.
 */
export default async function ServicesPage({
  params,
}: PageProps<"/[locale]/servicios">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [hero, home] = await Promise.all([
    getTranslations({ locale, namespace: "pages.services" }),
    getTranslations({ locale, namespace: "home" }),
  ]);

  // Los datos estructurados salen de los mismos mensajes que pinta la
  // pagina, leidos en el locale activo: asi /en no emite el schema en
  // castellano y el precio del schema no puede irse del precio en pantalla.
  const schema = servicesSchema({
    pageUrl: routeUrl(locale, "/servicios"),
    serviceItems: home.raw("services.items") as ServiceItem[],
  });

  return (
    <>
      <JsonLd data={schema} />

      <PageHero
        eyebrow={hero("eyebrow")}
        heading={hero("heading")}
        headingAccent={hero("headingAccent")}
        subhead={hero("subhead")}
      >
        {/* Neutral los dos: el degradado del titular ya es el elemento de
            marca de esta pantalla (MARCA.md §3). */}
        <ButtonLink href="#paquetes" variant="inverse">
          {hero("ctaPrimary")}
        </ButtonLink>
        <ButtonLink href="/contacto" variant="secondary">
          {hero("ctaSecondary")}
        </ButtonLink>
      </PageHero>

      <MixCraft />
      <MasteringDeep />
      <SequenceSection />
      <ChapterBreak accent />
      <Services />
      {/* En negro: Services ya va en superficie y dos pisos iguales seguidos
          borran el limite entre las dos secciones. */}
      <Process ctaHref="/contacto" tone="bg" />
      <CtaBand namespace="pages.services.cta" secondaryHref="/nosotros" />
    </>
  );
}
