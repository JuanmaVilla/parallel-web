"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { author, legalItems, navItems, social } from "@/lib/site-nav";
import { SocialLinks } from "./SocialLinks";

/**
 * Pie minimo de /landing-page.
 *
 * Tres renglones y nada mas: de que se trata el estudio, los derechos, y
 * quien hizo el sitio. La landing es una sola pagina con una sola accion —el
 * formulario del final— y un pie con navegacion, canales y legales le pone
 * diez salidas justo despues del unico lugar donde tiene que convertir. Es
 * la misma razon por la que el Header le esconde la navegacion.
 *
 * La firma va en texto plano, sin enlace ni logo: acredita a quien hizo el
 * sitio sin abrir una puerta hacia afuera en el ultimo renglon de la pagina.
 * En el pie completo del resto del sitio sigue siendo una tarjeta enlazada.
 *
 * El relleno a la derecha le deja sitio al boton flotante de WhatsApp, que
 * es fijo al viewport y al final de la pagina cae encima de este renglon.
 */
function LandingFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-10 pr-20 lg:px-16 lg:pr-24">
        <p className="text-caption leading-body text-ink-secondary">
          {t("location")}
        </p>
        <p className="text-caption leading-body text-ink-secondary">
          © {year} Parallel Studios. {t("rights")}
        </p>
        <p className="text-caption leading-body text-ink-muted">
          {t("creditPrefix")} {author.name}
        </p>
      </div>
    </footer>
  );
}

/**
 * Pie del sitio.
 *
 * Cliente por una sola razon: tiene que saber si esta en /landing-page para
 * cambiar a LandingFooter. No tiene estado propio ni interaccion.
 *
 * Un solo bloque, no dos. La marca, la navegacion, los canales y la firma de
 * quien hizo el sitio van en la misma fila de columnas, y debajo una unica
 * linea de letra chica con los legales y el aviso de derechos.
 *
 * Antes eran dos cuerpos separados por un filete y sesenta pixeles de aire:
 * a esa distancia el de abajo deja de leerse como parte del pie y pasa a
 * parecer otra seccion de la pagina, ademas de estirarlo sin necesidad.
 *
 * La navegacion se repite aca a proposito. Al final de una pagina larga la
 * barra quedo cinco pantallas arriba, y el pie es donde se busca "y ahora
 * que". Es tambien la unica navegacion visible sin JavaScript en mobile,
 * donde la barra depende del panel.
 *
 * Los canales externos abren en pestana nueva; las rutas del sitio no.
 */
export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // `usePathname` devuelve el path INTERNO, no el traducido: la comparacion
  // vale igual en los dos idiomas. Mismo criterio que el Header.
  if (pathname === "/landing-page") {
    return <LandingFooter />;
  }

  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-[1440px] px-4 py-14 lg:px-16 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:gap-12">
          <div>
            <Image
              src="/marca/isotipo.png"
              alt=""
              width={256}
              height={302}
              className="h-10 w-auto"
            />
            <p className="mt-5 max-w-[30ch] text-body-md leading-body text-ink-secondary">
              {t("tagline")}
            </p>
          </div>

          {/* El titulo de la columna es tambien el nombre del landmark: con
              aria-labelledby el dato vive una sola vez. */}
          <nav aria-labelledby="pl-footer-nav">
            <h2
              id="pl-footer-nav"
              className="font-display text-caption uppercase tracking-caps text-ink-muted"
            >
              {t("navLabel")}
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="pl-underline text-body-md leading-body text-ink-secondary transition-colors duration-200 ease-standard hover:text-ink"
                  >
                    {nav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-caption uppercase tracking-caps text-ink-muted">
              {t("contactLabel")}
            </h2>

            {/* Los tres canales como iconos, y debajo el handle y el mail en
                texto: el icono se aprieta rapido, el texto se lee y se copia.
                Son dos usos distintos del mismo dato. */}
            <SocialLinks className="mt-6" />

            <ul className="mt-6 flex flex-col gap-3">
              <li>
                <a
                  href={social.instagram.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pl-underline text-body-md leading-body text-ink-secondary transition-colors duration-200 ease-standard hover:text-ink"
                >
                  {social.instagram.label}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${social.email.address}`}
                  className="pl-underline text-body-md leading-body text-ink-secondary transition-colors duration-200 ease-standard hover:text-ink"
                >
                  {social.email.address}
                </a>
              </li>
            </ul>
          </div>

          {/* La autoria enlaza al estudio que hizo el sitio. Enlace externo,
              asi que abre en pestana nueva: el visitante estaba leyendo esta
              pagina, no viniendo a irse.

              Va como tarjeta y no como renglon de texto. Un enlace de firma
              tiene que parecer apretable antes de que nadie pase el puntero
              por encima, y en un pie hecho de lineas de texto lo unico que se
              distingue de un vistazo es una caja. El borde pasa a acento en
              hover, igual que el CTA de la barra.

              Es la cuarta columna y no un bloque suelto abajo: asi entra en
              la misma fila que el resto y el pie mide un cuerpo, no dos. */}
          <a
            href={author.href}
            target="_blank"
            rel="noopener noreferrer"
            className="pl-lift inline-flex h-fit w-fit items-center gap-4 rounded-lg border border-line bg-surface px-5 py-4 transition-colors duration-200 ease-standard hover:border-accent"
          >
            {/* alt vacio: el nombre va escrito al lado, y repetirlo le haria
                leer la marca dos veces al lector de pantalla. */}
            <Image
              src={author.logo}
              alt=""
              width={240}
              height={301}
              className="h-9 w-auto"
            />
            <span className="flex flex-col gap-1">
              <span className="text-caption uppercase tracking-caps text-ink-muted">
                {t("creditPrefix")}
              </span>
              <span className="text-body-sm font-bold leading-body text-ink">
                {author.name}
              </span>
            </span>
          </a>
        </div>

        {/* Una sola linea de letra chica, sin filete ni salto de bloque:
            legales a la izquierda, ciudad y derechos a la derecha. Es lo
            unico del pie que nadie viene a leer, asi que ocupa un renglon y
            no un cuerpo aparte.

            El relleno a la derecha le deja sitio al boton flotante de
            WhatsApp: es fijo al viewport, y al llegar al final de la pagina
            cae justo encima de este renglon y se come el final del aviso de
            derechos. Reservar el ancho es mas barato que empujar el pie
            hacia arriba con relleno inferior. */}
        <div className="mt-12 flex flex-col gap-4 pr-20 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pr-24">
          <nav aria-labelledby="pl-footer-legal">
            <h2 id="pl-footer-legal" className="sr-only">
              {t("legalLabel")}
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="pl-underline text-caption leading-body text-ink-secondary transition-colors duration-200 ease-standard hover:text-ink"
                  >
                    {nav(`legal.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {/* La ciudad, visible. Estaba solo en la metadata y en el schema,
                y para las busquedas locales lo que pesa es el texto que se
                ve. El pie es donde se la busca. */}
            <p className="text-caption leading-body text-ink-secondary">
              {t("location")}
            </p>
            <p className="text-caption leading-body text-ink-secondary">
              © {year} Parallel Studios. {t("rights")}
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
