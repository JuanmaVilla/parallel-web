import { useTranslations } from "next-intl";
import { SectionHeader } from "@/components/ui/Section";
import { ButtonLink, type Href } from "@/components/ui/ButtonLink";
import { RevealList } from "@/components/motion/RevealList";
import { InlineSequence } from "@/components/scroll/InlineSequence";

type Point = { heading: string; body: string };

/**
 * Diferencial del estudio: el globo a un lado, argumentos al otro.
 *
 * El globo reemplazo a la foto provisoria que habia aca. Gira con el scroll y
 * lo orbitan notas que asoman por detras y llegan al frente — es "un puente
 * para artistas independientes" dicho en imagen: la cancion sale del cuarto y
 * llega lejos. Ver GlobeScene.tsx.
 *
 * Se fue con la foto el Parallax que la envolvia. Era el unico del sitio y
 * estaba para que el bloque no se leyera como una diapositiva, con los dos
 * lados subiendo a la vez. El globo ya resuelve eso — se mueve con el
 * recorrido —, y dejar los dos era montar un movimiento arriba del otro.
 *
 * No lleva Section porque el layout es a dos columnas y la escena sangra
 * distinto que el texto.
 */
export function WhyParallel({ ctaHref = "#contacto" }: { ctaHref?: Href } = {}) {
  const t = useTranslations("home.why");
  const points = t.raw("points") as Point[];

  // `punchline` va en negrita sobre tinta neutra, no en naranja: el
  // degradado del headingAccent ya es el elemento de color de marca de este
  // viewport (regla 80/15/5, MARCA.md §3), y un segundo remate en naranja lo
  // duplicaria.

  return (
    <section className="border-t border-line bg-bg">
      <div className="mx-auto grid max-w-[1440px] gap-16 px-4 py-24 lg:grid-cols-2 lg:items-center lg:gap-24 lg:px-16 lg:py-32">
        {/* Sin marco ni borde, al reves que la foto que habia antes: el globo
            ya tiene su propia silueta y encerrarlo en un rectangulo lo
            devuelve a parecer una imagen pegada.

            El master es vertical (828x1108). En la columna ancha de escritorio
            quedaria mas alto que la pantalla, asi que se le pone techo y se
            centra; el video ya va en object-contain, o sea que el techo lo
            achica sin recortarle nada. */}
        <InlineSequence
          sequence="globoNotas"
          className="mx-auto w-full max-w-[34rem]"
        />

        <div>
          <SectionHeader
            eyebrow={t("eyebrow")}
            heading={t("heading")}
            headingAccent={t("headingAccent")}
            subhead={t("subhead")}
          />

          <p className="mt-6 max-w-[58ch] text-body-lg font-bold leading-body text-ink">
            {t("punchline")}
          </p>

          <RevealList className="mt-12 flex flex-col gap-8">
              {points.map((point) => (
                <li
                  key={point.heading}
                  className="pl-sweep border-t border-line pt-6"
                >
                  <h3 className="font-sans font-bold text-body-sm uppercase tracking-caps text-ink">
                    {point.heading}
                  </h3>
                  <p className="mt-3 max-w-[52ch] text-body-md leading-body text-ink-secondary">
                    {point.body}
                  </p>
                </li>
              ))}
          </RevealList>

          {/* Secundario y no primario: el degradado del headingAccent ya gasta
              el presupuesto de marca de este viewport (80/15/5, MARCA.md §3). */}
          <div className="mt-10">
            <ButtonLink href={ctaHref} variant="secondary">
              {t("cta")}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
