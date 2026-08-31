"use client";

import { sequences, type SequenceName } from "@/lib/sequences";
import {
  usePrefersReducedMotion,
  useScrollProgress,
} from "./useScrollProgress";
import { VideoRenderer } from "./renderers/VideoRenderer";

/**
 * Secuencia de scroll metida en una columna, al lado de contenido.
 *
 * Es la hermana chica de ScrollSequence. Aquella se come un viewport entero
 * con un hijo sticky y el texto va encima; esta ocupa su sitio en el layout y
 * el texto va al lado. Comparten el renderer y las reglas del mp4 — todo lo
 * de VideoRenderer vale igual aca.
 *
 * Por eso el progreso va en modo "cross" y no "sticky": el elemento nunca es
 * mas alto que la ventana, y el recorrido de "sticky" (altura menos un
 * viewport) le daria cero siempre. En "cross" el video avanza mientras el
 * bloque atraviesa la pantalla, que es justo lo que se ve al scrollear.
 *
 * EL FONDO DEL MASTER TIENE QUE SER NEGRO REAL, y eso se resuelve en el
 * encode, no aca. El master de Higgsfield trae un piso azul marino (~0,13,30)
 * en vez de negro, y apoyado sobre la pagina se le ve el rectangulo. El
 * filtro colorlevels del encode sube el punto de negro por canal hasta justo
 * encima de ese piso. Si se re-encodea esta secuencia sin ese filtro, vuelve
 * la costura.
 *
 * El `screen` es el seguro de lo que queda: cerca del negro el crf 28 deja
 * algo de ruido de compresion, y sobre un fondo negro puro screen(x, 0) = x,
 * asi que se lo come sin tocar un pixel del interior.
 *
 * ESO ATA EL COMPONENTE AL FONDO NEGRO. Sobre cualquier otro fondo el video
 * se aclara. Si alguna vez va sobre una superficie que no sea --pl-black, hay
 * que sacar el blend y enmascarar los bordes en su lugar.
 */
export function InlineSequence({
  sequence,
  className = "",
}: {
  sequence: SequenceName;
  className?: string;
}) {
  const asset = sequences[sequence];
  const reducedMotion = usePrefersReducedMotion();
  const { ref, progress, isActive } = useScrollProgress<HTMLDivElement>("cross");

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      // Reserva el sitio antes de que cargue el video, asi la seccion no
      // empuja al contenido de abajo cuando aparece (CLS).
      style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
    >
      <div className="h-full w-full mix-blend-screen">
        <VideoRenderer
          sequence={asset}
          progress={progress}
          reducedMotion={reducedMotion}
          active={isActive}
        />
      </div>
    </div>
  );
}
