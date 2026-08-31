import { useTranslations } from "next-intl";
import { RevealList } from "@/components/motion/RevealList";
import { social } from "@/lib/site-nav";

/**
 * Los canales directos, al lado del formulario.
 *
 * El formulario es la via recomendada —llega con el contexto del tema
 * escrito—, pero hay gente que no completa formularios y se va si no ve un
 * numero. Los canales estan, en columna angosta y en texto secundario: se
 * encuentran si se buscan, y no compiten con el campo de al lado.
 *
 * Sin iconos a proposito, aunque los glifos de contacto existan en el set
 * (components/ui/icons.tsx) y los use la fila del pie: aca cada canal es una
 * fila de una lista de definicion con su rotulo escrito al lado, y el icono
 * repetiria el rotulo sin agregar nada.
 *
 * `time` y no un parrafo suelto para el horario: es un dato de tiempo y el
 * elemento existe.
 */
export function ContactChannels() {
  const t = useTranslations("contact.channels");

  const whatsappHref = `https://wa.me/${social.whatsapp.number}?text=${encodeURIComponent(t("whatsappMessage"))}`;

  return (
    <div className="flex flex-col gap-8">
      <RevealList as="dl" className="flex flex-col gap-6">
        <div className="border-t border-line pt-6">
          <dt className="font-display text-caption uppercase tracking-caps text-ink-muted">
            {t("whatsappLabel")}
          </dt>
          <dd className="mt-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pl-underline text-body-lg leading-body text-ink transition-colors duration-200 ease-standard hover:text-accent"
            >
              {t("whatsappValue")}
            </a>
          </dd>
        </div>

        <div className="border-t border-line pt-6">
          <dt className="font-display text-caption uppercase tracking-caps text-ink-muted">
            {t("emailLabel")}
          </dt>
          <dd className="mt-2">
            <a
              href={`mailto:${social.email.address}`}
              className="pl-underline text-body-lg leading-body text-ink transition-colors duration-200 ease-standard hover:text-accent"
            >
              {social.email.address}
            </a>
          </dd>
        </div>

        <div className="border-t border-line pt-6">
          <dt className="font-display text-caption uppercase tracking-caps text-ink-muted">
            {t("instagramLabel")}
          </dt>
          <dd className="mt-2">
            <a
              href={social.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pl-underline text-body-lg leading-body text-ink transition-colors duration-200 ease-standard hover:text-accent"
            >
              {social.instagram.label}
            </a>
          </dd>
        </div>

        <div className="border-t border-line pt-6">
          <dt className="font-display text-caption uppercase tracking-caps text-ink-muted">
            {t("studioLabel")}
          </dt>
          <dd className="mt-2 text-body-lg leading-body text-ink-body">
            {t("studioValue")}
          </dd>
        </div>

        <div className="border-t border-line pt-6">
          <dt className="font-display text-caption uppercase tracking-caps text-ink-muted">
            {t("hoursLabel")}
          </dt>
          <dd className="mt-2 text-body-lg leading-body text-ink-body">
            <time>{t("hoursValue")}</time>
          </dd>
        </div>
      </RevealList>

      <p className="max-w-[40ch] text-body-sm leading-body text-ink-secondary">
        {t("note")}
      </p>
    </div>
  );
}
