import { useTranslations } from "next-intl";
import { ButtonLink, type Href } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Magnetic } from "@/components/motion/Magnetic";

/**
 * Banda de cierre. Es lo ultimo de cada pagina interna antes del pie.
 *
 * Una pagina que termina en el ultimo parrafo deja al visitante sin salida:
 * la banda es la salida. Siempre la misma, siempre en el mismo lugar — que
 * sea previsible es la gracia.
 *
 * Aca si va el CTA primario con el degradado: es el unico elemento en color
 * de marca del viewport (MARCA.md §3, regla 80/15/5), y por eso el titular
 * de esta banda NO lleva `headingAccent`. Dos degradados en la misma pantalla
 * y el ojo deja de saber donde hacer click.
 *
 * El texto sale del namespace `cta` de messages/*.json, salvo que se le pase
 * otro: /contacto cierra con otra cosa que /servicios.
 */
export function CtaBand({
  namespace = "cta",
  primaryHref = "/contacto",
  secondaryHref = "/servicios",
  tone = "surface",
}: {
  /** Namespace de messages/*.json con el copy de la banda. */
  namespace?: string;
  primaryHref?: Href;
  secondaryHref?: Href;
  /** Piso de la banda. Se alterna con el de la seccion que la precede. */
  tone?: "bg" | "surface";
}) {
  const t = useTranslations(namespace);

  return (
    <section
      className={`relative overflow-hidden border-t border-line ${tone === "surface" ? "bg-surface" : "bg-bg"}`}
    >
      {/* Palabra gigante de fondo, en contorno neutral: textura, no titulo.
          Va detras del contenido y recortada por los lados.

          Contorno y no la variante `--solid`: esa rellena con el color de
          superficie, que es exactamente el fondo de esta banda — la palabra
          desapareceria. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        {/* Lastica: el sufijo Label lo hace verificar por
            scripts/lint-headlines.mjs, que exige ASCII puro. */}
        <span className="pl-giant">
          {t("giantLabel")}
        </span>
      </div>

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center px-4 py-24 text-center lg:px-16 lg:py-32">
        <Reveal>
          <p className="font-display text-body-sm uppercase tracking-caps text-brand-orange">
            {t("eyebrow")}
          </p>
        </Reveal>

        <h2 className="mt-6 max-w-[20ch] font-sans font-bold text-fluid-h2 leading-heading tracking-title text-ink uppercase">
          <SplitText>{t("heading")}</SplitText>
        </h2>

        <Reveal>
          <p className="mt-6 max-w-[52ch] text-body-lg leading-body text-ink-body">
            {t("subhead")}
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Magnetic>
              <ButtonLink href={primaryHref} variant="primary">
                {t("primary")}
              </ButtonLink>
            </Magnetic>
            <ButtonLink href={secondaryHref} variant="secondary">
              {t("secondary")}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
