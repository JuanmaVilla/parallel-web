#!/usr/bin/env node
/**
 * Lint de titulos — Parallel Studio
 *
 * Lastica es la tipografia de display de la marca y NO incluye glifos
 * acentuados: sin A/E/I/O/U con tilde, sin enie, sin signos de apertura.
 * Un acento dentro de un titulo cae en otra fuente a mitad de palabra y
 * se ve roto.
 *
 * Este script recorre messages/*.json y falla si algun valor que se
 * renderiza en Lastica contiene un caracter fuera de ASCII.
 *
 * Convencion: se consideran de Lastica las claves llamadas
 *   headline · heading · display · eyebrow · metric
 * y cualquier clave terminada en Headline / Heading / Display / Eyebrow.
 *
 * Uso: node scripts/lint-headlines.mjs
 * Doc: ../../MARCA.md §4
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MESSAGES_DIR = join(ROOT, "messages");

// Reparto de familias (MARCA.md §4, revisado):
//
//   Lastica       — rotulos cortos en versalitas y datos tecnicos (precios,
//                   numeros). Sin glifos acentuados: estos valores tienen
//                   que ser ASCII puro, y es lo que verifica este script.
//   Proxima Nova  — TODO el resto, titulares incluidos. Tiene latino
//                   extendido completo, asi que ahi los acentos son seguros.
//
// Por eso `headline` y `heading` ya NO se verifican: desde que los titulares
// se componen en Proxima Nova 700, "PRODUCCION" puede volver a escribirse
// "PRODUCCIÓN", que es como se escribe en castellano.
const EXACT_KEYS = new Set(["eyebrow", "metric", "price", "priceAlt", "label"]);
const SUFFIX = /(Eyebrow|Metric|Label)$/;

const isDisplayKey = (key) => EXACT_KEYS.has(key) || SUFFIX.test(key);

// Lastica cubre ASCII imprimible, mas NBSP y soft hyphen.
const ALLOWED = /^[\x20-\x7E ­]*$/;

function walk(node, path, violations) {
  if (typeof node === "string") {
    const key = path[path.length - 1];
    if (isDisplayKey(key) && !ALLOWED.test(node)) {
      const offenders = [...new Set([...node].filter((c) => !ALLOWED.test(c)))];
      violations.push({ path: path.join("."), value: node, offenders });
    }
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      walk(value, [...path, key], violations);
    }
  }
}

let failed = false;

for (const file of readdirSync(MESSAGES_DIR).filter((f) => f.endsWith(".json"))) {
  const locale = file.replace(/\.json$/, "");
  const violations = [];
  walk(JSON.parse(readFileSync(join(MESSAGES_DIR, file), "utf8")), [], violations);

  if (violations.length === 0) {
    console.log(`✓ ${locale}: titulos sin acentos`);
    continue;
  }

  failed = true;
  console.error(`\n✗ ${locale}: ${violations.length} titulo(s) con caracteres que Lastica no tiene\n`);
  for (const v of violations) {
    console.error(`  ${v.path}`);
    console.error(`    valor:    "${v.value}"`);
    console.error(`    conflicto: ${v.offenders.join(" ")}`);
    console.error(`    arreglo:   reformular sin acentos, o mover el texto a una clave que no sea de display.\n`);
  }
}

if (failed) {
  console.error("Regla: solo los rotulos y los datos tecnicos van en Lastica, que no tiene tildes,");
  console.error("enie ni signos de apertura. Los titulares van en Proxima Nova, donde los acentos SI se pueden.");
  console.error("Arreglo: reescribi el rotulo sin acentos, o movelo a una clave que no termine en Eyebrow/Label/Metric.\n");
  process.exit(1);
}
