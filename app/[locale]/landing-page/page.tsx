import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { ChapterBreak } from "@/components/home/ChapterBreak";
import { ScrollStack } from "@/components/home/ScrollStack";
import { ServiceCards } from "@/components/home/ServiceCards";
import { AboutUs } from "@/components/home/AboutUs";
import { DiscScene } from "@/components/home/DiscScene";
import { SequenceSection } from "@/components/home/SequenceSection";
import { Services } from "@/components/home/Services";
import { WhyParallel } from "@/components/home/WhyParallel";
import { MixCraft } from "@/components/services/MixCraft";
import { MasteringDeep } from "@/components/services/MasteringDeep";
import { Process } from "@/components/home/Process";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { Faq } from "@/components/home/Faq";
import { LeadFormSection } from "@/components/home/LeadFormSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { homeSchema, type FaqItem, type ServiceItem } from "@/lib/schema";
import { pageMetadata } from "@/lib/page-metadata";
import { routeUrl } from "@/lib/seo";

export async function generateMetadata(
  props: PageProps<"/[locale]/landing-page">,
): Promise<Metadata> {
  const { locale } = await props.params;
  return pageMetadata({ locale, href: "/landing-page", key: "landing" });
}

/**
 * Landing de campana.
 *
 * Vive aparte del sitio, en /landing-page: es la pagina a la que llega el
 * click de un aviso. Cuenta todo de una sola vez —servicios, precios, prueba
 * y formulario— y no ofrece salidas: la barra superior le esconde la
 * navegacion (ver Header.tsx) y todos sus CTA son anclas de aca mismo
 * (#paquetes, #antes-despues, #contacto).
 *
 * Por eso duplica contenido con el sitio y esta bien que lo duplique. Lo que
 * en el sitio esta repartido en cuatro paginas —cada una con su momento de
 * lectura— aca tiene que caber en un solo scroll, porque el visitante de un
 * aviso no navega: baja o se va.
 *
 * El orden convence antes de pedir: servicios y diferencial primero, y el
 * formulario al final, que es la unica accion de la pagina.
 *
 * Reparto del presupuesto de espectaculo: tres momentos grandes — la sala
 * tipografica del hero, el disco y la secuencia de video — repartidos para
 * que nunca haya dos seguidos. Entre ellos, tipografia, ritmo de espaciado y
 * revelados discretos. Repartir el espectaculo por igual entre todas las
 * secciones produce ruido, no impacto.
 *
 * El texto apilado releva al hero de inmediato, sin banda de por medio, y con
 * su propio margen negativo tapa la cola del escenario sticky. La marquesina
 * gigante queda solo despues de la secuencia de video, donde si hace falta un
 * cambio de capitulo entre una escena a pantalla completa y los precios.
 */
export default async function LandingPage({
  params,
}: PageProps<"/[locale]/landing-page">) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Los datos estructurados salen de los mismos mensajes que pinta la
  // pagina, leidos en el locale activo: asi /en no emite el schema en
  // castellano y el precio del schema no puede irse del precio en pantalla.
  const [meta, home] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getTranslations({ locale, namespace: "home" }),
  ]);

  const schema = homeSchema({
    locale,
    pageUrl: routeUrl(locale, "/landing-page"),
    description: meta("description"),
    serviceItems: home.raw("services.items") as ServiceItem[],
    faqItems: home.raw("faq.items") as FaqItem[],
  });

  return (
    <>
      <JsonLd data={schema} />
      <Hero />
      <ScrollStack />
      {/* Variante de la seccion anterior, montada al lado para compararlas.
          Una de las dos se cae cuando este decidido. */}
      <ServiceCards />
      <AboutUs />
      <DiscScene />
      <SequenceSection />
      <ChapterBreak accent />
      <Services />
      <WhyParallel />
      {/* El detalle tecnico de cada servicio. Venian de la vieja pagina
          /servicios; al pasar a landing se montan aca, que es ahora la
          unica pagina indexable y la que necesita esa profundidad.
          Van despues de WhyParallel y no antes por el piso: Services y
          Process son surface, y estas dos alternan surface/bg entre
          ellas — en este hueco la alternancia cierra. */}
      <MixCraft />
      <MasteringDeep />
      <Process />
      <BeforeAfter />
      <Faq />
      <LeadFormSection />
    </>
  );
}
