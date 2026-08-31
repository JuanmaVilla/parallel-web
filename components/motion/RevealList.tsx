"use client";

import { useCallback, type ReactNode } from "react";
import { useReveal } from "./useReveal";
import { useSpotlight } from "./useSpotlight";

/**
 * Bloque cuyos hijos directos entran escalonados, con foco de puntero opcional.
 *
 * Recibe `as` en vez de envolver el contenido en un div, y no es un detalle:
 * el retardo se reparte entre los HIJOS DIRECTOS del elemento marcado, asi
 * que metiendo un <ul> dentro de otro elemento el unico hijo pasa a ser la
 * propia lista y las tarjetas entran todas a la vez.
 *
 * Los dos comportamientos comparten el mismo nodo, de ahi el ref combinado.
 */
export function RevealList({
  children,
  as: Tag = "ul",
  spotlight = false,
  className = "",
}: {
  children: ReactNode;
  as?: "ul" | "ol" | "div" | "dl";
  /** Halo que sigue al puntero sobre las tarjetas `.pl-spot` de dentro. */
  spotlight?: boolean;
  className?: string;
}) {
  const revealRef = useReveal<HTMLElement>({ stagger: true });
  const spotlightRef = useSpotlight<HTMLElement>();

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      revealRef.current = node;
      spotlightRef.current = spotlight ? node : null;
    },
    [revealRef, spotlightRef, spotlight],
  );

  return (
    <Tag ref={setRef} data-reveal-stagger="" className={className}>
      {children}
    </Tag>
  );
}
