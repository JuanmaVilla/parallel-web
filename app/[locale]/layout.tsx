import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { neutral } from "@/lib/brand";
import { localePath, ogLocale, siteUrl } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import "../globals.css";

/** Primer elemento enfocable de la pagina. Salta la navegacion repetida. */
function SkipLink() {
  const t = useTranslations("nav");
  return (
    <a href="#main" className="pl-skip-link">
      {t("skipToContent")}
    </a>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  // Nunca deshabilitar el zoom: rompe accesibilidad.
  width: "device-width",
  initialScale: 1,
  themeColor: neutral.bg,
};

/**
 * Metadata del sitio.
 *
 * Es la unica `generateMetadata` del arbol, y conviene que siga siendolo: la
 * metadata se mergea SHALLOW entre segmentos, asi que una pagina hija que
 * declare `openGraph` o `alternates` reemplaza el objeto entero y se lleva
 * puestos `siteName`, `type` y los `languages` de aca. Si algun dia vuelve
 * una ruta interna, tiene que repetir el objeto completo, no solo el campo
 * que cambia.
 */
export async function generateMetadata(
  props: Omit<LayoutProps<"/[locale]">, "children">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "meta" });

  // Todos los locales, mas el x-default. Va apuntado a /es —el defaultLocale—
  // y no a "/", que responde 307: el destino de un x-default devuelve 200.
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, localePath(l)]),
  );
  languages["x-default"] = localePath(routing.defaultLocale);

  return {
    // Sin esto no se emite og:url y cualquier ruta relativa de imagen no
    // resuelve a absoluta, que es lo que exigen los crawlers sociales.
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      template: `%s — Parallel Studios`,
    },
    description: t("description"),
    // next-intl ya manda los hreflang en el header HTTP `Link`. Google los
    // lee ahi, pero la forma en el HTML es la documentada como primaria y es
    // la que parsean Bing, los auditores y los crawlers sociales.
    alternates: {
      canonical: localePath(locale),
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Parallel Studios",
      url: localePath(locale),
      // Open Graph pide idioma_TERRITORIO, no el codigo suelto del router.
      locale: ogLocale(locale),
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map(ogLocale),
      type: "website",
    },
    twitter: {
      // Sube a la tarjeta grande. La imagen la pone app/[locale]/
      // opengraph-image.tsx, que Next enlaza sola en og: y twitter:.
      card: "summary_large_image",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Habilita render estatico de las rutas hijas.
  setRequestLocale(locale);

  return (
    // data-scroll-behavior="smooth" es necesario en Next 16 para que el
    // framework siga pisando el scroll suave durante las transiciones de
    // ruta. Sin esto, cambiar de pestana hace un scroll animado al tope.
    <html lang={locale} data-scroll-behavior="smooth">
      <head>
        {/* Proxima Nova se sirve desde Adobe Fonts y no se puede self-hostear
            (EULA de Typekit). El kit debe cargar antes que los tokens. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/mei2qho.css" />
        <link
          rel="preload"
          href="/fonts/Lastica-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        {/* Los bloques con revelado arrancan en opacity 0 y las palabras de
            los titulares escondidas detras de su mascara. Los enciende JS, asi
            que sin JS la pagina quedaria en blanco: esto los deja visibles de
            entrada en ese caso. */}
        <noscript>
          <style>{`[data-reveal],[data-reveal-stagger]>*,.pl-split__word>span,.pl-stack__item,.pl-stack__line{opacity:1!important;transform:none!important}.pl-stack__lines{display:flex!important;flex-direction:column;gap:var(--pl-space-3)}.pl-stack__line{max-width:none}.pl-punch{color:var(--pl-orange)!important;text-shadow:var(--pl-glow-punch)}.pl-punch__bolt{width:62%}`}</style>
        </noscript>
      </head>
      <body className="pl-grain bg-bg font-sans text-ink-body antialiased">
        <NextIntlClientProvider>
          <SkipLink />
          <Header />
          {/* min-h calculado contra el alto del header para que el pie no
              suba en las paginas cortas. */}
          <main id="main" className="min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-5rem)]">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
