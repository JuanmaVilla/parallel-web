"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Velocidad aparente en px/s. 30-50 para texto gigante, 50-80 para fichas. */
  speed?: number;
  reverse?: boolean;
  /** Para contenido clicable: perseguir un enlace en movimiento es hostil. */
  pausable?: boolean;
  className?: string;
};

/**
 * Marquesina infinita sin costura.
 *
 * El contenido se renderiza dos veces y el track se desplaza exactamente
 * -50%: cuando la copia llega a donde estaba el original, el bucle reinicia
 * y no hay salto que ver. La segunda copia va aria-hidden, asi que el lector
 * de pantalla oye el contenido una sola vez.
 *
 * La duracion se calcula del ancho medido, no se fija a mano: asi todas las
 * marquesinas del sitio avanzan a la misma velocidad aparente aunque una
 * lleve cuatro palabras y otra doce. Se recalcula cuando cambian las fuentes
 * o el ancho de la ventana, porque antes de que Lastica y Proxima carguen el
 * ancho medido es el de la fuente de respaldo.
 */
export function Marquee({
  children,
  speed = 60,
  reverse = false,
  pausable = false,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const group = groupRef.current;
    if (!root || !group) return;

    const apply = () => {
      const width = group.offsetWidth;
      if (!width) return;
      // Suelo de 8s: una marquesina corta calculada a pelo pasa volando.
      const seconds = Math.max(8, width / speed);
      root.style.setProperty("--pl-marquee-duration", `${seconds.toFixed(1)}s`);
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(group);
    document.fonts?.ready.then(apply).catch(() => {});

    return () => observer.disconnect();
  }, [speed]);

  return (
    <div
      ref={rootRef}
      className={`pl-marquee ${className}`}
      data-pausable={pausable ? "true" : undefined}
    >
      <div
        className="pl-marquee__track"
        data-direction={reverse ? "reverse" : undefined}
      >
        <div ref={groupRef} className="flex shrink-0 items-center">
          {children}
        </div>
        <div aria-hidden className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
