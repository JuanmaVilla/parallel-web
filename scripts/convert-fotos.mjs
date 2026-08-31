/**
 * Convierte las fotos maestras en los webp que se sirven.
 *
 *   node scripts/convert-fotos.mjs
 *
 * Lee fotos/<set>/*.png y escribe public/<destino>/*.webp.
 *
 * Los masters salen todos en 3:4 (1152x1536) porque es lo que exporta el
 * generador. Cuando la tarjeta de destino tiene otra proporcion, sharp recorta
 * centrado con fit: cover — no deforma.
 *
 * POR QUE ESTAS MEDIDAS:
 * Se dimensiona por el ancho maximo que la pieza llega a ocupar en pantalla,
 * con margen para DPR 2. Pedir mas es peso que nadie ve.
 *
 *   hero-cards   La tarjeta mide 11rem (176px) y se acerca a la camara, pero
 *                el ramp de opacidad la apaga antes de que crezca del todo: a
 *                opacidad 1 la escala es 1.125 (~198px) y a 0.25 llega a 1.86
 *                (~327px). Con DPR 2, ~654px en el peor caso realista.
 *
 *   service-cards  La tarjeta mide clamp(13rem, 22vw, 20rem) — 320px como
 *                  techo — y el hover la escala 1.06: ~339px. Con DPR 2, 678px.
 *
 *   stack-chips  La ficha mide clamp(7rem, 12vw, 11rem) — 176px como techo.
 *                Con DPR 2, 352px. Estas son las unicas apaisadas: los masters
 *                ya vienen en 4:3, asi que tampoco hay recorte.
 *
 *   mastering    Media pantalla de la grilla de dos columnas: a 1440 de ancho
 *                la columna mide 608px. Con DPR 2, 1216px. El master recortado
 *                da 1272 de ancho, asi que 1200 entra sin inventar pixeles.
 *
 * POR QUE CALIDAD 75:
 * Son fotos de estudio con un foco calido dominante. A 75 no aparece banding
 * en los degradados de luz y el peso baja a la mitad frente a 90.
 */
import sharp from "sharp";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

/** Un set por seccion: de donde lee, donde escribe y a que tamano. */
const SETS = [
  { src: "fotos/hero", out: "public/hero-cards", width: 900, height: 1200 },
  { src: "fotos/servicios", out: "public/service-cards", width: 800, height: 1000 },
  { src: "fotos/stack", out: "public/stack-chips", width: 480, height: 360 },
  { src: "fotos/mastering", out: "public/mastering", width: 1200, height: 900 },
];

for (const set of SETS) {
  // Los masters no se versionan: pesan y solo hacen falta para reconvertir.
  // Un set sin carpeta se saltea en vez de tumbar la corrida entera.
  if (!existsSync(set.src)) {
    console.log(`\n${set.out}  — sin ${set.src}, salteado`);
    continue;
  }

  const files = readdirSync(set.src)
    .filter((f) => f.endsWith(".png"))
    .sort();

  console.log(`\n${set.out}  (${set.width}x${set.height})`);
  let total = 0;
  for (const file of files) {
    const name = file.replace(/\.png$/, "");
    const info = await sharp(path.join(set.src, file))
      .resize(set.width, set.height, { fit: "cover", position: "centre" })
      .webp({ quality: 75 })
      .toFile(path.join(set.out, `${name}.webp`));
    total += info.size;
    console.log(`  ${name}.webp  ${(info.size / 1024).toFixed(0)} kB`);
  }
  console.log(`  ${files.length} fotos · ${(total / 1024).toFixed(0)} kB`);
}
