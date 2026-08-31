import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { LeadForm } from "@/components/contact/LeadForm";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { Faq } from "@/components/home/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema, type FaqItem } from "@/lib/schema";
import { pageMetadata } from "@/lib/page-metadata";
import { routeUrl } from "@/lib/seo";

export async function generateMetadata(
  props: PageProps<"/[locale]/contacto">,
): Promise<Metadata> {
  const { locale } = await props.params;
  return pageMetadata({ locale, href: "/contacto", key: "contact" });
}

/**
 * Contacto.
 *
 * La unica pagina del sitio sin banda de cierre: la accion ya esta en la
 * pantalla, y una banda que invita a "escribinos" abajo de un formulario de
 * contacto es ruido.
 *
 * Formulario a la izquierda y canales a la derecha, no al reves: el
 * formulario es la via recomendada porque llega con el tema descrito, y en
 * mobile —donde la grilla se apila— lo primero que aparece tiene que ser eso.
 *
 * Las preguntas frecuentes viven aca y en ningun otro lado del sitio. Su
 * encabezado es "antes de escribirnos": es el bloque que evita el mensaje de
 * una linea preguntando algo ya respondido, y solo funciona pegado al
 * formulario. Por eso el FAQPage del schema tambien se emite aca.
 */
export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contacto">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, home] = await Promise.all([
    getTranslations({ locale, namespace: "pages.contact" }),
    getTranslations({ locale, namespace: "home" }),
  ]);

  const schema = faqSchema({
    locale,
    pageUrl: routeUrl(locale, "/contacto"),
    faqItems: home.raw("faq.items") as FaqItem[],
  });

  return (
    <>
      <JsonLd data={schema} />

      <PageHero
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        headingAccent={t("headingAccent")}
        subhead={t("subhead")}
      />

      <Section tone="bg">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
          <LeadForm source="contacto" />
          <ContactChannels />
        </div>
      </Section>

      <Faq />
    </>
  );
}
