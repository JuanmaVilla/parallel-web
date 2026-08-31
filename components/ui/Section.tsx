import type { ReactNode } from "react";
import { RevealList } from "@/components/motion/RevealList";

/**
 * Contenedor de seccion: ancho maximo, margenes y ritmo vertical de la grilla.
 * Ver MARCA.md §5 — container 1440, margen 16 mobile / 64 desktop.
 *
 * `tone` alterna entre el negro del fondo y la superficie de nivel 1.
 * Alternar secciones es lo que separa bloques sin necesidad de una linea.
 */
export function Section({
  children,
  id,
  tone = "bg",
  className = "",
}: {
  children: ReactNode;
  /** Ancla para enlazar la seccion desde otra pagina o desde el nav. */
  id?: string;
  tone?: "bg" | "surface";
  className?: string;
}) {
  return (
    <section
      id={id}
      // scroll-mt compensa la cabecera fija: sin esto el ancla deja el
      // titulo tapado por la barra.
      className={`scroll-mt-20 lg:scroll-mt-28 ${tone === "surface" ? "border-t border-line bg-surface" : "bg-bg"} ${className}`}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-24 lg:px-16 lg:py-32">
        {children}
      </div>
    </section>
  );
}

/**
 * Encabezado de seccion: eyebrow + H2 + bajada.
 *
 * Las tres piezas entran escalonadas y no a la vez. Un bloque de tres lineas
 * que aparece de golpe se lee como una diapositiva; con 70ms entre una y otra
 * se lee como que alguien lo esta escribiendo.
 *
 * `eyebrow` se compone en Lastica: ASCII puro, siempre en naranja de marca
 * para que el rotulo de seccion se distinga del resto del texto secundario.
 * `headingAccent` se rellena con el degradado de marca — va en una seccion
 * por pantalla, no en todas, o deja de ser un acento.
 *
 * El tracking es el de heading y no el de display: con una tipografia de un
 * solo grosor, juntar las letras es lo que le da densidad al titulo.
 */
export function SectionHeader({
  eyebrow,
  heading,
  headingAccent,
  subhead,
  align = "left",
  className = "",
}: {
  eyebrow: string;
  heading: string;
  headingAccent?: string;
  subhead?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <RevealList
      as="div"
      className={`${centered ? "mx-auto flex max-w-[900px] flex-col items-center text-center" : ""} ${className}`}
    >
      <p className="font-display text-body-sm uppercase tracking-caps text-brand-orange">
        {eyebrow}
      </p>
      <h2
        className={`mt-6 font-sans font-bold text-fluid-h2 leading-heading tracking-title text-ink uppercase ${centered ? "" : "max-w-[22ch]"}`}
      >
        {heading}
        {headingAccent ? (
          <>
            {" "}
            <span className="pl-text-gradient">{headingAccent}</span>
          </>
        ) : null}
      </h2>
      {subhead ? (
        <p className="mt-6 max-w-[58ch] text-body-lg leading-body text-ink-body">
          {subhead}
        </p>
      ) : null}
    </RevealList>
  );
}
