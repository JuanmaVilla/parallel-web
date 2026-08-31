"use client";

import type { ReactNode } from "react";
import { useReveal } from "./useReveal";

type Props = {
  children: string;
  /**
   * Fragmento que se rellena con el degradado de marca. Va como pieza
   * separada porque el relleno recorta contra la caja del texto: partirlo en
   * palabras enmascaradas romperia el degradado en tantos trozos como
   * palabras.
   */
  accent?: string;
  immediate?: boolean;
  /** Retardo inicial en cantidad de palabras, para encadenar dos bloques. */
  offset?: number;
  className?: string;
};

/**
 * Titular que entra palabra por palabra desde detras de una mascara.
 *
 * Se parte por palabras y no por caracteres: se lee, respeta el idioma y no
 * convierte el titular en una sopa de letras para el lector de pantalla. Por
 * caracteres solo tendria sentido en una palabra suelta.
 *
 * Accesibilidad: el texto completo vive en el aria-label del contenedor y los
 * fragmentos van aria-hidden, asi que el lector anuncia una frase y no
 * catorce nodos sueltos.
 *
 * Sin JavaScript las palabras se quedarian escondidas detras de la mascara;
 * el <noscript> del layout las devuelve a su sitio.
 */
export function SplitText({
  children,
  accent,
  immediate = false,
  offset = 0,
  className = "",
}: Props) {
  const ref = useReveal<HTMLSpanElement>({ immediate });
  const words = children.trim().split(/\s+/);
  const label = accent ? `${children} ${accent}` : children;

  return (
    <span
      ref={ref}
      aria-label={label}
      className={`inline ${className}`}
    >
      {words.map((word, i) => (
        <Word key={`${word}-${i}`} index={offset + i}>
          {word}
        </Word>
      ))}
      {accent ? (
        <Word index={offset + words.length}>
          <span className="pl-text-gradient">{accent}</span>
        </Word>
      ) : null}
    </span>
  );
}

function Word({ children, index }: { children: ReactNode; index: number }) {
  return (
    <>
      <span
        aria-hidden
        className="pl-split__word"
        style={{ "--i": index } as React.CSSProperties}
      >
        <span>{children}</span>
      </span>{" "}
    </>
  );
}
