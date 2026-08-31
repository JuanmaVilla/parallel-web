/**
 * Datos del titular del sitio — Parallel Studios
 *
 * Los usan las tres paginas legales (/aviso-legal, /privacidad, /cookies).
 * Viven aca y no en messages/*.json porque no son copy: no se traducen, no
 * se reescriben y tienen que ser identicos en los dos idiomas. Un dato legal
 * escrito dos veces es un dato que en algun momento va a decir dos cosas.
 *
 * IMPORTANTE — PENDIENTE ANTES DE PUBLICAR
 *
 * Los cuatro campos marcados abajo son provisorios. Un aviso legal con la
 * razon social, el CUIT o el domicilio mal no protege de nada: es una
 * declaracion falsa publicada por el estudio. Completarlos con los datos
 * reales antes del primer deploy a produccion, y actualizar `updated` ese
 * mismo dia.
 */
export const legal = {
  /** PENDIENTE: razon social o nombre y apellido del titular. */
  owner: "PENDIENTE — razon social del titular",
  /** PENDIENTE: CUIT / CUIL del titular. */
  taxId: "PENDIENTE — CUIT",
  /** PENDIENTE: domicilio fiscal completo. */
  address: "PENDIENTE — domicilio fiscal",
  /** Nombre comercial. Este si es definitivo. */
  brand: "Parallel Studios",

  /**
   * Fecha de la ultima revision de los textos legales, en ISO.
   *
   * Se muestra al pie del titulo de cada documento. Cambiarla cada vez que
   * se toque el contenido de cualquiera de las tres paginas: es el dato que
   * le dice al visitante que version acepto.
   */
  updated: "2026-08-31",
} as const;

/**
 * Cookie propia que instala el sitio, y la unica.
 *
 * La pone el proxy de next-intl (proxy.ts) para recordar en que idioma se
 * esta navegando. Verificado sobre la respuesta real del servidor: llega sin
 * Max-Age, o sea que es de sesion y el navegador la borra al cerrarse.
 *
 * Si algun dia se suma analitica, pixel o embebido de terceros, la fila va
 * aca y el texto de /cookies deja de ser cierto hasta que se actualice.
 */
export const cookies = [
  {
    name: "NEXT_LOCALE",
    /** Clave bajo `legal.cookies.table` en messages/*.json. */
    key: "locale",
  },
] as const;
