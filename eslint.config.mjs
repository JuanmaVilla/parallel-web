import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Herramientas de verificacion visual: se ejecutan con `node tools/*.js`
    // fuera del bundle, en CommonJS y sin TypeScript. No son codigo de la app.
    "tools/**",
    // Salida de la auditoria SEO: informes, HTML crawleado y el script de
    // medicion. Es material de diagnostico, no codigo de la app.
    "parallel-studio-audit/**",
  ]),
]);

export default eslintConfig;
