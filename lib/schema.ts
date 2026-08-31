/**
 * Datos estructurados (JSON-LD) — Parallel Studios
 *
 * Constructores puros: reciben los textos ya traducidos y devuelven objetos.
 * Los emite components/seo/JsonLd.tsx. Como la home es SSG, el JSON-LD queda
 * horneado en el HTML estatico y no cuesta nada en runtime.
 *
 * Todo sale de messages/*.json, que ya es la fuente de verdad del copy: no
 * se duplica ningun dato aca. Si cambia un precio en los mensajes, cambia
 * solo en el schema.
 *
 * Se emite un unico <script> con @graph en vez de varios sueltos, para que
 * las referencias por @id resuelvan entre entidades.
 *
 * Doc: https://schema.org · validar en Rich Results Test antes de publicar.
 */
import { siteUrl, localeUrl } from "./seo";
import { social } from "./site-nav";

/** Item de `home.services.items` en messages/*.json. */
export type ServiceItem = {
  heading: string;
  body: string;
  price?: string;
  priceAlt?: string;
};

/** Item de `home.faq.items` en messages/*.json. */
export type FaqItem = { question: string; answer: string };

/**
 * Saca el importe en pesos de los strings de precio.
 *
 * Hay que mirar los dos campos porque los locales los tienen invertidos:
 * en es.json `price` es "$15.000 ARS" y `priceAlt` "USD 15"; en en.json es
 * al reves, "USD 15" y "ARS 15,000". Tambien cambia el separador de miles
 * (punto contra coma), asi que se descartan todos los no-digitos.
 *
 * Si no encuentra un importe en ARS devuelve undefined y el Offer se omite
 * entero. Un precio inventado o a medias es peor que no declarar precio:
 * schema invalido puede costar la elegibilidad de todo el bloque.
 */
function parseArs(...candidates: Array<string | undefined>): number | undefined {
  for (const value of candidates) {
    if (!value || !/ARS/i.test(value)) continue;
    const digits = value.replace(/\D/g, "");
    if (digits) return Number(digits);
  }
  return undefined;
}

const organizationId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;

/** Argentina. Lo comparten la organizacion y cada servicio. */
const areaServed = { "@type": "Country", name: "AR" } as const;

/**
 * La organizacion.
 *
 * `ProfessionalService` ya es un subtipo de `LocalBusiness` en schema.org, asi
 * que no hace falta cambiar el @type para dar senal local: alcanza con
 * completarle los campos. La ciudad es el primero que existe.
 *
 * PENDIENTE — faltan `streetAddress`, `postalCode`, `geo`, `telephone` y
 * `email`. Sin telefono y direccion completa esto no puede reclamar una
 * ficha en el mapa; la ciudad sola ya sirve para las busquedas del tipo
 * "estudio de mastering en Buenos Aires", que es de donde sale la mayoria
 * de las consultas. En cuanto haya el resto, se agrega aca.
 */
function organization(locale: string, description: string) {
  return {
    // ProfessionalService cubre el negocio; MusicGroup lo ubica en el
    // dominio musical, que es como lo buscan.
    "@type": ["ProfessionalService", "MusicGroup"],
    "@id": organizationId,
    name: "Parallel Studios",
    url: localeUrl(locale),
    logo: `${siteUrl}/marca/isologotipo.png`,
    image: `${siteUrl}/marca/isologotipo.png`,
    description,
    sameAs: [social.instagram.href],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Buenos Aires",
      addressCountry: "AR",
    },
    // Donde atienden, que no es lo mismo que donde estan: el estudio trabaja
    // a distancia y el copy menciona clientes del exterior.
    areaServed,
    priceRange: "$$",
    currenciesAccepted: "ARS",
  };
}

function website(locale: string) {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: "Parallel Studios",
    inLanguage: locale,
    publisher: { "@id": organizationId },
  };
}

