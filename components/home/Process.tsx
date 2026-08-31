"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink, type Href } from "@/components/ui/ButtonLink";
import { icons, type IconName } from "@/components/ui/icons";
import { RevealList } from "@/components/motion/RevealList";
import { useSceneProgress } from "@/components/motion/useSceneProgress";

type Step = {
  icon: IconName;
  metric: string;
  heading: string;
  body: string;
};

/**
 * El proceso en tres pasos.
 *
 * La linea que une los pasos se dibuja de izquierda a derecha mientras el
 * bloque cruza la pantalla, en vez de estar ya puesta. Es la unica animacion
 * de la seccion y responde a una pregunta concreta — en que orden pasa esto —
 * que es la prueba de que un movimiento se gana su sitio.
 *
 * Solo en desktop: en movil las tarjetas se apilan y una linea horizontal no
 * une nada.
 *
 * Los numeros van en Lastica — son datos tecnicos, y al ser ASCII puro la
 * limitacion de glifos no los toca (MARCA.md §4).
 */
export function Process({
  ctaHref = "#contacto",
  tone = "surface",
}: {
  ctaHref?: Href;
  /** Piso de la seccion. Se alterna con el de la seccion vecina. */
  tone?: "bg" | "surface";
} = {}) {
  const t = useTranslations("home.process");
  const steps = t.raw("steps") as Step[];

  const { sceneRef, stageRef } = useSceneProgress<HTMLDivElement, HTMLDivElement>({
    mode: "cross",
    smoothing: 0.14,
  });

  return (
    <Section id="proceso" tone={tone}>
      <SectionHeader
        align="center"
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        subhead={t("subhead")}
      />

      <div ref={sceneRef} className="relative mt-20">
        {/* Linea de union. Arranca y termina dentro del primer y ultimo
            paso para no quedar colgando en los bordes de la seccion. */}
        <div
          aria-hidden
          className="absolute top-8 right-[16.6%] left-[16.6%] hidden lg:block"
        >
          <div ref={stageRef} className="pl-process__line" />
        </div>

        <RevealList as="ol" className="relative grid gap-14 lg:grid-cols-3 lg:gap-8">
          {steps.map((step) => {
            const Glyph = icons[step.icon];
            return (
              <li
                key={step.metric}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative">
                  <span className="flex size-16 items-center justify-center rounded-md border border-line bg-elevated text-ink">
                    <Glyph className="size-6" />
                  </span>
                  <span className="absolute -top-3 -right-4 rounded-sm border border-accent bg-bg px-2 py-0.5 font-display text-caption text-accent">
                    {step.metric}
                  </span>
                </div>

                <h3 className="mt-8 font-sans text-heading-sm font-bold leading-heading tracking-title text-ink">
                  {step.heading}
                </h3>
                <p className="mt-4 max-w-[34ch] text-body-md leading-body text-ink-secondary">
                  {step.body}
                </p>
              </li>
            );
          })}
        </RevealList>

        {/* Centrado como los pasos, que ya vienen centrados uno debajo del
            otro. Secundario: el acento de la seccion es el numero de cada
            paso, que va en borde y texto de marca. */}
        <div className="mt-16 flex justify-center">
          <ButtonLink href={ctaHref} variant="secondary">
            {t("cta")}
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
