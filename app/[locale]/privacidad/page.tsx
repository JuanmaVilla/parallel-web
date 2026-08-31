import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal/LegalPage";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(
  props: PageProps<"/[locale]/privacidad">,
): Promise<Metadata> {
  const { locale } = await props.params;
  return pageMetadata({ locale, href: "/privacidad", key: "privacy" });
}

/**
 * Politica de privacidad.
 *
 * Describe lo que el sitio hace HOY con los datos: el formulario de contacto
 * y los archivos que se mandan por los canales directos. Si algun dia se
 * suma analitica, un CRM o un newsletter, este texto deja de ser cierto
 * hasta que se actualice — y la fecha de lib/legal.ts con el.
 */
export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacidad">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LegalPage namespace="legal.privacy" />;
}
