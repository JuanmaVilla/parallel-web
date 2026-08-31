"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * El hijo se inclina hacia el puntero y vuelve solo al salir.
 *
 * Se usa exclusivamente en el CTA primario de una seccion. Es un gesto que
 * dice "esto es lo que hay que pulsar", asi que repartirlo entre varios
 * elementos lo convierte en ruido y deja de senalar nada.
 *
 * El lerp es lo que lo hace caro: sin interpolar, el boton va pegado al raton
 * y se siente como un truco. Con arrastre parece que tiene masa.
 *
 * Nada de esto se engancha en tactil ni con movimiento reducido.
 */
export function Magnetic({
  children,
  /** Desplazamiento maximo en px. Por encima de 20 el boton se despega. */
  strength = 12,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let engaged = false;

    const loop = () => {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      const settled =
        !engaged && Math.abs(tx - cx) < 0.1 && Math.abs(ty - cy) < 0.1;

      if (settled) {
        raf = 0;
        // Se limpia en vez de dejar un translate3d(0,0,0): un transform
        // residual mantiene el elemento promocionado a capa de GPU para
        // siempre.
        el.style.transform = "";
        return;
      }

      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      tx = ((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * strength;
      ty = ((event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * strength;
      engaged = true;
      start();
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      engaged = false;
      start();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-flex ${className}`}>
      {children}
    </span>
  );
}
