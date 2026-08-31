"use client";

import { useId, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Magnetic } from "@/components/motion/Magnetic";
import { TickCircleIcon } from "@/components/ui/icons";

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
 */
export function LeadForm({
  source,
  className = "",
}: {
  source: "home" | "contacto";
  className?: string;
}) {
  const t = useTranslations("form");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const messageId = useId();

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

      <div>
        <Magnetic>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center rounded-md px-6 py-3 font-sans text-body-md font-bold uppercase tracking-caps text-on-accent transition-all duration-200 ease-standard hover:brightness-110 active:brightness-95 disabled:opacity-60"
            style={{ backgroundImage: "var(--pl-gradient-brand)" }}
          >
            {submitting
              ? t("submitting")
              : status === "error"
                ? t("retry")
                : t("submit")}
          </button>
        </Magnetic>
      </div>
    </form>
  );
}

