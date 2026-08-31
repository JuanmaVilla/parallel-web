import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalData, LegalPage } from "@/components/legal/LegalPage";
import { legal } from "@/lib/legal";
import { social } from "@/lib/site-nav";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(
  props: PageProps<"/[locale]/aviso-legal">,
): Promise<Metadata> {
  const { locale } = await props.params;
  return pageMetadata({ locale, href: "/aviso-legal", key: "legalNotice" });
}

/**
 * Aviso legal.
 *
 * Quien es el titular del sitio, que se puede hacer con lo que hay publicado
 * y bajo que ley se resuelve un conflicto. Los datos duros salen de
 * lib/legal.ts, que es donde hay que completarlos antes de publicar.
 */
export default async function LegalNoticePage({
  params,
}: PageProps<"/[locale]/aviso-legal">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "legal.notice" });

  return (
    <LegalPage
      namespace="legal.notice"
      afterIntro={
        <LegalData
          rows={[
            { label: t("data.owner"), value: legal.owner },
            { label: t("data.brand"), value: legal.brand },
            { label: t("data.taxId"), value: legal.taxId },
            { label: t("data.address"), value: legal.address },
            { label: t("data.email"), value: social.email.address },
          ]}
        />
      }
    />
  );
}
