import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renombro `middleware` a `proxy`. El runtime es nodejs y no
// es configurable: el runtime `edge` ya no esta soportado en este archivo.
export const proxy = createMiddleware(routing);

export const config = {
  // Todo menos rutas de API, internos de Next y archivos con extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
