import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { legal } from "@/lib/legal";

type Section = {
  heading: string;
  /** Parrafos del cuerpo. Uno por elemento. */
  body?: string[];
  /** Lista con viñetas, despues del cuerpo. */
  items?: string[];
};

/**
 * Plantilla de las tres paginas legales.
 *
 * Deliberadamente sosa. Un aviso legal no tiene que impresionar: tiene que
 * poder leerse y encontrarse. Nada de escenas de scroll, nada de revelados,
 * nada de degradados — el unico elemento de marca es el rotulo naranja del
 * encabezado, y ni siquiera hace falta.
 *
 * Columna de una sola medida (`max-w-[72ch]`) y no la grilla de 1440 del
 * resto del sitio: es texto corrido y a ancho completo una linea llegaria a
 * las doscientas letras, que es donde el ojo pierde el renglon al volver.
 *
 * Los titulos van en Proxima Nova y no en Lastica, incluso los cortos: es
 * texto de lectura larga con acentos por todas partes ("Política",
 * "Información"), y Lastica no tiene glifos acentuados (MARCA.md §4). El
 * unico rotulo que si va en Lastica es el eyebrow, que es ASCII.
 *
 * `afterIntro` es el hueco para lo que no es prosa: la tabla de datos del
 * titular en /aviso-legal, la de cookies en /cookies. Va entre la entradilla
 * y las secciones, que es donde esas dos tienen sentido.
 */
export function LegalPage({
  namespace,
  afterIntro,
}: {
  /** Namespace bajo `legal` en messages/*.json. */
  namespace: string;
  afterIntro?: ReactNode;
}) {
  const t = useTranslations(namespace);
  const locale = useLocale();
  const sections = t.raw("sections") as Section[];

  return (
    <article className="border-b border-line bg-bg">
      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-32 lg:px-16 lg:pb-32 lg:pt-48">
        <div className="max-w-[72ch]">
          {/* El rotulo si va en Lastica, como en todo el sitio: son dos
              palabras en versalitas y ASCII puro, que es su reparto. */}
          <p className="font-display text-body-sm uppercase tracking-caps text-brand-orange">
            {t("eyebrow")}
          </p>

          <h1 className="mt-6 font-sans font-bold text-fluid-h1 leading-heading tracking-title text-ink uppercase">
            {t("heading")}
          </h1>

          {/* La fecha sale de lib/legal.ts, no del copy: es el mismo dato en
              los dos idiomas y tiene que cambiar en un solo lugar. */}
          <p className="mt-4 text-body-sm leading-body text-ink-muted">
            {t("updated")}{" "}
            <time dateTime={legal.updated}>
              {formatDate(legal.updated, locale)}
            </time>
          </p>

          <p className="mt-10 text-body-lg leading-body text-ink-body">
            {t("intro")}
          </p>

          {afterIntro}

          {sections.map((section, i) => (
            <section key={section.heading} className="mt-14">
              <h2 className="font-sans font-bold text-heading-sm leading-heading text-ink">
                {/* Numeradas: en un documento legal se cita "el punto 4", y
                    sin numero no hay como citarlo. */}
                <span className="text-ink-muted">{i + 1}.</span>{" "}
                {section.heading}
              </h2>

              {section.body?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-5 text-body-md leading-body text-ink-body"
                >
                  {paragraph}
                </p>
              ))}

              {section.items ? (
                <ul className="mt-5 flex flex-col gap-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="relative pl-5 text-body-md leading-body text-ink-body before:absolute before:left-0 before:top-[0.7em] before:size-1.5 before:rounded-full before:bg-accent"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * Tabla de dos columnas para los datos duros: titular, CUIT, cookie.
 *
 * `dl` y no `table`: son pares clave-valor, no una matriz. Con `table` cada
 * fila necesitaria un encabezado de columna que no aporta nada.
 */
export function LegalData({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <dl className="mt-10 flex flex-col gap-px overflow-hidden rounded-lg border border-line bg-line">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid gap-1 bg-surface px-6 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6"
        >
          <dt className="text-body-sm font-bold uppercase tracking-caps text-ink-secondary">
            {row.label}
          </dt>
          <dd className="text-body-md leading-body text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * La fecha en el idioma que se esta leyendo.
 *
 * Dos detalles que rompen si se omiten. El locale de Intl va con region
 * —"es-AR", no "es"—, o el formato sale el de España. Y `timeZone: "UTC"`
 * es obligatorio: la fecha se construye a medianoche UTC y sin fijar la
 * zona, en Buenos Aires (UTC-3) se renderiza el dia anterior.
 */
const DATE_LOCALES: Record<string, string> = { es: "es-AR", en: "en-US" };

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(DATE_LOCALES[locale] ?? locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
