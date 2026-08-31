#!/usr/bin/env node
/**
 * Lint de colores hardcodeados — Parallel Studio
 *
 * Regla dura del sistema: ningun componente lleva un hex literal.
 * Todo color sale de un token (--pl-* o su utilidad Tailwind equivalente).
 * La unica fuente de verdad de color es app/tokens.css.
 *
 * Uso: node scripts/lint-hex.mjs
 * Doc: ../../MARCA.md §3
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = ["app", "components", "lib"];
// Unicos dos archivos donde los hex viven legitimamente:
// tokens.css es la fuente de verdad de CSS, y lib/brand.ts la de JS
// para contextos que no pueden leer una variable CSS (metadata, canvas).
const ALLOWLIST = new Set([
  join(ROOT, "app", "tokens.css"),
  join(ROOT, "lib", "brand.ts"),
]);
const EXTENSIONS = /\.(tsx?|jsx?|css)$/;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

function* files(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* files(full);
    } else if (EXTENSIONS.test(entry) && !ALLOWLIST.has(full)) {
      yield full;
    }
  }
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of files(join(ROOT, dir))) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const match of line.match(HEX) ?? []) {
        violations.push({
          file: relative(ROOT, file),
          line: i + 1,
          hex: match,
          text: line.trim(),
        });
      }
    });
  }
}

if (violations.length === 0) {
  console.log("✓ cero hex hardcodeados fuera de app/tokens.css");
  process.exit(0);
}

console.error(`\n✗ ${violations.length} color(es) hardcodeado(s)\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.hex}`);
  console.error(`    ${v.text}\n`);
}
console.error("Regla: todo color sale de un token. Ver app/tokens.css y el mapeo @theme en app/globals.css.\n");
process.exit(1);
