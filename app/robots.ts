import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * robots.txt
 *
 * Va en la raiz de `app/` y no dentro de `app/[locale]/`: el archivo es uno
 * solo para todo el dominio, no por idioma. El matcher del proxy
 * (`"/((?!api|_next|_vercel|.*\\..*).*)"`) excluye todo path con punto, asi
 * que /robots.txt lo esquiva solo y no hay que tocar proxy.ts.
 *
 * Los crawlers de IA van declarados uno por uno a proposito. Sin una regla
 * explicita cada uno aplica su propio default, que no es el mismo para
 * todos ni es estable en el tiempo. El estudio quiere aparecer en
 * respuestas de IA, asi que la decision se escribe en vez de heredarse.
 *
 * Si alguna vez hay que sacar al sitio de los datasets de entrenamiento,
 * este es el archivo: cambiar el `allow` de esos agentes por `disallow`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        // Buscadores con superficie de respuestas generativas, y crawlers de
        // los asistentes donde el estudio quiere ser citable.
        userAgent: [
          "Googlebot",
          "Google-Extended",
          "Bingbot",
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "PerplexityBot",
          "Applebot-Extended",
        ],
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
