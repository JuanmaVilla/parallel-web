"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { navItems } from "@/lib/site-nav";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SocialLinks } from "./SocialLinks";

/**
 * Barra superior.
 *
 * Va fija y NO sticky. Con sticky la barra ocupa sitio en el flujo, y el
 * escenario del hero — que mide un viewport y se clava en top: 0 — se salia
 * por abajo exactamente el alto de la barra. Fija, el hero empieza en el
 * borde superior de la pantalla, que es donde tiene que empezar una escena a
 * pantalla completa.
 *
 * Transparente sobre el hero y solida en cuanto se hace scroll: sobre la
 * escena, un panel opaco recorta la primera pantalla en dos.
 *
 * En /landing-page la navegacion no se muestra. La landing es una sola
 * pagina que se lee de arriba abajo y su unica accion es el formulario del
 * final: ofrecer cuatro salidas del sitio en la primera pantalla es
 * exactamente lo que una landing no tiene que hacer.
 *
 * Presupuesto de acento: el unico elemento en color de marca por viewport es
 * el CTA primario del contenido, asi que el de la barra va con borde y no
 * con degradado. Ver MARCA.md §3, regla 80/15/5. La barra de progreso es la
 * excepcion admitida: mide un pixel y no compite con nada.
 */
export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  // `usePathname` devuelve el path INTERNO, no el traducido: la comparacion
  // vale igual en los dos idiomas.
  const isLanding = pathname === "/landing-page";

  // Un solo rAF resuelve las dos cosas que dependen del scroll: el estado
  // solido y el progreso de lectura. Leer scrollY en el listener de scroll
  // dispara mas veces que frames hay y no aporta un pixel de precision.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let raf = 0;
    let solid = false;

    const frame = () => {
      raf = 0;
      const y = window.scrollY;

      const next = y > 40;
      if (next !== solid) {
        solid = next;
        header.toggleAttribute("data-solid", next);
      }

      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      header.style.setProperty(
        "--p",
        total > 0 ? Math.min(1, y / total).toFixed(4) : "0",
      );
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    frame();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Mientras el panel esta abierto la pagina de atras no scrollea, y Escape
  // lo cierra: es un dialogo, y un dialogo se cierra con Escape.
  //
  // El panel es `lg:hidden`, asi que al agrandar la ventana hasta escritorio
  // desaparece de la vista — pero el scroll bloqueado no se desbloquea solo.
  // De ahi el listener del breakpoint: cierra el estado, no solo la pintura.
  // 1024px es el `lg` de Tailwind; es una medida de layout, no un token de
  // diseno, y no tiene variable en app/tokens.css.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => {
      if (desktop.matches) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  return (
    <header ref={headerRef} className="pl-header">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 lg:h-20 lg:px-16">
        <Logo />

        {isLanding ? (
          <LocaleSwitcher />
        ) : (
          <>
            <nav
              aria-label={t("primary")}
              className="hidden items-center gap-8 lg:flex"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  // aria-current marca la pagina actual para el lector de
                  // pantalla y, de paso, deja el subrayado fijo: el mismo
                  // dato pinta las dos cosas.
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`pl-underline py-2 font-sans text-body-sm font-bold uppercase tracking-caps transition-colors duration-200 ease-standard ${
                    pathname === item.href
                      ? "text-ink"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {/* Solo Instagram: es el perfil del estudio, la prueba de que
                  hay trabajo saliendo. Los canales para escribir estan en el
                  CTA de al lado y en el boton flotante; repetirlos aca
                  serian cuatro acciones en la misma esquina. */}
              <SocialLinks channels={["instagram"]} variant="bare" />
              <LocaleSwitcher />
              <Link
                href="/contacto"
                className="hidden min-h-11 items-center justify-center rounded-md border border-line px-5 py-3 font-sans text-body-sm font-bold uppercase tracking-caps text-ink transition-colors duration-200 ease-standard hover:border-accent lg:inline-flex"
              >
                {t("cta")}
              </Link>

              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls="pl-menu"
                className="-mr-2 inline-flex size-11 items-center justify-center text-ink lg:hidden"
              >
                <span className="sr-only">
                  {open ? t("closeMenu") : t("openMenu")}
                </span>
                <MenuIcon open={open} />
              </button>
            </div>
          </>
        )}
      </div>

      <div aria-hidden className="pl-progress" />

      {isLanding ? null : (
        <div
          id="pl-menu"
          className="pl-menu lg:hidden"
          data-open={open ? "" : undefined}
          // Cerrado, el panel sigue en el arbol para poder animar la salida.
          // inert lo saca del foco y del lector de pantalla mientras tanto.
          inert={!open}
        >
          {/* Envoltorio sin padding: es el hijo directo de la grilla y por
              eso el que tiene que poder medir cero. Con el padding puesto
              aca, la fila de 0fr colapsa el contenido pero el relleno
              sobrevive y el panel cerrado sigue midiendo 72px — que en
              mobile tapaban el arranque de cada pagina. */}
          <div>
            <nav
              aria-label={t("primary")}
              className="flex flex-col gap-2 px-4 pb-12 pt-6"
            >
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  // Cerrarlo al tocar un enlace y no en un efecto sobre la
                  // ruta: el efecto dispara un render en cascada por cada
                  // navegacion, y el unico caso real es este.
                  onClick={() => setOpen(false)}
                  // El retardo escalonado entra por variable: el CSS lo
                  // aplica solo cuando el panel esta abierto.
                  style={{ "--i": i } as React.CSSProperties}
                  className={`pl-menu__item border-b border-line py-5 font-sans font-bold text-fluid-h2 leading-heading tracking-title uppercase transition-colors duration-200 ease-standard ${
                    pathname === item.href ? "text-ink" : "text-ink-secondary"
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Hamburguesa que se convierte en cruz.
 *
 * Dos trazos, no tres: el de arriba y el de abajo giran hasta cruzarse. Con
 * tres hay que desvanecer el del medio y el cruce queda sucio.
 */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="size-6"
    >
      <line
        x1="3"
        y1="8"
        x2="21"
        y2="8"
        className="pl-burger__bar"
        data-open={open ? "" : undefined}
      />
      <line
        x1="3"
        y1="16"
        x2="21"
        y2="16"
        className="pl-burger__bar pl-burger__bar--bottom"
        data-open={open ? "" : undefined}
      />
    </svg>
  );
}
