import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/Section";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { RevealList } from "@/components/motion/RevealList";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { ButtonLink, type Href } from "@/components/ui/ButtonLink";
import { audioTrackBySlug } from "@/lib/audio";

type Item = { heading: string; body: string; slug?: string };

/**
 * Prueba social del estudio: los masters que salen de aca, sonando.
 *
 * QUE HAY Y QUE NO. Dos de los tres temas tienen master cargado; del antes de
 * cualquiera de ellos no existe archivo todavia. Toda fila sin audio queda en
 * linea punteada con el rotulo de pendiente, nunca con un play: un boton que
 * no suena es peor que no tener boton.
 *
 * El dibujo del reproductor es la envolvente real del master, no un recurso
 * grafico (ver components/audio/AudioPlayer.tsx). Por eso esta seccion ya no
 * usa LiveMeter: con el archivo en la mano, simular la senal seria mentir
 * teniendo el dato.
 *
 * EL COLOR DE MARCA DE ESTA PANTALLA SON LAS ENVOLVENTES. Por eso el titular
 * va sin `headingAccent`: el naranja de las barras y el del eyebrow ya ocupan
 * la cuota de la seccion (MARCA.md §3, 80/15/5). Si vuelve el degradado al
 * titulo, hay que sacarlo de algun otro lado.
 *
 * Un solo transporte para toda la seccion: al darle play a un tema, el otro
 * se detiene.
 *
 * Cierra con la accion. Escuchar un master terminado es el momento de mayor
 * intencion de toda la pagina, y hasta ahora la seccion no ofrecia nada que
 * hacer con eso. Los dos botones van sin degradado —el color de marca de
 * esta pantalla son las envolventes— y el segundo lleva a los precios, que
 * es lo que se pregunta despues de escuchar.
 *
 * Los dos destinos cambian con la pagina: en /landing-page son anclas de la
 * misma pagina, en el home viven en otras rutas.
 */
export function BeforeAfter({
  ctaHref = "/contacto",
  packagesHref = "/servicios",
}: {
  ctaHref?: Href;
  packagesHref?: Href;
} = {}) {
  const t = useTranslations("home.beforeAfter");
  const items = t.raw("items") as Item[];

  return (
    <Section id="antes-despues" tone="surface">
      <SectionHeader
        align="center"
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        subhead={t("subhead")}
      />

      <RevealList spotlight className="mt-16 grid gap-6 lg:grid-cols-3">
        {items.map((item) => {
          const track = item.slug ? audioTrackBySlug.get(item.slug) : undefined;

          return (
            <li
              key={item.heading}
              className="pl-card pl-spot pl-lift flex flex-col rounded-lg border border-line bg-elevated p-8"
            >
              <h3 className="font-sans font-bold text-heading-sm leading-heading tracking-title text-ink uppercase">
                {item.heading}
              </h3>
              <p className="mt-3 text-body-sm leading-body text-ink-secondary">
                {item.body}
              </p>

              <div className="mt-8 flex flex-col gap-8 border-t border-line pt-8">
                <div>
                  <p className="font-sans font-bold text-body-sm uppercase tracking-caps text-ink-secondary">
                    {t("before")}
                  </p>
                  <Silence />
                  <p className="mt-2 text-caption uppercase tracking-caps text-ink-disabled">
                    {t("pending")}
                  </p>
                </div>

                <div>
                  <p className="font-sans font-bold text-body-sm uppercase tracking-caps text-ink">
                    {t("after")}
                  </p>
                  {track ? (
                    <AudioPlayer
                      className="mt-3"
                      src={track.src}
                      peaks={track.peaks}
                      duration={track.duration}
                      label={`${item.heading} — ${t("after")}`}
                    />
                  ) : (
                    <>
                      <Silence />
                      <p className="mt-2 text-caption uppercase tracking-caps text-ink-disabled">
                        {t("pending")}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </RevealList>

      <div className="mt-16 flex flex-col items-center gap-6 text-center">
        <Reveal>
          <p className="max-w-[46ch] text-body-lg leading-body text-ink-body">
            {t("ctaLead")}
          </p>
        </Reveal>

        <Reveal>
          <div className="flex flex-wrap justify-center gap-3">
            <Magnetic>
              <ButtonLink href={ctaHref} variant="inverse">
                {t("ctaPrimary")}
              </ButtonLink>
            </Magnetic>
            <ButtonLink href={packagesHref} variant="secondary">
              {t("ctaSecondary")}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/**
 * Ausencia de senal, dibujada en la misma grilla que la envolvente del
 * reproductor: la fila que tiene tema tiene forma, esta no tiene ninguna. Una
 * regla horizontal a secas se confunde con los separadores de la tarjeta.
 *
 * Va en neutral y no en naranja a proposito: el color de la seccion es para
 * lo que suena.
 */
function Silence() {
  return (
    <div aria-hidden className="mt-3 flex h-14 items-center gap-px">
      {Array.from({ length: 64 }, (_, i) => (
        <span key={i} className="h-0.5 min-w-px flex-1 rounded-full bg-line" />
      ))}
    </div>
  );
}
