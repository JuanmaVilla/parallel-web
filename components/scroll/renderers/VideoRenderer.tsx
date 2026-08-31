"use client";

import { useEffect, useRef } from "react";
import type { SequenceAsset } from "@/lib/sequences";

type Props = {
  sequence: SequenceAsset;
  /** 0 -> 1 */
  progress: number;
  reducedMotion: boolean;
  /** La secuencia esta en viewport. Fuera de el, el bucle de rAF no corre. */
  active: boolean;
  priority?: boolean;
};

/**
 * Scrub de video por scroll.
 *
 * Requisitos que el mp4 tiene que cumplir (ver scripts/README-sequences.md):
 * - all-keyframe (-g 1). Sin eso cada seek decodifica desde el frame 0 y
 *   el scrub se traba.
 * - faststart (moov antes de mdat).
 * - sin pista de audio.
 *
 * Requisitos de iOS: `muted` + `playsInline`, si no Safari toma el control
 * del elemento y abre el reproductor nativo a pantalla completa.
 */
export function VideoRenderer({
  sequence,
  progress,
  reducedMotion,
  active,
  priority = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetRef = useRef(0);
  const rafRef = useRef(0);

  // El objetivo se guarda en un ref, no en estado: lo lee el bucle de rAF de
  // abajo y no tiene que provocar un render. Se escribe en efecto, nunca
  // durante el render.
  useEffect(() => {
    targetRef.current = progress * sequence.video.duration;
  }, [progress, sequence.video.duration]);

  useEffect(() => {
    if (reducedMotion || !active) return;
    const video = videoRef.current;
    if (!video) return;

    // El bucle NO espera a un evento de carga.
    //
    // Este componente se renderiza tambien en el servidor, asi que el <video>
    // ya viene en el HTML y el navegador lo empieza a cargar mientras React
    // todavia no hidrato. Con el archivo en cache, `loadeddata` se dispara
    // antes de que exista el listener y no lo escucha nadie: el scrub quedaba
    // muerto para siempre. Preguntarle el readyState al elemento en cada frame
    // no tiene esa carrera, porque es estado y no evento.
    const tick = () => {
      // HAVE_METADATA. Con menos que eso, escribir currentTime no hace nada.
      if (video.readyState >= 1) {
        const target = targetRef.current;
        // Se escribe currentTime una vez por frame, no una vez por evento de
        // scroll: escribir mas seguido encola seeks que el decoder descarta.
        if (Math.abs(video.currentTime - target) > 0.01) {
          video.currentTime = target;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, reducedMotion]);

  // Con reduced-motion no se carga el video: se muestra el poster estatico.
  if (reducedMotion) {
    return (
      <picture>
        <source srcSet={`${sequence.poster}.avif`} type="image/avif" />
        <img
          src={`${sequence.poster}.webp`}
          alt={sequence.alt}
          width={sequence.width}
          height={sequence.height}
          className="h-full w-full object-contain"
        />
      </picture>
    );
  }

  return (
    <video
      ref={videoRef}
      // preload="auto" es necesario: para hacer seek hacen falta los datos,
      // no solo la metadata. Es la excepcion justificada a la regla general.
      preload={priority ? "auto" : "metadata"}
      muted
      playsInline
      // Sin controles ni reproduccion: el scroll es el unico transporte.
      disablePictureInPicture
      poster={`${sequence.poster}.webp`}
      width={sequence.width}
      height={sequence.height}
      aria-label={sequence.alt}
      className="h-full w-full object-contain"
    >
      <source
        src={sequence.video.srcSmall}
        type="video/mp4"
        media="(max-width: 767px)"
      />
      <source src={sequence.video.src} type="video/mp4" />
    </video>
  );
}
