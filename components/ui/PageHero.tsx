import type { ReactNode } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Cabecera de pagina interna.
 *
 * Es el hermano tranquilo del hero del home. La sala en 3D es una escena de
 * apertura: montada tambien en /servicios y /nosotros dejaria de ser un
 * momento y pasaria a ser el decorado del sitio, y ademas obligaria a
 * scrollear dos pantallas antes de llegar al contenido en paginas donde el
 * visitante ya sabe lo que vino a buscar.
 *
 * Lo que se conserva es el lenguaje: halo de marca detras, titular que entra
 * palabra por palabra desde su mascara y el fragmento de acento con el
 * degradado. Media pantalla, no una entera.
 *
 * Server component: SplitText y Reveal ya traen su propio "use client".
 *
 * Presupuesto de acento: el degradado del titular es el elemento de marca de
 * este viewport, asi que los CTA que se le pasen van en neutral.
 */
export function PageHero({
  eyebrow,
  heading,
  headingAccent,
  subhead,
  children,
}: {
  eyebrow: string;
  heading: string;
  headingAccent?: string;
  subhead?: string;
  /** Acciones opcionales al pie del bloque. */
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-bg">
      {/* El halo va detras y sangra por arriba: nace fuera del encuadre, que
          es lo que hace que se lea como luz de sala y no como una mancha
          centrada en la caja. */}
      <div
        aria-hidden
        className="pl-ambient left-1/2 top-0 h-[36rem] w-[min(92vw,46rem)] -translate-x-1/2 -translate-y-1/3"
      />

      <div className="relative mx-auto max-w-[1440px] px-4 pb-20 pt-32 lg:px-16 lg:pb-28 lg:pt-48">
        <Reveal>
          <p className="font-display text-body-sm uppercase tracking-caps text-brand-orange">
            {eyebrow}
          </p>
        </Reveal>

        <h1 className="mt-6 max-w-[18ch] font-sans font-bold text-fluid-hero leading-display tracking-title text-ink uppercase">
          <SplitText immediate accent={headingAccent}>
            {heading}
          </SplitText>
        </h1>

        {subhead ? (
          <Reveal>
            <p className="mt-8 max-w-[58ch] text-body-lg leading-body text-ink-body">
              {subhead}
            </p>
          </Reveal>
        ) : null}

        {children ? (
          <Reveal>
            <div className="mt-10 flex flex-wrap gap-3">{children}</div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
