"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/components/motion/useReveal";

/**
 * Revela su contenido cuando entra en viewport.
 *
 * La mecanica vive en components/motion/useReveal.ts; esto es el envoltorio
 * de marcado que usan las secciones. `stagger` encadena los hijos directos
 * con retardo creciente, para que una grilla entre en secuencia en lugar de
 * aparecer entera de golpe.
 */
export function Reveal({
  children,
  stagger = false,
  immediate = false,
  className = "",
}: {
  children: ReactNode;
  stagger?: boolean;
  /** Para el bloque que ya esta en pantalla al cargar. */
  immediate?: boolean;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>({ stagger, immediate });

  const attr = stagger ? { "data-reveal-stagger": "" } : { "data-reveal": "" };

  return (
    <div ref={ref} {...attr} className={className}>
      {children}
    </div>
  );
}
