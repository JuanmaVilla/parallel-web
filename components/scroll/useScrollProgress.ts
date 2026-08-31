"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Mode =
  /**
   * Contenedor alto con un hijo sticky. El recorrido util es su altura menos
   * un viewport. Es el de las secuencias a pantalla completa.
   */
  | "sticky"
  /**
   * Elemento de alto normal que cruza la pantalla. 0 cuando su borde superior
   * entra por abajo, 1 cuando el inferior sale por arriba. Es el que sirve
   * para una secuencia metida en una columna al lado de texto, que nunca es
   * mas alta que la ventana y con "sticky" daria 0 siempre.
   */
  | "cross";

/**
 * Progreso de scroll 0 -> 1 de un elemento.
 *
 * Decisiones deliberadas:
 * - IntersectionObserver decide CUANDO medir. Fuera de viewport no se hace
 *   ningun trabajo: sin listener de scroll global, sin rAF corriendo.
 * - Dentro de viewport se mide con rAF, no con el evento scroll. El evento
 *   dispara mas seguido que los frames y provoca lecturas de layout de mas.
 * - Se lee getBoundingClientRect una vez por frame y se escribe despues.
 *   Nunca se intercalan lecturas y escrituras de layout.
 */
export function useScrollProgress<T extends HTMLElement>(mode: Mode = "sticky") {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    let inView = false;
    let last = -1;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      let raw: number;
      if (mode === "cross") {
        // Recorrido: lo que tarda el elemento en atravesar la ventana, o sea
        // un viewport mas su propia altura.
        const span = window.innerHeight + rect.height;
        raw = (window.innerHeight - rect.top) / (span || 1);
      } else {
        // El recorrido util es la altura del contenedor menos un viewport:
        // arranca cuando su tope toca el tope de la ventana y termina cuando
        // su base la alcanza.
        const travel = rect.height - window.innerHeight;
        raw = travel <= 0 ? 0 : -rect.top / travel;
      }
      const next = Math.min(1, Math.max(0, raw));

      // Umbral para no re-renderizar por cambios sub-pixel.
      if (Math.abs(next - last) > 0.0005) {
        last = next;
        setProgress(next);
      }

      if (inView) rafId = requestAnimationFrame(measure);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        setIsActive(inView);
        if (inView) {
          rafId = requestAnimationFrame(measure);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { rootMargin: "100px 0px" },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [mode]);

  return { ref, progress, isActive };
}

/**
 * Respeta la preferencia del sistema y reacciona si el usuario la cambia.
 *
 * useSyncExternalStore en vez de useState + useEffect: matchMedia es un store
 * externo. Con el efecto habia un render inicial con el valor equivocado y
 * otro inmediatamente despues para corregirlo.
 */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    // En el servidor no hay preferencia que leer. false mantiene el marcado
    // del servidor igual al del primer render del cliente.
    () => false,
  );
}
