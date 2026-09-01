"use client";

import { useEffect } from "react";

/**
 * Acuse de recibo de la hidratacion.
 *
 * El sitio esconde cosas a proposito: los bloques con revelado arrancan en
 * `opacity: 0` y las palabras de los titulares detras de su mascara. Las
 * enciende JS. Eso esta bien mientras JS llegue — y el `<noscript>` del
 * layout cubre el caso de que no llegue nunca.
 *
 * Lo que ninguno de los dos cubre es el caso del medio, que es el que rompe
 * telefonos viejos: JS esta habilitado, el navegador lo empieza a ejecutar, y
 * revienta a mitad de camino por algo que no soporta. No hay `<noscript>` que
 * valga porque el usuario no desactivo nada, y no hay revelado porque el
 * codigo que lo hacia murio antes. Resultado: una pagina que carga, ocupa el
 * alto correcto, y esta vacia.
 *
 * El guion de arranque (BOOT_SCRIPT, en el layout) pone `data-boot` en el
 * <html> y arma un plazo. Este componente lo quita al montar, que es la unica
 * prueba de que React hidrato de verdad. Si el plazo vence con la marca
 * todavia puesta, o si algo tira un error antes, el <html> pasa a
 * `data-legacy` y el CSS muestra todo quieto.
 *
 * No renderiza nada. Su unico trabajo es existir lo bastante tarde como para
 * demostrar que el resto tambien existe.
 */
export function MotionGuard() {
  useEffect(() => {
    document.documentElement.removeAttribute("data-boot");
  }, []);

  return null;
}
