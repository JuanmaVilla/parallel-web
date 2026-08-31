import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Pathname } from "@/i18n/routing";

/**
 * Boton de accion. Ver MARCA.md §6.
 *
 * primary   — degradado `energy`, texto NEGRO. Negro no es una eleccion
 *             estetica: blanco no pasa WCAG AA contra ninguna parada del
 *             degradado (3.72 / 4.23 / 2.87). Uno solo por viewport: es el
 *             unico elemento que gasta el presupuesto de color de marca.
 * inverse   — solido blanco, texto negro. Para cuando el presupuesto de
 *             marca del viewport ya se lo lleva otra cosa — el hero, donde
 *             la sala entera va en color — y el CTA tiene que destacar sin
 *             gastar acento. Maximo contraste posible sobre negro.
 * secondary — transparente con borde, que pasa a acento en hover.
 * ghost     — solo texto, para acciones menores.
 *
 * 44px de alto minimo en los tres. El anillo de foco lo pone :focus-visible
 * global en globals.css, no cada boton.
 */
type Variant = "primary" | "inverse" | "secondary" | "ghost";

/**
 * Destino admitido: una ruta tipada de i18n/routing.ts ("/servicios") o un
 * ancla de la misma pagina ("#paquetes"). Las anclas las usa sobre todo
 * /landing-page, que es una sola pagina y navega dentro de si misma.
 */
export type Href = Pathname | `#${string}`;

const base =
  "inline-flex min-h-11 items-center justify-center rounded-md px-6 py-3 font-sans text-body-md font-bold uppercase tracking-caps transition-all duration-200 ease-standard";

const variants: Record<Variant, string> = {
  primary: "text-on-accent hover:brightness-110 active:brightness-95",
  inverse: "bg-ink text-bg hover:bg-neutral-50 active:bg-neutral-100",
  secondary: "border border-line text-ink hover:border-accent",
  ghost: "text-accent hover:text-accent-hover",
};

/**
 * Las mismas clases, sueltas, para lo que no es un Link tipado: enlaces
 * externos (wa.me, mailto:) y el <button type="submit"> del formulario.
 * Existe para que un CTA fuera del router no se dibuje a mano y termine
 * divergiendo del resto.
 */
export function buttonClass(variant: Variant = "secondary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

export function ButtonLink({
  href,
  variant = "secondary",
  children,
  className = "",
}: {
  href: Href;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  const style =
    // El degradado va inline porque es un token de imagen, no de color:
    // Tailwind no emite utilidades de background-image desde @theme.
    variant === "primary"
      ? { backgroundImage: "var(--pl-gradient-brand)" }
      : undefined;
  const classes = buttonClass(variant, className);

  // Un ancla de la misma pagina no pasa por el router de next-intl: Link le
  // antepondria el prefijo de idioma y dejaria de ser un salto interno.
  if (href.startsWith("#")) {
    return (
      <a href={href} className={classes} style={style}>
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href as Pathname}
      className={classes}
      style={style}
    >
      {children}
    </Link>
  );
}
