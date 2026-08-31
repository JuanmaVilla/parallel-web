import type { ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/Section";
import { RevealList } from "@/components/motion/RevealList";
import { ButtonLink, type Href } from "@/components/ui/ButtonLink";

/**
 * Quienes somos. El primer "nosotros" de la pagina.
 *
 * Va justo despues de las tarjetas de servicio, no antes: antes de eso el
 * visitante no sabe todavia si el estudio hace lo que el necesita, y
 * presentarse ahi seria hablar de nosotros antes de haber hablado de el.
 * Con el que hacemos ya dicho, esta seccion cierra el argumento con quien lo
 * hace — y por que le importa lo mismo que le importa al que escucha.
 *
 * No es la seccion "por que Parallel" de mas abajo (home.why): esa lista
 * diferenciales operativos — canción por canción, revisiones, sin sello.
 * Esta es identidad: dice que del otro lado hay productores que tambien
 * andan buscando su sonido, no una fabrica. Por eso no repite esa bajada
 * palabra por palabra aunque nazcan del mismo parrafo de MARCA.md §1.
 *
 * El cierre es la unica linea de la seccion en color de marca. Todo lo
 * demas del bloque es neutral a proposito, asi ese renglon final es lo
 * unico que el ojo puede leer como "esto es lo importante" (regla 80/15/5,
 * MARCA.md §3). Va en rojo de marca plano y no en el degradado del isotipo: el
 * degradado es para un titular corto, y en una frase entera cruzando varias
 * palabras se leeria como una franja de color, no como un acento.
 *
 * `tone="surface"` a proposito: entra y sale de negro puro por ambos lados
 * (tarjetas de servicio antes, capacidades despues), y ese cambio de piso es
 * lo que marca la pausa sin necesitar una linea — ver el comentario de
 * Section sobre alternar tono.
 *
 * A dos columnas, texto primero: en movil el argumento se lee entero antes
 * de llegar a la foto, que aca es prueba y no gancho. La imagen va a la
 * derecha y no a la izquierda como en WhyParallel (home.why, mas abajo) para
 * que las dos secciones con foto no se lean como la misma plantilla repetida
 * dos veces en la misma pagina.
 *
 * Sin Parallax: WhyParallel ya es "el unico parallax del sitio" (ver su
 * propio comentario) y esa cuenta no suma una segunda vez.
 */
export function AboutUs({
  ctaHref,
  variant = "full",
}: {
  ctaHref?: Href;
  /**
   * `teaser` recorta el bloque al primer parrafo y remata con el enlace a
   * /nosotros. La version entera vive en esa pagina: mostrarla identica en
   * las dos hace que llegar a /nosotros no aporte nada.
   */
  variant?: "full" | "teaser";
} = {}) {
  const t = useTranslations("home.about");

  return (
    <Section tone="surface">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
        <div>
          <SectionHeader eyebrow={t("eyebrow")} heading={t("heading")} />

          <RevealList className="mt-10 flex flex-col gap-6">
            <p className="max-w-[60ch] text-body-lg leading-body text-ink-body">
              {t.rich("paragraph1", { b: bold })}
            </p>
            {variant === "full" ? (
              <p className="max-w-[60ch] text-body-lg leading-body text-ink-body">
                {t.rich("paragraph2", { b: bold })}
              </p>
            ) : null}
            <p className="mt-4 max-w-[38ch] font-sans text-heading-sm font-bold leading-heading text-brand-red">
              {t("punchline")}
            </p>
          </RevealList>

          {/* Solo cuando la seccion es un adelanto: en el home lleva a
              /nosotros, y en /nosotros no hay a donde seguir. */}
          {ctaHref ? (
            <div className="mt-10">
              <ButtonLink href={ctaHref} variant="secondary">
                {t("cta")}
              </ButtonLink>
            </div>
          ) : null}
        </div>

        <TeamPhoto alt={t("photoAlt")} />
      </div>
    </Section>
  );
}

/**
 * Los tramos marcados con <b> en los mensajes. Van en negrita del mismo color
 * del cuerpo, no en color de marca: el unico elemento de marca del viewport ya
 * lo gasta la punchline de abajo (regla 80/15/5, MARCA.md §3).
 */
const bold = (chunks: ReactNode) => (
  <strong className="font-bold text-ink">{chunks}</strong>
);

/**
 * Foto del equipo: los dos fundadores, uno al lado del otro.
 *
 * A color y sin tratamiento. Llevaban un duotono calido que las emparejaba
 * —las tomas de origen no comparten locacion ni luz: una pared lisa, un fondo
 * de estudio saturado—, y al sacarlo esa diferencia queda a la vista. Es una
 * decision tomada: si molesta, la salida es volver a sacar las fotos con la
 * misma luz, no reponer el filtro.
 *
 * Este bloque tambien se monta en el home y en la landing, asi que el cambio
 * vale para las tres.
 */
function TeamPhoto({ alt }: { alt: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="grid aspect-[4/3] grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-elevated"
    >
      <div className="relative">
        <Image
          src="/equipo/pedro.webp"
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="relative">
        <Image
          src="/equipo/ian.webp"
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
