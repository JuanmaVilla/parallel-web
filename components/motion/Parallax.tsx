"use client";

import type { ReactNode } from "react";
import { useSceneProgress } from "./useSceneProgress";

/**
 * El contenido se desplaza mas despacio que la pagina mientras cruza la
 * pantalla. Da profundidad sin pedir nada al usuario.
 *
 * El progreso se deriva de la posicion del elemento y no del scroll global,
 * asi que el efecto es identico este donde este la seccion en la pagina.
 *
 * El hijo sobresale por arriba y por abajo del marco (`inset` negativo): sin
 * ese margen, al desplazarse asomaria el borde. El marco necesita una
 * proporcion propia — normalmente una utilidad `aspect-*` — porque su altura
 * ya no la define el contenido.
 */
export function Parallax({
  children,
  /** Recorrido total en px. 40-120 se siente natural; mas parece un fallo. */
  amount = 64,
  className = "",
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const { sceneRef, stageRef } = useSceneProgress<HTMLDivElement, HTMLDivElement>({
    mode: "cross",
    smoothing: 0.16,
  });

  return (
    <div ref={sceneRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={stageRef}
        className="pl-parallax"
        style={{ "--pl-parallax-amount": `${amount}px` } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
