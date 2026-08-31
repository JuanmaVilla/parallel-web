import type { Pathname } from "@/i18n/routing";

/**
 * Navegacion del sitio — Parallel Studios
 *
 * Fuente unica de la barra superior, del pie y del sitemap. Cada entrada
 * declara la ruta interna y la clave de `nav` en messages/*.json donde vive
 * su rotulo: el orden de esta lista es el orden en pantalla.
 *
 * "/landing-page" NO esta aca a proposito. Es la landing de campana: se llega
 * por el link de un aviso, no navegando el sitio, y sumarla a la barra la
 * pondria a competir con el home por la misma consulta.
 */
export type NavItem = {
  href: Pathname;
  /** Clave bajo el namespace `nav` de messages/*.json. */
  key: "home" | "services" | "about" | "contact";
};

export type LegalItem = {
  href: Pathname;
  /** Clave bajo el namespace `nav.legal` de messages/*.json. */
  key: "notice" | "privacy" | "cookies";
};

export const navItems: NavItem[] = [
  { href: "/", key: "home" },
  { href: "/servicios", key: "services" },
  { href: "/nosotros", key: "about" },
  { href: "/contacto", key: "contact" },
];

/**
 * Las tres paginas legales. Van solo en el pie.
 *
 * Fuera de la barra a proposito: nadie llega al sitio buscando el aviso
 * legal, y sumarlas arriba le roba sitio a las cuatro rutas que si venden.
 * Al pie se las busca, y ahi estan.
 */
export const legalItems: LegalItem[] = [
  { href: "/aviso-legal", key: "notice" },
  { href: "/privacidad", key: "privacy" },
  { href: "/cookies", key: "cookies" },
];

/**
 * Rutas que entran al sitemap.
 *
 * La landing si entra: es una URL publica y con contenido propio. Lo que no
 * hace es aparecer en la navegacion.
 */
export const indexablePaths: Pathname[] = [
  "/",
  "/servicios",
  "/nosotros",
  "/contacto",
  "/landing-page",
  ...legalItems.map((item) => item.href),
];

/**
 * Quien hizo el sitio. Es el credito del pie, no un canal del estudio, y por
 * eso vive aparte de `social`.
 *
 * El logotipo es la marca de un tercero: se usa el archivo oficial tal cual
 * (public/marca/hay-equipo-ia.png, derivado de Logo_oficial.png) y no una
 * version recompuesta ni recoloreada.
 */
export const author = {
  name: "Hay Equipo IA",
  href: "https://hayequipoia.com",
  logo: "/marca/hay-equipo-ia.png",
} as const;

/** Perfiles externos. El nombre se muestra tal cual, no se traduce. */
export const social = {
  instagram: {
    label: "@parallel_studi0_",
    href: "https://instagram.com/parallel_studi0_",
  },
  /**
   * Canal directo. `number` va en formato E.164 SIN el "+" ni espacios ni
   * guiones: es lo unico que acepta wa.me. Ejemplo para Argentina:
   * +54 9 11 5555 4444 se escribe "5491155554444".
   *
   * TODO: reemplazar por el numero real del estudio. Es el unico lugar
   * donde vive: el boton flotante y la pagina de contacto lo leen de aca.
   */
  whatsapp: {
    number: "5491100000000",
  },
  /**
   * Mail de contacto. Igual que el numero: pendiente del dato real.
   */
  email: {
    address: "hola@parallelstudios.com",
  },
} as const;
