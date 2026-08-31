import Image from "next/image";
import { useTranslations } from "next-intl";
import { AccentHeading } from "./MixCraft";
import { icons, type IconName } from "@/components/ui/icons";
import { RevealList } from "@/components/motion/RevealList";
import { Parallax } from "@/components/motion/Parallax";

type Point = { icon: IconName; body: string };

/**
 * Mastering en detalle: argumento a un lado, foto al otro.
 *
 * La foto es de cabina, subexpuesta y con la luz calida entrando de atras
 * (MARCA.md §5). El master vive en fotos/mastering/ y el webp que se sirve lo
 * genera scripts/convert-fotos.mjs; para cambiarla, se reemplaza el master y
 * se vuelve a correr el script.
 *
 * Un solo <Image> y no el <picture> con fuente AVIF que habia: aquello hacia
 * falta cuando el src era el poster crudo de una secuencia de scroll. Este
 * archivo pasa por el optimizador de Next, que ya sirve AVIF o WebP segun lo
 * que acepte el browser (formats en next.config.ts).
 */
export function MasteringDeep() {
  const t = useTranslations("services.masteringDeep");
  const points = t.raw("points") as Point[];

  return (
    <section className="border-t border-line bg-bg">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-24 lg:grid-cols-2 lg:items-center lg:gap-24 lg:px-16 lg:py-32">
        <div>
          <AccentHeading>{t("heading")}</AccentHeading>

          <p className="mt-6 max-w-[52ch] text-body-lg leading-body text-ink-body">
            {t("body")}
          </p>

          <RevealList className="mt-10 flex flex-col gap-5">
            {points.map((point) => {
              const Glyph = icons[point.icon];
              return (
                <li key={point.body} className="flex gap-4">
                  <Glyph className="mt-0.5 size-5 shrink-0 text-accent" />
                  <span className="max-w-[46ch] text-body-md leading-body text-ink-secondary">
                    {point.body}
                  </span>
                </li>
              );
            })}
          </RevealList>
        </div>

        <Parallax
          amount={48}
          className="aspect-[4/3] overflow-hidden rounded-lg border border-line"
        >
          <Image
            src="/mastering/booth.webp"
            alt={t("imageAlt")}
            width={1200}
            height={900}
            // La foto llega a media pantalla en escritorio y a la pantalla
            // entera cuando la grilla se apila.
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-full w-full object-cover"
          />
        </Parallax>
      </div>
    </section>
  );
}
