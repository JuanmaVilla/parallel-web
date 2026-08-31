"use client";

import type { ReactNode } from "react";
import { sequences, type SequenceName } from "@/lib/sequences";
import {
  usePrefersReducedMotion,
  useScrollProgress,
} from "./useScrollProgress";
import { VideoRenderer } from "./renderers/VideoRenderer";

type Props = {
  sequence: SequenceName;
  /** Alto del recorrido. Mas alto = el movimiento avanza mas lento. */
  height?: string;
  /** Marca la secuencia del hero: precarga agresiva. Una sola por pagina. */
  priority?: boolean;
  /** Contenido fijo sobre la secuencia. Usar SequenceOverlay. */
  children?: ReactNode;
  className?: string;
};

export function ScrollSequence({
  sequence,
  height = "300vh",
  priority = false,
  children,
  className = "",
}: Props) {
  const asset = sequences[sequence];
  const reducedMotion = usePrefersReducedMotion();
  const { ref, progress, isActive } = useScrollProgress<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`relative bg-neutral-950 ${className}`}
      style={{ height: reducedMotion ? "auto" : height }}
    >
      <div
        className={
          reducedMotion
            ? "relative w-full overflow-hidden"
            : "sticky top-0 h-dvh w-full overflow-hidden"
        }
        // aspect-ratio reserva el espacio antes de que cargue el media,
        // asi la secuencia no empuja el contenido de abajo (CLS).
        style={
          reducedMotion
            ? { aspectRatio: `${asset.width} / ${asset.height}` }
            : undefined
        }
      >
        <VideoRenderer
          sequence={asset}
          progress={progress}
          reducedMotion={reducedMotion}
          active={isActive}
          priority={priority}
        />

        {/* El texto encima nunca depende de la imagen para leerse. */}
        {children ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "var(--pl-gradient-fade-to-bg)" }}
            />
            <div className="absolute inset-0">{children}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}

/** Bloque de contenido fijo sobre la secuencia, alineado a la grilla del sitio. */
export function SequenceOverlay({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex h-full max-w-[1440px] flex-col justify-center px-4 lg:px-16 ${className}`}
    >
      {children}
    </div>
  );
}
