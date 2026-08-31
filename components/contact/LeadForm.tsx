"use client";

import { useId, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Magnetic } from "@/components/motion/Magnetic";
import { buttonClass } from "@/components/ui/ButtonLink";
import {
  InstagramIcon,
  MailIcon,
  TickCircleIcon,
  WhatsAppOutlineIcon,
} from "@/components/ui/icons";
import { social } from "@/lib/site-nav";

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "w-full min-h-11 rounded-md border border-line bg-surface px-4 py-3 font-sans text-body-md text-ink placeholder:text-ink-muted transition-colors duration-200 ease-standard focus:border-accent focus:outline-none";

const labelClass =
  "font-sans text-body-sm font-bold uppercase tracking-caps text-ink-secondary";

/**
 * El formulario en si: campos, validacion, estados de envio. Sin Section ni
 * encabezado propio — LeadFormSection lo envuelve en la home, y en
 * /contacto va directo bajo el PageHeader de la pagina.
 *
 * Todavia no existe app/api/leads/route.ts (etapa siguiente, pendiente de
 * credenciales). El submit ya apunta ahi: hasta que el backend exista, el
 * fetch devuelve 404 y se ve el estado de error tal cual va a verse en
 * produccion si algun dia falla — no hay nada que fingir aca.
 *
 * Sin zod: cuatro campos no justifican una dependencia nueva. Validacion
 * nativa (required, type="email") + reportValidity() en el submit.
 *
 * `altChannels` agrega WhatsApp y mail al lado del envio: hay gente que no
 * completa formularios y se iba sin dejar rastro. Van en `secondary` —borde,
 * sin relleno—, asi el degradado del submit sigue siendo el unico elemento
 * en color de marca del viewport (MARCA.md §3, regla 80/15/5).
 *
 * En /contacto se apaga: los mismos canales ya estan en la columna de al
 * lado (ContactChannels) y repetirlos a dos columnas de distancia no suma
 * una via nueva, solo ruido.
 */
export function LeadForm({
  source,
  altChannels = true,
  className = "",
}: {
  source: "home" | "contacto";
  /** CTAs de canal directo junto al envio. */
  altChannels?: boolean;
  className?: string;
}) {
  const t = useTranslations("form");
  const channels = useTranslations("contact.channels");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const messageId = useId();

  // Mismo enlace que arma ContactChannels: el mensaje ya escrito le ahorra
  // al visitante tener que redactar el primer renglon.
  const whatsappHref = `https://wa.me/${social.whatsapp.number}?text=${encodeURIComponent(channels("whatsappMessage"))}`;
  const mailtoHref = `mailto:${social.email.address}?subject=${encodeURIComponent(t("mailSubject"))}`;

  if (status === "success") {
    return (
      <div
        className={`flex flex-col items-center gap-4 rounded-lg border border-line bg-surface px-8 py-12 text-center ${className}`}
      >
        <TickCircleIcon className="size-10 text-accent" />
        <p className="font-sans text-heading-sm font-bold leading-heading text-ink">
          {t("successHeading")}
        </p>
        <p className="max-w-[42ch] text-body-md leading-body text-ink-secondary">
          {t("successBody")}
        </p>

        {/* La pantalla de exito era un callejon sin salida: el mensaje ya
            salio y no quedaba nada que hacer. Estas dos salidas no piden
            convertir de nuevo, ofrecen adonde seguir mientras esperan. */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("secondary", "gap-2")}
          >
            <WhatsAppOutlineIcon className="size-5" aria-hidden />
            {t("whatsappCta")}
          </a>
          <a
            href={social.instagram.href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("secondary", "gap-2")}
          >
            <InstagramIcon className="size-5" aria-hidden />
            {t("instagramCta")}
          </a>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);

    // Campo trampa: invisible para una persona, atractivo para un bot que
    // completa todo lo que encuentra. Si viene con contenido, se corta aca
    // sin pegarle al backend ni mostrar error.
    if (data.get("company")) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone") || undefined,
          message: data.get("message"),
          locale,
          source,
        }),
      });
      if (!res.ok) throw new Error("delivery_failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`flex flex-col gap-6 ${className}`}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={nameId} className={labelClass}>
          {t("name")}
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          required
          placeholder={t("namePlaceholder")}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={emailId} className={labelClass}>
          {t("email")}
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={phoneId} className={labelClass}>
          {t("phone")}
        </label>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          placeholder={t("phonePlaceholder")}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={messageId} className={labelClass}>
          {t("message")}
        </label>
        <textarea
          id={messageId}
          name="message"
          required
          rows={4}
          placeholder={t("messagePlaceholder")}
          className={`${fieldClass} resize-none`}
        />
      </div>

      {/* Trampa para bots: oculta de la vista y del orden de tabulacion,
          pero presente en el DOM — un bot que completa todo input que
          encuentra la va a llenar. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      {status === "error" ? (
        <p role="alert" className="text-body-sm leading-body text-accent">
          {t("errorMessage")}
        </p>
      ) : null}

      {/* El submit primero y siempre: es la via recomendada, la unica que
          llega con el tema descrito. Los canales van detras, al ras. */}
      <div className="flex flex-wrap items-center gap-3">
        <Magnetic>
          <button
            type="submit"
            disabled={submitting}
            className={buttonClass("primary", "disabled:opacity-60")}
            style={{ backgroundImage: "var(--pl-gradient-brand)" }}
          >
            {submitting
              ? t("submitting")
              : status === "error"
                ? t("retry")
                : t("submit")}
          </button>
        </Magnetic>

        {altChannels ? (
          <>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("secondary", "gap-2")}
            >
              <WhatsAppOutlineIcon className="size-5" aria-hidden />
              {t("whatsappCta")}
            </a>
            <a
              href={mailtoHref}
              className={buttonClass("secondary", "gap-2")}
            >
              <MailIcon className="size-5" aria-hidden />
              {t("emailCta")}
            </a>
          </>
        ) : null}
      </div>

      {altChannels ? (
        <p className="text-body-sm leading-body text-ink-secondary">
          {t("altChannelsNote")}
        </p>
      ) : null}
    </form>
  );
}

