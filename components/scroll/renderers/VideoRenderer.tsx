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
  // El bucle se duerme cuando alcanzo el objetivo. Esta es la manija para
  // volver a encenderlo; la instala el efecto del bucle.
  const wakeRef = useRef<(() => void) | null>(null);

  // El objetivo se guarda en un ref, no en estado: lo lee el bucle de rAF de
  // abajo y no tiene que provocar un render. Se escribe en efecto, nunca
  // durante el render.
  useEffect(() => {
    // Un pelo por debajo del final. Seek al valor exacto de `duration` no
    // aterriza: el navegador se planta en el ultimo frame, que cae unos
    // milisegundos antes, y la comparacion de mas abajo nunca se cumple —
    // el bucle se quedaria pidiendo frames para siempre al llegar al 100%.
    const end = sequence.video.duration - 0.02;
    targetRef.current = Math.min(progress * sequence.video.duration, end);
    wakeRef.current?.();
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

    // Medio segundo a 60fps sin que el seek avance. Por debajo de eso se corta
    // un seek lento que iba a llegar; por encima, se insiste tanto que la
    // espera se nota igual.
    const STALL_FRAMES = 30;
    let stalled = 0;
    let lastSeen = -1;

    const tick = () => {
      // HAVE_METADATA. Con menos que eso, escribir currentTime no hace nada,
      // asi que se sigue girando hasta que llegue: es la unica espera que
      // vale la pena, y termina sola.
      if (video.readyState < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const target = targetRef.current;
      // Se escribe currentTime una vez por frame, no una vez por evento de
      // scroll: escribir mas seguido encola seeks que el decoder descarta.
      if (Math.abs(video.currentTime - target) > 0.01) {
        // Si el seek no se mueve, es que el dato todavia no esta: con
        // preload="metadata" la posicion pedida puede no estar en el buffer.
        // Insistir cada frame no la trae antes y compite con la descarga que
        // si la traeria. Se cede y se espera al evento del elemento.
        if (video.currentTime === lastSeen) {
          if (++stalled > STALL_FRAMES) {
            rafRef.current = 0;
            return;
          }
        } else {
          stalled = 0;
          lastSeen = video.currentTime;
        }
        video.currentTime = target;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      stalled = 0;

      // Ya esta donde tiene que estar. Pedir otro frame para volver a
      // comprobar lo mismo es el bucle que mas cuesta de la pagina: en un
      // telefono cada vuelta compite con el decodificador de video, que es
      // justo el que tiene que ir rapido para que el scrub no se trabe. Lo
      // vuelve a encender el efecto de arriba cuando cambia el progreso.
      rafRef.current = 0;
    };

    // rafRef.current === 0 es la marca de "dormido".
    const wake = () => {
      if (rafRef.current) return;
      // Despertar es siempre por algo nuevo —otra posicion de scroll, o el
      // elemento avisando que ya tiene el dato—, asi que la cuenta de seeks
      // que no avanzaban arranca de cero. Sin esto, un bucle que se durmio
      // por atasco se volveria a dormir en el primer frame al reanudar.
      stalled = 0;
      lastSeen = -1;
      rafRef.current = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    // El elemento avisa cuando ya puede servir la posicion pedida. Es lo que
    // saca al bucle de la espera de arriba sin tener que sondearlo.
    video.addEventListener("seeked", wake);
    video.addEventListener("loadeddata", wake);
    video.addEventListener("canplay", wake);

    wake();
    return () => {
      wakeRef.current = null;
      video.removeEventListener("seeked", wake);
      video.removeEventListener("loadeddata", wake);
      video.removeEventListener("canplay", wake);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
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
