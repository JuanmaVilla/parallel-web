"use client";

import { useEffect, useRef } from "react";

type Options = {
  /**
   * Revela en cuanto monta, sin esperar al viewport. Para el bloque que ya
   * esta en pantalla al cargar: observarlo lo revelaria igual, pero un frame
   * mas tarde y con el bloque ya visible apagado.
   */
  immediate?: boolean;
  /**
   * Escribe --i en cada hijo directo para encadenar el retardo. Sin tope de
   * hijos, a diferencia de una lista de :nth-child.
   */
  stagger?: boolean;
};

/**
 * Marca el elemento con `data-revealed` cuando entra en pantalla.
 *
 * No usa estado: pone un atributo y deja la transicion en manos del CSS (ver
 * globals.css). Un setState por bloque obligaria a re-renderizar arboles
 * enteros para una animacion que el compositor hace solo.
 *
 * El observer se desconecta al primer disparo. Re-animar al volver a pasar
 * es de las cosas que mas cansan una pagina.
 */
export function useReveal<T extends HTMLElement>({
  immediate = false,
  stagger = false,
}: Options = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (stagger) {
      Array.from(el.children).forEach((child, i) => {
        (child as HTMLElement).style.setProperty("--i", String(i));
      });
    }

    const reveal = () => el.setAttribute("data-revealed", "");

    if (
      immediate ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // Dos frames: uno para que el navegador registre el estado inicial y
      // otro para que el cambio de atributo sea una transicion y no un salto.
      const raf = requestAnimationFrame(() => requestAnimationFrame(reveal));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        reveal();
        observer.disconnect();
      },
      // Margen negativo abajo: el bloque tiene que estar claramente dentro
      // para dispararse. Si se revela apenas asoma el borde, la animacion
      // ocurre fuera de vista y el usuario solo ve el resultado.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate, stagger]);

  return ref;
}
