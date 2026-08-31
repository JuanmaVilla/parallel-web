"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Cambio de idioma que conserva la pagina actual.
 *
 * `usePathname` de i18n/navigation devuelve el path INTERNO (/servicios),
 * no el traducido (/services). Por eso el mismo valor sirve para las dos
 * variantes: next-intl lo vuelve a traducir al idioma destino.
 *
 * Son enlaces reales, no un boton con router.push: el buscador ve las dos
 * versiones y el usuario puede abrirlas en otra pestana.
 */
export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const active = useLocale();
  const pathname = usePathname();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {routing.locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 ? (
            <span aria-hidden className="text-ink-disabled">
              /
            </span>
          ) : null}
          <Link
            href={pathname}
            locale={locale}
            // Marca cual es la version actual sin usar color de marca: el
            // presupuesto de acento del viewport es para el CTA.
            aria-current={locale === active ? "true" : undefined}
            className={`min-h-11 px-1 py-3 font-sans text-body-sm font-bold uppercase tracking-caps transition-colors duration-200 ease-standard ${
              locale === active
                ? "text-ink"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            {locale}
          </Link>
        </span>
      ))}
    </div>
  );
}