/**
 * Un Service por paquete, con su precio de entrada.
 *
 * Los precios son "desde", asi que van con `minPrice` dentro de un
 * `UnitPriceSpecification` y NUNCA con `price` a secas: `price` afirma un
 * importe fijo, que no es lo que ofrece el estudio, y un rango o un "desde"
 * metido en `price` es invalido y falla en Rich Results.
 *
 * Se declara solo el precio en pesos. El valor en dolares que aparece en la
 * pagina es, segun el propio copy, un "equivalente" para clientes del
 * exterior: una conversion de referencia, no una segunda lista de precios.
 * El importe real que cobra el estudio es el de ARS, y es el que se declara.
 */
function services(pageUrl: string, items: ServiceItem[]) {
  return items.map((item, i) => {
    const minPrice = parseArs(item.price, item.priceAlt);

    return {
      "@type": "Service",
      "@id": `${pageUrl}#service-${i + 1}`,
      name: item.heading,
      serviceType: item.heading,
      description: item.body,
      provider: { "@id": organizationId },
      areaServed,
      ...(minPrice
        ? {
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/InStock",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                priceCurrency: "ARS",
                minPrice,
              },
            },
          }
        : {}),
    };
  });
}

/**
 * Las preguntas frecuentes de la home.
 *
 * Aclaracion de expectativas: desde 2023 Google restringio el rich result de
 * FAQ a sitios de gobierno y salud, asi que esto NO va a dibujar el
 * acordeon en la SERP. Se emite igual porque sigue siendo la forma que
 * mejor leen los sistemas de respuesta —AI Overviews, ChatGPT, Perplexity—
 * para citar una respuesta concreta, que es donde el estudio tiene algo
 * que ganar.
 */
function faqPage(locale: string, pageUrl: string, items: FaqItem[]) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    inLanguage: locale,
    isPartOf: { "@id": websiteId },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * El grafo entero en un solo script: la organizacion, el sitio, los servicios
 * y las preguntas.
 *
 * Lo emite /landing-page, que es la unica pagina que muestra todo eso junto.
 * El sitio multipagina lo reparte entre `siteSchema` (home) y
 * `servicesSchema` (/servicios), porque cada pagina solo puede declarar lo
 * que efectivamente se ve en ella.
 */
export function homeSchema({
  locale,
  pageUrl,
  description,
  serviceItems,
  faqItems,
}: {
  locale: string;
  /** URL absoluta de la pagina que emite el schema. Ancla los @id. */
  pageUrl: string;
  description: string;
  serviceItems: ServiceItem[];
  faqItems: FaqItem[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(locale, description),
      website(locale),
      ...services(pageUrl, serviceItems),
      faqPage(locale, pageUrl, faqItems),
    ],
  };
}

/**
 * El sitio, sin contenido de pagina: la organizacion y el WebSite.
 *
 * Es lo que emite el home multipagina. El detalle de servicios y las
 * preguntas ya no viven ahi —se fueron a /servicios— y declarar en el home
 * un catalogo que el home no muestra es exactamente el tipo de desajuste
 * entre schema y contenido visible que Google penaliza.
 */
export function siteSchema({
  locale,
  description,
}: {
  locale: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [organization(locale, description), website(locale)],
  };
}

/**
 * La pagina de servicios: un Service por paquete.
 *
 * Los @id se anclan a la URL de ESTA pagina y no a la del home, que es donde
 * los anclaba `homeSchema`. Un @id es una identidad, y dos entidades
 * distintas con el mismo @id colisionan en el grafo.
 *
 * Sin FAQPage: las preguntas se muestran en /contacto y el schema tiene que
 * declarar lo que la pagina efectivamente pinta. Ver `faqSchema`.
 */
export function servicesSchema({
  pageUrl,
  serviceItems,
}: {
  /** URL absoluta de la pagina que emite el schema. */
  pageUrl: string;
  serviceItems: ServiceItem[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": services(pageUrl, serviceItems),
  };
}

/**
 * Las preguntas frecuentes, donde se ven: /contacto.
 */
export function faqSchema({
  locale,
  pageUrl,
  faqItems,
}: {
  locale: string;
  /** URL absoluta de la pagina que emite el schema. */
  pageUrl: string;
  faqItems: FaqItem[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [faqPage(locale, pageUrl, faqItems)],
  };
}
