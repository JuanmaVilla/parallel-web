import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/Section";
import { LeadForm } from "@/components/contact/LeadForm";

/**
 * El formulario. Es el unico destino de conversion de la landing: todos los
 * CTA de la pagina apuntan al ancla #contacto de esta seccion.
 *
 * Cierra la pagina. El cambio de piso desde Faq(surface) ya la separa sin
 * necesitar una linea.
 */
export function LeadFormSection() {
  const t = useTranslations("home.leadForm");

  return (
    <Section id="contacto" tone="bg">
      <SectionHeader
        align="center"
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        headingAccent={t("headingAccent")}
        subhead={t("subhead")}
      />
      <LeadForm source="home" className="mx-auto mt-12 max-w-[640px]" />
    </Section>
  );
}
