import { useTranslations } from "next-intl";
import { SlidersIcon } from "@/components/ui/icons";
import { RevealList } from "@/components/motion/RevealList";

type Item = {
  label: string;
  body: string;
  wide?: boolean;
  tags?: string[];
};

/**
 * Detalle tecnico de la mezcla, en grilla bento.
 *
 * Los rotulos van en Lastica: son etiquetas tecnicas cortas, que es el rol
 * que le queda a la familia (MARCA.md §4). Por eso sus valores en
 * messages/*.json son ASCII puro y el linter los verifica — la clave se
 * llama `label` justamente para que los agarre.
 */
export function MixCraft() {
  const t = useTranslations("services.mixCraft");
  const items = t.raw("items") as Item[];

  return (
    <section className="border-t border-line bg-surface">
      <div className="mx-auto max-w-[1440px] px-4 py-24 lg:px-16 lg:py-32">
        <AccentHeading>{t("heading")}</AccentHeading>

        <p className="mt-6 max-w-[60ch] text-body-lg leading-body text-ink-secondary">
          {t("lead")}{" "}
          <strong className="font-bold text-ink">{t("leadStrong")}</strong>
        </p>

        <RevealList spotlight className="mt-12 grid gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.label}
              className={`pl-card pl-spot pl-lift relative flex flex-col overflow-hidden rounded-lg border border-line bg-elevated p-8 ${
                item.wide ? "lg:col-span-2" : ""
              }`}
            >
              {item.tags ? (
                <SlidersIcon
                  className="pointer-events-none absolute -top-3 right-6 size-32 text-neutral-500/20"
                  strokeWidth="1.5"
                />
              ) : null}

              <h3 className="pl-label-gradient font-display text-body-sm uppercase tracking-caps">
                {item.label}
              </h3>
              <p className="mt-5 max-w-[52ch] text-body-md leading-body text-ink-body">
                {item.body}
              </p>

              {item.tags ? (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-sm border border-line bg-surface px-3 py-1 text-body-sm text-ink-secondary"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </RevealList>
      </div>
    </section>
  );
}

/**
 * Titulo con barra de acento a la izquierda.
 * La barra es el unico elemento en color de marca del bloque.
 */
export function AccentHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-4 font-sans text-fluid-h2 font-bold leading-heading tracking-title text-ink">
      <span aria-hidden className="h-[1em] w-1 shrink-0 rounded-full bg-accent" />
      {children}
    </h2>
  );
}
