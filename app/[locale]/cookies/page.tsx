import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalData, LegalPage } from "@/components/legal/LegalPage";
import { cookies } from "@/lib/legal";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(
  props: PageProps<"/[locale]/cookies">,
): Promise<Metadata> {
  const { locale } = await props.params;
  return pageMetadata({ locale, href: "/cookies", key: "cookies" });
}

/**
 * Politica de cookies.
 *
 * El sitio instala una sola cookie y no tiene analitica ni publicidad, asi
 * que este documento es corto y no hay banner de consentimiento: no hay nada
 * que consentir mas alla de una cookie tecnica. La lista sale de
 * `cookies` en lib/legal.ts — si aparece una segunda, va ahi primero.
 */
export default async function CookiesPage({
  params,
}: PageProps<"/[locale]/cookies">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "legal.cookies" });

  return (
    <LegalPage
      namespace="legal.cookies"
      afterIntro={
        <div className="mt-10 flex flex-col gap-6">
          {cookies.map((cookie) => (
            <LegalData
              key={cookie.name}
              rows={[
                { label: t("table.name"), value: cookie.name },
                {
                  label: t("table.owner"),
                  value: t(`table.${cookie.key}.owner`),
                },
                {
                  label: t("table.purpose"),
                  value: t(`table.${cookie.key}.purpose`),
                },
                {
                  label: t("table.duration"),
                  value: t(`table.${cookie.key}.duration`),
                },
              ]}
            />
          ))}
        </div>
      }
    />
  );
}
