"use client";

import { useEffect, useRef } from "react";

/**
 * Halo que sigue al puntero sobre las tarjetas `.pl-spot` de un contenedor.
 *
 * Un solo listener delegado en el contenedor, no uno por tarjeta: en una
 * grilla de seis son seis suscripciones al mismo evento haciendo el mismo
 * trabajo. Las coordenadas se escriben en --mx/--my una vez por frame, con
 * la lectura de layout y la escritura separadas para no forzar reflow.
 *
 * En tactil no se engancha nada: no hay puntero que seguir y el estado
 * quedaria pegado en la ultima tarjeta tocada.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    let card: HTMLElement | null = null;
    let x = 0;
    let y = 0;
    let raf = 0;

    const flush = () => {
      raf = 0;
      if (!card) return;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
    };

    const onMove = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>(
        ".pl-spot",
      );
      if (!target) return;
      card = target;
      const rect = target.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    root.addEventListener("pointermove", onMove);
    return () => {
      root.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
