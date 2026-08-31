import type { ComponentProps } from "react";

/**
 * Set de iconos de la marca.
 *
 * Reglas de construccion (MARCA.md §5): trazo y no relleno, caja de 24,
 * grosor constante de 2, terminaciones y uniones redondeadas, geometria
 * exacta sobre grilla, un solo color por icono.
 *
 * Todos heredan el color con `currentColor`, asi que el estado (activo,
 * deshabilitado, sobre acento) lo decide el contenedor y no el icono.
 */
type IconProps = ComponentProps<"svg">;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Consola de sonido: mezcla, control, criterio tecnico. */
export function SlidersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M1 14h6M9 8h6M17 16h6" />
    </Icon>
  );
}

/** Onda de audio: mastering, nivel, senal. */
export function WaveformIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 12h2M7 7v10M12 3v18M17 7v10M22 12h-2" />
    </Icon>
  );
}

/** Microfono: grabacion, voz, artista. */
export function MicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
    </Icon>
  );
}

/** Disco: produccion de beats, instrumental. */
export function DiscIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

/** Subida de archivos: entrega de stems. */
export function UploadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 16V4M8 8l4-4 4 4" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Icon>
  );
}

/** Medidor de barras: mezcla en curso. */
export function LevelsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 20V10M12 20V4M18 20v-7" />
    </Icon>
  );
}

/** Doble tilde: entregado. */
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 13l4 4L14 7M12 15l2 2L22 7" />
    </Icon>
  );
}

/** Tilde simple. */
export function TickIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12.5l5 5L20 6.5" />
    </Icon>
  );
}

/** Tilde dentro de un circulo: item de lista verificado. */
export function TickCircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </Icon>
  );
}

/** Cruz que rota 45° al abrir: acordeon, FAQ. */
export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

/** Monitor de audio: referencia, sala. */
export function SpeakerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="15" r="3.5" />
      <path d="M12 6.5h.01" />
    </Icon>
  );
}

/**
 * Transporte del reproductor A/B.
 *
 * El triangulo va relleno y no en trazo: es la unica excepcion a la regla de
 * "trazo y no relleno" (MARCA.md §5). Un play hueco a 20px se lee como una
 * flecha, no como un boton de reproducir, y este icono tiene que leerse antes
 * que cualquier otro de la pagina.
 */
export function PlayIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" strokeWidth="1.5" {...props}>
      <path d="M8 5.5 19 12 8 18.5Z" />
    </Icon>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <rect x="7" y="5" width="3.5" height="14" rx="1" />
      <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
    </Icon>
  );
}

/**
 * Canales de contacto. Mismas reglas que el resto del set —trazo de 2 sobre
 * caja de 24, sin relleno—, no los logotipos oficiales de cada marca: van en
 * fila con los iconos de la casa y un glifo relleno al lado de dos de trazo
 * se lee como un error de imprenta.
 *
 * La excepcion admitida es el boton flotante
 * (components/layout/WhatsAppButton.tsx): ahi el logotipo real va solo, en el
 * verde del canal, y lo que importa es el reconocimiento instantaneo.
 */

/** Instagram: cuadrado redondeado, lente y punto del flash. */
export function InstagramIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </Icon>
  );
}

/** WhatsApp: globo de dialogo con el auricular adentro. */
export function WhatsAppOutlineIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.7-5.1A8.5 8.5 0 1 1 21 11.5Z" />
      <path d="M9.2 8.6c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.3 0 .5-.1.7l-.4.5c-.2.2-.3.4-.1.7a6 6 0 0 0 2.8 2.4c.3.1.5.1.7-.1l.5-.6c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5a2 2 0 0 1-1.9 1.7 8.6 8.6 0 0 1-6.7-6.1 2.4 2.4 0 0 1 0-2Z" />
    </Icon>
  );
}

/** Mail: sobre cerrado con la solapa marcada. */
export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="4.5" width="20" height="15" rx="2.5" />
      <path d="m3.5 7 7.4 5.3c.7.5 1.5.5 2.2 0L20.5 7" />
    </Icon>
  );
}

/** Mapa de iconos por nombre, para los que vienen de messages/*.json. */
export const icons = {
  sliders: SlidersIcon,
  waveform: WaveformIcon,
  mic: MicIcon,
  disc: DiscIcon,
  upload: UploadIcon,
  levels: LevelsIcon,
  check: CheckIcon,
  tick: TickIcon,
  tickCircle: TickCircleIcon,
  speaker: SpeakerIcon,
  plus: PlusIcon,
  play: PlayIcon,
  pause: PauseIcon,
} as const;

export type IconName = keyof typeof icons;
