"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Perfil del medidor: altura base de cada barra, 0 a 1. */
  levels: number[];
  /** Cuanto respira cada barra sobre su base, 0 a 1. */
  amplitude?: number;
  /** Ciclos por segundo de la onda. */
  speed?: number;
  /** Indices que van en color de marca. Uno por pieza como mucho. */
  peak?: [number, number];
  /**
   * Color de las barras, como token. Va por style y no por utilidad de
   * Tailwind a proposito: `.pl-meter__bar` y una utilidad `bg-*` tienen la
   * misma especificidad, asi que cual gana depende del orden en la hoja y no
   * de lo que pida quien usa el componente.
   */
  color?: string;
  className?: string;
  barClassName?: string;
};

/**
 * Medidor de barras vivo. Es la variante "medidor" del recurso de lineas
 * paralelas (MARCA.md §5), pero moviendose.
 *
 * El movimiento significa algo: un medidor de audio quieto se lee como un
 * grafico, uno que respira se lee como senal pasando. Es la razon por la que
 * este es el unico bucle permanente del sitio fuera de las marquesinas.
 *
 * La altura base va en `height` y el temblor en `scaleY`. Escalar no provoca
 * layout; animar `height` recalcularia la caja de cada barra en cada frame.
 *
 * Fuera de pantalla el bucle no corre, y con movimiento reducido no arranca:
 * quedan las barras en su altura base, que es un grafico perfectamente legible.
 */
export function LiveMeter({
  levels,
  amplitude = 0.35,
  speed = 0.55,
  peak,
  color = "var(--pl-gray-600)",
  className = "",
  barClassName = "",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bars = Array.from(
      root.querySelectorAll<HTMLElement>(".pl-meter__bar"),
    );
    let raf = 0;
    let running = false;

    const tick = (time: number) => {
      const t = (time / 1000) * speed * Math.PI * 2;
      for (let i = 0; i < bars.length; i++) {
        // Dos senos de periodo distinto por barra: con uno solo el medidor
        // ondula como una bandera y se ve claramente que es una formula.
        const wave =
          Math.sin(t + i * 0.7) * 0.6 + Math.sin(t * 1.7 + i * 0.31) * 0.4;
        const scale = 1 + wave * amplitude;
        bars[i].style.setProperty("--h", scale.toFixed(3));
      }
      if (running) raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) {
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
      }
    });

    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [amplitude, speed]);

  return (
    <div ref={ref} aria-hidden className={`flex items-end ${className}`}>
      {levels.map((level, i) => {
        const isPeak = peak ? i >= peak[0] && i <= peak[1] : false;
        return (
          <span
            key={i}
            style={{
              height: `${Math.round(level * 100)}%`,
              background: isPeak ? "var(--pl-color-accent)" : color,
            }}
            className={`pl-meter__bar ${barClassName}`}
          />
        );
      })}
    </div>
  );
}
