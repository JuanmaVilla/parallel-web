import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CtaBand } from "@/components/ui/CtaBand";
import { AboutUs } from "@/components/home/AboutUs";
import { WhyParallel } from "@/components/home/WhyParallel";
import { ChapterBreak } from "@/components/home/ChapterBreak";
import { Team } from "@/components/about/Team";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(
  props: PageProps<"/[locale]/nosotros">,
): Promise<Metadata> {
  const { locale } = await props.params;
  return pageMetadata({ locale, href: "/nosotros", key: "about" });
}

/**
 * Nosotros.
 *
 * Tres respuestas: quienes somos (AboutUs), por que trabajar con nosotros
 * (WhyParallel) y con quien vas a hablar (Team).
 *
 * El equipo va al final y no en el medio. Las caras y los nombres son lo
 * ultimo que se ve antes del "escribinos" de la banda de cierre, que es
 * donde mas sirven: se le escribe a alguien, no a un formulario. En el medio
 * quedaban tapadas entre dos bloques de argumento.
 *
 * La marquesina separa el argumento de las fichas: son dos bloques densos y
 * pegados se leen como uno solo larguisimo.
 *
 * AboutUs va entero aca y recortado en el home, que enlaza a esta pagina. La
 * pagina de destino tiene que tener algo que el adelanto no tenga.
 */
export default async function AboutPage({
  params,
}: PageProps<"/[locale]/nosotros">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "pages.about" });

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        headingAccent={t("headingAccent")}
        subhead={t("subhead")}
      >
        <ButtonLink href="/contacto" variant="inverse">
          {t("ctaPrimary")}
        </ButtonLink>
        <ButtonLink href="/servicios" variant="secondary">
          {t("ctaSecondary")}
        </ButtonLink>
      </PageHero>

      <AboutUs />
      <WhyParallel ctaHref="/contacto" />
      <ChapterBreak />
      <Team />
      <CtaBand namespace="pages.about.cta" />
    </>
  );
}
