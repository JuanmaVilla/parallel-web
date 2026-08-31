import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { neutral } from "@/lib/brand";

/**
 * Imagen de Open Graph — una por locale.
 *
 * Es lo que se ve cuando alguien pega el link en WhatsApp o Instagram, que
 * para este estudio es el canal de distribucion real. Sin este archivo el
 * link sale como texto pelado.
 *
 * Next enlaza sola la imagen en `og:image` y `twitter:image` de esta ruta y
 * las de abajo. Al estar el sitio prerenderizado, las dos imagenes se
 * generan en build y despues se sirven como archivos estaticos.
 *
 * Dos restricciones que condicionan el diseno:
 *
 *   - La fuente es Lastica-Regular.TTF, no el .woff2 que usa el sitio.
 *     Satori —el motor detras de ImageResponse— no lee woff2. Proxima Nova
 *     no se puede usar aca: viene de Typekit y no se self-hostea.
 *   - Por eso el texto va SIN acentos: Lastica no tiene tildes, enie ni
 *     signos de apertura. El rotulo vive en `meta.ogLabel`, nombrado con
 *     sufijo Label para que scripts/lint-headlines.mjs le exija ASCII solo.
 *
 * Los colores salen de lib/brand.ts y no como hex literal: scripts/
 * lint-hex.mjs escanea app/ y un hex aca rompe el build.
 *
 * Va el isologotipo OFICIAL completo —P + PARALLEL + STUDIOS—, que es lo
 * que MARCA.md §2 manda preferir. El nombre NO se compone en texto a mano:
 * §7 prohibe "recomponer el bloque de texto a mano" y "separar el isotipo
 * del texto y reordenar libremente". Se usa el archivo tal cual.
 *
 * `public/marca/isologotipo.png` es copia de `Logotipo/`, renombrada para
 * que el build no dependa de un nombre con espacios y comas. Vive en public/
 * porque el mismo archivo es el `logo` del schema, que necesita URL publica.
 *
 * Ojo con los otros dos: public/isologotipo-color.png y -negativo.png NO
 * son este bloqueo. Son el simbolo solo, en RGB sin canal alfa, asi que se
 * componen como una caja negra sobre el fondo. No usarlos aca.
 *
 * "PARALLEL" viene en blanco y "STUDIOS" en naranja: es la variante para
 * fondos oscuros, que es exactamente este fondo. El color de marca de la
 * pieza se lo lleva entero el bloqueo, asi que el rotulo va en neutro
 * (regla 80/15/5, MARCA.md §3).
 *
 * El bloqueo se muestra por debajo de su tamano nativo (1254x1254).
 * Escalar el PNG hacia arriba esta prohibido por §7: se pixela.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * `alt` es un export de modulo, asi que no puede variar por locale como si
 * lo hace la imagen. Va en castellano —el defaultLocale— y corto, para que
 * se entienda igual desde el ingles.
 */
export const alt = "Parallel Studios — mezcla y mastering";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  // process.cwd() es la raiz del proyecto. Los dos archivos se leen en build.
  const [lastica, isologotipo] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Lastica-Regular.ttf")),
    readFile(join(process.cwd(), "public/marca/isologotipo.png")),
  ]);

  const logoSrc = `data:image/png;base64,${isologotipo.toString("base64")}`;

  return new ImageResponse(
    (
      // Satori exige `display: flex` explicito en cualquier div con mas de
      // un hijo: no hereda el display por defecto del navegador.
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: neutral.bg,
          padding: 40,
          fontFamily: "Lastica",
        }}
      >
        {/* Cuadrado nativo de 1254 px, con su area de seguridad ya adentro.
            Se baja proporcionalmente y nunca se sube. */}
        <img src={logoSrc} alt="" width={470} height={470} />

        {/* En neutro: el color de marca de la pieza ya se lo lleva entero el
            degradado del signo. */}
        <div
          style={{
            fontSize: 34,
            letterSpacing: "0.24em",
            color: neutral.gray200,
          }}
        >
          {t("ogLabel")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Lastica",
          data: lastica,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
