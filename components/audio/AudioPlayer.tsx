"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";

type Props = {
  src: string;
  /** Envolvente real del master, 0 a 1. Sale de lib/audio.ts. */
  peaks: number[];
  /** Segundos del master. Evita que el contador salte al cargar la metadata. */
  duration: number;
  /** Que tema es, para lectores de pantalla. El transporte no tiene texto. */
  label: string;
  className?: string;
};

/**
 * Transporte compartido: suena uno a la vez.
 *
 * Vive fuera de React a proposito. Un contexto obligaria a envolver la
 * seccion entera y solo resolveria los reproductores que cuelgan de ese
 * arbol; el modulo cubre cualquier reproductor de la pagina, este donde este.
 */
let currentAudio: HTMLAudioElement | null = null;

function claimTransport(audio: HTMLAudioElement) {
  if (currentAudio && currentAudio !== audio) currentAudio.pause();
  currentAudio = audio;
}

/** Nada baja de esto: una barra de 1px se lee como un hueco en el dibujo. */
const FLOOR = 0.08;

/**
 * Estira la envolvente contra su propio minimo y maximo.
 *
 * POR QUE HACE FALTA: un master esta comprimido. El RMS de un tema entero se
 * mueve entre 0.8 y 0.95 y dibujado crudo da un ladrillo — justo lo contrario
 * de lo que la seccion quiere mostrar. Reescalando ese rango al alto completo,
 * la misma diferencia que ya existe en el archivo se ve.
 *
 * SIGUE SIENDO EL DATO: es un cambio de escala, uno solo y el mismo para
 * todas las barras del tema. No se inventa movimiento ni se reordena nada; la
 * forma es la del archivo, leida con lupa. Lo que NO se puede hacer aca es
 * meter ruido o curvas por barra: ahi deja de ser el tema y pasa a ser un
 * adorno, que es de lo que esta seccion vino a escapar.
 */
function stretch(peaks: number[]) {
  const min = Math.min(...peaks);
  const max = Math.max(...peaks);
  const span = max - min || 1;
  return peaks.map((p) => FLOOR + (1 - FLOOR) * ((p - min) / span));
}

/** mm:ss. Ningun tema del estudio pasa la hora, asi que no se contempla. */
function timecode(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Reproductor de un master. Boton de transporte + envolvente real del tema.
 *
 * LAS BARRAS SON EL ARCHIVO, NO UN ADORNO. Vienen precalculadas del master en
 * scripts/convert-audio.sh: lo que se dibuja es la dinamica del tema que esta
 * sonando. Es la diferencia entre esta seccion y el medidor decorativo que
 * habia antes, y la razon por la que aca no se usa LiveMeter.
 *
 * EL PROGRESO VA POR rAF Y NO POR timeupdate. `timeupdate` dispara ~4 veces
 * por segundo: el relleno avanzaria a los saltos y se veria como un bug. El
 * bucle solo corre mientras suena, asi que en reposo no cuesta nada.
 *
 * SEEK CON UN RANGE INVISIBLE. Un div con onClick da el arrastre pero deja
 * afuera el teclado. El input nativo trae flechas, Home/End, arrastre y rol
 * de slider sin escribir nada de eso, y las barras quedan de puro dibujo.
 */
export function AudioPlayer({ src, peaks, duration, label, className = "" }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(duration);
  const [failed, setFailed] = useState(false);
  const labelId = useId();
  const bars = useMemo(() => stretch(peaks), [peaks]);

  // El bucle se ata al estado de reproduccion y no al de tiempo: si dependiera
  // de `time` se recrearia en cada frame.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) setTime(audio.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Si otro reproductor reclama el transporte, este se entera por el evento
  // `pause` del propio elemento, no por quien lo pauso.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      claimTransport(audio);
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setTime(0);
      audio.currentTime = 0;
    };
    const onMeta = () => {
      if (Number.isFinite(audio.duration)) setTotal(audio.duration);
    };
    const onError = () => {
      setFailed(true);
      setPlaying(false);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("error", onError);
      if (currentAudio === audio) currentAudio = null;
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      claimTransport(audio);
      // Safari rechaza la promesa si el gesto no alcanza; sin catch queda una
      // excepcion no manejada en consola y el boton no vuelve a su estado.
      void audio.play().catch(() => setFailed(true));
    } else {
      audio.pause();
    }
  }, []);

  const seek = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = (value / 1000) * (audio.duration || duration);
    audio.currentTime = target;
    setTime(target);
  }, [duration]);

  const progress = total > 0 ? Math.min(time / total, 1) : 0;
  const playedBars = Math.round(progress * peaks.length);

  return (
    <div className={className}>
      {/* preload="none" a proposito: son masters completos y la seccion tiene
          varios. Precargar metadata de todos abre una conexion por tema para
          leer un numero que ya viene en lib/audio.ts. */}
      <audio ref={audioRef} src={src} preload="none" />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={failed}
          aria-labelledby={labelId}
          aria-pressed={playing}
          className="pl-lift grid size-11 shrink-0 place-items-center rounded-full border border-line bg-elevated text-accent-hover transition-colors duration-200 ease-standard hover:border-accent-hover disabled:cursor-not-allowed disabled:border-line disabled:text-ink-disabled"
        >
          {playing ? (
            <PauseIcon className="size-5" />
          ) : (
            <PlayIcon className="size-5 translate-x-px" />
          )}
        </button>

        <div className="relative min-w-0 flex-1">
          <div aria-hidden className="flex h-14 items-center gap-px">
            {bars.map((bar, i) => (
              <span
                key={i}
                style={{
                  height: `${bar * 100}%`,
                  background:
                    i < playedBars
                      ? "var(--pl-color-meter-played)"
                      : "var(--pl-color-meter-track)",
                }}
                className="min-w-px flex-1 rounded-full transition-colors duration-100 ease-standard"
              />
            ))}
          </div>

          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            value={Math.round(progress * 1000)}
            onChange={(e) => seek(Number(e.currentTarget.value))}
            disabled={failed}
            aria-labelledby={labelId}
            aria-valuetext={`${timecode(time)} de ${timecode(total)}`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </div>

        <p
          id={labelId}
          className="font-display text-caption tabular-nums text-ink-secondary"
        >
          <span className="sr-only">{label} — </span>
          {timecode(playing || time > 0 ? time : total)}
        </p>
      </div>
    </div>
  );
}
