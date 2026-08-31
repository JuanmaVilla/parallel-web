"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/Section";
import { RevealList } from "@/components/motion/RevealList";
import { PlusIcon } from "@/components/ui/icons";

type Item = { question: string; answer: string };

/**
 * Preguntas frecuentes. Ultimo tramo de convencer antes del pedido.
 *
 * Va justo antes del formulario: resuelve las objeciones que quedan —
 * precio, revisiones, "no tengo stems" — antes de pedirle al visitante que
 * escriba.
 *
 * Acordeon de una pregunta abierta por vez: dos respuestas abiertas compiten
 * por la misma lectura y ninguna se termina de leer.
 *
 * `hidden` nativo y no una animacion de alto: no hay una primitiva de
 * expand/collapse en components/motion/ para reusar, y construir una para
 * esta seccion sola no se paga.
 */
export function Faq() {
  const t = useTranslations("home.faq");
  const items = t.raw("items") as Item[];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <Section tone="surface">
      <SectionHeader
        align="center"
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        headingAccent={t("headingAccent")}
      />

      <RevealList
        as="dl"
        className="mx-auto mt-16 flex max-w-[800px] flex-col divide-y divide-line border-y border-line"
      >
        {items.map((item, i) => {
          const open = openIndex === i;
          const questionId = `${baseId}-q-${i}`;
          const answerId = `${baseId}-a-${i}`;

          return (
            <div key={item.question}>
              <dt>
                <button
                  type="button"
                  id={questionId}
                  aria-expanded={open}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex min-h-11 w-full items-center justify-between gap-6 py-6 text-left transition-colors duration-200 ease-standard hover:text-accent"
                >
                  <span className="font-sans text-body-lg font-bold leading-heading text-ink">
                    {item.question}
                  </span>
                  <PlusIcon
                    className={`size-5 shrink-0 text-ink-secondary transition-transform duration-200 ease-standard ${
                      open ? "rotate-45 text-accent" : ""
                    }`}
                  />
                </button>
              </dt>
              <dd
                id={answerId}
                role="region"
                aria-labelledby={questionId}
                hidden={!open}
                className="pb-6"
              >
                <p className="max-w-[64ch] text-body-md leading-body text-ink-secondary">
                  {item.answer}
                </p>
              </dd>
            </div>
          );
        })}
      </RevealList>
    </Section>
  );
}
