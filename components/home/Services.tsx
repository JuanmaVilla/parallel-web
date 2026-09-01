import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/Section";
import { RevealList } from "@/components/motion/RevealList";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { ButtonLink, buttonClass, type Href } from "@/components/ui/ButtonLink";
import { WhatsAppOutlineIcon } from "@/components/ui/icons";
import { social } from "@/lib/site-nav";

type ServiceItem = {
  heading: string;
  body: string;
  features: string[];
  priceFrom: string;
  price: string;
  priceAlt: string;
  featured?: boolean;
};

/**
 * Tres paquetes en columnas.
 *
 * Orden de lectura, de arriba abajo: nombre, precio, que incluye. El precio
 * va arriba y grande porque es lo primero que el visitante busca; abajo del
 * todo obligaba a recorrer la tarjeta entera para encontrarlo.
 *
 * Una sola tarjeta esta destacada, con el borde vivo de marca y etiqueta.
 * Tres tarjetas identicas no le dicen al ojo por donde empezar, que es lo que
 * hace que un bloque de precios se lea "plano". El borde girando es el unico
 * elemento en color de marca de la seccion, y por eso el CTA del pie NO va
 * en degradado (MARCA.md §3).
 *
 * El pie de la seccion cierra con la accion. Quien termino de leer tres
 * precios ya decidio: dejarlo ahi lo obliga a seguir scrolleando hasta el
 * formulario del final para hacer algo con esa decision. `inverse` —solido
 * blanco— y no `primary`: el presupuesto de color de marca de esta pantalla
 * se lo lleva el borde de la tarjeta destacada.
 *
 * `ctaHref` cambia con la pagina: en /landing-page el formulario es un ancla
 * de la misma pagina; en /servicios vive en otra ruta.
 */
export function Services({ ctaHref = "/contacto" }: { ctaHref?: Href } = {}) {
  const t = useTranslations("home.services");
  const channels = useTranslations("contact.channels");
  const items = t.raw("items") as ServiceItem[];

  const whatsappHref = `https://wa.me/${social.whatsapp.number}?text=${encodeURIComponent(channels("whatsappMessage"))}`;

  return (
    <Section id="paquetes" tone="surface">
      <SectionHeader
        align="center"
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        headingAccent={t("headingAccent")}
        subhead={t("subhead")}
      />

      <RevealList
        spotlight
        className="mt-16 grid items-start gap-6 lg:grid-cols-3"
      >
        {items.map((item) => (
          <li
            key={item.heading}
            className={`pl-card pl-spot pl-lift relative flex flex-col rounded-lg bg-elevated p-8 lg:p-10 ${
              item.featured
                ? "pl-ring lg:-mt-4 lg:pb-14"
                : "border border-line"
            }`}
          >
            {item.featured ? (
              <span className="absolute -top-3 left-8 rounded-sm bg-accent px-3 py-1 font-sans text-caption font-bold uppercase tracking-caps text-on-accent lg:left-10">
                {t("badge")}
              </span>
            ) : null}

            <h3 className="font-sans font-bold text-heading-sm leading-heading tracking-title text-ink uppercase">
              {item.heading}
            </h3>

            <p className="mt-8 text-body-sm uppercase tracking-caps text-ink-secondary">
              {item.priceFrom}
            </p>
            {/* El precio es un dato tecnico y va en Lastica. ASCII puro, asi
                que la limitacion de glifos no lo afecta. MARCA.md §4 */}
            <p className="mt-1 font-display text-fluid-h2 leading-heading tracking-heading text-ink">
              {item.price}
            </p>
            <p className="mt-1 text-body-sm text-ink-secondary">
              {item.priceAlt}
            </p>

            <p className="mt-8 border-t border-line pt-8 text-body-md leading-body text-ink-body">
              {item.body}
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {item.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 text-body-sm leading-body text-ink-secondary"
                >
                  <CheckIcon />
                  {feature}
                </li>
              ))}
            </ul>
          </li>
        ))}
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
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("secondary", "gap-2")}
            >
              <WhatsAppOutlineIcon className="size-5" aria-hidden />
              {t("ctaWhatsapp")}
            </a>
          </div>
        </Reveal>

        <p className="max-w-[58ch] text-body-sm leading-body text-ink-secondary">
          {t("launchNote")}
        </p>
      </div>
    </Section>
  );
}

/** Trazo 2px, terminaciones redondeadas, un solo color. MARCA.md §5. */
function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 size-4 shrink-0 text-accent"
    >
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}
