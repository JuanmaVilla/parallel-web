/**
 * Manifiesto de secuencias de scroll — Parallel Studios
 *
 * Tecnica unica: scrub de video. El mp4 es all-keyframe, asi que hacer seek a
 * cualquier `currentTime` es instantaneo (3.6 ms medidos). Un mp4 normal trae
 * un solo keyframe y el scrub se traba.
 *
 * Se evaluo tambien cross-fade de stills en un lab interno. Perdio: el video
 * da movimiento continuo y el fondo negro de la marca comprime tan bien que el
 * peso quedo competitivo.
 *
 * Pipeline de conversion: scripts/convert-sequence.sh
 */

export type SequenceAsset = {
  /** Carpeta bajo /public/sequences */
  dir: string;
  width: number;
  height: number;
  video: {
    /** mp4 all-keyframe, resolucion completa */
    src: string;
    /** Variante de media resolucion para viewports angostos */
    srcSmall: string;
    /** Segundos. Necesario para mapear progreso -> currentTime. */
    duration: number;
  };
  /** Primer frame. Reserva espacio y es lo que se ve con reduced-motion. */
  poster: string;
  /** Texto alternativo. Describe el contenido, no el efecto. */
  alt: string;
};

function build(
  dir: string,
  opts: Omit<SequenceAsset, "dir" | "poster" | "video"> & { duration: number },
): SequenceAsset {
  const base = `/sequences/${dir}`;
  return {
    dir,
    width: opts.width,
    height: opts.height,
    alt: opts.alt,
    poster: `${base}/poster`,
    video: {
      src: `${base}/scrub.mp4`,
      srcSmall: `${base}/scrub-sm.mp4`,
      duration: opts.duration,
    },
  };
}

export const sequences = {
  heroStudio: build("hero-studio", {
    width: 1920,
    height: 1080,
    // Duracion del encode, no la del master. Coinciden porque se encodea a
    // los 30 fps del original; si se cambia el fps hay que volver a leerla
    // con ffprobe sobre scrub.mp4 (el script la imprime).
    duration: 10.133333,
    alt: "Auriculares de estudio y microfono de condensador girando sobre fondo negro hasta separarse y revelar el logo de Parallel Studios",
  }),
  globoNotas: build("globo-notas", {
    width: 828,
    height: 1108,
    // Del encode, no del master: al remuestrear a 20 fps queda unos
    // milisegundos mas largo que los 5.041667 del original.
    duration: 5.05,
    alt: "El planeta Tierra girando sobre fondo negro mientras notas musicales salen desde detras y avanzan hacia el frente",
  }),
} satisfies Record<string, SequenceAsset>;

export type SequenceName = keyof typeof sequences;
