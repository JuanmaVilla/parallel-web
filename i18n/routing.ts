import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  // Prefijo siempre visible: /es/... y /en/...
  // Evita ambiguedad en campanas pagas, donde la URL se comparte tal cual.
  localePrefix: "always",

  // Apaga el header `Link` con los hreflang que next-intl manda por defecto.
  //
  // No es que sobre: es que se contradecia. El header declaraba el x-default
  // apuntando a "/", que responde 307, y el `alternates` de
  // app/[locale]/layout.tsx lo declara en /es, que responde 200. Dos
  // versiones distintas del mismo dato es peor que una sola.
  //
  // Gana el HTML porque es la forma documentada como primaria y la unica que
  // parsean Bing, los auditores y los crawlers sociales. Los hreflang salen
  // ahora de dos lugares que si coinciden: ese `alternates` y app/sitemap.ts.
  alternateLinks: false,

  // Rutas del sitio. La clave es el path INTERNO (el que se escribe en el
  // codigo y el que nombra la carpeta bajo app/[locale]/); el valor es el
  // path publico por idioma.
  //
  // Al agregar una hay que tocar CUATRO lugares: la carpeta en app/[locale]/,
  // esta tabla, las claves de `nav` en messages/*.json y la lista de
  // lib/site-nav.ts (que es de donde salen la barra y el pie).
  //
  // "/landing-page" es la landing de campana: una sola pagina con todo el
  // contenido, alcanzable por ancla. Vive aparte del sitio y por eso su path
  // no se traduce — la URL se pega tal cual en los avisos.
  pathnames: {
    "/": "/",
    "/servicios": { es: "/servicios", en: "/services" },
    "/nosotros": { es: "/nosotros", en: "/about" },
    "/contacto": { es: "/contacto", en: "/contact" },
    "/landing-page": "/landing-page",

    // Legales. No estan en la barra: cuelgan del pie, que es donde se las
    // busca. Ver `legalItems` en lib/site-nav.ts.
    "/aviso-legal": { es: "/aviso-legal", en: "/legal-notice" },
    "/privacidad": { es: "/privacidad", en: "/privacy" },
    "/cookies": { es: "/cookies", en: "/cookies" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathname = keyof typeof routing.pathnames;
