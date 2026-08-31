/**
 * Manifiesto de audio — Parallel Studios
 *
 * Los masters viven fuera del repo (carpeta Audios/, ignorada). Lo que se
 * publica sale de scripts/convert-audio.sh: un mp3 a 192k por tema, mas la
 * envolvente real del master precalculada.
 *
 * `peaks` son 64 valores RMS normalizados al pico del propio tema. El
 * reproductor los dibuja tal cual: la forma que se ve en la seccion es la del
 * archivo que suena, no un adorno. Por eso viajan como dato y no se estiman
 * en el cliente — calcularlos en el browser obliga a bajar el tema entero
 * antes de pintar la primera barra.
 *
 * Normalizar al pico de cada tema y no a un techo comun es a proposito: cada
 * tarjeta muestra la dinamica interna de su master, no compara niveles entre
 * temas distintos.
 */

export type AudioTrack = {
  /** Identifica el tema en messages/*.json y en el DOM. */
  slug: string;
  src: string;
  /** Segundos. Evita que el contador salte cuando llega la metadata. */
  duration: number;
  /** Envolvente RMS, 64 valores de 0 a 1. */
  peaks: number[];
};

export const audioTracks: AudioTrack[] = [
  {
    slug: "columbia",
    src: "/audio/columbia.mp3",
    duration: 69.6,
    peaks: [
      0.38, 0.38, 0.34, 0.37, 0.34, 0.35, 0.38, 0.57, 0.67, 0.66, 0.67, 0.52,
      0.56, 0.6, 0.67, 0.63, 0.51, 0.73, 0.84, 0.89, 0.73, 1, 0.79, 0.65, 0.58,
      0.61, 0.76, 0.86, 0.85, 0.75, 0.93, 0.83, 0.85, 0.91, 0.87, 0.88, 0.87,
      0.88, 0.84, 0.9, 0.85, 0.85, 0.6, 0.66, 0.83, 0.87, 0.89, 0.94, 0.93,
      0.89, 0.86, 0.87, 0.82, 0.86, 0.88, 0.89, 0.91, 0.88, 0.87, 0.88, 0.89,
      0.9, 0.69, 0.75,
    ],
  },
  {
    slug: "klousfrens",
    src: "/audio/klousfrens.mp3",
    duration: 201.52,
    peaks: [
      0.17, 0.19, 0.19, 0.55, 0.51, 0.5, 0.7, 0.83, 0.82, 0.88, 0.82, 0.81,
      0.89, 0.61, 0.45, 0.35, 0.72, 0.83, 0.84, 0.69, 0.79, 0.79, 0.86, 0.6,
      0.56, 0.51, 0.72, 0.85, 0.74, 0.85, 0.82, 0.81, 0.87, 0.62, 0.67, 0.65,
      0.33, 0.35, 0.31, 0.43, 0.56, 0.54, 0.59, 0.71, 0.66, 0.7, 0.7, 0.72,
      0.73, 0.54, 0.52, 0.58, 0.53, 0.65, 0.64, 0.58, 0.79, 0.83, 0.82, 0.86,
      0.8, 0.91, 1, 0.16,
    ],
  },
];

export const audioTrackBySlug = new Map(audioTracks.map((t) => [t.slug, t]));
