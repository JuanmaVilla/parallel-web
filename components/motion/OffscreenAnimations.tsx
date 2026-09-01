"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Pausa las animaciones CSS infinitas mientras no se ven.
 *
 * Las escenas dirigidas por scroll ya se apagan solas fuera de viewport: su
 * bucle de rAF lo corta un IntersectionObserver. Las animaciones CSS no
 * tienen ese freno — una vez declaradas `infinite` corren para siempre, esten
 * en pantalla o a diez mil pixeles de distancia, y el navegador no las
 * detiene por su cuenta.
 *
 * Aca eso costaba caro y en silencio. Medido en la landing con la pagina
 * quieta, sin tocar nada: sesenta recalculos de estilo por segundo, con las
 * dos animaciones responsables FUERA de pantalla en todo momento.
 *
 * La que pesa es `pl-ring-spin`. Anima `--pl-angle`, que es una custom
 * property registrada con @property, y esa variable alimenta el conic
 * gradient del borde. Animar una variable no es como animar un transform: no
 * hay nada que el compositor pueda resolver solo, asi que en cada frame hay
 * que recalcular estilo y volver a pintar el degradado del borde, en el hilo
 * principal. Es el frame completo de una animacion que nadie esta mirando.
 *
 * `pl-marquee` si es de compositor y cuesta mucho menos, pero mantiene viva
 * una capa y su textura mientras tanto. En un telefono la memoria de GPU es
 * el recurso escaso, asi que tambien se pausa.
 *
 * El mecanismo es deliberadamente romo: un observer, un atributo, y el freno
 * en CSS (`animation-play-state: paused`). Pausar no es reiniciar — al volver
 * a pantalla la animacion sigue donde estaba, que es justo lo que se quiere:
 * el anillo no da un salto y la marquesina no vuelve al principio.
 *
 * Se vuelve a enganchar al cambiar de ruta porque el arbol se reemplaza y los
 * elementos observados dejan de existir.
 */

/** Lo que se pausa. Selectores, no marcado: no hay que tocar componentes. */
const SELECTOR = ".pl-marquee__track, .pl-ring";

export function OffscreenAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(SELECTOR);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) el.removeAttribute("data-offscreen");
          else el.setAttribute("data-offscreen", "");
        }
      },
      // Un poco de margen: la animacion tiene que estar ya en marcha cuando
      // el elemento asoma, no arrancar a la vista del usuario.
      { rootMargin: "15% 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
