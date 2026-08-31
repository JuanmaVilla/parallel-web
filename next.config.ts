import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Cabeceras de seguridad, para todas las rutas.
 *
 * NO hay Content-Security-Policy. Poner una util aca implica permitir los
 * scripts inline que inyecta Next y el CSS y las fuentes de use.typekit.net
 * y p.typekit.net; una CSP mal armada rompe la tipografia de todo el sitio
 * en silencio. Es un paso aparte, con su propia verificacion, no algo para
 * colar en un cierre.
 */
const securityHeaders = [
  // Impide que el browser adivine el tipo de un archivo por su contenido.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Manda el origen a otros sitios, la URL completa solo dentro del propio.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nadie necesita estas APIs aca. El sitio reproduce audio, no lo graba.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Contra clickjacking. frame-ancestors es la version moderna;
  // X-Frame-Options queda para los browsers que no la leen.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  // Fuerza HTTPS por un anio. Sin `includeSubDomains` ni `preload` a
  // proposito: todavia no hay dominio definido, y comprometer subdominios
  // que no existen —o entrar en la lista de preload, que se sale con
  // meses de tramite— es irreversible en la practica. Endurecer despues,
  // con el dominio ya en produccion.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  // Hay un package-lock.json huerfano en el home del usuario. Sin esto,
  // Turbopack infiere ese directorio como raiz del workspace.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    // Secuencias de scroll: AVIF primero, WebP de respaldo.
    formats: ["image/avif", "image/webp"],
  },
  // No anunciar el framework: es informacion que solo le sirve a quien
  // busca vulnerabilidades conocidas por version.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
