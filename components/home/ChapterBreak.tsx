import { useTranslations } from "next-intl";
import { Marquee } from "@/components/motion/Marquee";

type Mark = { label: string };

/**
 * Palabra gigante de separacion entre capitulos.
 *
 * Da respiro entre dos bloques densos y anuncia de que va el siguiente. Va en
 * contorno y sin relleno: es textura tipografica, no un titulo que haya que
 * leer entero — por eso tambien va aria-hidden, porque las palabras ya estan
 * dichas en las secciones que separa.
 *
 * `accent` pasa el contorno de neutral a naranja de marca. Sube el contraste
 * de la banda, y por eso es el unico elemento de marca de su pantalla.
 *
 * Componer en Lastica es correcto aca: son palabras sueltas en versalitas,
 * que es justo su reparto (MARCA.md §4). Y al ser ASCII puro, la falta de
 * glifos acentuados no las toca — lo verifica lint-headlines sobre la clave
 * `label`.
 *
 * Las dos bandas van en direcciones opuestas. Una sola desplaza la pagina
 * entera hacia un lado; dos encontradas dan profundidad y se anulan.

 */
export function ChapterBreak({
  reverse = false,
  accent = false,
}: {
  reverse?: boolean;
  accent?: boolean;
}) {
  const t = useTranslations("home.chapter");
  const marks = t.raw("marks") as Mark[];

  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y border-line bg-bg py-10 lg:py-14"
    >
      {/* 90 px/s, el doble del ritmo de una marquesina de texto gigante: a 45
          la palabra tardaba tanto en cruzar que no se leia entera. */}
      <Marquee speed={90} reverse={reverse}>
        {marks.map((mark) => (
          <span
            key={mark.label}
            className={`pl-giant pr-12 lg:pr-20 ${accent ? "pl-giant--accent" : ""}`}
          >
            {mark.label}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
