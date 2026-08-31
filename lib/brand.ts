/**
 * Paleta de marca en JS — Parallel Studios
 *
 * Los tokens CSS de app/tokens.css son la fuente de verdad para todo lo que
 * se renderiza con CSS. Este archivo existe solo para los contextos que NO
 * pueden leer una variable CSS:
 *
 *   - metadata de Next (themeColor, OG images)
 *   - canvas 2D (waveform del reproductor)
 *   - librerias que reciben color por props en JS
 *
 * Si agregas un color aca, tiene que existir identico en app/tokens.css.
 * Es el unico archivo de codigo autorizado a contener hex, junto con
 * app/tokens.css — ver scripts/lint-hex.mjs.
 *
 * Doc: ../../MARCA.md §3
 */

export const brand = {
  /** Pantone Bright Red C / 485 C — color primario de marca */
  red: "#FF2D1D",
  /** Pantone 485 C — profundidad, estado pressed, fin del degradado */
  deep: "#F51006",
  /** Pantone Orange 021 C — energia, highlights, inicio del degradado */
  orange: "#FF6A00",
} as const;

export const neutral = {
  black: "#000000",
  bg: "#0A0B0C",
  surface: "#121417",
  elevated: "#1A1D21",
  line: "#24282E",
  gray600: "#363B42",
  gray500: "#4E545C",
  gray400: "#6E757F",
  gray300: "#9BA2AB",
  gray200: "#C7CCD2",
  gray100: "#E7EAEE",
  white: "#FFFFFF",
} as const;

/**
 * Texto sobre cualquier color de marca: negro.
 * Blanco no pasa WCAG AA contra ninguno de los tres anclas
 * (3.72 / 4.23 / 2.87). Negro los pasa (5.65 / 4.96 / 7.31).
 */
export const onBrand = neutral.black;

/** Degradado oficial del isotipo. Orden y direccion fijos. */
export const brandGradient =
  `linear-gradient(180deg, ${brand.orange} 0%, ${brand.red} 55%, ${brand.deep} 100%)` as const;
